import React, { useState, useEffect } from 'react';
import './AddItemModal.css';

const AddItemModal = ({ onClose, onAdd, editingItem }) => {
  const [form, setForm] = useState({
    name: '',
    category: 'Fresh Produce',
    quantity: '',
    reorderLevel: '',
    expiryDate: '',
    status: 'In Stock',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity.toString(),
        reorderLevel: editingItem.reorderLevel.toString(),
        expiryDate: editingItem.expiryDate,
        status: editingItem.status,
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())   errs.name         = 'Name is required';
    if (!form.quantity)       errs.quantity      = 'Quantity is required';
    if (!form.reorderLevel)   errs.reorderLevel  = 'Reorder level is required';
    if (!form.expiryDate)     errs.expiryDate    = 'Expiry date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const item = {
      ...form,
      quantity:     parseInt(form.quantity),
      reorderLevel: parseInt(form.reorderLevel),
      status: parseInt(form.quantity) <= parseInt(form.reorderLevel) ? 'Low Stock' : 'In Stock',
    };
    onAdd(item);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-title">{editingItem ? 'Edit Item' : 'Add New Item'}</p>
            <p className="modal-sub">
              {editingItem ? 'Update the item details below' : 'Fill in the details to add a new item'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Name */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="e.g. Chicken Breast"
            />
            {errors.name && <span className="err-msg">{errors.name}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Proteins">Proteins</option>
              <option value="Dairy">Dairy</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>

          {/* Quantity + Reorder Level side by side */}
          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'input-error' : ''}
                placeholder="0"
                min="0"
              />
              {errors.quantity && <span className="err-msg">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label>Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={form.reorderLevel}
                onChange={handleChange}
                className={errors.reorderLevel ? 'input-error' : ''}
                placeholder="0"
                min="0"
              />
              {errors.reorderLevel && <span className="err-msg">{errors.reorderLevel}</span>}
            </div>
          </div>

          {/* Expiry Date */}
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className={errors.expiryDate ? 'input-error' : ''}
            />
            {errors.expiryDate && <span className="err-msg">{errors.expiryDate}</span>}
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-add" onClick={handleSubmit}>
            {editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddItemModal;