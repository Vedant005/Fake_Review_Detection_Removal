import { NavLink } from "react-router-dom";

export default function Header() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-blue-600">
            ShopSphere
          </div>

          {/* Navigation */}
          <nav className="flex space-x-4">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClasses}>
              Products
            </NavLink>
            <NavLink to="/admin" className={navLinkClasses}>
              Admin
            </NavLink>
            <NavLink to="/profile" className={navLinkClasses}>
              Profile
            </NavLink>
            <NavLink to="/signup" className={navLinkClasses}>
              Signup
            </NavLink>
            <NavLink to="/login" className={navLinkClasses}>
              Login
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
