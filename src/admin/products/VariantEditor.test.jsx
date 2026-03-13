import { render, screen, fireEvent } from "@testing-library/react";
import VariantEditor from "./VariantEditor";

// helper that renders the editor with controlled props
const renderEditor = (attrs = [], variants = []) => {
  const onChange = jest.fn();
  const onAddManual = jest.fn();
  render(
    <VariantEditor
      attributeNames={attrs}
      variants={variants}
      onChange={onChange}
      onAddManual={onAddManual}
    />,
  );
  return { onChange, onAddManual };
};

describe("VariantEditor columns", () => {
  test("uses passed-in attributeNames and does not include hardcoded defaults", () => {
    renderEditor(["material", "weight"], []);

    // headers for the passed in names should appear
    expect(
      screen.getByRole("columnheader", { name: /Material/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /Weight/i }),
    ).toBeInTheDocument();

    // defaults such as "Color" should not be present when not supplied
    expect(
      screen.queryByRole("columnheader", { name: /Color/i }),
    ).not.toBeInTheDocument();
  });

  test("adds attribute names found on existing variants automatically", () => {
    const variants = [
      {
        variant_id: "v1",
        attributes: [{ attribute_name: "size", attribute_value: "L" }],
      },
    ];

    renderEditor([], variants);
    expect(
      screen.getByRole("columnheader", { name: /Size/i }),
    ).toBeInTheDocument();
  });
});
