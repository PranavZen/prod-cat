import { useState } from "react";
import {
  Input,
  Select,
  Textarea,
  Checkbox,
  Button,
} from "../../components/common/index";

/**
 * Category Form Component - Create/Edit categories
 */
export default function CategoryForm({
  category,
  parentCategories = [],
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState(
    category || {
      name: "",
      description: "",
      parent_id: null,
      status: "active",
      image_url: "",
      featured: false,
    },
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (formData.name.length < 2) {
      newErrors.name = "Category name must be at least 2 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentOptions = parentCategories
    .filter((c) => c.category_id !== category?.category_id)
    .map((c) => ({
      value: c.category_id,
      label: c.name,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Electronics, Fashion"
            error={errors.name}
            required
          />

          <Select
            label="Parent Category (Optional)"
            name="parent_id"
            value={formData.parent_id || ""}
            onChange={handleChange}
            options={parentOptions}
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter category description"
            rows={4}
          />

          <Input
            label="Image URL"
            name="image_url"
            type="url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          <Checkbox
            label="Featured Category (Show on homepage)"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : category
              ? "Update Category"
              : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
