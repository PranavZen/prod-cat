function doPost(e) {
  try {
    var request = parseRequest_(e);
    authorize_(request.apiKey);
    var result = routeAction_(request);
    return jsonOk_(result.data, result.meta, result.pagination);
  } catch (error) {
    return jsonError_(error);
  }
}

function parseRequest_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
  var request = JSON.parse(raw || "{}");

  if (!request.action) {
    throw createError_("Request body must include an action", 400);
  }

  request.data = request.data || {};
  request.filters = request.filters || {};
  request.sort = request.sort || {};
  request.pagination = request.pagination || {};
  return request;
}

