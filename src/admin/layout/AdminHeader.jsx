import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/common/index";

/**
 * Admin Header with navigation and user menu
 */
export default function AdminHeader({ onMenuClick }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  // Get page title based on current route
  const getTitleFromPath = () => {
    const path = location.pathname;
    const titles = {
      "/admin": "Dashboard",
      "/admin/products": "Products",
      "/admin/categories": "Categories",
      "/admin/attributes": "Attributes",
      "/admin/inventory": "Inventory",
      "/admin/price-rules": "Price Rules",
      "/admin/stores": "Stores",
      "/admin/import": "CSV Import",
      "/admin/analytics": "Analytics",
      "/admin/settings": "Settings",
    };
    return titles[path] || "Admin";
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="flex items-center justify-between p-4 md:p-6">
        {/* Left section: Menu button + title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            ☰
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {getTitleFromPath()}
          </h1>
        </div>

        {/* Right section: Search + Notifications + User menu */}
        <div className="flex items-center gap-4">
          {/* Search (hidden on mobile) */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
          </div>

          {/* Notifications (placeholder) */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </span>
              <span className="hidden md:inline text-gray-400">▼</span>
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    // Handle logout
                    setUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="flex md:hidden px-4 pb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </header>
  );
}
