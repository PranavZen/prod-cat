var CategoryService_ = {
  fetchCategories: function () {
    return {
      data: readObjects_(SHEETS_.CATEGORIES).filter(function (item) {
        return String(item.status || "") !== ENTITY_STATUS_.DELETED;
      }),
    };
  },
};

var AttributeService_ = {
  fetchAttributes: function () {
    return {
      data: readObjects_(SHEETS_.ATTRIBUTES).filter(function (item) {
        return String(item.status || "") !== ENTITY_STATUS_.DELETED;
      }),
    };
  },
};

var AdminUtilityService_ = {
  deleteColumn: function (request) {
    var columnName = normalizeText_(request.data.column || request.column);
    if (!columnName) throw createError_("column is required", 400);
    if (columnName === "product_id")
      throw createError_("Protected column cannot be deleted", 400);

    var sheet = getSheet_(SHEETS_.PRODUCTS);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var index = headers.indexOf(columnName);
    if (index === -1)
      throw createError_("Column not found: " + columnName, 404);

    sheet.deleteColumn(index + 1);
    CacheService_.bumpCatalogueVersion();
    return { data: { deletedColumn: columnName } };
  },
};
