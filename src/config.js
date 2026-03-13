/**
 * API base URL for Google Apps Script backend.
 * In development we use /api and rely on setupProxy.js to avoid CORS.
 * In production, set REACT_APP_API_URL to your backend (or a proxy URL) if needed.
 */
export const API =
  process.env.REACT_APP_API_URL ||
  "/api";
