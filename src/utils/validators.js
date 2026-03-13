/**
 * Validation utilities for forms and data
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[\d\s\-\+\(\)]+$/;
export const urlRegex = /^https?:\/\/.+/;
export const skuRegex = /^[A-Z0-9\-_]+$/i;

export const validators = {
  required: (value, fieldName = "This field") => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid phone number";
    }
    return null;
  },

  minLength: (value, min, fieldName = "This field") => {
    if (!value) return null;
    if (value.toString().length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = "This field") => {
    if (!value) return null;
    if (value.toString().length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  minValue: (value, min, fieldName = "This field") => {
    if (value === null || value === undefined) return null;
    if (Number(value) < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  maxValue: (value, max, fieldName = "This field") => {
    if (value === null || value === undefined) return null;
    if (Number(value) > max) {
      return `${fieldName} must not exceed ${max}`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    if (!urlRegex.test(value)) {
      return "Please enter a valid URL";
    }
    return null;
  },

  sku: (value) => {
    if (!value) return null;
    if (!skuRegex.test(value)) {
      return "SKU can only contain letters, numbers, hyphens, and underscores";
    }
    return null;
  },

  match: (value, compareValue, fieldName = "Field") => {
    if (!value || !compareValue) return null;
    if (value !== compareValue) {
      return `${fieldName} does not match`;
    }
    return null;
  },

  custom: (value, validationFn) => {
    if (typeof validationFn !== "function") return null;
    return validationFn(value);
  },
};

/**
 * Validate entire form data
 */
export function validateForm(formData, rules) {
  const errors = {};
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
}

/**
 * Check if form has errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).some((key) => errors[key]);
}
