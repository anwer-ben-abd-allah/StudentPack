-- ============================================
-- Student Pack – Timetable Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS student_pack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_pack;

-- Subjects table (fixed list, pre-seeded)
CREATE TABLE IF NOT EXISTS subjects (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    color    VARCHAR(7) DEFAULT '#378ADD'
);

-- Timetable slots
CREATE TABLE IF NOT EXISTS timetable (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    day        ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi') NOT NULL,
    time_slot  TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_slot (day, time_slot)   -- one subject per time slot per day
);

-- ============================================
-- Seed subjects
-- ============================================
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