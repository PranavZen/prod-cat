import { configureStore } from "@reduxjs/toolkit";
import catalogueReducer from "./catalogueSlice";
import authReducer from "../redux/slices/authSlice";
import categoryReducer from "../redux/slices/categorySlice";
import attributeReducer from "../redux/slices/attributeSlice";
import productReducer from "../redux/slices/productSlice";
import inventoryReducer from "../redux/slices/inventorySlice";
import priceRuleReducer from "../redux/slices/priceRuleSlice";
import storeReducer from "../redux/slices/storeSlice";
import csvImportReducer from "../redux/slices/csvImportSlice";
import analyticsReducer from "../redux/slices/analyticsSlice";
import settingsReducer from "../redux/slices/settingsSlice";

export const store = configureStore({
  reducer: {
    // Legacy catalogue slice (being phased out in favor of modular slices)
    catalogue: catalogueReducer,
    
    // New modular slices
    auth: authReducer,
    categories: categoryReducer,
    attributes: attributeReducer,
    products: productReducer,
    inventory: inventoryReducer,
    priceRules: priceRuleReducer,
    stores: storeReducer,
    csvImport: csvImportReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
  },
});

