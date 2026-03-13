// Price Rule API service
import { postAction } from "../apiClient";

export const priceRuleAPI = {
  /**
   * Fetch all price rules
   */
  fetchPriceRules: async (filters = {}, pagination = {}) => {
    return postAction("fetchPriceRules", {
      filters,
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
      },
    });
  },

  /**
   * Fetch price rule by ID
   */
  fetchPriceRuleById: async (ruleId) => {
    return postAction("fetchPriceRuleById", {
      data: { rule_id: ruleId },
    });
  },

  /**
   * Create price rule
   */
  createPriceRule: async (ruleData) => {
    return postAction("createPriceRule", {
      data: ruleData,
    });
  },

  /**
   * Update price rule
   */
  updatePriceRule: async (ruleId, ruleData) => {
    return postAction("updatePriceRule", {
      data: {
        rule_id: ruleId,
        ...ruleData,
      },
    });
  },

  /**
   * Delete price rule
   */
  deletePriceRule: async (ruleId) => {
    return postAction("deletePriceRule", {
      data: { rule_id: ruleId },
    });
  },

  /**
   * Calculate discount for product
   */
  calculateDiscount: async (productId, variantId = null, storeId = null) => {
    return postAction("calculateDiscount", {
      data: {
        product_id: productId,
        variant_id: variantId,
        store_id: storeId,
      },
    });
  },

  /**
   * Get active rules
   */
  getActiveRules: async () => {
    return postAction("getActiveRules", {});
  },

  /**
   * Bulk update rule status
   */
  bulkUpdateRuleStatus: async (ruleIds, status) => {
    return postAction("bulkUpdateRuleStatus", {
      data: {
        rule_ids: ruleIds,
        status,
      },
    });
  },

  /**
   * Get applicable rules for product
   */
  getApplicableRules: async (productId, categoryId = null) => {
    return postAction("getApplicableRules", {
      data: {
        product_id: productId,
        category_id: categoryId,
      },
    });
  },
};

export default priceRuleAPI;
