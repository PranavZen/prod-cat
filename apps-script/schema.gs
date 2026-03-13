var SHEETS_ = {
  PRODUCTS: "Products",
  VARIANTS: "Variants",
  VARIANT_ATTRIBUTES: "VariantAttributes",
  CATEGORIES: "Categories",
  ATTRIBUTES: "Attributes",
  PRODUCT_IMAGES: "ProductImages",
  INDEXES: "Indexes",
  IMPORT_JOBS: "ImportJobs",
};

var ID_PREFIX_ = {
  PRODUCT: "PROD",
  VARIANT: "VAR",
  IMAGE: "IMG",
  CATEGORY: "CAT",
  ATTRIBUTE: "ATTR",
};

var ENTITY_STATUS_ = {
  DRAFT: "draft",
  ACTIVE: "active",
  ARCHIVED: "archived",
  DELETED: "deleted",
};

var PRODUCT_HEADERS_ = [
  "product_id", "title", "description", "brand", "category_id",
  "status", "created_at", "updated_at",
];

var VARIANT_HEADERS_ = [
  "variant_id", "product_id", "sku", "price", "compare_price",
  "inventory", "weight", "status", "created_at", "updated_at",
];

var VARIANT_ATTRIBUTE_HEADERS_ = [
  "variant_id", "attribute_name", "attribute_value",
];

var CATEGORY_HEADERS_ = [
  "category_id", "name", "parent_id", "slug", "status",
];

var ATTRIBUTE_HEADERS_ = [
  "attribute_id", "name", "type", "status",
];

var PRODUCT_IMAGE_HEADERS_ = [
  "image_id", "product_id", "image_url", "position", "alt_text",
];

