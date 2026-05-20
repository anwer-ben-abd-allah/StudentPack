<?php
// ════════════════════════════════════════════
//  slots_api.php  —  Timetable Slots REST API
//
//  GET    /slots_api.php          → list all slots for logged-in user
//  POST   /slots_api.php          → create a slot
//  DELETE /slots_api.php?id=N     → delete a slot
//
//  All responses: JSON
//  Requires an active PHP session (user must be logged in).
// ════════════════════════════════════════════

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/config.php';

// ── Auth guard ───────────────────────────────
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Non authentifié.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// ════════════════════════════════════════════
//  GET — list slots for this user
// ════════════════════════════════════════════
if ($method === 'GET') {
    if($_GET['action'] == "subjects") {
        try {
            $pdo  = getDB();
            $stmt = $pdo->query('SELECT * FROM subjects');
            echo json_encode(['success' => true, 'subjects' => $stmt->fetchAll()]);
        } catch (PDOException $e) {
            error_log('slots_api GET subjects: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erreur base de données.']);
        }
        exit;
        
    }
    else{
        try {
        $pdo  = getDB();
        $stmt = $pdo->prepare(
            'SELECT t.id, s.name AS subject, s.color, t.day, t.time_slot AS time
             FROM timetable t
             JOIN subjects s ON s.id = t.subject_id
             WHERE t.user_id = ?
             ORDER BY FIELD(t.day,"Lundi","Mardi","Mercredi","Jeudi","Vendredi"), t.time_slot'
        );
        $stmt->execute([$userId]);
        echo json_encode(['success' => true, 'slots' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        error_log('slots_api GET: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur base de données.']);
    }
    exit;

    }
    
}

// ════════════════════════════════════════════
//  POST — create a slot
// ════════════════════════════════════════════
if ($method === 'POST') {
    if($_POST['action'] == "add_slot") {
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $subject = trim($body['subject_id'] ?? '');
    $day     = trim($body['day']     ?? '');
    $time    = trim($body['time']    ?? '');
    echo json_encode(['received' => $body]); // debug
    echo json_encode(['subject_id' => $subject, 'day' => $day, 'time' => $time]); // debug
    $validDays = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];

    if (!$subject || !$day || !$time) {

        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Champs manquants.']);
        exit;
    }
    if (!in_array($day, $validDays, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Jour invalide.']);
        exit;
    }
    // Validate HH:MM format
    if (!preg_match('/^\d{2}:\d{2}$/', $time)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Heure invalide.']);
        exit;
    }

    try {
        $pdo = getDB();

        // Resolve subject_id
        $sStmt = $pdo->prepare('SELECT id FROM subjects WHERE id = ? LIMIT 1');
        $sStmt->execute([$subject]);
        $subjectRow = $sStmt->fetch();

        if (!$subjectRow) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Matière inconnue.']);
            exit;
        }

        // Insert (UNIQUE KEY unique_slot will reject duplicates)
        $ins = $pdo->prepare(
            'INSERT INTO timetable (user_id, subject_id, day, time_slot)
             VALUES (?, ?, ?, ?)'
        );
        $ins->execute([$userId, $subjectRow['id'], $day, $time]);
        $newId = (int) $pdo->lastInsertId();

        // Return the newly created slot (with color for JS)
        $fetch = $pdo->prepare(
            'SELECT t.id, s.name AS subject, s.color, t.day, t.time_slot AS time
             FROM timetable t JOIN subjects s ON s.id = t.subject_id
             WHERE t.id = ?'
        );
        $fetch->execute([$newId]);
        echo json_encode(['success' => true, 'slot' => $fetch->fetch()]);

    } catch (PDOException $e) {
        // Duplicate entry
        if ($e->getCode() === '23000') {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Un cours existe déjà à ce créneau !']);
        } else {
            error_log('slots_api POST: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erreur base de données.']);
        }
    }
    exit;
        
    }
    else{
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $username = trim($body['username'] ?? '');
        $password = trim($body['password'] ?? '');

        if (!$username || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Champs manquants.']);
            exit;
        }

        try {
            $pdo = getDB();

            // Check if user exists
            $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Utilisateur existe déjà.']);
                exit;
            }

            // Insert
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $ins = $pdo->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
            $ins->execute([$username, $hashed]);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            error_log('slots_api POST register: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erreur base de données.']);
        }
        exit;
    }

    
}

// ════════════════════════════════════════════
//  DELETE — remove a slot
// ════════════════════════════════════════════
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID invalide.']);
        exit;
    }

    try {
        $pdo  = getDB();
        // Only delete if it belongs to this user (security)
        $stmt = $pdo->prepare('DELETE FROM timetable WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $userId]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Créneau introuvable.']);
        } else {
            echo json_encode(['success' => true]);
        }
    } catch (PDOException $e) {
        error_log('slots_api DELETE: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur base de données.']);
    }
    exit;
}

// ── Method not allowed ───────────────────────
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);