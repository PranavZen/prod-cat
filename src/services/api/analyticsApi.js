// Analytics API service
import { postAction } from "../apiClient";

export const analyticsAPI = {
  /**
   * Get dashboard metrics
   */
  fetchAnalytics: async (dateRange = {}) => {
    return postAction("fetchAnalytics", {
      data: { date_range: dateRange },
    });
  },

  /**
   * Get product analytics
   */
  fetchProductAnalytics: async (filters = {}) => {
    return postAction("fetchProductAnalytics", {
      data: { filters },
    });
  },

  /**
   * Get inventory analytics
   */
  fetchInventoryAnalytics: async (filters = {}) => {
    return postAction("fetchInventoryAnalytics", {
      data: { filters },
    });
  },

  /**
   * Get sales analytics
   */
  fetchSalesAnalytics: async (dateRange = {}, storeId = null) => {
    return postAction("fetchSalesAnalytics", {
      data: {
        date_range: dateRange,
        store_id: storeId,
      },
    });
  },

  /**
   * Get category analytics
   */
  getCategoryAnalytics: async (categoryId = null, dateRange = {}) => {
    return postAction("getCategoryAnalytics", {
      data: {
        category_id: categoryId,
        date_range: dateRange,
      },
    });
  },

  /**
   * Get product performance
   */
  getProductPerformance: async (limit = 10, dateRange = {}) => {
    return postAction("getProductPerformance", {
      data: {
        limit,
        date_range: dateRange,
      },
    });
  },

  /**
   * Get low stock alerts
   */
  getLowStockAlerts: async () => {
    return postAction("getLowStockAlerts", {});
  },

  /**
   * Get category distribution
   */
  getCategoryDistribution: async () => {
    return postAction("getCategoryDistribution", {});
  },

  /**
   * Get inventory status
   */
  getInventoryStatus: async () => {
    return postAction("getInventoryStatus", {});
  },

  /**
   * Get price rule analytics
   */
  getPriceRuleAnalytics: async () => {
    return postAction("getPriceRuleAnalytics", {});
  },

  /**
   * Get store-wise analytics
   */
  getStoreAnalytics: async (storeId, dateRange = {}) => {
    return postAction("getStoreAnalytics", {
      data: {
        store_id: storeId,
        date_range: dateRange,
      },
    });
  },

  /**
   * Generate custom report
   */
  generateReport: async (reportConfig) => {
    return postAction("generateReport", {
      data: { config: reportConfig },
    });
  },
};

export default analyticsAPI;
