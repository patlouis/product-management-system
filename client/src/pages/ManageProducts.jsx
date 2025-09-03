import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

const API = "http://localhost:3000/api/products";

const formatDate = (date) =>
  date ? dayjs(date).format("MMM D, YYYY h:mm A") : "N/A";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const initialProduct = { name: "", description: "", category: "", price: "" };
  const [newProduct, setNewProduct] = useState(initialProduct);

  const modalRef = useRef(null);

  useEffect(() => {
    fetchProducts();
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

  // Close modal + clear form
  const handleCloseModal = () => {
    setShowModal(false);
    setNewProduct(initialProduct);
  };

  // Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(API, newProduct);
      setProducts([...products, data]);
      handleCloseModal(); // ✅ close + reset
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add product");
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

    // Focus first input when modal opens
    const firstInput = modalRef.current?.querySelector("input, textarea");
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
                ].map((head) => (
                  <th key={head} className="px-6 py-3 font-medium">
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
                  <td className="px-6 py-3 text-gray-700">{p.category}</td>
                  <td className="px-6 py-3 font-medium text-green-600">
                    ₱{p.price}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(p.updated_at)}
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
              Add New Product
            </h2>

            <form onSubmit={handleAddProduct} className="space-y-4">
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
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
              />
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
