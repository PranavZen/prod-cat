import { useState } from "react";
import { Button, Input, Select, Textarea } from "../../components/common/index";
import { Form, FileUpload, ColorPicker } from "../../components/forms/index";

/**
 * Reusable Product Form component
 */
export default function ProductForm({
  product,
  categories,
  attributes,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] = useState(
    product || {
      title: "",
      sku: "",
      description: "",
      category_id: "",
      brand: "",
      price: "",
      compare_price: "",
      status: "draft",
      images: [],
      attributes: {},
    },
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleAttributeChange = (attributeId, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.title) newErrors.title = "Product name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit?.(formData);
  };

  const categoryOptions =
    categories?.map((cat) => ({
      value: cat.category_id || cat.id,
      label: cat.name,
    })) || [];

  const attributeOptions =
    attributes?.map((attr) => ({
      value: attr.attribute_id || attr.id,
      label: attr.name,
    })) || [];

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {/* Basic Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter product name"
            error={errors.title}
            required
          />
          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Enter SKU"
            error={errors.sku}
            required
          />
          <Select
            label="Category"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            options={categoryOptions}
            error={errors.category_id}
            required
          />
          <Input
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Enter brand name"
          />
        </div>
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={4}
          className="mt-4"
        />
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.price}
            required
          />
          <Input
            label="Compare Price (Original)"
            name="compare_price"
            type="number"
            value={formData.compare_price}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Attributes Section */}
      {attributeOptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attributes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attributes?.map((attr) => (
              <Select
                key={attr.attribute_id || attr.id}
                label={attr.name}
                value={formData.attributes[attr.attribute_id || attr.id] || ""}
                onChange={(e) =>
                  handleAttributeChange(
                    attr.attribute_id || attr.id,
                    e.target.value,
                  )
                }
                options={(attr.values || []).map((v) => ({
                  value: v.value_id || v.id,
                  label: v.label,
                }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <Select
          label="Product Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: "draft", label: "Draft" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : product
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
