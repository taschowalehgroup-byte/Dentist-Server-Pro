/* ═══════════════════════════════════════════════════════
   DentCare Pro — Modal Controllers
   ═══════════════════════════════════════════════════════ */

const Modals = {
  _active: null,

  open(id) {
    this._active = id;
    $('modalOverlay').classList.add('open');
    document.querySelectorAll('.modal').forEach(m=>m.style.display='none');
    $(id).style.display='block';
    $(id).style.animation='modalIn .3s cubic-bezier(.4,0,.2,1) both';
  },

  close(e) {
    if (e && e.target !== $('modalOverlay')) return;
    $('modalOverlay').classList.remove('open');
    this._active = null;
  },

  newPatient() {
    ['np_name','np_phone','np_dob','np_email','np_occupation','np_insurance','np_address','np_conditions','np_allergies','np_concerns']
      .forEach(id => $(id) && ($(id).value=''));
    // Reset xray tab
    this._clearXray();
    // Reset to info tab
    this._npTab('info', document.querySelector('.np-tab'));
    this.open('modalNewPatient');
  },

  _npTab(tab, btn) {
    // Switch tab panels
    ['Info','Xray'].forEach(t => {
      const panel = $(`npTab${t}`);
      if (panel) panel.style.display = 'none';
    });
    const active = $(`npTab${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
    if (active) active.style.display = '';
    // Highlight active tab button
    document.querySelectorAll('.np-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  _xrayBase64: null,

  _handleXrayFile(input) {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => this._showXrayPreview(e.target.result);
    reader.readAsDataURL(input.files[0]);
  },

  _handleXrayDrop(e) {
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => this._showXrayPreview(ev.target.result);
    reader.readAsDataURL(file);
  },

  _showXrayPreview(dataUrl) {
    this._xrayBase64 = dataUrl;
    const img = $('xrayPreviewImg');
    const wrap = $('xrayPreviewWrap');
    const prompt = $('xrayUploadPrompt');
    if (img) img.src = dataUrl;
    if (wrap) wrap.style.display = '';
    if (prompt) prompt.style.display = 'none';
  },

  _clearXray() {
    this._xrayBase64 = null;
    const wrap   = $('xrayPreviewWrap');
    const prompt = $('xrayUploadPrompt');
    const inp    = $('xrayFileInp');
    if (wrap)   wrap.style.display = 'none';
    if (prompt) prompt.style.display = '';
    if (inp)    inp.value = '';
  },

  async newAppointment(patientId=null) {
    const patients = await DB.tables.patients.all();
    $('ap_patient').innerHTML = '<option value="">Select patient…</option>' +
      patients.map(p=>`<option value="${p.id}" ${patientId==p.id?'selected':''}>${p.full_name}</option>`).join('');
    
    const doctors = await DB.tables.doctors.all();
    $('ap_doctor').innerHTML = '<option value="">Select doctor…</option>' +
      doctors.map(d=>`<option value="${d.id}">${d.full_name} — ${d.specialty}</option>`).join('');
    
    $('ap_date').value = today();
    $('ap_time').value = '09:00';
    this.open('modalNewAppt');
  },

  addDoctor() { this.open('modalAddDoctor') },

  newTransaction() {
    $('tx_date').value = today();
    this.open('modalNewTx');
  },

  addInventory() { this.open('modalAddInv') },

  async viewPatient(id) {
    try {
      const p = await DB.tables.patients.find(id);
      if (!p) return;
      $('detailPatientName').textContent = `🦷 ${p.full_name}`;

      // Overview
      $('detailOverview').innerHTML = `
        <div class="detail-info-grid">
          <div class="detail-info-item"><label>Patient No.</label><span style="color:var(--accent)">${p.patient_no}</span></div>
          <div class="detail-info-item"><label>Phone</label><span>${p.phone}</span></div>
          <div class="detail-info-item"><label>Date of Birth</label><span>${p.date_of_birth||'—'}</span></div>
          <div class="detail-info-item"><label>Age</label><span>${p.age||'—'}</span></div>
          <div class="detail-info-item"><label>Gender</label><span>${p.gender||'—'}</span></div>
          <div class="detail-info-item"><label>Blood Type</label><span>${p.blood_type||'—'}</span></div>
          <div class="detail-info-item"><label>Email</label><span>${p.email||'—'}</span></div>
          <div class="detail-info-item"><label>Insurance</label><span>${p.insurance||'None'}</span></div>
          <div class="detail-info-item"><label>Payment</label><span>${p.payment_method||'—'}</span></div>
        </div>
        <div class="form-grid">
          ${p.medical_conditions?`<div class="detail-info-item full" style="grid-column:1/-1"><label>Medical Conditions</label><span style="color:var(--orange)">${p.medical_conditions}</span></div>`:''}
          ${p.allergies?`<div class="detail-info-item" style="grid-column:1/-1"><label>Allergies</label><span style="color:var(--red)">${p.allergies}</span></div>`:''}
          ${p.dental_concerns?`<div class="detail-info-item" style="grid-column:1/-1"><label>Dental Concerns</label><span>${p.dental_concerns}</span></div>`:''}
        </div>
        <div style="margin-top:1rem">
          <button class="btn-primary" onclick="Modals.newAppointment(${p.id})" style="margin-right:.5rem">📅 Book Appointment</button>
        </div>
      `;

      const docs = await DB.tables.doctors.all();
      const dcMap = Object.fromEntries(docs.map(d => [d.id, d]));

      // Treatments
      const allTx = await DB.tables.treatments.all();
      const txs = allTx.filter(t=>String(t.patient_id)===String(id));
      $('detailTreatments').innerHTML = txs.length===0
        ? '<div class="empty-state"><div>🦷</div><p>No treatments recorded</p></div>'
        : '<table class="data-table"><thead><tr><th>Date</th><th>Tooth</th><th>Treatment</th><th>Cost</th><th>Doctor</th><th>Notes</th></tr></thead><tbody>'
            + txs.map(t=>`<tr><td>${t.date}</td><td>${t.tooth_number||'—'}</td><td>${t.treatment_type}</td><td style="color:var(--green)">${fmt(t.cost)}</td><td>${dcMap[t.doctor_id]?.full_name||'Unknown'}</td><td style="color:var(--text2);font-size:.8rem">${t.procedure_notes||'—'}</td></tr>`).join('')
            + '</tbody></table>';

      // Appointments
      const allApts = await DB.tables.appointments.all();
      const apts = allApts.filter(a=>String(a.patient_id)===String(id));
      $('detailAppointments').innerHTML = apts.length===0
        ? '<div class="empty-state"><div>📅</div><p>No appointments</p></div>'
        : '<table class="data-table"><thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Treatment</th><th>Status</th><th>Priority</th></tr></thead><tbody>'
            + apts.sort((a,b)=>a.date>b.date?-1:1).map(a=>`<tr><td>${a.date}</td><td>${a.time}</td><td>${dcMap[a.doctor_id]?.full_name||'Unknown'}</td><td>${a.treatment_type||'—'}</td><td>${UI.statusBadge(a.status)}</td><td>${UI.priorityBadge(a.priority)}</td></tr>`).join('')
            + '</tbody></table>';

      // Billing
      const total = txs.reduce((s,t)=>s+Number(t.cost),0);
      $('detailBilling').innerHTML = `
        <div class="finance-summary" style="margin-bottom:1rem">
          <div class="fin-card"><div class="fin-label">Total Charged</div><div class="fin-value income">${fmt(total)}</div></div>
          <div class="fin-card"><div class="fin-label">Payment Method</div><div class="fin-value net" style="font-size:1.1rem">${p.payment_method||'—'}</div></div>
          <div class="fin-card"><div class="fin-label">Insurance</div><div class="fin-value net" style="font-size:1.1rem">${p.insurance||'None'}</div></div>
        </div>
        <table class="data-table"><thead><tr><th>Date</th><th>Treatment</th><th>Amount</th></tr></thead><tbody>
          ${txs.map(b=>`<tr><td>${b.date}</td><td>${b.treatment_type}</td><td style="color:var(--green)">${fmt(b.cost)}</td></tr>`).join('')}
        </tbody></table>
      `;

      // X-Ray Tab
      $('detailXray').innerHTML = p.xray_image
        ? `<div style="text-align:center;padding:1rem">
             <div style="margin-bottom:.75rem;color:var(--text2);font-size:.85rem">
               📅 ${p.xray_date || 'Date unknown'} &nbsp;|&nbsp; ${p.xray_notes || 'No notes'}
             </div>
             <img src="${p.xray_image}" alt="X-Ray"
                  style="max-width:100%;max-height:420px;border-radius:10px;border:1px solid var(--border);object-fit:contain;cursor:zoom-in"
                  onclick="this.style.maxHeight=this.style.maxHeight==='none'?'420px':'none'">
             <div style="margin-top:.75rem">
               <a href="${p.xray_image}" download="xray_${p.full_name.replace(/ /g,'_')}.jpg"
                  class="btn-icon" style="text-decoration:none">⬇ Download X-Ray</a>
             </div>
           </div>`
        : `<div class="empty-state"><div>🩻</div><p>No X-ray on file for this patient</p></div>`;

      this.open('modalPatientDetail');
    } catch(e) {
      console.error(e);
      toast('Failed to load patient details', 'error');
    }
  }
};
