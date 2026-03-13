import { useState, useCallback } from "react";
import { Input, Select, Textarea, Checkbox, Button } from "./common/index";

/**
 * Form Builder component for quickly creating forms
 */
export function Form({ onSubmit, onCancel, fields = [], submitText = "Submit", cancelText = "Cancel", layout = "vertical" }) {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue || "";
    });
    return initial;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.validate) {
        const error = field.validate(formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gridClass = layout === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4";

  return (
    <form onSubmit={handleSubmit} className={gridClass}>
      {fields.map((field) => {
        if (field.type === "hidden") {
          return null;
        }

        const commonProps = {
          name: field.name,
          value: formData[field.name],
          onChange: handleChange,
          error: errors[field.name],
          required: field.required,
          disabled: field.disabled,
        };

        switch (field.type) {
          case "text":
          case "email":
          case "password":
          case "number":
          case "url":
          case "tel":
            return (
              <Input
                key={field.name}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                helperText={field.helperText}
                {...commonProps}
              />
            );

          case "textarea":
            return (
              <Textarea
                key={field.name}
                label={field.label}
                placeholder={field.placeholder}
                rows={field.rows}
                {...commonProps}
              />
            );

          case "select":
            return (
              <Select
                key={field.name}
                label={field.label}
                options={field.options}
                {...commonProps}
              />
            );

          case "checkbox":
            return (
              <Checkbox
                key={field.name}
                label={field.label}
                checked={formData[field.name]}
                onChange={handleChange}
              />
            );

          case "multi-select":
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <Checkbox
                      key={option.value}
                      label={option.label}
                      checked={(formData[field.name] || []).includes(option.value)}
                      onChange={(e) => {
                        const current = formData[field.name] || [];
                        const updated = e.target.checked
                          ? [...current, option.value]
                          : current.filter((v) => v !== option.value);
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: updated,
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}

      <div className={`flex gap-4 mt-6 ${layout === "grid" && "col-span-2"}`}>
        <Button type="submit" disabled={isSubmitting}>
          {submitText}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
      </div>
    </form>
  );
}

/**
 * File Upload component
 */
export function FileUpload({ label, accept = "*", multiple = false, onChange, error, required = false }) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const files = e.target.files;
    if (files) {
      const names = Array.from(files).map((f) => f.name);
      setFileName(names.join(", "));
      onChange?.(files);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <label
        className={`flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors ${
          error ? "border-red-500" : ""
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-center">
          <p className="text-gray-700 font-medium">
            {fileName || "Click or drag files to upload"}
          </p>
          <p className="text-gray-500 text-sm mt-1">{accept}</p>
        </div>
      </label>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Color Picker component
 */
export function ColorPicker({ label, value = "#000000", onChange, error, required = false }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

/**
 * Date Range Picker component
 */
export function DateRangePicker({ startDate, endDate, onDateChange }) {
  return (
    <div className="flex gap-4">
      <Input
        type="date"
        label="From"
        value={startDate}
        onChange={(e) => onDateChange?.({ startDate: e.target.value, endDate })}
      />
      <Input
        type="date"
        label="To"
        value={endDate}
        onChange={(e) => onDateChange?.({ startDate, endDate: e.target.value })}
      />
    </div>
  );
}
