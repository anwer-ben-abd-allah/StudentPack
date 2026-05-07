<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Student Pack · Emploi du Temps</title>
  <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../Time Table/timetable.css" />
</head>
<body>

<!-- Particles -->
<div class="particles" id="particles"></div>

<!-- Navbar -->
<nav class="navbar">
  <a class="brand" href="#">
    <div class="brand-dot"></div>
    Student Pack
  </a>
  <ul class="nav-links">
    <li><a href="../index.html">🏠 Accueil</a></li>
    <li><a href="../Time Table/timetable.php">📅 Emploi du temps</a></li>
    <li><a href="../Tasks/tasks.html">✅ Tâches</a></li>
    <li><a href="../Exams/exams.html">📝 Examens</a></li>
    <li><a href="../Grades/grades.html">📓 Notes</a></li>
    <li><a href="../Pomodoro/pomodoro.html">⏱ Pomodoro</a></li>
    <li><a href="../dropout_risk_detector/dropout.html" >🤖 Dropout Detector</a></li>
    <li><a href="../Authentification/authentification.php" class="active">🔑 S'identifier</a></li>
  </ul>
  <button class="btn-logout" id="logoutBtn" style="display:none" onclick="logout()">
    ↩ Déconnexion
  </button>
</nav>
<!-- ═══════════════ LOGIN GATE ═══════════════ -->
<div id="loginGate">
  <div class="login-card">
    <div class="login-icon">🎓</div>
    <h2 class="login-title">Bienvenue !</h2>
    <p class="login-sub">Entrez vos identifiants pour accéder à votre emploi du temps personnalisé.</p>

    <div class="field-group">
      <label>Nom d'utilisateur</label>
      <input type="text" class="field-input" id="loginUser" placeholder="ex: jean.dupont" autocomplete="username" />
    </div>
    <div class="field-group">
      <label>Mot de passe</label>
      <input type="password" class="field-input" id="loginPass" placeholder="••••••••" autocomplete="current-password" />
    </div>

    <p class="login-error" id="loginError"></p>

    <button class="btn-login" id="loginBtn" onclick="doLogin()" >
      <span id="loginBtnText">Se connecter →</span>
      <span id="loginSpinner" style="display:none">⏳</span>
    </button>
  </div>
</div>
<script src="../Authentification/auth.js"></script>