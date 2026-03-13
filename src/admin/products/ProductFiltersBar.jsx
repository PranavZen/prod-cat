const ProductFiltersBar = ({ categories, brands, filters, resultCount, onChange, onRefresh, loading }) => {
  const activeChips = [
    filters.search ? `Search: ${filters.search}` : null,
    filters.category_id ? `Category: ${categories.find((category) => String(category.category_id) === String(filters.category_id))?.name || filters.category_id}` : null,
    filters.brand ? `Brand: ${filters.brand}` : null,
    filters.status ? `Status: ${filters.status}` : null,
    filters.stock_state ? `Stock: ${filters.stock_state.replace(/_/g, " ")}` : null,
    filters.variant_mode ? `Variants: ${filters.variant_mode.replace(/_/g, " ")}` : null,
  ].filter(Boolean);

  return (
    <div className="surface-card grid gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="m-0 text-xl font-semibold text-slate-900">Filter catalogue</h2><p className="mt-2 text-sm text-slate-500">Refine by category, brand, stock health, and variant structure.</p></div><div className="text-sm font-semibold text-slate-700">{resultCount} result{resultCount === 1 ? "" : "s"}</div></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Search title, brand, category, SKU or option values" className="field-input xl:col-span-2" />
        <select value={filters.category_id} onChange={(event) => onChange({ ...filters, category_id: event.target.value })} className="field-input"><option value="">All categories</option>{categories.map((category) => <option key={category.category_id || category.slug || category.name} value={category.category_id}>{category.name}</option>)}</select>
        <select value={filters.brand} onChange={(event) => onChange({ ...filters, brand: event.target.value })} className="field-input"><option value="">All brands</option>{brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}</select>
        <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })} className="field-input"><option value="">All statuses</option><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select>
        <select value={filters.stock_state} onChange={(event) => onChange({ ...filters, stock_state: event.target.value })} className="field-input"><option value="">Any stock level</option><option value="in_stock">In stock</option><option value="low_stock">Low stock (1-5)</option><option value="out_of_stock">Out of stock</option></select>
        <select value={filters.variant_mode} onChange={(event) => onChange({ ...filters, variant_mode: event.target.value })} className="field-input"><option value="">Any variant mode</option><option value="single">Single variant</option><option value="multi">Multi variant</option></select>
        <select value={filters.sort} onChange={(event) => onChange({ ...filters, sort: event.target.value })} className="field-input"><option value="title_asc">Sort: Title A-Z</option><option value="title_desc">Sort: Title Z-A</option><option value="price_asc">Sort: Lowest price</option><option value="price_desc">Sort: Highest price</option><option value="inventory_desc">Sort: Highest inventory</option><option value="variants_desc">Sort: Most variants</option></select>
      </div>
      <div className="flex flex-wrap items-center gap-2.5"><button type="button" onClick={onRefresh} disabled={loading} className="btn-secondary">{loading ? "Refreshing..." : "Refresh"}</button><button type="button" onClick={() => onChange({ search: "", category_id: "", brand: "", status: "", stock_state: "", variant_mode: "", sort: "title_asc" })} className="btn-outline">Clear all</button>{activeChips.length ? activeChips.map((chip) => <span key={chip} className="chip-blue">{chip}</span>) : <span className="text-sm text-slate-500">No filters applied.</span>}</div>
    </div>
  );
};

export default ProductFiltersBar;