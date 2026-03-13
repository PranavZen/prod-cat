import { slugify } from "./legacyCatalogue";

const FIELD_DEFINITIONS = {
  product_id: { label: "Product ID", aliases: ["product_id", "parent_sku", "group_id", "product code", "model_id", "style_id"] },
  title: { label: "Title", aliases: ["title", "name", "product_name", "product title", "item_name"] },
  description: { label: "Description", aliases: ["description", "details", "product_description", "about"] },
  brand: { label: "Brand", aliases: ["brand", "manufacturer", "make"] },
  category_id: { label: "Category", aliases: ["category", "category_id", "category_name", "department", "collection"] },
  status: { label: "Status", aliases: ["status", "state", "availability_status"] },
  image: { label: "Image URL", aliases: ["image", "image_url", "image1", "product_image", "main_image", "thumbnail"] },
  sku: { label: "SKU", aliases: ["sku", "variant_sku", "seller_sku", "item_sku", "code"] },
  price: { label: "Price", aliases: ["price", "selling_price", "sale_price", "mrp", "regular_price"] },
  compare_price: { label: "Compare Price", aliases: ["compare_price", "discount_price", "list_price", "original_price"] },
  inventory: { label: "Inventory", aliases: ["inventory", "stock", "qty", "quantity", "stock_qty", "available_qty"] },
  weight: { label: "Weight", aliases: ["weight", "shipping_weight"] },
  color: { label: "Color", aliases: ["color", "colour"] },
  storage: { label: "Storage", aliases: ["storage", "capacity", "memory"] },
  screen_size: { label: "Screen Size", aliases: ["screen_size", "screen size", "display_size", "display", "size"] },
};

export const CSV_FIELD_OPTIONS = Object.entries(FIELD_DEFINITIONS).map(([value, definition]) => ({ value, label: definition.label }));

const normalizeHeader = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
const normalizeCustomKey = (value = "") => normalizeHeader(value) || "custom_attribute";
const buildSourceSample = (rows, header) => rows.slice(0, 3).map((row) => row?.[header]).filter(Boolean).join(" • ");

function suggestField(header = "") {
  const normalized = normalizeHeader(header);
  const match = Object.entries(FIELD_DEFINITIONS).find(([, definition]) => definition.aliases.map(normalizeHeader).includes(normalized));
  return match?.[0] || null;
}

export function getDefaultCsvMapping(headers = [], rows = []) {
  return headers.reduce((acc, header) => {
    const suggestedField = suggestField(header);
    acc[header] = suggestedField
      ? { mode: "field", value: suggestedField, sample: buildSourceSample(rows, header) }
      : { mode: "custom", value: normalizeCustomKey(header), sample: buildSourceSample(rows, header) };
    return acc;
  }, {});
}

function deriveProductId(row, index) {
  const seed = [row.brand, row.title, row.category_id].filter(Boolean).join("-");
  return `PROD-${slugify(seed || `item-${index + 1}`)}`.toUpperCase();
}

export function buildMappedRows(rows = [], mapping = {}) {
  return rows.map((row, index) => {
    const mapped = {};
    Object.entries(mapping).forEach(([sourceHeader, config]) => {
      const rawValue = row?.[sourceHeader];
      if (!config || config.mode === "ignore") return;
      const targetKey = config.mode === "custom" ? normalizeCustomKey(config.value || sourceHeader) : config.value;
      if (!targetKey) return;
      mapped[targetKey] = rawValue;
    });

    if (mapped.category && !mapped.category_id) mapped.category_id = mapped.category;
    if (mapped.category_id && !mapped.category) mapped.category = mapped.category_id;
    if (mapped.image_url && !mapped.image) mapped.image = mapped.image_url;
    if (mapped.primary_image && !mapped.image) mapped.image = mapped.primary_image;
    if (mapped.variant_sku && !mapped.sku) mapped.sku = mapped.variant_sku;
    if (mapped.sku && !mapped.variant_sku) mapped.variant_sku = mapped.sku;
    if (!mapped.product_id && (mapped.title || mapped.brand || mapped.category_id)) mapped.product_id = deriveProductId(mapped, index);

    return mapped;
  });
}

export function summarizeMapping(mapping = {}) {
  const entries = Object.values(mapping);
  return {
    mappedColumns: entries.filter((item) => item?.mode !== "ignore").length,
    ignoredColumns: entries.filter((item) => item?.mode === "ignore").length,
    customColumns: entries.filter((item) => item?.mode === "custom").length,
  };
}

export function buildImportSummary(rows = [], analysis = null) {
  const productIds = new Set(rows.map((row) => row.product_id).filter(Boolean));
  return {
    productsCreated: productIds.size || rows.length,
    variantsCreated: rows.length,
    attributesCreated: analysis?.dynamicAttributes?.length || 0,
    analysis,
  };
}