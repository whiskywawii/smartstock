// Import necessary components and Firebase functions
import React, { useState, useMemo, useEffect } from "react";
import { db } from './firebase'; // Firebase configuration
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import AddItemModal from './AddItemModal'; // Import the AddItemModal
import './InventoryManagement.css'; // Import CSS for styling

// Define CATEGORIES and STATUS_OPTIONS
const CATEGORIES = ["All Categories", "Fresh Produce", "Proteins", "Dairy", "Pantry"];
const STATUS_OPTIONS = ["All Status", "In Stock", "Low Stock", "Out of Stock"];

// ─── Main Component (InventoryManagement) ─────────────────────────────────────

const InventoryManagement = () => {
  const [items, setItems]             = useState([]);
  const [search, setSearch]           = useState("");
  const [filterCat, setFilterCat]     = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Load items from Firestore on mount
  useEffect(() => {
    const itemsCollection = collection(db, "inventory_items_web");
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setItems(itemsData);
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);

  // Handle Add/Update Item
  const handleAdd = async (newItem) => {
    if (editingItem) {
      // Update existing item
      const itemRef = doc(db, "inventory_items_web", editingItem.id);
      await setDoc(itemRef, newItem);
    } else {
      // Add new item
      const itemsCollection = collection(db, "inventory_items_web");
      await addDoc(itemsCollection, newItem);
      if (newItem.status === "Low Stock") {
        alert("Warning: Item added with low stock!");
      }
    }
    setShowModal(false);
    setEditingItem(null);
  };

  // Handle Delete Item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "inventory_items_web", id));
    }
  };

  // Derived stats
  const totalItems = items.length;
  const lowStock   = items.filter(i => i.status === "Low Stock").length;
  const criticalItems = items.filter(i => i.status === "Out of Stock").length;

  // Filtered table based on search and filters
  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = filterCat === "All Categories" || item.category === filterCat;
      const matchStatus = filterStatus === "All Status" || item.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [items, search, filterCat, filterStatus]);

  return (
    <main className="main-content inv-page">
      {/* Page Header */}
      <div className="inv-page-header">
        <div className="inv-page-title-wrap">
          <div className="inv-page-icon">◫</div>
          <div>
            <h1 className="inv-page-title">Inventory Management</h1>
            <p className="inv-page-sub">Manage food items, quantities, and expiration dates</p>
          </div>
        </div>
        <button className="btn-add-item" onClick={() => setShowModal(true)}>
          + Add Item
        </button>
      </div>

      {/* Stats Row */}
      <div className="inv-stats-row">
        <div className="inv-stat-card">
          <div>
            <div className="inv-stat-label">Total Items</div>
            <div className="inv-stat-value">{totalItems}</div>
            <div className="inv-stat-note">Across all categories</div>
          </div>
          <div className="inv-stat-icon blue">◫</div>
        </div>
        <div className="inv-stat-card">
          <div>
            <div className="inv-stat-label">Low Stock</div>
            <div className="inv-stat-value orange">{lowStock}</div>
            <div className="inv-stat-note low">Items below reorder level</div>
          </div>
          <div className="inv-stat-icon orange">↘</div>
        </div>
        <div className="inv-stat-card">
          <div>
            <div className="inv-stat-label">Critical Items</div>
            <div className="inv-stat-value red">{criticalItems}</div>
            <div className="inv-stat-note critical">Need immediate action</div>
          </div>
          <div className="inv-stat-icon red">⚠</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="inv-card table-card">
        {/* Search & Filters */}
        <div className="table-toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No items match your search.</td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td className="item-name-cell">{item.name}</td>
                    <td>{item.category}</td>
                    <td className={item.quantity <= item.reorderLevel ? "qty-low" : ""}>{item.quantity}</td>
                    <td>{item.reorderLevel}</td>
                    <td>{item.expiryDate}</td>
                    <td>{item.status}</td>
                    <td>
                      <div className="action-cell">
                        <button className="tbl-btn edit" onClick={() => { setEditingItem(item); setShowModal(true); }}>✏ Edit</button>
                        <button className="tbl-btn delete" onClick={() => { handleDelete(item.id); }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          Showing {filtered.length} of {items.length} items
        </div>
      </div>

      {/* AddItemModal */}
      {showModal && <AddItemModal onClose={() => { setShowModal(false); setEditingItem(null); }} onAdd={handleAdd} editingItem={editingItem} />}
    </main>
  );
};

export default InventoryManagement;