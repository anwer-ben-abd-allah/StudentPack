// ════════════════════════════════════════════════════════════════
//  auth.js  —  Student Pack · Authentication
//
//  Auth flow:
//    1. On load  → GET auth_check.php  (is session alive?)
//    2. On login → POST login.php      (server validates against DB)
//    3. On logout→ GET logout.php      (server destroys session)
// ════════════════════════════════════════════════════════════════
/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let currentUser = null;   // set after successful login
const API_URL = '../Authentification/slots_api.php'; 
/* ──────────────────────────────────────────
   BOOT — check existing PHP session first
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  bindEnterKey();
  const homeLink = document.getElementById('homeLink');
  const timetableLink = document.getElementById('timetableLink');
  const gradesLink = document.getElementById('gradesLink');
  const pomodoroLink = document.getElementById('pomodoroLink');
  const dropoutLink = document.getElementById('dropoutLink');
  const emailsLink = document.getElementById('emailsLink');
  const notesLink = document.getElementById('notesLink');
  const tasksLink = document.getElementById('tasksLink');
  const examsLink = document.getElementById('examsLink');
  homeLink.style.display = 'none';
  timetableLink.style.display = 'none';
  gradesLink.style.display = 'none';
  pomodoroLink.style.display = 'none';
  dropoutLink.style.display = 'none';
  emailsLink.style.display = 'none';
  notesLink.style.display = 'none';
  tasksLink.style.display = 'none';
  examsLink.style.display = 'none';
  try {
    const res  = await fetch('authcheck.php', { credentials: 'same-origin' });
    const data = await res.json();
    showGate();
  } catch {
    // auth_check.php unreachable (e.g. opening as a plain file)
    // Fall back to showing the gate; login will also fail gracefully.
    showGate();
  }
});

/* ════════════════════════════════════════════
   GATE VISIBILITY
════════════════════════════════════════════ */
function showGate() {
  const loginGate = document.getElementById('loginGate');
  if (loginGate) loginGate.style.display = '';
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
      window.location.href = '../index.php';
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
function showNotification(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

/* ════════════════════════════════════════════
   LOGOUT  (GET → logout.php → session destroy)
════════════════════════════════════════════ */
async function logout() {
  try {
    await fetch('logout.php', { credentials: 'same-origin' });
  } catch { /* ignore network errors on logout */ }

  currentUser = null;
  window.location.href = '../Authentification/authentification.php';

  // Clear form fields
  const userEl = document.getElementById('loginUser');
  const passEl = document.getElementById('loginPass');
  if (userEl) userEl.value = '';
  if (passEl) passEl.value = '';
}
async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        // Try to parse the last valid JSON object in case of concatenated responses
        const matches = text.match(/\{[^{}]*\}/g);
        if (matches && matches.length > 0) {
            try {
                data = JSON.parse(matches[matches.length - 1]);
            } catch (parseErr) {
                throw new Error('Réponse API non valide : ' + text.trim().slice(0, 200));
            }
        } else {
            throw new Error('Réponse API non valide : ' + text.trim().slice(0, 200));
        }
    }

    if (!data.success && data.error) throw new Error(data.error);
    return data;
}
function showRegister(event) {
    console.log('showRegister called');
    event.preventDefault();
    document.getElementById('loginGate').style.display = 'none';
    document.getElementById('registerGate').style.display = '';
  }
  function showLogin(event) {
    console.log('showLogin called');
    event.preventDefault();
    document.getElementById('registerGate').style.display = 'none';
    document.getElementById('loginGate').style.display = '';
  }
  function createAccount(event) {
    
    const form = document.getElementById('registerForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('registerUser').value.trim();
    const pass = document.getElementById('registerPass').value;
    const confirm = document.getElementById('registerPassConfirm').value;
    const error = document.getElementById('registerError');
    if (!user || !pass) {
      error.textContent = 'Veuillez renseigner un nom d\'utilisateur et un mot de passe.';
      return;
    }
    if (pass !== confirm) {
      error.textContent = 'Les mots de passe ne correspondent pas.';
      return;
    }
    error.textContent = 'Création de compte en attente...';
    // Implémenter la logique de création d'utilisateur côté serveur dans auth.js ou backend.
    try {
            await apiFetch(`${API_URL}?action=register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass }),
            });
            showNotification('Compte créé avec succès !', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        }
      });
  }