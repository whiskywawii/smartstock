import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./StaffDashboard.css";
import StaffInventoryTasks from "./InventoryTasks";
import StaffRecipeExecution from "./RecipeExecution";
import StaffExpiryChecks from "./ExpiryChecks";
import StaffNotifications from "./Notifications";
import StaffProfileShift from "./ProfileShift";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_TASKS = [
  { id: 1, title: "Morning Inventory Check", desc: "Verify all incoming shipments and update quantities", priority: "High",   due: "08:00 AM", done: false },
  { id: 2, title: "Prep Daily Recipes",       desc: "Prepare ingredients for lunch service recipes",      priority: "High",   due: "09:00 AM", done: false },
  { id: 3, title: "Receiving Items",          desc: "Receive and log new stock delivery",                 priority: "Medium", due: "02:00 PM", done: false },
  { id: 4, title: "Expiry Date Checks",       desc: "Check for items nearing expiration",                 priority: "Medium", due: "04:00 PM", done: false  },
];

const DUTIES = [
  { icon: "◫",  title: "Stock Monitoring",   time: "All Day"  },
  { icon: "✦",  title: "Recipe Prep",        time: "07:00 AM" },
  { icon: "📦", title: "Delivery Receiving", time: "02:00 PM" },
  { icon: "📋", title: "End-of-Day Report",  time: "06:00 PM" },
];

const ALERTS = [
  { id: 1, type: "low-stock", icon: "⚠", title: "Low Stock Alert",   message: "Tomatoes inventory is below reorder level",        time: "15 mins ago", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  { id: 2, type: "expiry",    icon: "⏱", title: "Expiring Soon",     message: "Milk expires in 2 days — use in priority",         time: "1 hour ago",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { id: 3, type: "policy",    icon: "ℹ", title: "New Policy Update", message: "Check system settings for new safety guidelines",  time: "3 hours ago", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { id: 4, type: "recipe",    icon: "⏱", title: "Recipe Change",     message: "Pasta Carbonara recipe has been updated by admin", time: "5 hours ago", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
];

const PRIORITY_META = {
  High:   { bg: "#fef2f2", color: "#dc2626" },
  Medium: { bg: "#fffbeb", color: "#d97706" },
  Low:    { bg: "#f0fdf4", color: "#16a34a" },
};

const NAV_ITEMS = [
  { id: "dashboard", icon: "⊞",  label: "My Dashboard"    },
  { id: "inventory", icon: "◫",  label: "Inventory Tasks"  },
  { id: "recipes",   icon: "✦",  label: "Recipe Execution" },
  { id: "expiry",    icon: "⏱",  label: "Expiry Checks"    },
  { id: "notifs",    icon: "🔔", label: "Notifications"    },
  { id: "profile",   icon: "👤", label: "Profile & Shift"  },
];

const UNREAD_NOTIFS = 3;

// ─── Coming Soon ──────────────────────────────────────────────────────────────

const ComingSoon = ({ label }) => (
  <div className="sd-coming-soon">
    <div className="sd-cs-icon">🚧</div>
    <h2 className="sd-cs-title">{label}</h2>
    <p className="sd-cs-sub">This section is coming soon. Check back later!</p>
  </div>
);

// ─── Dashboard Home ───────────────────────────────────────────────────────────

const DashboardHome = ({ tasks, setTasks }) => {
  const completed    = tasks.filter(t => t.done).length;
  const activeAlerts = ALERTS.filter(a => a.type === "low-stock" || a.type === "expiry").length;
  const pct          = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <div className="sd-page-content">

      {/* ── Stat Cards ── */}
      <div className="sd-stats-row">
        <div className="sd-stat-card">
          <div className="sd-stat-icon-wrap blue">◫</div>
          <div className="sd-stat-value">{tasks.length}</div>
          <div className="sd-stat-label">Today's Tasks</div>
          <div className="sd-stat-sub">{completed} completed</div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-wrap green">📋</div>
          <div className="sd-stat-value">{DUTIES.length}</div>
          <div className="sd-stat-label">Assigned Duties</div>
          <div className="sd-stat-sub">Different duty types</div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-wrap red">⚠</div>
          <div className="sd-stat-value" style={{ color: "#dc2626" }}>{activeAlerts}</div>
          <div className="sd-stat-label">Active Alerts</div>
          <div className="sd-stat-sub">Critical alerts</div>
        </div>
        <div className="sd-stat-card">
          <div className="sd-stat-icon-wrap green">●</div>
          <div className="sd-stat-value" style={{ color: "#16a34a", fontSize: 26 }}>Active</div>
          <div className="sd-stat-label">Shift Status</div>
          <div className="sd-stat-sub sd-working">Working now</div>
        </div>
      </div>

      {/* ── Two Column Grid ── */}
      <div className="sd-main-grid">

        {/* Today's Tasks */}
        <div className="sd-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Today's Tasks</h3>
            <span className="sd-tasks-counter">{completed}/{tasks.length}</span>
          </div>

          <div className="sd-progress-row">
            <div className="sd-progress-track">
              <div className="sd-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="sd-progress-pct">{pct}%</span>
          </div>

          <div className="sd-task-list">
            {tasks.map(task => {
              const pm = PRIORITY_META[task.priority];
              return (
                <div key={task.id} className={`sd-task-row${task.done ? " done" : ""}`}>
                  <button
                    className={`sd-task-check${task.done ? " checked" : ""}`}
                    onClick={() => toggle(task.id)}
                  >
                    {task.done && "✓"}
                  </button>
                  <div className="sd-task-body">
                    <div className="sd-task-name">{task.title}</div>
                    <div className="sd-task-desc">{task.desc}</div>
                    <div className="sd-task-meta">
                      <span className="sd-priority-chip" style={{ background: pm.bg, color: pm.color }}>
                        {task.priority}
                      </span>
                      <span className="sd-task-due">⏰ Due: {task.due}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Alerts */}
        <div className="sd-card">
          <div className="sd-card-header">
            <h3 className="sd-card-title">Staff Alerts</h3>
            <span className="sd-alert-badge">{ALERTS.length}</span>
          </div>
          <div className="sd-alert-list">
            {ALERTS.map(alert => (
              <div
                key={alert.id}
                className="sd-alert-item"
                style={{ background: alert.bg, border: `1px solid ${alert.border}` }}
              >
                <div className="sd-alert-icon" style={{ color: alert.color }}>{alert.icon}</div>
                <div className="sd-alert-body">
                  <div className="sd-alert-title" style={{ color: alert.color }}>{alert.title}</div>
                  <div className="sd-alert-msg">{alert.message}</div>
                  <div className="sd-alert-time">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Main Shell ───────────────────────────────────────────────────────────────

const StaffDashboard = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [tasks, setTasks]         = useState(INITIAL_TASKS);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const PAGE_TITLES = {
    dashboard: "Staff Dashboard",
    inventory: "Inventory Tasks",
    recipes:   "Recipe Execution",
    expiry:    "Expiry Checks",
    notifs:    "Notifications",
    profile:   "Profile & Shift",
  };

  const renderPage = () => {
    switch (activeNav) {
      case "dashboard": return <DashboardHome tasks={tasks} setTasks={setTasks} />;
      case "inventory": return <StaffInventoryTasks />;
      case "recipes":   return <StaffRecipeExecution />;
      case "expiry":    return <StaffExpiryChecks />;
      case "notifs":    return <StaffNotifications />;
      case "profile":   return <StaffProfileShift />;
      default:          return <ComingSoon label={PAGE_TITLES[activeNav]} />;
    }
  };

  return (
    <div className="sd-wrapper">

      {/* ── Sidebar ── */}
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <div className="sd-brand-logo">S</div>
          <div>
            <div className="sd-brand-name">SmartStock</div>
            <div className="sd-brand-sub">Staff Portal</div>
          </div>
          <button className="sd-brand-close">✕</button>
        </div>

        <nav className="sd-nav">
          {NAV_ITEMS.map(item => {
            const badge = item.id === "notifs" ? UNREAD_NOTIFS : 0;
            return (
              <button
                key={item.id}
                className={`sd-nav-item${activeNav === item.id ? " active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="sd-nav-icon">{item.icon}</span>
                <span className="sd-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-user-row">
            <div className="sd-user-avatar">ST</div>
            <div>
              <div className="sd-user-name">staff</div>
              <div className="sd-user-shift">On Shift</div>
            </div>
          </div>
          <button className="sd-logout-btn" onClick={() => setShowLogoutModal(true)}>⎋ Logout</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="sd-main">
        <header className="sd-topbar">
          <h1 className="sd-topbar-title">{PAGE_TITLES[activeNav]}</h1>
          <div className="sd-topbar-right">
            <button className="sd-notif-btn" onClick={() => setActiveNav("notifs")}>
              🔔
            </button>
            <div className="sd-topbar-avatar">ST</div>
          </div>
        </header>

        <div className="sd-content">
          {renderPage()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Logout</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-logout" onClick={() => { setShowLogoutModal(false); navigate('/'); }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;