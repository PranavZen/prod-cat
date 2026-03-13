import { buildLegacyProductDetail, normalizeLegacyRow } from "./legacyCatalogue";

describe("legacy catalogue product fields", () => {
  test("excludes custom product fields from variant attributes when metadata is present", () => {
    const row = normalizeLegacyRow({
      id: "row-1",
      product_id: "BOOK-1",
      title: "Book One",
      product_field_keys: "author,publisher",
      author: "Robert Kiyosaki",
      publisher: "Plata",
      language: "English",
    });

    expect(row.product_field_keys).toEqual(["author", "publisher"]);
    expect(row.attributes).toEqual([
      {
        attribute_name: "language",
        attribute_label: "Language",
        attribute_value: "English",
      },
    ]);
  });

  test("buildLegacyProductDetail exposes custom product fields for editing", () => {
    const detail = buildLegacyProductDetail(
      [
        {
          id: "row-1",
          product_id: "BOOK-1",
          title: "Book One",
          sku: "BOOK-1-A",
          product_field_keys: "author,publisher,isbn",
          author: "Robert Kiyosaki",
          publisher: "Plata",
          isbn: "1234567890",
          language: "English",
        },
      ],
      "BOOK-1",
    );

    expect(detail.productFields).toEqual([
      { name: "author", label: "Author", value: "Robert Kiyosaki" },
      { name: "publisher", label: "Publisher", value: "Plata" },
      { name: "isbn", label: "Isbn", value: "1234567890" },
    ]);
    expect(detail.attributes).toEqual([
      { attribute_id: "language", name: "Language", type: "text" },
    ]);
  });
});