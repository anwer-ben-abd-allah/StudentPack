<?php
// ════════════════════════════════════════════
//  auth_check.php  —  Returns current session status
//  Called by timetable.js on DOMContentLoaded.
//  Returns JSON: { loggedIn, username, full_name }
// ════════════════════════════════════════════

session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if (!empty($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn'  => true,
        'username'  => $_SESSION['username'],
        'full_name' => $_SESSION['full_name'],
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}