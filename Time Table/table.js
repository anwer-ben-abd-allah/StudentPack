// ════════════════════════════════════════════════════════════════
//  timetable.js  —  Student Pack · Emploi du Temps
//
//  Auth flow:
//    1. On load  → GET auth_check.php  (is session alive?)
//    2. On login → POST login.php      (server validates against DB)
//    3. On logout→ GET logout.php      (server destroys session)
//
//  Timetable data is stored in localStorage (per-user key).
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

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let currentUser = null;   // set after successful login
let slots       = [];
let nextId      = 1;

/* ──────────────────────────────────────────
   BOOT — check existing PHP session first
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  spawnParticles();
  bindEnterKey();

  try {
    const res  = await fetch('auth_check.php', { credentials: 'same-origin' });
    const data = await res.json();

    if (data.loggedIn) {
      // Session already active — go straight to app
      currentUser = data.username;
      showApp(data.full_name || data.username);
    } else {
      showGate();
    }
  } catch {
    // auth_check.php unreachable (e.g. opening as a plain file)
    // Fall back to showing the gate; login will also fail gracefully.
    showGate();
  }
});

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
   GATE / APP VISIBILITY
════════════════════════════════════════════ */
function showGate() {
  document.getElementById('loginGate').style.display  = '';
  document.getElementById('appContent').style.display = 'none';
  document.getElementById('appContent').classList.remove('visible');
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'none';
}

function showApp(displayName) {
  document.getElementById('loginGate').style.display  = 'none';
  document.getElementById('appContent').style.display = '';
  // Trigger animation on next frame
  requestAnimationFrame(() => {
    document.getElementById('appContent').classList.add('visible');
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'flex';

  const welcome = document.getElementById('userWelcome');
  if (welcome) welcome.textContent = '👋 Bienvenue, ' + displayName;

  loadUserSlots();
  renderSubjectCards();
  renderTable();
}

/* ════════════════════════════════════════════
   LOGIN  (POST → login.php → DB check)
════════════════════════════════════════════ */
async function doLogin() {
  const userEl   = document.getElementById('loginUser');
  const passEl   = document.getElementById('loginPass');
  const errEl    = document.getElementById('loginError');
  const btnText  = document.getElementById('loginBtnText');
  const spinner  = document.getElementById('loginSpinner');
  const loginBtn = document.getElementById('loginBtn');

  const username = userEl.value.trim();
  const password = passEl.value;

  // Client-side blank check
  if (!username || !password) {
    showLoginError('⚠️ Veuillez remplir tous les champs.');
    return;
  }

  // Show loading state
  loginBtn.disabled    = true;
  btnText.style.display  = 'none';
  spinner.style.display  = 'inline';
  errEl.classList.remove('show');

  try {
    const res  = await fetch('login.php', {
      method:      'POST',
      credentials: 'same-origin',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      currentUser = data.username;
      passEl.value = '';
      showApp(data.full_name || data.username);
    } else {
      showLoginError(data.error || 'Identifiants incorrects.');
      passEl.value = '';
      flashField(passEl);
    }
  } catch {
    showLoginError('❌ Impossible de contacter le serveur.');
  } finally {
    loginBtn.disabled   = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function flashField(el) {
  el.style.borderColor = '#f87171';
  el.style.boxShadow   = '0 0 0 3px rgba(248,113,113,.2)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 1500);
}

function bindEnterKey() {
  ['loginUser', 'loginPass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
}

/* ════════════════════════════════════════════
   LOGOUT  (GET → logout.php → session destroy)
════════════════════════════════════════════ */
async function logout() {
  try {
    await fetch('logout.php', { credentials: 'same-origin' });
  } catch { /* ignore network errors on logout */ }

  currentUser = null;
  slots       = [];
  nextId      = 1;
  showGate();

  // Clear form fields
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
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
   SLOT STORAGE  (localStorage, per-user key)
════════════════════════════════════════════ */
function storageKey() {
  return 'tt_slots_' + (currentUser || 'guest');
}

function loadUserSlots() {
  slots  = JSON.parse(localStorage.getItem(storageKey()) || '[]');
  nextId = slots.length ? Math.max(...slots.map(s => s.id)) + 1 : 1;
}

function saveSlots() {
  localStorage.setItem(storageKey(), JSON.stringify(slots));
}

/* ════════════════════════════════════════════
   SLOT CRUD
════════════════════════════════════════════ */
function addSlot() {
  const matiere = document.getElementById('matiere').value;
  const jour    = document.getElementById('jour').value;
  const heure   = document.getElementById('heure').value;

  if (!matiere || !jour || !heure) {
    showToast('Veuillez remplir tous les champs.', 'error');
    return;
  }

  // Duplicate slot guard
  if (slots.some(s => s.day === jour && s.time === heure)) {
    showToast('Un cours existe déjà à ce créneau !', 'error');
    return;
  }

  slots.push({
    id:      nextId++,
    subject: matiere,
    day:     jour,
    time:    heure,
    color:   SUBJECT_COLOR[matiere] || '#6366f1',
  });

  saveSlots();
  renderTable();
  showToast('✅ Cours ajouté avec succès !', 'success');

  document.getElementById('matiere').value = '';
  document.getElementById('jour').value    = '';
  document.getElementById('heure').value   = '';
}

function deleteSlot(id) {
  slots = slots.filter(s => s.id !== id);
  saveSlots();
  renderTable();
  showToast('Cours supprimé.', 'success');
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