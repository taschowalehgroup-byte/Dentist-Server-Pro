/* ═══════════════════════════════════════════════════════
   DentCare Pro — Appointments Page
   ═══════════════════════════════════════════════════════ */

const AppointmentsPage = {
  _filter: 'all',
  async render() { await this.renderTable() },
  async filter(f, btn) {
    this._filter = f;
    document.querySelectorAll('#apptFilters .ftab').forEach(b=>b.classList.remove('active'));
    btn?.classList.add('active');
    await this.renderTable();
  },
  async renderTable() {
    let rows = await DB.tables.appointments.all();
    if (this._filter !== 'all') rows = rows.filter(a=>a.status===this._filter);
    rows.sort((a,b)=>a.date>b.date?-1:1);

    const pts = await DB.tables.patients.all();
    const docs = await DB.tables.doctors.all();
    const ptMap = Object.fromEntries(pts.map(p => [p.id, p]));
    const dcMap = Object.fromEntries(docs.map(d => [d.id, d]));

    $('apptBody').innerHTML = rows.length === 0
      ? `<tr><td colspan="8"><div class="empty-state"><div>📅</div><p>No appointments found</p></div></td></tr>`
      : rows.map(a=>`
        <tr>
          <td><strong>${ptMap[a.patient_id]?.full_name || 'Unknown'}</strong></td>
          <td style="color:var(--text2)">${dcMap[a.doctor_id]?.full_name || 'Unknown'}</td>
          <td>${a.date}</td>
          <td style="color:var(--accent)">${a.time}</td>
          <td>${a.treatment_type||'—'}</td>
          <td>${UI.priorityBadge(a.priority)}</td>
          <td>${UI.statusBadge(a.status)}</td>
          <td><div class="actions">
            <button class="action-btn" onclick="Actions.updateApptStatus(${a.id})">Status</button>
            <button class="action-btn danger" onclick="Actions.deleteAppt(${a.id})">Del</button>
          </div></td>
        </tr>
      `).join('');
  }
};
