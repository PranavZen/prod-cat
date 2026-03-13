var CacheService_ = {
  getCatalogueVersion: function () {
    var value =
      PropertiesService.getScriptProperties().getProperty(
        "CATALOGUE_CACHE_VERSION",
      ) || "1";
    return String(value);
  },

  bumpCatalogueVersion: function () {
    var nextValue = String(Number(this.getCatalogueVersion()) + 1);
    PropertiesService.getScriptProperties().setProperty(
      "CATALOGUE_CACHE_VERSION",
      nextValue,
    );
    return nextValue;
  },

  getJson: function (key) {
    var raw = CacheService.getScriptCache().get(key);
    return raw ? JSON.parse(raw) : null;
  },

  putJson: function (key, value, ttlSeconds) {
    CacheService.getScriptCache().put(
      key,
      JSON.stringify(value),
      ttlSeconds || 300,
    );
  },

  remove: function (key) {
    CacheService.getScriptCache().remove(key);
  },

  removeMany: function (keys) {
    if (!keys || !keys.length) return;
    CacheService.getScriptCache().removeAll(keys);
  },

  productListKey: function (request) {
    return [
      "products",
      this.getCatalogueVersion(),
      JSON.stringify(request.filters || {}),
      JSON.stringify(request.sort || {}),
      JSON.stringify(normalizePagination_(request.pagination || {})),
    ].join(":");
  },
};
