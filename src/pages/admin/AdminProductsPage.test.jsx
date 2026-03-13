import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import catalogueReducer from "../../store/catalogueSlice";
import AdminProductsPage from "./AdminProductsPage";

const mockNavigate = jest.fn();
let mockLocation = { pathname: "/", state: null };

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      Link: ({ children, to }) => <a href={to}>{children}</a>,
      NavLink: ({ children, to }) => <a href={to}>{children}</a>,
      useNavigate: () => mockNavigate,
      useLocation: () => mockLocation,
      useParams: () => ({}),
    };
  },
  { virtual: true },
);

const rows = [
  {
    id: "1",
    product_id: "PHONE-1",
    title: "Galaxy Phone",
    brand: "Samsung",
    category: "Mobiles",
    category_id: "Mobiles",
    status: "active",
    image: "",
    price: "600",
    inventory: "12",
    sku: "GAL-1",
    color: "Black",
  },
];

describe("AdminProductsPage success state", () => {
  test("shows the save success banner and refreshes the list when navigated from editor", async () => {
    mockNavigate.mockReset();
    mockLocation = {
      pathname: "/admin/products",
      state: {
        flashMessage: "Product updated successfully",
        refreshOnLoad: true,
      },
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: async () => rows }),
    );
    const store = configureStore({ reducer: { catalogue: catalogueReducer } });

    render(
      <Provider store={store}>
        <AdminProductsPage />
      </Provider>,
    );

    expect(
      await screen.findByText(/Product updated successfully/i),
    ).toBeInTheDocument();
    await screen.findByText(/Galaxy Phone/i);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
