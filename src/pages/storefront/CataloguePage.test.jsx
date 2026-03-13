import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import catalogueReducer from "../../store/catalogueSlice";
import CataloguePage from "./CataloguePage";

jest.mock(
  "react-router-dom",
  () => {
    const React = require("react");
    return {
      __esModule: true,
      Link: ({ children, to }) => <a href={to}>{children}</a>,
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
    image: "",
    price: "600",
    inventory: "12",
    sku: "GAL-1",
    color: "Black",
    // custom field example; should be rendered in card
    author: "John Doe",
    product_field_keys: ["author"],
  },
  {
    id: "2",
    product_id: "LAPTOP-1",
    title: "ThinkPad Laptop",
    brand: "Lenovo",
    category: "Laptops",
    category_id: "Laptops",
    image: "",
    price: "1200",
    inventory: "5",
    sku: "TP-1",
    storage: "512GB",
  },
];

const renderPage = async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: async () => rows }),
  );
  const store = configureStore({ reducer: { catalogue: catalogueReducer } });
  render(
    <Provider store={store}>
      <CataloguePage />
    </Provider>,
  );
  await screen.findByText(/Galaxy Phone/i);
};

describe("CataloguePage filters", () => {
  test("filters the home page catalogue by category chip", async () => {
    await renderPage();

    await userEvent.click(screen.getByRole("button", { name: /Laptops/i }));

    expect(screen.getByText(/ThinkPad Laptop/i)).toBeInTheDocument();
    expect(screen.queryByText(/Galaxy Phone/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Category: Laptops/i)).toBeInTheDocument();
  });

  test("filters the home page catalogue by search text", async () => {
    await renderPage();

    await userEvent.type(
      screen.getByPlaceholderText(/Search products, brands, SKU or options/i),
      "galaxy",
    );

    await waitFor(() => {
      expect(screen.getByText(/Galaxy Phone/i)).toBeInTheDocument();
      // make sure custom field is shown on the card
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.queryByText(/ThinkPad Laptop/i)).not.toBeInTheDocument();
    });
  });
});
