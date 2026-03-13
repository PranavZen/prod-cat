var IndexService_ = {
  getRowById: function (sheetName, idKey, idValue) {
    var cacheKey = ["row", sheetName, idKey, idValue].join(":");
    var cached = CacheService_.getJson(cacheKey);
    if (cached) return cached.row;

    var indexRows = readObjects_(SHEETS_.INDEXES).filter(function (item) {
      return (
        String(item.sheet_name) === String(sheetName) &&
        String(item.id_key) === String(idKey) &&
        String(item.id_value) === String(idValue)
      );
    });
    if (indexRows.length) {
      var row = Number(indexRows[0].row_number);
      CacheService_.putJson(cacheKey, { row: row }, 600);
      return row;
    }

    return this.rebuildAndFindRow(sheetName, idKey, idValue);
  },

  rebuildAndFindRow: function (sheetName, idKey, idValue) {
    var sheet = getSheet_(sheetName);
    var values = sheet.getDataRange().getValues();
    if (!values.length) return null;
    var headers = values[0];
    var idIndex = headers.indexOf(idKey);
    if (idIndex === -1) throw createError_("Missing id column: " + idKey, 500);

    var entries = [];
    var foundRow = null;
    for (var i = 1; i < values.length; i += 1) {
      var currentValue = values[i][idIndex];
      if (currentValue === "") continue;
      var rowNumber = i + 1;
      if (String(currentValue) === String(idValue)) foundRow = rowNumber;
      entries.push({
        sheet_name: sheetName,
        id_key: idKey,
        id_value: String(currentValue),
        row_number: rowNumber,
      });
      CacheService_.putJson(
        ["row", sheetName, idKey, currentValue].join(":"),
        { row: rowNumber },
        600,
      );
    }

    var otherEntries = readObjects_(SHEETS_.INDEXES).filter(function (item) {
      return (
        String(item.sheet_name) !== String(sheetName) ||
        String(item.id_key) !== String(idKey)
      );
    });
    writeObjects_(SHEETS_.INDEXES, otherEntries.concat(entries), [
      "sheet_name",
      "id_key",
      "id_value",
      "row_number",
    ]);
    return foundRow;
  },

  invalidateRow: function (sheetName, idKey, idValue) {
    CacheService_.remove(["row", sheetName, idKey, idValue].join(":"));
  },
};
