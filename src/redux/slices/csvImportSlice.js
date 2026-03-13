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

export const validateCsvImport = createAsyncThunk(
  "csvImport/validateCsvImport",
  (payload = {}, api) => invoke("validateCsvImport", payload, api.rejectWithValue)
);

export const previewCsvImport = createAsyncThunk(
  "csvImport/previewCsvImport",
  (payload = {}, api) => invoke("previewCsvImport", payload, api.rejectWithValue)
);

export const uploadCSV = createAsyncThunk(
  "csvImport/uploadCSV",
  (payload = {}, api) => invoke("uploadCSV", payload, api.rejectWithValue)
);

export const exportCSV = createAsyncThunk(
  "csvImport/exportCSV",
  (payload = {}, api) => invoke("exportCSV", payload, api.rejectWithValue)
);

export const fetchImportJobs = createAsyncThunk(
  "csvImport/fetchImportJobs",
  (payload = {}, api) => invoke("fetchImportJobs", payload, api.rejectWithValue)
);

const initialState = {
  importJobs: [],
  preview: {
    data: [],
    headers: [],
    analysis: null,
    validation: {
      errors: [],
      warnings: [],
      isValid: false,
    },
  },
  currentJob: null,
  loading: false,
  uploading: false,
  error: null,
  progress: 0,
};

const csvImportSlice = createSlice({
  name: "csvImport",
  initialState,
  reducers: {
    clearPreview: (state) => {
      state.preview = initialState.preview;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCsvImport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCsvImport.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.data || {};
        state.preview.validation = data.validation || { errors: [], warnings: [], isValid: false };
        state.preview.analysis = data.analysis || null;
      })
      .addCase(validateCsvImport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(previewCsvImport.fulfilled, (state, action) => {
        const data = action.payload.data || {};
        state.preview.data = data.rows || [];
        state.preview.headers = data.headers || [];
        state.preview.analysis = data.analysis || null;
      })
      .addCase(uploadCSV.pending, (state) => {
        state.uploading = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(uploadCSV.fulfilled, (state, action) => {
        state.uploading = false;
        state.progress = 100;
        state.currentJob = action.payload.data;
        state.importJobs.unshift(action.payload.data);
      })
      .addCase(uploadCSV.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      .addCase(fetchImportJobs.fulfilled, (state, action) => {
        state.importJobs = action.payload.data || [];
      });
  },
});

export const { clearPreview, setProgress, clearError } = csvImportSlice.actions;
export default csvImportSlice.reducer;
