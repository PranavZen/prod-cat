import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const adapter = createEntityAdapter({ selectId: (item) => item.category_id || item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  (payload = {}, api) => invoke("fetchCategories", payload, api.rejectWithValue)
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  (payload = {}, api) => invoke("fetchCategoryById", payload, api.rejectWithValue)
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  (payload = {}, api) => invoke("createCategory", payload, api.rejectWithValue)
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  (payload = {}, api) => invoke("updateCategory", payload, api.rejectWithValue)
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  (payload = {}, api) => invoke("deleteCategory", payload, api.rejectWithValue)
);

const initialState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedCategory: null,
  tree: [], // Nested category structure
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    selectCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const categories = action.payload.data || [];
        adapter.setAll(state, categories);
        // Build tree structure
        state.tree = buildCategoryTree(categories);
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload.data?.category_id || action.meta.arg.category_id);
      });
  },
});

function buildCategoryTree(categories) {
  const map = {};
  categories.forEach((cat) => {
    map[cat.category_id || cat.id] = { ...cat, children: [] };
  });

  const tree = [];
  categories.forEach((cat) => {
    const id = cat.category_id || cat.id;
    const parentId = cat.parent_id;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[id]);
    } else {
      tree.push(map[id]);
    }
  });
  return tree;
}

export const { selectCategory, clearError } = categorySlice.actions;
export const selectAllCategories = (state) => adapter.getSelectors().selectAll(state.categories);
export const selectCategoryById = (state, id) => adapter.getSelectors().selectById(state.categories, id);
export const selectCategoryTree = (state) => state.categories.tree;
export default categorySlice.reducer;
