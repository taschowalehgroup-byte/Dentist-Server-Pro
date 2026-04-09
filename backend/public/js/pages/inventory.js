/* ═══════════════════════════════════════════════════════
   DentCare Pro — Inventory Page
   ═══════════════════════════════════════════════════════ */

const InventoryPage = {
  async render() { 
    const inv = await DB.tables.inventory.all();
    this.renderTable(inv);
  },
  async search(q) { 
    const inv = await DB.tables.inventory.all();
    const filtered = inv.filter(i=>i.item_name.toLowerCase().includes(q.toLowerCase()));
    this.renderTable(filtered);
  },
  renderTable(rows) {
    $('invBody').innerHTML = rows.length === 0
      ? `<tr><td colspan="8"><div class="empty-state"><div>📦</div><p>No items found</p></div></td></tr>`
      : rows.map(i=>{
        const low = i.quantity <= i.min_stock;
        return `
          <tr>
            <td><strong>${i.item_name}</strong></td>
            <td><span class="badge badge-normal">${i.category}</span></td>
            <td style="color:${low?'var(--red)':'var(--text)'}"><strong>${i.quantity}</strong></td>
            <td style="color:var(--text2)">${i.min_stock}</td>
            <td>${fmt(i.unit_price)}</td>
            <td style="color:var(--text2)">${i.supplier||'—'}</td>
            <td>${low?'<span class="badge badge-emergency">Low Stock</span>':'<span class="badge badge-confirmed">OK</span>'}</td>
            <td><div class="actions">
              <button class="action-btn" onclick="Actions.updateInvQty(${i.id})">Update Qty</button>
              <button class="action-btn danger" onclick="Actions.deleteInventory(${i.id})">Del</button>
            </div></td>
          </tr>
        `;
      }).join('');
  }
};
