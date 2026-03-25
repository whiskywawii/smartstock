import { useState } from "react";
import "./ProfileShift.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const INITIAL_PROFILE = {
  firstName:  "Carlos",
  lastName:   "Reyes",
  username:   "staff",
  email:      "carlos.reyes@smartstock.com",
  phone:      "+63 912 345 6789",
  role:       "Kitchen Staff",
  department: "Food & Beverage",
  employeeId: "SS-2024-047",
  joinDate:   "2024-06-15",
  avatar:     "CR",
};

const SHIFT_HISTORY = [
  { id: 1, date: "2026-03-13", day: "Today",     start: "07:00 AM", end: "03:00 PM", hours: 8,   status: "active",    tasks: 4, completed: 1 },
  { id: 2, date: "2026-03-12", day: "Yesterday", start: "07:00 AM", end: "03:00 PM", hours: 8,   status: "completed", tasks: 5, completed: 5 },
  { id: 3, date: "2026-03-11", day: "Tue",       start: "07:00 AM", end: "03:00 PM", hours: 8,   status: "completed", tasks: 4, completed: 4 },
  { id: 4, date: "2026-03-10", day: "Mon",       start: "07:00 AM", end: "03:00 PM", hours: 8,   status: "completed", tasks: 6, completed: 6 },
  { id: 5, date: "2026-03-09", day: "Sun",       start: "—",        end: "—",        hours: 0,   status: "off",       tasks: 0, completed: 0 },
  { id: 6, date: "2026-03-08", day: "Sat",       start: "09:00 AM", end: "05:00 PM", hours: 8,   status: "completed", tasks: 5, completed: 5 },
  { id: 7, date: "2026-03-07", day: "Fri",       start: "07:00 AM", end: "03:00 PM", hours: 8,   status: "completed", tasks: 4, completed: 4 },
];

const UPCOMING_SHIFTS = [
  { date: "2026-03-14", day: "Tomorrow",  start: "07:00 AM", end: "03:00 PM", type: "Regular" },
  { date: "2026-03-15", day: "Sun",       start: "—",        end: "—",        type: "Day Off"  },
  { date: "2026-03-16", day: "Mon",       start: "07:00 AM", end: "03:00 PM", type: "Regular" },
  { date: "2026-03-17", day: "Tue",       start: "07:00 AM", end: "03:00 PM", type: "Regular" },
  { date: "2026-03-18", day: "Wed",       start: "07:00 AM", end: "03:00 PM", type: "Regular" },
];

const TABS = [
  { id: "profile",  label: "👤 My Profile"     },
  { id: "shift",    label: "🕐 Shift & Hours"   },
  { id: "activity", label: "📊 Activity Stats"  },
  { id: "security", label: "🔒 Security"        },
];

const SHIFT_STATUS_META = {
  active:    { label: "Active",    bg: "#f0fdf4", color: "#16a34a" },
  completed: { label: "Completed", bg: "#eff6ff", color: "#2563eb" },
  off:       { label: "Day Off",   bg: "#f9fafb", color: "#9ca3af" },
};

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [form, setForm]   = useState({ ...profile });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim())     e.email     = "Email is required";
    if (!form.phone.trim())     e.phone     = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="sps-overlay" onClick={onClose}>
      <div className="sps-modal" onClick={e => e.stopPropagation()}>
        <div className="sps-modal-header">
          <div>
            <h2 className="sps-modal-title">Edit Profile</h2>
            <p className="sps-modal-sub">Update your personal information</p>
          </div>
          <button className="sps-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sps-modal-body">
          <div className="sps-form-row-2">
            <div className="sps-form-grp">
              <label>First Name *</label>
              <input className={errors.firstName ? "inp-err" : ""} value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="First name" />
              {errors.firstName && <span className="sps-err">{errors.firstName}</span>}
            </div>
            <div className="sps-form-grp">
              <label>Last Name *</label>
              <input className={errors.lastName ? "inp-err" : ""} value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Last name" />
              {errors.lastName && <span className="sps-err">{errors.lastName}</span>}
            </div>
          </div>
          <div className="sps-form-grp">
            <label>Email Address *</label>
            <input type="email" className={errors.email ? "inp-err" : ""} value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            {errors.email && <span className="sps-err">{errors.email}</span>}
          </div>
          <div className="sps-form-grp">
            <label>Phone Number *</label>
            <input className={errors.phone ? "inp-err" : ""} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+63 900 000 0000" />
            {errors.phone && <span className="sps-err">{errors.phone}</span>}
          </div>
          <div className="sps-form-row-2">
            <div className="sps-form-grp">
              <label>Role <span className="sps-locked">🔒 Locked</span></label>
              <input value={form.role} disabled />
            </div>
            <div className="sps-form-grp">
              <label>Department <span className="sps-locked">🔒 Locked</span></label>
              <input value={form.department} disabled />
            </div>
          </div>
        </div>
        <div className="sps-modal-footer">
          <button className="sps-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sps-btn-save" onClick={handleSave}>💾 Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ─── Change Password Modal ────────────────────────────────────────────────────

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [show, setShow]     = useState({ current: false, newPw: false, confirm: false });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleShow = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const strength = (pw) => {
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    return score;
  };

  const pwStrength    = strength(form.newPw);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength] || "";
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][pwStrength] || "#e5e7eb";

  const validate = () => {
    const e = {};
    if (!form.current)              e.current = "Current password is required";
    if (form.newPw.length < 8)      e.newPw   = "Password must be at least 8 characters";
    if (form.newPw !== form.confirm) e.confirm  = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSuccess(true);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="sps-overlay" onClick={onClose}>
      <div className="sps-modal small" onClick={e => e.stopPropagation()}>
        <div className="sps-modal-header">
          <div>
            <h2 className="sps-modal-title">Change Password</h2>
            <p className="sps-modal-sub">Choose a strong, unique password</p>
          </div>
          <button className="sps-modal-close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div className="sps-modal-success">
            <div className="sps-success-icon">✅</div>
            <div className="sps-success-text">Password changed successfully!</div>
          </div>
        ) : (
          <>
            <div className="sps-modal-body">
              {[
                { key: "current", label: "Current Password" },
                { key: "newPw",   label: "New Password"     },
                { key: "confirm", label: "Confirm Password" },
              ].map(({ key, label }) => (
                <div className="sps-form-grp" key={key}>
                  <label>{label}</label>
                  <div className="sps-pw-wrap">
                    <input
                      type={show[key] ? "text" : "password"}
                      className={errors[key] ? "inp-err" : ""}
                      placeholder="••••••••"
                      value={form[key]}
                      onChange={e => { set(key, e.target.value); setErrors(p => ({ ...p, [key]: "" })); }}
                    />
                    <button className="sps-pw-toggle" onClick={() => toggleShow(key)}>
                      {show[key] ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors[key] && <span className="sps-err">{errors[key]}</span>}
                </div>
              ))}

              {form.newPw && (
                <div className="sps-strength-row">
                  <div className="sps-strength-track">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="sps-strength-seg" style={{ background: i <= pwStrength ? strengthColor : "#e5e7eb" }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColor, fontSize: 12, fontWeight: 700 }}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div className="sps-modal-footer">
              <button className="sps-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="sps-btn-save" onClick={handleSave}>🔒 Update Password</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StaffProfileShift = () => {
  const [profile,     setProfile]     = useState(INITIAL_PROFILE);
  const [activeTab,   setActiveTab]   = useState("profile");
  const [editModal,   setEditModal]   = useState(false);
  const [pwModal,     setPwModal]     = useState(false);
  const [toast,       setToast]       = useState(null);
  const [twoFA,       setTwoFA]       = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs,  setPushNotifs]  = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSaveProfile = (updated) => {
    setProfile(updated);
    showToast("Profile updated successfully!", "success");
  };

  // ── Stats derived from shift history ──
  const totalHours    = SHIFT_HISTORY.reduce((s, sh) => s + sh.hours, 0);
  const shiftsWorked  = SHIFT_HISTORY.filter(s => s.status !== "off").length;
  const tasksTotal    = SHIFT_HISTORY.reduce((s, sh) => s + sh.tasks, 0);
  const tasksDone     = SHIFT_HISTORY.reduce((s, sh) => s + sh.completed, 0);
  const completionPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const currentShift  = SHIFT_HISTORY[0];

  return (
    <div className="sps-page">

      {/* Toast */}
      {toast && (
        <div className={`sps-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "ℹ"} {toast.msg}
        </div>
      )}

      {/* ── Profile Hero ── */}
      <div className="sps-hero">
        <div className="sps-hero-left">
          <div className="sps-avatar-wrap">
            <div className="sps-avatar">{profile.avatar}</div>
            <div className="sps-avatar-status" />
          </div>
          <div className="sps-hero-info">
            <h2 className="sps-hero-name">{profile.firstName} {profile.lastName}</h2>
            <div className="sps-hero-role">{profile.role} · {profile.department}</div>
            <div className="sps-hero-meta">
              <span className="sps-hero-chip id">🪪 {profile.employeeId}</span>
              <span className="sps-hero-chip shift">🟢 On Shift</span>
              <span className="sps-hero-chip join">📅 Since {profile.joinDate}</span>
            </div>
          </div>
        </div>
        <button className="sps-edit-hero-btn" onClick={() => setEditModal(true)}>
          ✏ Edit Profile
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="sps-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`sps-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
          TAB: MY PROFILE
      ════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="sps-tab-content">
          <div className="sps-two-col">

            {/* Personal info */}
            <div className="sps-card">
              <div className="sps-card-header">
                <h3 className="sps-card-title">Personal Information</h3>
                <button className="sps-card-edit-btn" onClick={() => setEditModal(true)}>✏ Edit</button>
              </div>
              <div className="sps-info-grid">
                {[
                  { label: "First Name",   value: profile.firstName  },
                  { label: "Last Name",    value: profile.lastName   },
                  { label: "Username",     value: profile.username   },
                  { label: "Email",        value: profile.email      },
                  { label: "Phone",        value: profile.phone      },
                  { label: "Employee ID",  value: profile.employeeId },
                ].map(row => (
                  <div key={row.label} className="sps-info-row">
                    <span className="sps-info-key">{row.label}</span>
                    <span className="sps-info-val">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Work info */}
            <div className="sps-col-right">
              <div className="sps-card">
                <div className="sps-card-header">
                  <h3 className="sps-card-title">Work Information</h3>
                </div>
                <div className="sps-info-grid">
                  {[
                    { label: "Role",       value: profile.role       },
                    { label: "Department", value: profile.department },
                    { label: "Join Date",  value: profile.joinDate   },
                    { label: "Status",     value: "Active"           },
                  ].map(row => (
                    <div key={row.label} className="sps-info-row">
                      <span className="sps-info-key">{row.label}</span>
                      <span className="sps-info-val">{row.label === "Status" ? <span className="sps-active-chip">● Active</span> : row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: SHIFT & HOURS
      ════════════════════════════════ */}
      {activeTab === "shift" && (
        <div className="sps-tab-content">

          {/* Current shift banner */}
          <div className="sps-current-shift-banner">
            <div className="sps-csb-left">
              <div className="sps-csb-pulse" />
              <div>
                <div className="sps-csb-label">Currently On Shift</div>
                <div className="sps-csb-time">{currentShift.start} – {currentShift.end}</div>
              </div>
            </div>
            <div className="sps-csb-stats">
              <div className="sps-csb-stat">
                <div className="sps-csb-stat-val">{currentShift.hours}h</div>
                <div className="sps-csb-stat-key">Duration</div>
              </div>
              <div className="sps-csb-divider" />
              <div className="sps-csb-stat">
                <div className="sps-csb-stat-val">{currentShift.completed}/{currentShift.tasks}</div>
                <div className="sps-csb-stat-key">Tasks Done</div>
              </div>
              <div className="sps-csb-divider" />
              <div className="sps-csb-stat">
                <div className="sps-csb-stat-val">{totalHours}h</div>
                <div className="sps-csb-stat-key">This Week</div>
              </div>
            </div>
          </div>

          <div className="sps-shift-two-col">

            {/* Shift History */}
            <div className="sps-card">
              <div className="sps-card-header">
                <h3 className="sps-card-title">Recent Shifts</h3>
                <span className="sps-card-sub-badge">{shiftsWorked} shifts this week</span>
              </div>
              <div className="sps-shift-list">
                {SHIFT_HISTORY.map(shift => {
                  const sm = SHIFT_STATUS_META[shift.status];
                  return (
                    <div key={shift.id} className={`sps-shift-row${shift.status === "off" ? " off" : ""}`}>
                      <div className="sps-shift-day-col">
                        <div className="sps-shift-day">{shift.day}</div>
                        <div className="sps-shift-date">{shift.date.slice(5)}</div>
                      </div>
                      <div className="sps-shift-time-col">
                        {shift.status === "off"
                          ? <span className="sps-shift-off">Day Off</span>
                          : <><span>{shift.start}</span><span className="sps-shift-dash">→</span><span>{shift.end}</span></>
                        }
                      </div>
                      <div className="sps-shift-hours">
                        {shift.hours > 0 ? `${shift.hours}h` : "—"}
                      </div>
                      <div className="sps-shift-tasks">
                        {shift.tasks > 0 ? `${shift.completed}/${shift.tasks} tasks` : "—"}
                      </div>
                      <span className="sps-shift-status" style={{ background: sm.bg, color: sm.color }}>
                        {sm.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming shifts */}
            <div className="sps-card">
              <div className="sps-card-header">
                <h3 className="sps-card-title">Upcoming Schedule</h3>
              </div>
              <div className="sps-upcoming-list">
                {UPCOMING_SHIFTS.map((shift, i) => (
                  <div key={i} className={`sps-upcoming-row${shift.type === "Day Off" ? " off" : ""}`}>
                    <div className="sps-upcoming-day-wrap">
                      <div className="sps-upcoming-day">{shift.day}</div>
                      <div className="sps-upcoming-date">{shift.date.slice(5)}</div>
                    </div>
                    {shift.type === "Day Off"
                      ? <span className="sps-upcoming-off">🌴 Day Off</span>
                      : <>
                          <div className="sps-upcoming-time">{shift.start} – {shift.end}</div>
                          <span className="sps-upcoming-type">{shift.type}</span>
                        </>
                    }
                  </div>
                ))}
              </div>
              <div className="sps-schedule-note">
                📋 Contact your supervisor to request schedule changes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: ACTIVITY STATS
      ════════════════════════════════ */}
      {activeTab === "activity" && (
        <div className="sps-tab-content">

          {/* Stat grid */}
          <div className="sps-activity-stats">
            {[
              { icon: "🕐", label: "Hours This Week",    value: `${totalHours}h`,       color: "#3b82f6", bg: "#eff6ff" },
              { icon: "📋", label: "Tasks Completed",    value: `${tasksDone}/${tasksTotal}`, color: "#16a34a", bg: "#f0fdf4" },
              { icon: "✅", label: "Completion Rate",    value: `${completionPct}%`,    color: "#22c55e", bg: "#f0fdf4" },
              { icon: "📅", label: "Shifts Worked",      value: shiftsWorked,            color: "#7c3aed", bg: "#f5f3ff" },
              { icon: "🌟", label: "Attendance Streak",  value: "7 days",               color: "#f97316", bg: "#fff7ed" },
              { icon: "🏆", label: "Performance Rating", value: "Excellent",            color: "#d97706", bg: "#fffbeb" },
            ].map((s, i) => (
              <div key={i} className="sps-activity-card">
                <div className="sps-activity-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                <div className="sps-activity-val" style={{ color: s.color }}>{s.value}</div>
                <div className="sps-activity-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Weekly task completion bars */}
          <div className="sps-card">
            <div className="sps-card-header">
              <h3 className="sps-card-title">Daily Task Completion</h3>
              <span className="sps-card-sub-badge">This week</span>
            </div>
            <div className="sps-completion-bars">
              {SHIFT_HISTORY.slice().reverse().map(shift => {
                const pct = shift.tasks > 0 ? Math.round((shift.completed / shift.tasks) * 100) : 0;
                const barColor = pct === 100 ? "#22c55e" : pct >= 50 ? "#3b82f6" : shift.status === "off" ? "#e5e7eb" : "#f59e0b";
                return (
                  <div key={shift.id} className="sps-bar-col">
                    <div className="sps-bar-pct" style={{ color: barColor }}>{shift.status === "off" ? "—" : `${pct}%`}</div>
                    <div className="sps-bar-track">
                      <div className="sps-bar-fill" style={{ height: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="sps-bar-day">{shift.day}</div>
                    <div className="sps-bar-tasks">
                      {shift.tasks > 0 ? `${shift.completed}/${shift.tasks}` : "Off"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall progress */}
          <div className="sps-card">
            <div className="sps-card-header">
              <h3 className="sps-card-title">Weekly Overview</h3>
            </div>
            <div className="sps-overview-grid">
              {[
                { label: "Tasks Assigned",  value: tasksTotal, icon: "📋", color: "#374151" },
                { label: "Tasks Completed", value: tasksDone,  icon: "✅", color: "#16a34a" },
                { label: "Completion Rate", value: `${completionPct}%`, icon: "📊", color: "#22c55e" },
                { label: "Total Hours",     value: `${totalHours}h`,    icon: "🕐", color: "#3b82f6" },
              ].map((s, i) => (
                <div key={i} className="sps-overview-item">
                  <div className="sps-overview-icon">{s.icon}</div>
                  <div className="sps-overview-val" style={{ color: s.color }}>{s.value}</div>
                  <div className="sps-overview-key">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          TAB: SECURITY
      ════════════════════════════════ */}
      {activeTab === "security" && (
        <div className="sps-tab-content">
          <div className="sps-two-col">

            {/* Password */}
            <div className="sps-col-stack">
              <div className="sps-card">
                <div className="sps-card-header">
                  <h3 className="sps-card-title">🔑 Password</h3>
                </div>
                <div className="sps-security-row">
                  <div>
                    <div className="sps-sec-label">Current Password</div>
                    <div className="sps-sec-val">Last changed 30 days ago</div>
                  </div>
                  <button className="sps-sec-btn" onClick={() => setPwModal(true)}>
                    Change Password
                  </button>
                </div>
                <div className="sps-password-strength-info">
                  <span className="sps-sec-check good">✓ Password is strong</span>
                  <span className="sps-sec-check good">✓ No recent breaches detected</span>
                </div>
              </div>

              {/* Notifications */}
              <div className="sps-card">
                <div className="sps-card-header">
                  <h3 className="sps-card-title">🔔 Notification Preferences</h3>
                </div>
                <div className="sps-toggle-list">
                  {[
                    { label: "Email Notifications",   sub: "Receive alerts via email",       val: emailNotifs, set: setEmailNotifs },
                    { label: "Push Notifications",    sub: "In-app notification alerts",     val: pushNotifs,  set: setPushNotifs  },
                  ].map((item, i) => (
                    <div key={i} className="sps-toggle-row">
                      <div>
                        <div className="sps-toggle-label">{item.label}</div>
                        <div className="sps-toggle-sub">{item.sub}</div>
                      </div>
                      <button
                        className={`sps-toggle${item.val ? " on" : ""}`}
                        onClick={() => { item.set(!item.val); showToast(`${item.label} ${!item.val ? "enabled" : "disabled"}`); }}
                      >
                        <div className="sps-toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2FA + session */}
            <div className="sps-col-stack">
              <div className="sps-card">
                <div className="sps-card-header">
                  <h3 className="sps-card-title">🛡 Two-Factor Authentication</h3>
                </div>
                <div className="sps-twofa-body">
                  <div className={`sps-twofa-status${twoFA ? " on" : ""}`}>
                    <span className="sps-twofa-icon">{twoFA ? "🔒" : "🔓"}</span>
                    <div>
                      <div className="sps-twofa-state">{twoFA ? "2FA Enabled" : "2FA Disabled"}</div>
                      <div className="sps-twofa-desc">
                        {twoFA ? "Your account has extra protection." : "Enable 2FA for extra account security."}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`sps-twofa-btn${twoFA ? " off" : ""}`}
                    onClick={() => { setTwoFA(!twoFA); showToast(`Two-factor authentication ${!twoFA ? "enabled" : "disabled"}`); }}
                  >
                    {twoFA ? "Disable 2FA" : "Enable 2FA"}
                  </button>
                </div>
              </div>

              <div className="sps-card">
                <div className="sps-card-header">
                  <h3 className="sps-card-title">📱 Active Sessions</h3>
                </div>
                <div className="sps-sessions">
                  {[
                    { device: "Chrome on Windows",    location: "Bacoor, PH",    time: "Now — Current session",    active: true  },
                    { device: "Mobile App (Android)", location: "Bacoor, PH",    time: "Yesterday at 6:45 PM",     active: false },
                  ].map((s, i) => (
                    <div key={i} className="sps-session-row">
                      <div className="sps-session-icon">{s.active ? "🖥" : "📱"}</div>
                      <div className="sps-session-info">
                        <div className="sps-session-device">{s.device} {s.active && <span className="sps-current-badge">Current</span>}</div>
                        <div className="sps-session-meta">{s.location} · {s.time}</div>
                      </div>
                      {!s.active && (
                        <button className="sps-revoke-btn" onClick={() => showToast("Session revoked", "success")}>Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {editModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {pwModal && (
        <ChangePasswordModal onClose={() => setPwModal(false)} />
      )}
    </div>
  );
};

export default StaffProfileShift;