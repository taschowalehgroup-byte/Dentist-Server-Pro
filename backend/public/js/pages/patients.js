/* ═══════════════════════════════════════════════════════
   DentCare Pro — Patients Page
   ═══════════════════════════════════════════════════════ */

const PatientsPage = {
  _filter: '',
  async render() { 
    const pts = await DB.tables.patients.all();
    this.renderTable(pts);
  },
  async search(q) { 
    this._filter = q; 
    const pts = await DB.tables.patients.all();
    const filtered = pts.filter(p=>p.full_name.toLowerCase().includes(q.toLowerCase())||(p.phone && p.phone.includes(q)));
    this.renderTable(filtered);
  },
  renderTable(rows) {
    $('patientBody').innerHTML = rows.length === 0
      ? `<tr><td colspan="8"><div class="empty-state"><div>👤</div><p>No patients found</p></div></td></tr>`
      : rows.map(p => `
        <tr>
          <td><code style="color:var(--accent);font-size:.8rem">${p.patient_no || '-'}</code></td>
          <td><strong>${p.full_name}</strong></td>
          <td>${p.phone}</td>
          <td>${p.age||'—'}</td>
          <td>${p.gender||'—'}</td>
          <td>${p.insurance||'<span style="color:var(--text3)">None</span>'}</td>
          <td style="color:var(--text2)">${p.created_at?.split('T')[0]||today()}</td>
          <td><div class="actions">
            <button class="action-btn" onclick="Modals.viewPatient(${p.id})">View</button>
            <button class="action-btn danger" onclick="Actions.deletePatient(${p.id})">Del</button>
          </div></td>
        </tr>
      `).join('');
  }
};
