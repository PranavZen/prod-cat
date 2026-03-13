// Category API service
import { postAction } from "../apiClient";

export const categoryAPI = {
  /**
   * Fetch all categories
   */
  fetchCategories: async (filters = {}) => {
    return postAction("fetchCategories", {
      filters,
    });
  },

  /**
   * Fetch category by ID
   */
  fetchCategoryById: async (categoryId) => {
    return postAction("fetchCategoryById", {
      data: { category_id: categoryId },
    });
  },

  /**
   * Get category tree (nested structure)
   */
  getCategoryTree: async () => {
    return postAction("getCategoryTree", {});
  },

  /**
   * Create category
   */
  createCategory: async (categoryData) => {
    return postAction("createCategory", {
      data: categoryData,
    });
  },

  /**
   * Update category
   */
  updateCategory: async (categoryId, categoryData) => {
    return postAction("updateCategory", {
      data: {
        category_id: categoryId,
        ...categoryData,
      },
    });
  },

  /**
   * Delete category
   */
  deleteCategory: async (categoryId) => {
    return postAction("deleteCategory", {
      data: { category_id: categoryId },
    });
  },

  /**
   * Get products in category
   */
  getProductsByCategory: async (categoryId, pagination = {}) => {
    return postAction("getProductsByCategory", {
      data: { category_id: categoryId },
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
      },
    });
  },

  /**
   * Update category order
   */
  updateCategoryOrder: async (orderData) => {
    return postAction("updateCategoryOrder", {
      data: { order: orderData },
    });
  },

  /**
   * Check slug availability
   */
  checkSlug: async (slug, categoryId = null) => {
    return postAction("checkSlug", {
      data: { slug, category_id: categoryId },
    });
  },
};

export default categoryAPI;
