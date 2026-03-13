function routeAction_(request) {
  var routes = {
    fetchProducts: ProductService_.fetchProducts,
    fetchProductById: ProductService_.fetchProductById,
    createProduct: ProductService_.createProduct,
    updateProduct: ProductService_.updateProduct,
    deleteProduct: ProductService_.deleteProduct,
    fetchVariantsByProductId: VariantService_.fetchVariantsByProductId,
    createVariant: VariantService_.createVariant,
    updateVariant: VariantService_.updateVariant,
    deleteVariant: VariantService_.deleteVariant,
    validateSku: VariantService_.validateSku,
    fetchCategories: CategoryService_.fetchCategories,
    fetchAttributes: AttributeService_.fetchAttributes,
    uploadCSV: ImportService_.uploadCSV,
    deleteColumn: AdminUtilityService_.deleteColumn,
  };

  var handler = routes[request.action];
  if (!handler) {
    throw createError_("Unsupported action: " + request.action, 400);
  }

  return handler(request);
}
