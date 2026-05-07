// ════════════════════════════════════════════════════════════════
//  table.js  —  Student Pack · Emploi du Temps
//
//  Auth flow:
//    1. On load  → GET authcheck.php  (is session alive?)
//       • Logged in  → show app, load slots from DB via slots_api.php
//       • Not logged → redirect to authentification.php
//
//  Timetable data is stored in MySQL via slots_api.php (persistent).
// ════════════════════════════════════════════════════════════════

/* ──────────────────────────────────────────
   SUBJECTS DATA
────────────────────────────────────────── */
const SUBJECTS = [
  { name: 'Analyse',                  desc: 'Calcul, algèbre, géométrie',         color: '#378ADD' },
  { name: 'Algèbre',                  desc: 'Matrices, espace vectoriel',          color: '#1D9E75' },
  { name: 'Applications Réparties',   desc: 'Micro-services, systèmes',            color: '#D85A30' },
  { name: 'Architecture des Réseaux', desc: 'Sécurité, supervision',               color: '#D4537E' },
  { name: 'Comptabilité',             desc: 'Bilan, journal',                      color: '#BA7517' },
  { name: 'Conception des SI',        desc: 'UML, diagrammes',                     color: '#7F77DD' },
  { name: 'Droit',                    desc: 'Contrats, législation',               color: '#888780' },
  { name: 'Java',                     desc: 'GUI, POO',                            color: '#E24B4A' },
  { name: 'SGBD',                     desc: 'SQL, PL/SQL, optimisation',           color: '#639922' },
  { name: 'UNIX',                     desc: 'Ubuntu, commandes',                   color: '#0F6E56' },
  { name: 'WEB',                      desc: 'HTML, CSS, JS, PHP',                  color: '#185FA5' },
  { name: 'Anglais',                  desc: 'Team work, leadership',               color: '#993C1D' },
];

const SUBJECT_COLOR = {};
SUBJECTS.forEach(s => { SUBJECT_COLOR[s.name] = s.color; });

/* ──────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────── */
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const DAY_CLASS = {
  Lundi:    'day-lundi',
  Mardi:    'day-mardi',
  Mercredi: 'day-mercredi',
  Jeudi:    'day-jeudi',
  Vendredi: 'day-vendredi',
};

const PARTICLE_COLORS = ['#6366f1','#f472b6','#34d399','#fb923c','#a78bfa','#38bdf8'];

// Resolve path to API — works whether timetable.php lives in root or a subfolder
const API_BASE = (function () {
  // Walk up from current page until we find the root (where slots_api.php lives)
  // Strategy: slots_api.php is always at the project root alongside config.php
  const path = window.location.pathname;
  // If we're in a subfolder like /Time Table/, go up one level
  const depth = (path.match(/\//g) || []).length - 1; // slashes minus the leading one
  if (depth <= 1) return './slots_api.php';            // already at root
  return '../slots_api.php';                           // one level deep
})();

const AUTH_CHECK = API_BASE.replace('slots_api.php', 'authcheck.php');
const LOGIN_PAGE = API_BASE.replace('slots_api.php', 'Authentification/authentification.php');

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let currentUser = null;
let slots       = [];      // kept in memory; source of truth is the DB

/* ──────────────────────────────────────────
   BOOT — check session, then load data
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  spawnParticles();
  await bootAuth();
});

async function bootAuth() {
  try {
    const res  = await fetch(AUTH_CHECK, { credentials: 'same-origin' });
    const data = await res.json();

    if (!data.loggedIn) {
      // Not logged in → redirect to login page
      window.location.href = LOGIN_PAGE;
      return;
    }

    currentUser = data.username;

    // Update logout button visibility
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.style.display = '';

    // Show welcome + init app
    showApp(data.full_name || data.username);

  } catch (err) {
    console.error('Auth check failed:', err);
    // If server unreachable, still show the page (dev/offline mode)
    showApp('Étudiant');
  }
}

/* ════════════════════════════════════════════
   PARTICLES
════════════════════════════════════════════ */
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 28; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 5 + 2;
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

    Object.assign(p.style, {
      width:      size + 'px',
      height:     size + 'px',
      background: color,
      boxShadow:  `0 0 ${size * 3}px ${color}`,
      left:       Math.random() * 100 + '%',
      '--dur':    (10 + Math.random() * 14) + 's',
      '--delay':  (Math.random() * 12) + 's',
    });

    container.appendChild(p);
  }
}

/* ════════════════════════════════════════════
   APP INITIALIZATION
════════════════════════════════════════════ */
async function showApp(displayName) {
  const welcome = document.getElementById('userWelcome');
  if (welcome) welcome.textContent = '👋 Bienvenue, ' + displayName;

  renderSubjectCards();
  await loadSlotsFromDB();
  renderTable();
}

/* ════════════════════════════════════════════
   SUBJECT CARDS
════════════════════════════════════════════ */
function renderSubjectCards() {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  SUBJECTS.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'sub-card';
    card.style.setProperty('--sc',      s.color);
    card.style.setProperty('--sc-glow', s.color + '2e');
    card.style.animationDelay = (i * 50) + 'ms';
    card.innerHTML = `<h3>${s.name}</h3><p>${s.desc}</p>`;
    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════════
   DB API HELPERS
════════════════════════════════════════════ */

/** Load all slots for the current user from the database */
async function loadSlotsFromDB() {
  try {
    const res  = await fetch(API_BASE, { credentials: 'same-origin' });
    const data = await res.json();

    if (data.success) {
      slots = data.slots.map(s => ({
        id:      parseInt(s.id),
        subject: s.subject,
        day:     s.day,
        time:    s.time,
        color:   s.color || SUBJECT_COLOR[s.subject] || '#6366f1',
      }));
    } else {
      console.error('loadSlotsFromDB error:', data.error);
      slots = [];
    }
  } catch (err) {
    console.error('loadSlotsFromDB fetch error:', err);
    slots = [];
  }
}

/** POST a new slot to the database */
async function createSlotInDB(subject, day, time) {
  const res  = await fetch(API_BASE, {
    method:      'POST',
    credentials: 'same-origin',
    headers:     { 'Content-Type': 'application/json' },
    body:        JSON.stringify({ subject, day, time }),
  });
  return await res.json();
}

/** DELETE a slot from the database */
async function deleteSlotFromDB(id) {
  const res = await fetch(API_BASE + '?id=' + id, {
    method:      'DELETE',
    credentials: 'same-origin',
  });
  return await res.json();
}

/* ════════════════════════════════════════════
   SLOT CRUD (called from UI)
════════════════════════════════════════════ */
async function addSlot() {
  const matiere = document.getElementById('matiere').value;
  const jour    = document.getElementById('jour').value;
  const heure   = document.getElementById('heure').value;

  if (!matiere || !jour || !heure) {
    showToast('Veuillez remplir tous les champs.', 'error');
    return;
  }

  // Optimistic duplicate check (client-side, fast feedback)
  if (slots.some(s => s.day === jour && s.time === heure)) {
    showToast('Un cours existe déjà à ce créneau !', 'error');
    return;
  }

  // Disable button while saving
  const btn = document.querySelector('.btn-add');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Ajout…'; }

  try {
    const data = await createSlotInDB(matiere, jour, heure);

    if (data.success) {
      const s = data.slot;
      slots.push({
        id:      parseInt(s.id),
        subject: s.subject,
        day:     s.day,
        time:    s.time,
        color:   s.color || SUBJECT_COLOR[s.subject] || '#6366f1',
      });
      renderTable();
      showToast('✅ Cours ajouté et sauvegardé !', 'success');

      document.getElementById('matiere').value = '';
      document.getElementById('jour').value    = '';
      document.getElementById('heure').value   = '';
    } else {
      showToast(data.error || 'Erreur lors de l\'ajout.', 'error');
    }
  } catch (err) {
    console.error('addSlot error:', err);
    showToast('❌ Impossible de contacter le serveur.', 'error');
  } finally {
    if (btn) {
      btn.disabled    = false;
      btn.innerHTML   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter`;
    }
  }
}

async function deleteSlot(id) {
  try {
    const data = await deleteSlotFromDB(id);

    if (data.success) {
      slots = slots.filter(s => s.id !== id);
      renderTable();
      showToast('Cours supprimé.', 'success');
    } else {
      showToast(data.error || 'Erreur lors de la suppression.', 'error');
    }
  } catch (err) {
    console.error('deleteSlot error:', err);
    showToast('❌ Impossible de contacter le serveur.', 'error');
  }
}

/* ════════════════════════════════════════════
   TABLE RENDERING
════════════════════════════════════════════ */
function renderTable() {
  const tbody = document.getElementById('emploiDuTemps');
  if (!tbody) return;

  tbody.innerHTML = '';

  const statSlots = document.getElementById('statSlots');
  const slotCount = document.getElementById('slotCount');
  if (statSlots) statSlots.textContent = slots.length;
  if (slotCount) slotCount.textContent = slots.length + ' cours';

  if (slots.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    tr.innerHTML = `
      <td colspan="4">
        <div class="empty-state">
          <div class="empty-icon">📅</div>
          <p>Aucun cours planifié pour l'instant.<br/>Ajoutez votre premier cours ci-dessus.</p>
        </div>
      </td>`;
    tbody.appendChild(tr);
    return;
  }

  const sorted = [...slots].sort((a, b) => {
    const di = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    return di !== 0 ? di : a.time.localeCompare(b.time);
  });

  sorted.forEach((slot, i) => {
    const c  = slot.color;
    const tr = document.createElement('tr');
    tr.className            = DAY_CLASS[slot.day] || '';
    tr.style.animationDelay = (i * 40) + 'ms';

    tr.innerHTML = `
      <td class="day-cell">${slot.day}</td>
      <td class="time-cell">${slot.time}</td>
      <td>
        <span class="subject-badge" style="
          background: ${c}18;
          color: ${c};
          border: 1px solid ${c}33;
        ">
          <span style="
            display:inline-block;
            width:6px; height:6px;
            border-radius:50%;
            background:${c};
            box-shadow:0 0 6px ${c};
            flex-shrink:0;
          "></span>
          ${slot.subject}
        </span>
      </td>
      <td>
        <button class="btn-del" onclick="deleteSlot(${slot.id})">
          ✕ Supprimer
        </button>
      </td>`;

    tbody.appendChild(tr);
  });
}

/* ════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className   = 'toast ' + type + ' show';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════ */
async function logout() {
  try {
    await fetch(API_BASE.replace('slots_api.php', 'logout.php'), { credentials: 'same-origin' });
  } catch { /* ignore */ }
  window.location.href = LOGIN_PAGE;
}