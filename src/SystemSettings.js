import { useState, useEffect } from "react";
import "./SystemSettings.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  { id: 1, name: "Juan dela Cruz",  email: "juan@smartstock.com",  role: "Admin",   status: "Active",   avatar: "JD", lastLogin: "2026-03-13 08:42" },
  { id: 2, name: "Maria Santos",    email: "maria@smartstock.com", role: "Chef",    status: "Active",   avatar: "MS", lastLogin: "2026-03-13 07:15" },
  { id: 3, name: "Carlos Reyes",    email: "carlos@smartstock.com",role: "Staff",   status: "Active",   avatar: "CR", lastLogin: "2026-03-12 18:30" },
  { id: 4, name: "Ana Lim",         email: "ana@smartstock.com",   role: "Chef",    status: "Inactive", avatar: "AL", lastLogin: "2026-03-10 14:00" },
  { id: 5, name: "Ben Torres",      email: "ben@smartstock.com",   role: "Staff",   status: "Active",   avatar: "BT", lastLogin: "2026-03-13 09:01" },
  { id: 6, name: "Lea Mendoza",     email: "lea@smartstock.com",   role: "Viewer",  status: "Active",   avatar: "LM", lastLogin: "2026-03-11 11:20" },
];

const ROLES = ["Admin", "Chef", "Staff", "Viewer"];

const ROLE_META = {
  Admin:  { bg: "#fef2f2", color: "#dc2626" },
  Chef:   { bg: "#fff7ed", color: "#ea580c" },
  Staff:  { bg: "#eff6ff", color: "#3b82f6" },
  Viewer: { bg: "#f9fafb", color: "#6b7280" },
};

const PERMISSIONS = {
  Admin:  { inventory: true,  recipes: true,  forecast: true,  settings: true,  audit: true  },
  Chef:   { inventory: true,  recipes: true,  forecast: false, settings: false, audit: false },
  Staff:  { inventory: true,  recipes: false, forecast: false, settings: false, audit: false },
  Viewer: { inventory: false, recipes: false, forecast: false, settings: false, audit: false },
};

const PERM_LABELS = [
  { key: "inventory", label: "Inventory Management", desc: "View and edit stock items" },
  { key: "recipes",   label: "Recipe Management",    desc: "Create and manage recipes" },
  { key: "forecast",  label: "Forecasting & Reports",desc: "Access analytics and reports" },
  { key: "settings",  label: "System Settings",      desc: "Manage users and configuration" },
  { key: "audit",     label: "Audit Logs",            desc: "View system activity logs" },
];

const EMPTY_USER_FORM = { name: "", email: "", role: "Staff", status: "Active" };

const TABS = [
  { id: "general",     icon: "◎",  label: "General" },
  { id: "users",       icon: "👥", label: "User Management" },
  { id: "permissions", icon: "🔒", label: "Permissions" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "security",    icon: "🛡",  label: "Security" },
];

// ─── User Modal ───────────────────────────────────────────────────────────────

const UserModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? { ...initial } : EMPTY_USER_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, id: form.id ?? Date.now(), avatar: form.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(), lastLogin: form.lastLogin ?? "Never" });
    onClose();
  };

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-modal" onClick={e => e.stopPropagation()}>
        <div className="ss-modal-header">
          <div>
            <h2 className="ss-modal-title">{isEdit ? "Edit User" : "Add New User"}</h2>
            <p className="ss-modal-sub">{isEdit ? `Editing ${initial.name}` : "Create a new system user"}</p>
          </div>
          <button className="ss-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ss-modal-body">
          <div className="ss-form-row">
            <div className="ss-form-grp">
              <label>Full Name *</label>
              <input className={errors.name ? "inp-err" : ""} placeholder="e.g. Juan dela Cruz" value={form.name} onChange={e => set("name", e.target.value)} />
              {errors.name && <span className="err-txt">{errors.name}</span>}
            </div>
            <div className="ss-form-grp">
              <label>Email Address *</label>
              <input className={errors.email ? "inp-err" : ""} placeholder="user@smartstock.com" value={form.email} onChange={e => set("email", e.target.value)} />
              {errors.email && <span className="err-txt">{errors.email}</span>}
            </div>
          </div>
          <div className="ss-form-row">
            <div className="ss-form-grp">
              <label>Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="ss-form-grp">
              <label>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="ss-modal-footer">
          <button className="ss-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ss-btn-save" onClick={handleSave}>{isEdit ? "💾 Save Changes" : "➕ Add User"}</button>
        </div>
      </div>
    </div>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }) => (
  <button className={`ss-toggle${checked ? " on" : ""}`} onClick={() => onChange(!checked)}>
    <span className="ss-toggle-knob" />
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SystemSettings = () => {
  const [activeTab, setActiveTab]   = useState("general");
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [userModal, setUserModal]   = useState(null); // null | "add" | { user }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  // ── General settings state ──
  const [general, setGeneral] = useState({
    systemName: "SmartStock",
    timezone: "Asia/Manila",
    language: "English",
    currency: "PHP (₱)",
    dateFormat: "YYYY-MM-DD",
    lowStockThreshold: 10,
    expiryAlertDays: 3,
    autoReorder: true,
  });

  // ── Notification settings ──
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    lowStockNotif: true,
    expiryNotif: true,
    systemUpdates: false,
    weeklyReport: true,
    dailySummary: false,
  });

  // ── Security settings ──
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
    auditLogging: true,
    ipWhitelist: false,
  });

  // ── Role permissions state ──
  const [rolePerms, setRolePerms] = useState(PERMISSIONS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('systemUsers');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedGeneral = localStorage.getItem('systemGeneral');
    if (savedGeneral) setGeneral(JSON.parse(savedGeneral));

    const savedNotifs = localStorage.getItem('systemNotifs');
    if (savedNotifs) setNotifs(JSON.parse(savedNotifs));

    const savedSecurity = localStorage.getItem('systemSecurity');
    if (savedSecurity) setSecurity(JSON.parse(savedSecurity));

    const savedRolePerms = localStorage.getItem('systemRolePerms');
    if (savedRolePerms) setRolePerms(JSON.parse(savedRolePerms));
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => { localStorage.setItem('systemUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('systemGeneral', JSON.stringify(general)); }, [general]);
  useEffect(() => { localStorage.setItem('systemNotifs', JSON.stringify(notifs)); }, [notifs]);
  useEffect(() => { localStorage.setItem('systemSecurity', JSON.stringify(security)); }, [security]);
  useEffect(() => { localStorage.setItem('systemRolePerms', JSON.stringify(rolePerms)); }, [rolePerms]);

  const showToast = () => { setSavedToast(true); setTimeout(() => setSavedToast(false), 2500); };

  const handleSaveUser = (user) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      return exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
    });
  };

  const handleDeleteUser = (id) => { setUsers(prev => prev.filter(u => u.id !== id)); setDeleteConfirm(null); };

  const togglePerm = (role, key) => {
    if (role === "Admin") return; // Admin always has full access
    setRolePerms(prev => ({ ...prev, [role]: { ...prev[role], [key]: !prev[role][key] } }));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <main className="main-content ss-page">

      {/* Toast */}
      {savedToast && <div className="ss-toast">✅ Settings saved successfully!</div>}

      {/* ── Page Header ── */}
      <div className="ss-page-header">
        <div className="ss-page-title-wrap">
          <div className="ss-page-icon">◎</div>
          <div>
            <h1 className="ss-page-title">System Settings</h1>
            <p className="ss-page-sub">Manage system configuration, users, and permissions</p>
          </div>
        </div>
        <button className="ss-btn-save-all" onClick={showToast}>💾 Save All Changes</button>
      </div>

      {/* ── Tab Nav ── */}
      <div className="ss-tab-nav">
        {TABS.map(t => (
          <button key={t.id} className={`ss-tab${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <span className="ss-tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          TAB: GENERAL
      ════════════════════════════════ */}
      {activeTab === "general" && (
        <div className="ss-tab-content">
          <div className="ss-two-col">
            <div className="ss-card">
              <div className="ss-card-header">
                <h3 className="ss-card-title">📦 Inventory Thresholds</h3>
                <p className="ss-card-sub">Configure alert triggers for stock management</p>
              </div>
              <div className="ss-field-list">
                <div className="ss-field">
                  <label className="ss-field-label">Low Stock Threshold (units)</label>
                  <input className="ss-input" type="number" min="1" value={general.lowStockThreshold} onChange={e => setGeneral(g => ({ ...g, lowStockThreshold: e.target.value }))} />
                  <span className="ss-field-hint">Items below this quantity will trigger a low stock alert</span>
                </div>
                <div className="ss-field">
                  <label className="ss-field-label">Expiry Alert (days before)</label>
                  <input className="ss-input" type="number" min="1" value={general.expiryAlertDays} onChange={e => setGeneral(g => ({ ...g, expiryAlertDays: e.target.value }))} />
                  <span className="ss-field-hint">Alert admins this many days before an item expires</span>
                </div>
                <div className="ss-field-toggle">
                  <div>
                    <div className="ss-field-label">Auto-Reorder</div>
                    <div className="ss-field-hint">Automatically flag items for reorder when below threshold</div>
                  </div>
                  <Toggle checked={general.autoReorder} onChange={v => setGeneral(g => ({ ...g, autoReorder: v }))} />
                </div>
              </div>

              <div className="ss-info-box">
                <span className="ss-info-icon">ℹ</span>
                <div>
                  <strong>Current Thresholds</strong>
                  <p>Low stock alerts trigger at <strong>{general.lowStockThreshold} units</strong>. Expiry alerts fire <strong>{general.expiryAlertDays} days</strong> before expiration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: USER MANAGEMENT
      ════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="ss-tab-content">
          <div className="ss-card">
            <div className="ss-card-header">
              <div>
                <h3 className="ss-card-title">👥 User Management</h3>
                <p className="ss-card-sub">Add, edit, and manage system user accounts</p>
              </div>
              <button className="ss-btn-add-user" onClick={() => setUserModal("add")}>+ Add User</button>
            </div>

            {/* Search */}
            <div className="ss-user-search-wrap">
              <span className="ss-search-icon">🔍</span>
              <input className="ss-search-input" placeholder="Search users by name, email or role..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
            </div>

            {/* User cards */}
            <div className="ss-user-list">
              {filteredUsers.map(user => {
                const rm = ROLE_META[user.role] || ROLE_META.Viewer;
                return (
                  <div className="ss-user-row" key={user.id}>
                    <div className="ss-user-avatar" style={{ background: rm.bg, color: rm.color }}>{user.avatar}</div>
                    <div className="ss-user-info">
                      <div className="ss-user-name">{user.name}</div>
                      <div className="ss-user-email">{user.email}</div>
                      <div className="ss-user-meta">Last login: {user.lastLogin}</div>
                    </div>
                    <div className="ss-user-badges">
                      <span className="ss-role-badge" style={{ background: rm.bg, color: rm.color }}>{user.role}</span>
                      <span className={`ss-status-badge ${user.status === "Active" ? "active" : "inactive"}`}>{user.status}</span>
                    </div>
                    <div className="ss-user-actions">
                      <button className="ss-tbl-btn edit" onClick={() => setUserModal(user)}>✏ Edit</button>
                      {user.role !== "Admin" && (
                        <button className="ss-tbl-btn delete" onClick={() => setDeleteConfirm(user.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="ss-empty">No users match your search.</div>
              )}
            </div>

            <div className="ss-user-count">{filteredUsers.length} of {users.length} users</div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: PERMISSIONS
      ════════════════════════════════ */}
      {activeTab === "permissions" && (
        <div className="ss-tab-content">
          <div className="ss-card">
            <div className="ss-card-header">
              <div>
                <h3 className="ss-card-title">🔒 Role Permissions</h3>
                <p className="ss-card-sub">Configure what each role can access. Admin always has full access.</p>
              </div>
            </div>

            <div className="perm-table-wrap">
              <table className="perm-table">
                <thead>
                  <tr>
                    <th className="perm-feature-col">Feature / Module</th>
                    {ROLES.map(role => {
                      const rm = ROLE_META[role];
                      return (
                        <th key={role}>
                          <span className="perm-role-header" style={{ background: rm.bg, color: rm.color }}>{role}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERM_LABELS.map(p => (
                    <tr key={p.key}>
                      <td className="perm-feature-cell">
                        <div className="perm-feature-name">{p.label}</div>
                        <div className="perm-feature-desc">{p.desc}</div>
                      </td>
                      {ROLES.map(role => (
                        <td key={role} className="perm-toggle-cell">
                          <Toggle
                            checked={rolePerms[role][p.key]}
                            onChange={() => togglePerm(role, p.key)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ss-info-box">
              <span className="ss-info-icon">🔒</span>
              <div>
                <strong>Admin Override</strong>
                <p>Admin role always retains full access to all modules and cannot be restricted.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: NOTIFICATIONS
      ════════════════════════════════ */}
      {activeTab === "notifications" && (
        <div className="ss-tab-content">
          <div className="ss-two-col">
            <div className="ss-card">
              <div className="ss-card-header">
                <h3 className="ss-card-title">🔔 Alert Notifications</h3>
                <p className="ss-card-sub">Control which events trigger system notifications</p>
              </div>
              <div className="ss-field-list">
                {[
                  { key: "emailAlerts",   label: "Email Alerts",    desc: "Send notifications via email" },
                  { key: "lowStockNotif", label: "Low Stock Alerts", desc: "Notify when items fall below threshold" },
                  { key: "expiryNotif",   label: "Expiry Warnings",  desc: "Warn before items expire" },
                  { key: "systemUpdates", label: "System Updates",   desc: "Receive product update announcements" },
                ].map(n => (
                  <div className="ss-field-toggle" key={n.key}>
                    <div>
                      <div className="ss-field-label">{n.label}</div>
                      <div className="ss-field-hint">{n.desc}</div>
                    </div>
                    <Toggle checked={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            <div className="ss-card">
              <div className="ss-card-header">
                <h3 className="ss-card-title">📋 Report Schedules</h3>
                <p className="ss-card-sub">Automate periodic report delivery</p>
              </div>
              <div className="ss-field-list">
                {[
                  { key: "weeklyReport",  label: "Weekly Summary Report", desc: "Delivered every Monday morning" },
                  { key: "dailySummary",  label: "Daily Activity Summary", desc: "Sent at end of each business day" },
                ].map(n => (
                  <div className="ss-field-toggle" key={n.key}>
                    <div>
                      <div className="ss-field-label">{n.label}</div>
                      <div className="ss-field-hint">{n.desc}</div>
                    </div>
                    <Toggle checked={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
                  </div>
                ))}
              </div>

              <div className="ss-notif-preview">
                <div className="ss-notif-title">📬 Active Notifications</div>
                {Object.entries(notifs).filter(([, v]) => v).length === 0
                  ? <p className="ss-notif-none">All notifications are disabled.</p>
                  : Object.entries(notifs).filter(([, v]) => v).map(([k]) => (
                    <div className="ss-notif-chip" key={k}>✓ {k.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}</div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: SECURITY
      ════════════════════════════════ */}
      {activeTab === "security" && (
        <div className="ss-tab-content">
          <div className="ss-two-col">
            <div className="ss-card">
              <div className="ss-card-header">
                <h3 className="ss-card-title">🛡 Authentication</h3>
                <p className="ss-card-sub">Login and session security controls</p>
              </div>
              <div className="ss-field-list">
                <div className="ss-field-toggle">
                  <div>
                    <div className="ss-field-label">Two-Factor Authentication</div>
                    <div className="ss-field-hint">Require 2FA for all admin accounts</div>
                  </div>
                  <Toggle checked={security.twoFactor} onChange={v => setSecurity(s => ({ ...s, twoFactor: v }))} />
                </div>
                {[
                  { key: "sessionTimeout", label: "Session Timeout (minutes)", hint: "Auto-logout after inactivity", type: "number" },
                  { key: "loginAttempts",  label: "Max Login Attempts",         hint: "Lock account after N failed tries", type: "number" },
                  { key: "passwordExpiry", label: "Password Expiry (days)",     hint: "Force password reset after N days", type: "number" },
                ].map(f => (
                  <div className="ss-field" key={f.key}>
                    <label className="ss-field-label">{f.label}</label>
                    <input className="ss-input" type={f.type} value={security[f.key]} onChange={e => setSecurity(s => ({ ...s, [f.key]: e.target.value }))} />
                    <span className="ss-field-hint">{f.hint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ss-card">
              <div className="ss-card-header">
                <h3 className="ss-card-title">🔐 Access Controls</h3>
                <p className="ss-card-sub">Advanced security and logging options</p>
              </div>
              <div className="ss-field-list">
                {[
                  { key: "auditLogging", label: "Audit Logging",   desc: "Record all user actions in the system" },
                  { key: "ipWhitelist",  label: "IP Whitelisting",  desc: "Restrict access to approved IP addresses only" },
                ].map(s => (
                  <div className="ss-field-toggle" key={s.key}>
                    <div>
                      <div className="ss-field-label">{s.label}</div>
                      <div className="ss-field-hint">{s.desc}</div>
                    </div>
                    <Toggle checked={security[s.key]} onChange={v => setSecurity(prev => ({ ...prev, [s.key]: v }))} />
                  </div>
                ))}
              </div>

              <div className="ss-danger-zone">
                <div className="ss-danger-title">⚠ Danger Zone</div>
                <p className="ss-danger-sub">These actions are irreversible. Proceed with caution.</p>
                <div className="ss-danger-actions">
                  <button className="ss-danger-btn">🗑 Clear All Audit Logs</button>
                  <button className="ss-danger-btn">🔄 Reset System Settings</button>
                </div>
              </div>
            </div>
          </div>

          <div className="ss-card">
            <h3 className="ss-card-title">🔑 Security Summary</h3>
            <div className="ss-security-summary">
              {[
                { label: "2FA Enabled",          value: security.twoFactor ? "Yes" : "No",   ok: security.twoFactor },
                { label: "Session Timeout",       value: `${security.sessionTimeout} min`,    ok: parseInt(security.sessionTimeout) <= 60 },
                { label: "Max Login Attempts",    value: security.loginAttempts,              ok: parseInt(security.loginAttempts) <= 5 },
                { label: "Password Expiry",       value: `${security.passwordExpiry} days`,   ok: parseInt(security.passwordExpiry) <= 90 },
                { label: "Audit Logging",         value: security.auditLogging ? "On" : "Off", ok: security.auditLogging },
                { label: "IP Whitelisting",       value: security.ipWhitelist ? "On" : "Off",  ok: true },
              ].map((s, i) => (
                <div className="ss-sec-row" key={i}>
                  <span className="ss-sec-label">{s.label}</span>
                  <div className="ss-sec-right">
                    <span className={`ss-sec-indicator ${s.ok ? "ok" : "warn"}`}>{s.ok ? "✓" : "⚠"}</span>
                    <span className="ss-sec-value">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── User Modal ── */}
      {userModal && (
        <UserModal
          initial={userModal === "add" ? null : userModal}
          onClose={() => setUserModal(null)}
          onSave={handleSaveUser}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="ss-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ss-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="ss-confirm-icon">🗑</div>
            <h3 className="ss-confirm-title">Delete User?</h3>
            <p className="ss-confirm-sub">This action cannot be undone. The user will lose all access.</p>
            <div className="ss-confirm-actions">
              <button className="ss-btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="ss-btn-delete" onClick={() => handleDeleteUser(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SystemSettings;