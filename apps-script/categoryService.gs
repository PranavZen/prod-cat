var CategoryService_ = {
  fetchCategories: function (request) {
    var cacheKey = CacheService_.categoryListKey(request);
    var cached = CacheService_.getJson(cacheKey);
    if (cached) return cached;

    var categories = readObjects_(SHEETS_.CATEGORIES).filter(function (item) {
      return String(item.status || "") !== ENTITY_STATUS_.DELETED;
    });

    categories.sort(function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    CacheService_.putJson(cacheKey, categories, 120);
    return { data: categories };
  },

  createCategory: function (request) {
    var data = request.data || {};
    requireFields_(data, ["name"]);

    var now = nowIso_();
    var category = {
      category_id: generateId_(ID_PREFIX_.CATEGORY),
      name: normalizeText_(data.name),
      description: normalizeText_(data.description),
      parent_id: normalizeText_(data.parent_id),
      status: data.status || ENTITY_STATUS_.ACTIVE,
      created_at: now,
      updated_at: now,
    };

    appendObjects_(SHEETS_.CATEGORIES, [category], CATEGORY_HEADERS_);
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("categories");
    return { data: category };
  },

  updateCategory: function (request) {
    var data = request.data || {};
    if (!data.category_id) throw createError_("category_id is required", 400);

    var patch = {
      name: data.name,
      description: data.description,
      parent_id: data.parent_id,
      status: data.status,
      updated_at: nowIso_(),
    };

    updateObjectById_(
      SHEETS_.CATEGORIES,
      "category_id",
      data.category_id,
      patch,
    );
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("categories");
    return { data: Object.assign({}, data, patch) };
  },

  deleteCategory: function (request) {
    var categoryId = request.data.category_id;
    if (!categoryId) throw createError_("category_id is required", 400);

    updateObjectById_(SHEETS_.CATEGORIES, "category_id", categoryId, {
      status: ENTITY_STATUS_.DELETED,
      updated_at: nowIso_(),
    });
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("categories");

    return {
      data: { category_id: categoryId, status: ENTITY_STATUS_.DELETED },
    };
  },
};
