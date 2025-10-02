import { useState } from "react";
import { useReviewStore } from "../stores/useReviewStore";

interface ReviewResult {
  review_id: string;
  user_id: string;
  rule_based: string | null;
  ml: {
    confidence: number;
    is_fake_ml: boolean;
  };
  behavioral: {
    is_fake_behavioral: boolean;
    flags: string[];
    suspicious_score: number;
  };
  is_fake_final: boolean;
}

export default function AnalyzeReviews() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedReview, setSelectedReview] = useState<ReviewResult | null>(null);
  const deleteReview = useReviewStore((state) => state.deleteReview);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:5000/api/reviews/analyze_all", {
        method: "POST",
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error analyzing reviews");
    } finally {
      setLoading(false);
    }
  };

    const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      // Update UI after delete
      setResult((prev: any) => ({
        ...prev,
        flagged_reviews: prev.flagged_reviews.filter(
          (r: any) => r.review_id !== reviewId
        ),
      }));
        setSelectedReview(null); // close modal if open

    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">🕵️ Analyse Fake Reviews</h1>

      <button
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow hover:scale-105 transition"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "🔎 Analyzing..." : "🚀 Start Analysis"}
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-lg font-semibold">Total Analyzed</h2>
              <p className="text-3xl font-bold text-blue-600">
                {result.total_analyzed}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-lg font-semibold">Fake Reviews</h2>
              <p className="text-3xl font-bold text-red-600">
                {result.fake_count}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <h2 className="text-lg font-semibold">Flagged Users</h2>
              <p className="text-3xl font-bold text-yellow-600">
                {result.flagged_users.length}
              </p>
            </div>
          </div>

          {/* Flagged Reviews List */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">🚩 Flagged Reviews</h2>
            {result.flagged_reviews.length === 0 ? (
              <p className="text-gray-600">✅ No fake reviews detected!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border">Review ID</th>
                      <th className="p-3 border">User ID</th>
                      <th className="p-3 border">Flags</th>
                      <th className="p-3 border">Behavioral Score</th>
                      <th className="p-3 border">ML Confidence</th>
                      <th className="p-3 border">Final Verdict</th>
                      <th className="p-3 border">Action</th>

                      
                    </tr>
                  </thead>
                  <tbody>
                    {result.flagged_reviews.map((r: any) => (
                      <tr
                        key={r.review_id}
                        className="hover:bg-gray-50 transition"
                          onClick={() => setSelectedReview(r)}
                      >
                        <td className="p-3 border font-mono">{r.review_id}</td>
                        <td className="p-3 border font-mono text-sm">
                          {r.user_id}
                        </td>
                        <td className="p-3 border">
                          {r.behavioral.flags.map((f: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded mr-2"
                            >
                              {f}
                            </span>
                          ))}
                        </td>
                        <td className="p-3 border text-center">
                          {r.behavioral.suspicious_score}
                        </td>
                        <td className="p-3 border text-center">
                          {(r.ml.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="p-3 border font-bold text-red-600">
                          {r.is_fake_final ? "Fake" : "Legit"}
                        </td>
                         <td className="px-4 py-2">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDelete(r.review_id)}
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
            {selectedReview && (
        <div
          className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-opacity-40"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()} // stop closing when clicking inside
          >
            <h2 className="text-xl font-bold mb-4">
              Review Details (ID: {selectedReview.review_id})
            </h2>
            <p><strong>User ID:</strong> {selectedReview.user_id}</p>
            <p><strong>Rule Based:</strong> {selectedReview.rule_based}</p>
            <p><strong>ML Result:</strong> {selectedReview.ml.is_fake_ml ? "Fake" : "Genuine"} (confidence: {selectedReview.ml.confidence})</p>
            <p>
              <strong>Behavioral:</strong>{" "}
              {selectedReview.behavioral.is_fake_behavioral ? "Suspicious" : "Normal"}
            </p>
            <p>
              <strong>Flags:</strong>{" "}
              {selectedReview.behavioral.flags.join(", ") || "None"}
            </p>
            <p>
              <strong>Suspicious Score:</strong>{" "}
              {selectedReview.behavioral.suspicious_score}
            </p>
            <p>
              <strong>Final Decision:</strong>{" "}
              {selectedReview.is_fake_final ? (
                <span className="text-red-600 font-semibold">Fake</span>
              ) : (
                <span className="text-green-600 font-semibold">Genuine</span>
              )}
            </p>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(selectedReview.review_id)}
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      )}
    </div>
  );
}
