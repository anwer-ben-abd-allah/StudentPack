// ============================================
// timetable.js  –  Frontend ↔ PHP API bridge
// ============================================
// Place next to timetable.html
// Make sure api.php is at API_URL below.
// ============================================

const API_URL = 'api.php';   // adjust path if needed, e.g. '../backend/api.php'

// ── State ─────────────────────────────────────
let subjects = [];   // { id, name, description, color }
let slots    = [];   // { id, subject, color, day, time }

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await loadSubjects();
    await loadSlots();
    bindForm();
});

// ── API helpers ───────────────────────────────
async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!data.success && data.error) throw new Error(data.error);
    return data;
}

// ── Load subjects ─────────────────────────────
async function loadSubjects() {
    try {
        const data = await apiFetch(`${API_URL}?action=subjects`);
        subjects = data.subjects;
        populateSubjectSelect();
        renderSubjectCards();
    } catch (err) {
        showNotification('Erreur lors du chargement des matières: ' + err.message, 'error');
    }
}

function populateSubjectSelect() {
    const sel = document.getElementById('matiere');
    if (!sel) return;
    sel.innerHTML = '<option value="">Choisir...</option>';
    subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        sel.appendChild(opt);
    });
}

function renderSubjectCards() {
    const container = document.getElementById('subjects-grid');
    if (!container) return;
    container.innerHTML = '';
    subjects.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.style.setProperty('--c', s.color);
        card.style.setProperty('--c-glow', s.color + '22');
        card.style.animationDelay = (i * 55) + 'ms';
        card.innerHTML = `<h3>${s.name}</h3><p>${s.description}</p>`;
        container.appendChild(card);
    });
}

// ── Load timetable slots ───────────────────────
async function loadSlots() {
    try {
        const data = await apiFetch(`${API_URL}?action=slots`);
        slots = data.slots;
        renderTable();
        updateStatCounter();
    } catch (err) {
        showNotification('Erreur lors du chargement du planning: ' + err.message, 'error');
    }
}

// ── Render the weekly table ────────────────────
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

function renderTable() {
    const tbody = document.getElementById('emploiDuTemps');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (slots.length === 0) {
        const tr = document.createElement('tr');
        tr.className = 'empty-row';
        tr.innerHTML = `<td colspan="4"><div class="empty-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
            <p>Aucun cours planifié pour l'instant.<br>Ajoutez votre premier cours ci-dessus.</p>
        </div></td>`;
        tbody.appendChild(tr);
        return;
    }

    // Sort by day then time
    const sorted = [...slots].sort((a, b) => {
        const di = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        return di !== 0 ? di : a.time.localeCompare(b.time);
    });

    sorted.forEach((slot, i) => {
        const tr = document.createElement('tr');
        tr.dataset.slotId = slot.id;
        tr.style.animationDelay = (i * 40) + 'ms';
        tr.innerHTML = `
            <td>${slot.day}</td>
            <td>${slot.time}</td>
            <td>
                <span class="subject-badge" style="--badge-bg:${slot.color}18;--badge-color:${slot.color};--badge-border:${slot.color}33;">${slot.subject}</span>
            </td>
            <td>
                <button class="btn-delete" onclick="deleteSlot(${slot.id})">
                    Supprimer
                </button>
            </td>`;
        tbody.appendChild(tr);
    });
}

// ── Bind form submit ───────────────────────────
function bindForm() {
    const form = document.getElementById('formMatiere');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subjectId = document.getElementById('matiere').value;
        const day       = document.getElementById('jour').value;
        const time      = document.getElementById('heure').value;

        if (!subjectId || !day || !time) {
            showNotification('Veuillez remplir tous les champs.', 'error');
            return;
        }

        try {
            await apiFetch(`${API_URL}?action=add_slot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject_id: subjectId, day, time }),
            });
            form.reset();
            showNotification('Cours ajouté avec succès !', 'success');
            await loadSlots();   // refresh table from DB
        } catch (err) {
            showNotification(err.message, 'error');
        }
    });
}

// ── Delete a slot ──────────────────────────────
async function deleteSlot(id) {
    if (!confirm('Supprimer ce cours ?')) return;
    try {
        await apiFetch(`${API_URL}?action=delete_slot&id=${id}`, { method: 'DELETE' });
        showNotification('Cours supprimé.', 'success');
        await loadSlots();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// ── Simple toast notification ──────────────────
function showNotification(msg, type = 'success') {
    const toast = document.getElementById('tt-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ── Update header stat counter ─────────────────
function updateStatCounter() {
    const el = document.getElementById('statSlots');
    if (el) el.textContent = slots.length;
}

// ── Mobile sidebar toggle ─────────────────────
const burger = document.getElementById('burger');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
}

burger?.addEventListener('click', openSidebar);
overlay?.addEventListener('click', closeSidebar);