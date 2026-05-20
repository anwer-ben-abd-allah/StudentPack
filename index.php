<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Pack</title>
    <!-- Latest compiled and minified CSS -->
    <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">

    <link rel="stylesheet" href="index.css">
</head>
<body>
  
<?php
// including the navbar 
include 'navbar.php';
?>

<div class="student-content">
    
    <!-- Photo de l'université (libre de droits Unsplash) -->
    <div class="uni-photo">
        <img src="logo-transparent.png" 
             alt="Campus universitaire - bâtiment historique et étudiants"
             class="img-responsive"
    </div>

    <!-- Titre des fonctionnalités -->
    <h2 class="features-title">📦 Tous vos outils, réunis dans StudentPack</h2>
    
    <!-- Grille simple (flexbox) avec chaque fonctionnalité expliquée en 2-3 phrases max -->
    <div class="features-grid">
        
        <!-- 1. Emploi du temps -->
        <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Emploi du temps</h3>
            <p>Visualisez vos cours, TD et examens sur un planning hebdomadaire clair. Importez votre EDT universitaire et recevez des notifications 15 minutes avant chaque séance.</p>
        </div>
        
        <!-- 2. Tâches -->
        <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3>Tâches</h3>
            <p>Listez vos devoirs, projets et révisions avec échéances. Priorisez, cochez le terminé et ne laissez plus rien vous échapper.</p>
        </div>
        
        <!-- 3. Examens -->
        <div class="feature-card">
            <div class="feature-icon">📝</div>
            <h3>Examens</h3>
            <p>Centralisez le calendrier de vos partiels, dates de rendus et coefficients. Préparez des rappels personnalisés pour chaque épreuve.</p>
        </div>
        
        <!-- 4. Notes -->
        <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Notes</h3>
            <p>Suivez vos moyennes par matière, visualisez votre progression et vos points forts. Calculez automatiquement les notes nécessaires pour valider chaque UE.</p>
        </div>
        
        <!-- 5. Emails -->
        <div class="feature-card">
            <div class="feature-icon">✉️</div>
            <h3>Emails</h3>
            <p>Consultez les messages des enseignants et de l'administration depuis l'espace StudentPack. Répondez rapidement sans quitter votre tableau de bord.</p>
        </div>
        
        <!-- 6. Pomodoro -->
        <div class="feature-card">
            <div class="feature-icon">🍅</div>
            <h3>Pomodoro</h3>
            <p>Activez le minuteur Pomodoro (25 min de travail / 5 min de pause). Boostez votre concentration et suivez vos sessions d’étude quotidiennes.</p>
        </div>
        
        <!-- 7. Dropout Detector (détecteur de décrochage) -->
        <div class="feature-card">
            <div class="feature-icon">⚠️</div>
            <h3>Dropout Detector</h3>
            <p>Analyse votre assiduité, vos notes et votre connexion pour détecter un risque de décrochage. Envoie des alertes discrètes et propose des ressources d’accompagnement.</p>
        </div>
    </div>
</div>



<!-- jQuery + Bootstrap JS -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

<!-- Global auth script: shows username in navbar on every page -->
<script src="navbar_auth.js"></script>
</body>
</html>