var ProductService_ = {
  fetchProducts: function (request) {
    var cacheKey = CacheService_.productListKey(request);
    var cached = CacheService_.getJson(cacheKey);
    if (cached) return cached;

    var pagination = normalizePagination_(request.pagination || {});
    var filters = request.filters || {};
    var categoriesById = {};
    var imagesByProduct = groupBy_(
      readObjects_(SHEETS_.PRODUCT_IMAGES),
      function (item) {
        return String(item.product_id);
      },
    );
    var variantsByProduct = groupBy_(
      readObjects_(SHEETS_.VARIANTS).filter(function (item) {
        return String(item.status || "") !== ENTITY_STATUS_.DELETED;
      }),
      function (item) {
        return String(item.product_id);
      },
    );

    readObjects_(SHEETS_.CATEGORIES).forEach(function (item) {
      categoriesById[String(item.category_id)] = item;
    });

    var products = readObjects_(SHEETS_.PRODUCTS).filter(function (item) {
      if (String(item.status || "") === ENTITY_STATUS_.DELETED) return false;
      if (filters.status && String(item.status) !== String(filters.status))
        return false;
      if (
        filters.category_id &&
        String(item.category_id) !== String(filters.category_id)
      )
        return false;
      if (!filters.search) return true;
      var haystack = [item.title, item.brand, item.description]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(String(filters.search).toLowerCase()) !== -1;
    });

    products.sort(function (a, b) {
      return String(b.updated_at || "").localeCompare(
        String(a.updated_at || ""),
      );
    });

    var start = (pagination.page - 1) * pagination.pageSize;
    var items = products
      .slice(start, start + pagination.pageSize)
      .map(function (product) {
        var productVariants =
          variantsByProduct[String(product.product_id)] || [];
        var image =
          (imagesByProduct[String(product.product_id)] || [])[0] || null;
        var prices = productVariants
          .map(function (item) {
            return Number(item.price || 0);
          })
          .filter(function (value) {
            return value > 0;
          });
        return Object.assign({}, product, {
          category_name: categoriesById[String(product.category_id)]
            ? categoriesById[String(product.category_id)].name
            : "",
          primary_image: image ? image.image_url : "",
          min_price: prices.length ? Math.min.apply(null, prices) : "",
          max_price: prices.length ? Math.max.apply(null, prices) : "",
          inventory_total: productVariants.reduce(function (sum, item) {
            return sum + Number(item.inventory || 0);
          }, 0),
        });
      });
    var result = {
      data: items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: products.length,
        totalPages: Math.max(
          1,
          Math.ceil(products.length / pagination.pageSize),
        ),
      },
    };
    CacheService_.putJson(cacheKey, result, 120);
    return result;
  },

  fetchProductById: function (request) {
    var productId = request.data.product_id;
    var cacheKey = "product:" + productId;
    var cached = CacheService_.getJson(cacheKey);
    if (cached) return cached;

    var product = readObjects_(SHEETS_.PRODUCTS).find(function (item) {
      return String(item.product_id) === String(productId);
    });
    if (!product) throw createError_("Product not found", 404);

    var variants = readObjects_(SHEETS_.VARIANTS).filter(function (item) {
      return (
        String(item.product_id) === String(productId) &&
        String(item.status) !== ENTITY_STATUS_.DELETED
      );
    });
    var images = readObjects_(SHEETS_.PRODUCT_IMAGES).filter(function (item) {
      return String(item.product_id) === String(productId);
    });
    var variantIds = variants.map(function (item) {
      return String(item.variant_id);
    });
    var attributes = readObjects_(SHEETS_.VARIANT_ATTRIBUTES).filter(
      function (item) {
        return variantIds.indexOf(String(item.variant_id)) !== -1;
      },
    );
    var groupedAttributes = groupBy_(attributes, function (item) {
      return String(item.variant_id);
    });

    var result = {
      data: {
        product: product,
        variants: variants,
        images: images,
        attributes: attributes,
        groupedAttributes: groupedAttributes,
      },
    };
    CacheService_.putJson(cacheKey, result, 180);
    return result;
  },

  createProduct: function (request) {
    var data = request.data || {};
    requireFields_(data, ["title"]);
    validateStatus_(data.status || ENTITY_STATUS_.DRAFT);

    var now = nowIso_();
    var product = {
      product_id: generateId_(ID_PREFIX_.PRODUCT),
      title: normalizeText_(data.title),
      description: normalizeText_(data.description),
      brand: normalizeText_(data.brand),
      category_id: normalizeText_(data.category_id),
      status: data.status || ENTITY_STATUS_.DRAFT,
      created_at: now,
      updated_at: now,
    };

    var images = (data.images || [])
      .map(function (item, index) {
        return {
          image_id: generateId_(ID_PREFIX_.IMAGE),
          product_id: product.product_id,
          image_url: normalizeText_(item.image_url || item),
          position: item.position != null ? item.position : index,
          alt_text: normalizeText_(item.alt_text),
        };
      })
      .filter(function (item) {
        return item.image_url;
      });

    appendObjects_(SHEETS_.PRODUCTS, [product], PRODUCT_HEADERS_);
    appendObjects_(SHEETS_.PRODUCT_IMAGES, images, PRODUCT_IMAGE_HEADERS_);
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("product:" + product.product_id);
    return { data: product };
  },

  updateProduct: function (request) {
    var data = request.data || {};
    if (!data.product_id) throw createError_("product_id is required", 400);
    validateStatus_(data.status);

    var patch = {
      title: data.title,
      description: data.description,
      brand: data.brand,
      category_id: data.category_id,
      status: data.status,
      updated_at: nowIso_(),
    };

    updateObjectById_(SHEETS_.PRODUCTS, "product_id", data.product_id, patch);
    if (data.images) {
      var images = data.images
        .map(function (item, index) {
          return {
            image_id: item.image_id || generateId_(ID_PREFIX_.IMAGE),
            product_id: data.product_id,
            image_url: normalizeText_(item.image_url || item),
            position: item.position != null ? item.position : index,
            alt_text: normalizeText_(item.alt_text),
          };
        })
        .filter(function (item) {
          return item.image_url;
        });
      replaceObjectsByField_(
        SHEETS_.PRODUCT_IMAGES,
        "product_id",
        data.product_id,
        images,
        PRODUCT_IMAGE_HEADERS_,
      );
    }
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("product:" + data.product_id);
    return { data: Object.assign({}, data, patch) };
  },

  deleteProduct: function (request) {
    var productId = request.data.product_id;
    if (!productId) throw createError_("product_id is required", 400);

    updateObjectById_(SHEETS_.PRODUCTS, "product_id", productId, {
      status: ENTITY_STATUS_.DELETED,
      updated_at: nowIso_(),
    });
    readObjects_(SHEETS_.VARIANTS).forEach(function (item) {
      if (
        String(item.product_id) !== String(productId) ||
        String(item.status) === ENTITY_STATUS_.DELETED
      )
        return;
      updateObjectById_(SHEETS_.VARIANTS, "variant_id", item.variant_id, {
        status: ENTITY_STATUS_.DELETED,
        updated_at: nowIso_(),
      });
    });
    CacheService_.bumpCatalogueVersion();
    CacheService_.remove("product:" + productId);

    return { data: { product_id: productId, status: ENTITY_STATUS_.DELETED } };
  },
};
