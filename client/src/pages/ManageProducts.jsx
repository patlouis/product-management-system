import { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import SideBar from "../components/Sidebar";

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

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(CATEGORY_API);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewProduct(initialProduct);
    setEditId(null);
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setProducts((prev) => prev.filter((p) => p.product_id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product");
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

    const firstInput = modalRef.current?.querySelector("input, textarea, select");
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
                        <td className="px-6 py-3 text-gray-700">{p.category_name}</td>
                        <td className="px-6 py-3 font-sm text-green-600">
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
              {editId ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Name */}
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring focus:ring-gray-300"
                placeholder="Product name"
                required
              />

              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring focus:ring-gray-300"
                placeholder="Product description"
                rows={3}
                required
              />

              {/* Category */}
              <select
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring focus:ring-gray-300"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Price */}
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="w-full rounded-lg border px-4 py-2 focus:ring focus:ring-gray-300"
                placeholder="Price"
                required
              />

              {/* Buttons */}
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
