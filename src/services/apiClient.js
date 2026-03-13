import { API } from "../config";
import { buildGeneratedProductId, buildLegacyProductDetail, collectLegacyAttributes, collectLegacyCategories, groupLegacyProducts, normalizeLegacyRow, pickFirstValue } from "../utils/legacyCatalogue";

const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || "";
const SERIALIZED_PRODUCT_KEYS = new Set([
  "id", "row_id", "variant_id", "product_id", "title", "name", "description", "brand",
  "category", "category_id", "status", "image", "image_url", "primary_image",
  "price", "discount_price", "compare_price", "inventory", "sku", "variant_sku",
  "attributes", "attribute_map", "product_field_keys",
]);

export function buildPageKey(payload = {}) {
  const filters = payload.filters || {};
  const pagination = payload.pagination || {};
  const sort = payload.sort || {};
  return JSON.stringify({ filters, pagination, sort });
}

async function parseResponse(response) {
  let json;
  try {
    json = await response.json();
  } catch (error) {
    throw new Error("API returned a non-JSON response");
  }
  if (!response.ok && json.success !== false) throw new Error(`Request failed with status ${response.status}`);
  return json;
}

async function getJson(url) {
  const response = await fetch(url);
  return parseResponse(response);
}

async function postJson(body) {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

async function fetchLegacyRows() {
  const json = await getJson(API);
  return Array.isArray(json) ? json : json.data || [];
}

function filterProducts(products, filters = {}) {
  return products.filter((product) => {
    if (filters.category_id && String(product.category_id) !== String(filters.category_id)) return false;
    if (filters.status && String(product.status) !== String(filters.status)) return false;
    if (!filters.search) return true;
    const haystack = [product.title, product.brand, product.description, product.category_name, product.sku, Object.values(product.option_values || {}).flat().join(" ")].join(" ").toLowerCase();
    return haystack.includes(String(filters.search).toLowerCase());
  });
}

function paginateItems(items, pagination = {}) {
  const page = Number(pagination.page || 1);
  const pageSize = Number(pagination.pageSize || items.length || 20);
  const start = Math.max(0, (page - 1) * pageSize);
  return {
    items: items.slice(start, start + pageSize),
    pagination: { page, pageSize, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / pageSize)) },
  };
}

function cleanAttributes(attributes = []) {
  return (attributes || []).filter((attribute) => attribute?.attribute_name && String(attribute.attribute_value ?? "").trim() !== "");
}

function normalizeFieldKeys(value = []) {
  return Array.from(new Set((Array.isArray(value) ? value : String(value).split(",")).map((item) => String(item).trim()).filter(Boolean)));
}

function buildVariantRows(productData = {}, variants = []) {
  const productId = String(pickFirstValue(productData.product_id, buildGeneratedProductId(productData)));
  const productFieldKeys = Array.from(
    new Set([
      ...normalizeFieldKeys(productData.product_field_keys),
      ...Object.keys(productData).filter((key) => !SERIALIZED_PRODUCT_KEYS.has(key) && !key.startsWith("__")),
    ]),
  );
  const productFieldMap = Object.fromEntries(
    productFieldKeys.map((key) => [key, pickFirstValue(productData[key], "")]),
  );
  const fallbackVariant = {
    variant_id: productData.id,
    sku: productData.sku || productData.variant_sku || "",
    price: productData.price || "",
    compare_price: productData.discount_price || productData.compare_price || "",
    inventory: productData.inventory || "",
    image: productData.image || productData.primary_image || "",
    attributes: [],
  };
  const sourceVariants = (variants || []).length ? variants : [fallbackVariant];

  return {
    productId,
    rows: sourceVariants.map((variant) => {
      const attributes = cleanAttributes(variant.attributes);
      const attributeMap = Object.fromEntries(attributes.map((attribute) => [attribute.attribute_name, attribute.attribute_value]));
      const image = pickFirstValue(variant.image, variant.image_url, productData.image, productData.primary_image, "");
      return {
        id: pickFirstValue(variant.id, variant.row_id, variant.variant_id),
        product_id: productId,
        title: productData.title || productData.name || "",
        name: productData.title || productData.name || "",
        description: productData.description || "",
        brand: productData.brand || "",
        category: productData.category || productData.category_id || "",
        category_id: productData.category_id || productData.category || "",
        status: productData.status || "active",
        image,
        image_url: image,
        price: pickFirstValue(variant.price, productData.price, ""),
        discount_price: pickFirstValue(variant.compare_price, productData.discount_price, productData.compare_price, ""),
        inventory: pickFirstValue(variant.inventory, productData.inventory, ""),
        sku: pickFirstValue(variant.sku, variant.variant_sku, productData.sku, ""),
        variant_sku: pickFirstValue(variant.sku, variant.variant_sku, productData.sku, ""),
        product_field_keys: productFieldKeys.join(","),
        ...productFieldMap,
        ...attributeMap,
      };
    }),
  };
}

async function refetchProduct(productId) {
  const detail = buildLegacyProductDetail(await fetchLegacyRows(), productId);
  return detail ? { success: true, data: detail.product, meta: { detail } } : { success: true, data: null, meta: {} };
}

export function planLegacyProductRowMutations(existingRows = [], rows = []) {
  const existing = (existingRows || []).map(normalizeLegacyRow);
  const existingById = new Map(existing.map((row) => [String(row.row_id), row]));
  const retainedIds = new Set();
  const updates = [];
  const creates = [];

  for (const row of rows) {
    const rowId = String(pickFirstValue(row.id, row.row_id, row.variant_id, ""));
    const { id, row_id, variant_id, ...data } = row;

    if (rowId && existingById.has(rowId)) {
      retainedIds.add(rowId);
      updates.push({ id: rowId, data: { id: rowId, ...data } });
      continue;
    }

    creates.push({ data });
  }

  const deletes = existing.filter((row) => !retainedIds.has(String(row.row_id))).map((row) => String(row.row_id));

  return { updates, creates, deletes };
}

async function syncLegacyProductRows(productId, rows = [], existingRows = null) {
  const normalizedProductId = String(productId || "");
  const currentRows = Array.isArray(existingRows)
    ? existingRows
    : (await fetchLegacyRows())
        .map(normalizeLegacyRow)
        .filter((row) => String(row.product_id) === normalizedProductId || String(row.row_id) === normalizedProductId);

  const operations = planLegacyProductRowMutations(currentRows, rows);

  for (const update of operations.updates) {
    await postJson({ action: "update", data: update.data, apiKey: ADMIN_API_KEY });
  }

  for (const create of operations.creates) {
    await postJson({ action: "create", data: create.data, apiKey: ADMIN_API_KEY });
  }

  for (const rowId of operations.deletes) {
    await postJson({ action: "delete", id: rowId, apiKey: ADMIN_API_KEY });
  }
}

export async function postAction(action, payload = {}) {
  if (action === "fetchProducts") {
    const products = filterProducts(groupLegacyProducts(await fetchLegacyRows()), payload.filters || {});
    const paged = paginateItems(products, payload.pagination || {});
    return { success: true, data: paged.items, pagination: paged.pagination };
  }

  if (action === "fetchProductById") {
    const detail = buildLegacyProductDetail(await fetchLegacyRows(), String(payload.data?.product_id || ""));
    return detail ? { success: true, data: detail } : { success: false, error: { message: "Product not found" }, data: null };
  }

  if (action === "fetchVariantsByProductId") {
    const detail = buildLegacyProductDetail(await fetchLegacyRows(), String(payload.data?.product_id || ""));
    return { success: true, data: { variants: detail?.variants || [], attributes: detail?.attributes || [] } };
  }

  if (action === "fetchCategories") return { success: true, data: collectLegacyCategories(await fetchLegacyRows()) };
  if (action === "fetchAttributes") return { success: true, data: collectLegacyAttributes(await fetchLegacyRows()) };

  if (action === "validateSku") {
    const normalizedSku = String(payload.data?.sku || "").trim().toUpperCase().replace(/[^A-Z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const existingId = String(payload.data?.variant_id || payload.data?.id || "");
    const exists = (await fetchLegacyRows()).map(normalizeLegacyRow).some((row) => String(row.sku || "").toUpperCase() === normalizedSku && String(row.variant_id) !== existingId);
    if (exists) return { success: false, error: { message: "SKU already exists" }, data: null };
    return { success: true, data: { sku: normalizedSku, valid: true } };
  }

  if (action === "createProduct") {
    const submission = buildVariantRows(payload.data || {}, payload.variants || []);
    for (const row of submission.rows) {
      const { id, ...data } = row;
      await postJson({ action: "create", data, apiKey: ADMIN_API_KEY });
    }
    return refetchProduct(submission.productId);
  }

  if (action === "updateProduct") {
    const requestedProductId = String(payload.data?.product_id || payload.data?.id || "");
    const existingRows = (await fetchLegacyRows()).map(normalizeLegacyRow).filter((row) => String(row.product_id) === requestedProductId || String(row.row_id) === requestedProductId);
    const submission = buildVariantRows({ ...(payload.data || {}), product_id: requestedProductId || payload.data?.product_id }, payload.variants || []);
    await syncLegacyProductRows(submission.productId, submission.rows, existingRows);

    return refetchProduct(submission.productId);
  }

  if (action === "deleteProduct") {
    const requestedProductId = String(payload.data?.product_id || payload.data?.id || "");
    const matches = (await fetchLegacyRows()).map(normalizeLegacyRow).filter((row) => String(row.product_id) === requestedProductId || String(row.row_id) === requestedProductId);
    if (matches.length) {
      for (const row of matches) await postJson({ action: "delete", id: row.row_id, apiKey: ADMIN_API_KEY });
    } else if (requestedProductId) {
      await postJson({ action: "delete", id: requestedProductId, apiKey: ADMIN_API_KEY });
    }
    return { success: true, data: { product_id: requestedProductId, deleted: true } };
  }

  if (action === "createVariant") {
    const row = buildVariantRows(payload.data || {}, [payload.data || {}]).rows[0];
    const { id, ...data } = row;
    await postJson({ action: "create", data, apiKey: ADMIN_API_KEY });
    return { success: true, data: { ...row, variant_id: row.id || row.sku } };
  }

  if (action === "updateVariant") {
    const row = buildVariantRows(payload.data || {}, [payload.data || {}]).rows[0];
    const { id, ...data } = row;
    await postJson({ action: "update", data: { id, ...data }, apiKey: ADMIN_API_KEY });
    return { success: true, data: { ...row, variant_id: row.id || row.sku } };
  }

  if (action === "deleteVariant") {
    const variantId = String(payload.data?.variant_id || payload.data?.id || "");
    if (variantId) await postJson({ action: "delete", id: variantId, apiKey: ADMIN_API_KEY });
    return { success: true, data: { variant_id: variantId, product_id: payload.data?.product_id || "" } };
  }

  if (action === "uploadCSV") {
    const rows = payload.data?.rows || payload.data || [];
    const json = await postJson({ action: "uploadCSV", data: rows, apiKey: ADMIN_API_KEY });
    return json?.success !== undefined ? json : { success: true, data: json };
  }

  return postJson({ action, apiKey: ADMIN_API_KEY, ...payload });
}