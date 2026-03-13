// mock react-router-dom before importing anything that uses it
jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      // we only need specific hooks/components
      useParams: () => ({ productId: "PROD-1" }),
      BrowserRouter: ({ children }) => <>{children}</>,
    };
  },
  { virtual: true },
);

import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import catalogueReducer from "../../store/catalogueSlice";
import ProductDetailPage from "./ProductDetailPage";

describe("ProductDetailPage layout", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: "1",
            product_id: "PROD-1",
            title: "Test Product",
            brand: "Acme",
            category: "TestCat",
            category_id: "TestCat",
            price: "10",
            inventory: "3",
            sku: "SKU-1",
            color: "Red",
            // custom product field
            author: "Jane Doe",
            product_field_keys: ["author"],
          },
        ],
      }),
    );
  });

  test("shows custom product fields from detail", async () => {
    const store = configureStore({ reducer: { catalogue: catalogueReducer } });
    render(
      <Provider store={store}>
        <ProductDetailPage />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    });

    // verify custom field appears
    expect(screen.getByText(/Author:/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
  });
});
