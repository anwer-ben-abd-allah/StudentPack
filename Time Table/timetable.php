<?php 
session_start();
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Student Pack · Emploi du Temps</title>
  <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="../index.css" />
</head>
<body>
  <script src="../navbar_auth.js"></script>

<!-- Particles -->
<div class="particles" id="particles"></div>

<?php
// including the navbar from the root folder
include '../navbar.php';
?>


  <!-- Shown by navbar_auth.js when logged in -->
  <button class="btn-logout" id="logoutBtn" style="display:none">
    ↩ Déconnexion
  </button>
</nav>

<!-- ═══════════════ APP CONTENT ═══════════════ -->
<div id="appContent">

  <!-- Hero -->
  <div class="hero">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>

    <div class="user-welcome" id="userWelcome">📅 Emploi du Temps</div>
    <h1 class="hero-title">
      Mon <span class="grad">Emploi</span><br/>du Temps
    </h1>
    <p class="hero-sub">Planifiez, organisez et maîtrisez votre semaine académique.</p>

    <div class="hero-stats">
      <div class="stat">
        <span class="stat-num" id="statSlots">0</span>
        <span class="stat-lbl">Cours planifiés</span>
      </div>
      <div class="stat">
        <span class="stat-num">12</span>
        <span class="stat-lbl">Matières</span>
      </div>
      <div class="stat">
        <span class="stat-num">5</span>
        <span class="stat-lbl">Jours</span>
      </div>
    </div>
  </div>

  <div class="app-body">

    <!-- Subject Cards -->
    <div class="sec-head">
      <h2 class="sec-title">Matières</h2>
      <span class="sec-pill">12 modules</span>
    </div>
    <div class="subjects-grid" id="subjectsGrid"></div>

    <!-- Add Form -->
    <div class="sec-head">
      <h2 class="sec-title">Ajouter un cours</h2>
    </div>
    <div class="add-section">
      <div class="form-grid">
        <form action="" id="formMatiere">
          <div class="fg">
            <label>Matière</label>
            <div class="sel-wrap">
              <select id="matiere">
                <option value="">Choisir une matière…</option>
              <option value="Algèbre">Algèbre</option>
              <option value="Analyse">Analyse</option>
              <option value="Applications Réparties">Applications Réparties</option>
              <option value="Architecture des Réseaux">Architecture des Réseaux</option>
              <option value="Comptabilité">Comptabilité</option>
              <option value="Conception des SI">Conception des SI</option>
              <option value="Droit">Droit</option>
              <option value="Java">Java</option>
              <option value="SGBD">SGBD</option>
              <option value="UNIX">UNIX</option>
              <option value="WEB">WEB</option>
              <option value="Anglais">Anglais</option>
            </select>
            <svg class="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="fg">
          <label>Jour</label>
          <div class="sel-wrap">
            <select id="jour">
              <option value="">Choisir…</option>
              <option>Lundi</option>
              <option>Mardi</option>
              <option>Mercredi</option>
              <option>Jeudi</option>
              <option>Vendredi</option>
            </select>
            <svg class="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="fg">
          <label>Heure</label>
          <input type="time" id="heure" />
        </div>
        <div class="fg btn-add-wrap">
          <label style="visibility:hidden">.</label>
          <button class="btn-add" onclick="bindForm()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter
          </button>
        </div>
        </form>
      </div>
    </div>

    <!-- Table -->
    <div class="sec-head">
      <h2 class="sec-title">Planning de la semaine</h2>
      <span class="sec-pill" id="slotCount">0 cours</span>
    </div>
    <div class="table-wrap">
      <table class="tt-table">
        <thead>
          <tr>
            <th>Jour</th>
            <th>Heure</th>
            <th>Matière</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="emploiDuTemps">
          <tr class="empty-row">
            <td colspan="4">
              <div class="empty-state">
                <div class="empty-icon">⏳</div>
                <p>Chargement de votre emploi du temps…</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<!-- navbar_auth.js runs first (shows username in nav on all pages) -->
<script src="../navbar_auth.js"></script>
<!-- table.js handles auth-gate + DB-backed timetable for this page -->
<script src="table.js"></script>
</body>
</html>