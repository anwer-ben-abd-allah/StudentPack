<?php
// ════════════════════════════════════════════
//  tasks_api.php  —  JSON backend for Tasks
// ════════════════════════════════════════════

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../Authentification/config.php';

$isLoggedIn = !empty($_SESSION['user_id']);
$userId = $isLoggedIn ? (int) $_SESSION['user_id'] : null;
$demoMode = !$isLoggedIn; // allow demo usage when not authenticated

$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload)) {
    $payload = $_POST;
}

// Session-backed demo storage when not logged in
if ($demoMode) {
    if (!isset($_SESSION['tasks_demo']) || !is_array($_SESSION['tasks_demo'])) {
        $_SESSION['tasks_demo'] = [];
        $_SESSION['tasks_demo_next_id'] = 1;
    }
}

function respond(array $data = [], int $status = 200): void {
    http_response_code($status);
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}

function fail(string $message, int $status = 400): void {
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function normalizeText(string $value): string {
    return trim($value);
}

function validateDate(?string $value): ?string {
    if ($value === null || $value === '') {
        return null;
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        fail('Format de date invalide.');
    }
    return $value;
}

function validateTime(?string $value): ?string {
    if ($value === null || $value === '') {
        return null;
    }
    if (!preg_match('/^\d{2}:\d{2}$/', $value)) {
        fail('Format d’heure invalide.');
    }
    return $value;
}

$validPriorities = ['Haute', 'Moyenne', 'Basse'];

try {
    // If demo mode, operate on session-backed tasks without touching DB
    if ($demoMode) {
        $list = &$_SESSION['tasks_demo'];

        switch ($action) {
            case 'list':
                respond(['tasks' => array_values($list)]);
                break;

            case 'create':
                if ($method !== 'POST') fail('Méthode non autorisée pour la création.', 405);
                $title = normalizeText($payload['title'] ?? '');
                if ($title === '') fail('Le titre de la tâche est requis.');
                $id = $_SESSION['tasks_demo_next_id']++;
                $task = [
                    'id' => $id,
                    'title' => $title,
                    'description' => normalizeText($payload['description'] ?? ''),
                    'priority' => in_array($payload['priority'] ?? 'Moyenne', $validPriorities, true) ? $payload['priority'] : 'Moyenne',
                    'due_date' => validateDate($payload['due_date'] ?? null),
                    'due_time' => validateTime($payload['due_time'] ?? null),
                    'is_done' => 0,
                    'created_at' => date('c'),
                    'updated_at' => null,
                ];
                $list[$id] = $task;
                respond(['task_id' => $id]);
                break;

            case 'update':
                if (!in_array($method, ['POST', 'PUT'], true)) fail('Méthode non autorisée pour la mise à jour.', 405);
                $id = isset($payload['id']) ? (int)$payload['id'] : 0;
                if ($id <= 0 || !isset($list[$id])) fail('Tâche introuvable.');
                if (array_key_exists('title', $payload)) {
                    $title = normalizeText($payload['title']);
                    if ($title === '') fail('Le titre de la tâche ne peut pas être vide.');
                    $list[$id]['title'] = $title;
                }
                if (array_key_exists('description', $payload)) $list[$id]['description'] = normalizeText($payload['description']);
                // category field removed — ignore if present
                if (array_key_exists('priority', $payload)) $list[$id]['priority'] = in_array($payload['priority'], $validPriorities, true) ? $payload['priority'] : 'Moyenne';
                if (array_key_exists('due_date', $payload)) $list[$id]['due_date'] = validateDate($payload['due_date'] ?? null);
                if (array_key_exists('due_time', $payload)) $list[$id]['due_time'] = validateTime($payload['due_time'] ?? null);
                if (array_key_exists('is_done', $payload)) $list[$id]['is_done'] = $payload['is_done'] ? 1 : 0;
                $list[$id]['updated_at'] = date('c');
                respond(['updated' => true]);
                break;

            case 'delete':
                if (!in_array($method, ['POST', 'DELETE'], true)) fail('Méthode non autorisée pour la suppression.', 405);
                $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
                if ($id <= 0 && isset($payload['id'])) $id = (int)$payload['id'];
                if ($id <= 0 || !isset($list[$id])) fail('Tâche introuvable ou impossibilité de la supprimer.');
                unset($list[$id]);
                respond(['deleted' => true]);
                break;

            default:
                fail('Action inconnue.', 404);
        }
    }

    // Logged-in flow: use database
    $pdo = getDB();
    switch ($action) {
        case 'list':
            $stmt = $pdo->prepare(
                'SELECT id, title, description, priority, due_date, due_time, is_done, created_at, updated_at
                 FROM tasks
                 WHERE user_id = ?
                 ORDER BY is_done ASC, due_date IS NULL ASC, due_date ASC, due_time ASC,
                          FIELD(priority, ?, ?, ?)' 
            );
            $stmt->execute([$userId, ...$validPriorities]);
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            respond(['tasks' => $tasks]);
            break;

        case 'create':
            if ($method !== 'POST') fail('Méthode non autorisée pour la création.', 405);
            $title = normalizeText($payload['title'] ?? '');
            $description = normalizeText($payload['description'] ?? '');
            $priority = normalizeText($payload['priority'] ?? 'Moyenne');
            $due_date = validateDate($payload['due_date'] ?? null);
            $due_time = validateTime($payload['due_time'] ?? null);
            if ($title === '') fail('Le titre de la tâche est requis.');
            if (!in_array($priority, $validPriorities, true)) $priority = 'Moyenne';
            $stmt = $pdo->prepare(
                'INSERT INTO tasks (user_id, title, description, priority, due_date, due_time)
                 VALUES (?, ?, ?, ?, ?, ?)' 
            );
            $stmt->execute([$userId, $title, $description, $priority, $due_date, $due_time]);
            respond(['task_id' => (int)$pdo->lastInsertId()]);
            break;

        case 'update':
            if (!in_array($method, ['POST', 'PUT'], true)) fail('Méthode non autorisée pour la mise à jour.', 405);
            $id = isset($payload['id']) ? (int)$payload['id'] : 0;
            if ($id <= 0) fail('Identifiant de tâche invalide.');
            $stmt = $pdo->prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?');
            $stmt->execute([$id, $userId]);
            if (!$stmt->fetch()) fail('Tâche introuvable.');
            $fields = [];
            $values = [];
            if (array_key_exists('title', $payload)) {
                $title = normalizeText($payload['title']);
                if ($title === '') fail('Le titre de la tâche ne peut pas être vide.');
                $fields[] = 'title = ?'; $values[] = $title;
            }
            if (array_key_exists('description', $payload)) { $fields[] = 'description = ?'; $values[] = normalizeText($payload['description']); }
            // category field removed — ignore if present
            if (array_key_exists('priority', $payload)) { $fields[] = 'priority = ?'; $values[] = in_array($payload['priority'], $validPriorities, true) ? $payload['priority'] : 'Moyenne'; }
            if (array_key_exists('due_date', $payload)) { $fields[] = 'due_date = ?'; $values[] = validateDate($payload['due_date'] ?? null); }
            if (array_key_exists('due_time', $payload)) { $fields[] = 'due_time = ?'; $values[] = validateTime($payload['due_time'] ?? null); }
            if (array_key_exists('is_done', $payload)) { $fields[] = 'is_done = ?'; $values[] = $payload['is_done'] ? 1 : 0; }
            if (count($fields) === 0) fail('Aucune donnée à mettre à jour.');
            $values[] = $id; $values[] = $userId;
            $sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
            $stmt = $pdo->prepare($sql); $stmt->execute($values);
            respond(['updated' => true]);
            break;

        case 'delete':
            if (!in_array($method, ['POST', 'DELETE'], true)) fail('Méthode non autorisée pour la suppression.', 405);
            $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($id <= 0) { if (isset($payload['id'])) $id = (int)$payload['id']; }
            if ($id <= 0) fail('Identifiant de tâche invalide.');
            $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?'); $stmt->execute([$id, $userId]);
            if ($stmt->rowCount() === 0) fail('Tâche introuvable ou impossibilité de la supprimer.');
            respond(['deleted' => true]);
            break;

        default:
            fail('Action inconnue.', 404);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de base de données.']);
    exit;
}
