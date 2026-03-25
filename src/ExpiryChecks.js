import { useState, useMemo } from "react";
import "./ExpiryChecks.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-03-13");

const INITIAL_ITEMS = [
  { id: 1,  name: "Whole Milk",       category: "Dairy",         qty: 8,  unit: "L",   expiry: "2026-03-14", location: "Fridge A",   reportedBy: null },
  { id: 2,  name: "Greek Yogurt",     category: "Dairy",         qty: 3,  unit: "pcs", expiry: "2026-03-15", location: "Fridge A",   reportedBy: null },
  { id: 3,  name: "Tomatoes",         category: "Fresh Produce", qty: 5,  unit: "kg",  expiry: "2026-03-16", location: "Cold Room",  reportedBy: null },
  { id: 4,  name: "Spinach",          category: "Fresh Produce", qty: 0,  unit: "kg",  expiry: "2026-03-18", location: "Cold Room",  reportedBy: null },
  { id: 5,  name: "Chicken Breast",   category: "Proteins",      qty: 25, unit: "kg",  expiry: "2026-03-17", location: "Freezer B",  reportedBy: null },
  { id: 6,  name: "Eggs",             category: "Proteins",      qty: 24, unit: "pcs", expiry: "2026-03-20", location: "Fridge B",   reportedBy: null },
  { id: 7,  name: "Sourdough",        category: "Pantry",        qty: 10, unit: "pcs", expiry: "2026-03-20", location: "Dry Store",  reportedBy: null },
  { id: 8,  name: "Salmon Fillet",    category: "Proteins",      qty: 14, unit: "kg",  expiry: "2026-03-17", location: "Freezer B",  reportedBy: null },
  { id: 9,  name: "Cheddar Cheese",   category: "Dairy",         qty: 9,  unit: "kg",  expiry: "2026-04-01", location: "Fridge A",   reportedBy: null },
  { id: 10, name: "Bell Peppers",     category: "Fresh Produce", qty: 18, unit: "pcs", expiry: "2026-03-19", location: "Cold Room",  reportedBy: null },
  { id: 11, name: "Olive Oil",        category: "Pantry",        qty: 12, unit: "L",   expiry: "2026-06-01", location: "Dry Store",  reportedBy: null },
  { id: 12, name: "Butter",           category: "Dairy",         qty: 4,  unit: "kg",  expiry: "2026-03-22", location: "Fridge A",   reportedBy: null },
  { id: 13, name: "Ground Beef",      category: "Proteins",      qty: 8,  unit: "kg",  expiry: "2026-03-15", location: "Freezer A",  reportedBy: null },
  { id: 14, name: "Lettuce",          category: "Fresh Produce", qty: 6,  unit: "pcs", expiry: "2026-03-21", location: "Cold Room",  reportedBy: null },
  { id: 15, name: "Rice",             category: "Pantry",        qty: 45, unit: "kg",  expiry: "2026-09-01", location: "Dry Store",  reportedBy: null },
];

const CATEGORIES = ["All Categories", "Fresh Produce", "Proteins", "Dairy", "Pantry"];

const CATEGORY_META = {
  "Fresh Produce": { color: "#16a34a", bg: "#f0fdf4" },
  "Proteins":      { color: "#ea580c", bg: "#fff7ed" },
  "Dairy":         { color: "#2563eb", bg: "#eff6ff" },
  "Pantry":        { color: "#7c3aed", bg: "#f5f3ff" },
};

const LOCATIONS = ["All Locations", "Fridge A", "Fridge B", "Freezer A", "Freezer B", "Cold Room", "Dry Store"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getDaysLeft = (expiryStr) => {
  const exp = new Date(expiryStr);
  return Math.ceil((exp - TODAY) / (1000 * 60 * 60 * 24));
};

const getUrgency = (daysLeft) => {
  if (daysLeft <= 0)  return "expired";
  if (daysLeft <= 2)  return "critical";
  if (daysLeft <= 5)  return "warning";
  if (daysLeft <= 10) return "watch";
  return "ok";
};

const URGENCY_META = {
  expired:  { label: "Expired",   bg: "#f3f4f6", color: "#6b7280",  border: "#e5e7eb"  },
  critical: { label: "Critical",  bg: "#fef2f2", color: "#dc2626",  border: "#fecaca"  },
  warning:  { label: "Warning",   bg: "#fffbeb", color: "#d97706",  border: "#fde68a"  },
  watch:    { label: "Watch",     bg: "#eff6ff", color: "#2563eb",  border: "#bfdbfe"  },
  ok:       { label: "Good",      bg: "#f0fdf4", color: "#16a34a",  border: "#bbf7d0"  },
};

const URGENCY_ICON = {
  expired: "☠", critical: "🔴", warning: "⚠", watch: "👁", ok: "✓",
};

// ─── Report Disposal Modal ────────────────────────────────────────────────────

const DisposalModal = ({ item, daysLeft, onClose, onSubmit }) => {
  const urgency = getUrgency(daysLeft);
  const um = URGENCY_META[urgency];
  const [reason, setReason]     = useState(urgency === "expired" ? "expired" : "near-expiry");
  const [note,   setNote]       = useState("");
  const [error,  setError]      = useState("");

  const REASONS = [
    { value: "expired",    label: "☠ Already Expired"     },
    { value: "near-expiry",label: "⚠ Near Expiry"         },
    { value: "spoiled",    label: "🗑 Spoiled / Damaged"   },
    { value: "quality",    label: "📉 Quality Concern"     },
    { value: "other",      label: "📝 Other"               },
  ];

  const handleSubmit = () => {
    if (!note.trim()) { setError("Please add a note describing the situation."); return; }
    onSubmit({ itemId: item.id, reason, note });
    onClose();
  };

  return (
    <div className="sec-overlay" onClick={onClose}>
      <div className="sec-modal" onClick={e => e.stopPropagation()}>
        <div className="sec-modal-header" style={{ borderTop: `3px solid ${um.color}` }}>
          <div>
            <h2 className="sec-modal-title">Report for Disposal</h2>
            <p className="sec-modal-sub">{item.name} · {item.category} · {item.location}</p>
          </div>
          <button className="sec-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sec-modal-body">
          <div className="sec-item-info" style={{ background: um.bg, border: `1px solid ${um.border}` }}>
            <span style={{ color: um.color, fontWeight: 700, fontSize: 13 }}>
              {URGENCY_ICON[urgency]} {um.label}
            </span>
            <span style={{ color: um.color, fontSize: 13 }}>
              {daysLeft <= 0 ? `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""} ago`
                             : `Expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{item.qty} {item.unit} remaining</span>
          </div>

          <div className="sec-form-grp">
            <label>Reason for Disposal</label>
            <div className="sec-reason-grid">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  className={`sec-reason-btn${reason === r.value ? " active" : ""}`}
                  onClick={() => setReason(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sec-form-grp">
            <label>Note <span className="sec-required">*</span></label>
            <textarea
              className={`sec-textarea${error ? " inp-err" : ""}`}
              placeholder="Describe the condition of the item, quantity to dispose, and any relevant details..."
              value={note}
              onChange={e => { setNote(e.target.value); setError(""); }}
              rows={3}
            />
            {error && <span className="sec-err">{error}</span>}
          </div>
        </div>
        <div className="sec-modal-footer">
          <button className="sec-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sec-btn-dispose" onClick={handleSubmit}>🗑 Submit Report</button>
        </div>
      </div>
    </div>
  );
};

// ─── Mark Checked Modal ───────────────────────────────────────────────────────

const CheckedModal = ({ item, onClose, onSubmit }) => {
  const [note, setNote] = useState("");

  return (
    <div className="sec-overlay" onClick={onClose}>
      <div className="sec-modal small" onClick={e => e.stopPropagation()}>
        <div className="sec-modal-header">
          <div>
            <h2 className="sec-modal-title">Mark as Checked</h2>
            <p className="sec-modal-sub">{item.name} · {item.location}</p>
          </div>
          <button className="sec-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sec-modal-body">
          <div className="sec-form-grp">
            <label>Checked by (optional note)</label>
            <input
              type="text"
              placeholder="e.g. Inspected — condition OK"
              value={note}
              onChange={e => setNote(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="sec-modal-footer">
          <button className="sec-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sec-btn-check" onClick={() => { onSubmit(item.id, note); onClose(); }}>✓ Confirm Check</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StaffExpiryChecks = () => {
  const [items,        setItems]        = useState(INITIAL_ITEMS);
  const [checkedMap,   setCheckedMap]   = useState({});   // id → { by, time }
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("All Categories");
  const [filterLoc,    setFilterLoc]    = useState("All Locations");
  const [filterUrgency,setFilterUrgency]= useState("All");
  const [activeTab,    setActiveTab]    = useState("all");
  const [disposalModal,setDisposalModal]= useState(null);
  const [checkedModal, setCheckedModal] = useState(null);
  const [toast,        setToast]        = useState(null);
  const [sortBy,       setSortBy]       = useState("expiry"); // expiry | name | category

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Enrich items with days left & urgency ──
  const enriched = useMemo(() => items.map(item => ({
    ...item,
    daysLeft: getDaysLeft(item.expiry),
    urgency:  getUrgency(getDaysLeft(item.expiry)),
    checked:  !!checkedMap[item.id],
  })), [items, checkedMap]);

  // ── Stats ──
  const expiredCount  = enriched.filter(i => i.urgency === "expired").length;
  const criticalCount = enriched.filter(i => i.urgency === "critical").length;
  const warningCount  = enriched.filter(i => i.urgency === "warning").length;
  const checkedCount  = Object.keys(checkedMap).length;

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter(item => {
        const matchSearch  = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.location.toLowerCase().includes(q);
        const matchCat     = filterCat === "All Categories" || item.category === filterCat;
        const matchLoc     = filterLoc === "All Locations"  || item.location  === filterLoc;
        const matchUrgency = filterUrgency === "All"        || item.urgency   === filterUrgency;
        const matchTab     = activeTab === "all"            || activeTab === item.urgency
                          || (activeTab === "checked" && item.checked)
                          || (activeTab === "attention" && (item.urgency === "expired" || item.urgency === "critical" || item.urgency === "warning"));
        return matchSearch && matchCat && matchLoc && matchUrgency && matchTab;
      })
      .sort((a, b) => {
        if (sortBy === "expiry")   return a.daysLeft - b.daysLeft;
        if (sortBy === "name")     return a.name.localeCompare(b.name);
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return 0;
      });
  }, [enriched, search, filterCat, filterLoc, filterUrgency, activeTab, sortBy]);

  // ── Handlers ──
  const handleChecked = (id, note) => {
    setCheckedMap(prev => ({ ...prev, [id]: { note, time: "Just now" } }));
    const item = items.find(i => i.id === id);
    showToast(`${item?.name} marked as checked`, "success");
  };

  const handleDisposal = ({ itemId, reason, note }) => {
    const item = items.find(i => i.id === itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, reportedBy: "You" } : i));
    showToast(`Disposal reported for ${item?.name}`, "warning");
  };

  const handleUnchecked = (id) => {
    setCheckedMap(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  // ── Urgency bar breakdown ──
  const urgencyBreakdown = ["expired", "critical", "warning", "watch", "ok"].map(u => ({
    urgency: u,
    count: enriched.filter(i => i.urgency === u).length,
    meta: URGENCY_META[u],
  })).filter(x => x.count > 0);

  return (
    <div className="sec-page">

      {/* Toast */}
      {toast && (
        <div className={`sec-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "⚠"} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="sec-page-header">
        <div className="sec-title-wrap">
          <div className="sec-page-icon">⏱</div>
          <div>
            <h1 className="sec-page-title">Expiry Checks</h1>
            <p className="sec-page-sub">Monitor item expiry dates, mark checked items, and report for disposal</p>
          </div>
        </div>
        <div className="sec-header-date">
          📅 Today: <strong>March 13, 2026</strong>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sec-stats-row">
        <div className="sec-stat-card clickable" onClick={() => setActiveTab("all")}>
          <div className="sec-stat-icon blue">📦</div>
          <div>
            <div className="sec-stat-value">{enriched.length}</div>
            <div className="sec-stat-label">Total Items</div>
            <div className="sec-stat-sub">Being tracked</div>
          </div>
        </div>
        <div className="sec-stat-card clickable" onClick={() => setActiveTab("attention")}>
          <div className="sec-stat-icon red">🔴</div>
          <div>
            <div className="sec-stat-value red">{expiredCount + criticalCount}</div>
            <div className="sec-stat-label">Expired / Critical</div>
            <div className="sec-stat-sub">Immediate action needed</div>
          </div>
        </div>
        <div className="sec-stat-card clickable" onClick={() => { setActiveTab("all"); setFilterUrgency("warning"); }}>
          <div className="sec-stat-icon orange">⚠</div>
          <div>
            <div className="sec-stat-value orange">{warningCount}</div>
            <div className="sec-stat-label">Expiring Soon</div>
            <div className="sec-stat-sub">Within 5 days</div>
          </div>
        </div>
        <div className="sec-stat-card clickable" onClick={() => setActiveTab("checked")}>
          <div className="sec-stat-icon green">✓</div>
          <div>
            <div className="sec-stat-value green">{checkedCount}</div>
            <div className="sec-stat-label">Checked Today</div>
            <div className="sec-stat-sub">{enriched.length - checkedCount} remaining</div>
          </div>
        </div>
      </div>

      {/* ── Urgency Summary Bar ── */}
      <div className="sec-urgency-bar-card">
        <div className="sec-urgency-bar-title">Urgency Breakdown</div>
        <div className="sec-urgency-bar-track">
          {urgencyBreakdown.map(({ urgency, count, meta }) => (
            <div
              key={urgency}
              className="sec-urgency-segment"
              style={{ flex: count, background: meta.color, cursor: "pointer", opacity: filterUrgency === urgency ? 1 : 0.75 }}
              onClick={() => setFilterUrgency(filterUrgency === urgency ? "All" : urgency)}
              title={`${meta.label}: ${count} item${count !== 1 ? "s" : ""}`}
            />
          ))}
        </div>
        <div className="sec-urgency-legend">
          {urgencyBreakdown.map(({ urgency, count, meta }) => (
            <div
              key={urgency}
              className={`sec-legend-item${filterUrgency === urgency ? " active" : ""}`}
              onClick={() => setFilterUrgency(filterUrgency === urgency ? "All" : urgency)}
            >
              <span className="sec-legend-dot" style={{ background: meta.color }} />
              <span className="sec-legend-label">{meta.label}</span>
              <span className="sec-legend-count" style={{ color: meta.color }}>{count}</span>
            </div>
          ))}
          {filterUrgency !== "All" && (
            <button className="sec-clear-urgency" onClick={() => setFilterUrgency("All")}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sec-tabs">
        {[
          { id: "all",       label: `📦 All Items (${enriched.length})`                              },
          { id: "attention", label: `🚨 Needs Action (${expiredCount + criticalCount + warningCount})` },
          { id: "checked",   label: `✅ Checked (${checkedCount})`                                    },
        ].map(t => (
          <button
            key={t.id}
            className={`sec-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="sec-toolbar">
        <div className="sec-search-wrap">
          <span className="sec-search-icon">🔍</span>
          <input
            className="sec-search-input"
            placeholder="Search by item, category, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="sec-search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
        <div className="sec-toolbar-filters">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="expiry">Sort: Expiry Date</option>
            <option value="name">Sort: Name</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="sec-results-meta">
        Showing {filtered.length} of {enriched.length} items
        {(search || filterCat !== "All Categories" || filterLoc !== "All Locations" || filterUrgency !== "All") && (
          <button className="sec-clear-all" onClick={() => { setSearch(""); setFilterCat("All Categories"); setFilterLoc("All Locations"); setFilterUrgency("All"); }}>
            ✕ Clear all filters
          </button>
        )}
      </div>

      {/* ── Items Grid ── */}
      {filtered.length === 0 ? (
        <div className="sec-empty-state">
          <div className="sec-empty-icon">🎉</div>
          <div className="sec-empty-title">All clear!</div>
          <div className="sec-empty-sub">No items match your current filters.</div>
        </div>
      ) : (
        <div className="sec-items-grid">
          {filtered.map(item => {
            const um  = URGENCY_META[item.urgency];
            const cm  = CATEGORY_META[item.category] || {};
            const checked = checkedMap[item.id];
            const isReported = !!item.reportedBy;

            return (
              <div
                key={item.id}
                className={`sec-item-card${item.checked ? " is-checked" : ""}${isReported ? " is-reported" : ""}`}
                style={{ borderTop: `3px solid ${um.color}` }}
              >
                {/* Card header */}
                <div className="sec-item-head">
                  <div className="sec-item-name-row">
                    <span className="sec-item-name">{item.name}</span>
                    {item.checked && <span className="sec-checked-tick">✓</span>}
                    {isReported  && <span className="sec-reported-tick">🗑</span>}
                  </div>
                  <div className="sec-item-badges">
                    <span className="sec-cat-chip" style={{ background: cm.bg, color: cm.color }}>{item.category}</span>
                    <span className="sec-urgency-chip" style={{ background: um.bg, color: um.color }}>{URGENCY_ICON[item.urgency]} {um.label}</span>
                  </div>
                </div>

                {/* Countdown */}
                <div className="sec-countdown" style={{ color: um.color }}>
                  {item.daysLeft <= 0
                    ? <span className="sec-expired-label">EXPIRED {Math.abs(item.daysLeft)}d ago</span>
                    : <>
                        <span className="sec-days-num">{item.daysLeft}</span>
                        <span className="sec-days-label"> day{item.daysLeft !== 1 ? "s" : ""} left</span>
                      </>
                  }
                </div>

                {/* Progress bar — inverted (fuller = more urgent) */}
                <div className="sec-expiry-bar-track">
                  <div
                    className="sec-expiry-bar-fill"
                    style={{
                      width: item.daysLeft <= 0 ? "100%"
                           : `${Math.max(0, Math.min(100, 100 - (item.daysLeft / 30) * 100))}%`,
                      background: um.color,
                    }}
                  />
                </div>

                {/* Details */}
                <div className="sec-item-details">
                  <div className="sec-detail-row">
                    <span className="sec-detail-key">Expires</span>
                    <span className="sec-detail-val" style={{ color: item.daysLeft <= 3 ? um.color : "#374151" }}>
                      {item.expiry}
                    </span>
                  </div>
                  <div className="sec-detail-row">
                    <span className="sec-detail-key">Quantity</span>
                    <span className="sec-detail-val">{item.qty} {item.unit}</span>
                  </div>
                  <div className="sec-detail-row">
                    <span className="sec-detail-key">Location</span>
                    <span className="sec-detail-val">📍 {item.location}</span>
                  </div>
                  {checked && (
                    <div className="sec-detail-row">
                      <span className="sec-detail-key">Checked</span>
                      <span className="sec-detail-val checked-by">✓ {checked.note || "Inspected"} — {checked.time}</span>
                    </div>
                  )}
                  {isReported && (
                    <div className="sec-detail-row">
                      <span className="sec-detail-key">Reported</span>
                      <span className="sec-detail-val reported-by">🗑 Disposal reported by {item.reportedBy}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="sec-item-actions">
                  {!item.checked
                    ? <button className="sec-action-btn check" onClick={() => setCheckedModal(item)}>✓ Mark Checked</button>
                    : <button className="sec-action-btn uncheck" onClick={() => handleUnchecked(item.id)}>↺ Uncheck</button>
                  }
                  {!isReported
                    ? <button className="sec-action-btn dispose" onClick={() => setDisposalModal({ item, daysLeft: item.daysLeft })}>🗑 Report</button>
                    : <span className="sec-reported-label">🗑 Reported</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {disposalModal && (
        <DisposalModal
          item={disposalModal.item}
          daysLeft={disposalModal.daysLeft}
          onClose={() => setDisposalModal(null)}
          onSubmit={handleDisposal}
        />
      )}
      {checkedModal && (
        <CheckedModal
          item={checkedModal}
          onClose={() => setCheckedModal(null)}
          onSubmit={handleChecked}
        />
      )}
    </div>
  );
};

export default StaffExpiryChecks;