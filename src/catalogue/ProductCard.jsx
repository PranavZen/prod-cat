import { Link } from "react-router-dom";

const toLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ProductCard = ({ product }) => {
  const priceLabel =
    product.min_price &&
    product.max_price &&
    product.min_price !== product.max_price
      ? `${product.min_price} - ${product.max_price}`
      : product.min_price ||
        product.price ||
        product.compare_price ||
        "Price from API";

  return (
    <Link
      to={`/product/${product.product_id}`}
      className="block h-full text-inherit no-underline"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel transition duration-200 hover:-translate-y-1 hover:shadow-soft">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.title}
            className="h-52 w-full bg-slate-200 object-cover"
          />
        ) : (
          <div className="grid h-52 place-items-center bg-slate-200 text-sm font-medium text-slate-500">
            Image
          </div>
        )}
        <div className="grid flex-1 gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="m-0 text-lg font-semibold text-slate-900">
              {product.title}
            </h3>
            <span className="chip-blue shrink-0">
              {product.category_name || product.category_id || "General"}
            </span>
          </div>
          <p className="m-0 text-sm text-slate-500">
            {product.brand || "Generic brand"}
          </p>
          <p className="m-0 text-sm text-slate-500">
            {product.variant_count || 1} variant
            {product.variant_count === 1 ? "" : "s"}
          </p>
          {/* custom product fields (array of names) may come from detail fetch, but the
              top‑level product also retains them on the object when returned by the
              list API. show first few values if present. */}
          {!!product.product_field_keys?.length && (
            <div className="mt-1 grid gap-1 text-xs text-slate-600">
              {product.product_field_keys.map((name) => (
                <div key={name}>
                  {toLabel(name)}: {product[name] || "—"}
                </div>
              ))}
            </div>
          )}
          <strong className="mt-auto text-base font-semibold text-slate-900">
            {priceLabel}
          </strong>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
