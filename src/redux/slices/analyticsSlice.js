import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  (payload = {}, api) => invoke("fetchAnalytics", payload, api.rejectWithValue)
);

export const fetchProductAnalytics = createAsyncThunk(
  "analytics/fetchProductAnalytics",
  (payload = {}, api) => invoke("fetchProductAnalytics", payload, api.rejectWithValue)
);

export const fetchInventoryAnalytics = createAsyncThunk(
  "analytics/fetchInventoryAnalytics",
  (payload = {}, api) => invoke("fetchInventoryAnalytics", payload, api.rejectWithValue)
);

export const fetchSalesAnalytics = createAsyncThunk(
  "analytics/fetchSalesAnalytics",
  (payload = {}, api) => invoke("fetchSalesAnalytics", payload, api.rejectWithValue)
);

const initialState = {
  dashboard: {
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalRevenueValue: 0,
  },
  productMetrics: {
    byCategory: [],
    byStatus: [],
    topProducts: [],
  },
  inventoryMetrics: {
    totalStock: 0,
    lowStockItems: [],
    outOfStock: [],
    reserved: 0,
  },
  salesMetrics: {
    totalSales: 0,
    topProducts: [],
    byCategory: [],
  },
  chartData: {},
  loading: false,
  error: null,
  dateRange: {
    from: null,
    to: null,
  },
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || {};
        state.dashboard = {
          totalProducts: data.totalProducts || 0,
          totalCategories: data.totalCategories || 0,
          lowStockProducts: data.lowStockProducts || 0,
          totalRevenueValue: data.totalRevenueValue || 0,
        };
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.productMetrics = data;
      })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.inventoryMetrics = data;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.salesMetrics = data;
      });
  },
});

export const { setDateRange, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
