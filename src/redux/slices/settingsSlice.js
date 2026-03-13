import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: localStorage.getItem("theme") || "light",
  sidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
  itemsPerPage: 20,
  dateFormat: "DD/MM/YYYY",
  currencySymbol: "₹",
  defaultCurrency: "INR",
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
  },
  features: {
    multiStore: true,
    priceRules: true,
    csvImport: true,
    analytics: true,
    inventory: true,
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", state.sidebarCollapsed);
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
    },
    setDateFormat: (state, action) => {
      state.dateFormat = action.payload;
    },
    setCurrencySymbol: (state, action) => {
      state.currencySymbol = action.payload;
    },
    setDefaultCurrency: (state, action) => {
      state.defaultCurrency = action.payload;
    },
    toggleNotification: (state, action) => {
      const { type } = action.payload;
      if (type) {
        state.notifications[type] = !state.notifications[type];
      } else {
        state.notifications.enabled = !state.notifications.enabled;
      }
    },
    enableFeature: (state, action) => {
      state.features[action.payload] = true;
    },
    disableFeature: (state, action) => {
      state.features[action.payload] = false;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setItemsPerPage,
  setDateFormat,
  setCurrencySymbol,
  setDefaultCurrency,
  toggleNotification,
  enableFeature,
  disableFeature,
} = settingsSlice.actions;

export default settingsSlice.reducer;
