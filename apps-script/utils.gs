function nowIso_() {
  return new Date().toISOString();
}

function generateId_(prefix) {
  return [prefix, new Date().getTime(), Math.floor(Math.random() * 1000)].join("-");
}

function normalizePagination_(pagination) {
  var page = Number(pagination.page || 1);
  var pageSize = Number(pagination.pageSize || 20);
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;
  return { page: page, pageSize: pageSize };
}

function normalizeText_(value) {
  return String(value || "").trim();
}

function normalizeSku_(value) {
  return normalizeText_(value)
    .toUpperCase()
    .replace(/[^A-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupBy_(items, keyFn) {
  return items.reduce(function (acc, item) {
    var key = keyFn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

