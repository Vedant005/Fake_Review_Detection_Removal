import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useNavigate } from "react-router-dom";

const ProductPage: React.FC = () => {
  const { products, fetchProducts, loading, nextCursor } = useProductStore();
  const navigate = useNavigate();
  useEffect(() => {
    fetchProducts(true); // fetch initial batch
  }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
             onClick={() => navigate(`/product/${p.id}`)}
            className="bg-white rounded-lg border-blue-500 shadow hover:shadow-lg transition p-4"
          >
            <h2 className="text-lg font-semibold mb-2">{p.name}</h2>
            <p className="text-sm text-gray-500 break-words">{p.category}</p>
            <p className="mt-2 text-gray-700 line-clamp-3">{p.about_product}</p>
            <div className="mt-3">
              <span className="text-indigo-600 font-bold">{p.actual_price}</span>
              {p.discount_percentage && (
                <span className="ml-2 text-sm text-green-600">
                  {p.discount_percentage} off
                </span>
              )}
            </div>
            <div className="mt-2 text-yellow-500 text-sm">
              ⭐ {p.rating?.toFixed(1)} ({p.rating_count})
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => fetchProducts(false)}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
