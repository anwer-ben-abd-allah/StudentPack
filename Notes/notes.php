<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'student_pack');
define('DB_USER', 'root');
define('DB_PASS', '');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    return $pdo;
}

db()->exec("CREATE TABLE IF NOT EXISTS notes (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject    VARCHAR(100) NOT NULL DEFAULT '',
    title      VARCHAR(255) NOT NULL DEFAULT '',
    body       TEXT         NOT NULL,
    note_date  DATE         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $action = trim($_POST['action'] ?? '');

    if ($action === 'save') {
        $id      = (int)  ($_POST['id']       ?? 0);
        $subject = trim(  $_POST['subject']   ?? '');
        $title   = trim(  $_POST['title']     ?? '');
        $body    =        $_POST['body']      ?? '';
        $date    = trim(  $_POST['note_date'] ?? '');

        if ($title === '') {
            respond(['ok' => false, 'error' => 'Title is required.'], 422);
        }

        if (!$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $date = date('Y-m-d');
        }

        try {
            if ($id > 0) {
                $stmt = db()->prepare("UPDATE notes SET subject = :subject, title = :title, body = :body, note_date = :date WHERE id = :id");
                $stmt->execute([':subject' => $subject, ':title' => $title, ':body' => $body, ':date' => $date, ':id' => $id]);
                respond(['ok' => true, 'id' => $id]);
            } else {
                $stmt = db()->prepare("INSERT INTO notes (subject, title, body, note_date) VALUES (:subject, :title, :body, :date)");
                $stmt->execute([':subject' => $subject, ':title' => $title, ':body' => $body, ':date' => $date]);
                respond(['ok' => true, 'id' => (int) db()->lastInsertId()]);
            }
        } catch (PDOException $e) {
            respond(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        if ($id <= 0) {
            respond(['ok' => false, 'error' => 'Invalid ID.'], 400);
        }
        try {
            $stmt = db()->prepare("DELETE FROM notes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            respond(['ok' => true]);
        } catch (PDOException $e) {
            respond(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    respond(['ok' => false, 'error' => 'Unknown action.'], 400);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $rows = db()->query("SELECT id, subject, title, body, note_date FROM notes ORDER BY note_date DESC, id DESC")->fetchAll();
        respond($rows);
    } catch (PDOException $e) {
        respond(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

respond(['ok' => false, 'error' => 'Method not allowed.'], 405);