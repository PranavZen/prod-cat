import { Link } from "react-router-dom";

const formatPrice = (product) => {
  if (product.min_price && product.max_price && product.min_price !== product.max_price) return `${product.min_price} - ${product.max_price}`;
  return product.min_price || product.price || product.discount_price || "—";
};

const badgeClass = (status) => status === "active" ? "chip-green" : status === "draft" ? "chip-amber" : "chip-slate";

const CategoryProductSection = ({ categoryName, rows, onEdit, onDelete }) => (
  <section className="grid gap-4">
    <div><h2 className="m-0 text-2xl font-semibold text-slate-900">{categoryName}</h2><p className="mt-2 text-sm text-slate-500">{rows.length} product{rows.length === 1 ? "" : "s"}</p></div>
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {rows.map((product) => <article key={product.product_id} className="surface-card overflow-hidden"><div className="h-52 bg-slate-100">{product.primary_image ? <img src={product.primary_image} alt={product.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm font-medium text-slate-500">No image</div>}</div><div className="grid gap-4 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="m-0 text-lg font-semibold text-slate-900">{product.title}</h3><p className="mt-1 text-sm text-slate-500">{product.brand || "Generic brand"}</p></div><span className={badgeClass(product.status || "active")}>{product.status || "active"}</span></div><div className="grid gap-1.5 text-sm text-slate-600"><div><strong>Price:</strong> {formatPrice(product)}</div><div><strong>Variants:</strong> {product.variant_count || 1}</div><div><strong>SKU:</strong> {product.sku || "—"}</div><div><strong>Inventory:</strong> {product.inventory_total || "—"}</div></div><div className="flex flex-wrap gap-2"><Link to={`/admin/products/${product.product_id}/view`} className="btn-outline">View</Link><button type="button" onClick={() => onEdit(product.product_id)} className="btn-secondary">Edit</button><button type="button" onClick={() => onDelete(product.product_id)} className="btn-outline text-rose-600 hover:border-rose-200 hover:text-rose-700">Delete</button><Link to={`/product/${product.product_id}`} className="btn-ghost">Storefront</Link></div></div></article>)}
    </div>
  </section>
);

export default CategoryProductSection;