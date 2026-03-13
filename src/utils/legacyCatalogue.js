export const RESERVED_ATTRIBUTE_KEYS = new Set([
  "id", "product_id", "variant_id", "title", "name", "description", "brand",
  "category", "category_id", "category_name", "status", "image", "image_url",
  "primary_image", "price", "min_price", "max_price", "discount_price",
  "compare_price", "inventory", "inventory_total", "sku", "variant_sku",
  "created_at", "updated_at", "legacy_mode", "row_id", "attributes", "attribute_map",
  "option_names", "option_values", "variant_count", "images", "raw", "__parsed_extra",
  "product_field_keys",
]);

export const DEFAULT_OPTION_FIELDS = ["color", "storage", "screen_size"];
export const CORE_PRODUCT_FIELDS = [
  "product_id", "title", "description", "brand", "price", "image", "inventory",
  "category_id", "status",
];

export const pickFirstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
export const toDisplayLabel = (value = "") => String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
export const slugify = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
const parseFieldKeys = (value = "") => Array.from(new Set(String(Array.isArray(value) ? value.join(",") : value).split(",").map((item) => item.trim()).filter(Boolean)));

export function buildGeneratedProductId(form = {}) {
  const existingProductId = pickFirstValue(form.product_id);
  if (existingProductId) return String(existingProductId).toUpperCase();

  return String(
    `PROD-${slugify(form.title || form.name || "product")}-${Date.now().toString(36)}`,
  ).toUpperCase();
}

export function normalizeLegacyRow(item = {}, index = 0) {
  const rowId = String(pickFirstValue(item.id, item.variant_id, `ROW-${index + 1}`));
  const productId = String(pickFirstValue(item.product_id, rowId));
  const title = pickFirstValue(item.title, item.name, `Untitled product ${index + 1}`);
  const image = pickFirstValue(item.image_url, item.primary_image, item.image, "");
  const price = pickFirstValue(item.price, item.min_price, "");
  const comparePrice = pickFirstValue(item.compare_price, item.discount_price, "");
  const sku = pickFirstValue(item.variant_sku, item.sku, "");
  const productFieldKeys = parseFieldKeys(item.product_field_keys);
  const attributes = Object.entries(item)
    .filter(([key, value]) => !RESERVED_ATTRIBUTE_KEYS.has(key) && !productFieldKeys.includes(key) && value !== "" && value != null)
    .map(([attribute_name, attribute_value]) => ({ attribute_name, attribute_label: toDisplayLabel(attribute_name), attribute_value }));

  return {
    ...item,
    raw: item,
    legacy_mode: true,
    row_id: rowId,
    variant_id: rowId,
    id: rowId,
    product_id: productId,
    title,
    description: item.description || "",
    brand: item.brand || "",
    category_id: pickFirstValue(item.category_id, item.category, "Uncategorized"),
    category_name: pickFirstValue(item.category_name, item.category, item.category_id, "Uncategorized"),
    status: pickFirstValue(item.status, "active"),
    primary_image: image,
    image,
    price,
    min_price: price,
    max_price: pickFirstValue(item.max_price, item.discount_price, item.price, ""),
    compare_price: comparePrice,
    inventory: pickFirstValue(item.inventory, item.inventory_total, ""),
    inventory_total: pickFirstValue(item.inventory_total, item.inventory, ""),
    sku,
    variant_sku: sku,
    product_field_keys: productFieldKeys,
    attributes,
    attribute_map: Object.fromEntries(attributes.map((entry) => [entry.attribute_name, String(entry.attribute_value)])),
  };
}

export function groupLegacyProducts(rawRows = []) {
  const grouped = new Map();
  rawRows.map((row, index) => normalizeLegacyRow(row, index)).forEach((row) => {
    if (!grouped.has(row.product_id)) grouped.set(row.product_id, []);
    grouped.get(row.product_id).push(row);
  });

  return Array.from(grouped.entries()).map(([productId, rows]) => {
    const first = rows[0];
    const optionValues = {};
    const priceValues = rows.map((row) => toNumber(row.price)).filter((value) => value != null);
    const inventoryValues = rows.map((row) => toNumber(row.inventory)).filter((value) => value != null);
    const images = Array.from(new Map(rows.filter((row) => row.primary_image).map((row) => [row.primary_image, { image_id: `${row.variant_id}-image`, image_url: row.primary_image, alt_text: first.title }])).values());

    rows.forEach((row) => {
      row.attributes.forEach((attribute) => {
        if (!optionValues[attribute.attribute_name]) optionValues[attribute.attribute_name] = [];
        if (!optionValues[attribute.attribute_name].includes(String(attribute.attribute_value))) optionValues[attribute.attribute_name].push(String(attribute.attribute_value));
      });
    });

    DEFAULT_OPTION_FIELDS.filter((name) => optionValues[name]?.length).forEach((name) => {
      optionValues[name] = optionValues[name].sort((a, b) => a.localeCompare(b));
    });

    return {
      ...first,
      product_id: productId,
      id: productId,
      primary_image: first.primary_image || images[0]?.image_url || "",
      min_price: priceValues.length ? Math.min(...priceValues) : first.price,
      max_price: priceValues.length ? Math.max(...priceValues) : first.price,
      price: priceValues.length ? Math.min(...priceValues) : first.price,
      inventory_total: inventoryValues.length ? inventoryValues.reduce((sum, value) => sum + value, 0) : first.inventory,
      sku: rows[0]?.sku || "",
      variant_count: rows.length,
      option_names: Object.keys(optionValues),
      option_values: optionValues,
      images,
    };
  }).sort((a, b) => String(a.category_name).localeCompare(String(b.category_name)) || String(a.title).localeCompare(String(b.title)));
}

export function buildLegacyProductDetail(rawRows = [], productId) {
  const normalizedRows = rawRows.map((row, index) => normalizeLegacyRow(row, index));
  const variants = normalizedRows.filter((row) => String(row.product_id) === String(productId) || String(row.row_id) === String(productId));
  if (!variants.length) return null;
  const product = groupLegacyProducts(variants)[0];
  return {
    product,
    variants,
    images: product.images || [],
    attributes: Array.from(new Set(variants.flatMap((row) => row.attributes.map((attribute) => attribute.attribute_name)))).map((name) => ({ attribute_id: name, name: toDisplayLabel(name), type: "text" })),
    productFields: (product.product_field_keys || []).map((name) => ({ name, label: toDisplayLabel(name), value: pickFirstValue(product[name], "") })),
    groupedAttributes: Object.fromEntries(variants.map((variant) => [variant.variant_id, variant.attributes])),
    optionValues: product.option_values || {},
  };
}

export function collectLegacyCategories(rawRows = []) {
  return Array.from(new Set(groupLegacyProducts(rawRows).map((item) => item.category_name || item.category_id).filter(Boolean))).map((name) => ({ category_id: name, name, slug: slugify(name) }));
}

export function collectLegacyAttributes(rawRows = []) {
  const names = new Set();
  rawRows.map((row, index) => normalizeLegacyRow(row, index)).forEach((row) => row.attributes.forEach((attribute) => names.add(attribute.attribute_name)));
  return Array.from(names).sort((a, b) => a.localeCompare(b)).map((name) => ({ attribute_id: name, name: toDisplayLabel(name), type: "text" }));
}