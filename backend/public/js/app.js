/* ═══════════════════════════════════════════════════════
   DentCare Pro — Main Application Controller
   Loads after: api.js, ui.js, pages/*.js, modals.js, actions.js
   ═══════════════════════════════════════════════════════ */

/* ── Pages Registry (maps page name → module) ──────── */
const Pages = {
  dashboard:    DashboardPage,
  patients:     PatientsPage,
  appointments: AppointmentsPage,
  doctors:      DoctorsPage,
  finance:      FinancePage,
  inventory:    InventoryPage,
  passwords:    PasswordsPage,
  messages:     MessagesPage,
  calendar:     CalendarPage,
  treatments:   TreatmentsPage,
  settings:     SettingsPage,
  analytics:    AnalyticsPage
};

/* ── App Controller ────────────────────────────────── */
const App = {
  currentPage: 'dashboard',

  async login() {
    const u = $('loginUser').value.trim();
    const p = $('loginPass').value.trim();
    
    const btn = document.querySelector('.btn-login');
    const ogText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
      const session = await DB.auth.login(u, p);
      if (!session) { $('loginErr').classList.remove('hidden'); return }
      $('loginErr').classList.add('hidden');
      $('loginScreen').classList.remove('active');
      $('appScreen').classList.add('active');
      $('sidebarName').textContent = session.username;
      $('sidebarRole').textContent = session.role ? session.role.charAt(0).toUpperCase()+session.role.slice(1) : '';
      $('sidebarAvatar').textContent = session.username.charAt(0).toUpperCase();
      startClock();
      await App.page('dashboard');
      toast(`Welcome back, ${session.username}!`, 'success');
    } finally {
      btn.textContent = ogText;
      btn.disabled = false;
    }
  },

  logout() {
    DB.auth.logout();
    $('appScreen').classList.remove('active');
    $('loginScreen').classList.add('active');
    toast('Logged out successfully', 'info');
  },

  async page(name) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const pageEl = $(`pg-${name}`);
    if (pageEl) pageEl.classList.add('active');
    
    const navItem = document.querySelector(`[data-page="${name}"]`);
    if (navItem) navItem.classList.add('active');
    
    $('pageTitle').textContent = name.charAt(0).toUpperCase()+name.slice(1);
    App.currentPage = name;
    
    if (Pages[name]?.render) {
      await Pages[name].render();
    }
    await UI.updateBadges();
  },

  toggleSidebar() {
    $('sidebar').classList.toggle('open');
  },

  forgotPassword() {
    const select = $('loginUser');
    const username = select.value.trim();
    if (!username) {
      toast('Please select your username first', 'warning');
      return;
    }
    // Save request to localStorage so admin can see it
    const msgs = JSON.parse(localStorage.getItem('dentcare_pw_requests') || '[]');
    // Avoid duplicate pending requests from same user
    const alreadyPending = msgs.find(m => m.username === username && m.status === 'pending');
    if (alreadyPending) {
      toast('Your request is already pending. Please wait for admin.', 'info');
      return;
    }
    msgs.push({
      id: Date.now(),
      username: username,
      message: `User "${username}" has forgotten their password and is requesting it from the administrator.`,
      time: new Date().toLocaleString(),
      status: 'pending'
    });
    localStorage.setItem('dentcare_pw_requests', JSON.stringify(msgs));
    toast('Your request has been sent to the administrator.', 'success');
  }
};

/* ── Keyboard Shortcuts ────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') Modals.close();
  if ($('loginScreen').classList.contains('active') && e.key === 'Enter') App.login();
});

/* ── Populate Username Dropdown from passwords.json ── */
document.addEventListener('DOMContentLoaded', async () => {
  const select = $('loginUser');
  try {
    // Fetch the passwords.json to populate usernames
    const res = await fetch('../../database/JSON/passwords.json');
    const data = await res.json();
    if (data && data.users) {
      data.users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.username;
        opt.textContent = u.username + ' (' + u.role + ')';
        select.appendChild(opt);
      });
    }
  } catch(e) {
    // Fallback: hardcode usernames if fetch fails
    const fallback = ['admin','manager','doctor1','doctor2','doctor3','doctor4','doctor5','hygienist','assistant','receptionist','accountant'];
    fallback.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      select.appendChild(opt);
    });
  }

  // Restore last session username
  const session = DB.auth.current();
  if (session) {
    select.value = session.username;
  }
});
