import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ProductForm from "./ProductForm";

const defaultProps = {
  form: {
    product_id: "",
    title: "Phone",
    description: "",
    brand: "Brand",
    price: "100",
    image: "",
    inventory: "5",
    category_id: "",
    status: "draft",
  },
  categories: [],
  productFieldNames: [],
  variantColumnNames: ["color", "storage", "screen_size"],
  variantInputs: { color: "", storage: "", screen_size: "" },
  variants: [],
  skuValidation: null,
  onChange: jest.fn(),
  onVariantInputsChange: jest.fn(),
  onVariantsChange: jest.fn(),
  onAddProductField: jest.fn(),
  onAddVariantColumn: jest.fn(),
  onGenerateVariants: jest.fn(),
  onReplaceVariants: jest.fn(),
  onApplyVariantDefaults: jest.fn(),
  onGenerateMissingSkus: jest.fn(),
  onClearVariantInputs: jest.fn(),
  onSubmit: jest.fn((event) => event.preventDefault()),
  submitLabel: "Create product",
  busy: false,
};

describe("ProductForm category field", () => {
  test("allows typing a category and shows saved category suggestions", () => {
    const { container } = render(
      <ProductForm
        {...defaultProps}
        categories={[
          { category_id: "Electronics", name: "Electronics" },
          { category_id: "Mobiles", name: "Mobiles" },
        ]}
      />,
    );

    expect(
      screen.getByPlaceholderText(/choose or type category/i),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        'datalist#product-category-options option[value="Electronics"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        'datalist#product-category-options option[value="Mobiles"]',
      ),
    ).not.toBeNull();
    expect(
      screen.getByText(/pick an existing category or type a new one/i),
    ).toBeInTheDocument();
  });

  test("supports adding a custom variant column for multi-variant products", () => {
    const Wrapper = () => {
      const [variantColumnNames, setVariantColumnNames] = useState([
        "color",
        "storage",
        "screen_size",
      ]);

      return (
        <ProductForm
          {...defaultProps}
          variantColumnNames={variantColumnNames}
          onAddVariantColumn={(name) =>
            setVariantColumnNames((current) => [...current, name.toLowerCase()])
          }
        />
      );
    };

    render(<Wrapper />);

    fireEvent.change(screen.getByPlaceholderText(/new column name/i), {
      target: { value: "Author" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add column/i }));

    expect(
      screen.getByPlaceholderText(/author: value 1, value 2/i),
    ).toBeInTheDocument();
    // after adding a variant column the table header should include it even if no
    // variants exist yet (VariantEditor is driven entirely by the prop)
    expect(screen.getByText(/Author/)).toBeInTheDocument();
    // the variant editor should show the new header label
    expect(
      screen.getByRole("columnheader", { name: /Author/i }),
    ).toBeInTheDocument();
  });

  test("supports adding a custom product field for non-mobile categories", () => {
    const Wrapper = () => {
      const [form, setForm] = useState(defaultProps.form);
      const [productFieldNames, setProductFieldNames] = useState([]);

      return (
        <ProductForm
          {...defaultProps}
          form={form}
          onChange={setForm}
          productFieldNames={productFieldNames}
          onAddProductField={(name) =>
            setProductFieldNames((current) => [...current, name.toLowerCase()])
          }
        />
      );
    };

    render(<Wrapper />);

    fireEvent.change(screen.getByPlaceholderText(/new product field name/i), {
      target: { value: "Author" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add field/i }));

    expect(screen.getByPlaceholderText(/^Author$/i)).toBeInTheDocument();
  });
});
