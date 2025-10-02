import React from "react";
import { Star, ShoppingCart, Facebook, Twitter, Instagram } from "lucide-react";

// You can use higher-quality, more fitting images for a better visual appeal.
// These are sourced from Unsplash.
const products = [
  {
    id: 1,
    name: "Acoustic Pro Headphones",
    price: "$129.99",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Chronos Smartwatch",
    price: "$199.99",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Aura Wireless Speaker",
    price: "$89.99",
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80",
  },
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto flex flex-col justify-center items-center px-6 py-16 text-center md:py-24 md:text-left lg:flex-row">
          <div className="lg:w-1/2 lg:pr-12">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter text-gray-900 sm:text-5xl md:text-6xl">
              Unbeatable Deals, <span className="text-sky-600">Unmatched Quality.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Discover a curated selection of the finest electronics, gadgets, and accessories. Elevate your lifestyle with technology that inspires.
            </p>
            <div className="mt-8 flex justify-center gap-4 md:justify-start">
              <button className="transform rounded-lg bg-sky-600 px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:bg-sky-700">
                Explore Products
              </button>
              <button className="transform rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-transform duration-300 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-100">
                Learn More
              </button>
            </div>
          </div>
          <div className="mt-12 w-full max-w-lg lg:mt-0 lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80" 
              alt="Hero Product Showcase" 
              className="h-auto w-full rounded-2xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-slate-100 py-16 sm:py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Featured Products
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hand-picked selections that our customers love.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-bold text-sky-600">{product.price}</p>
                    <div className="flex items-center">
                      <Star size={20} className="text-yellow-400" fill="currentColor" />
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-3 font-semibold text-white transition-colors duration-300 hover:bg-sky-700">
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ShopSphere. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-sky-600"><Facebook size={24}/></a>
              <a href="#" className="text-gray-500 hover:text-sky-600"><Twitter size={24}/></a>
              <a href="#" className="text-gray-500 hover:text-sky-600"><Instagram size={24}/></a>
            </div>
            <div className="flex gap-6 text-sm">
                <a href="#" className="font-medium text-gray-600 hover:text-sky-600">Privacy Policy</a>
                <a href="#" className="font-medium text-gray-600 hover:text-sky-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;