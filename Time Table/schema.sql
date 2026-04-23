-- ════════════════════════════════════════════
--  Student Pack — Full Database Schema
--  Run this once to set up all tables.
-- ════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS student_pack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_pack;

-- ── Users ────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(60)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,          -- bcrypt hash
    full_name  VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Subjects ─────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color       VARCHAR(7) DEFAULT '#378ADD'
);

-- ── Timetable slots ──────────────────────────
CREATE TABLE IF NOT EXISTS timetable (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT  NOT NULL,
    subject_id INT  NOT NULL,
    day        ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
    time_slot  TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (user_id, day, time_slot)
);

-- ════════════════════════════════════════════
--  Seed subjects
-- ════════════════════════════════════════════
INSERT IGNORE INTO subjects (name, description, color) VALUES
    ('Analyse',                  'Calcul, algèbre, géométrie',        '#378ADD'),
    ('Algèbre',                  'Matrices, espace vectoriel',         '#1D9E75'),
    ('Applications Réparties',   'Micro-services, systèmes',           '#D85A30'),
    ('Architecture des Réseaux', 'Sécurité, supervision',              '#D4537E'),
    ('Comptabilité',             'Bilan, journal',                     '#BA7517'),
    ('Conception des SI',        'UML, diagrammes',                    '#7F77DD'),
    ('Droit',                    'Contrats, législation',              '#888780'),
    ('Java',                     'GUI, POO',                           '#E24B4A'),
    ('SGBD',                     'SQL, PL/SQL, optimisation',          '#639922'),
    ('UNIX',                     'Ubuntu, commandes',                  '#0F6E56'),
    ('WEB',                      'HTML, CSS, JS, PHP',                 '#185FA5'),
    ('Anglais',                  'Team work, leadership',              '#993C1D');

-- ════════════════════════════════════════════
--  Demo users  (passwords are bcrypt hashes)
--  etudiant / 1234
--  admin    / admin
-- ════════════════════════════════════════════
INSERT IGNORE INTO users (username, password, full_name) VALUES
    ('etudiant', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Étudiant Demo'),
    ('admin',    '$2y$12$vIABl7UMEnMTM7e5YmHqBuLnGwGMHDHoFQJLnGwGMHDHoFQJL1234a', 'Administrateur');
-- NOTE: generate real hashes with: php -r "echo password_hash('yourpassword', PASSWORD_BCRYPT);"