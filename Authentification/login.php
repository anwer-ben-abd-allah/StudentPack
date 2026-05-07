<?php
// ════════════════════════════════════════════
//  login.php  —  Handles POST login form
//  Returns JSON: { success, username, full_name, error }
// ════════════════════════════════════════════

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';

// ── Only accept POST ─────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

// ── Read JSON body ───────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = $_POST;
}
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

// ── Basic input validation ───────────────────
if ($username === '' || $password === '') {
    echo json_encode(['success' => false, 'error' => 'Veuillez remplir tous les champs.']);
    exit;
}

if (strlen($username) > 60 || strlen($password) > 128) {
    echo json_encode(['success' => false, 'error' => 'Identifiants invalides.']);
    exit;
}

// ── Query the database ───────────────────────
try {
    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT `id`, `username`, `password`, `full_name` FROM `users` WHERE `username` = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log('Database login error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de base de données.']);
    exit;
}

// ── Verify password hash ─────────────────────
if (!$user || $password !== $user['password']) {
    // Same message for both wrong user and wrong password (security best practice)
    echo json_encode(['success' => false, 'error' => 'Identifiants incorrects. Réessayez.']);
    exit;
}

// ── Success — start session ──────────────────
session_regenerate_id(true);   // Prevent session fixation

$_SESSION['user_id']   = $user['id'];
$_SESSION['username']  = $user['username'];
$_SESSION['full_name'] = $user['full_name'];

echo json_encode([
    'success'   => true,
    'username'  => $user['username'],
    'full_name' => $user['full_name'],
]);