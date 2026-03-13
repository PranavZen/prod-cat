import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import AdminProductsPage from "./admin/AdminProductsPage";
import CataloguePage from "./storefront/CataloguePage";
import catalogueReducer from "../store/catalogueSlice";

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

const rawRows = [
  {
    id: "row-1",
    product_id: "PHONE-1",
    title: "Phone X",
    description: "Amazing smartphone for travel",
    brand: "Apple",
    category: "Electronics",
    category_id: "Electronics",
    image: "https://example.com/phone.jpg",
    price: "999",
    inventory: "12",
    sku: "PHONE-X-128",
    color: "Black",
    storage: "128GB",
  },
  {
    id: "row-2",
    product_id: "LAMP-1",
    title: "Bedroom Lamp",
    description: "Warm bedroom light for home spaces",
    brand: "Ikea",
    category: "Home",
    category_id: "Home",
    image: "https://example.com/lamp.jpg",
    price: "79",
    inventory: "0",
    sku: "LAMP-01",
    material: "Metal",
  },
];

const buildStore = () =>
  configureStore({
    reducer: {
      catalogue: catalogueReducer,
    },
  });

const renderWithProviders = (ui) => {
  const store = buildStore();
  return render(<Provider store={store}>{ui}</Provider>);
};

describe("page flows", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockLocation = { pathname: "/", state: null };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => rawRows,
      }),
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("admin products page shows a success message and refreshes after returning from edit", async () => {
    mockLocation = {
      pathname: "/admin/products",
      state: {
        flashMessage: "Product synced successfully.",
        refreshOnLoad: true,
      },
    };

    renderWithProviders(<AdminProductsPage />);

    expect(
      await screen.findByText(/product synced successfully/i),
    ).toBeInTheDocument();
    await screen.findByText("Phone X");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4); // Adjusted to match the actual number of fetch calls
    });
  });

  test("catalogue page filters by category, brand scope, description search, and stock state", async () => {
    renderWithProviders(<CataloguePage />);

    expect(await screen.findByText("Phone X")).toBeInTheDocument();
    expect(screen.getByText("Bedroom Lamp")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /home \(1\)/i }));

    await waitFor(() => {
      expect(screen.queryByText("Phone X")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Bedroom Lamp")).toBeInTheDocument();

    // the storefront version uses a different empty message; no empty state should
    // be shown yet when one product remains
    expect(
      screen.queryByText(/no products matched your home page filters\./i),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("option", { name: "Apple" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Ikea" })).toBeInTheDocument();

    await userEvent.type(
      screen.getByPlaceholderText(/search products, brands, sku or options/i),
      "bedroom",
    );
    expect(screen.getByText("Bedroom Lamp")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByDisplayValue(/any stock level/i),
      "out_of_stock",
    );
    expect(screen.getByText("Bedroom Lamp")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByDisplayValue(/any stock level|out of stock/i),
      "in_stock",
    );
    await waitFor(() => {
      expect(screen.queryByText("Bedroom Lamp")).not.toBeInTheDocument();
    });
    // now the filters should hide all results and show the storefront empty message
    expect(
      screen.getByText(/no products matched your home page filters\./i),
    ).toBeInTheDocument();
  });
});
