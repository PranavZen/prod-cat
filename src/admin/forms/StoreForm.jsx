import { useState } from "react";
import { Input, Select, Button, Checkbox } from "../../components/common/index";

/**
 * Store Form Component
 */
export default function StoreForm({ store, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    store || {
      name: "",
      currency: "INR",
      status: "active",
      primary: false,
      tax_rate: 0,
      shipping_cost: 0,
    },
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "tax_rate" || name === "shipping_cost"
            ? parseFloat(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Store name is required";
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

  const currencies = [
    { value: "INR", label: "₹ Indian Rupee" },
    { value: "USD", label: "$ US Dollar" },
    { value: "EUR", label: "€ Euro" },
    { value: "GBP", label: "£ British Pound" },
    { value: "AED", label: "د.إ UAE Dirham" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Store Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., India Store, US Store"
        error={errors.name}
        required
      />

      <Select
        label="Currency"
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        options={currencies}
      />

      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "maintenance", label: "Maintenance" },
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tax Rate (%)"
          name="tax_rate"
          type="number"
          value={formData.tax_rate}
          onChange={handleChange}
          placeholder="0"
          step="0.01"
        />

        <Input
          label="Shipping Cost"
          name="shipping_cost"
          type="number"
          value={formData.shipping_cost}
          onChange={handleChange}
          placeholder="0"
          step="0.01"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="primary"
          id="primary"
          checked={formData.primary}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="primary" className="ml-2 text-sm text-gray-700">
          Set as primary store (default store for new products)
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
          {isSubmitting ? "Saving..." : store ? "Update Store" : "Create Store"}
        </Button>
      </div>
    </form>
  );
}
