import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  category: string;
  about_product: string;
  rating: number;
  rating_count: number;
  discount_percentage: string;
  actual_price: string;
}

interface ProductState {
  singleProduct: Product;
  products: Product[];
  loading: boolean;
  nextCursor: string | null;
  limit: number;
  fetchProducts: (reset?: boolean) => Promise<void>;
  fetchSingleProduct: (productId?:string) => Promise<void>;

}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  singleProduct:{
    id: "",
  name: "",
  category: "",
  about_product: "",
  rating:0,
  rating_count: 0,
  discount_percentage: "",
  actual_price: ""
  },
  loading: false,
  nextCursor: null,
  limit: 20,

  fetchProducts: async (reset = false) => {
    try {
      set({ loading: true });

      const cursor = reset ? null : get().nextCursor;
      const limit = get().limit;

      const url = new URL("http://localhost:5000/api/products/");
      url.searchParams.append("limit", String(limit));
      if (cursor) url.searchParams.append("cursor", cursor);

      const res = await fetch(url.toString());
      const data = await res.json();
      console.log(data);
      
      if (data.success) {
        set({
          products: reset ? data.data : [...get().products, ...data.data],
          nextCursor: data.next_cursor,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchSingleProduct :async(productId)=>{
    try {
      set({ loading: true });

      const url = new URL(`http://localhost:5000/api/products/${productId}`);
      
      const res = await fetch(url.toString());
      const data = await res.json();
     
      if (data.success) {
        set({
          singleProduct: data.data
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      set({ loading: false });
    }
  }
}));
