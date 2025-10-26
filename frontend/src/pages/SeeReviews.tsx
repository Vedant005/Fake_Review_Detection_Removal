import { useEffect, useState } from "react";
import { useReviewStore, type Review } from "./../stores/useReviewStore";

export default function SeeReviews() {
  const { reviews, loading, nextCursor, fetchReviews, deleteReview } = useReviewStore();
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews(undefined, true); // fetch all reviews on mount
  }, [fetchReviews]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview(id);
    }
  };

  const handleLoadMore = () => {
    fetchReviews(); // fetch next page using cursor
  };

  const trimText = (text: string, limit = 10) => {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Reviews</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((r: Review) => (
              <tr
                key={r.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedReview(r)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.product_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.rating}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trimText(r.review_text, 30)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  onClick={(e) => e.stopPropagation()} // prevent row click
                >
                  <button
                    className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="mt-4">Loading...</p>}

      {nextCursor && !loading && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}

      {!nextCursor && !loading && <p className="mt-4 text-gray-500">No more reviews</p>}

      {selectedReview && (
        <div
          className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Review Details</h2>

            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {selectedReview.id}</p>
              <p><strong>Product ID:</strong> {selectedReview.product_id}</p>
              <p><strong>User ID:</strong> {selectedReview.user_id}</p>
              <p><strong>Rating:</strong> {selectedReview.rating}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedReview.timestamp).toLocaleString()}</p>
              <p><strong>Review Text:</strong></p>
              <p className="bg-gray-100 p-2 rounded">{selectedReview.review_text}</p>
            </div>

            <div className="mt-6 text-right">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
