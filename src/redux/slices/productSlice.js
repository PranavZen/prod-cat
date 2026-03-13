import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction, buildPageKey } from "../../services/apiClient";

const productsAdapter = createEntityAdapter({ selectId: (item) => item.product_id || item.id });
const variantsAdapter = createEntityAdapter({ selectId: (item) => item.variant_id || item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  (payload = {}, api) => invoke("fetchProducts", payload, api.rejectWithValue)
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  (payload = {}, api) => invoke("fetchProductById", payload, api.rejectWithValue)
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  (payload = {}, api) => invoke("createProduct", payload, api.rejectWithValue)
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  (payload = {}, api) => invoke("updateProduct", payload, api.rejectWithValue)
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  (payload = {}, api) => invoke("deleteProduct", payload, api.rejectWithValue)
);

export const bulkUpdateProducts = createAsyncThunk(
  "products/bulkUpdateProducts",
  (payload = {}, api) => invoke("bulkUpdateProducts", payload, api.rejectWithValue)
);

export const generateVariants = createAsyncThunk(
  "products/generateVariants",
  (payload = {}, api) => invoke("generateVariants", payload, api.rejectWithValue)
);

export const fetchVariantsByProductId = createAsyncThunk(
  "products/fetchVariantsByProductId",
  (payload = {}, api) => invoke("fetchVariantsByProductId", payload, api.rejectWithValue)
);

export const createVariant = createAsyncThunk(
  "products/createVariant",
  (payload = {}, api) => invoke("createVariant", payload, api.rejectWithValue)
);

export const updateVariant = createAsyncThunk(
  "products/updateVariant",
  (payload = {}, api) => invoke("updateVariant", payload, api.rejectWithValue)
);

export const deleteVariant = createAsyncThunk(
  "products/deleteVariant",
  (payload = {}, api) => invoke("deleteVariant", payload, api.rejectWithValue)
);

export const validateSku = createAsyncThunk(
  "products/validateSku",
  (payload = {}, api) => invoke("validateSku", payload, api.rejectWithValue)
);

const initialState = {
  products: productsAdapter.getInitialState({
    pageMap: {},
    total: 0,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  }),
  variants: variantsAdapter.getInitialState(),
  productDetails: {},
  variantsByProductId: {},
  loading: false,
  error: null,
  filters: {},
  sort: { field: "created_at", order: "desc" },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data || [];
        productsAdapter.setAll(state.products, items);
        state.products.pageMap[buildPageKey(action.meta.arg)] = items.map((item) => item.product_id || item.id);
        state.products.pagination = action.payload.pagination || state.products.pagination;
        state.products.total = action.payload.pagination?.total || items.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const detail = action.payload.data || {};
        const productId = detail.product?.product_id || detail.product?.id;
        if (productId) {
          state.productDetails[productId] = detail;
          productsAdapter.upsertOne(state.products, detail.product);
        }
        if (detail.variants) {
          variantsAdapter.upsertMany(state.variants, detail.variants);
          if (productId) {
            state.variantsByProductId[productId] = detail.variants.map((v) => v.variant_id || v.id);
          }
        }
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        const product = action.payload.data;
        productsAdapter.upsertOne(state.products, product);
        const productId = product.product_id || product.id;
        const detail = action.payload.meta?.detail || { product };
        if (productId) {
          state.productDetails[productId] = detail;
          if (detail.variants) {
            variantsAdapter.setMany(state.variants, detail.variants);
            state.variantsByProductId[productId] = (detail.variants || []).map((v) => v.variant_id || v.id);
          }
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const product = action.payload.data;
        productsAdapter.upsertOne(state.products, product);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const productId = action.payload.data?.product_id || action.meta.arg.product_id;
        productsAdapter.removeOne(state.products, productId);
        delete state.productDetails[productId];
        delete state.variantsByProductId[productId];
      })
      .addCase(generateVariants.fulfilled, (state, action) => {
        const { variants, product_id } = action.payload.data;
        variantsAdapter.upsertMany(state.variants, variants);
        state.variantsByProductId[product_id] = variants.map((v) => v.variant_id || v.id);
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        variantsAdapter.upsertOne(state.variants, action.payload.data);
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        variantsAdapter.upsertOne(state.variants, action.payload.data);
      })
      .addCase(deleteVariant.fulfilled, (state, action) => {
        const variantId = action.payload.data?.variant_id || action.meta.arg.variant_id;
        variantsAdapter.removeOne(state.variants, variantId);
      });
  },
});

export const { setFilters, setSort, clearError } = productSlice.actions;
export const selectAllProducts = (state) => productsAdapter.getSelectors().selectAll(state.products.products);
export const selectProductById = (state, id) => productsAdapter.getSelectors().selectById(state.products.products, id);
export const selectAllVariants = (state) => variantsAdapter.getSelectors().selectAll(state.products.variants);
export const selectVariantsByProductId = (state, productId) =>
  state.products.variantsByProductId[productId]?.map((id) => state.products.variants.entities[id]) || [];
export default productSlice.reducer;
