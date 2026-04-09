/* ═══════════════════════════════════════════════════════
   DentCare Pro — CRUD Action Handlers
   ═══════════════════════════════════════════════════════ */

const Actions = {
  async registerPatient() {
    try {
      const name  = $('np_name').value.trim();
      const phone = $('np_phone').value.trim();
      if (!name || !phone) { toast('Name and phone are required', 'error'); return }
      const dob = $('np_dob').value;
      const age = dob ? Math.floor((Date.now()-new Date(dob))/(365.25*24*3600*1000)) : null;
      
      const patient_no = await DB.helpers.nextPatientNo();
      
      await DB.tables.patients.insert({
        patient_no,
        full_name: name, phone,
        date_of_birth: dob, age,
        gender: $('np_gender').value,
        email: $('np_email').value,
        occupation: $('np_occupation').value,
        blood_type: $('np_blood').value,
        insurance: $('np_insurance').value,
        referral_source: $('np_ref').value,
        payment_method: $('np_pay').value,
        medical_conditions: $('np_conditions').value,
        allergies: $('np_allergies').value,
        dental_concerns: $('np_concerns').value,
        address: $('np_address').value,
        price: 0,
        xray_image: Modals._xrayBase64 || null,
        xray_date:  $('np_xray_date')?.value  || null,
        xray_notes: $('np_xray_notes')?.value || null
      });
      Modals._clearXray();
      Modals.close();
      toast(`Patient ${name} registered!`, 'success');
      if (App.currentPage === 'patients') await Pages.patients.render();
      await UI.updateBadges();
    } catch(e) { toast('Failed to register patient','error'); console.error(e); }
  },

  async deletePatient(id) {
    if (!confirm('Delete this patient and all their records?')) return;
    try {
      await DB.tables.patients.delete(id);
      toast('Patient deleted', 'error');
      await Pages.patients.render();
      await UI.updateBadges();
    } catch(e) { toast('Error deleting patient','error'); console.error(e); }
  },

  async scheduleAppt() {
    try {
      const pid = parseInt($('ap_patient').value);
      const did = parseInt($('ap_doctor').value);
      const date = $('ap_date').value;
      const time = $('ap_time').value;
      if (!pid||!did||!date||!time) { toast('Patient, doctor, date and time are required','error'); return }
      
      await DB.tables.appointments.insert({
        patient_id: pid, doctor_id: did,
        date, time,
        duration_min: parseInt($('ap_dur').value)||30,
        priority: $('ap_priority').value,
        treatment_type: $('ap_type').value,
        chief_complaint: $('ap_complaint').value,
        notes: $('ap_notes').value,
        status: 'scheduled'
      });
      Modals.close();
      toast('Appointment scheduled!','success');
      if (App.currentPage==='appointments') await Pages.appointments.render();
      if (App.currentPage==='calendar') await Pages.calendar.render();
      if (App.currentPage==='dashboard') await Pages.dashboard.render();
      await UI.updateBadges();
    } catch(e) { toast('Error scheduling appointment','error'); console.error(e); }
  },

  async updateApptStatus(id) {
    try {
      const statuses = ['scheduled','confirmed','completed','cancelled','no-show'];
      const appt = await DB.tables.appointments.find(id);
      if (!appt || appt.error) return;
      const idx = statuses.indexOf(appt.status);
      const next = statuses[(idx+1)%statuses.length];
      await DB.tables.appointments.update(id,{status:next});
      toast(`Status → ${next}`,'info');
      await Pages.appointments.renderTable();
    } catch(e) { toast('Error updating status','error'); console.error(e); }
  },

  async deleteAppt(id) {
    if (!confirm('Delete this appointment?')) return;
    try {
      await DB.tables.appointments.delete(id);
      toast('Appointment deleted','error');
      await Pages.appointments.renderTable();
      await UI.updateBadges();
    } catch(e) { toast('Error deleting appt','error'); console.error(e); }
  },

  async addDoctor() {
    try {
      const name = $('dr_name').value.trim();
      const spec = $('dr_spec').value;
      if (!name||!spec) { toast('Name and specialty are required','error'); return }
      await DB.tables.doctors.insert({
        full_name: name, specialty: spec,
        phone: $('dr_phone').value,
        email: $('dr_email').value,
        license_no: $('dr_lic').value,
        room: $('dr_room').value,
        schedule: $('dr_sched').value,
        status: 'present',
        commission_filling: 20,
        commission_crown: 20,
        commission_root_canal: 20,
        commission_extraction: 20,
        commission_implant: 25,
        commission_orthodontics: 20,
        commission_other: 15
      });
      Modals.close();
      toast(`Dr. ${name} added!`,'success');
      if (App.currentPage==='doctors') await Pages.doctors.render();
    } catch(e) { toast('Error adding doctor','error'); console.error(e); }
  },

  async toggleDoctorStatus(id) {
    try {
      const doc = await DB.tables.doctors.find(id);
      if (!doc || doc.error) return;
      const next = doc.status==='present'?'absent':'present';
      await DB.tables.doctors.update(id,{status:next});
      toast(`${doc.full_name} → ${next}`,'info');
      await Pages.doctors.render();
    } catch(e) { toast('Error updating status','error'); console.error(e); }
  },

  async deleteDoctor(id) {
    if (!confirm('Remove this doctor?')) return;
    try {
      await DB.tables.doctors.delete(id);
      toast('Doctor removed','error');
      await Pages.doctors.render();
    } catch(e) { toast('Error deleting doctor','error'); console.error(e); }
  },

  async addTransaction() {
    try {
      const desc   = $('tx_desc').value.trim();
      const amount = parseFloat($('tx_amount').value);
      const date   = $('tx_date').value;
      if (!desc||!amount||!date) { toast('All fields required','error'); return }
      await DB.tables.transactions.insert({
        description: desc, type: $('tx_type').value,
        category: $('tx_cat').value, amount, date, patient_id: null
      });
      Modals.close();
      toast('Transaction added!','success');
      if (App.currentPage==='finance') await Pages.finance.renderAll();
      if (App.currentPage==='dashboard') await Pages.dashboard.render();
    } catch(e) { toast('Error adding transaction','error'); console.error(e); }
  },

  async deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    try {
      await DB.tables.transactions.delete(id);
      toast('Transaction deleted','error');
      await Pages.finance.renderAll();
    } catch(e) { toast('Error deleting transaction','error'); console.error(e); }
  },

  async addInventoryItem() {
    try {
      const name = $('inv_name').value.trim();
      const qty  = parseInt($('inv_qty').value);
      if (!name||isNaN(qty)) { toast('Name and quantity required','error'); return }
      await DB.tables.inventory.insert({
        item_name: name, category: $('inv_cat').value,
        quantity: qty, min_stock: parseInt($('inv_min').value)||5,
        unit_price: parseFloat($('inv_price').value)||0,
        supplier: $('inv_supplier').value
      });
      Modals.close();
      toast(`${name} added to inventory!`,'success');
      if (App.currentPage==='inventory') await Pages.inventory.render();
      await UI.updateBadges();
    } catch(e) { toast('Error adding item','error'); console.error(e); }
  },

  async updateInvQty(id) {
    try {
      const item = await DB.tables.inventory.find(id);
      if (!item || item.error) return;
      const newQty = prompt(`Update quantity for "${item.item_name}" (current: ${item.quantity}):`, item.quantity);
      if (newQty === null) return;
      const qty = parseInt(newQty);
      if (isNaN(qty)||qty<0) { toast('Invalid quantity','error'); return }
      await DB.tables.inventory.update(id,{quantity:qty, last_updated:new Date().toISOString()});
      toast(`Quantity updated to ${qty}`,'success');
      await Pages.inventory.render();
      await UI.updateBadges();
    } catch(e) { toast('Error updating quantity','error'); console.error(e); }
  },

  async deleteInventory(id) {
    if (!confirm('Remove this item from inventory?')) return;
    try {
      await DB.tables.inventory.delete(id);
      toast('Item removed','error');
      await Pages.inventory.render();
      await UI.updateBadges();
    } catch(e) { toast('Error deleting item','error'); console.error(e); }
  }
};
