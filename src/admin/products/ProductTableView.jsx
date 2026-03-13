import { Link } from "react-router-dom";

const formatPrice = (product) => {
  if (product.min_price && product.max_price && product.min_price !== product.max_price) return `${product.min_price} - ${product.max_price}`;
  return product.min_price || product.price || product.discount_price || "—";
};

const statusClass = (status) => status === "active" ? "chip-green" : status === "draft" ? "chip-amber" : "chip-slate";

const ProductTableView = ({ rows, onEdit, onDelete }) => (
  <div className="table-shell"><div className="table-scroll"><table className="min-w-full border-collapse text-sm"><thead><tr><th className="th-cell">Product</th><th className="th-cell">Category</th><th className="th-cell">Price</th><th className="th-cell">Variants</th><th className="th-cell">Inventory</th><th className="th-cell">Status</th><th className="th-cell">Actions</th></tr></thead><tbody>{rows.map((product) => <tr key={product.product_id} className="hover:bg-slate-50/80"><td className="td-cell"><div className="flex min-w-[250px] items-center gap-3">{product.primary_image ? <img src={product.primary_image} alt={product.title} className="h-14 w-14 rounded-2xl bg-slate-100 object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-xs text-slate-500">No image</div>}<div className="grid gap-0.5"><strong className="text-slate-900">{product.title}</strong><span className="text-slate-500">{product.brand || "Generic brand"}</span><span className="text-xs text-slate-400">SKU: {product.sku || "—"}</span></div></div></td><td className="td-cell">{product.category_name || product.category_id || "—"}</td><td className="td-cell">{formatPrice(product)}</td><td className="td-cell">{product.variant_count || 1}</td><td className="td-cell">{product.inventory_total || product.inventory || "—"}</td><td className="td-cell"><span className={statusClass(product.status || "active")}>{product.status || "active"}</span></td><td className="td-cell"><div className="flex min-w-[280px] flex-wrap gap-2"><Link to={`/admin/products/${product.product_id}/view`} className="btn-outline">View</Link><button type="button" onClick={() => onEdit(product.product_id)} className="btn-secondary">Edit</button><button type="button" onClick={() => onDelete(product.product_id)} className="btn-outline text-rose-600 hover:border-rose-200 hover:text-rose-700">Delete</button><Link to={`/product/${product.product_id}`} className="btn-ghost">Storefront</Link></div></td></tr>)}</tbody></table></div></div>
);

export default ProductTableView;