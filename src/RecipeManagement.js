import React, { useState, useEffect, useMemo } from "react";
import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import AddRecipeModal from './AddRecipeModal';
import './RecipeManagement.css';

const COLLECTION = "recipe_web"; // ← single source of truth

/* ── helpers ── */
const CATEGORY_COLORS = {
  // original
  "Pasta":     { bg: "#eff6ff", color: "#3b82f6" },
  "Soup":      { bg: "#fff7ed", color: "#f97316" },
  "Salad":     { bg: "#f0fdf4", color: "#22c55e" },
  "Dessert":   { bg: "#fdf4ff", color: "#a855f7" },
  "Grills":    { bg: "#fef2f2", color: "#ef4444" },
  "Seafood":   { bg: "#ecfeff", color: "#06b6d4" },
  // AddRecipeModal categories
  "Breakfast": { bg: "#fffbeb", color: "#f59e0b" },
  "Lunch":     { bg: "#f0fdf4", color: "#22c55e" },
  "Dinner":    { bg: "#eff6ff", color: "#3b82f6" },
  "Snack":     { bg: "#fff7ed", color: "#f97316" },
  "Beverage":  { bg: "#ecfeff", color: "#06b6d4" },
  "Vegan":     { bg: "#f0fdf4", color: "#16a34a" },
};

const getCatStyle = (cat) =>
  CATEGORY_COLORS[cat] || { bg: "#f3f4f6", color: "#6b7280" };

/* Map category → emoji */
const CAT_EMOJI = {
  "Pasta": "🍝", "Soup": "🍲", "Salad": "🥗",
  "Dessert": "🍰", "Grills": "🥩", "Seafood": "🦐",
  "Breakfast": "🍳", "Lunch": "🥙", "Dinner": "🍽️",
  "Snack": "🍿", "Beverage": "🥤", "Vegan": "🥦",
};
const getEmoji = (cat) => CAT_EMOJI[cat] || "🍽️";

const RecipeManagement = () => {
  const [recipes, setRecipes]       = useState([]);
  const [modalMode, setModalMode]   = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [viewRecipe, setViewRecipe] = useState(null);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("All");
  const [viewMode, setViewMode]     = useState("grid"); // "grid" | "table"

  /* ── Firestore ── */
  const fetchRecipes = async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    setRecipes(
      querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    );
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleSaveRecipe = () => { fetchRecipes(); setModalMode(null); };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalMode("edit");
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    await deleteDoc(doc(db, COLLECTION, id));
    fetchRecipes();
  };

  /* ── Derived stats ── */
  const categories = useMemo(() => {
    const map = {};
    recipes.forEach(r => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return map;
  }, [recipes]);

  const topRecipes = useMemo(
    () => [...recipes].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)).slice(0, 5),
    [recipes]
  );

  const maxUsage = topRecipes[0]?.usageCount || 1;

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase());
      const matchCat    = filterCat === "All" || r.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [recipes, search, filterCat]);

  const catOptions = ["All", ...Object.keys(categories)];

  /* ── Category bars (up to 5) ── */
  const catBarColors = ["#22c55e","#3b82f6","#f97316","#a855f7","#ef4444"];
  const catList = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCat = catList[0]?.[1] || 1;

  return (
    <div className="rm-page">

      {/* ── Page Header ── */}
      <div className="rm-page-header">
        <div className="rm-page-title-wrap">
          <div className="rm-page-icon">🍽️</div>
          <div>
            <h1 className="rm-page-title">Recipe Management</h1>
            <p className="rm-page-sub">Manage and organize all your recipes</p>
          </div>
        </div>
        <button className="btn-create-recipe" onClick={() => { setSelectedRecipe(null); setModalMode("add"); }}>
          + Create Recipe
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="rm-stats-row">
        <div className="rm-stat-card">
          <div>
            <div className="rm-stat-label">Total Recipes</div>
            <div className="rm-stat-value teal">{recipes.length}</div>
            <div className="rm-stat-note">in your cookbook</div>
          </div>
          <div className="rm-stat-icon teal">🍽️</div>
        </div>
        <div className="rm-stat-card">
          <div>
            <div className="rm-stat-label">Categories</div>
            <div className="rm-stat-value blue">{Object.keys(categories).length}</div>
            <div className="rm-stat-note">different types</div>
          </div>
          <div className="rm-stat-icon blue">📂</div>
        </div>
        <div className="rm-stat-card">
          <div>
            <div className="rm-stat-label">Most Used</div>
            <div className="rm-stat-value green">{topRecipes[0]?.name?.split(" ")[0] || "—"}</div>
            <div className="rm-stat-note ok">{topRecipes[0] ? `${topRecipes[0].usageCount || 0} uses` : "no data yet"}</div>
          </div>
          <div className="rm-stat-icon green">⭐</div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="rm-charts-row">

        {/* Usage Chart — simple bar chart */}
        <div className="rm-chart-card">
          <p className="inv-card-title">Top Recipes by Usage</p>
          <div className="top-list">
            {topRecipes.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No usage data yet.</p>
            )}
            {topRecipes.map((r, i) => (
              <div className="top-row" key={r.id}>
                <span className="top-rank" style={{ color: catBarColors[i] }}>#{i + 1}</span>
                <div className="top-info">
                  <div className="top-name">{r.name}</div>
                  <div className="top-bar-track">
                    <div
                      className="top-bar-fill"
                      style={{
                        width: `${((r.usageCount || 0) / maxUsage) * 100}%`,
                        background: catBarColors[i],
                      }}
                    />
                  </div>
                </div>
                <span className="top-count">{r.usageCount || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rm-cat-card">
          <p className="inv-card-title">By Category</p>
          <div className="category-list">
            {catList.map(([cat, count], i) => (
              <div key={cat}>
                <div className="category-row-top">
                  <span className="category-name">{cat}</span>
                  <span className="category-count">{count}</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${(count / maxCat) * 100}%`,
                      background: catBarColors[i],
                    }}
                  />
                </div>
              </div>
            ))}
            {catList.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>No categories yet.</p>
            )}
          </div>
        </div>

        {/* Quick summary card */}
        <div className="rm-top-card">
          <p className="inv-card-title">Quick Stats</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {[
              { label: "Active Recipes", value: recipes.length, icon: "✅" },
              { label: "Avg Ingredients", value: recipes.length ? Math.round(recipes.reduce((s, r) => s + (r.ingredients?.length || 0), 0) / recipes.length) : 0, icon: "🥬" },
              { label: "Total Uses",  value: recipes.reduce((s, r) => s + (r.usageCount || 0), 0), icon: "📊" },
            ].map(stat => (
              <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>{stat.icon}</span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{stat.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recipe List Card ── */}
      <div className="inv-card rm-list-card">

        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search recipes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              {catOptions.map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="view-toggle">
              <button className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>⊞</button>
              <button className={`vt-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>≡</button>
            </div>
          </div>
        </div>

        {/* ── Grid View ── */}
        {viewMode === "grid" && (
          <>
            {filtered.length === 0
              ? <div className="empty-state">No recipes found.</div>
              : (
                <div className="recipe-grid">
                  {filtered.map(recipe => {
                    const style = getCatStyle(recipe.category);
                    const ingredients = recipe.ingredients || [];
                    const shown = ingredients.slice(0, 3);
                    const extra = ingredients.length - shown.length;
                    return (
                      <div className="recipe-card" key={recipe.id}>
                        <div className="recipe-card-top" style={{ background: style.bg }}>
                          <span className="recipe-card-emoji">{getEmoji(recipe.category)}</span>
                          <div className="recipe-card-badges">
                            <span
                              className="rm-badge"
                              style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}22` }}
                            >
                              {recipe.category}
                            </span>
                            {recipe.usageCount > 0 && (
                              <span className="usage-pill">{recipe.usageCount}× used</span>
                            )}
                          </div>
                        </div>
                        <div className="recipe-card-body">
                          <p className="recipe-card-name">{recipe.name}</p>
                          <div className="recipe-card-meta">
                            {recipe.prepTime && <span>⏱ {recipe.prepTime}</span>}
                            {recipe.servings && <span>👤 {recipe.servings} servings</span>}
                          </div>
                          <div className="recipe-card-ing">
                            {shown.map((ing, i) => (
                              <span key={i} className="ing-chip">{typeof ing === "string" ? ing : ing.name}</span>
                            ))}
                            {extra > 0 && <span className="ing-chip more">+{extra} more</span>}
                          </div>
                          <div className="recipe-card-footer">
                            <span className="usage-count">{ingredients.length} ingredients</span>
                            <div className="card-actions">
                              <button className="card-btn view" onClick={() => setViewRecipe(recipe)}>View</button>
                              <button className="card-btn" onClick={() => handleEditRecipe(recipe)}>Edit</button>
                              <button className="card-btn delete" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
            <div className="table-footer">Showing {filtered.length} of {recipes.length} recipes</div>
          </>
        )}

        {/* ── Table View ── */}
        {viewMode === "table" && (
          <>
            <div className="table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Recipe</th>
                    <th>Category</th>
                    <th>Ingredients</th>
                    <th>Prep Time</th>
                    <th>Servings</th>
                    <th>Usage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={7} className="empty-row">No recipes found.</td></tr>
                    : filtered.map(recipe => {
                        const style = getCatStyle(recipe.category);
                        return (
                          <tr key={recipe.id}>
                            <td className="item-name-cell">{getEmoji(recipe.category)} {recipe.name}</td>
                            <td>
                              <span
                                className="category-tag"
                                style={{ background: style.bg, color: style.color }}
                              >
                                {recipe.category}
                              </span>
                            </td>
                            <td>{(recipe.ingredients || []).length} items</td>
                            <td>{recipe.prepTime || "—"}</td>
                            <td>{recipe.servings || "—"}</td>
                            <td><span className="usage-pill">{recipe.usageCount || 0}×</span></td>
                            <td>
                              <div className="action-cell">
                                <button className="tbl-btn" onClick={() => setViewRecipe(recipe)}>View</button>
                                <button className="tbl-btn edit" onClick={() => handleEditRecipe(recipe)}>Edit</button>
                                <button className="tbl-btn delete" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
            <div className="table-footer">Showing {filtered.length} of {recipes.length} recipes</div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalMode && (
        <AddRecipeModal
          initial={modalMode === "edit" ? selectedRecipe : null}
          onClose={() => setModalMode(null)}
          onSave={handleSaveRecipe}
        />
      )}

      {/* ── View Modal ── */}
      {viewRecipe && (
        <div className="modal-overlay" onClick={() => setViewRecipe(null)}>
          <div className="rm-modal view-modal" onClick={e => e.stopPropagation()}>
            <div className="rm-modal-header">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  className="view-cat-icon"
                  style={{ background: getCatStyle(viewRecipe.category).bg }}
                >
                  {getEmoji(viewRecipe.category)}
                </div>
                <div>
                  <p className="rm-modal-title">{viewRecipe.name}</p>
                  <p className="rm-modal-sub">{viewRecipe.category}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewRecipe(null)}>✕</button>
            </div>

            <div className="view-body">
              <div className="view-meta-row">
                {viewRecipe.prepTime  && <span className="view-meta-chip">⏱ Prep: {viewRecipe.prepTime}</span>}
                {viewRecipe.cookTime  && <span className="view-meta-chip">🔥 Cook: {viewRecipe.cookTime}</span>}
                {viewRecipe.servings  && <span className="view-meta-chip">👤 {viewRecipe.servings} servings</span>}
                {viewRecipe.usageCount > 0 && <span className="view-meta-chip">📊 {viewRecipe.usageCount}× used</span>}
              </div>

              <div className="view-two-col">
                <div>
                  <p className="view-section-title">Ingredients</p>
                  <ul className="view-ing-list">
                    {(viewRecipe.ingredients || []).map((ing, i) => (
                      <li className="view-ing-item" key={i}>
                        <span className="view-ing-dot" />
                        {typeof ing === "string" ? ing : `${ing.quantity || ""} ${ing.unit || ""} ${ing.name || ""}`.trim()}
                      </li>
                    ))}
                    {(viewRecipe.ingredients || []).length === 0 && <li style={{ color: "#9ca3af", fontSize: 13 }}>No ingredients listed.</li>}
                  </ul>
                </div>
                <div>
                  <p className="view-section-title">Instructions</p>
                  <p className="view-instructions">
                    {viewRecipe.instructions || "No instructions provided."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rm-modal-footer">
              <div />
              <div className="footer-actions">
                <button className="btn-cancel-rm" onClick={() => setViewRecipe(null)}>Close</button>
                <button className="btn-save-rm" onClick={() => { setViewRecipe(null); handleEditRecipe(viewRecipe); }}>Edit Recipe</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;