const CORE_PRODUCT = ["product_id", "title", "description", "brand", "category", "category_id", "status", "image"];
const CORE_VARIANT = ["sku", "variant_sku", "price", "compare_price", "inventory", "weight", "color", "storage", "screen_size"];

const normalizeSku = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export function analyzeCsvRows(rows = []) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const dynamicAttributes = headers.filter(
    (key) => !CORE_PRODUCT.includes(key) && !CORE_VARIANT.includes(key),
  );

  const seen = new Map();
  const rowErrors = [];
  rows.forEach((row, index) => {
    if (!String(row.title || "").trim()) rowErrors.push({ row: index + 2, field: "title", message: "Title is required" });
    const sku = normalizeSku(row.sku || row.variant_sku);
    if (!sku) rowErrors.push({ row: index + 2, field: "sku", message: "SKU is required" });
    if (sku) {
      const list = seen.get(sku) || [];
      list.push(index + 2);
      seen.set(sku, list);
    }
  });

  seen.forEach((rowsForSku, sku) => {
    if (rowsForSku.length > 1) rowErrors.push({ row: rowsForSku.join(", "), field: "sku", message: `Duplicate SKU in file: ${sku}` });
  });

  return {
    headers,
    rowCount: rows.length,
    uniqueProductCount: new Set(rows.map((row) => row.product_id).filter(Boolean)).size,
    coreProductColumns: CORE_PRODUCT.filter((key) => headers.includes(key)),
    coreVariantColumns: CORE_VARIANT.filter((key) => headers.includes(key)),
    dynamicAttributes,
    rowErrors,
  };
}

