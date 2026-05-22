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
    <li><a href="../index.html" id="homeLink">🏠 Accueil</a></li>
    <li><a href="../Time Table/timetable.php" id="timetableLink">📅 Emploi du temps</a></li>
    <li><a href="../Tasks/tasks.html" id="tasksLink">✅ Tâches</a></li>
    <li><a href="../Exams/exams.html" id="examsLink">📝 Examens</a></li>
    <li><a href="../Emails/emails.html" id="emailsLink">✉️ Emails</a></li>
    <li><a href="../Notes/notes.html" id="notesLink">📝 Notes</a></li>
    <li><a href="../Grades/grades.html" id="gradesLink">📓 Notes</a></li>
    <li><a href="../Pomodoro/pomodoro.html" id="pomodoroLink">⏱ Pomodoro</a></li>
    <li><a href="../dropout_risk_detector/dropout.html" id="dropoutLink">🤖 Dropout Detector</a></li>
    <li><a href="../Authentification/authentification.php" class="active">🔑 S'identifier</a></li>
  </ul>
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
    <p class="login-note">Pas encore de compte ? <a href="#" id="registerLink" onclick="showRegister(event)">Créer un nouveau compte</a></p>
  </div>
</div>
<div id="registerGate" style="display:none ">
  <div class="login-card" style="margin: auto;">
    <form action="" id="registerForm">
      <div class="login-icon">🆕</div>
      <h2 class="login-title">Créer un compte</h2>
      <p class="login-sub">Remplissez le formulaire pour créer un nouvel utilisateur.</p>

    <div class="field-group">
      <label>Nom d'utilisateur</label>
      <input type="text" class="field-input" id="registerUser" placeholder="ex: jean.dupont" autocomplete="username" />
    </div>
    <div class="field-group">
      <label>Mot de passe</label>
      <input type="password" class="field-input" id="registerPass" placeholder="••••••••" autocomplete="new-password" />
    </div>
    <div class="field-group">
      <label>Confirmer le mot de passe</label>
      <input type="password" class="field-input" id="registerPassConfirm" placeholder="••••••••" autocomplete="new-password" />
    </div>

    <p class="login-error" id="registerError"></p>

    <button class="btn-login" id="registerBtn" onclick="createAccount(event)">
      <span id="registerBtnText">Créer un compte</span>
    </button>
    <p class="login-note">Déjà inscrit ? <a href="#" onclick="showLogin(event)">Se connecter</a></p>
  </form>
  </div>
</div>
<!-- Toast -->
<div class="toast" id="toast"></div>
<script src="../Authentification/auth.js"></script>
</body>
</html>