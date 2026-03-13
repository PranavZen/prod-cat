import { NavLink } from "react-router-dom";
import { Button } from "../../components/common/index";

const links = [
  ["/admin", "Dashboard", "Overview"],
  ["/admin/products", "Products", "Catalogue records"],
  ["/admin/categories", "Categories", "Grouping structure"],
  ["/admin/attributes", "Attributes", "Dynamic fields"],
  ["/admin/variants", "Variants", "Row-level variants"],
  ["/admin/inventory", "Inventory", "Stock management"],
  ["/admin/price-rules", "Price Rules", "Discount rules"],
  ["/admin/stores", "Stores", "Multi-store config"],
  ["/admin/analytics", "Analytics", "Dashboard metrics"],
  ["/admin/import", "CSV Import", "Map and ingest files"],
];

const AdminSidebar = ({ onClose }) => {
  return (
    <aside className="flex flex-col h-full bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl shadow-slate-900/20">
      {/* Logo section */}
      <div className="grid gap-3 p-6 border-b border-white/10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-extrabold text-white ring-1 ring-inset ring-blue-300/20">
          CA
        </div>
        <div>
          <h2 className="m-0 text-2xl font-bold text-white">CataloguePro</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Unified product management platform
          </p>
        </div>
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg text-xl"
        >
          ✕
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 grid content-start gap-2.5 p-4 overflow-y-auto">
        {links.map(([to, label, caption]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "rounded-2xl border px-4 py-3 no-underline transition-all text-left",
                isActive
                  ? "border-blue-200/30 bg-gradient-to-r from-blue-600/95 to-sky-500/80 text-white shadow-lg shadow-blue-900/30"
                  : "border-white/8 bg-white/5 text-white hover:border-white/15 hover:bg-white/10",
              ].join(" ")
            }
          >
            <div className="font-bold text-sm">{label}</div>
            <div className="mt-1 text-xs text-slate-300">{caption}</div>
          </NavLink>
        ))}
      </nav>

      {/* Footer section */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <strong className="text-sm font-semibold text-white block">
            Quick Tips
          </strong>
          <p className="mt-2 text-xs text-slate-300">
            Use CSV import to bulk manage your products efficiently.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center"
          onClick={() => {
            // Handle help
            onClose?.();
          }}
        >
          📞 Get Help
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
