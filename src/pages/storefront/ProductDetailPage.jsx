import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import LoadingPanel from "../../components/LoadingPanel";
import {
  fetchProductById,
  selectLoadingByAction,
  selectProductDetailById,
} from "../../store/catalogueSlice";

const toLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
const variantButtonClass = (active) =>
  [
    "rounded-full border px-4 py-2 text-sm font-semibold transition",
    active
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
  ].join(" ");

const ProductDetailPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const detail = useSelector((state) =>
    selectProductDetailById(state, productId),
  );
  const loading = useSelector(selectLoadingByAction("fetchProductById"));
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    dispatch(fetchProductById({ data: { product_id: productId } }));
  }, [dispatch, productId]);

  const product = detail?.product;
  const variants = useMemo(() => detail?.variants || [], [detail]);
  const optionValues = useMemo(
    () => detail?.optionValues || product?.option_values || {},
    [detail, product],
  );
  const optionNames = useMemo(
    () => Object.keys(optionValues || {}),
    [optionValues],
  );

  useEffect(() => {
    if (!variants.length) return;
    const next = {};
    optionNames.forEach((name) => {
      const firstValue = variants[0]?.attributes?.find(
        (attribute) => attribute.attribute_name === name,
      )?.attribute_value;
      if (firstValue) next[name] = String(firstValue);
    });
    setSelectedOptions(next);
  }, [productId, variants, optionNames]);

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find((variant) =>
        optionNames.every(
          (name) =>
            !selectedOptions[name] ||
            String(
              variant.attributes?.find(
                (attribute) => attribute.attribute_name === name,
              )?.attribute_value || "",
            ) === String(selectedOptions[name]),
        ),
      ) || variants[0]
    );
  }, [optionNames, selectedOptions, variants]);

  if (loading && !product)
    return (
      <div className="page-shell">
        <LoadingPanel
          title="Loading product"
          message="Preparing product details and variant options."
          variant="form"
        />
      </div>
    );
  if (!product)
    return (
      <div className="page-shell">
        <div className="surface-card p-6 text-sm text-slate-500">
          Product not found.
        </div>
      </div>
    );

  const heroImage =
    activeVariant?.primary_image ||
    activeVariant?.image ||
    product.primary_image;
  const priceLabel = activeVariant?.price || product.min_price;

  return (
    <div className="page-shell">
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_1fr] xl:items-start">
        <div className="surface-card overflow-hidden p-4">
          {heroImage ? (
            <img
              src={heroImage}
              alt={product.title}
              className="h-full max-h-[520px] w-full rounded-[1.5rem] bg-slate-100 object-cover"
            />
          ) : (
            <div className="grid h-[320px] place-items-center rounded-[1.5rem] bg-slate-100 text-sm font-medium text-slate-500">
              No image
            </div>
          )}
        </div>
        <div className="surface-card grid gap-6 p-6 sm:p-8">
          <div>
            <p className="m-0 text-sm font-semibold text-blue-600">
              {product.category_name || product.category_id}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {product.brand || "Generic brand"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <div className="chip-blue">
              {product.variant_count || variants.length} variants
            </div>
            <div className="chip-green">
              Inventory:{" "}
              {activeVariant?.inventory || product.inventory_total || "—"}
            </div>
          </div>
          <div>
            <strong className="text-3xl font-bold text-slate-950">
              {priceLabel || "—"}
            </strong>
            {!!activeVariant?.sku && (
              <p className="mt-2 text-sm text-slate-500">
                SKU: {activeVariant.sku}
              </p>
            )}
          </div>
          {/* render any extra product-level fields that were defined on the sheet */}
          {!!product.product_field_keys?.length && (
            <section className="grid gap-2">
              {product.product_field_keys.map((name) => (
                <div key={name} className="text-sm text-slate-600">
                  <strong>{toLabel(name)}:</strong> {product[name] || "—"}
                </div>
              ))}
            </section>
          )}
          {optionNames.map((name) => (
            <section key={name} className="grid gap-3">
              <strong className="text-sm font-semibold text-slate-900">
                {toLabel(name)}
              </strong>
              <div className="flex flex-wrap gap-2.5">
                {optionValues[name].map((value) => {
                  const active =
                    String(selectedOptions[name] || "") === String(value);
                  return (
                    <button
                      key={`${name}-${value}`}
                      type="button"
                      onClick={() =>
                        setSelectedOptions((current) => ({
                          ...current,
                          [name]: value,
                        }))
                      }
                      className={variantButtonClass(active)}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          <section className="grid gap-2">
            <strong className="text-sm font-semibold text-slate-900">
              Description
            </strong>
            <p className="m-0 text-sm leading-7 text-slate-600">
              {product.description || "No description available."}
            </p>
          </section>
        </div>
      </div>

      {!!variants.length && (
        <section className="table-shell">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="m-0 text-2xl font-semibold text-slate-900">
              Available Variants
            </h2>
          </div>
          <div className="table-scroll">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  {optionNames.map((name) => (
                    <th key={name} className="th-cell">
                      {toLabel(name)}
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
                    {optionNames.map((name) => (
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
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
