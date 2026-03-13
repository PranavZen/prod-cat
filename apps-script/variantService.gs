var VariantService_ = {
  fetchVariantsByProductId: function (request) {
    var productId = request.data.product_id;
    var variants = readObjects_(SHEETS_.VARIANTS).filter(function (item) {
      return (
        String(item.product_id) === String(productId) &&
        String(item.status) !== ENTITY_STATUS_.DELETED
      );
    });
    var attributes = readObjects_(SHEETS_.VARIANT_ATTRIBUTES).filter(
      function (item) {
        return variants.some(function (variant) {
          return String(variant.variant_id) === String(item.variant_id);
        });
      },
    );
    return { data: { variants: variants, attributes: attributes } };
  },

  validateSku: function (request) {
    var data = request.data || {};
    requireFields_(data, ["sku"]);
    var variants = readObjects_(SHEETS_.VARIANTS);
    return {
      data: {
        sku: validateSkuUnique_(data.sku, variants, data.variant_id),
        valid: true,
      },
    };
  },

  createVariant: function (request) {
    var data = request.data || {};
    requireFields_(data, ["product_id", "sku"]);
    validateStatus_(data.status || ENTITY_STATUS_.ACTIVE);

    var variants = readObjects_(SHEETS_.VARIANTS);
    var normalizedSku = validateSkuUnique_(data.sku, variants);

    var now = nowIso_();
    var variant = {
      variant_id: generateId_(ID_PREFIX_.VARIANT),
      product_id: data.product_id,
      sku: normalizedSku,
      price: data.price || "",
      compare_price: data.compare_price || "",
      inventory: data.inventory || 0,
      weight: data.weight || "",
      status: data.status || ENTITY_STATUS_.ACTIVE,
      created_at: now,
      updated_at: now,
    };

    appendObjects_(SHEETS_.VARIANTS, [variant], VARIANT_HEADERS_);
    replaceObjectsByField_(
      SHEETS_.VARIANT_ATTRIBUTES,
      "variant_id",
      variant.variant_id,
      (data.attributes || [])
        .map(function (item) {
          return {
            variant_id: variant.variant_id,
            attribute_name: normalizeText_(item.attribute_name),
            attribute_value: normalizeText_(item.attribute_value),
          };
        })
        .filter(function (item) {
          return item.attribute_name && item.attribute_value;
        }),
      VARIANT_ATTRIBUTE_HEADERS_,
    );
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("product:" + data.product_id);
    return { data: variant };
  },

  updateVariant: function (request) {
    var data = request.data || {};
    if (!data.variant_id) throw createError_("variant_id is required", 400);
    validateStatus_(data.status);

    if (data.sku) {
      validateSkuUnique_(
        data.sku,
        readObjects_(SHEETS_.VARIANTS),
        data.variant_id,
      );
    }

    var patch = {
      sku: data.sku ? normalizeSku_(data.sku) : null,
      price: data.price,
      compare_price: data.compare_price,
      inventory: data.inventory,
      weight: data.weight,
      status: data.status,
      updated_at: nowIso_(),
    };

    updateObjectById_(SHEETS_.VARIANTS, "variant_id", data.variant_id, patch);
    if (data.attributes) {
      replaceObjectsByField_(
        SHEETS_.VARIANT_ATTRIBUTES,
        "variant_id",
        data.variant_id,
        data.attributes
          .map(function (item) {
            return {
              variant_id: data.variant_id,
              attribute_name: normalizeText_(item.attribute_name),
              attribute_value: normalizeText_(item.attribute_value),
            };
          })
          .filter(function (item) {
            return item.attribute_name && item.attribute_value;
          }),
        VARIANT_ATTRIBUTE_HEADERS_,
      );
    }
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("product:" + data.product_id);
    return { data: Object.assign({}, data, patch) };
  },

  deleteVariant: function (request) {
    var variantId = request.data.variant_id;
    if (!variantId) throw createError_("variant_id is required", 400);

    updateObjectById_(SHEETS_.VARIANTS, "variant_id", variantId, {
      status: ENTITY_STATUS_.DELETED,
      updated_at: nowIso_(),
    });
    CacheService_.bumpCatalogueVersion();
    if (request.data.product_id)
      CacheService_.remove("product:" + request.data.product_id);

    return { data: { variant_id: variantId, status: ENTITY_STATUS_.DELETED } };
  },

  generateCombinations: function (attributeMap) {
    var keys = Object.keys(attributeMap || {});
    return keys.reduce(function (acc, key) {
      var values = attributeMap[key] || [];
      if (!acc.length)
        return values.map(function (value) {
          return [key + ":" + value];
        });
      return acc.flatMap(function (entry) {
        return values.map(function (value) {
          return entry.concat(key + ":" + value);
        });
      });
    }, []);
  },
};
