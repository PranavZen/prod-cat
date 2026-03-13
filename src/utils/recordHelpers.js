/**
 * Helpers for generic record display (any CSV data).
 * Column names are unknown, so we detect common patterns.
 */

const TITLE_KEYS = [
  "name",
  "title",
  "test_name",
  "test",
  "match",
  "patient_name",
  "item",
  "description",
  "label",
];

const IMAGE_KEYS = ["image", "photo", "image_url", "photo_url", "imageUrl", "photoUrl"];

/**
 * Get a display title for a record (e.g. for detail page heading or card).
 * Uses first matching key from TITLE_KEYS, else first column value.
 */
export function getRecordTitle(record) {
  if (!record || typeof record !== "object") return "Record";
  const keys = Object.keys(record);
  for (const key of TITLE_KEYS) {
    if (keys.includes(key) && record[key]) return String(record[key]);
  }
  const firstKey = keys.find((k) => record[k] != null && record[k] !== "");
  return firstKey ? String(record[firstKey]) : "Record";
}

/**
 * Get image URL from a record if any column looks like an image field.
 */
export function getRecordImageUrl(record) {
  if (!record || typeof record !== "object") return null;
  for (const key of IMAGE_KEYS) {
    if (record[key] && typeof record[key] === "string") return record[key];
  }
  return null;
}

/**
 * Keys to hide from generic key-value listing (id, and image key used for the main image).
 */
export function getKeysToHideFromDetail(record) {
  const hide = new Set(["id"]);
  for (const key of IMAGE_KEYS) {
    if (record[key]) hide.add(key);
  }
  return hide;
}
