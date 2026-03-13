function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw createError_("Missing sheet: " + name, 500);
  return sheet;
}

function readObjects_(sheetName) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (!values.length) return [];

  var headers = values[0];
  return values
    .slice(1)
    .filter(function (row) {
      return row.join("") !== "";
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[String(header)] = row[index];
      });
      return obj;
    });
}

function appendObjects_(sheetName, objects, headers) {
  if (!objects || !objects.length) return 0;
  var sheet = getSheet_(sheetName);
  var targetHeaders =
    headers || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = objects.map(function (item) {
    return targetHeaders.map(function (header) {
      return item[header] != null ? item[header] : "";
    });
  });

  var startRow = Math.max(sheet.getLastRow(), 1) + 1;
  sheet
    .getRange(startRow, 1, rows.length, targetHeaders.length)
    .setValues(rows);
  return rows.length;
}

function writeObjects_(sheetName, objects, headers) {
  var sheet = getSheet_(sheetName);
  var targetHeaders =
    headers || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rows = (objects || []).map(function (item) {
    return targetHeaders.map(function (header) {
      return item[header] != null ? item[header] : "";
    });
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, targetHeaders.length).setValues([targetHeaders]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, targetHeaders.length).setValues(rows);
  }
}

function replaceObjectsByField_(
  sheetName,
  fieldName,
  fieldValue,
  replacements,
  headers,
) {
  var objects = readObjects_(sheetName).filter(function (item) {
    return String(item[fieldName]) !== String(fieldValue);
  });
  writeObjects_(sheetName, objects.concat(replacements || []), headers);
}

function updateObjectById_(sheetName, idKey, idValue, patch) {
  var sheet = getSheet_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2)
    throw createError_("No rows found in " + sheetName, 404);

  var headers = values[0];
  var idIndex = headers.indexOf(idKey);
  if (idIndex === -1) throw createError_("Missing id column: " + idKey, 500);

  var indexedRow = null;
  try {
    indexedRow = IndexService_.getRowById(sheetName, idKey, idValue);
  } catch (error) {}

  if (
    indexedRow &&
    values[indexedRow - 1] &&
    String(values[indexedRow - 1][idIndex]) === String(idValue)
  ) {
    headers.forEach(function (header, columnIndex) {
      if (patch[header] != null)
        values[indexedRow - 1][columnIndex] = patch[header];
    });
    sheet
      .getRange(indexedRow, 1, 1, headers.length)
      .setValues([values[indexedRow - 1]]);
    return true;
  }

  for (var rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    if (String(values[rowIndex][idIndex]) !== String(idValue)) continue;
    headers.forEach(function (header, columnIndex) {
      if (patch[header] != null) values[rowIndex][columnIndex] = patch[header];
    });
    sheet
      .getRange(rowIndex + 1, 1, 1, headers.length)
      .setValues([values[rowIndex]]);
    return true;
  }

  throw createError_("Record not found: " + idValue, 404);
}
