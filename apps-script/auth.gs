function authorize_(apiKey) {
  var expectedKey = PropertiesService.getScriptProperties().getProperty("ADMIN_API_KEY");

  if (!expectedKey) {
    throw createError_(
      "Missing ADMIN_API_KEY script property. Configure it before deploying the web app.",
      500
    );
  }

  if (!apiKey || apiKey !== expectedKey) {
    throw createError_("Unauthorized request", 401);
  }
}

