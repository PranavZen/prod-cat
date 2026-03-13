import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const adapter = createEntityAdapter({ selectId: (item) => item.inventory_id || item.variant_id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  (payload = {}, api) => invoke("fetchInventory", payload, api.rejectWithValue)
);

export const fetchStockByVariant = createAsyncThunk(
  "inventory/fetchStockByVariant",
  (payload = {}, api) => invoke("fetchStockByVariant", payload, api.rejectWithValue)
);

export const adjustStock = createAsyncThunk(
  "inventory/adjustStock",
  (payload = {}, api) => invoke("adjustStock", payload, api.rejectWithValue)
);

export const addStockHistory = createAsyncThunk(
  "inventory/addStockHistory",
  (payload = {}, api) => invoke("addStockHistory", payload, api.rejectWithValue)
);

export const fetchStockHistory = createAsyncThunk(
  "inventory/fetchStockHistory",
  (payload = {}, api) => invoke("fetchStockHistory", payload, api.rejectWithValue)
);

export const setLowStockAlert = createAsyncThunk(
  "inventory/setLowStockAlert",
  (payload = {}, api) => invoke("setLowStockAlert", payload, api.rejectWithValue)
);

const initialState = adapter.getInitialState({
  loading: false,
  error: null,
  history: [],
  alerts: [],
  lowStockItems: [],
});

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data || [];
        adapter.setAll(state, items);
        state.lowStockItems = items.filter((item) => item.stock_available <= item.low_stock_threshold);
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.history = action.payload.data || [];
      })
      .addCase(setLowStockAlert.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      });
  },
});

export const { clearError } = inventorySlice.actions;
export const selectAllInventory = (state) => adapter.getSelectors().selectAll(state.inventory);
export const selectInventoryByVariant = (state, variantId) =>
  adapter.getSelectors().selectById(state.inventory, variantId);
export const selectLowStockItems = (state) => state.inventory.lowStockItems;
export const selectStockHistory = (state) => state.inventory.history;
export default inventorySlice.reducer;
