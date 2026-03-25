import { useState, useMemo } from "react";
import "./Notifications.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,  type: "low-stock",  title: "Low Stock Alert",
    message: "Tomatoes have dropped below the reorder level (5kg remaining, reorder at 20kg). Please update inventory or notify your supervisor.",
    time: "5 mins ago",  date: "2026-03-13", read: false, pinned: true,
    icon: "⚠", color: "#ef4444", bg: "#fef2f2", border: "#fecaca",
  },
  {
    id: 2,  type: "expiry",     title: "Expiry Alert — Whole Milk",
    message: "Whole Milk (8L in Fridge A) expires tomorrow on March 14. Prioritize usage today or report for disposal.",
    time: "18 mins ago", date: "2026-03-13", read: false, pinned: true,
    icon: "⏱", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
  },
  {
    id: 3,  type: "expiry",     title: "Expiry Alert — Greek Yogurt",
    message: "Greek Yogurt (3 pcs in Fridge A) expires in 2 days on March 15. Flag for priority use.",
    time: "22 mins ago", date: "2026-03-13", read: false, pinned: false,
    icon: "⏱", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
  },
  {
    id: 4,  type: "recipe",     title: "Recipe Updated — Pasta Carbonara",
    message: "Admin has updated the Pasta Carbonara recipe. New instructions include adjusted cooking time and portion sizes. Please review before your next preparation.",
    time: "1 hour ago",  date: "2026-03-13", read: false, pinned: false,
    icon: "✦", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
  },
  {
    id: 5,  type: "system",     title: "New Policy — Food Safety Guidelines",
    message: "Management has issued updated food safety and hygiene guidelines effective immediately. Check the System Settings section for full details.",
    time: "3 hours ago", date: "2026-03-13", read: true,  pinned: false,
    icon: "ℹ", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe",
  },
  {
    id: 6,  type: "task",       title: "Task Assigned — Receiving Items",
    message: "You have been assigned to receive and log the 2:00 PM stock delivery. Ensure all quantities are verified and discrepancies reported.",
    time: "4 hours ago", date: "2026-03-13", read: true,  pinned: false,
    icon: "📋", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
  },
  {
    id: 7,  type: "low-stock",  title: "Low Stock Alert — Eggs",
    message: "Eggs are below reorder level (24 pcs remaining, reorder at 30 pcs). Restock needed before end of shift.",
    time: "5 hours ago", date: "2026-03-13", read: true,  pinned: false,
    icon: "⚠", color: "#ef4444", bg: "#fef2f2", border: "#fecaca",
  },
  {
    id: 8,  type: "system",     title: "Shift Schedule Updated",
    message: "Your shift for March 14 has been updated to 7:00 AM – 3:00 PM. Please confirm with your supervisor if you have any concerns.",
    time: "Yesterday",   date: "2026-03-12", read: true,  pinned: false,
    icon: "📅", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
  },
  {
    id: 9,  type: "recipe",     title: "New Recipe Added — Tiramisu",
    message: "Admin has added Tiramisu to the recipe list. It is currently in Draft status. Review ingredients and instructions to prepare for future service.",
    time: "Yesterday",   date: "2026-03-12", read: true,  pinned: false,
    icon: "✦", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
  },
  {
    id: 10, type: "task",       title: "Checklist Reminder — End of Day",
    message: "Don't forget to complete the daily inventory checklist and submit your end-of-day activity summary before your shift ends at 6:00 PM.",
    time: "Yesterday",   date: "2026-03-12", read: true,  pinned: false,
    icon: "📋", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc",
  },
  {
    id: 11, type: "expiry",     title: "Expiry Alert — Ground Beef",
    message: "Ground Beef (8kg in Freezer A) expires March 15. Coordinate with the kitchen team to prioritize usage in today's or tomorrow's meal prep.",
    time: "2 days ago",  date: "2026-03-11", read: true,  pinned: false,
    icon: "⏱", color: "#d97706", bg: "#fffbeb", border: "#fde68a",
  },
  {
    id: 12, type: "system",     title: "System Maintenance Completed",
    message: "SmartStock system maintenance was completed successfully. All data has been synced and features are fully operational.",
    time: "2 days ago",  date: "2026-03-11", read: true,  pinned: false,
    icon: "⚙", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb",
  },
];

const TYPE_OPTIONS = [
  { value: "all",       label: "All Types"   },
  { value: "low-stock", label: "Low Stock"   },
  { value: "expiry",    label: "Expiry"      },
  { value: "recipe",    label: "Recipe"      },
  { value: "task",      label: "Task"        },
  { value: "system",    label: "System"      },
];

const TYPE_META = {
  "low-stock": { label: "Low Stock", color: "#ef4444", bg: "#fef2f2" },
  "expiry":    { label: "Expiry",    color: "#d97706", bg: "#fffbeb" },
  "recipe":    { label: "Recipe",    color: "#7c3aed", bg: "#f5f3ff" },
  "task":      { label: "Task",      color: "#0891b2", bg: "#ecfeff" },
  "system":    { label: "System",    color: "#2563eb", bg: "#eff6ff" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StaffNotifications = () => {
  const [notifs,      setNotifs]      = useState(INITIAL_NOTIFICATIONS);
  const [filterType,  setFilterType]  = useState("all");
  const [filterRead,  setFilterRead]  = useState("all"); // all | unread | read
  const [search,      setSearch]      = useState("");
  const [expandedId,  setExpandedId]  = useState(null);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Derived ──
  const unreadCount  = notifs.filter(n => !n.read).length;
  const pinnedCount  = notifs.filter(n => n.pinned).length;

  // ── Filtered + sorted ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notifs
      .filter(n => {
        const matchType   = filterType === "all" || n.type === filterType;
        const matchRead   = filterRead === "all" || (filterRead === "unread" ? !n.read : n.read);
        const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
        return matchType && matchRead && matchSearch;
      })
      .sort((a, b) => {
        // Pinned first, then unread, then by id (newest first)
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.read   !== b.read)   return a.read   ?  1 : -1;
        return b.id - a.id;
      });
  }, [notifs, filterType, filterRead, search]);

  // ── Handlers ──
  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read", "success");
  };

  const deleteNotif = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
    showToast("Notification removed", "neutral");
  };

  const togglePin = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const clearAll = () => {
    setNotifs(prev => prev.filter(n => n.pinned)); // keep pinned
    showToast("Cleared all non-pinned notifications", "neutral");
  };

  const handleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
    markRead(id);
  };

  // ── Group by date ──
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(n => {
      const key = n.date === "2026-03-13" ? "Today"
                : n.date === "2026-03-12" ? "Yesterday"
                : "Earlier";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [filtered]);

  const groupOrder = ["Today", "Yesterday", "Earlier"];

  // ── Type breakdown for sidebar ──
  const typeBreakdown = TYPE_OPTIONS.slice(1).map(t => ({
    ...t,
    count: notifs.filter(n => n.type === t.value).length,
    unread: notifs.filter(n => n.type === t.value && !n.read).length,
    meta: TYPE_META[t.value],
  }));

  return (
    <div className="sno-page">

      {/* Toast */}
      {toast && (
        <div className={`sno-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "↺"} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="sno-page-header">
        <div className="sno-title-wrap">
          <div className="sno-page-icon">🔔</div>
          <div>
            <h1 className="sno-page-title">Notifications</h1>
            <p className="sno-page-sub">Stay updated on alerts, recipe changes, tasks, and system messages</p>
          </div>
        </div>
        <div className="sno-header-actions">
          {unreadCount > 0 && (
            <button className="sno-mark-all-btn" onClick={markAllRead}>
              ✓ Mark all as read
            </button>
          )}
          <button className="sno-clear-btn" onClick={clearAll}>
            🗑 Clear read
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sno-stats-row">
        <div className="sno-stat-card" onClick={() => setFilterRead("all")} style={{ cursor: "pointer" }}>
          <div className="sno-stat-icon blue">🔔</div>
          <div>
            <div className="sno-stat-value">{notifs.length}</div>
            <div className="sno-stat-label">Total</div>
            <div className="sno-stat-sub">All notifications</div>
          </div>
        </div>
        <div className="sno-stat-card" onClick={() => setFilterRead("unread")} style={{ cursor: "pointer" }}>
          <div className="sno-stat-icon red">🔴</div>
          <div>
            <div className="sno-stat-value" style={{ color: unreadCount > 0 ? "#dc2626" : "#0f172a" }}>{unreadCount}</div>
            <div className="sno-stat-label">Unread</div>
            <div className="sno-stat-sub">Need attention</div>
          </div>
        </div>
        <div className="sno-stat-card" onClick={() => setFilterType("low-stock")} style={{ cursor: "pointer" }}>
          <div className="sno-stat-icon orange">⚠</div>
          <div>
            <div className="sno-stat-value" style={{ color: "#d97706" }}>
              {notifs.filter(n => n.type === "low-stock" || n.type === "expiry").length}
            </div>
            <div className="sno-stat-label">Stock & Expiry</div>
            <div className="sno-stat-sub">Inventory alerts</div>
          </div>
        </div>
        <div className="sno-stat-card">
          <div className="sno-stat-icon green">📌</div>
          <div>
            <div className="sno-stat-value">{pinnedCount}</div>
            <div className="sno-stat-label">Pinned</div>
            <div className="sno-stat-sub">Important alerts</div>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="sno-layout">

        {/* Sidebar */}
        <aside className="sno-sidebar">

          {/* Filter by type */}
          <div className="sno-side-card">
            <div className="sno-side-title">📂 Filter by Type</div>
            <div className="sno-type-list">
              <div
                className={`sno-type-row${filterType === "all" ? " active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                <span className="sno-type-name">All Notifications</span>
                <span className="sno-type-count">{notifs.length}</span>
              </div>
              {typeBreakdown.map(t => (
                <div
                  key={t.value}
                  className={`sno-type-row${filterType === t.value ? " active" : ""}`}
                  onClick={() => setFilterType(t.value)}
                >
                  <span className="sno-type-dot" style={{ background: t.meta.color }} />
                  <span className="sno-type-name">{t.label}</span>
                  <div className="sno-type-counts">
                    {t.unread > 0 && <span className="sno-unread-pill">{t.unread}</span>}
                    <span className="sno-type-count">{t.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter by status */}
          <div className="sno-side-card">
            <div className="sno-side-title">👁 Read Status</div>
            <div className="sno-status-list">
              {[
                { value: "all",    label: "All",    count: notifs.length },
                { value: "unread", label: "Unread", count: notifs.filter(n => !n.read).length },
                { value: "read",   label: "Read",   count: notifs.filter(n => n.read).length  },
              ].map(s => (
                <button
                  key={s.value}
                  className={`sno-status-btn${filterRead === s.value ? " active" : ""}`}
                  onClick={() => setFilterRead(s.value)}
                >
                  {s.label}
                  <span className="sno-status-count">{s.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pinned quick view */}
          {notifs.filter(n => n.pinned).length > 0 && (
            <div className="sno-side-card">
              <div className="sno-side-title">📌 Pinned</div>
              <div className="sno-pinned-list">
                {notifs.filter(n => n.pinned).map(n => (
                  <div
                    key={n.id}
                    className="sno-pinned-item"
                    style={{ borderLeft: `3px solid ${n.color}` }}
                    onClick={() => handleExpand(n.id)}
                  >
                    <div className="sno-pinned-title">{n.title}</div>
                    <div className="sno-pinned-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main panel */}
        <div className="sno-main-panel">

          {/* Toolbar */}
          <div className="sno-toolbar">
            <div className="sno-search-wrap">
              <span className="sno-search-icon">🔍</span>
              <input
                className="sno-search-input"
                placeholder="Search notifications..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="sno-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="sno-results-meta">
              {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Notification list grouped by date */}
          {filtered.length === 0 ? (
            <div className="sno-empty">
              <div className="sno-empty-icon">🎉</div>
              <div className="sno-empty-title">You're all caught up!</div>
              <div className="sno-empty-sub">No notifications match your filters.</div>
            </div>
          ) : (
            <div className="sno-feed">
              {groupOrder.map(group => {
                const items = grouped[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} className="sno-group">
                    <div className="sno-group-label">{group}</div>
                    <div className="sno-group-items">
                      {items.map(notif => {
                        const isExpanded = expandedId === notif.id;
                        const tm = TYPE_META[notif.type] || {};
                        return (
                          <div
                            key={notif.id}
                            className={`sno-notif-card${!notif.read ? " unread" : ""}${notif.pinned ? " pinned" : ""}${isExpanded ? " expanded" : ""}`}
                            style={{ borderLeft: `3px solid ${notif.color}` }}
                          >
                            {/* Main row */}
                            <div className="sno-notif-row" onClick={() => handleExpand(notif.id)}>
                              <div className="sno-notif-icon-wrap" style={{ background: notif.bg }}>
                                <span style={{ color: notif.color }}>{notif.icon}</span>
                              </div>
                              <div className="sno-notif-body">
                                <div className="sno-notif-title-row">
                                  <span className="sno-notif-title">{notif.title}</span>
                                  <div className="sno-notif-meta">
                                    {notif.pinned && <span className="sno-pin-icon">📌</span>}
                                    {!notif.read  && <span className="sno-unread-dot" />}
                                    <span className="sno-notif-time">{notif.time}</span>
                                  </div>
                                </div>
                                <div className="sno-notif-preview">
                                  {isExpanded ? notif.message : `${notif.message.slice(0, 90)}${notif.message.length > 90 ? "…" : ""}`}
                                </div>
                                <div className="sno-notif-chips">
                                  <span className="sno-type-chip" style={{ background: tm.bg, color: tm.color }}>
                                    {tm.label}
                                  </span>
                                  {isExpanded && (
                                    <span className="sno-collapse-hint">Click to collapse ▲</span>
                                  )}
                                  {!isExpanded && notif.message.length > 90 && (
                                    <span className="sno-expand-hint">Read more ▼</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded actions */}
                            {isExpanded && (
                              <div className="sno-notif-actions">
                                <button
                                  className="sno-action-btn pin"
                                  onClick={e => { e.stopPropagation(); togglePin(notif.id); }}
                                >
                                  {notif.pinned ? "📌 Unpin" : "📌 Pin"}
                                </button>
                                {!notif.read && (
                                  <button
                                    className="sno-action-btn read"
                                    onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                                  >
                                    ✓ Mark Read
                                  </button>
                                )}
                                <button
                                  className="sno-action-btn delete"
                                  onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                                >
                                  🗑 Remove
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffNotifications;