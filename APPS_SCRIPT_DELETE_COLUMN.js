/**
 * Add this to your Google Apps Script project so "Remove column" works.
 *
 * 1. In doPost(e), add this case (with the other if/else if actions):
 *
 *    } else if (action === 'deleteColumn') {
 *      handleDeleteColumn(payload.column);
 *    }
 *
 * 2. Paste the handleDeleteColumn function below into your script.
 */

function handleDeleteColumn(columnName) {
  if (!columnName) return;

  const sheet = getSheet();
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return;

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const colIndex = headers.findIndex(function (h) {
    return String(h).trim() === String(columnName).trim();
  });

  if (colIndex === -1) return;

  // Sheets columns are 1-indexed; deleteColumn(1) removes the first column
  sheet.deleteColumn(colIndex + 1);
}
