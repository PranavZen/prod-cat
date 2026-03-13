var ImportService_ = {
  uploadCSV: function (request) {
    var rows = request.data && request.data.rows ? request.data.rows : [];
    if (!rows.length) throw createError_("CSV payload must include rows", 400);

    var analysis = analyzeCsvRows_(rows);
    var existingVariants = readObjects_(SHEETS_.VARIANTS);
    rows.forEach(function (row, index) {
      if (!normalizeText_(row.sku)) return;
      try {
        validateSkuUnique_(row.sku, existingVariants);
      } catch (error) {
        analysis.rowErrors.push({
          row: index + 2,
          field: "sku",
          message: error.message,
        });
      }
    });

    if (request.data.validateOnly) {
      return { data: analysis };
    }
    if (analysis.rowErrors.length) {
      throw createError_("CSV validation failed", 400, analysis.rowErrors);
    }

    var now = nowIso_();
    var productKeys = {};
    var products = [];
    var variants = [];
    var attributes = [];

    rows.forEach(function (row) {
      var groupKey = [row.title, row.brand, row.category_id].join("::");
      if (!productKeys[groupKey]) {
        productKeys[groupKey] = generateId_(ID_PREFIX_.PRODUCT);
        products.push({
          product_id: productKeys[groupKey],
          title: normalizeText_(row.title),
          description: normalizeText_(row.description),
          brand: normalizeText_(row.brand),
          category_id: normalizeText_(row.category_id),
          status: ENTITY_STATUS_.DRAFT,
          created_at: now,
          updated_at: now,
        });
      }

      var variantId = generateId_(ID_PREFIX_.VARIANT);
      variants.push({
        variant_id: variantId,
        product_id: productKeys[groupKey],
        sku: normalizeSku_(row.sku || variantId),
        price: row.price || "",
        compare_price: row.compare_price || "",
        inventory: row.inventory || 0,
        weight: row.weight || "",
        status: ENTITY_STATUS_.ACTIVE,
        created_at: now,
        updated_at: now,
      });

      Object.keys(row).forEach(function (key) {
        if (
          [
            "title",
            "description",
            "brand",
            "category_id",
            "sku",
            "price",
            "compare_price",
            "inventory",
            "weight",
          ].indexOf(key) !== -1
        )
          return;
        if (row[key] == null || row[key] === "") return;
        attributes.push({
          variant_id: variantId,
          attribute_name: key,
          attribute_value: String(row[key]),
        });
      });
    });

    appendObjects_(SHEETS_.PRODUCTS, products, PRODUCT_HEADERS_);
    appendObjects_(SHEETS_.VARIANTS, variants, VARIANT_HEADERS_);
    appendObjects_(
      SHEETS_.VARIANT_ATTRIBUTES,
      attributes,
      VARIANT_ATTRIBUTE_HEADERS_,
    );
    CacheService_.bumpCatalogueVersion();

    return {
      data: {
        productsCreated: products.length,
        variantsCreated: variants.length,
        attributesCreated: attributes.length,
        warnings: [],
        analysis: analysis,
      },
    };
  },
};
