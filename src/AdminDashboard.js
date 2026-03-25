import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import InventoryManagement from "./InventoryManagement";
import RecipeManagement from "./RecipeManagement";
import ForecastingReports from "./Forecastingreports";
import SystemSettings from "./SystemSettings";
import AuditLogs from "./AuditLogs";
import "./AdminDashboard.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const inventoryData = [
  { name: "Fresh Produce", value: 35, color: "#4ade80" },
  { name: "Proteins",      value: 28, color: "#fb923c" },
  { name: "Dairy",         value: 22, color: "#60a5fa" },
  { name: "Pantry",        value: 15, color: "#c084fc" },
];

const navItems = [
  { icon: "⊞", label: "Dashboard Home" },
  { icon: "◫", label: "Inventory Management" },
  { icon: "✦", label: "Recipe Management" },
  { icon: "↗", label: "Forecasting & Reports" },
  { icon: "◎", label: "System Settings" },
  { icon: "☰", label: "Audit Logs" },
];

const stats = [
  { label: "Total Items",    value: "1,247", change: "+12%",           up: true,  color: "blue",   icon: "◫" },
  { label: "Active Recipes", value: "48",    change: "+3 new",         up: true,  color: "orange", icon: "✦" },
  { label: "Expiring Soon",  value: "8",     change: "↓2 items",       up: false, color: "red",    icon: "⚡" },
  { label: "Usage Rate",     value: "78%",   change: "+5% vs last wk", up: true,  color: "green",  icon: "↗" },
];

const alerts = [
  { dot: "red",    title: "Low Stock: Tomatoes", desc: "Only 5 units remaining. Reorder recommended.", time: "2 min ago" },
  { dot: "orange", title: "Expiry Alert: Milk",  desc: "Expiring in 2 days. Consider using in recipes.", time: "15 min ago" },
  { dot: "blue",   title: "System Update",       desc: "New recipe category added: Vegan Options",      time: "1 hr ago" },
];

const recentActivities = [
  { icon: "✦", color: "#f97316", bg: "#fff7ed", title: "Added new recipe",    desc: "Grilled Chicken Salad",          time: "2:30 PM" },
  { icon: "◫", color: "#3b82f6", bg: "#eff6ff", title: "Updated inventory",   desc: "Tomatoes: +50 units",            time: "2:15 PM" },
  { icon: "↗", color: "#22c55e", bg: "#f0fdf4", title: "Generated report",    desc: "Weekly inventory usage",         time: "1:45 PM" },
  { icon: "◎", color: "#c084fc", bg: "#faf5ff", title: "User role change",    desc: "John assigned to Chef role",     time: "12:30 PM" },
  { icon: "⚡", color: "#9ca3af", bg: "#f9fafb", title: "System maintenance", desc: "Database optimization completed", time: "11:00 AM" },
];

const actionBtns = [
  { icon: "+", label: "Add Food Item",    primary: true },
  { icon: "✦", label: "Create Recipe",   primary: false },
  { icon: "↗", label: "Generate Report", primary: false },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-name">{name}</p>
      <p className="chart-tooltip-value" style={{ color }}>{value}%</p>
    </div>
  );
};

// ─── Dashboard Home Page ──────────────────────────────────────────────────────

const DashboardHome = ({ setActiveNav }) => (
  <main className="main-content">
    {/* Header */}
    <div className="content-header">
      <div>
        <div className="header-greeting">Good morning, Admin 👋</div>
        <h1 className="header-title">Dashboard Overview</h1>
      </div>
      <div className="header-actions">
        <button className="date-chip"><span>📅</span> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</button>
        <div className="notif-btn-wrap">
          <button className="notif-btn">🔔</button>
          <div className="notif-badge" />
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="stats-grid">
      {stats.map((s, i) => (
        <div className="stat-card" key={i}>
          <div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? "up" : "down"}`}>
              <span>{s.up ? "▲" : "▼"}</span> {s.change}
            </div>
          </div>
          <div className={`stat-icon-box ${s.color}`}>{s.icon}</div>
        </div>
      ))}
    </div>

    {/* Details grid */}
    <div className="details-grid">
      {/* Alerts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Real-Time Alerts</h3>
          <span className="alerts-badge">3 new</span>
        </div>
        {alerts.map((a, i) => (
          <div className="alert-item" key={i}>
            <div className={`alert-dot ${a.dot}`} />
            <div>
              <div className="alert-title">{a.title}</div>
              <div className="alert-desc">{a.desc}</div>
              <div className="alert-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="card-title">Inventory by Category</h3>
        <p className="chart-subtitle">Live stock distribution</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={inventoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {inventoryData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend-grid">
          {inventoryData.map((d, i) => (
            <div className="legend-item" key={i}>
              <div className="legend-dot" style={{ background: d.color }} />
              <span className="legend-label">{d.name}</span>
              <span className="legend-pct">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 16 }}>Quick Actions</h3>
        {actionBtns.map((btn, i) => (
          <button key={i} className={`action-btn${btn.primary ? " primary" : ""}`} onClick={() => {
            if (btn.label === "Add Food Item") setActiveNav(1);
            else if (btn.label === "Create Recipe") setActiveNav(2);
            else if (btn.label === "Generate Report") setActiveNav(3);
          }}>
            <span className="action-btn-icon">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
        <div className="system-status">
          <div className="system-status-title">🟢 System Healthy</div>
          <div className="system-status-sub">All services running normally</div>
        </div>
      </div>
    </div>

    {/* Recent Activities */}
    <div className="card activities-card">
      <div className="card-header">
        <h3 className="card-title"><span className="activity-title-icon">∿</span> Recent Activities</h3>
        <button className="view-all-btn">View all</button>
      </div>
      {recentActivities.map((a, i) => (
        <div className="activity-item" key={i}>
          <div className="activity-icon-box" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
          <div className="activity-body">
            <div className="activity-title">{a.title}</div>
            <div className="activity-desc">{a.desc}</div>
          </div>
          <div className="activity-time"><span className="time-icon">🕐</span> {a.time}</div>
        </div>
      ))}
    </div>
  </main>
);

// ─── Coming Soon Page ─────────────────────────────────────────────────────────

const ComingSoon = ({ label }) => (
  <main className="main-content">
    <div className="coming-soon-wrap">
      <div className="coming-soon-icon">🚧</div>
      <h2 className="coming-soon-title">{label}</h2>
      <p className="coming-soon-sub">This section is under construction. Check back soon!</p>
    </div>
  </main>
);

// ─── Root Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const renderPage = () => {
    switch (activeNav) {
      case 0: return <DashboardHome setActiveNav={setActiveNav} />;
      case 1: return <InventoryManagement />;
      case 2: return <RecipeManagement />;
      case 3: return <ForecastingReports />;
      case 4: return <SystemSettings />;
      case 5: return <AuditLogs />;
      default: return <ComingSoon label={navItems[activeNav].label} />;
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">◫</div>
          <div>
            <div className="sidebar-brand-name">SmartStock</div>
            <div className="sidebar-brand-sub">Inventory &amp; Recipes</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">MENU</div>
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`nav-btn${activeNav === i ? " active" : ""}`}
              onClick={() => setActiveNav(i)}
            >
              <span className="nav-btn-icon">{item.icon}</span>
              {item.label}
              {activeNav === i && <span className="nav-btn-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">JD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Admin User</div>
              <div className="sidebar-user-status">
                <div className="status-dot" />
                <span className="status-text">Online</span>
              </div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={() => setShowLogoutModal(true)}>
            <span className="logout-icon">⎋</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Page Content ── */}
      {renderPage()}

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
              <button className="btn-logout" onClick={() => { setShowLogoutModal(false); window.location.href = "/"; }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;