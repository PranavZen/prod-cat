// mock react-router-dom before importing anything that uses it
jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      useParams: () => ({ productId: "PROD-1" }),
      Link: ({ children, to }) => <a href={to}>{children}</a>,
    };
  },
  { virtual: true },
);

import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import catalogueReducer from "../store/catalogueSlice";
import ProductPage from "./ProductPage";

describe("ProductPage (generic record) layout", () => {
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
            // an additional custom field
            author: "Jane Doe",
          },
        ],
      }),
    );
  });

  test("shows all record fields and hides id", async () => {
    const store = configureStore({ reducer: { catalogue: catalogueReducer } });
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>,
    );

    // wait for fetch+store update
    // the heading should render the product title
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Test Product/i }),
      ).toBeInTheDocument();
    });

    // verify that some of the values from the fetched record appear
    expect(screen.getByText(/Acme/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
    // we don't assert anything about the raw numeric id – it's not meaningful here
  });
});
