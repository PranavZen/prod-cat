// Attribute API service
import { postAction } from "../apiClient";

export const attributeAPI = {
  /**
   * Fetch all attributes
   */
  fetchAttributes: async (filters = {}) => {
    return postAction("fetchAttributes", {
      filters,
    });
  },

  /**
   * Fetch attribute by ID
   */
  fetchAttributeById: async (attributeId) => {
    return postAction("fetchAttributeById", {
      data: { attribute_id: attributeId },
    });
  },

  /**
   * Create attribute
   */
  createAttribute: async (attributeData) => {
    return postAction("createAttribute", {
      data: attributeData,
    });
  },

  /**
   * Update attribute
   */
  updateAttribute: async (attributeId, attributeData) => {
    return postAction("updateAttribute", {
      data: {
        attribute_id: attributeId,
        ...attributeData,
      },
    });
  },

  /**
   * Delete attribute
   */
  deleteAttribute: async (attributeId) => {
    return postAction("deleteAttribute", {
      data: { attribute_id: attributeId },
    });
  },

  /**
   * Add attribute value
   */
  addAttributeValue: async (attributeId, value) => {
    return postAction("addAttributeValue", {
      data: {
        attribute_id: attributeId,
        value,
      },
    });
  },

  /**
   * Remove attribute value
   */
  removeAttributeValue: async (attributeId, valueId) => {
    return postAction("removeAttributeValue", {
      data: {
        attribute_id: attributeId,
        value_id: valueId,
      },
    });
  },

  /**
   * Get attribute values
   */
  getAttributeValues: async (attributeId) => {
    return postAction("getAttributeValues", {
      data: { attribute_id: attributeId },
    });
  },

  /**
   * Get filterable attributes
   */
  getFilterableAttributes: async () => {
    return postAction("getFilterableAttributes", {});
  },
};

export default attributeAPI;
