import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import ImportDropzone from "./ImportDropzone";
import catalogueReducer from "../../store/catalogueSlice";
import { parseCsvFile } from "../../utils/csvParser";

jest.mock("../../utils/csvParser", () => ({
  parseCsvFile: jest.fn(),
}));

const renderDropzone = () => {
  const store = configureStore({ reducer: { catalogue: catalogueReducer } });
  return render(
    <Provider store={store}>
      <ImportDropzone />
    </Provider>,
  );
};

describe("ImportDropzone toasts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows success toasts for validate and import", async () => {
    parseCsvFile.mockResolvedValue([
      {
        title: "Galaxy Phone",
        category_id: "Mobiles",
        sku: "PHONE-1",
        price: "100",
        inventory: "3",
      },
    ]);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      }),
    );

    const { container } = renderDropzone();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, {
      target: {
        files: [
          new File(
            ["title,category_id\nGalaxy Phone,Mobiles"],
            "catalogue.csv",
            { type: "text/csv" },
          ),
        ],
      },
    });

    await screen.findByText(/1 rows parsed from catalogue\.csv/i);

    fireEvent.click(
      screen.getByRole("button", { name: /validate mapped file/i }),
    );
    expect(
      await screen.findByText(/catalogue\.csv is ready to import/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /import to catalogue/i }),
    );
    expect(await screen.findByText(/Import completed/i)).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Imported 1 product\(s\), 1 variant row\(s\), and 0 dynamic attribute\(s\)\./i,
      ),
    ).toBeInTheDocument();
  });

  test("shows an error toast when import fails", async () => {
    parseCsvFile.mockResolvedValue([
      {
        title: "Galaxy Phone",
        category_id: "Mobiles",
        sku: "PHONE-1",
      },
    ]);
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: false,
          error: { message: "Import failed upstream" },
        }),
      }),
    );

    const { container } = renderDropzone();
    const input = container.querySelector('input[type="file"]');

    fireEvent.change(input, {
      target: {
        files: [
          new File(
            ["title,category_id\nGalaxy Phone,Mobiles"],
            "catalogue.csv",
            { type: "text/csv" },
          ),
        ],
      },
    });

    await screen.findByText(/1 rows parsed from catalogue\.csv/i);
    fireEvent.click(
      screen.getByRole("button", { name: /import to catalogue/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Import failed/i,
    );
    expect(
      await screen.findByText(/Import failed upstream/i),
    ).toBeInTheDocument();
  });
});
