/* ═══════════════════════════════════════════════════════
   DentCare Pro — Passwords Page
   ═══════════════════════════════════════════════════════ */

const PasswordsPage = {
  async render() {
    const users = await DB.tables.users.all();
    this.renderTable(users);
  },

  renderTable(rows) {
    const body = $('passwordBody');
    if (!body) return;

    body.innerHTML = rows.length === 0
      ? `<tr><td colspan="4"><div class="empty-state"><div>🔑</div><p>No users found</p></div></td></tr>`
      : rows.map(u => `
        <tr>
          <td><strong>${u.username}</strong></td>
          <td><span class="badge ${u.role === 'admin' ? 'danger' : 'info'}">${u.role}</span></td>
          <td><code style="letter-spacing: 2px">${u.password}</code></td>
          <td>
            <div class="actions">
              <button class="action-btn" onclick="Actions.editUser(${u.id})">Edit</button>
            </div>
          </td>
        </tr>
      `).join('');
  }
};
