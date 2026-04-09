/* ═══════════════════════════════════════════════════════
   DentCare Pro — Doctors Page
   ═══════════════════════════════════════════════════════ */

const DoctorsPage = {
  async render() {
    const docs = await DB.tables.doctors.all();
    $('doctorsGrid').innerHTML = docs.map((d,i)=>{
      const initials = d.full_name.split(' ').filter(w=>w.match(/^[A-Z]/)).map(w=>w[0]).join('').slice(0,2);
      return `
        <div class="doctor-card" style="--i:${i}">
          <div class="dr-avatar">${initials}</div>
          <div class="dr-name">${d.full_name}</div>
          <div class="dr-spec">${d.specialty}</div>
          <div class="dr-info">
            <span>📞 ${d.phone||'—'}</span>
            <span>🏠 ${d.room||'—'}</span>
            <span>🕐 ${d.schedule||'—'}</span>
            <span>🪪 ${d.license_no||'—'}</span>
          </div>
          <div class="dr-status">${UI.statusBadge(d.status==='present'?'confirmed':'cancelled')}</div>
          <div class="actions" style="margin-top:1rem">
            <button class="action-btn" onclick="Actions.toggleDoctorStatus(${d.id})">Toggle Status</button>
            <button class="action-btn danger" onclick="Actions.deleteDoctor(${d.id})">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }
};
