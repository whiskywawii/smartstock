import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import './AddRecipeModal.css';

const COLLECTION = "recipe_web"; // ← must match RecipeManagement.jsx

const EMPTY_FORM = {
  name: "",
  category: "Breakfast",
  status: "Active",
  difficulty: "Easy",
  prepTime: "",
  cookTime: "",
  servings: "",
  ingredients: [""],
  instructions: "",
};

const AddRecipeModal = ({ initial, onClose, onSave }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { ...initial, ingredients: Array.isArray(initial.ingredients) ? [...initial.ingredients] : [""] }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setIngredient = (i, v) => {
    const arr = [...form.ingredients];
    arr[i] = v;
    setForm(f => ({ ...f, ingredients: arr }));
  };

  const addIngredient = () =>
    setForm(f => ({ ...f, ingredients: [...f.ingredients, ""] }));

  const removeIngredient = (i) =>
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name         = "Recipe name is required";
    if (!form.prepTime)                           e.prepTime     = "Required";
    if (!form.servings)                           e.servings     = "Required";
    if (form.ingredients.every(x => !x.trim()))  e.ingredients  = "Add at least one ingredient";
    if (!form.instructions.trim())               e.instructions = "Instructions are required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name:         form.name.trim(),
      category:     form.category,
      status:       form.status,
      difficulty:   form.difficulty,
      prepTime:     parseInt(form.prepTime)  || 0,
      cookTime:     parseInt(form.cookTime)  || 0,
      servings:     parseInt(form.servings)  || 0,
      ingredients:  form.ingredients.filter(x => x.trim()),
      instructions: form.instructions.trim(),
      updatedAt:    serverTimestamp(),
    };

    try {
      if (isEdit) {
        // preserve existing usageCount & createdAt — don't overwrite them
        const recipeRef = doc(db, COLLECTION, initial.id);
        await updateDoc(recipeRef, payload);
      } else {
        await addDoc(collection(db, COLLECTION), {
          ...payload,
          usageCount: 0,
          createdAt:  serverTimestamp(),
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving recipe:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? `Edit ${initial.name}` : "Add New Recipe"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Name */}
          <div>
            <label>Recipe Name *</label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="err-txt">{errors.name}</span>}
          </div>

          {/* Category */}
          <div>
            <label>Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
              <option>Dessert</option>
              <option>Beverage</option>
              <option>Vegan</option>
            </select>
          </div>

          {/* Prep / Cook / Servings */}
          <div>
            <label>Prep Time (min) *</label>
            <input
              type="number" min="0"
              value={form.prepTime}
              onChange={e => set("prepTime", e.target.value)}
              className={errors.prepTime ? "input-error" : ""}
            />
            {errors.prepTime && <span className="err-txt">{errors.prepTime}</span>}
          </div>

          <div>
            <label>Cook Time (min)</label>
            <input
              type="number" min="0"
              value={form.cookTime}
              onChange={e => set("cookTime", e.target.value)}
            />
          </div>

          <div>
            <label>Servings *</label>
            <input
              type="number" min="1"
              value={form.servings}
              onChange={e => set("servings", e.target.value)}
              className={errors.servings ? "input-error" : ""}
            />
            {errors.servings && <span className="err-txt">{errors.servings}</span>}
          </div>

          {/* Status / Difficulty */}
          <div>
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Draft</option>
            </select>
          </div>

          <div>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={e => set("difficulty", e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Ingredients */}
          <div>
            <label>Ingredients *</label>
            {form.ingredients.map((ing, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input
                  value={ing}
                  onChange={e => setIngredient(i, e.target.value)}
                  placeholder={`Ingredient ${i + 1}`}
                  style={{ flex: 1 }}
                />
                {form.ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngredient}>+ Add Ingredient</button>
            {errors.ingredients && <span className="err-txt">{errors.ingredients}</span>}
          </div>

          {/* Instructions */}
          <div>
            <label>Instructions *</label>
            <textarea
              value={form.instructions}
              onChange={e => set("instructions", e.target.value)}
              className={errors.instructions ? "input-error" : ""}
              rows={5}
            />
            {errors.instructions && <span className="err-txt">{errors.instructions}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;