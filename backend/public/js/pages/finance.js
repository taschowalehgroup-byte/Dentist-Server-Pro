/* ═══════════════════════════════════════════════════════
   DentCare Pro — Finance Page
   ═══════════════════════════════════════════════════════ */

const FinancePage = {
  _filter: 'all',
  async render() { await this.renderAll() },
  async filter(f, btn) {
    this._filter = f;
    document.querySelectorAll('#finFilters .ftab').forEach(b=>b.classList.remove('active'));
    btn?.classList.add('active');
    await this.renderAll();
  },
  async renderAll() {
    const tx = await DB.tables.transactions.all();
    const income  = tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expense = tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    $('financeSummary').innerHTML = `
      <div class="fin-card"><div class="fin-label">Total Income</div><div class="fin-value income">${fmt(income)}</div></div>
      <div class="fin-card"><div class="fin-label">Total Expense</div><div class="fin-value expense">${fmt(expense)}</div></div>
      <div class="fin-card"><div class="fin-label">Net Profit</div><div class="fin-value net">${fmt(income-expense)}</div></div>
    `;
    let rows = tx;
    if (this._filter !== 'all') rows = tx.filter(t=>t.type===this._filter);
    rows.sort((a,b)=>a.date>b.date?-1:1);
    $('financeBody').innerHTML = rows.length === 0
      ? `<tr><td colspan="6"><div class="empty-state"><div>💰</div><p>No transactions</p></div></td></tr>`
      : rows.map(t=>`
        <tr>
          <td>${t.date}</td>
          <td><strong>${t.description}</strong></td>
          <td style="color:var(--text2)">${t.category}</td>
          <td>${UI.statusBadge(t.type==='income'?'confirmed':'cancelled')}</td>
          <td style="font-weight:600;color:${t.type==='income'?'var(--green)':'var(--red)'}">${t.type==='expense'?'-':'+'} ${fmt(t.amount)}</td>
          <td><button class="action-btn danger" onclick="Actions.deleteTransaction(${t.id})">Del</button></td>
        </tr>
      `).join('');
  }
};
