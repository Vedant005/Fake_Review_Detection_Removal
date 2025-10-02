import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 text-xl font-bold border-b">Admin Panel</div>
        <nav className="p-6 space-y-4">
          <Link
            to="/admin/reviews"
            className="block py-2 px-4 rounded hover:bg-blue-100"
          >
            See All Reviews
          </Link>
          <Link
            to="/admin/analyze"
            className="block py-2 px-4 rounded hover:bg-blue-100"
          >
            Analyse Fake Reviews
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
