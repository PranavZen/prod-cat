/**
 * Custom proxy for Google Apps Script to avoid CORS.
 *
 * Apps Script commonly responds to write requests with a 302 redirect to a
 * script.googleusercontent.com URL that serves the JSON payload. Letting fetch
 * handle that redirect automatically works reliably here and avoids the 405
 * HTML response we saw when manually replaying the redirect.
 *
 * Replace this URL with your own deployment URL after deploying your script:
 * Deploy > Manage deployments > Copy "Web app URL" (the /exec link).
 */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx98M1IF2IlD0-YVuBvo59t8_UA4qnft6kLT462t_e6db7Ke8jmPEnqGm44-VUgetp4KA/exec";

function buildProxyFetchOptions(method, headers, body) {
  return {
    method,
    headers,
    body: body || undefined,
    redirect: "follow",
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = function (app) {
  app.use("/api", async (req, res) => {
    const method = req.method;

    // Browser sends OPTIONS preflight for POST with application/json.
    // Google Apps Script doesn't handle OPTIONS, so respond here so the real POST can go through.
    if (method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }

    let body;
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      body = await readBody(req);
    }

    const headers = {};
    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const response = await fetch(
      GOOGLE_SCRIPT_URL,
      buildProxyFetchOptions(method, headers, body),
    );

    const text = await response.text();
    const contentType =
      response.headers.get("content-type") || "application/json";
    res.status(response.status).set("Content-Type", contentType).send(text);
  });
};

module.exports.buildProxyFetchOptions = buildProxyFetchOptions;
