

'use strict';

const SUBJECTS = [
  'Analyse', 'Algèbre', 'Applications Réparties',
  'Architecture des Réseaux', 'Comptabilité', 'Conception des SI',
  'Droit', 'Java', 'SGBD', 'UNIX', 'WEB', 'Anglais'
];

// ── State ─────────────────────────────────────────────────────
let notes        = [];   // full array from server
let currentId    = null; // id of the open note (null = new unsaved)
let saveTimer    = null; // debounce handle for auto-save indicator

// ── DOM refs ──────────────────────────────────────────────────
const listEl      = document.getElementById('notes-list');
const searchEl    = document.getElementById('search');
const welcomeEl   = document.getElementById('welcome');
const editorEl    = document.getElementById('editor');
const subjectEl   = document.getElementById('e-subject');
const dateEl      = document.getElementById('e-date');
const titleEl     = document.getElementById('e-title');
const bodyEl      = document.getElementById('e-body');
const wordCountEl = document.getElementById('word-count');
const saveStatus  = document.getElementById('save-status');
(async function init() {
  populateSubjectDropdown();
  await loadNotes();bindEvents();
})();

function populateSubjectDropdown() {
  SUBJECTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    subjectEl.appendChild(opt);
  });
}
async function loadNotes() {
  try {
    const res  = await fetch('notes.php', { credentials: 'same-origin' });const data = await res.json();
    notes = data;
renderList(notes);
  } catch (err) {
    flash('Could not load notes.', 'error');
    console.error('loadNotes:', err);
  }
}
function renderList(items) {
  listEl.innerHTML = '';

  if (!items.length) {
    listEl.innerHTML = '<p class="sidebar-empty">No notes yet.<br>Create your first one!</p>';
    return;
  }

  items.forEach(note => {
    const el = document.createElement('div');
    el.className = 'note-item' + (note.id === currentId ? ' active' : '');
    el.dataset.id = note.id;

    const preview = (note.body || '').replace(/\s+/g, ' ').slice(0, 60);
    const dateStr = formatDate(note.note_date);

    el.innerHTML = `
      ${note.subject ? `<div class="note-item-subject">${esc(note.subject)}</div>` : ''}
      <div class="note-item-title">${esc(note.title) || 'Untitled'}</div>
      <div class="note-item-preview">${esc(preview)}</div>
      <div class="note-item-date">${dateStr}</div>
    `;

    el.addEventListener('click', () => openNote(note.id));
    listEl.appendChild(el);
  });
}

function openNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  currentId = id;

  subjectEl.value = note.subject  || '';
  dateEl.value    = note.note_date || today();
  titleEl.value   = note.title    || '';
  bodyEl.value    = note.body     || '';

  showEditor();
  updateWordCount();
  highlightActive(id);
  titleEl.focus();
}
function newNote() {
  currentId = null;

  subjectEl.value = '';
  dateEl.value    = today();
  titleEl.value   = '';
  bodyEl.value    = '';

  showEditor();
  updateWordCount();
  highlightActive(null);
  titleEl.focus();
}
function showEditor() {
  welcomeEl.style.display = 'none';
  editorEl.style.display  = 'flex';
}

function showWelcome() {
  welcomeEl.style.display = '';
  editorEl.style.display  = 'none';
}
async function saveNote() {
  const title = titleEl.value.trim();
  if (!title) {
    flash('Please add a title before saving.', 'error');
    titleEl.focus();
    return;
  }

  const fd = new FormData();
  fd.append('action',    'save');
  fd.append('id',        currentId ?? 0);
  fd.append('subject',   subjectEl.value);
  fd.append('title',     title);
  fd.append('body',      bodyEl.value);
  fd.append('note_date', dateEl.value || today());

  try {
    const res  = await fetch('notes.php', { method: 'POST', body: fd, credentials: 'same-origin' });
    const data = await res.json();

    if (!data.ok) {
      flash(data.error || 'Save failed.', 'error');
      return;
    }

    const wasNew = currentId === null;
    currentId = data.id;
    if (wasNew) {
      notes.unshift({
        id:        data.id,
        subject:   subjectEl.value,
        title:     title,
        body:      bodyEl.value,
        note_date: dateEl.value || today()
      });
    } else {
      const idx = notes.findIndex(n => n.id === data.id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], subject: subjectEl.value, title, body: bodyEl.value, note_date: dateEl.value || today() };
      }
    }

    renderList(filterNotes(searchEl.value));
    highlightActive(currentId);
    showSavedIndicator();

  } catch (err) {
    flash('Network error while saving.', 'error');
    console.error('saveNote:', err);
  }
}
async function deleteNote() {
  if (!currentId) { showWelcome(); return; }
  if (!confirm('Delete this note? This cannot be undone.')) return;

  const fd = new FormData();
  fd.append('action', 'delete');
  fd.append('id',     currentId);

  try {
    const res  = await fetch('notes.php', { method: 'POST', body: fd, credentials: 'same-origin' });
    const data = await res.json();

    if (!data.ok) {
      flash(data.error || 'Delete failed.', 'error');
      return;
    }

    notes = notes.filter(n => n.id !== currentId);
    currentId = null;
    renderList(filterNotes(searchEl.value));
    showWelcome();

  } catch (err) {
    flash('Network error while deleting.', 'error');
    console.error('deleteNote:', err);
  }
}

function filterNotes(query) {
  if (!query.trim()) return notes;
  const q = query.toLowerCase();
  return notes.filter(n =>
    (n.title   || '').toLowerCase().includes(q) ||
    (n.body    || '').toLowerCase().includes(q) ||
    (n.subject || '').toLowerCase().includes(q)
  );
}

function updateWordCount() {
  const words = bodyEl.value.trim().split(/\s+/).filter(Boolean).length;
  wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function showSavedIndicator() {
  saveStatus.classList.add('show');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveStatus.classList.remove('show'), 2200);
}
function highlightActive(id) {
  document.querySelectorAll('.note-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.id) === id);
  });
}

function flash(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `flash flash-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bindEvents() {

  document.getElementById('btn-new').addEventListener('click', newNote);
  document.getElementById('btn-new-welcome').addEventListener('click', newNote);
  document.getElementById('btn-save').addEventListener('click', saveNote);
  document.getElementById('btn-delete').addEventListener('click', deleteNote);
  searchEl.addEventListener('input', () => {
    renderList(filterNotes(searchEl.value));
    highlightActive(currentId);
  });

  bodyEl.addEventListener('input', updateWordCount);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (editorEl.style.display !== 'none') saveNote();
    }
  });
}
