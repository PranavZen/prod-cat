import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const adapter = createEntityAdapter({ selectId: (item) => item.attribute_id || item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchAttributes = createAsyncThunk(
  "attributes/fetchAttributes",
  (payload = {}, api) => invoke("fetchAttributes", payload, api.rejectWithValue)
);

export const fetchAttributeById = createAsyncThunk(
  "attributes/fetchAttributeById",
  (payload = {}, api) => invoke("fetchAttributeById", payload, api.rejectWithValue)
);

export const createAttribute = createAsyncThunk(
  "attributes/createAttribute",
  (payload = {}, api) => invoke("createAttribute", payload, api.rejectWithValue)
);

export const updateAttribute = createAsyncThunk(
  "attributes/updateAttribute",
  (payload = {}, api) => invoke("updateAttribute", payload, api.rejectWithValue)
);

export const deleteAttribute = createAsyncThunk(
  "attributes/deleteAttribute",
  (payload = {}, api) => invoke("deleteAttribute", payload, api.rejectWithValue)
);

export const addAttributeValue = createAsyncThunk(
  "attributes/addAttributeValue",
  (payload = {}, api) => invoke("addAttributeValue", payload, api.rejectWithValue)
);

const initialState = adapter.getInitialState({
  loading: false,
  error: null,
  selectedAttribute: null,
});

const attributeSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {
    selectAttribute: (state, action) => {
      state.selectedAttribute = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.loading = false;
        adapter.setAll(state, action.payload.data || []);
      })
      .addCase(fetchAttributes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload.data?.attribute_id || action.meta.arg.attribute_id);
      });
  },
});

export const { selectAttribute, clearError } = attributeSlice.actions;
export const selectAllAttributes = (state) => adapter.getSelectors().selectAll(state.attributes);
export const selectAttributeById = (state, id) => adapter.getSelectors().selectById(state.attributes, id);
export default attributeSlice.reducer;
