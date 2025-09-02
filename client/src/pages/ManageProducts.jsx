import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/products");
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Loading products...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 font-semibold">Error: {error}</p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Manage Products
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-50 p-8 rounded-2xl shadow-md">
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-gray-100">
          <table className="w-full text-sm md:text-base border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs md:text-sm tracking-wider">
                <th className="px-6 py-4 text-left">ID</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Description</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Price</th>
                <th className="px-6 py-4 text-left">Created At</th>
                <th className="px-6 py-4 text-left">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr
                  key={p.product_id}
                  className={`border-t border-gray-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 text-gray-700">{p.product_id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.description}</td>
                  <td className="px-6 py-4 text-gray-700">{p.category}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">
                    ₱{p.price}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {p.updated_at
                      ? new Date(p.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;
