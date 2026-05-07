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

/* ──────────────────────────────────────────
   BOOT — check existing PHP session first
────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  bindEnterKey();

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
      window.location.href = '../index.html';
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
  window.location.href = '../Authentification/authentification.php';

  // Clear form fields
  const userEl = document.getElementById('loginUser');
  const passEl = document.getElementById('loginPass');
  if (userEl) userEl.value = '';
  if (passEl) passEl.value = '';
}