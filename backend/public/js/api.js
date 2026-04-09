/**
 * DentCare Pro — API Client Engine
 * Connects to Node.js backend
 */

const DB = (() => {
  const API_URL = 'http://localhost:3000/api';

  async function request(endpoint, options = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }

  // ── Generic CRUD ─────────────────────────────────────────────
  const tables = {};
  ['patients','appointments','treatments','transactions','inventory','doctors','users'].forEach(t => {
    tables[t] = {
      all:    ()  => request(`/${t}`),
      find:   (id)=> request(`/${t}/${id}`),
      insert: (row)=> request(`/${t}`, { method: 'POST', body: JSON.stringify(row) }),
      update: (id, patch)=> request(`/${t}/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),
      delete: (id)=> request(`/${t}/${id}`, { method: 'DELETE' })
    };
  });

  // ── Treatments extras ─────────────────────────────────────────
  tables.treatments.bulk = (rows) => request('/treatments/bulk', { method: 'POST', body: JSON.stringify({ rows }) });

  // ── Settings ──────────────────────────────────────────────────
  const settings = {
    get:   ()      => request('/settings'),
    save:  (data)  => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
    reset: ()      => request('/settings/reset', { method: 'POST' })
  };

  // ── Auth ──────────────────────────────────────────────────────
  const auth = {
    async login(username, password) {
      try {
        const user = await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        const session = { ...user, loginTime: Date.now() };
        sessionStorage.setItem('dentcare_session', JSON.stringify(session));
        return session;
      } catch (err) {
        return null;
      }
    },
    logout() { sessionStorage.removeItem('dentcare_session'); },
    current() {
      const s = sessionStorage.getItem('dentcare_session');
      return s ? JSON.parse(s) : null;
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const helpers = {
    patientName: async (id) => { 
      try { const p = await tables.patients.find(id); return p.full_name; } catch(e){ return 'Unknown'; }
    },
    doctorName:  async (id) => { 
      try { const d = await tables.doctors.find(id); return d.full_name; } catch(e){ return 'Unknown'; } 
    },
    todayAppts: async () => {
      const today = new Date().toISOString().split('T')[0];
      const allAppts = await tables.appointments.all();
      return allAppts.filter(a => a.date === today);
    },
    stats: () => request('/stats'),
    nextPatientNo: async () => {
      const { patient_no } = await request('/nextPatientNo');
      return patient_no;
    },
    reset: async () => {
      await request('/reset', { method: 'POST' });
    }
  };

  return { tables, auth, helpers, settings };
})();
