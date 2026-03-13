import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteProduct,
  fetchProductById,
  selectProductDetailById,
} from "../../store/catalogueSlice";
import Toast from "../../components/Toast";

const AdminProductViewPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const detail = useSelector((state) =>
    selectProductDetailById(state, productId),
  );
  const product = detail?.product;
  const variants = detail?.variants || [];
  const [feedback, setFeedback] = useState(null);
  useEffect(() => {
    dispatch(fetchProductById({ data: { product_id: productId } }));
  }, [dispatch, productId]);
  useEffect(() => {
    if (!feedback?.message) return undefined;
    const timer = window.setTimeout(() => setFeedback(null), 3500);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  const handleDelete = async () => {
    try {
      await dispatch(
        deleteProduct({ data: { product_id: productId } }),
      ).unwrap();
      navigate("/admin/products", {
        state: {
          flashMessage: `Product “${product?.title || productId}” was deleted successfully from the sheet.`,
          flashType: "success",
          refreshOnLoad: true,
        },
      });
    } catch (deleteError) {
      setFeedback({
        tone: "error",
        title: "Delete failed",
        message: deleteError.message || String(deleteError),
      });
    }
  };
  if (!product)
    return (
      <div className="grid gap-4">
        <h1 className="m-0 text-3xl font-bold text-slate-900">View Product</h1>
        <div className="surface-card p-6 text-sm text-slate-500">
          Loading product...
        </div>
      </div>
    );

  return (
    <div className="grid gap-6">
      <Toast toast={feedback} onDismiss={() => setFeedback(null)} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-3xl font-bold text-slate-900">
            {product.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Admin product detail view with quick actions.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products" className="btn-outline">
            Back
          </Link>
          <Link to={`/admin/products/${productId}`} className="btn-secondary">
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-outline text-rose-600 hover:border-rose-200 hover:text-rose-700"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="surface-card p-6">
        {!!product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.title}
            className="mb-6 h-40 w-40 rounded-3xl bg-slate-100 object-cover"
          />
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Title</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.title || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Brand</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.brand || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Category</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.category_name || product.category_id || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Price</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.price || product.min_price || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Variants</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.variant_count || variants.length || 0}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <strong className="text-sm text-slate-500">Status</strong>
            <div className="mt-2 text-sm text-slate-900">
              {product.status || "—"}
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 p-4">
          <strong className="text-sm text-slate-500">Description</strong>
          <p className="mb-0 mt-2 text-sm leading-7 text-slate-600">
            {product.description || "No description available."}
          </p>
        </div>
      </div>
      {!!variants.length && (
        <div className="table-shell">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="m-0 text-2xl font-semibold text-slate-900">
              Variant rows
            </h2>
          </div>
          <div className="table-scroll">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  {(product.option_names || []).map((name) => (
                    <th key={name} className="th-cell">
                      {name.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="th-cell">SKU</th>
                  <th className="th-cell">Price</th>
                  <th className="th-cell">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.variant_id} className="hover:bg-slate-50/80">
                    {(product.option_names || []).map((name) => (
                      <td key={name} className="td-cell">
                        {variant.attributes?.find(
                          (attribute) => attribute.attribute_name === name,
                        )?.attribute_value || "—"}
                      </td>
                    ))}
                    <td className="td-cell">{variant.sku || "—"}</td>
                    <td className="td-cell">{variant.price || "—"}</td>
                    <td className="td-cell">{variant.inventory || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductViewPage;
