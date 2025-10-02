import React from "react";
import { Star } from "lucide-react";


const Home: React.FC = () => {
  const products = [
    {
      id: 1,
      name: "Noise Cancelling Headphones",
      price: "$129.99",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1580894742713-50e9e46ec7f1?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Smartwatch Pro",
      price: "$199.99",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Wireless Speaker",
      price: "$89.99",
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1589261259244-96d0e16a7b74?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      {/* <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">ShopSphere</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="border rounded-full pl-10 pr-4 py-2 w-72 focus:ring-2 focus:ring-indigo-400"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <button className="relative p-2">
              <ShoppingCart size={22} />
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
                2
              </span>
            </button>
          </div>
        </div>
      </header> */}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Your Shopping, Simplified</h2>
        <p className="text-lg mb-6">
          Discover the best deals on electronics, fashion, and more — all in one
          place.
        </p>
        <button className="px-6 py-3 bg-yellow-400 text-black rounded-lg font-semibold shadow hover:bg-yellow-300">
          Shop Now
        </button>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto py-12 px-6">
        <h3 className="text-2xl font-semibold mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4"
            >
              <img
                src={p.image}
                alt={p.name}
                className="h-48 w-full object-cover rounded-lg mb-4"
              />
              <h4 className="text-lg font-medium mb-2">{p.name}</h4>
              <p className="text-indigo-600 font-semibold">{p.price}</p>
              <div className="flex items-center gap-1 mt-2 text-yellow-500">
                {Array.from({ length: Math.floor(p.rating) }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
                {p.rating % 1 !== 0 && <Star size={16} />}
                <span className="text-gray-500 ml-2 text-sm">
                  {p.rating.toFixed(1)}
                </span>
              </div>
              <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
