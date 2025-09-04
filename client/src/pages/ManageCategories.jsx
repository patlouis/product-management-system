import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import SideBar from "../components/Sidebar";

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

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory(initialCategory);
    setEditId(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await axios.put(`${API}/${editId}`, newCategory);
        setCategories((prev) =>
          prev.map((c) => (c.category_id === editId ? data : c))
        );
      } else {
        const { data } = await axios.post(API, newCategory);
        setCategories((prev) => [...prev, data]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save category");
    }
  };

  const handleEdit = (category) => {
    setNewCategory({ name: category.name });
    setEditId(category.category_id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setCategories((prev) => prev.filter((c) => c.category_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete category");
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 p-8">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-lg text-gray-600 animate-pulse">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-semibold text-red-500">Error: {error}</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">
                Manage Categories
              </h1>
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
                      {["ID", "Name", "Products", "Created", "Updated", "Actions"].map(
                        (head) => (
                          <th key={head} className="px-6 py-3 font-bold">
                            {head}
                          </th>
                        )
                      )}
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
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            tabIndex={-1}
          >
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Category" : "Add Category"}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring focus:ring-gray-300"
                placeholder="Category name"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cursor-pointer rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
