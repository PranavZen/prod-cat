function requireFields_(data, fields) {
  (fields || []).forEach(function (field) {
    if (!normalizeText_(data[field])) {
      throw createError_(field + " is required", 400);
    }
  });
}

function validateStatus_(value) {
  if (!value) return;
  var allowed = [
    ENTITY_STATUS_.DRAFT,
    ENTITY_STATUS_.ACTIVE,
    ENTITY_STATUS_.ARCHIVED,
    ENTITY_STATUS_.DELETED,
  ];
  if (allowed.indexOf(String(value)) === -1) {
    throw createError_("Invalid status: " + value, 400);
  }
}

function validateSkuUnique_(sku, variants, ignoreVariantId) {
  var normalizedSku = normalizeSku_(sku);
  var exists = (variants || []).some(function (item) {
    if (ignoreVariantId && String(item.variant_id) === String(ignoreVariantId)) return false;
    return normalizeSku_(item.sku) === normalizedSku && String(item.status) !== ENTITY_STATUS_.DELETED;
  });
  if (exists) throw createError_("SKU already exists", 409);
  return normalizedSku;
}

function analyzeCsvRows_(rows) {
  var coreProduct = ["title", "description", "brand", "category_id"];
  var coreVariant = ["sku", "price", "compare_price", "inventory", "weight"];
  var headers = rows.length ? Object.keys(rows[0]) : [];
  var dynamicAttributes = headers.filter(function (key) {
    return coreProduct.indexOf(key) === -1 && coreVariant.indexOf(key) === -1;
  });

  var duplicateSkuMap = {};
  var errors = [];
  rows.forEach(function (row, index) {
    if (!normalizeText_(row.title)) errors.push({ row: index + 2, field: "title", message: "Title is required" });
    if (!normalizeText_(row.sku)) errors.push({ row: index + 2, field: "sku", message: "SKU is required" });
    var sku = normalizeSku_(row.sku);
    if (sku) {
      duplicateSkuMap[sku] = duplicateSkuMap[sku] || [];
      duplicateSkuMap[sku].push(index + 2);
    }
  });

  Object.keys(duplicateSkuMap).forEach(function (sku) {
    if (duplicateSkuMap[sku].length > 1) {
      errors.push({ row: duplicateSkuMap[sku].join(", "), field: "sku", message: "Duplicate SKU in file: " + sku });
    }
  });

  return {
    headers: headers,
    coreProductColumns: coreProduct.filter(function (key) { return headers.indexOf(key) !== -1; }),
    coreVariantColumns: coreVariant.filter(function (key) { return headers.indexOf(key) !== -1; }),
    dynamicAttributes: dynamicAttributes,
    rowErrors: errors,
  };
}

