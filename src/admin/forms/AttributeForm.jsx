import { useState } from "react";
import { Input, Select, Checkbox, Button } from "../../components/common/index";

/**
 * Attribute Form Component
 */
export default function AttributeForm({ attribute, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    attribute || {
      name: "",
      type: "text",
      values: [],
      is_filterable: true,
      is_visible: true,
    },
  );

  const [errors, setErrors] = useState({});
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          label: newValue,
          value: newValue.toLowerCase().replace(/\s+/g, "-"),
        },
      ],
    }));
    setNewValue("");
  };

  const handleRemoveValue = (index) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Attribute name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error("Form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Attribute Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Color, Size, Material"
        error={errors.name}
        required
      />

      <Select
        label="Attribute Type"
        name="type"
        value={formData.type}
        onChange={handleChange}
        options={[
          { value: "text", label: "Text" },
          { value: "select", label: "Select" },
          { value: "multiselect", label: "Multi-select" },
          { value: "color", label: "Color" },
          { value: "size", label: "Size" },
        ]}
      />

      {/* Values Section */}
      {formData.type !== "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Attribute Values
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add new value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddValue()}
            />
            <Button type="button" variant="secondary" onClick={handleAddValue}>
              Add
            </Button>
          </div>

          {formData.values.length > 0 && (
            <div className="space-y-2">
              {formData.values.map((val, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900">{val.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings */}
      <div className="space-y-3">
        <Checkbox
          label="Use as filter in storefront"
          name="is_filterable"
          checked={formData.is_filterable}
          onChange={handleChange}
        />
        <Checkbox
          label="Visible in product details"
          name="is_visible"
          checked={formData.is_visible}
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : attribute
              ? "Update Attribute"
              : "Create Attribute"}
        </Button>
      </div>
    </form>
  );
}
