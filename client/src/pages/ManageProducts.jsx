import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API = "http://localhost:3000/api/products";
const CATEGORY_API = "http://localhost:3000/api/categories";

const formatDate = (date) =>
  date ? dayjs(date).format("MMM D, YYYY h:mm A") : "N/A";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const initialProduct = {
    name: "",
    description: "",
    category_id: "",
    price: "",
  };

  const [newProduct, setNewProduct] = useState(initialProduct);
  const [editId, setEditId] = useState(null);

  const modalRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(CATEGORY_API);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // Close modal + clear form
  const handleCloseModal = () => {
    setShowModal(false);
    setNewProduct(initialProduct);
    setEditId(null);
  };

  // Add or Update product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, newProduct);
        await fetchProducts();
      } else {
        const { data } = await axios.post(API, newProduct);
        setProducts((prev) => [...prev, data]);
      }
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save product");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setNewProduct({
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      price: product.price || "",
    });
    setEditId(product.product_id);
    setShowModal(true);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product");
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

    const firstInput = modalRef.current?.querySelector("input, textarea, select");
    firstInput?.focus();

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.removeEventListener("focus", trapFocus, true);
    };
  }, [showModal]);

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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-xl bg-gray-600 px-5 py-2 font-medium text-white shadow-md transition hover:bg-gray-700"
        >
          + Add Product
        </button>
      </div>

      {/* Product Table */}
      {products.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-12 text-center shadow">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100 text-left text-gray-700">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Description",
                  "Category",
                  "Price",
                  "Created",
                  "Updated",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-6 py-3 font-bold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr
                  key={p.product_id}
                  className={`transition-colors hover:bg-gray-50 ${
                    idx % 2 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 text-gray-700">{p.product_id}</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{p.description}</td>
                  <td className="px-6 py-3 text-gray-700">{p.category_name}</td>
                  <td className="px-6 py-3 font-medium text-green-600">
                    ₱{p.price}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(p.updated_at)}
                  </td>
                  <td className="px-6 py-3 flex gap-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.product_id)}
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
              {editId ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
                required
              />

              {/* Category Dropdown */}
              <select
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price (₱)"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
                required
              />

              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows="3"
                className="w-full resize-none rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
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
