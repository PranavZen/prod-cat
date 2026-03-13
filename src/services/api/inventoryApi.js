// Inventory API service
import { postAction } from "../apiClient";

export const inventoryAPI = {
  /**
   * Fetch inventory for all variants
   */
  fetchInventory: async (filters = {}, pagination = {}) => {
    return postAction("fetchInventory", {
      filters,
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
      },
    });
  },

  /**
   * Get stock by variant
   */
  fetchStockByVariant: async (variantId) => {
    return postAction("fetchStockByVariant", {
      data: { variant_id: variantId },
    });
  },

  /**
   * Adjust stock
   */
  adjustStock: async (variantId, quantity, reason = "") => {
    return postAction("adjustStock", {
      data: {
        variant_id: variantId,
        quantity,
        reason,
      },
    });
  },

  /**
   * Add stock
   */
  addStock: async (variantId, quantity, reason = "Manual restock") => {
    return inventoryAPI.adjustStock(variantId, quantity, reason);
  },

  /**
   * Remove stock
   */
  removeStock: async (variantId, quantity, reason = "Manual removal") => {
    return inventoryAPI.adjustStock(variantId, -quantity, reason);
  },

  /**
   * Reserve stock
   */
  reserveStock: async (variantId, quantity, orderId) => {
    return postAction("reserveStock", {
      data: {
        variant_id: variantId,
        quantity,
        order_id: orderId,
      },
    });
  },

  /**
   * Release reserved stock
   */
  releaseReservedStock: async (variantId, quantity, orderId) => {
    return postAction("releaseReservedStock", {
      data: {
        variant_id: variantId,
        quantity,
        order_id: orderId,
      },
    });
  },

  /**
   * Get stock history
   */
  fetchStockHistory: async (variantId, pagination = {}) => {
    return postAction("fetchStockHistory", {
      data: { variant_id: variantId },
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 50,
      },
    });
  },

  /**
   * Set low stock threshold
   */
  setLowStockAlert: async (variantId, threshold) => {
    return postAction("setLowStockAlert", {
      data: {
        variant_id: variantId,
        threshold,
      },
    });
  },

  /**
   * Get low stock items
   */
  getLowStockItems: async () => {
    return postAction("getLowStockItems", {});
  },

  /**
   * Get out of stock items
   */
  getOutOfStockItems: async (pagination = {}) => {
    return postAction("getOutOfStockItems", {
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
      },
    });
  },

  /**
   * Bulk adjust stock
   */
  bulkAdjustStock: async (adjustments) => {
    return postAction("bulkAdjustStock", {
      data: { adjustments },
    });
  },
};

export default inventoryAPI;
