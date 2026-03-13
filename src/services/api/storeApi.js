// Store API service
import { postAction } from "../apiClient";

export const storeAPI = {
  /**
   * Fetch all stores
   */
  fetchStores: async () => {
    return postAction("fetchStores", {});
  },

  /**
   * Fetch store by ID
   */
  fetchStoreById: async (storeId) => {
    return postAction("fetchStoreById", {
      data: { store_id: storeId },
    });
  },

  /**
   * Create store
   */
  createStore: async (storeData) => {
    return postAction("createStore", {
      data: storeData,
    });
  },

  /**
   * Update store
   */
  updateStore: async (storeId, storeData) => {
    return postAction("updateStore", {
      data: {
        store_id: storeId,
        ...storeData,
      },
    });
  },

  /**
   * Delete store
   */
  deleteStore: async (storeId) => {
    return postAction("deleteStore", {
      data: { store_id: storeId },
    });
  },

  /**
   * Set primary store
   */
  setPrimaryStore: async (storeId) => {
    return postAction("setPrimaryStore", {
      data: { store_id: storeId },
    });
  },

  /**
   * Set store-specific product pricing
   */
  setStoreProductPrice: async (storeId, productId, price) => {
    return postAction("setStoreProductPrice", {
      data: {
        store_id: storeId,
        product_id: productId,
        price,
      },
    });
  },

  /**
   * Get store-specific product price
   */
  getStoreProductPrice: async (storeId, productId) => {
    return postAction("getStoreProductPrice", {
      data: {
        store_id: storeId,
        product_id: productId,
      },
    });
  },

  /**
   * Set store product availability
   */
  setStoreProductAvailability: async (storeId, productId, available) => {
    return postAction("setStoreProductAvailability", {
      data: {
        store_id: storeId,
        product_id: productId,
        available,
      },
    });
  },

  /**
   * Get store-specific products catalog
   */
  getStoreCatalog: async (storeId, pagination = {}) => {
    return postAction("getStoreCatalog", {
      data: { store_id: storeId },
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
      },
    });
  },
};

export default storeAPI;
