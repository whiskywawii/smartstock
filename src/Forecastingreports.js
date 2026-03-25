import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import "./Forecastingreports.css";

// ─── Static Data ──────────────────────────────────────────────────────────────

const WEEKLY_FORECAST = [
  { week: "W1 Feb", actual: 112, forecast: 108 },
  { week: "W2 Feb", actual: 128, forecast: 122 },
  { week: "W3 Feb", actual: 105, forecast: 110 },
  { week: "W4 Feb", actual: 134, forecast: 130 },
  { week: "W1 Mar", actual: 119, forecast: 121 },
  { week: "W2 Mar", actual: 141, forecast: 138 },
  { week: "W3 Mar", actual: null, forecast: 145 },
  { week: "W4 Mar", actual: null, forecast: 152 },
];

const WASTE_TREND = [
  { month: "Oct", waste: 18, saved: 5 },
  { month: "Nov", waste: 15, saved: 8 },
  { month: "Dec", waste: 20, saved: 6 },
  { month: "Jan", waste: 12, saved: 11 },
  { month: "Feb", waste: 9,  saved: 14 },
  { month: "Mar", waste: 7,  saved: 16 },
];

const TOP_CONSUMED = [
  { name: "Tomatoes",       category: "Fresh Produce", weeklyUse: 48, monthlyUse: 192, trend: "up",   change: "+12%" },
  { name: "Chicken Breast", category: "Proteins",      weeklyUse: 36, monthlyUse: 144, trend: "up",   change: "+8%"  },
  { name: "Whole Milk",     category: "Dairy",         weeklyUse: 30, monthlyUse: 120, trend: "down", change: "-3%"  },
  { name: "Olive Oil",      category: "Pantry",        weeklyUse: 22, monthlyUse: 88,  trend: "up",   change: "+5%"  },
  { name: "Spinach",        category: "Fresh Produce", weeklyUse: 20, monthlyUse: 80,  trend: "up",   change: "+18%" },
  { name: "Eggs",           category: "Proteins",      weeklyUse: 18, monthlyUse: 72,  trend: "stable", change: "0%" },
  { name: "Cheddar Cheese", category: "Dairy",         weeklyUse: 15, monthlyUse: 60,  trend: "down", change: "-5%"  },
  { name: "Rice",           category: "Pantry",        weeklyUse: 14, monthlyUse: 56,  trend: "up",   change: "+2%"  },
];

const RUNOUT_ITEMS = [
  { name: "Tomatoes",    currentStock: 5,  dailyUse: 6.8, daysLeft: 0.7, category: "Fresh Produce", urgency: "critical",  reorderQty: 50 },
  { name: "Spinach",     currentStock: 0,  dailyUse: 2.9, daysLeft: 0,   category: "Fresh Produce", urgency: "out",       reorderQty: 30 },
  { name: "Whole Milk",  currentStock: 8,  dailyUse: 4.3, daysLeft: 1.9, category: "Dairy",         urgency: "critical",  reorderQty: 40 },
  { name: "Greek Yogurt",currentStock: 3,  dailyUse: 1.5, daysLeft: 2.0, category: "Dairy",         urgency: "critical",  reorderQty: 20 },
  { name: "Bell Peppers",currentStock: 18, dailyUse: 5.2, daysLeft: 3.5, category: "Fresh Produce", urgency: "warning",   reorderQty: 40 },
  { name: "Salmon Fillet",currentStock:14, dailyUse: 3.8, daysLeft: 3.7, category: "Proteins",      urgency: "warning",   reorderQty: 25 },
  { name: "Eggs",        currentStock: 24, dailyUse: 5.5, daysLeft: 4.4, category: "Proteins",      urgency: "warning",   reorderQty: 60 },
  { name: "Sourdough",   currentStock: 10, dailyUse: 2.0, daysLeft: 5.0, category: "Pantry",        urgency: "watch",     reorderQty: 20 },
];

const INVENTORY_TURNS = [
  { month: "Oct", turns: 3.2 },
  { month: "Nov", turns: 3.5 },
  { month: "Dec", turns: 2.8 },
  { month: "Jan", turns: 3.9 },
  { month: "Feb", turns: 4.1 },
  { month: "Mar", turns: 4.4 },
];

const REPORT_TYPES = [
  { id: "inventory",   icon: "◫", label: "Inventory Summary",     desc: "Stock levels, categories, and valuation" },
  { id: "waste",       icon: "♻", label: "Waste Reduction Report", desc: "Waste trends and savings analysis" },
  { id: "consumption", icon: "📊", label: "Consumption Analysis",  desc: "Top items and usage patterns" },
  { id: "forecast",    icon: "↗", label: "Forecast Report",        desc: "AI predictions for next 4 weeks" },
  { id: "expiry",      icon: "⚠", label: "Expiry Alert Report",    desc: "Items expiring within 7 days" },
];

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 3 months", "Last 6 months", "Custom"];

const CATEGORY_META = {
  "Fresh Produce": { color: "#4ade80", bg: "#f0fdf4" },
  "Proteins":      { color: "#fb923c", bg: "#fff7ed" },
  "Dairy":         { color: "#60a5fa", bg: "#eff6ff" },
  "Pantry":        { color: "#c084fc", bg: "#faf5ff" },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="fr-tooltip">
      <p className="fr-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "3px 0 0", fontSize: 12, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Urgency Config ───────────────────────────────────────────────────────────

const URGENCY = {
  out:      { label: "Out of Stock", bg: "#fef2f2", color: "#dc2626", bar: "#ef4444", border: "#fecaca" },
  critical: { label: "Critical",     bg: "#fff7ed", color: "#ea580c", bar: "#f97316", border: "#fed7aa" },
  warning:  { label: "Warning",      bg: "#fefce8", color: "#ca8a04", bar: "#eab308", border: "#fef08a" },
  watch:    { label: "Watch",        bg: "#f0fdf4", color: "#16a34a", bar: "#22c55e", border: "#bbf7d0" },
};

// ─── Generate Report Modal ────────────────────────────────────────────────────

const GenerateReportModal = ({ onClose }) => {
  const [selected, setSelected] = useState("inventory");
  const [range, setRange]       = useState("Last 30 days");
  const [format, setFormat]     = useState("PDF");
  const [generating, setGenerating] = useState(false);
  const [done, setDone]         = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setDone(true); }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="fr-modal" onClick={e => e.stopPropagation()}>
        <div className="fr-modal-header">
          <div>
            <h2 className="fr-modal-title">Generate Report</h2>
            <p className="fr-modal-sub">Choose a report type, date range, and format</p>
          </div>
          <button className="fr-modal-close" onClick={onClose}>✕</button>
        </div>

        {!done ? (
          <div className="fr-modal-body">
            {/* Report type */}
            <div className="fr-section-label">Report Type</div>
            <div className="report-type-grid">
              {REPORT_TYPES.map(r => (
                <button
                  key={r.id}
                  className={`report-type-btn${selected === r.id ? " active" : ""}`}
                  onClick={() => setSelected(r.id)}
                >
                  <span className="rt-icon">{r.icon}</span>
                  <div>
                    <div className="rt-label">{r.label}</div>
                    <div className="rt-desc">{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Range + Format */}
            <div className="fr-form-row">
              <div className="fr-form-grp">
                <label>Date Range</label>
                <select value={range} onChange={e => setRange(e.target.value)}>
                  {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="fr-form-grp">
                <label>Export Format</label>
                <select value={format} onChange={e => setFormat(e.target.value)}>
                  {["PDF", "CSV", "Excel"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="fr-modal-body done-body">
            <div className="done-icon">✅</div>
            <h3 className="done-title">Report Generated!</h3>
            <p className="done-sub">
              Your <strong>{REPORT_TYPES.find(r => r.id === selected)?.label}</strong> has been
              generated as a <strong>{format}</strong> file for <strong>{range}</strong>.
            </p>
            <button className="btn-download">⬇ Download Report</button>
          </div>
        )}

        <div className="fr-modal-footer">
          <button className="btn-cancel-fr" onClick={onClose}>{done ? "Close" : "Cancel"}</button>
          {!done && (
            <button className="btn-generate" onClick={handleGenerate} disabled={generating}>
              {generating ? <span className="spinner" /> : "⚡ Generate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ForecastingReports = () => {
  const [activeTab, setActiveTab]   = useState("overview");
  const [showModal, setShowModal]   = useState(false);
  const [filterUrgency, setFilterUrgency] = useState("all");

  const forecastAccuracy = 94.2;
  const wasteReduction   = 38;
  const inventoryTurnRate = 4.4;

  const filteredRunout = useMemo(() =>
    filterUrgency === "all"
      ? RUNOUT_ITEMS
      : RUNOUT_ITEMS.filter(i => i.urgency === filterUrgency),
    [filterUrgency]
  );

  const maxMonthly = Math.max(...TOP_CONSUMED.map(i => i.monthlyUse));

  return (
    <main className="main-content fr-page">

      {/* ── Page Header ── */}
      <div className="fr-page-header">
        <div className="fr-page-title-wrap">
          <div className="fr-page-icon">↗</div>
          <div>
            <h1 className="fr-page-title">Forecasting &amp; Reports</h1>
            <p className="fr-page-sub">AI-powered predictions, waste insights, and custom report generation</p>
          </div>
        </div>
        <button className="btn-gen-report" onClick={() => setShowModal(true)}>
          ⚡ Generate Report
        </button>
      </div>

      {/* ── AI Metric Cards ── */}
      <div className="fr-kpi-row">
        {/* Forecast Accuracy */}
        <div className="fr-kpi-card accuracy">
          <div className="kpi-top">
            <div className="kpi-icon-wrap accuracy-icon">🤖</div>
            <span className="kpi-badge green">AI Powered</span>
          </div>
          <div className="kpi-value">{forecastAccuracy}%</div>
          <div className="kpi-label">Forecast Accuracy</div>
          <div className="kpi-sub">↑ 2.1% vs last month</div>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: `${forecastAccuracy}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }} />
          </div>
        </div>

        {/* Waste Reduction */}
        <div className="fr-kpi-card waste">
          <div className="kpi-top">
            <div className="kpi-icon-wrap waste-icon">♻</div>
            <span className="kpi-badge orange">This Month</span>
          </div>
          <div className="kpi-value">{wasteReduction}%</div>
          <div className="kpi-label">Waste Reduction</div>
          <div className="kpi-sub">↑ 6% vs last month</div>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: `${wasteReduction}%`, background: "linear-gradient(90deg,#f97316,#fb923c)" }} />
          </div>
        </div>

        {/* Inventory Turns */}
        <div className="fr-kpi-card turns">
          <div className="kpi-top">
            <div className="kpi-icon-wrap turns-icon">🔄</div>
            <span className="kpi-badge blue">Monthly Rate</span>
          </div>
          <div className="kpi-value">{inventoryTurnRate}x</div>
          <div className="kpi-label">Inventory Turns</div>
          <div className="kpi-sub">↑ 0.3x vs last month</div>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: `${(inventoryTurnRate / 6) * 100}%`, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
          </div>
        </div>

        {/* Items to Reorder */}
        <div className="fr-kpi-card reorder">
          <div className="kpi-top">
            <div className="kpi-icon-wrap reorder-icon">⚠</div>
            <span className="kpi-badge red">Action Needed</span>
          </div>
          <div className="kpi-value">{RUNOUT_ITEMS.filter(i => i.urgency === "critical" || i.urgency === "out").length}</div>
          <div className="kpi-label">Items to Reorder</div>
          <div className="kpi-sub">{RUNOUT_ITEMS.filter(i => i.urgency === "out").length} out of stock now</div>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: "40%", background: "linear-gradient(90deg,#ef4444,#f87171)" }} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="fr-tabs">
        {[
          { id: "overview",     label: "📊 Overview" },
          { id: "forecast",     label: "🤖 AI Forecast" },
          { id: "consumption",  label: "🔥 Top Consumed" },
          { id: "runout",       label: "⚠ Runout Predictions" },
        ].map(t => (
          <button
            key={t.id}
            className={`fr-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          TAB: OVERVIEW
      ═══════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="tab-section">
          <div className="fr-two-col">

            {/* Waste Trend */}
            <div className="fr-card">
              <div className="fr-card-header">
                <h3 className="fr-card-title">♻ Waste vs Savings Trend</h3>
                <span className="fr-card-badge green">-38% waste</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={WASTE_TREND}>
                  <defs>
                    <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend wrapperStyle={{ fontSize: 12 }}/>
                  <Area type="monotone" dataKey="waste" name="Waste (kg)" stroke="#ef4444" strokeWidth={2} fill="url(#wasteGrad)"/>
                  <Area type="monotone" dataKey="saved" name="Saved (kg)" stroke="#22c55e" strokeWidth={2} fill="url(#savedGrad)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Inventory Turns */}
            <div className="fr-card">
              <div className="fr-card-header">
                <h3 className="fr-card-title">🔄 Inventory Turn Rate</h3>
                <span className="fr-card-badge blue">Target: 4.0x</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={INVENTORY_TURNS} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0, 6]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <ReferenceLine y={4.0} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1.5}/>
                  <Bar dataKey="turns" name="Turns" radius={[5, 5, 0, 0]}
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick summary cards */}
          <div className="fr-summary-row">
            {[
              { icon: "💰", label: "Estimated Savings This Month", value: "₱ 12,450", sub: "From waste reduction", color: "#22c55e" },
              { icon: "📦", label: "Stock Accuracy",               value: "97.3%",    sub: "Physical vs system count", color: "#3b82f6" },
              { icon: "⏱",  label: "Avg Days to Reorder",          value: "1.8 days", sub: "Based on current trends", color: "#f97316" },
              { icon: "🎯", label: "Forecast Confidence",           value: "High",     sub: "Based on 6-week history", color: "#22c55e" },
            ].map((s, i) => (
              <div className="fr-summary-card" key={i}>
                <div className="summary-icon" style={{ color: s.color }}>{s.icon}</div>
                <div className="summary-label">{s.label}</div>
                <div className="summary-value" style={{ color: s.color }}>{s.value}</div>
                <div className="summary-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: AI FORECAST
      ═══════════════════════════════════════ */}
      {activeTab === "forecast" && (
        <div className="tab-section">
          <div className="fr-card forecast-card">
            <div className="fr-card-header">
              <div>
                <h3 className="fr-card-title">🤖 AI Consumption Forecast — Actual vs Predicted</h3>
                <p className="fr-card-sub">Dashed area = future AI prediction. Model accuracy: {forecastAccuracy}%</p>
              </div>
              <span className="fr-card-badge green">Live Model</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={WEEKLY_FORECAST}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                <YAxis domain={[80, 170]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Legend wrapperStyle={{ fontSize: 12 }}/>
                <ReferenceLine x="W3 Mar" stroke="#e5e7eb" strokeDasharray="4 4" label={{ value: "Today", fill: "#9ca3af", fontSize: 11 }}/>
                <Line type="monotone" dataKey="actual"   name="Actual Usage"    stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e" }} connectNulls={false}/>
                <Line type="monotone" dataKey="forecast" name="AI Forecast"     stroke="#22c55e" strokeWidth={2}   strokeDasharray="6 3" dot={{ r: 3, fill: "#22c55e" }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accuracy breakdown */}
          <div className="fr-three-col">
            {[
              { label: "Fresh Produce", accuracy: 91, icon: "🥬", color: "#22c55e" },
              { label: "Proteins",      accuracy: 96, icon: "🍗", color: "#f97316" },
              { label: "Dairy",         accuracy: 93, icon: "🥛", color: "#3b82f6" },
              { label: "Pantry",        accuracy: 97, icon: "🛒", color: "#c084fc" },
            ].map((c, i) => (
              <div className="fr-card acc-card" key={i}>
                <div className="acc-top">
                  <span className="acc-emoji">{c.icon}</span>
                  <span className="acc-label">{c.label}</span>
                </div>
                <div className="acc-value" style={{ color: c.color }}>{c.accuracy}%</div>
                <div className="acc-bar-track">
                  <div className="acc-bar-fill" style={{ width: `${c.accuracy}%`, background: c.color }} />
                </div>
                <div className="acc-sub">Model accuracy</div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="fr-card">
            <h3 className="fr-card-title">💡 AI Insights &amp; Recommendations</h3>
            <div className="insights-grid">
              {[
                { icon: "📈", color: "#22c55e", bg: "#f0fdf4", title: "Demand Spike Expected", body: "Tomatoes and Spinach demand predicted to rise 15–20% next week based on seasonal and recipe usage patterns." },
                { icon: "⚠",  color: "#ea580c", bg: "#fff7ed", title: "Reorder Alert",          body: "Milk and Greek Yogurt should be reordered within 24 hours to avoid stockout based on current consumption rate." },
                { icon: "💰", color: "#3b82f6", bg: "#eff6ff", title: "Cost Optimization",       body: "Buying Chicken Breast in bulk (2× current qty) could reduce per-unit cost by ~12% based on supplier data." },
                { icon: "♻",  color: "#22c55e", bg: "#f5f3ff", title: "Waste Prevention",        body: "Bell Peppers are approaching expiry. Suggest adding 2 bell-pepper recipes to the active menu this week." },
              ].map((ins, i) => (
                <div className="insight-card" key={i} style={{ borderLeft: `3px solid ${ins.color}`, background: ins.bg }}>
                  <div className="insight-top">
                    <span style={{ fontSize: 18 }}>{ins.icon}</span>
                    <strong style={{ color: ins.color, fontSize: 13 }}>{ins.title}</strong>
                  </div>
                  <p className="insight-body">{ins.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: TOP CONSUMED
      ═══════════════════════════════════════ */}
      {activeTab === "consumption" && (
        <div className="tab-section">
          <div className="fr-two-col">
            {/* Bar chart */}
            <div className="fr-card">
              <div className="fr-card-header">
                <h3 className="fr-card-title">Monthly Consumption by Item</h3>
                <span className="fr-card-badge blue">Last 30 days</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={TOP_CONSUMED} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} axisLine={false} tickLine={false} width={100}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Bar dataKey="monthlyUse" name="Monthly Usage" radius={[0, 4, 4, 0]} fill="#22c55e"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="fr-card">
              <div className="fr-card-header">
                <h3 className="fr-card-title">Top Consumed Items</h3>
                <span className="fr-card-badge green">Live</span>
              </div>
              <div className="consumed-table-wrap">
                <table className="consumed-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item</th>
                      <th>Weekly</th>
                      <th>Monthly</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_CONSUMED.map((item, i) => {
                      const meta = CATEGORY_META[item.category] || { color: "#6b7280", bg: "#f9fafb" };
                      return (
                        <tr key={i}>
                          <td className="rank-cell" style={{ color: i < 3 ? "#f59e0b" : "#9ca3af" }}>#{i + 1}</td>
                          <td>
                            <div className="consumed-name">{item.name}</div>
                            <span className="consumed-cat" style={{ background: meta.bg, color: meta.color }}>{item.category}</span>
                          </td>
                          <td className="num-cell">{item.weeklyUse}</td>
                          <td className="num-cell">
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div className="mini-bar-track">
                                <div className="mini-bar-fill" style={{ width: `${(item.monthlyUse / maxMonthly) * 100}%`, background: meta.color }}/>
                              </div>
                              {item.monthlyUse}
                            </div>
                          </td>
                          <td>
                            <span className={`trend-chip ${item.trend}`}>
                              {item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "—"} {item.change}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TAB: RUNOUT PREDICTIONS
      ═══════════════════════════════════════ */}
      {activeTab === "runout" && (
        <div className="tab-section">
          <div className="runout-toolbar">
            <div className="runout-info">
              <span className="runout-info-icon">🤖</span>
              AI predicts stock runout based on average daily consumption rates. Updated every 6 hours.
            </div>
            <div className="urgency-filters">
              {["all", "out", "critical", "warning", "watch"].map(u => (
                <button
                  key={u}
                  className={`urgency-filter-btn${filterUrgency === u ? " active" : ""}`}
                  style={filterUrgency === u && u !== "all" ? { background: URGENCY[u]?.bg, color: URGENCY[u]?.color, borderColor: URGENCY[u]?.border } : {}}
                  onClick={() => setFilterUrgency(u)}
                >
                  {u === "all" ? "All Items" : URGENCY[u].label}
                </button>
              ))}
            </div>
          </div>

          <div className="runout-grid">
            {filteredRunout.map((item, i) => {
              const urg  = URGENCY[item.urgency];
              const meta = CATEGORY_META[item.category] || { color: "#6b7280", bg: "#f9fafb" };
              const pct  = Math.min(100, (item.currentStock / (item.reorderQty * 0.6)) * 100);
              return (
                <div className="runout-card" key={i} style={{ borderTop: `3px solid ${urg.bar}` }}>
                  <div className="runout-card-head">
                    <div>
                      <div className="runout-item-name">{item.name}</div>
                      <span className="runout-cat-chip" style={{ background: meta.bg, color: meta.color }}>{item.category}</span>
                    </div>
                    <span className="runout-urgency-badge" style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.border}` }}>
                      {urg.label}
                    </span>
                  </div>

                  <div className="runout-days-display" style={{ color: urg.bar }}>
                    {item.daysLeft === 0
                      ? <span className="out-label">OUT</span>
                      : <><span className="days-big">{item.daysLeft.toFixed(1)}</span><span className="days-unit"> days left</span></>
                    }
                  </div>

                  <div className="runout-bar-track">
                    <div className="runout-bar-fill" style={{ width: `${pct}%`, background: urg.bar }} />
                  </div>

                  <div className="runout-details">
                    <div className="runout-detail"><span>Stock</span><strong>{item.currentStock} units</strong></div>
                    <div className="runout-detail"><span>Daily use</span><strong>{item.dailyUse}/day</strong></div>
                    <div className="runout-detail"><span>Reorder qty</span><strong>{item.reorderQty}</strong></div>
                  </div>

                  <button className="runout-reorder-btn" style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.border}` }}>
                    📦 Reorder Now
                  </button>
                </div>
              );
            })}
          </div>

          {filteredRunout.length === 0 && (
            <div className="empty-runout">No items match this filter.</div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && <GenerateReportModal onClose={() => setShowModal(false)} />}
    </main>
  );
};

export default ForecastingReports;