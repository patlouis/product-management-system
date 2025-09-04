import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API = "http://localhost:3000/api/categories";

const formatDate = (date) =>
  date ? dayjs(date).format("MMM D, YYYY h:mm A") : "N/A";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const initialCategory = { name: "" };
  const [newCategory, setNewCategory] = useState(initialCategory);
  const [editId, setEditId] = useState(null);

  const modalRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(API);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Close modal + reset
  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory(initialCategory);
    setEditId(null);
  };

  // Save category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await axios.put(`${API}/${editId}`, newCategory);
        setCategories(categories.map((c) => (c.category_id === editId ? data : c)));
      } else {
        const { data } = await axios.post(API, newCategory);
        setCategories([...categories, data]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save category");
    }
  };

  // Edit
  const handleEdit = (category) => {
    setNewCategory(category);
    setEditId(category.category_id);
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setCategories(categories.filter((c) => c.category_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete category");
    }
  };

  // Modal behavior: Escape key, trap focus
  useEffect(() => {
    if (!showModal) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") handleCloseModal();
    };

    const trapFocus = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        e.stopPropagation();
        modalRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.addEventListener("focus", trapFocus, true);

    const firstInput = modalRef.current?.querySelector("input");
    firstInput?.focus();

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("focus", trapFocus, true);
    };
  }, [showModal]);

  // Loading/Error UI
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-semibold text-red-500">Error: {error}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-xl bg-gray-600 px-5 py-2 font-medium text-white shadow-md transition hover:bg-gray-700"
        >
          + Add Category
        </button>
      </div>

      {/* Categories Table */}
      {categories.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-12 text-center shadow">
          <p className="text-gray-500">No categories found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100 text-left text-gray-700">
              <tr>
                {["ID", "Name", "Products", "Created", "Updated", "Actions"].map((head) => (
                  <th key={head} className="px-6 py-3 font-bold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr
                  key={c.category_id}
                  className={`transition-colors hover:bg-gray-50 ${
                    idx % 2 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 text-gray-700">{c.category_id}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{c.products}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(c.updated_at)}
                  </td>
                  <td className="px-6 py-3 flex gap-3">
                    <button
                      onClick={() => handleEdit(c)}
                      className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.category_id)}
                      className="cursor-pointer rounded-lg bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handleCloseModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            tabIndex="-1"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editId ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
                required
              />

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gray-600 px-5 py-2 font-medium text-white hover:bg-gray-700"
                >
                  {editId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
