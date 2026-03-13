import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ProductGrid from "../../catalogue/ProductGrid";
import { fetchCategories, fetchProducts, selectAllCategories, selectAllProducts, selectLoadingByAction } from "../../store/catalogueSlice";

const getNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const chipClass = (active) => ["inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition", active ? "border-blue-600 bg-blue-600 text-white" : "border-blue-100 bg-white text-blue-700 hover:border-blue-200 hover:bg-blue-50"].join(" ");

const CataloguePage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectLoadingByAction("fetchProducts"));
  const [filters, setFilters] = useState({ search: "", category_id: "", brand: "", stock_state: "", variant_mode: "", sort: "featured" });

  useEffect(() => {
    dispatch(fetchProducts({ pagination: { page: 1, pageSize: 5000 } }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const totalVariants = useMemo(() => products.reduce((sum, product) => sum + Number(product.variant_count || 1), 0), [products]);
  const categorySummaries = useMemo(() => Object.values(products.reduce((acc, product) => {
    const key = String(product.category_id || product.category_name || "Uncategorized");
    if (!acc[key]) acc[key] = { category_id: product.category_id || key, name: product.category_name || product.category_id || "Uncategorized", count: 0 };
    acc[key].count += 1;
    return acc;
  }, {})).sort((a, b) => String(a.name).localeCompare(String(b.name))), [products]);

  const availableBrands = useMemo(() => {
    const scoped = filters.category_id ? products.filter((product) => String(product.category_id) === String(filters.category_id)) : products;
    return Array.from(new Set(scoped.map((product) => product.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [filters.category_id, products]);

  useEffect(() => {
    if (filters.brand && !availableBrands.includes(filters.brand)) setFilters((current) => ({ ...current, brand: "" }));
  }, [availableBrands, filters.brand]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    if (filters.category_id && String(product.category_id) !== String(filters.category_id)) return false;
    if (filters.brand && String(product.brand) !== String(filters.brand)) return false;
    const inventory = getNumber(product.inventory_total ?? product.inventory ?? 0);
    if (filters.stock_state === "in_stock" && inventory <= 0) return false;
    if (filters.stock_state === "low_stock" && !(inventory > 0 && inventory <= 5)) return false;
    if (filters.stock_state === "out_of_stock" && inventory > 0) return false;
    const variantCount = Number(product.variant_count || 1);
    if (filters.variant_mode === "single" && variantCount !== 1) return false;
    if (filters.variant_mode === "multi" && variantCount <= 1) return false;
    if (!filters.search) return true;
    const haystack = [product.title, product.brand, product.description, product.category_name, product.category_id, product.sku, Object.entries(product.option_values || {}).flatMap(([name, values]) => [name, ...(values || [])]).join(" ")].join(" ").toLowerCase();
    return haystack.includes(filters.search.toLowerCase());
  }).sort((left, right) => {
    if (filters.sort === "title_asc") return String(left.title || "").localeCompare(String(right.title || ""));
    if (filters.sort === "title_desc") return String(right.title || "").localeCompare(String(left.title || ""));
    if (filters.sort === "price_asc") return getNumber(left.min_price || left.price) - getNumber(right.min_price || right.price);
    if (filters.sort === "price_desc") return getNumber(right.min_price || right.price) - getNumber(left.min_price || left.price);
    if (filters.sort === "inventory_desc") return getNumber(right.inventory_total || right.inventory) - getNumber(left.inventory_total || left.inventory);
    if (filters.sort === "variants_desc") return Number(right.variant_count || 1) - Number(left.variant_count || 1);
    return String(left.category_name || left.category_id || "").localeCompare(String(right.category_name || right.category_id || "")) || String(left.title || "").localeCompare(String(right.title || ""));
  }), [filters, products]);

  const activeCategoryName = categorySummaries.find((category) => String(category.category_id) === String(filters.category_id))?.name || "All categories";

  return (
    <div className="page-shell">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-700 to-sky-400 px-6 py-8 text-white shadow-soft sm:px-8 lg:grid lg:grid-cols-[minmax(0,1.4fr)_320px] lg:items-center lg:px-10 lg:py-10">
        <div>
          <p className="m-0 text-xs font-bold uppercase tracking-[0.3em] text-white/80">Modern product catalogue</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">Discover products with clearer category browsing and real variant selection</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">Browse a grouped catalogue where one product can hold many variants by color, storage, size, or any custom attribute.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link to="/admin/products" className="btn-outline border-white/20 bg-white text-slate-950 hover:bg-slate-100">Open admin panel</Link><Link to="/admin/import" className="btn-outline border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">Import supplier CSV</Link></div>
        </div>
        <div className="mt-6 grid gap-4 lg:mt-0">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"><strong className="text-3xl font-bold">{products.length}</strong><div className="mt-2 text-sm text-white/80">Grouped products</div></div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"><strong className="text-3xl font-bold">{totalVariants}</strong><div className="mt-2 text-sm text-white/80">Variants available</div></div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"><strong className="text-3xl font-bold">{categorySummaries.length || categories.length}</strong><div className="mt-2 text-sm text-white/80">Categories</div></div>
        </div>
      </section>

      <section className="surface-card grid gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="m-0 text-2xl font-semibold text-slate-900">Filter products</h2><p className="mt-2 text-sm text-slate-500">Search the catalogue by product, category, brand, SKU, or variant options.</p></div><div className="text-sm font-semibold text-slate-700">{filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}</div></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search products, brands, SKU or options" className="field-input" />
          <select value={filters.brand} onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))} className="field-input"><option value="">All brands</option>{availableBrands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select>
          <select value={filters.stock_state} onChange={(event) => setFilters((current) => ({ ...current, stock_state: event.target.value }))} className="field-input"><option value="">Any stock level</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select>
          <select value={filters.variant_mode} onChange={(event) => setFilters((current) => ({ ...current, variant_mode: event.target.value }))} className="field-input"><option value="">Any product type</option><option value="single">Single variant products</option><option value="multi">Multi variant products</option></select>
          <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} className="field-input"><option value="featured">Sort: Featured</option><option value="title_asc">Sort: Title A-Z</option><option value="title_desc">Sort: Title Z-A</option><option value="price_asc">Sort: Lowest price</option><option value="price_desc">Sort: Highest price</option><option value="inventory_desc">Sort: Highest inventory</option><option value="variants_desc">Sort: Most variants</option></select>
        </div>
        {!!categorySummaries.length && <div className="flex flex-wrap gap-2.5"><button type="button" onClick={() => setFilters((current) => ({ ...current, category_id: "" }))} className={chipClass(!filters.category_id)}>All categories</button>{categorySummaries.map((category) => { const active = String(filters.category_id) === String(category.category_id); return <button key={category.category_id || category.slug || category.name} type="button" onClick={() => setFilters((current) => ({ ...current, category_id: active ? "" : category.category_id }))} className={chipClass(active)}>{category.name} ({category.count})</button>; })}</div>}
        <div className="flex flex-wrap items-center gap-2.5"><span className="chip-blue">Category: {activeCategoryName}</span>{filters.brand && <span className="chip-violet">Brand: {filters.brand}</span>}{filters.variant_mode && <span className="chip-green">Mode: {filters.variant_mode}</span>}{filters.stock_state && <span className="chip-amber">Stock: {filters.stock_state.replace(/_/g, " ")}</span>}{(filters.search || filters.category_id || filters.brand || filters.stock_state || filters.variant_mode || filters.sort !== "featured") && <button type="button" onClick={() => setFilters({ search: "", category_id: "", brand: "", stock_state: "", variant_mode: "", sort: "featured" })} className="btn-ghost">Clear filters</button>}</div>
      </section>

      <section className="surface-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="m-0 text-2xl font-semibold text-slate-900">Featured catalogue</h2><p className="mt-2 text-sm text-slate-500">Products are grouped by product ID and display their variant counts directly in the grid.</p></div>{loading && <span className="text-sm text-slate-500">Loading catalogue...</span>}</div>
        <ProductGrid products={filteredProducts} emptyMessage="No products matched your home page filters." />
      </section>
    </div>
  );
};

export default CataloguePage;