import { useState } from "react";
import { Input, Select, Button, Textarea } from "../../components/common/index";

/**
 * Price Rule Form Component
 */
export default function PriceRuleForm({ rule, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    rule || {
      name: "",
      description: "",
      type: "percentage",
      discount_value: "",
      target_type: "all",
      target_id: null,
      active: true,
      start_date: "",
      end_date: "",
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Rule name is required";
    }
    if (!formData.discount_value || formData.discount_value <= 0) {
      newErrors.discount_value = "Discount value must be greater than 0";
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
        label="Rule Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Summer Sale 10%"
        error={errors.name}
        required
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Optional description for this rule"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Discount Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={[
            { value: "percentage", label: "Percentage (%)" },
            { value: "fixed", label: "Fixed Amount (₹)" },
          ]}
        />

        <Input
          label="Discount Value"
          name="discount_value"
          type="number"
          value={formData.discount_value}
          onChange={handleChange}
          placeholder={formData.type === "percentage" ? "10" : "500"}
          error={errors.discount_value}
          required
        />
      </div>

      <Select
        label="Apply To"
        name="target_type"
        value={formData.target_type}
        onChange={handleChange}
        options={[
          { value: "all", label: "All Products" },
          { value: "category", label: "Specific Category" },
          { value: "product", label: "Specific Product" },
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
        />

        <Input
          label="End Date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="active"
          id="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Active (Rule is currently enabled)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}
