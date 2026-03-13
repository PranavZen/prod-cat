import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const adapter = createEntityAdapter({ selectId: (item) => item.store_id || item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchStores = createAsyncThunk(
  "stores/fetchStores",
  (payload = {}, api) => invoke("fetchStores", payload, api.rejectWithValue)
);

export const fetchStoreById = createAsyncThunk(
  "stores/fetchStoreById",
  (payload = {}, api) => invoke("fetchStoreById", payload, api.rejectWithValue)
);

export const createStore = createAsyncThunk(
  "stores/createStore",
  (payload = {}, api) => invoke("createStore", payload, api.rejectWithValue)
);

export const updateStore = createAsyncThunk(
  "stores/updateStore",
  (payload = {}, api) => invoke("updateStore", payload, api.rejectWithValue)
);

export const deleteStore = createAsyncThunk(
  "stores/deleteStore",
  (payload = {}, api) => invoke("deleteStore", payload, api.rejectWithValue)
);

export const setStoreProductPrice = createAsyncThunk(
  "stores/setStoreProductPrice",
  (payload = {}, api) => invoke("setStoreProductPrice", payload, api.rejectWithValue)
);

const initialState = adapter.getInitialState({
  loading: false,
  error: null,
  primaryStore: null,
  storePricing: {}, // product/variant pricing per store
});

const storeSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPrimaryStore: (state, action) => {
      state.primaryStore = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        const stores = action.payload.data || [];
        adapter.setAll(state, stores);
        const primary = stores.find((s) => s.primary);
        state.primaryStore = primary || (stores.length > 0 ? stores[0] : null);
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload.data?.store_id || action.meta.arg.store_id);
      })
      .addCase(setStoreProductPrice.fulfilled, (state, action) => {
        const { store_id, product_id, price } = action.payload.data;
        const key = `${product_id}_${store_id}`;
        state.storePricing[key] = price;
      });
  },
});

export const { clearError, setPrimaryStore } = storeSlice.actions;
export const selectAllStores = (state) => adapter.getSelectors().selectAll(state.stores);
export const selectStoreById = (state, id) => adapter.getSelectors().selectById(state.stores, id);
export const selectPrimaryStore = (state) => state.stores.primaryStore;
export default storeSlice.reducer;
