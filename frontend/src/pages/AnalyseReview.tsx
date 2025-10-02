import  { useState } from "react";

export default function AnalyzeReviews() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/reviews/analyze_all", {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message || "Analysis complete");
    } catch (err) {
      console.error(err);
      setMessage("Error analyzing reviews");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analyse Fake Reviews</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Start Analysis"}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
