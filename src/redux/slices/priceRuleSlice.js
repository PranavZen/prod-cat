import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const adapter = createEntityAdapter({ selectId: (item) => item.rule_id || item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const fetchPriceRules = createAsyncThunk(
  "priceRules/fetchPriceRules",
  (payload = {}, api) => invoke("fetchPriceRules", payload, api.rejectWithValue)
);

export const fetchPriceRuleById = createAsyncThunk(
  "priceRules/fetchPriceRuleById",
  (payload = {}, api) => invoke("fetchPriceRuleById", payload, api.rejectWithValue)
);

export const createPriceRule = createAsyncThunk(
  "priceRules/createPriceRule",
  (payload = {}, api) => invoke("createPriceRule", payload, api.rejectWithValue)
);

export const updatePriceRule = createAsyncThunk(
  "priceRules/updatePriceRule",
  (payload = {}, api) => invoke("updatePriceRule", payload, api.rejectWithValue)
);

export const deletePriceRule = createAsyncThunk(
  "priceRules/deletePriceRule",
  (payload = {}, api) => invoke("deletePriceRule", payload, api.rejectWithValue)
);

export const calculateDiscount = createAsyncThunk(
  "priceRules/calculateDiscount",
  (payload = {}, api) => invoke("calculateDiscount", payload, api.rejectWithValue)
);

const initialState = adapter.getInitialState({
  loading: false,
  error: null,
  activeRules: [],
});

const priceRuleSlice = createSlice({
  name: "priceRules",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceRules.fulfilled, (state, action) => {
        state.loading = false;
        const rules = action.payload.data || [];
        adapter.setAll(state, rules);
        state.activeRules = rules.filter((rule) => rule.status === "active");
      })
      .addCase(fetchPriceRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPriceRule.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(updatePriceRule.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload.data);
      })
      .addCase(deletePriceRule.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload.data?.rule_id || action.meta.arg.rule_id);
      });
  },
});

export const { clearError } = priceRuleSlice.actions;
export const selectAllPriceRules = (state) => adapter.getSelectors().selectAll(state.priceRules);
export const selectActivePriceRules = (state) => state.priceRules.activeRules;
export const selectPriceRuleById = (state, id) => adapter.getSelectors().selectById(state.priceRules, id);
export default priceRuleSlice.reducer;
