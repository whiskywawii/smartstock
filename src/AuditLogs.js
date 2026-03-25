import { useState, useMemo } from "react";
import "./AuditLogs.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const ACTION_META = {
  CREATE:  { color: "#16a34a", bg: "#f0fdf4", label: "CREATE"  },
  UPDATE:  { color: "#2563eb", bg: "#eff6ff", label: "UPDATE"  },
  DELETE:  { color: "#dc2626", bg: "#fef2f2", label: "DELETE"  },
  LOGIN:   { color: "#0891b2", bg: "#ecfeff", label: "LOGIN"   },
  LOGOUT:  { color: "#6b7280", bg: "#f9fafb", label: "LOGOUT"  },
  EXPORT:  { color: "#7c3aed", bg: "#f5f3ff", label: "EXPORT"  },
  SETTING: { color: "#d97706", bg: "#fffbeb", label: "SETTING" },
  ALERT:   { color: "#ea580c", bg: "#fff7ed", label: "ALERT"   },
};

const MODULE_META = {
  Inventory: { icon: "◫", color: "#3b82f6" },
  Recipes:   { icon: "✦", color: "#f97316" },
  Forecast:  { icon: "↗", color: "#22c55e" },
  Settings:  { icon: "◎", color: "#22c55e" },
  Users:     { icon: "👥", color: "#8b5cf6" },
  System:    { icon: "⚡", color: "#9ca3af" },
  Auth:      { icon: "🔐", color: "#0891b2" },
};

const SEED_LOGS = [
  { id: 1,  user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "UPDATE",  module: "Settings",  description: "Updated low stock threshold from 5 to 10 units",            ip: "192.168.1.10", timestamp: "2026-03-13 09:42:11", status: "success" },
  { id: 2,  user: "Maria Santos",    avatar: "MS", role: "Chef",   action: "CREATE",  module: "Recipes",   description: "Created new recipe: Grilled Chicken Salad",               ip: "192.168.1.14", timestamp: "2026-03-13 09:30:05", status: "success" },
  { id: 3,  user: "Carlos Reyes",    avatar: "CR", role: "Staff",  action: "UPDATE",  module: "Inventory", description: "Updated quantity of Tomatoes: 5 → 55 units",               ip: "192.168.1.22", timestamp: "2026-03-13 09:15:44", status: "success" },
  { id: 4,  user: "Ben Torres",      avatar: "BT", role: "Staff",  action: "LOGIN",   module: "Auth",      description: "User logged in successfully",                              ip: "192.168.1.31", timestamp: "2026-03-13 09:01:02", status: "success" },
  { id: 5,  user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "LOGIN",   module: "Auth",      description: "Admin login from new device",                              ip: "192.168.1.10", timestamp: "2026-03-13 08:42:00", status: "success" },
  { id: 6,  user: "Maria Santos",    avatar: "MS", role: "Chef",   action: "LOGIN",   module: "Auth",      description: "User logged in successfully",                              ip: "192.168.1.14", timestamp: "2026-03-13 07:15:30", status: "success" },
  { id: 7,  user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "DELETE",  module: "Inventory", description: "Deleted expired item: Old Cheddar Batch #12",              ip: "192.168.1.10", timestamp: "2026-03-12 18:55:10", status: "success" },
  { id: 8,  user: "System",          avatar: "SY", role: "System", action: "ALERT",   module: "System",    description: "Low stock alert triggered: Spinach (0 units)",            ip: "System",       timestamp: "2026-03-12 18:30:00", status: "warning" },
  { id: 9,  user: "Carlos Reyes",    avatar: "CR", role: "Staff",  action: "LOGOUT",  module: "Auth",      description: "User session ended",                                       ip: "192.168.1.22", timestamp: "2026-03-12 18:28:00", status: "success" },
  { id: 10, user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "EXPORT",  module: "Forecast",  description: "Exported Weekly Forecast Report as PDF",                  ip: "192.168.1.10", timestamp: "2026-03-12 17:10:22", status: "success" },
  { id: 11, user: "Maria Santos",    avatar: "MS", role: "Chef",   action: "UPDATE",  module: "Recipes",   description: "Updated recipe instructions: Beef Stir Fry",              ip: "192.168.1.14", timestamp: "2026-03-12 16:45:00", status: "success" },
  { id: 12, user: "Unknown",         avatar: "??", role: "—",      action: "LOGIN",   module: "Auth",      description: "Failed login attempt — invalid credentials",               ip: "203.0.113.45", timestamp: "2026-03-12 16:10:05", status: "failed"  },
  { id: 13, user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "CREATE",  module: "Users",     description: "Created new user account: Ben Torres (Staff)",            ip: "192.168.1.10", timestamp: "2026-03-12 14:30:00", status: "success" },
  { id: 14, user: "System",          avatar: "SY", role: "System", action: "ALERT",   module: "System",    description: "Expiry alert: Whole Milk expires in 1 day",                ip: "System",       timestamp: "2026-03-12 12:00:00", status: "warning" },
  { id: 15, user: "Ana Lim",         avatar: "AL", role: "Chef",   action: "UPDATE",  module: "Inventory", description: "Updated reorder level for Chicken Breast: 10 → 15",       ip: "192.168.1.18", timestamp: "2026-03-12 11:20:00", status: "success" },
  { id: 16, user: "Juan dela Cruz",  avatar: "JD", role: "Admin",  action: "SETTING", module: "Settings",  description: "Enabled two-factor authentication for admin accounts",    ip: "192.168.1.10", timestamp: "2026-03-12 10:05:33", status: "success" },
  { id: 17, user: "Carlos Reyes",    avatar: "CR", role: "Staff",  action: "CREATE",  module: "Inventory", description: "Added new item: Bell Peppers (18 units, Fresh Produce)",   ip: "192.168.1.22", timestamp: "2026-03-12 09:50:00", status: "success" },
  { id: 18, user: "System",          avatar: "SY", role: "System", action: "EXPORT",  module: "System",    description: "Automated weekly backup completed successfully",            ip: "System",       timestamp: "2026-03-12 03:00:00", status: "success" },
  { id: 19, user: "Unknown",         avatar: "??", role: "—",      action: "LOGIN",   module: "Auth",      description: "Failed login attempt — account locked after 5 tries",     ip: "91.108.4.100", timestamp: "2026-03-11 23:14:10", status: "failed"  },
  { id: 20, user: "Lea Mendoza",     avatar: "LM", role: "Viewer", action: "LOGIN",   module: "Auth",      description: "User logged in successfully",                              ip: "192.168.1.40", timestamp: "2026-03-11 11:20:00", status: "success" },
];

const ACTIONS  = ["All Actions",  ...Object.keys(ACTION_META)];
const MODULES  = ["All Modules",  ...Object.keys(MODULE_META)];
const STATUSES = ["All Statuses", "success", "warning", "failed"];

const STATUS_META = {
  success: { bg: "#f0fdf4", color: "#16a34a", label: "Success" },
  warning: { bg: "#fffbeb", color: "#d97706", label: "Warning" },
  failed:  { bg: "#fef2f2", color: "#dc2626", label: "Failed"  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AuditLogs = () => {
  const [search,        setSearch]        = useState("");
  const [filterAction,  setFilterAction]  = useState("All Actions");
  const [filterModule,  setFilterModule]  = useState("All Modules");
  const [filterStatus,  setFilterStatus]  = useState("All Statuses");
  const [filterUser,    setFilterUser]    = useState("All Users");
  const [expandedId,    setExpandedId]    = useState(null);
  const [page,          setPage]          = useState(1);
  const [exportDone,    setExportDone]    = useState(false);
  const PER_PAGE = 10;

  const uniqueUsers = ["All Users", ...Array.from(new Set(SEED_LOGS.map(l => l.user)))];

  // Stats
  const todayStr = "2026-03-13";
  const todayLogs   = SEED_LOGS.filter(l => l.timestamp.startsWith(todayStr));
  const failedLogs  = SEED_LOGS.filter(l => l.status === "failed");
  const alertLogs   = SEED_LOGS.filter(l => l.action === "ALERT");
  const uniqueUsersActive = new Set(SEED_LOGS.filter(l => l.role !== "System" && l.role !== "—").map(l => l.user)).size;

  const filtered = useMemo(() => {
    return SEED_LOGS.filter(log => {
      const q = search.toLowerCase();
      const matchSearch = !q || log.user.toLowerCase().includes(q) || log.description.toLowerCase().includes(q) || log.module.toLowerCase().includes(q);
      const matchAction = filterAction  === "All Actions"  || log.action  === filterAction;
      const matchModule = filterModule  === "All Modules"  || log.module  === filterModule;
      const matchStatus = filterStatus  === "All Statuses" || log.status  === filterStatus;
      const matchUser   = filterUser    === "All Users"    || log.user    === filterUser;
      return matchSearch && matchAction && matchModule && matchStatus && matchUser;
    });
  }, [search, filterAction, filterModule, filterStatus, filterUser]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => { setExportDone(true); setTimeout(() => setExportDone(false), 2500); };

  const clearFilters = () => { setSearch(""); setFilterAction("All Actions"); setFilterModule("All Modules"); setFilterStatus("All Statuses"); setFilterUser("All Users"); setPage(1); };

  const hasFilters = search || filterAction !== "All Actions" || filterModule !== "All Modules" || filterStatus !== "All Statuses" || filterUser !== "All Users";

  return (
    <main className="main-content al-page">

      {/* Export toast */}
      {exportDone && <div className="al-toast">✅ Audit log exported successfully!</div>}

      {/* ── Page Header ── */}
      <div className="al-page-header">
        <div className="al-page-title-wrap">
          <div className="al-page-icon">☰</div>
          <div>
            <h1 className="al-page-title">Audit Logs</h1>
            <p className="al-page-sub">Track all system activities and user actions in real time</p>
          </div>
        </div>
        <button className="al-btn-export" onClick={handleExport}>⬇ Export Logs</button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="al-stats-row">
        <div className="al-stat-card">
          <div className="al-stat-icon blue">📋</div>
          <div>
            <div className="al-stat-value">{SEED_LOGS.length}</div>
            <div className="al-stat-label">Total Events</div>
            <div className="al-stat-sub">All time</div>
          </div>
        </div>
        <div className="al-stat-card">
          <div className="al-stat-icon green">📅</div>
          <div>
            <div className="al-stat-value">{todayLogs.length}</div>
            <div className="al-stat-label">Today's Events</div>
            <div className="al-stat-sub">Mar 13, 2026</div>
          </div>
        </div>
        <div className="al-stat-card">
          <div className="al-stat-icon red">⚠</div>
          <div>
            <div className="al-stat-value red">{failedLogs.length}</div>
            <div className="al-stat-label">Failed Attempts</div>
            <div className="al-stat-sub">Requires attention</div>
          </div>
        </div>
        <div className="al-stat-card">
          <div className="al-stat-icon orange">🔔</div>
          <div>
            <div className="al-stat-value orange">{alertLogs.length}</div>
            <div className="al-stat-label">System Alerts</div>
            <div className="al-stat-sub">Auto-generated</div>
          </div>
        </div>
        <div className="al-stat-card">
          <div className="al-stat-icon teal">👥</div>
          <div>
            <div className="al-stat-value">{uniqueUsersActive}</div>
            <div className="al-stat-label">Active Users</div>
            <div className="al-stat-sub">Logged in recently</div>
          </div>
        </div>
      </div>

      {/* ── Activity by Module ── */}
      <div className="al-card al-module-row">
        <h3 className="al-card-title">Activity by Module</h3>
        <div className="al-module-grid">
          {Object.keys(MODULE_META).map(mod => {
            const count = SEED_LOGS.filter(l => l.module === mod).length;
            const pct   = Math.round((count / SEED_LOGS.length) * 100);
            const meta  = MODULE_META[mod];
            return (
              <div className="al-module-card" key={mod} onClick={() => { setFilterModule(mod); setPage(1); }} style={{ cursor: "pointer" }}>
                <div className="al-mod-icon" style={{ color: meta.color }}>{meta.icon}</div>
                <div className="al-mod-name">{mod}</div>
                <div className="al-mod-count" style={{ color: meta.color }}>{count}</div>
                <div className="al-mod-bar-track">
                  <div className="al-mod-bar-fill" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Log Table Card ── */}
      <div className="al-card">

        {/* Toolbar */}
        <div className="al-toolbar">
          <div className="al-search-wrap">
            <span className="al-search-icon">🔍</span>
            <input className="al-search-input" placeholder="Search by user, action, or description..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="al-filters">
            <select value={filterAction}  onChange={e => { setFilterAction(e.target.value); setPage(1); }}>{ACTIONS.map(a => <option key={a}>{a}</option>)}</select>
            <select value={filterModule}  onChange={e => { setFilterModule(e.target.value); setPage(1); }}>{MODULES.map(m => <option key={m}>{m}</option>)}</select>
            <select value={filterStatus}  onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            <select value={filterUser}    onChange={e => { setFilterUser(e.target.value);   setPage(1); }}>{uniqueUsers.map(u => <option key={u}>{u}</option>)}</select>
            {hasFilters && <button className="al-clear-btn" onClick={clearFilters}>✕ Clear</button>}
          </div>
        </div>

        {/* Table */}
        <div className="al-table-wrap">
          <table className="al-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0
                ? <tr><td colSpan={8} className="al-empty">No log entries match your filters.</td></tr>
                : paginated.map(log => {
                    const am   = ACTION_META[log.action] || ACTION_META.UPDATE;
                    const mm   = MODULE_META[log.module] || MODULE_META.System;
                    const sm   = STATUS_META[log.status] || STATUS_META.success;
                    const isEx = expandedId === log.id;
                    return (
                      <>
                        <tr key={log.id} className={`al-row${isEx ? " expanded" : ""}${log.status === "failed" ? " failed-row" : ""}`} onClick={() => setExpandedId(isEx ? null : log.id)}>
                          <td className="al-expand-cell">
                            <span className={`al-chevron${isEx ? " open" : ""}`}>›</span>
                          </td>
                          <td className="al-ts-cell">
                            <div className="al-date">{log.timestamp.split(" ")[0]}</div>
                            <div className="al-time">{log.timestamp.split(" ")[1]}</div>
                          </td>
                          <td>
                            <div className="al-user-cell">
                              <div className="al-avatar" style={{ background: log.role === "System" ? "#f3f4f6" : "#f0fdf4", color: log.role === "System" ? "#6b7280" : "#15803d" }}>{log.avatar}</div>
                              <div>
                                <div className="al-user-name">{log.user}</div>
                                <div className="al-user-role">{log.role}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="al-action-badge" style={{ background: am.bg, color: am.color }}>{am.label}</span>
                          </td>
                          <td>
                            <span className="al-module-chip" style={{ color: mm.color }}>
                              {mm.icon} {log.module}
                            </span>
                          </td>
                          <td className="al-desc-cell">{log.description}</td>
                          <td className="al-ip-cell">{log.ip}</td>
                          <td>
                            <span className="al-status-badge" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isEx && (
                          <tr className="al-detail-row" key={`detail-${log.id}`}>
                            <td colSpan={8}>
                              <div className="al-detail-wrap">
                                <div className="al-detail-grid">
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">Event ID</span>
                                    <span className="al-detail-val">LOG-{String(log.id).padStart(5,"0")}</span>
                                  </div>
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">Full Timestamp</span>
                                    <span className="al-detail-val">{log.timestamp}</span>
                                  </div>
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">User</span>
                                    <span className="al-detail-val">{log.user} ({log.role})</span>
                                  </div>
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">IP Address</span>
                                    <span className="al-detail-val">{log.ip}</span>
                                  </div>
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">Module</span>
                                    <span className="al-detail-val">{log.module}</span>
                                  </div>
                                  <div className="al-detail-item">
                                    <span className="al-detail-key">Action Type</span>
                                    <span className="al-detail-val">{log.action}</span>
                                  </div>
                                </div>
                                <div className="al-detail-desc">
                                  <span className="al-detail-key">Full Description</span>
                                  <p>{log.description}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="al-pagination">
          <span className="al-pag-info">Showing {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length} entries</span>
          <div className="al-pag-btns">
            <button className="al-pag-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="al-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`al-pag-btn${page === p ? " active" : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="al-pag-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>›</button>
            <button className="al-pag-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuditLogs;