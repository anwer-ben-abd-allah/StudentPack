<!-- le navbar ici pour tous les fichiers -->

<?php
// prendre le nom du fichier pour la classe active
$current_file = basename($_SERVER['PHP_SELF']);
?>
<nav class="navbar">
  <a class="brand" href="#">
    <div class="brand-dot"></div>
    Student Pack
  </a>
  <ul class="nav-links">
        <li><a href="/index.php" <?php echo ($current_file == 'index.php') ? 'class="active"' : ''; ?>>🏠 Accueil</a></li>
    <li><a href="/Time Table/timetable.php" <?php echo ($current_file == 'timetable.php') ? 'class="active"' : ''; ?>>📅 Emploi du temps</a></li>
    <li><a href="/Tasks/tasks.php" <?php echo ($current_file == 'tasks.php') ? 'class="active"' : ''; ?>>✅ Tâches</a></li>
    <li><a href="/Upcoming Exams/exams.php" <?php echo ($current_file == 'exams.php') ? 'class="active"' : ''; ?>>📝 Examens</a></li>
    <li><a href="/Notes/note.php" <?php echo ($current_file == 'grades.php') ? 'class="active"' : ''; ?>>📓 Notes</a></li>
    <li><a href="/Emails/emails.php" <?php echo ($current_file == 'emails.php') ? 'class="active"' : ''; ?>>✉ Emails</a></li>
    <li><a href="/Pomodoro/pomodoro.php" <?php echo ($current_file == 'pomodoro.php') ? 'class="active"' : ''; ?>>⏱ Pomodoro</a></li>
    <li><a href="/dropout_risk_detector/dropout.php" <?php echo ($current_file == 'dropout.php') ? 'class="active"' : ''; ?>>🤖 Dropout Detector</a></li>
    <li><a href="/Authentification/authentification.php" <?php echo ($current_file == 'authentification.php') ? 'class="active"' : ''; ?> id="loginLink" class="navbar-right">🔑 S'identifier</a></li>
  </ul>
  <!-- Shown by navbar_auth.js when logged in -->
  <button class="btn-logout" id="logoutBtn" style="display:none">
    ↩ Déconnexion
  </button>
</nav>



