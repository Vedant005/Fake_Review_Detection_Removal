// src/stores/useUserStore.ts
import { create } from "zustand";

interface User {
  id: string;
  user_name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  signup: (user_name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  signup: async (user_name, email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      set({ user: { id: data.id, user_name, email }, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      set({ token: data.token, error: null });
      // You can decode token here if needed
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },
}));
