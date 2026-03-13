// CSV API service
import { postAction } from "../apiClient";

export const csvAPI = {
  /**
   * Upload and validate CSV file
   */
  uploadCSV: async (file, mapping = {}, options = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mapping", JSON.stringify(mapping));
    formData.append("options", JSON.stringify(options));

    return postAction("uploadCSV", {
      data: {
        file: await file.text(),
        mapping,
        options,
      },
    });
  },

  /**
   * Validate CSV data
   */
  validateCSV: async (csvData, mapping = {}) => {
    return postAction("validateCSV", {
      data: {
        csv_data: csvData,
        mapping,
      },
    });
  },

  /**
   * Preview CSV import
   */
  previewCSV: async (csvData, limit = 10) => {
    return postAction("previewCSV", {
      data: {
        csv_data: csvData,
        limit,
      },
    });
  },

  /**
   * Import CSV products
   */
  importCSV: async (csvData, mapping = {}, options = {}) => {
    return postAction("importCSV", {
      data: {
        csv_data: csvData,
        mapping,
        options,
      },
    });
  },

  /**
   * Export products to CSV
   */
  exportCSV: async (filters = {}, columns = []) => {
    return postAction("exportCSV", {
      data: {
        filters,
        columns,
      },
    });
  },

  /**
   * Export by category
   */
  exportByCategory: async (categoryId, columns = []) => {
    return postAction("exportByCategory", {
      data: {
        category_id: categoryId,
        columns,
      },
    });
  },

  /**
   * Get import templates
   */
  getImportTemplates: async () => {
    return postAction("getImportTemplates", {});
  },

  /**
   * Get import job status
   */
  getImportJobStatus: async (jobId) => {
    return postAction("getImportJobStatus", {
      data: { job_id: jobId },
    });
  },

  /**
   * Cancel import job
   */
  cancelImportJob: async (jobId) => {
    return postAction("cancelImportJob", {
      data: { job_id: jobId },
    });
  },

  /**
   * Get CSV column suggestions
   */
  getColumnSuggestions: async (headers) => {
    return postAction("getColumnSuggestions", {
      data: { headers },
    });
  },
};

export default csvAPI;
