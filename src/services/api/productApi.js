// Product API service
import { postAction } from "../apiClient";

export const productAPI = {
  /**
   * Fetch all products with filters and pagination
   */
  fetchProducts: async (filters = {}, pagination = {}, sort = {}) => {
    return postAction("fetchProducts", {
      filters,
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
        ...pagination,
      },
      sort,
    });
  },

  /**
   * Fetch single product by ID with variants
   */
  fetchProductById: async (productId) => {
    return postAction("fetchProductById", {
      data: { product_id: productId },
    });
  },

  /**
   * Create new product
   */
  createProduct: async (productData) => {
    return postAction("createProduct", {
      data: productData,
    });
  },

  /**
   * Update existing product
   */
  updateProduct: async (productId, productData) => {
    return postAction("updateProduct", {
      data: {
        product_id: productId,
        ...productData,
      },
    });
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId) => {
    return postAction("deleteProduct", {
      data: { product_id: productId },
    });
  },

  /**
   * Bulk update products
   */
  bulkUpdateProducts: async (updates) => {
    return postAction("bulkUpdateProducts", {
      data: { updates },
    });
  },

  /**
   * Validate SKU uniqueness
   */
  validateSku: async (sku, productId = null) => {
    return postAction("validateSku", {
      data: { sku, product_id: productId },
    });
  },

  /**
   * Search products
   */
  searchProducts: async (query, filters = {}) => {
    return postAction("searchProducts", {
      data: { query },
      filters,
    });
  },

  /**
   * Get product recommendations
   */
  getRecommendations: async (productId, limit = 5) => {
    return postAction("getRecommendations", {
      data: { product_id: productId, limit },
    });
  },
};

export default productAPI;
