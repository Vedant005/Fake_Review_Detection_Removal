import {  useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useReviewStore } from "../stores/useReviewStore";
import { useUserStore } from "../stores/useUserStore";

// interface Product {
//   id: string;
//   name: string;
//   image: string;
//   price: number;
//   description: string;
//   reviews: { user: string; comment: string; rating: number }[];
// }

export default function SingleProduct() {
  const {fetchSingleProduct, singleProduct}= useProductStore();
  const { reviews, fetchReviews, addReview } = useReviewStore();
  const {user}=useUserStore();
  const { productId } = useParams();
  console.log(user);
  
  useEffect(() => {
    fetchSingleProduct(productId);
    fetchReviews(productId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

//   const [reviews, setReviews] = useState(reviews || []);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
//   const handleAddReview = () => {
//     if (!newReview.trim()) return;
//     const review = { user: "Anonymous", comment: newReview, rating: newRating };
//     setReviews([review, ...reviews]);
//     setNewReview("");
//     setNewRating(5);
//   };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={"https://picsum.photos/id/870/200/300"}
          alt={singleProduct.name}
          className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
        />
        <div>
          <h1 className="text-3xl font-bold mb-3">{singleProduct.name}</h1>
          <p className="text-gray-700 mb-4">{singleProduct.about_product}</p>
          <p className="text-2xl font-semibold text-green-600 mb-6">
            ${singleProduct.actual_price}
          </p>
          <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-md">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="p-4 border rounded-xl shadow-sm bg-white"
              >
                {/* <p className="font-semibold">{r.user}</p> */}
                <p className="text-yellow-500">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </p>
                <p>{r.review_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Review */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-semibold mb-3">Write a Review</h3>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          className="w-full p-3 border rounded-xl mb-3"
          rows={3}
          placeholder="Share your thoughts..."
        />
        <div className="flex items-center gap-4 mb-3">
          <label className="font-medium">Rating:</label>
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() =>
          addReview({
            product_id: productId,
            user_id: user?.id,
            rating: newRating,
            review_text:newReview,
          })
        }
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}
