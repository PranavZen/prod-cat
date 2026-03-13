/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "https://script.google.com/macros/d/",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// File Upload
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 5242880, // 5MB
  ACCEPTED_TYPES: {
    CSV: "text/csv",
    XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    XLS: "application/vnd.ms-excel",
  },
  ACCEPTED_EXTENSIONS: [".csv", ".xlsx", ".xls"],
};

// Product Status
export const PRODUCT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

export const PRODUCT_STATUS_LABELS = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export const PRODUCT_STATUS_COLORS = {
  draft: "warning",
  active: "success",
  inactive: "secondary",
  archived: "danger",
};

// Inventory Status
export const INVENTORY_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
};

// Attribute Types
export const ATTRIBUTE_TYPES = {
  TEXT: "text",
  SELECT: "select",
  MULTISELECT: "multiselect",
  CHECKBOX: "checkbox",
  COLOR: "color",
  SIZE: "size",
};

// Price Rule Types
export const PRICE_RULE_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

// Currency Codes
export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_URL: "Please enter a valid URL",
  INVALID_FILE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  NETWORK_ERROR: "Network error. Please try again.",
  SERVER_ERROR: "Server error. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  DUPLICATE_SKU: "This SKU already exists",
  DUPLICATE_SLUG: "This slug already exists",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  UPLOADED: "Uploaded successfully",
  IMPORTED: "Imported successfully",
};

// Validation Rules
export const VALIDATION = {
  MIN_PRODUCT_NAME_LENGTH: 3,
  MAX_PRODUCT_NAME_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_SKU_LENGTH: 3,
  MAX_SKU_LENGTH: 50,
  MIN_CATEGORY_NAME_LENGTH: 2,
  MAX_CATEGORY_NAME_LENGTH: 100,
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  ISO: "YYYY-MM-DD",
  US: "MM/DD/YYYY",
  SHORT: "DD MMM",
  LONG: "DD MMMM YYYY",
  TIME: "HH:mm:ss",
  DATETIME: "DD/MM/YYYY HH:mm:ss",
};

// Feature Flags
export const FEATURES = {
  MULTI_STORE: true,
  PRICE_RULES: true,
  CSV_IMPORT: true,
  ANALYTICS: true,
  INVENTORY_TRACKING: true,
  PRODUCT_VARIANTS: true,
  ATTRIBUTES: true,
};

// Cache Duration (in minutes)
export const CACHE_DURATION = {
  PRODUCTS: 30,
  CATEGORIES: 60,
  ATTRIBUTES: 60,
  STORES: 60,
  PRICE_RULES: 30,
  ANALYTICS: 15,
};

// Sidebar Menu Items
export const SIDEBAR_MENU = [
  { label: "Dashboard", path: "/admin", icon: "📊" },
  { label: "Products", path: "/admin/products", icon: "📦" },
  { label: "Categories", path: "/admin/categories", icon: "🏷️" },
  { label: "Attributes", path: "/admin/attributes", icon: "⚙️" },
  { label: "Variants", path: "/admin/variants", icon: "🔄" },
  { label: "Inventory", path: "/admin/inventory", icon: "📦" },
  { label: "Price Rules", path: "/admin/price-rules", icon: "💰" },
  { label: "Stores", path: "/admin/stores", icon: "🏪" },
  { label: "CSV Import", path: "/admin/import", icon: "📤" },
  { label: "Analytics", path: "/admin/analytics", icon: "📈" },
  { label: "Settings", path: "/admin/settings", icon: "⚙️" },
];

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  ROWS_PER_PAGE: 20,
};

export default {
  API_CONFIG,
  PAGINATION,
  FILE_CONFIG,
  PRODUCT_STATUS,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_COLORS,
  INVENTORY_STATUS,
  ATTRIBUTE_TYPES,
  PRICE_RULE_TYPES,
  CURRENCIES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  DATE_FORMATS,
  FEATURES,
  CACHE_DURATION,
  SIDEBAR_MENU,
  BREAKPOINTS,
  TABLE_CONFIG,
};
