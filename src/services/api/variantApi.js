// Variant API service
import { postAction } from "../apiClient";

export const variantAPI = {
  /**
   * Fetch variants by product ID
   */
  fetchVariantsByProductId: async (productId) => {
    return postAction("fetchVariantsByProductId", {
      data: { product_id: productId },
    });
  },

  /**
   * Fetch single variant
   */
  fetchVariantById: async (variantId) => {
    return postAction("fetchVariantById", {
      data: { variant_id: variantId },
    });
  },

  /**
   * Create variant
   */
  createVariant: async (variantData) => {
    return postAction("createVariant", {
      data: variantData,
    });
  },

  /**
   * Update variant
   */
  updateVariant: async (variantId, variantData) => {
    return postAction("updateVariant", {
      data: {
        variant_id: variantId,
        ...variantData,
      },
    });
  },

  /**
   * Delete variant
   */
  deleteVariant: async (variantId) => {
    return postAction("deleteVariant", {
      data: { variant_id: variantId },
    });
  },

  /**
   * Generate variants from attributes
   */
  generateVariants: async (productId, attributes) => {
    return postAction("generateVariants", {
      data: {
        product_id: productId,
        attributes,
      },
    });
  },

  /**
   * Bulk update variants
   */
  bulkUpdateVariants: async (variantUpdates) => {
    return postAction("bulkUpdateVariants", {
      data: { updates: variantUpdates },
    });
  },

  /**
   * Get variant by SKU
   */
  getVariantBySku: async (sku) => {
    return postAction("getVariantBySku", {
      data: { sku },
    });
  },
};

export default variantAPI;
