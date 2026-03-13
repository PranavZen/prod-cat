import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../admin/products/ProductForm";
import LoadingPanel from "../../components/LoadingPanel";
import Toast from "../../components/Toast";
import {
  createProduct,
  fetchCategories,
  fetchProductById,
  fetchProducts,
  selectAllCategories,
  selectAllProducts,
  selectLoadingByAction,
  selectProductDetailById,
  updateProduct,
  validateSku,
} from "../../store/catalogueSlice";
import {
  CORE_PRODUCT_FIELDS,
  DEFAULT_OPTION_FIELDS,
  RESERVED_ATTRIBUTE_KEYS,
  slugify,
} from "../../utils/legacyCatalogue";

const emptyForm = {
  product_id: "",
  title: "",
  description: "",
  brand: "",
  price: "",
  image: "",
  inventory: "",
  category_id: "",
  status: "draft",
  product_field_keys: [],
};
const buildVariantInputState = (names = DEFAULT_OPTION_FIELDS, current = {}) =>
  Object.fromEntries(
    (names || []).map((name) => [name, String(current?.[name] || "")]),
  );
const mergeVariantColumnNames = (...collections) =>
  Array.from(new Set(collections.flat().filter(Boolean)));
const normalizeDynamicFieldName = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
const attrSignature = (attributes = []) =>
  (attributes || [])
    .map(
      (attribute) => `${attribute.attribute_name}:${attribute.attribute_value}`,
    )
    .sort()
    .join("|");
const toLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
const buildSku = (title, attributes = []) =>
  [
    String(title || "product")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    ...(attributes || [])
      .map((attribute) =>
        String(attribute.attribute_value || "")
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-"),
      )
      .filter(Boolean),
  ]
    .filter(Boolean)
    .join("-");
const buildManualVariant = (form) => ({
  sku: "",
  price: form.price || "",
  inventory: form.inventory || "",
  image: form.image || "",
  attributes: [],
});
const buildAttributesFromCombo = (combo) =>
  Object.entries(combo)
    .filter(([, value]) => String(value).trim() !== "")
    .map(([attribute_name, attribute_value]) => ({
      attribute_name,
      attribute_label: toLabel(attribute_name),
      attribute_value,
    }));
const hydrateVariant = (form, attributes, existing = {}) => ({
  ...existing,
  sku: existing.sku || buildSku(form.title, attributes),
  price: existing.price || form.price || "",
  inventory: existing.inventory || form.inventory || "",
  image: existing.image || existing.primary_image || form.image || "",
  attributes,
});

const AdminProductEditorPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectAllCategories);
  const products = useSelector(selectAllProducts);
  const detail = useSelector((state) =>
    selectProductDetailById(state, productId),
  );
  const busy = useSelector(
    selectLoadingByAction(productId ? "updateProduct" : "createProduct"),
  );
  const loadingDetail = useSelector(selectLoadingByAction("fetchProductById"));
  const skuValidation = useSelector((state) => state.catalogue.skuValidation);
  const [form, setForm] = useState(emptyForm);
  const [productFieldNames, setProductFieldNames] = useState([]);
  const [variantColumnNames, setVariantColumnNames] = useState(
    DEFAULT_OPTION_FIELDS,
  );
  const [variantInputs, setVariantInputs] = useState(
    buildVariantInputState(DEFAULT_OPTION_FIELDS),
  );
  const [variants, setVariants] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ pagination: { page: 1, pageSize: 5000 } }));
    if (productId)
      dispatch(fetchProductById({ data: { product_id: productId } }));
  }, [dispatch, productId]);
  useEffect(() => {
    if (!detail?.product) return;
    const nextProductFieldNames = Array.from(
      new Set(
        (detail.productFields || []).map((field) => field.name).filter(Boolean),
      ),
    );
    setForm({
      product_id: detail.product.product_id || "",
      title: detail.product.title || "",
      description: detail.product.description || "",
      brand: detail.product.brand || "",
      price: detail.product.min_price || detail.product.price || "",
      image: detail.product.primary_image || detail.product.image || "",
      inventory:
        detail.product.inventory_total || detail.product.inventory || "",
      category_id: detail.product.category_id || "",
      status: detail.product.status || "draft",
      product_field_keys: nextProductFieldNames,
      ...Object.fromEntries(
        nextProductFieldNames.map((name) => [
          name,
          detail.product?.[name] || "",
        ]),
      ),
    });
    setProductFieldNames(nextProductFieldNames);
    const nextColumnNames = mergeVariantColumnNames(
      DEFAULT_OPTION_FIELDS,
      Object.keys(detail.optionValues || {}),
      (detail.attributes || []).map(
        (attribute) => attribute.attribute_id || attribute.name,
      ),
      (detail.variants || []).flatMap((variant) =>
        (variant.attributes || []).map((attribute) => attribute.attribute_name),
      ),
    );
    setVariantColumnNames(nextColumnNames);
    setVariantInputs({
      ...buildVariantInputState(nextColumnNames),
      ...Object.fromEntries(
        nextColumnNames.map((name) => [
          name,
          detail.optionValues?.[name]?.join(", ") || "",
        ]),
      ),
    });
    setVariants(
      (detail.variants || []).map((variant) => ({
        ...variant,
        image: variant.primary_image || variant.image || "",
      })),
    );
  }, [detail]);
  useEffect(() => {
    if (!toast?.message) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categoryOptions = useMemo(() => {
    const known = [
      ...categories,
      ...products.map((product) => ({
        category_id: product.category_id || product.category_name,
        name: product.category_name || product.category_id,
        slug: slugify(product.category_name || product.category_id || ""),
      })),
      ...(form.category_id
        ? [
            {
              category_id: form.category_id,
              name: form.category_id,
              slug: slugify(form.category_id),
            },
          ]
        : []),
      ...(detail?.product?.category_id
        ? [
            {
              category_id: detail.product.category_id,
              name: detail.product.category_name || detail.product.category_id,
              slug: slugify(
                detail.product.category_name || detail.product.category_id,
              ),
            },
          ]
        : []),
    ].filter((category) => category.category_id || category.name);

    return Array.from(
      new Map(
        known.map((category) => [
          String(category.category_id || category.name),
          category,
        ]),
      ).values(),
    );
  }, [
    categories,
    detail?.product?.category_id,
    detail?.product?.category_name,
    form.category_id,
    products,
  ]);

  const updateGeneratedVariants = (combinations, replaceExisting = false) => {
    setToast(null);
    if (!combinations.length)
      return setToast({
        tone: "error",
        title: "Variant generation",
        message: "Add at least one option value before generating variants.",
      });
    setVariants((current) => {
      const existingBySignature = new Map(
        current.map((variant) => [attrSignature(variant.attributes), variant]),
      );
      const generated = combinations.map((combo) => {
        const attributes = buildAttributesFromCombo(combo);
        return hydrateVariant(
          form,
          attributes,
          existingBySignature.get(attrSignature(attributes)),
        );
      });
      if (replaceExisting) return generated;
      const generatedSignatures = new Set(
        generated.map((variant) => attrSignature(variant.attributes)),
      );
      return [
        ...generated,
        ...current.filter((variant) => {
          const signature = attrSignature(variant.attributes);
          return !signature || !generatedSignatures.has(signature);
        }),
      ];
    });
  };
  const addVariantColumn = (columnName) => {
    const normalizedName = normalizeDynamicFieldName(columnName);
    if (!normalizedName)
      return setToast({
        tone: "error",
        title: "Variant column",
        message: "Enter a column name before adding it.",
      });
    if (RESERVED_ATTRIBUTE_KEYS.has(normalizedName))
      return setToast({
        tone: "error",
        title: "Variant column",
        message: `“${normalizedName}” is reserved. Choose a different column name.`,
      });
    if (variantColumnNames.includes(normalizedName))
      return setToast({
        tone: "error",
        title: "Variant column",
        message: `Column “${normalizedName}” already exists.`,
      });

    const nextColumnNames = mergeVariantColumnNames(
      variantColumnNames,
      normalizedName,
    );
    setVariantColumnNames(nextColumnNames);
    setVariantInputs((current) =>
      buildVariantInputState(nextColumnNames, current),
    );
    setToast({
      tone: "success",
      title: "Variant column added",
      message: `Column “${normalizedName}” is ready to use in the generator and variant table.`,
    });
  };
  const addProductField = (fieldName) => {
    const normalizedName = normalizeDynamicFieldName(fieldName);
    if (!normalizedName)
      return setToast({
        tone: "error",
        title: "Product field",
        message: "Enter a field name before adding it.",
      });
    if (
      RESERVED_ATTRIBUTE_KEYS.has(normalizedName) ||
      CORE_PRODUCT_FIELDS.includes(normalizedName) ||
      variantColumnNames.includes(normalizedName)
    )
      return setToast({
        tone: "error",
        title: "Product field",
        message: `“${normalizedName}” is already used. Choose a different field name.`,
      });
    if (productFieldNames.includes(normalizedName))
      return setToast({
        tone: "error",
        title: "Product field",
        message: `Field “${normalizedName}” already exists.`,
      });

    const nextNames = mergeVariantColumnNames(
      productFieldNames,
      normalizedName,
    );
    setProductFieldNames(nextNames);
    setForm((current) => ({
      ...current,
      product_field_keys: nextNames,
      [normalizedName]: current?.[normalizedName] || "",
    }));
    setToast({
      tone: "success",
      title: "Product field added",
      message: `Field “${normalizedName}” is ready for any category-specific product information.`,
    });
  };
  const applyVariantDefaults = () =>
    setVariants((current) =>
      current.map((variant) => ({
        ...variant,
        sku: variant.sku || buildSku(form.title, variant.attributes),
        price: variant.price || form.price || "",
        inventory: variant.inventory || form.inventory || "",
        image: variant.image || form.image || "",
      })),
    );
  const generateMissingSkus = () =>
    setVariants((current) =>
      current.map((variant) => ({
        ...variant,
        sku: variant.sku || buildSku(form.title, variant.attributes),
      })),
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setToast(null);
    try {
      if (!form.title.trim()) throw new Error("Product title is required");
      const submittedVariants = variants.length
        ? variants
        : [buildManualVariant(form)];
      const submittedForm = {
        ...form,
        product_field_keys: productFieldNames,
      };
      const seenSkus = new Set();
      for (const variant of submittedVariants) {
        const sku = String(variant.sku || "").trim();
        if (!sku) continue;
        const normalizedSku = sku.toUpperCase();
        if (seenSkus.has(normalizedSku))
          throw new Error(`Duplicate SKU found: ${sku}`);
        seenSkus.add(normalizedSku);
        await dispatch(
          validateSku({
            data: { sku, variant_id: variant.variant_id || variant.id },
          }),
        ).unwrap();
      }
      const thunk = productId ? updateProduct : createProduct;
      await dispatch(
        thunk({ data: submittedForm, variants: submittedVariants }),
      ).unwrap();
      navigate("/admin/products", {
        state: {
          flashMessage: productId
            ? `Product “${submittedForm.title}” was updated successfully and synced from the sheet.`
            : `Product “${submittedForm.title}” was created successfully and added to the sheet.`,
          flashType: "success",
          refreshOnLoad: true,
          refreshedAt: Date.now(),
        },
      });
    } catch (submitError) {
      const message = submitError.message || String(submitError);
      setToast({ tone: "error", title: "Save failed", message });
    }
  };

  if (productId && loadingDetail && !detail?.product)
    return (
      <LoadingPanel
        title="Loading product editor"
        message="Preparing grouped product data and variant rows for editing."
        variant="form"
      />
    );

  return (
    <div className="grid gap-5">
      <Toast
        toast={toast}
        onDismiss={() => {
          setToast(null);
        }}
      />
      <header>
        <h1 className="m-0 text-3xl font-bold text-slate-900">
          {productId ? "Edit Product" : "Create Product"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage one product with multiple variant rows for your Google Sheet
          catalogue.
        </p>
      </header>
      <ProductForm
        form={form}
        categories={categoryOptions}
        productFieldNames={productFieldNames}
        variantInputs={variantInputs}
        variants={variants}
        variantColumnNames={variantColumnNames}
        skuValidation={skuValidation}
        onChange={setForm}
        onVariantInputsChange={setVariantInputs}
        onVariantsChange={setVariants}
        onAddProductField={addProductField}
        onAddVariantColumn={addVariantColumn}
        onGenerateVariants={(combinations) =>
          updateGeneratedVariants(combinations, false)
        }
        onReplaceVariants={(combinations) =>
          updateGeneratedVariants(combinations, true)
        }
        onApplyVariantDefaults={applyVariantDefaults}
        onGenerateMissingSkus={generateMissingSkus}
        onClearVariantInputs={() =>
          setVariantInputs(buildVariantInputState(variantColumnNames))
        }
        onSubmit={handleSubmit}
        submitLabel={productId ? "Save product" : "Create product"}
        busy={busy}
      />
    </div>
  );
};

export default AdminProductEditorPage;
