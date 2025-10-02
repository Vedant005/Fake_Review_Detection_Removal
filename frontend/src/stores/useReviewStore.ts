import { create } from "zustand";

export interface Review {
  id: string;
  product_id?: string;
  user_id: string;
  rating: number;
  review_text: string;
  timestamp: string;
}

interface ReviewState {
  reviews: Review[];
  singleReview: Review | null;
  loading: boolean;
  nextCursor: string | null;
  limit: number;

  fetchReviews: (productId?: string, reset?: boolean) => Promise<void>;
  fetchSingleReview: (reviewId: string) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "timestamp">) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<Review>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  singleReview: null,
  loading: false,
  nextCursor: null,
  limit: 10,

  // Fetch reviews (supports product filter + cursor pagination)
  fetchReviews: async (productId, reset = false) => {
    try {
      set({ loading: true });

      const cursor = reset ? null : get().nextCursor;
      const limit = get().limit;

      const url = new URL("http://localhost:5000/api/reviews/");
      url.searchParams.append("limit", String(limit));
      if (cursor) url.searchParams.append("cursor", cursor);
      if (productId) url.searchParams.append("product_id", productId);

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success) {
        set({
          reviews: reset ? data.data : [...get().reviews, ...data.data],
          nextCursor: data.next_cursor,
        });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch a single review
  fetchSingleReview: async (reviewId) => {
    try {
      set({ loading: true });
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`);
      const data = await res.json();
      set({ singleReview: data });
    } catch (err) {
      console.error("Error fetching single review:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Add new review
  addReview: async (review) => {
    try {
      set({ loading: true });
      const res = await fetch("http://localhost:5000/api/reviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      if (data.id) {
        set({ reviews: [{ ...review, id: data.id, timestamp: new Date().toISOString() }, ...get().reviews] });
      }
    } catch (err) {
      console.error("Error adding review:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Update review
  updateReview: async (reviewId, updates) => {
    try {
      set({ loading: true });
      await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      set({
        reviews: get().reviews.map((r) =>
          r.id === reviewId ? { ...r, ...updates } : r
        ),
      });
    } catch (err) {
      console.error("Error updating review:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      set({ loading: true });
      await fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: "DELETE" });
      set({ reviews: get().reviews.filter((r) => r.id !== reviewId) });
    } catch (err) {
      console.error("Error deleting review:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
