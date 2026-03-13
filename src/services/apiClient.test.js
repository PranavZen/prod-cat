import { planLegacyProductRowMutations, postAction } from "./apiClient";

describe("planLegacyProductRowMutations", () => {
  test("updates existing variants and only creates the new variant during product edit", () => {
    const existingRows = [
      {
        id: "row-1",
        product_id: "PROD-1",
        title: "Phone",
        sku: "PHONE-BLACK-128",
        color: "Black",
        storage: "128GB",
      },
    ];
    const nextRows = [
      {
        id: "row-1",
        product_id: "PROD-1",
        title: "Phone Updated",
        sku: "PHONE-BLACK-128",
        color: "Black",
        storage: "128GB",
      },
      {
        product_id: "PROD-1",
        title: "Phone Updated",
        sku: "PHONE-BLUE-256",
        color: "Blue",
        storage: "256GB",
      },
    ];

    expect(planLegacyProductRowMutations(existingRows, nextRows)).toEqual({
      updates: [
        {
          id: "row-1",
          data: {
            id: "row-1",
            product_id: "PROD-1",
            title: "Phone Updated",
            sku: "PHONE-BLACK-128",
            color: "Black",
            storage: "128GB",
          },
        },
      ],
      creates: [
        {
          data: {
            product_id: "PROD-1",
            title: "Phone Updated",
            sku: "PHONE-BLUE-256",
            color: "Blue",
            storage: "256GB",
          },
        },
      ],
      deletes: [],
    });
  });

  test("deletes only removed variants after updates succeed", () => {
    const existingRows = [
      { id: "row-1", product_id: "PROD-1", title: "Phone", sku: "SKU-1" },
      { id: "row-2", product_id: "PROD-1", title: "Phone", sku: "SKU-2" },
    ];
    const nextRows = [
      { id: "row-1", product_id: "PROD-1", title: "Phone", sku: "SKU-1" },
    ];

    expect(planLegacyProductRowMutations(existingRows, nextRows)).toEqual({
      updates: [
        {
          id: "row-1",
          data: {
            id: "row-1",
            product_id: "PROD-1",
            title: "Phone",
            sku: "SKU-1",
          },
        },
      ],
      creates: [],
      deletes: ["row-2"],
    });
  });

  test("createProduct appends multiple variants with dynamic columns and refetches them", async () => {
    const fetchMock = jest.spyOn(global, "fetch");
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1700000000000);

    try {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              id: "row-1",
              product_id: "PROD-MULTI-BOOK-LOYW3V28",
              title: "Multi Book",
              sku: "BOOK-A",
              author: "Author A",
              language: "English",
            },
            {
              id: "row-2",
              product_id: "PROD-MULTI-BOOK-LOYW3V28",
              title: "Multi Book",
              sku: "BOOK-B",
              author: "Author B",
              language: "French",
            },
          ],
        });

      const result = await postAction("createProduct", {
        data: { title: "Multi Book", category_id: "Books" },
        variants: [
          {
            sku: "BOOK-A",
            attributes: [
              { attribute_name: "author", attribute_value: "Author A" },
              { attribute_name: "language", attribute_value: "English" },
            ],
          },
          {
            sku: "BOOK-B",
            attributes: [
              { attribute_name: "author", attribute_value: "Author B" },
              { attribute_name: "language", attribute_value: "French" },
            ],
          },
        ],
      });

      const firstCreate = JSON.parse(fetchMock.mock.calls[0][1].body);
      const secondCreate = JSON.parse(fetchMock.mock.calls[1][1].body);

      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(firstCreate).toEqual(
        expect.objectContaining({
          action: "create",
          apiKey: "",
          data: expect.objectContaining({
            product_id: expect.stringMatching(/^PROD-MULTI-BOOK-/),
            sku: "BOOK-A",
            author: "Author A",
            language: "English",
          }),
        }),
      );
      expect(secondCreate).toEqual(
        expect.objectContaining({
          action: "create",
          apiKey: "",
          data: expect.objectContaining({
            product_id: firstCreate.data.product_id,
            sku: "BOOK-B",
            author: "Author B",
            language: "French",
          }),
        }),
      );
      expect(result.meta.detail.variants).toHaveLength(2);
    } finally {
      nowSpy.mockRestore();
      fetchMock.mockRestore();
    }
  });

  test("createProduct includes custom product fields for any category", async () => {
    const fetchMock = jest.spyOn(global, "fetch");

    try {
      fetchMock
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              id: "row-10",
              product_id: "BOOK-1",
              title: "Book One",
              sku: "BOOK-1-A",
              product_field_keys: "author,publisher,isbn",
              author: "Robert Kiyosaki",
              publisher: "Plata",
              isbn: "1234567890",
            },
          ],
        });

      await postAction("createProduct", {
        data: {
          product_id: "BOOK-1",
          title: "Book One",
          category_id: "Books",
          author: "Robert Kiyosaki",
          publisher: "Plata",
          isbn: "1234567890",
          product_field_keys: ["author", "publisher", "isbn"],
        },
        variants: [{ sku: "BOOK-1-A" }],
      });

      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(
        expect.objectContaining({
          action: "create",
          data: expect.objectContaining({
            product_id: "BOOK-1",
            product_field_keys: "author,publisher,isbn",
            author: "Robert Kiyosaki",
            publisher: "Plata",
            isbn: "1234567890",
          }),
        }),
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  test("updateProduct sends id inside payload.data for sheet updates", async () => {
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "row-1",
            product_id: "PROD-1",
            title: "Phone",
            sku: "SKU-1",
          },
        ],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "row-1",
            product_id: "PROD-1",
            title: "Phone Updated",
            sku: "SKU-1",
          },
        ],
      });

    await postAction("updateProduct", {
      data: { product_id: "PROD-1", title: "Phone Updated" },
      variants: [{ id: "row-1", sku: "SKU-1" }],
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual(
      expect.objectContaining({
        action: "update",
        apiKey: "",
        data: expect.objectContaining({
          id: "row-1",
          product_id: "PROD-1",
          title: "Phone Updated",
          name: "Phone Updated",
          sku: "SKU-1",
          variant_sku: "SKU-1",
          status: "active",
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).id).toBeUndefined();

    fetchMock.mockRestore();
  });
});