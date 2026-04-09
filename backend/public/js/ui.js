/* ═══════════════════════════════════════════════════════
   DentCare Pro — UI Helpers & Utilities
   ═══════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const fmt = n => 'E£ ' + Number(n).toLocaleString('en-EG', {minimumFractionDigits:0,maximumFractionDigits:0});
const today = () => new Date().toISOString().split('T')[0];

function toast(msg, type='info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = {success:'✓', error:'✗', info:'ℹ'};
  el.innerHTML = `<span>${icons[type]||'•'}</span><span>${msg}</span>`;
  $('toastContainer').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function animateCount(el, target, duration=800) {
  const start = 0, startTime = performance.now();
  const isFloat = String(target).includes('.');
  function step(now) {
    const prog = Math.min((now-startTime)/duration, 1);
    const ease = 1 - Math.pow(1-prog, 3);
    const val = start + (target-start)*ease;
    el.textContent = isFloat ? fmt(val) : Math.round(val).toLocaleString();
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startClock() {
  const el = $('liveTime');
  function tick() {
    const d = new Date();
    el.textContent = d.toLocaleString('en-EG', {weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  }
  tick(); setInterval(tick, 60000);
}

/* ── UI namespace ──────────────────────────────────── */
const UI = {
  async updateBadges() {
    try {
      const patients = await DB.tables.patients.all();
      const todayAppts = await DB.helpers.todayAppts();
      const inventory = await DB.tables.inventory.all();
      
      $('badgePatients').textContent = patients.length;
      $('badgeAppts').textContent = todayAppts.length;
      
      const lowStock = inventory.filter(i => i.quantity <= i.min_stock).length;
      $('badgeInventory').textContent = lowStock;
      $('badgeInventory').style.display = lowStock > 0 ? '' : 'none';

      // Messages badge (pending forgot-password requests)
      if (typeof MessagesPage !== 'undefined') MessagesPage.updateBadge();
    } catch (e) {
      console.error('Failed to update badges', e);
    }
  },

  priorityBadge: p => `<span class="badge badge-${p}">${p}</span>`,
  statusBadge:   s => `<span class="badge badge-${s}">${s}</span>`,

  detailTab(name, btn) {
    document.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
    $(`detail${name.charAt(0).toUpperCase()+name.slice(1)}`).classList.add('active');
    btn.classList.add('active');
  }
};
