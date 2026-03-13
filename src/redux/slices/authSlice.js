import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { postAction } from "../../services/apiClient";

const authAdapter = createEntityAdapter({ selectId: (item) => item.id });

const invoke = async (action, payload, rejectWithValue) => {
  try {
    const response = await postAction(action, payload);
    if (response.success === false) return rejectWithValue(response.error?.message || `${action} failed`);
    return response;
  } catch (error) {
    return rejectWithValue(error.message || `${action} failed`);
  }
};

export const loginUser = createAsyncThunk("auth/login", (payload = {}, api) => invoke("loginUser", payload, api.rejectWithValue));
export const logoutUser = createAsyncThunk("auth/logout", (payload = {}, api) => invoke("logoutUser", payload, api.rejectWithValue));
export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", (payload = {}, api) => invoke("fetchCurrentUser", payload, api.rejectWithValue));

const initialState = {
  user: null,
  token: localStorage.getItem("authToken") || null,
  isAuthenticated: !!localStorage.getItem("authToken"),
  permissions: [],
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
      if (action.payload.token) {
        localStorage.setItem("authToken", action.payload.token);
      } else {
        localStorage.removeItem("authToken");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data?.user || null;
        state.token = action.payload.data?.token || null;
        state.isAuthenticated = !!state.token;
        state.permissions = action.payload.data?.permissions || [];
        if (state.token) {
          localStorage.setItem("authToken", state.token);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data?.user || null;
        state.permissions = action.payload.data?.permissions || [];
        state.isAuthenticated = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.permissions = [];
        localStorage.removeItem("authToken");
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
