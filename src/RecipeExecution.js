import { useState, useMemo } from "react";
import "./RecipeExecution.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const RECIPES = [
  {
    id: 1, name: "Grilled Chicken Salad", category: "Lunch",      status: "Active",
    difficulty: "Easy",   prepTime: 15, cookTime: 20, servings: 2,
    ingredients: ["Chicken Breast", "Romaine Lettuce", "Cherry Tomatoes", "Olive Oil", "Lemon"],
    instructions: "1. Season chicken breast with salt, pepper, and olive oil.\n2. Grill on medium-high heat for 7–8 minutes per side until fully cooked.\n3. Let rest for 5 minutes, then slice thinly.\n4. Toss romaine lettuce and cherry tomatoes with a drizzle of olive oil and a squeeze of lemon.\n5. Plate the greens and top with sliced chicken.\n6. Season to taste and serve immediately.",
    usageCount: 42, updatedAt: "2026-03-12",
  },
  {
    id: 2, name: "Avocado Toast",          category: "Breakfast",  status: "Active",
    difficulty: "Easy",   prepTime: 5,  cookTime: 5,  servings: 1,
    ingredients: ["Sourdough Bread", "Avocado", "Cherry Tomatoes", "Red Pepper Flakes", "Salt"],
    instructions: "1. Toast sourdough bread slices until golden and crisp.\n2. Halve the avocado, remove the pit, and scoop into a bowl.\n3. Mash avocado with a fork and season with salt.\n4. Spread mashed avocado generously on toast.\n5. Halve cherry tomatoes and scatter on top.\n6. Finish with a pinch of red pepper flakes and serve.",
    usageCount: 67, updatedAt: "2026-03-10",
  },
  {
    id: 3, name: "Beef Stir Fry",          category: "Dinner",     status: "Active",
    difficulty: "Medium", prepTime: 20, cookTime: 15, servings: 4,
    ingredients: ["Beef Strips", "Bell Peppers", "Soy Sauce", "Garlic", "Ginger", "Sesame Oil"],
    instructions: "1. Slice beef into thin strips and marinate in soy sauce for 10 minutes.\n2. Mince garlic and grate ginger.\n3. Heat a wok over high heat and add sesame oil.\n4. Stir fry garlic and ginger for 30 seconds until fragrant.\n5. Add beef strips and cook for 3–4 minutes.\n6. Add sliced bell peppers and toss for another 3 minutes.\n7. Adjust seasoning with soy sauce and serve over rice.",
    usageCount: 31, updatedAt: "2026-03-11",
  },
  {
    id: 4, name: "Chocolate Lava Cake",    category: "Dessert",    status: "Active",
    difficulty: "Hard",   prepTime: 20, cookTime: 12, servings: 4,
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour"],
    instructions: "1. Preheat oven to 425°F (220°C). Grease 4 ramekins.\n2. Melt dark chocolate and butter together in a double boiler.\n3. In a bowl, whisk eggs and sugar until pale and thick.\n4. Fold chocolate mixture into egg mixture.\n5. Sift in flour and fold gently until just combined.\n6. Divide batter into ramekins. Bake for exactly 12 minutes.\n7. Run a knife around the edge, invert onto plate, and serve immediately.",
    usageCount: 18, updatedAt: "2026-03-08",
  },
  {
    id: 5, name: "Green Smoothie",         category: "Beverage",   status: "Active",
    difficulty: "Easy",   prepTime: 5,  cookTime: 0,  servings: 1,
    ingredients: ["Spinach", "Banana", "Almond Milk", "Honey", "Chia Seeds"],
    instructions: "1. Add fresh spinach to blender first.\n2. Peel banana and add to blender.\n3. Pour in almond milk.\n4. Add honey and chia seeds.\n5. Blend on high for 60 seconds until completely smooth.\n6. Taste and adjust sweetness with honey. Serve immediately.",
    usageCount: 55, updatedAt: "2026-03-13",
  },
  {
    id: 6, name: "Vegan Buddha Bowl",      category: "Vegan",      status: "Active",
    difficulty: "Easy",   prepTime: 15, cookTime: 25, servings: 2,
    ingredients: ["Quinoa", "Chickpeas", "Sweet Potato", "Kale", "Tahini", "Lemon"],
    instructions: "1. Preheat oven to 400°F. Cube sweet potato and spread on a tray.\n2. Drain and rinse chickpeas, pat dry, and add to tray.\n3. Drizzle with oil, season, and roast for 25 minutes.\n4. Cook quinoa according to package directions.\n5. Massage kale with a pinch of salt until softened.\n6. Whisk tahini with lemon juice and water to make dressing.\n7. Assemble bowls with quinoa, kale, roasted veggies, and drizzle with tahini.",
    usageCount: 29, updatedAt: "2026-03-09",
  },
  {
    id: 7, name: "Pasta Carbonara",        category: "Dinner",     status: "Active",
    difficulty: "Medium", prepTime: 10, cookTime: 20, servings: 2,
    ingredients: ["Spaghetti", "Eggs", "Pancetta", "Pecorino Romano", "Black Pepper"],
    instructions: "1. Cook spaghetti in well-salted boiling water until al dente.\n2. Meanwhile, cook pancetta in a pan until crispy.\n3. Whisk eggs with grated pecorino and plenty of black pepper.\n4. Reserve 1 cup pasta water before draining.\n5. Toss hot pasta with pancetta and its fat off heat.\n6. Add egg mixture quickly, tossing and adding pasta water to create a creamy sauce.\n7. Serve immediately with extra cheese.",
    usageCount: 38, updatedAt: "2026-03-12",
  },
  {
    id: 8, name: "Club Sandwich",          category: "Lunch",      status: "Active",
    difficulty: "Easy",   prepTime: 10, cookTime: 5,  servings: 1,
    ingredients: ["Sourdough Bread", "Turkey", "Bacon", "Lettuce", "Tomato", "Mayo"],
    instructions: "1. Toast three slices of sourdough bread until golden.\n2. Cook bacon until crispy and drain on paper towels.\n3. Spread mayo generously on all three slices.\n4. Layer: first slice — lettuce, tomato, turkey.\n5. Add second toast slice, then layer bacon and more turkey.\n6. Top with third toast slice, press gently, and cut diagonally.\n7. Secure with toothpicks and serve with pickle.",
    usageCount: 22, updatedAt: "2026-03-11",
  },
];

const CATEGORIES  = ["All Categories", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Beverage", "Vegan"];
const DIFFICULTIES = ["All Difficulties", "Easy", "Medium", "Hard"];

const CATEGORY_META = {
  Breakfast: { color: "#f97316", bg: "#fff7ed" },
  Lunch:     { color: "#3b82f6", bg: "#eff6ff" },
  Dinner:    { color: "#22c55e", bg: "#f0fdf4" },
  Snack:     { color: "#22c55e", bg: "#f0fdf4" },
  Dessert:   { color: "#ec4899", bg: "#fdf2f8" },
  Beverage:  { color: "#06b6d4", bg: "#ecfeff" },
  Vegan:     { color: "#84cc16", bg: "#f7fee7" },
};

const DIFF_META = {
  Easy:   { bg: "#f0fdf4", color: "#16a34a" },
  Medium: { bg: "#fff7ed", color: "#ea580c" },
  Hard:   { bg: "#fef2f2", color: "#dc2626" },
};

const EXEC_STATUS = {
  idle:        { label: "Not Started", bg: "#f9fafb", color: "#6b7280"  },
  "in-progress": { label: "In Progress", bg: "#fffbeb", color: "#d97706"  },
  done:        { label: "Completed",   bg: "#f0fdf4", color: "#16a34a"  },
};

const CATEGORY_EMOJI = {
  Breakfast: "🍳", Lunch: "🥗", Dinner: "🍽", Snack: "🥪",
  Dessert: "🍰", Beverage: "🥤", Vegan: "🥦",
};

// ─── View / Instructions Modal ────────────────────────────────────────────────

const ViewModal = ({ recipe, execStatus, servingsScale, onClose, onStart, onComplete }) => {
  const cm   = CATEGORY_META[recipe.category] || {};
  const dm   = DIFF_META[recipe.difficulty]   || {};
  const es   = EXEC_STATUS[execStatus]        || EXEC_STATUS.idle;
  const scaled = Math.round(recipe.servings * servingsScale);

  const steps = recipe.instructions
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const [checkedSteps, setCheckedSteps] = useState({});
  const toggleStep = (i) => setCheckedSteps(prev => ({ ...prev, [i]: !prev[i] }));
  const doneCount  = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="sre-overlay" onClick={onClose}>
      <div className="sre-view-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sre-view-header" style={{ borderTop: `4px solid ${cm.color || "#22c55e"}` }}>
          <div className="sre-view-title-row">
            <div className="sre-view-emoji">{CATEGORY_EMOJI[recipe.category] || "🍴"}</div>
            <div>
              <h2 className="sre-view-name">{recipe.name}</h2>
              <div className="sre-view-badges">
                <span className="sre-badge" style={{ background: cm.bg, color: cm.color }}>{recipe.category}</span>
                <span className="sre-badge" style={{ background: dm.bg, color: dm.color }}>{recipe.difficulty}</span>
                <span className="sre-badge" style={{ background: es.bg, color: es.color }}>{es.label}</span>
              </div>
            </div>
          </div>
          <button className="sre-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Meta chips */}
        <div className="sre-meta-row">
          <div className="sre-meta-chip">⏱ Prep: {recipe.prepTime} min</div>
          {recipe.cookTime > 0 && <div className="sre-meta-chip">🔥 Cook: {recipe.cookTime} min</div>}
          <div className="sre-meta-chip">🍽 {scaled} serving{scaled !== 1 ? "s" : ""}</div>
          <div className="sre-meta-chip">📊 Used {recipe.usageCount}×</div>
        </div>

        <div className="sre-view-body">
          <div className="sre-view-two-col">

            {/* Ingredients */}
            <div>
              <div className="sre-section-title">🧂 Ingredients
                <span className="sre-scale-note">for {scaled} serving{scaled !== 1 ? "s" : ""}</span>
              </div>
              <ul className="sre-ing-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="sre-ing-item">
                    <span className="sre-ing-dot" style={{ background: cm.color || "#22c55e" }} />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <div className="sre-section-title">
                📋 Instructions
                <span className="sre-steps-progress">{doneCount}/{steps.length} steps done</span>
              </div>
              <div className="sre-steps-list">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={`sre-step-row${checkedSteps[i] ? " checked" : ""}`}
                    onClick={() => toggleStep(i)}
                  >
                    <div className={`sre-step-num${checkedSteps[i] ? " done" : ""}`}
                      style={checkedSteps[i] ? { background: cm.color || "#22c55e", borderColor: cm.color || "#22c55e", color: "#fff" } : {}}>
                      {checkedSteps[i] ? "✓" : i + 1}
                    </div>
                    <p className="sre-step-text">{step.replace(/^\d+\.\s*/, "")}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="sre-view-footer">
          <button className="sre-btn-close" onClick={onClose}>Close</button>
          {execStatus === "idle" && (
            <button className="sre-btn-start" onClick={() => { onStart(recipe.id); onClose(); }}>
              ▶ Start Cooking
            </button>
          )}
          {execStatus === "in-progress" && (
            <button className="sre-btn-complete" onClick={() => { onComplete(recipe.id); onClose(); }}>
              ✓ Mark Complete
            </button>
          )}
          {execStatus === "done" && (
            <span className="sre-done-label">✅ Completed today</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Recipe Card ──────────────────────────────────────────────────────────────

const RecipeCard = ({ recipe, execStatus, servingsScale, onView, onStart, onComplete, onReset }) => {
  const cm = CATEGORY_META[recipe.category] || {};
  const dm = DIFF_META[recipe.difficulty]   || {};
  const es = EXEC_STATUS[execStatus]        || EXEC_STATUS.idle;
  const scaled = Math.round(recipe.servings * servingsScale);

  return (
    <div className={`sre-card${execStatus === "done" ? " card-done" : execStatus === "in-progress" ? " card-active" : ""}`}>
      {/* Top band */}
      <div className="sre-card-top" style={{ background: cm.bg || "#f0fdf4" }}>
        <span className="sre-card-emoji">{CATEGORY_EMOJI[recipe.category] || "🍴"}</span>
        <div className="sre-card-top-badges">
          <span className="sre-badge" style={{ background: "rgba(255,255,255,0.85)", color: cm.color }}>{recipe.category}</span>
          <span className="sre-badge" style={{ background: dm.bg, color: dm.color }}>{recipe.difficulty}</span>
        </div>
      </div>

      {/* Body */}
      <div className="sre-card-body">
        <h3 className="sre-card-name">{recipe.name}</h3>
        <div className="sre-card-meta">
          {recipe.prepTime > 0 && <span>⏱ {recipe.prepTime}m prep</span>}
          {recipe.cookTime > 0 && <span>🔥 {recipe.cookTime}m cook</span>}
          <span>🍽 {scaled} srv</span>
        </div>

        {/* Ingredient chips */}
        <div className="sre-card-ings">
          {recipe.ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="sre-ing-chip">{ing}</span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="sre-ing-chip more">+{recipe.ingredients.length - 3}</span>
          )}
        </div>

        {/* Execution status bar */}
        <div className="sre-exec-status-bar" style={{ background: es.bg, border: `1px solid ${es.color}22` }}>
          <span style={{ color: es.color, fontWeight: 700, fontSize: 12 }}>● {es.label}</span>
          {execStatus === "in-progress" && <span className="sre-pulse-dot" />}
        </div>
      </div>

      {/* Footer */}
      <div className="sre-card-footer">
        <button className="sre-btn-view" onClick={() => onView(recipe.id)}>
          👁 View
        </button>
        {execStatus === "idle" && (
          <button className="sre-btn-action start" onClick={() => onStart(recipe.id)}>
            ▶ Start
          </button>
        )}
        {execStatus === "in-progress" && (
          <button className="sre-btn-action complete" onClick={() => onComplete(recipe.id)}>
            ✓ Done
          </button>
        )}
        {execStatus === "done" && (
          <button className="sre-btn-action reset" onClick={() => onReset(recipe.id)}>
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const StaffRecipeExecution = () => {
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("All Categories");
  const [filterDiff,   setFilterDiff]   = useState("All Difficulties");
  const [viewId,       setViewId]       = useState(null);
  const [execMap,      setExecMap]      = useState({});   // id → "idle"|"in-progress"|"done"
  const [servingsScale, setServingsScale] = useState(1);
  const [toast,        setToast]        = useState(null);
  const [view,         setView]         = useState("grid"); // grid | list

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const getExec = (id) => execMap[id] || "idle";

  const handleStart    = (id) => { setExecMap(p => ({ ...p, [id]: "in-progress" })); showToast(`Started: ${RECIPES.find(r => r.id === id)?.name}`, "info"); };
  const handleComplete = (id) => { setExecMap(p => ({ ...p, [id]: "done" }));        showToast(`Completed: ${RECIPES.find(r => r.id === id)?.name}`, "success"); };
  const handleReset    = (id) => { setExecMap(p => ({ ...p, [id]: "idle" }));        showToast(`Reset: ${RECIPES.find(r => r.id === id)?.name}`, "neutral"); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return RECIPES.filter(r => {
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.ingredients.some(i => i.toLowerCase().includes(q));
      const matchCat    = filterCat  === "All Categories"   || r.category   === filterCat;
      const matchDiff   = filterDiff === "All Difficulties" || r.difficulty === filterDiff;
      return matchSearch && matchCat && matchDiff;
    });
  }, [search, filterCat, filterDiff]);

  const inProgressCount = Object.values(execMap).filter(v => v === "in-progress").length;
  const doneCount       = Object.values(execMap).filter(v => v === "done").length;

  const viewRecipe = viewId ? RECIPES.find(r => r.id === viewId) : null;

  // Category breakdown for sidebar
  const catBreakdown = CATEGORIES.slice(1).map(cat => ({
    cat,
    count: RECIPES.filter(r => r.category === cat).length,
  })).filter(c => c.count > 0);

  return (
    <div className="sre-page">

      {/* Toast */}
      {toast && (
        <div className={`sre-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : toast.type === "info" ? "▶" : "↺"} {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="sre-page-header">
        <div className="sre-title-wrap">
          <div className="sre-page-icon">✦</div>
          <div>
            <h1 className="sre-page-title">Recipe Execution</h1>
            <p className="sre-page-sub">View recipes, follow instructions step-by-step, and track cooking progress</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="sre-stats-row">
        <div className="sre-stat-card">
          <div className="sre-stat-icon blue">✦</div>
          <div>
            <div className="sre-stat-value">{RECIPES.length}</div>
            <div className="sre-stat-label">Total Recipes</div>
            <div className="sre-stat-sub">Available today</div>
          </div>
        </div>
        <div className="sre-stat-card">
          <div className="sre-stat-icon orange">▶</div>
          <div>
            <div className="sre-stat-value" style={{ color: "#d97706" }}>{inProgressCount}</div>
            <div className="sre-stat-label">In Progress</div>
            <div className="sre-stat-sub">Currently cooking</div>
          </div>
        </div>
        <div className="sre-stat-card">
          <div className="sre-stat-icon green">✓</div>
          <div>
            <div className="sre-stat-value" style={{ color: "#16a34a" }}>{doneCount}</div>
            <div className="sre-stat-label">Completed</div>
            <div className="sre-stat-sub">Done today</div>
          </div>
        </div>
        <div className="sre-stat-card">
          <div className="sre-stat-icon teal">🍽</div>
          <div>
            <div className="sre-stat-value">{servingsScale}×</div>
            <div className="sre-stat-label">Servings Scale</div>
            <div className="sre-stat-sub">Applied to all recipes</div>
          </div>
        </div>
      </div>

      {/* ── Content: Sidebar + Main ── */}
      <div className="sre-layout">

        {/* Sidebar */}
        <aside className="sre-sidebar">
          {/* Servings scaler */}
          <div className="sre-side-card">
            <div className="sre-side-title">🍽 Servings Scale</div>
            <p className="sre-side-sub">Adjust serving multiplier for all recipes</p>
            <div className="sre-scale-controls">
              <button className="sre-scale-btn" onClick={() => setServingsScale(s => Math.max(0.5, +(s - 0.5).toFixed(1)))} disabled={servingsScale <= 0.5}>−</button>
              <div className="sre-scale-display">{servingsScale}×</div>
              <button className="sre-scale-btn" onClick={() => setServingsScale(s => Math.min(10, +(s + 0.5).toFixed(1)))}>+</button>
            </div>
            <div className="sre-scale-presets">
              {[0.5, 1, 2, 3, 5].map(v => (
                <button
                  key={v}
                  className={`sre-preset-btn${servingsScale === v ? " active" : ""}`}
                  onClick={() => setServingsScale(v)}
                >
                  {v}×
                </button>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="sre-side-card">
            <div className="sre-side-title">📂 By Category</div>
            <div className="sre-cat-list">
              <div
                className={`sre-cat-row${filterCat === "All Categories" ? " active" : ""}`}
                onClick={() => setFilterCat("All Categories")}
              >
                <span className="sre-cat-name">All Recipes</span>
                <span className="sre-cat-count">{RECIPES.length}</span>
              </div>
              {catBreakdown.map(({ cat, count }) => {
                const cm = CATEGORY_META[cat] || {};
                return (
                  <div
                    key={cat}
                    className={`sre-cat-row${filterCat === cat ? " active" : ""}`}
                    onClick={() => setFilterCat(cat)}
                  >
                    <span className="sre-cat-dot" style={{ background: cm.color }} />
                    <span className="sre-cat-name">{cat}</span>
                    <span className="sre-cat-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's progress */}
          <div className="sre-side-card">
            <div className="sre-side-title">📊 Today's Progress</div>
            <div className="sre-progress-track">
              <div
                className="sre-progress-fill"
                style={{ width: `${RECIPES.length ? (doneCount / RECIPES.length) * 100 : 0}%` }}
              />
            </div>
            <div className="sre-progress-label">{doneCount} of {RECIPES.length} recipes completed</div>
            <div className="sre-exec-summary">
              {[
                { label: "Not Started", val: RECIPES.length - inProgressCount - doneCount, color: "#6b7280" },
                { label: "In Progress", val: inProgressCount, color: "#d97706" },
                { label: "Completed",   val: doneCount,        color: "#16a34a" },
              ].map(s => (
                <div className="sre-exec-row" key={s.label}>
                  <span className="sre-exec-dot" style={{ background: s.color }} />
                  <span className="sre-exec-label">{s.label}</span>
                  <span className="sre-exec-val" style={{ color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main panel */}
        <div className="sre-main-panel">
          {/* Toolbar */}
          <div className="sre-toolbar">
            <div className="sre-search-wrap">
              <span className="sre-search-icon">🔍</span>
              <input
                className="sre-search-input"
                placeholder="Search by recipe name or ingredient..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="sre-search-clear" onClick={() => setSearch("")}>✕</button>}
            </div>
            <div className="sre-toolbar-right">
              <select value={filterCat}  onChange={e => setFilterCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
              <div className="sre-view-toggle">
                <button className={`sre-vt-btn${view === "grid" ? " active" : ""}`} onClick={() => setView("grid")}>⊞</button>
                <button className={`sre-vt-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}>☰</button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="sre-results-meta">
            {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
            {(search || filterCat !== "All Categories" || filterDiff !== "All Difficulties") && (
              <button className="sre-clear-filters" onClick={() => { setSearch(""); setFilterCat("All Categories"); setFilterDiff("All Difficulties"); }}>
                ✕ Clear filters
              </button>
            )}
          </div>

          {/* ── GRID VIEW ── */}
          {view === "grid" && (
            <div className="sre-recipe-grid">
              {filtered.length === 0
                ? <div className="sre-empty">No recipes match your search or filters.</div>
                : filtered.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      execStatus={getExec(recipe.id)}
                      servingsScale={servingsScale}
                      onView={setViewId}
                      onStart={handleStart}
                      onComplete={handleComplete}
                      onReset={handleReset}
                    />
                  ))
              }
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {view === "list" && (
            <div className="sre-list-card">
              <table className="sre-list-table">
                <thead>
                  <tr>
                    <th>Recipe</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Prep</th>
                    <th>Cook</th>
                    <th>Servings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={8} className="sre-empty-td">No recipes match your search.</td></tr>
                    : filtered.map(recipe => {
                        const cm = CATEGORY_META[recipe.category] || {};
                        const dm = DIFF_META[recipe.difficulty]   || {};
                        const es = EXEC_STATUS[getExec(recipe.id)] || EXEC_STATUS.idle;
                        const scaled = Math.round(recipe.servings * servingsScale);
                        const execStatus = getExec(recipe.id);
                        return (
                          <tr key={recipe.id} className={execStatus === "done" ? "row-done" : execStatus === "in-progress" ? "row-active" : ""}>
                            <td className="sre-tbl-name">
                              <span className="sre-tbl-emoji">{CATEGORY_EMOJI[recipe.category]}</span>
                              {recipe.name}
                            </td>
                            <td><span className="sre-badge" style={{ background: cm.bg, color: cm.color }}>{recipe.category}</span></td>
                            <td><span className="sre-badge" style={{ background: dm.bg, color: dm.color }}>{recipe.difficulty}</span></td>
                            <td className="sre-tbl-time">{recipe.prepTime}m</td>
                            <td className="sre-tbl-time">{recipe.cookTime > 0 ? `${recipe.cookTime}m` : "—"}</td>
                            <td className="sre-tbl-time">{scaled}</td>
                            <td><span className="sre-badge" style={{ background: es.bg, color: es.color }}>{es.label}</span></td>
                            <td>
                              <div className="sre-tbl-actions">
                                <button className="sre-tbl-btn view" onClick={() => setViewId(recipe.id)}>👁 View</button>
                                {execStatus === "idle"        && <button className="sre-tbl-btn start"    onClick={() => handleStart(recipe.id)}>▶ Start</button>}
                                {execStatus === "in-progress" && <button className="sre-tbl-btn complete" onClick={() => handleComplete(recipe.id)}>✓ Done</button>}
                                {execStatus === "done"        && <button className="sre-tbl-btn reset"    onClick={() => handleReset(recipe.id)}>↺</button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── View Modal ── */}
      {viewRecipe && (
        <ViewModal
          recipe={viewRecipe}
          execStatus={getExec(viewRecipe.id)}
          servingsScale={servingsScale}
          onClose={() => setViewId(null)}
          onStart={handleStart}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default StaffRecipeExecution;