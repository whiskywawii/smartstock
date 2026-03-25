import { useState, useMemo } from "react";
import "./InventoryTasks.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_ITEMS = [
  { id: 1,  name: "Tomatoes",       category: "Fresh Produce", qty: 5,  reorder: 20, unit: "kg",  expiry: "2026-03-16", lastUpdated: "Today 08:12 AM",  updatedBy: "Carlos R." },
  { id: 2,  name: "Spinach",        category: "Fresh Produce", qty: 0,  reorder: 15, unit: "kg",  expiry: "2026-03-18", lastUpdated: "Today 07:55 AM",  updatedBy: "Carlos R." },
  { id: 3,  name: "Chicken Breast", category: "Proteins",      qty: 25, reorder: 15, unit: "kg",  expiry: "2026-03-17", lastUpdated: "Today 08:00 AM",  updatedBy: "Ben T."    },
  { id: 4,  name: "Whole Milk",     category: "Dairy",         qty: 8,  reorder: 20, unit: "L",   expiry: "2026-03-14", lastUpdated: "Yesterday",       updatedBy: "Ana L."    },
  { id: 5,  name: "Olive Oil",      category: "Pantry",        qty: 12, reorder: 10, unit: "L",   expiry: "2026-06-01", lastUpdated: "Mar 11",          updatedBy: "Carlos R." },
  { id: 6,  name: "Eggs",           category: "Proteins",      qty: 24, reorder: 30, unit: "pcs", expiry: "2026-03-20", lastUpdated: "Today 07:40 AM",  updatedBy: "Ben T."    },
  { id: 7,  name: "Rice",           category: "Pantry",        qty: 45, reorder: 20, unit: "kg",  expiry: "2026-09-01", lastUpdated: "Mar 10",          updatedBy: "Carlos R." },
  { id: 8,  name: "Bell Peppers",   category: "Fresh Produce", qty: 18, reorder: 12, unit: "pcs", expiry: "2026-03-19", lastUpdated: "Today 08:05 AM",  updatedBy: "Ben T."    },
  { id: 9,  name: "Greek Yogurt",   category: "Dairy",         qty: 3,  reorder: 10, unit: "pcs", expiry: "2026-03-15", lastUpdated: "Yesterday",       updatedBy: "Ana L."    },
  { id: 10, name: "Salmon Fillet",  category: "Proteins",      qty: 14, reorder: 10, unit: "kg",  expiry: "2026-03-17", lastUpdated: "Today 08:20 AM",  updatedBy: "Ben T."    },
  { id: 11, name: "Cheddar Cheese", category: "Dairy",         qty: 9,  reorder: 8,  unit: "kg",  expiry: "2026-04-01", lastUpdated: "Mar 11",          updatedBy: "Ana L."    },
  { id: 12, name: "Sourdough",      category: "Pantry",        qty: 10, reorder: 8,  unit: "pcs", expiry: "2026-03-20", lastUpdated: "Mar 12",          updatedBy: "Carlos R." },
];

const CHECK_TASKS = [
  { id: 1, label: "Verify incoming shipment quantities",    done: false },
  { id: 2, label: "Update stock levels after delivery",     done: false },
  { id: 3, label: "Check for damaged or spoiled items",     done: false },
  { id: 4, label: "Flag items below reorder level",         done: false },
  { id: 5, label: "Report discrepancies to supervisor",     done: false },
];

const CATEGORIES = ["All Categories", "Fresh Produce", "Proteins", "Dairy", "Pantry"];

const CATEGORY_META = {
  "Fresh Produce": { color: "#16a34a", bg: "#f0fdf4" },
  "Proteins":      { color: "#ea580c", bg: "#fff7ed" },
  "Dairy":         { color: "#2563eb", bg: "#eff6ff" },
  "Pantry":        { color: "#7c3aed", bg: "#f5f3ff" },
};

const getStatus = (qty, reorder) => {
  if (qty === 0)           return "out";
  if (qty < reorder * 0.5) return "critical";
  if (qty < reorder)       return "low";
  return "ok";
};

const STATUS_META = {
  ok:       { label: "In Stock",  bg: "#f0fdf4", color: "#16a34a" },
  low:      { label: "Low Stock", bg: "#fffbeb", color: "#d97706" },
  critical: { label: "Critical",  bg: "#fef2f2", color: "#dc2626" },
  out:      { label: "Out",       bg: "#f3f4f6", color: "#6b7280" },
};

// ─── Update Qty Modal ─────────────────────────────────────────────────────────

const UpdateQtyModal = ({ item, onClose, onSave }) => {
  const [qty, setQty]     = useState(item.qty);
  const [note, setNote]   = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (qty === "" || isNaN(qty) || Number(qty) < 0) {
      setError("Please enter a valid quantity (0 or more).");
      return;
    }
    onSave(item.id, Number(qty), note);
    onClose();
  };

  const diff = Number(qty) - item.qty;

  return (
    <div className="sit-overlay" onClick={onClose}>
      <div className="sit-modal" onClick={e => e.stopPropagation()}>
        <div className="sit-modal-header">
          <div>
            <h2 className="sit-modal-title">Update Stock Quantity</h2>
            <p className="sit-modal-sub">{item.name} · {item.category}</p>
          </div>
          <button className="sit-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sit-modal-body">
          <div className="sit-current-row">
            <div className="sit-current-box">
              <div className="sit-current-label">Current Stock</div>
              <div className="sit-current-value">{item.qty} <span>{item.unit}</span></div>
            </div>
            <div className="sit-arrow">→</div>
            <div className="sit-current-box new">
              <div className="sit-current-label">New Stock</div>
              <div className="sit-current-value" style={{ color: diff < 0 ? "#dc2626" : diff > 0 ? "#16a34a" : "#0f172a" }}>
                {qty === "" ? "—" : qty} <span>{item.unit}</span>
              </div>
            </div>
          </div>

          {qty !== "" && qty !== item.qty && (
            <div className={`sit-diff-chip ${diff >= 0 ? "positive" : "negative"}`}>
              {diff > 0 ? `+${diff}` : diff} {item.unit} {diff > 0 ? "added" : "removed"}
            </div>
          )}

          <div className="sit-form-grp">
            <label>New Quantity ({item.unit})</label>
            <input
              type="number"
              min="0"
              value={qty}
              onChange={e => { setQty(e.target.value); setError(""); }}
              className={error ? "inp-err" : ""}
              autoFocus
            />
            {error && <span className="sit-err">{error}</span>}
          </div>

          <div className="sit-form-grp">
            <label>Note <span className="sit-optional">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Received delivery, used in recipe..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="sit-reorder-info">
            <span className="sit-info-icon">ℹ</span>
            Reorder level for this item is <strong>{item.reorder} {item.unit}</strong>.
            {Number(qty) < item.reorder && Number(qty) >= 0 && (
              <span className="sit-warn-note"> This quantity is below reorder level.</span>
            )}
          </div>
        </div>
        <div className="sit-modal-footer">
          <button className="sit-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sit-btn-save" onClick={handleSave}>💾 Save Update</button>
        </div>
      </div>
    </div>
  );
};

// ─── Report Issue Modal ───────────────────────────────────────────────────────

const ReportIssueModal = ({ item, onClose, onSubmit }) => {
  const [type,  setType]  = useState("damaged");
  const [desc,  setDesc]  = useState("");
  const [error, setError] = useState("");

  const ISSUE_TYPES = [
    { value: "damaged",   label: "🩹 Damaged Items"      },
    { value: "spoiled",   label: "🗑 Spoiled / Expired"  },
    { value: "missing",   label: "❓ Missing Stock"       },
    { value: "mismatch",  label: "⚖ Quantity Mismatch"   },
    { value: "other",     label: "📝 Other"               },
  ];

  const handleSubmit = () => {
    if (!desc.trim()) { setError("Please describe the issue."); return; }
    onSubmit({ itemId: item.id, itemName: item.name, type, desc });
    onClose();
  };

  return (
    <div className="sit-overlay" onClick={onClose}>
      <div className="sit-modal" onClick={e => e.stopPropagation()}>
        <div className="sit-modal-header">
          <div>
            <h2 className="sit-modal-title">Report an Issue</h2>
            <p className="sit-modal-sub">{item.name} · {item.category}</p>
          </div>
          <button className="sit-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sit-modal-body">
          <div className="sit-form-grp">
            <label>Issue Type</label>
            <div className="sit-issue-types">
              {ISSUE_TYPES.map(t => (
                <button
                  key={t.value}
                  className={`sit-issue-btn${type === t.value ? " active" : ""}`}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sit-form-grp">
            <label>Description *</label>
            <textarea
              className={`sit-textarea${error ? " inp-err" : ""}`}
              placeholder="Describe the issue in detail..."
              value={desc}
              onChange={e => { setDesc(e.target.value); setError(""); }}
              rows={4}
            />
            {error && <span className="sit-err">{error}</span>}
          </div>
        </div>
        <div className="sit-modal-footer">
          <button className="sit-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sit-btn-report" onClick={handleSubmit}>🚨 Submit Report</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StaffInventoryTasks = () => {
  const [items,         setItems]         = useState(INITIAL_ITEMS.map(i => ({ ...i, status: getStatus(i.qty, i.reorder) })));
  const [checklist,     setChecklist]     = useState(CHECK_TASKS);
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("All Categories");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [updateModal,   setUpdateModal]   = useState(null);
  const [reportModal,   setReportModal]   = useState(null);
  const [toast,         setToast]         = useState(null);
  const [activeTab,     setActiveTab]     = useState("stock");

  // ── Derived stats ──
  const totalItems    = items.length;
  const lowStockItems = items.filter(i => i.status === "low").length;
  const criticalItems = items.filter(i => i.status === "critical" || i.status === "out").length;
  const okItems       = items.filter(i => i.status === "ok").length;

  // ── Filtered items ──
  const filtered = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchCat    = filterCat === "All Categories" || item.category === filterCat;
      const matchStatus = filterStatus === "All" || item.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, filterCat, filterStatus]);

  // ── Handlers ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleUpdateQty = (id, newQty, note) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, qty: newQty, status: getStatus(newQty, item.reorder), lastUpdated: "Just now", updatedBy: "You" };
      return updated;
    }));
    showToast(`Stock updated successfully${note ? ` — "${note}"` : ""}`, "success");
  };

  const handleReportSubmit = ({ itemName, type }) => {
    showToast(`Issue reported for ${itemName} (${type})`, "warning");
  };

  const toggleChecklist = (id) => setChecklist(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const checklistDone = checklist.filter(t => t.done).length;

  return (
    <div className="sit-page">

      {/* ── Toast ── */}
      {toast && (
        <div className={`sit-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "⚠"} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="sit-page-header">
        <div className="sit-title-wrap">
          <div className="sit-page-icon">◫</div>
          <div>
            <h1 className="sit-page-title">Inventory Tasks</h1>
            <p className="sit-page-sub">Monitor stock levels, update quantities, and report issues</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sit-stats-row">
        <div className="sit-stat-card" onClick={() => setFilterStatus("All")} style={{ cursor: "pointer" }}>
          <div className="sit-stat-icon blue">◫</div>
          <div>
            <div className="sit-stat-value">{totalItems}</div>
            <div className="sit-stat-label">Total Items</div>
            <div className="sit-stat-sub">{okItems} in stock</div>
          </div>
        </div>
        <div className="sit-stat-card" onClick={() => setFilterStatus("low")} style={{ cursor: "pointer" }}>
          <div className="sit-stat-icon orange">⚠</div>
          <div>
            <div className="sit-stat-value orange">{lowStockItems}</div>
            <div className="sit-stat-label">Low Stock</div>
            <div className="sit-stat-sub">Below reorder level</div>
          </div>
        </div>
        <div className="sit-stat-card" onClick={() => setFilterStatus("critical")} style={{ cursor: "pointer" }}>
          <div className="sit-stat-icon red">🔴</div>
          <div>
            <div className="sit-stat-value red">{criticalItems}</div>
            <div className="sit-stat-label">Critical / Out</div>
            <div className="sit-stat-sub">Needs immediate action</div>
          </div>
        </div>
        <div className="sit-stat-card">
          <div className="sit-stat-icon green">✓</div>
          <div>
            <div className="sit-stat-value green">{checklistDone}/{checklist.length}</div>
            <div className="sit-stat-label">Checklist</div>
            <div className="sit-stat-sub">Tasks completed</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sit-tabs">
        {[
          { id: "stock",     label: "📦 Stock Overview" },
          { id: "checklist", label: "✅ Daily Checklist" },
        ].map(t => (
          <button
            key={t.id}
            className={`sit-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB: STOCK OVERVIEW
      ══════════════════════════════ */}
      {activeTab === "stock" && (
        <div className="sit-card">
          {/* Toolbar */}
          <div className="sit-toolbar">
            <div className="sit-search-wrap">
              <span className="sit-search-icon">🔍</span>
              <input
                className="sit-search-input"
                placeholder="Search items by name or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="sit-search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>
            <div className="sit-filters">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="ok">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="critical">Critical</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="sit-table-wrap">
            <table className="sit-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Stock Bar</th>
                  <th>Expiry Date</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={9} className="sit-empty">No items match your search or filters.</td></tr>
                  : filtered.map(item => {
                      const cm  = CATEGORY_META[item.category] || {};
                      const sm  = STATUS_META[item.status];
                      const pct = Math.min(100, item.reorder > 0 ? Math.round((item.qty / item.reorder) * 100) : 100);
                      const barColor = item.status === "ok" ? "#22c55e" : item.status === "low" ? "#f59e0b" : item.status === "critical" ? "#ef4444" : "#d1d5db";

                      return (
                        <tr key={item.id} className={item.status === "critical" || item.status === "out" ? "row-critical" : item.status === "low" ? "row-low" : ""}>
                          <td className="sit-item-name">{item.name}</td>
                          <td>
                            <span className="sit-cat-chip" style={{ background: cm.bg, color: cm.color }}>
                              {item.category}
                            </span>
                          </td>
                          <td className="sit-qty-cell" style={{ color: item.status !== "ok" ? barColor : "#374151" }}>
                            <strong>{item.qty}</strong> {item.unit}
                          </td>
                          <td className="sit-reorder-cell">{item.reorder} {item.unit}</td>
                          <td className="sit-bar-cell">
                            <div className="sit-stock-bar-wrap">
                              <div className="sit-stock-bar-track">
                                <div
                                  className="sit-stock-bar-fill"
                                  style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                                />
                              </div>
                              <span className="sit-stock-pct" style={{ color: barColor }}>{pct}%</span>
                            </div>
                          </td>
                          <td className={`sit-expiry-cell${new Date(item.expiry) <= new Date("2026-03-16") ? " expiry-soon" : ""}`}>
                            {item.expiry}
                          </td>
                          <td className="sit-updated-cell">
                            <div>{item.lastUpdated}</div>
                            <div className="sit-updated-by">{item.updatedBy}</div>
                          </td>
                          <td>
                            <span className="sit-status-chip" style={{ background: sm.bg, color: sm.color }}>
                              {sm.label}
                            </span>
                          </td>
                          <td>
                            <div className="sit-action-cell">
                              <button className="sit-tbl-btn update" onClick={() => setUpdateModal(item)}>
                                ✏ Update
                              </button>
                              <button className="sit-tbl-btn report" onClick={() => setReportModal(item)}>
                                🚨
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
          <div className="sit-table-footer">
            Showing {filtered.length} of {totalItems} items
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          TAB: DAILY CHECKLIST
      ══════════════════════════════ */}
      {activeTab === "checklist" && (
        <div className="sit-card">
          <div className="sit-checklist-header">
            <div>
              <h3 className="sit-card-title">Daily Inventory Checklist</h3>
              <p className="sit-card-sub">Complete all tasks before end of shift</p>
            </div>
            <div className="sit-checklist-progress">
              <div className="sit-cl-progress-track">
                <div
                  className="sit-cl-progress-fill"
                  style={{ width: `${checklist.length ? (checklistDone / checklist.length) * 100 : 0}%` }}
                />
              </div>
              <span className="sit-cl-pct">{checklistDone}/{checklist.length} done</span>
            </div>
          </div>

          <div className="sit-checklist">
            {checklist.map(task => (
              <div key={task.id} className={`sit-cl-row${task.done ? " done" : ""}`}>
                <button
                  className={`sit-cl-check${task.done ? " checked" : ""}`}
                  onClick={() => toggleChecklist(task.id)}
                >
                  {task.done && "✓"}
                </button>
                <span className="sit-cl-label">{task.label}</span>
                {task.done && <span className="sit-cl-done-chip">Completed</span>}
              </div>
            ))}
          </div>

          {checklistDone === checklist.length && (
            <div className="sit-all-done">
              🎉 All checklist tasks completed for today!
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════
          TAB: NEEDS ATTENTION
      ══════════════════════════════ */}
      {activeTab === "alerts" && (
        <div className="sit-attention-grid">
          {items.filter(i => i.status !== "ok").length === 0 ? (
            <div className="sit-all-clear">
              ✅ All items are well stocked. No attention needed!
            </div>
          ) : (
            items
              .filter(i => i.status !== "ok")
              .sort((a, b) => {
                const order = { out: 0, critical: 1, low: 2 };
                return order[a.status] - order[b.status];
              })
              .map(item => {
                const sm  = STATUS_META[item.status];
                const cm  = CATEGORY_META[item.category] || {};
                const pct = Math.min(100, item.reorder > 0 ? Math.round((item.qty / item.reorder) * 100) : 0);
                const barColor = item.status === "low" ? "#f59e0b" : item.status === "critical" ? "#ef4444" : "#d1d5db";

                return (
                  <div
                    key={item.id}
                    className="sit-attention-card"
                    style={{ borderTop: `3px solid ${sm.color}` }}
                  >
                    <div className="sit-att-head">
                      <div>
                        <div className="sit-att-name">{item.name}</div>
                        <span className="sit-att-cat" style={{ background: cm.bg, color: cm.color }}>
                          {item.category}
                        </span>
                      </div>
                      <span className="sit-att-status" style={{ background: sm.bg, color: sm.color }}>
                        {sm.label}
                      </span>
                    </div>

                    <div className="sit-att-qty" style={{ color: sm.color }}>
                      {item.qty === 0
                        ? <span className="sit-att-out">OUT OF STOCK</span>
                        : <><span className="sit-att-num">{item.qty}</span> <span className="sit-att-unit">{item.unit} remaining</span></>
                      }
                    </div>

                    <div className="sit-att-bar-track">
                      <div className="sit-att-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>

                    <div className="sit-att-meta">
                      <span>Reorder at: <strong>{item.reorder} {item.unit}</strong></span>
                      <span>Expires: <strong>{item.expiry}</strong></span>
                    </div>

                    <div className="sit-att-actions">
                      <button className="sit-att-btn update" onClick={() => { setUpdateModal(item); setActiveTab("stock"); }}>
                        ✏ Update Stock
                      </button>
                      <button className="sit-att-btn report" onClick={() => { setReportModal(item); setActiveTab("stock"); }}>
                        🚨 Report
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {updateModal && (
        <UpdateQtyModal
          item={updateModal}
          onClose={() => setUpdateModal(null)}
          onSave={handleUpdateQty}
        />
      )}
      {reportModal && (
        <ReportIssueModal
          item={reportModal}
          onClose={() => setReportModal(null)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default StaffInventoryTasks;