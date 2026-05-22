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
    <li><a href="/StudentPack/index.php" <?php echo ($current_file == 'index.php') ? 'class="active"' : ''; ?>>🏠 Accueil</a></li>
    <li><a href="/StudentPack/Time Table/timetable.php" <?php echo ($current_file == 'timetable.php') ? 'class="active"' : ''; ?>>📅 Emploi du temps</a></li>
    <li><a href="/StudentPack/Tasks/tasks.php" <?php echo ($current_file == 'tasks.php') ? 'class="active"' : ''; ?>>✅ Tâches</a></li>
    <li><a href="/StudentPack/Upcoming Exams/exams.php" <?php echo ($current_file == 'exams.php') ? 'class="active"' : ''; ?>>📝 Examens</a></li>
    <li><a href="/StudentPack/Notes/note.php" <?php echo ($current_file == 'note.php') ? 'class="active"' : ''; ?>>📓 Notes</a></li>
    <li><a href="/StudentPack/Pomodoro/pomodoro.php" <?php echo ($current_file == 'pomodoro.php') ? 'class="active"' : ''; ?>>⏱ Pomodoro</a></li>
    <li><a href="/StudentPack/dropout_risk_detector/dropout.php" <?php echo ($current_file == 'dropout.php') ? 'class="active"' : ''; ?>>🤖 Dropout Detector</a></li>
    <li><a href="/StudentPack/Authentification/authentification.php" <?php echo ($current_file == 'authentification.php') ? 'class="active"' : ''; ?> id="loginLink" class="navbar-right">🔑 S'identifier</a></li>
  </ul>

  <!-- Changed: button to anchor tag pointing to logout.php -->
  <a href="/StudentPack/Authentification/logout.php" class="btn-logout" id="logoutBtn">↩ Déconnexion</a>
</nav>