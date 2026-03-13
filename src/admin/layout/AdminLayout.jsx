import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../sidebar/AdminSidebar";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle =
    location.pathname.split("/").filter(Boolean).slice(-1)[0] || "dashboard";

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-40 w-72 h-screen transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1 flex flex-col">
        {/* Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-2xl">☰</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900 capitalize">
            {pageTitle.replace(/-/g, " ")}
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto grid max-w-8xl gap-5">
            <header className="hidden lg:flex surface-muted flex-wrap items-center justify-between gap-4 px-6 py-5 bg-white rounded-lg">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
                  Catalogue workspace
                </div>
                <h1 className="mt-2 text-2xl font-bold capitalize text-slate-900 sm:text-3xl">
                  {pageTitle.replace(/-/g, " ")}
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/" className="btn-outline">
                  View storefront
                </Link>
                <Link to="/admin/import" className="btn-secondary">
                  CSV Import Studio
                </Link>
              </div>
            </header>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
