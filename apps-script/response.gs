function jsonOk_(data, meta, pagination) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: data || null,
      error: null,
      meta: meta || {},
      pagination: pagination || null,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(error) {
  var payload = {
    success: false,
    data: null,
    error: {
      message: error && error.message ? error.message : "Unexpected error",
      code: error && error.code ? error.code : 500,
      details: error && error.details ? error.details : null,
    },
    meta: {},
    pagination: null,
  };

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function createError_(message, code, details) {
  var error = new Error(message);
  error.code = code || 500;
  error.details = details || null;
  return error;
}

