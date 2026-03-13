import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CategoryProductSection from "../../admin/products/CategoryProductSection";
import ProductFiltersBar from "../../admin/products/ProductFiltersBar";
import ProductTableView from "../../admin/products/ProductTableView";
import LoadingPanel from "../../components/LoadingPanel";
import Toast from "../../components/Toast";
import {
  deleteProduct,
  fetchCategories,
  fetchProducts,
  selectAllCategories,
  selectAllProducts,
  selectErrorByAction,
  selectLoadingByAction,
} from "../../store/catalogueSlice";

const getNumber = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;
const getInventoryValue = (product) =>
  getNumber(product.inventory_total ?? product.inventory ?? 0);
const getPriceValue = (product) =>
  getNumber(product.min_price ?? product.price ?? 0);
const chipClass = (active) =>
  [
    "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition",
    active
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
  ].join(" ");
const AdminProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useSelector(selectAllCategories);
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectLoadingByAction("fetchProducts"));
  const error = useSelector(selectErrorByAction("fetchProducts"));
  const [viewMode, setViewMode] = useState("grid");
  const [flash, setFlash] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    brand: "",
    status: "",
    stock_state: "",
    variant_mode: "",
    sort: "title_asc",
  });
  const loadAllData = useCallback(
    () =>
      Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchProducts({ pagination: { page: 1, pageSize: 5000 } })),
      ]),
    [dispatch],
  );

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  useEffect(() => {
    if (!location.state?.flashMessage) return;
    setFlash({
      tone: location.state.flashType || "success",
      message: location.state.flashMessage,
    });
    if (location.state.refreshOnLoad) loadAllData();
    navigate(location.pathname, { replace: true, state: null });
  }, [loadAllData, location.pathname, location.state, navigate]);
  useEffect(() => {
    if (!flash?.message) return undefined;
    const timer = window.setTimeout(() => setFlash(null), 3500);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.brand).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => {
          if (
            filters.category_id &&
            String(product.category_id) !== String(filters.category_id)
          )
            return false;
          if (filters.brand && String(product.brand) !== String(filters.brand))
            return false;
          if (
            filters.status &&
            String(product.status) !== String(filters.status)
          )
            return false;
          const inventory = getInventoryValue(product);
          if (filters.stock_state === "in_stock" && inventory <= 0)
            return false;
          if (
            filters.stock_state === "low_stock" &&
            !(inventory > 0 && inventory <= 5)
          )
            return false;
          if (filters.stock_state === "out_of_stock" && inventory > 0)
            return false;
          const variantCount = Number(product.variant_count || 1);
          if (filters.variant_mode === "single" && variantCount !== 1)
            return false;
          if (filters.variant_mode === "multi" && variantCount <= 1)
            return false;
          if (!filters.search) return true;
          const haystack = [
            product.title,
            product.brand,
            product.category_name,
            product.sku,
            Object.entries(product.option_values || {})
              .flatMap(([name, values]) => [name, ...(values || [])])
              .join(" "),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(filters.search.toLowerCase());
        })
        .sort((left, right) => {
          if (filters.sort === "title_desc")
            return String(right.title || "").localeCompare(
              String(left.title || ""),
            );
          if (filters.sort === "price_asc")
            return getPriceValue(left) - getPriceValue(right);
          if (filters.sort === "price_desc")
            return getPriceValue(right) - getPriceValue(left);
          if (filters.sort === "inventory_desc")
            return getInventoryValue(right) - getInventoryValue(left);
          if (filters.sort === "variants_desc")
            return (
              Number(right.variant_count || 1) - Number(left.variant_count || 1)
            );
          return String(left.title || "").localeCompare(
            String(right.title || ""),
          );
        }),
    [filters, products],
  );

  const categorySections = useMemo(
    () =>
      Object.entries(
        visibleProducts.reduce((acc, product) => {
          const key =
            product.category_name || product.category_id || "Uncategorized";
          if (!acc[key]) acc[key] = [];
          acc[key].push(product);
          return acc;
        }, {}),
      ).sort((a, b) => a[0].localeCompare(b[0])),
    [visibleProducts],
  );
  const lowStockCount = useMemo(
    () =>
      visibleProducts.filter((product) => {
        const inventory = getInventoryValue(product);
        return inventory > 0 && inventory <= 5;
      }).length,
    [visibleProducts],
  );
  const multiVariantCount = useMemo(
    () =>
      visibleProducts.filter(
        (product) => Number(product.variant_count || 1) > 1,
      ).length,
    [visibleProducts],
  );
  const handleDelete = async (productId) => {
    try {
      await dispatch(
        deleteProduct({ data: { product_id: productId } }),
      ).unwrap();
      setFlash({
        tone: "success",
        message: "Product deleted successfully from the sheet.",
      });
      await loadAllData();
    } catch (deleteError) {
      setFlash({
        tone: "error",
        message: deleteError.message || String(deleteError),
      });
    }
  };

  if (loading && !products.length)
    return (
      <LoadingPanel
        title="Loading catalogue admin"
        message="Fetching grouped products, categories, and variant summaries."
        variant={viewMode === "table" ? "table" : "cards"}
      />
    );

  return (
    <div className="grid gap-6">
      <Toast toast={flash} onDismiss={() => setFlash(null)} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-3xl font-bold text-slate-900">
            Catalogue Admin
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
            Browse all products category-wise, filter by stock and variant
            structure, and open create, view, edit, or delete actions from one
            place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={
                viewMode === "grid"
                  ? "btn-secondary !px-4 !py-2"
                  : "btn-ghost !px-4 !py-2"
              }
            >
              Grid view
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={
                viewMode === "table"
                  ? "btn-secondary !px-4 !py-2"
                  : "btn-ghost !px-4 !py-2"
              }
            >
              Table view
            </button>
          </div>
          <Link to="/admin/import" className="btn-outline">
            Upload CSV
          </Link>
          <Link to="/admin/products/new" className="btn-primary">
            Create product
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <strong className="text-3xl font-bold text-slate-900">
            {products.length}
          </strong>
          <div className="mt-2 text-sm text-slate-500">Total products</div>
        </div>
        <div className="stat-card">
          <strong className="text-3xl font-bold text-slate-900">
            {visibleProducts.length}
          </strong>
          <div className="mt-2 text-sm text-slate-500">Visible results</div>
        </div>
        <div className="stat-card">
          <strong className="text-3xl font-bold text-slate-900">
            {multiVariantCount}
          </strong>
          <div className="mt-2 text-sm text-slate-500">
            Multi-variant products
          </div>
        </div>
        <div className="stat-card">
          <strong className="text-3xl font-bold text-slate-900">
            {lowStockCount}
          </strong>
          <div className="mt-2 text-sm text-slate-500">Low stock products</div>
        </div>
      </div>
      <ProductFiltersBar
        categories={categories}
        brands={brands}
        filters={filters}
        resultCount={visibleProducts.length}
        onChange={setFilters}
        onRefresh={loadAllData}
        loading={loading}
      />
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() =>
            setFilters((current) => ({ ...current, category_id: "" }))
          }
          className={chipClass(!filters.category_id)}
        >
          All categories
        </button>
        {categorySections.map(([categoryName, rows]) => {
          const value = rows[0]?.category_id || categoryName;
          return (
            <button
              key={categoryName}
              type="button"
              onClick={() =>
                setFilters((current) => ({ ...current, category_id: value }))
              }
              className={chipClass(filters.category_id === value)}
            >
              {categoryName} ({rows.length})
            </button>
          );
        })}
      </div>
      {loading && !!products.length && (
        <LoadingPanel
          compact
          title="Refreshing catalogue"
          message="Updating filters and grouped product summaries."
          variant={viewMode === "table" ? "table" : "cards"}
        />
      )}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      )}
      {!loading && !error && !categorySections.length && (
        <div className="surface-card p-6 text-sm text-slate-500">
          No products matched your current filters.
        </div>
      )}
      {!loading &&
        !error &&
        !!visibleProducts.length &&
        viewMode === "table" && (
          <ProductTableView
            rows={visibleProducts}
            onEdit={(id) => navigate(`/admin/products/${id}`)}
            onDelete={handleDelete}
          />
        )}
      {!loading &&
        !error &&
        viewMode === "grid" &&
        categorySections.map(([categoryName, rows]) => (
          <CategoryProductSection
            key={categoryName}
            categoryName={categoryName}
            rows={rows}
            onEdit={(id) => navigate(`/admin/products/${id}`)}
            onDelete={handleDelete}
          />
        ))}
    </div>
  );
};

export default AdminProductsPage;
