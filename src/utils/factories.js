/**
 * Factory functions for creating domain objects
 */

import { generateUUID } from './helpers';
import { slugify } from './formatters';

/**
 * Create new product object
 */
export function createProduct(data = {}) {
  return {
    product_id: data.product_id || generateUUID(),
    title: data.title || '',
    slug: data.slug || slugify(data.title || ''),
    description: data.description || '',
    brand: data.brand || '',
    category_id: data.category_id || null,
    category: data.category || null,
    attributes: data.attributes || {},
    images: data.images || [],
    status: data.status || 'draft',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create new category object
 */
export function createCategory(data = {}) {
  return {
    category_id: data.category_id || generateUUID(),
    name: data.name || '',
    slug: data.slug || slugify(data.name || ''),
    description: data.description || '',
    parent_id: data.parent_id || null,
    image_url: data.image_url || null,
    status: data.status || 'active',
    order: data.order || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create new attribute object
 */
export function createAttribute(data = {}) {
  return {
    attribute_id: data.attribute_id || generateUUID(),
    name: data.name || '',
    slug: data.slug || slugify(data.name || ''),
    type: data.type || 'text',
    values: data.values || [],
    is_filterable: data.is_filterable !== undefined ? data.is_filterable : true,
    is_visible: data.is_visible !== undefined ? data.is_visible : true,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create new attribute value
 */
export function createAttributeValue(data = {}) {
  return {
    value_id: data.value_id || generateUUID(),
    label: data.label || '',
    value: data.value || slugify(data.label || ''),
    color: data.color || null,
    image_url: data.image_url || null,
  };
}

/**
 * Create new variant object
 */
export function createVariant(data = {}) {
  return {
    variant_id: data.variant_id || generateUUID(),
    product_id: data.product_id || null,
    sku: data.sku || '',
    barcode: data.barcode || '',
    title: data.title || '',
    description: data.description || '',
    attribute_values: data.attribute_values || {},
    price: data.price || 0,
    compare_price: data.compare_price || 0,
    cost: data.cost || 0,
    images: data.images || [],
    stock: data.stock || 0,
    reserved: data.reserved || 0,
    low_stock_threshold: data.low_stock_threshold || 10,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create inventory record
 */
export function createInventory(data = {}) {
  return {
    inventory_id: data.inventory_id || generateUUID(),
    variant_id: data.variant_id || null,
    stock_available: data.stock_available || 0,
    stock_reserved: data.stock_reserved || 0,
    stock_total: data.stock_total || 0,
    low_stock_threshold: data.low_stock_threshold || 10,
    last_restock: data.last_restock || new Date().toISOString(),
    location: data.location || 'Default',
    history: data.history || [],
  };
}

/**
 * Create stock history record
 */
export function createStockHistory(data = {}) {
  return {
    id: data.id || generateUUID(),
    variant_id: data.variant_id || null,
    type: data.type || 'add', // add, remove, adjust, reserved
    quantity: data.quantity || 0,
    reason: data.reason || '',
    timestamp: data.timestamp || new Date().toISOString(),
    user: data.user || null,
  };
}

/**
 * Create price rule
 */
export function createPriceRule(data = {}) {
  return {
    rule_id: data.rule_id || generateUUID(),
    name: data.name || '',
    description: data.description || '',
    type: data.type || 'percentage', // percentage, fixed
    discount_value: data.discount_value || 0,
    target: data.target || {
      type: 'all', // all, category, product
      id: null,
    },
    active_from: data.active_from || new Date().toISOString(),
    active_to: data.active_to || null,
    status: data.status || 'active',
    priority: data.priority || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create store object
 */
export function createStore(data = {}) {
  return {
    store_id: data.store_id || generateUUID(),
    name: data.name || '',
    currency: data.currency || 'INR',
    country: data.country || '',
    status: data.status || 'active',
    primary: data.primary || false,
    config: data.config || {
      tax_rate: 0,
      shipping_cost: 0,
      min_order_value: 0,
    },
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

/**
 * Create CSV import job
 */
export function createImportJob(data = {}) {
  return {
    job_id: data.job_id || generateUUID(),
    file_name: data.file_name || '',
    status: data.status || 'pending', // pending, processing, completed, failed
    total_rows: data.total_rows || 0,
    processed_rows: data.processed_rows || 0,
    error_rows: data.error_rows || 0,
    mapping: data.mapping || {},
    errors: data.errors || [],
    created_at: data.created_at || new Date().toISOString(),
    completed_at: data.completed_at || null,
  };
}

/**
 * Create user object
 */
export function createUser(data = {}) {
  return {
    id: data.id || generateUUID(),
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'editor',
    status: data.status || 'active',
    permissions: data.permissions || [],
    created_at: data.created_at || new Date().toISOString(),
  };
}

/**
 * Create analytics metrics
 */
export function createAnalyticsMetrics(data = {}) {
  return {
    totalProducts: data.totalProducts || 0,
    totalCategories: data.totalCategories || 0,
    totalVariants: data.totalVariants || 0,
    lowStockProducts: data.lowStockProducts || 0,
    totalRevenue: data.totalRevenue || 0,
    ordersCount: data.ordersCount || 0,
    customersCount: data.customersCount || 0,
    dateRange: data.dateRange || { from: null, to: null },
  };
}

/**
 * Create filter object
 */
export function createFilter(data = {}) {
  return {
    search: data.search || '',
    category: data.category || null,
    status: data.status || null,
    priceRange: data.priceRange || { min: null, max: null },
    attributes: data.attributes || {},
    store: data.store || null,
  };
}

/**
 * Create pagination object
 */
export function createPagination(data = {}) {
  return {
    page: data.page || 1,
    pageSize: data.pageSize || 20,
    total: data.total || 0,
    totalPages: Math.ceil((data.total || 0) / (data.pageSize || 20)),
  };
}

/**
 * Create sort object
 */
export function createSort(data = {}) {
  return {
    field: data.field || 'created_at',
    order: data.order || 'desc', // asc, desc
  };
}

export default {
  createProduct,
  createCategory,
  createAttribute,
  createAttributeValue,
  createVariant,
  createInventory,
  createStockHistory,
  createPriceRule,
  createStore,
  createImportJob,
  createUser,
  createAnalyticsMetrics,
  createFilter,
  createPagination,
  createSort,
};
