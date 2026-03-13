import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import { analyzeCsvRows } from "../utils/csvAnalysis";
import { buildImportSummary } from "../utils/csvMapping";
import { buildPageKey, postAction } from "../services/apiClient";

const productsAdapter = createEntityAdapter({
  selectId: (item) => item.product_id,
});
const variantsAdapter = createEntityAdapter({
  selectId: (item) => item.variant_id,
});
const categoriesAdapter = createEntityAdapter({
  selectId: (item) => item.category_id || item.slug || item.name,
});
const attributesAdapter = createEntityAdapter({
  selectId: (item) => item.attribute_id || item.name,
});

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false)
      return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchProducts = createAsyncThunk(
  "catalogue/fetchProducts",
  (payload = {}, api) => invoke("fetchProducts", payload, api.rejectWithValue),
);
export const fetchProductById = createAsyncThunk(
  "catalogue/fetchProductById",
  (payload = {}, api) =>
    invoke("fetchProductById", payload, api.rejectWithValue),
);
export const createProduct = createAsyncThunk(
  "catalogue/createProduct",
  (payload = {}, api) => invoke("createProduct", payload, api.rejectWithValue),
);
export const updateProduct = createAsyncThunk(
  "catalogue/updateProduct",
  (payload = {}, api) => invoke("updateProduct", payload, api.rejectWithValue),
);
export const deleteProduct = createAsyncThunk(
  "catalogue/deleteProduct",
  (payload = {}, api) => invoke("deleteProduct", payload, api.rejectWithValue),
);
export const fetchVariantsByProductId = createAsyncThunk(
  "catalogue/fetchVariantsByProductId",
  (payload = {}, api) =>
    invoke("fetchVariantsByProductId", payload, api.rejectWithValue),
);
export const createVariant = createAsyncThunk(
  "catalogue/createVariant",
  (payload = {}, api) => invoke("createVariant", payload, api.rejectWithValue),
);
export const updateVariant = createAsyncThunk(
  "catalogue/updateVariant",
  (payload = {}, api) => invoke("updateVariant", payload, api.rejectWithValue),
);
export const deleteVariant = createAsyncThunk(
  "catalogue/deleteVariant",
  (payload = {}, api) => invoke("deleteVariant", payload, api.rejectWithValue),
);
export const validateSku = createAsyncThunk(
  "catalogue/validateSku",
  (payload = {}, api) => invoke("validateSku", payload, api.rejectWithValue),
);
export const fetchCategories = createAsyncThunk(
  "catalogue/fetchCategories",
  (payload = {}, api) =>
    invoke("fetchCategories", payload, api.rejectWithValue),
);
export const fetchAttributes = createAsyncThunk(
  "catalogue/fetchAttributes",
  (payload = {}, api) =>
    invoke("fetchAttributes", payload, api.rejectWithValue),
);
export const validateCsvImport = createAsyncThunk(
  "catalogue/validateCsvImport",
  async (payload = {}) => ({
    success: true,
    data: analyzeCsvRows(payload.data?.rows || []),
  }),
);
export const uploadCSV = createAsyncThunk(
  "catalogue/uploadCSV",
  async (payload = {}, api) => {
    try {
      const response = await postAction("uploadCSV", payload);
      if (response?.success === false) {
        return api.rejectWithValue(
          response.error?.message || "uploadCSV failed",
        );
      }
      return {
        ...response,
        meta: {
          summary:
            payload.data?.summary ||
            buildImportSummary(
              payload.data?.rows || [],
              payload.data?.analysis ||
                analyzeCsvRows(payload.data?.rows || []),
            ),
        },
      };
    } catch (error) {
      return api.rejectWithValue(error.message || "uploadCSV failed");
    }
  },
);

const tracked = [
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant,
  validateSku,
  fetchCategories,
  fetchAttributes,
  validateCsvImport,
  uploadCSV,
];
const actionKey = (type) => type.split("/")[1];
const initialState = {
  products: productsAdapter.getInitialState({
    pageMap: {},
    total: 0,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  }),
  variants: variantsAdapter.getInitialState(),
  categories: categoriesAdapter.getInitialState(),
  attributes: attributesAdapter.getInitialState(),
  productDetails: {},
  variantsByProductId: {},
  importSummary: null,
  importValidation: null,
  skuValidation: null,
  loadingByAction: {},
  errorByAction: {},
};

const catalogueSlice = createSlice({
  name: "catalogue",
  initialState,
  reducers: {
    clearImportSummary: (state) => {
      state.importSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const items = action.payload.data || [];
        productsAdapter.setAll(state.products, items);
        state.products.pageMap[buildPageKey(action.meta.arg)] = items.map(
          (item) => item.product_id,
        );
        state.products.pagination =
          action.payload.pagination || state.products.pagination;
        state.products.total = action.payload.pagination?.total || items.length;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const detail = action.payload.data || {};
        if (detail.product?.product_id)
          state.productDetails[detail.product.product_id] = detail;
        if (detail.product)
          productsAdapter.upsertOne(state.products, detail.product);
        if (detail.variants) {
          variantsAdapter.upsertMany(state.variants, detail.variants);
          state.variantsByProductId[detail.product.product_id] =
            detail.variants.map((item) => item.variant_id);
        }
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload.data)
          productsAdapter.upsertOne(state.products, action.payload.data);
        const detail = action.payload.meta?.detail;
        if (detail?.product?.product_id) {
          state.productDetails[detail.product.product_id] = detail;
          variantsAdapter.setMany(state.variants, detail.variants || []);
          state.variantsByProductId[detail.product.product_id] = (
            detail.variants || []
          ).map((item) => item.variant_id);
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (action.payload.data)
          productsAdapter.upsertOne(state.products, action.payload.data);
        const detail = action.payload.meta?.detail;
        if (detail?.product?.product_id) {
          state.productDetails[detail.product.product_id] = detail;
          variantsAdapter.setMany(state.variants, detail.variants || []);
          state.variantsByProductId[detail.product.product_id] = (
            detail.variants || []
          ).map((item) => item.variant_id);
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const productId = action.payload.data?.product_id;
        if (!productId) return;
        productsAdapter.removeOne(state.products, productId);
        delete state.productDetails[productId];
        const variantIds = state.variantsByProductId[productId] || [];
        variantIds.forEach((variantId) =>
          variantsAdapter.removeOne(state.variants, variantId),
        );
        delete state.variantsByProductId[productId];
      })
      .addCase(fetchVariantsByProductId.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        const variants = data.variants || [];
        variantsAdapter.upsertMany(state.variants, variants);
        const productId = action.meta.arg?.data?.product_id;
        if (productId)
          state.variantsByProductId[productId] = variants.map(
            (item) => item.variant_id,
          );
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        if (!action.payload.data) return;
        variantsAdapter.upsertOne(state.variants, action.payload.data);
        const productId = action.payload.data.product_id;
        if (productId)
          state.variantsByProductId[productId] = Array.from(
            new Set([
              ...(state.variantsByProductId[productId] || []),
              action.payload.data.variant_id,
            ]),
          );
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        if (!action.payload.data) return;
        variantsAdapter.upsertOne(state.variants, action.payload.data);
      })
      .addCase(deleteVariant.fulfilled, (state, action) => {
        const variantId = action.payload.data?.variant_id;
        if (!variantId) return;
        variantsAdapter.removeOne(state.variants, variantId);
        const productId = action.payload.data?.product_id;
        if (productId) {
          state.variantsByProductId[productId] = (
            state.variantsByProductId[productId] || []
          ).filter((id) => id !== variantId);
        }
      })
      .addCase(validateSku.fulfilled, (state, action) => {
        state.skuValidation = action.payload.data || null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        categoriesAdapter.setAll(state.categories, action.payload.data || []);
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        attributesAdapter.setAll(state.attributes, action.payload.data || []);
      })
      .addCase(validateCsvImport.fulfilled, (state, action) => {
        state.importValidation = action.payload.data || null;
      })
      .addCase(uploadCSV.fulfilled, (state, action) => {
        state.importSummary = action.payload.meta?.summary || null;
        state.importValidation = action.payload.meta?.summary?.analysis || null;
      })
      .addMatcher(
        isAnyOf(...tracked.map((item) => item.pending)),
        (state, action) => {
          state.loadingByAction[actionKey(action.type)] = true;
          state.errorByAction[actionKey(action.type)] = null;
        },
      )
      .addMatcher(
        isAnyOf(...tracked.map((item) => item.fulfilled)),
        (state, action) => {
          state.loadingByAction[actionKey(action.type)] = false;
        },
      )
      .addMatcher(
        isAnyOf(...tracked.map((item) => item.rejected)),
        (state, action) => {
          state.loadingByAction[actionKey(action.type)] = false;
          state.errorByAction[actionKey(action.type)] =
            action.payload || action.error.message;
        },
      );
  },
});

export const { clearImportSummary } = catalogueSlice.actions;
const productSelectors = productsAdapter.getSelectors(
  (state) => state.catalogue.products,
);
const variantSelectors = variantsAdapter.getSelectors(
  (state) => state.catalogue.variants,
);
const categorySelectors = categoriesAdapter.getSelectors(
  (state) => state.catalogue.categories,
);
const attributeSelectors = attributesAdapter.getSelectors(
  (state) => state.catalogue.attributes,
);
export const selectAllProducts = productSelectors.selectAll;
export const selectProductById = productSelectors.selectById;
export const selectVariantById = variantSelectors.selectById;
export const selectAllCategories = categorySelectors.selectAll;
export const selectAllAttributes = attributeSelectors.selectAll;
export const selectProductDetailById = (state, productId) =>
  state.catalogue.productDetails[productId] || null;
export const selectVariantsForProduct = (state, productId) =>
  (state.catalogue.variantsByProductId[productId] || [])
    .map((id) => variantSelectors.selectById(state, id))
    .filter(Boolean);
export const selectImportSummary = (state) => state.catalogue.importSummary;
export const selectImportValidation = (state) =>
  state.catalogue.importValidation;
export const selectSkuValidation = (state) => state.catalogue.skuValidation;
export const selectLoadingByAction = (key) => (state) =>
  Boolean(state.catalogue.loadingByAction[key]);
export const selectErrorByAction = (key) => (state) =>
  state.catalogue.errorByAction[key] || null;
export default catalogueSlice.reducer;
