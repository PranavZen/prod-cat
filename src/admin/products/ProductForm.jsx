import { useState } from "react";
import {
  buildVariantGenerationStats,
  generateVariantCombinations,
  parseVariantOptions,
} from "../../utils/variantGenerator";
import VariantEditor from "./VariantEditor";

const toLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ProductForm = ({
  form,
  categories,
  productFieldNames,
  variantColumnNames,
  variantInputs,
  variants,
  skuValidation,
  onChange,
  onVariantInputsChange,
  onVariantsChange,
  onAddProductField,
  onAddVariantColumn,
  onGenerateVariants,
  onReplaceVariants,
  onApplyVariantDefaults,
  onGenerateMissingSkus,
  onClearVariantInputs,
  onSubmit,
  submitLabel,
  busy,
}) => {
  const [newProductFieldName, setNewProductFieldName] = useState("");
  const [newVariantColumnName, setNewVariantColumnName] = useState("");
  const parsedInputs = Object.fromEntries(
    (variantColumnNames || []).map((name) => [
      name,
      parseVariantOptions(variantInputs?.[name]),
    ]),
  );
  const combinations = generateVariantCombinations(parsedInputs);
  const generationStats = buildVariantGenerationStats(parsedInputs);
  const categoryOptions = categories.filter(
    (category, index, collection) =>
      collection.findIndex(
        (item) =>
          String(item.category_id || item.name) ===
          String(category.category_id || category.name),
      ) === index,
  );

  return (
    <form onSubmit={onSubmit} className="surface-card grid gap-6 p-6 sm:p-8">
      <section className="grid gap-4">
        <div>
          <h2 className="m-0 text-2xl font-semibold text-slate-900">
            Product information
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Common product fields are copied to every variant row in Google
            Sheet.
          </p>
        </div>
        {!!form.product_id && (
          <div className="chip-slate w-fit">Product ID: {form.product_id}</div>
        )}
        <input
          value={form.title}
          placeholder="Title"
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className="field-input"
        />
        <textarea
          value={form.description}
          placeholder="Description"
          rows={5}
          onChange={(event) =>
            onChange({ ...form, description: event.target.value })
          }
          className="field-textarea"
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={form.brand}
            placeholder="Brand"
            onChange={(event) =>
              onChange({ ...form, brand: event.target.value })
            }
            className="field-input"
          />
          <input
            value={form.image || ""}
            placeholder="Default image URL"
            onChange={(event) =>
              onChange({ ...form, image: event.target.value })
            }
            className="field-input"
          />
          <input
            value={form.price || ""}
            placeholder="Default price"
            onChange={(event) =>
              onChange({ ...form, price: event.target.value })
            }
            className="field-input"
          />
          <input
            value={form.inventory || ""}
            placeholder="Default inventory"
            onChange={(event) =>
              onChange({ ...form, inventory: event.target.value })
            }
            className="field-input"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <input
              value={form.category_id || ""}
              list="product-category-options"
              placeholder="Choose or type category"
              onChange={(event) =>
                onChange({ ...form, category_id: event.target.value })
              }
              className="field-input"
            />
            <datalist id="product-category-options">
              {categoryOptions.map((category) => (
                <option
                  key={category.category_id || category.slug || category.name}
                  value={category.category_id || category.name}
                >
                  {category.name || category.category_id}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-slate-500">
              {categoryOptions.length
                ? "Pick an existing category or type a new one."
                : "No saved categories yet — type a new category name."}
            </p>
          </div>
          <select
            value={form.status}
            onChange={(event) =>
              onChange({ ...form, status: event.target.value })
            }
            className="field-input"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Additional product information
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Add category-specific product fields like `author`, `isbn`,
                `material`, or `expiry`.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={newProductFieldName}
                placeholder="New product field name"
                onChange={(event) => setNewProductFieldName(event.target.value)}
                className="field-input"
              />
              <button
                type="button"
                onClick={() => {
                  onAddProductField?.(newProductFieldName);
                  setNewProductFieldName("");
                }}
                className="btn-outline whitespace-nowrap"
              >
                Add field
              </button>
            </div>
          </div>
          {!!productFieldNames?.length && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {productFieldNames.map((name) => (
                <input
                  key={name}
                  value={form?.[name] || ""}
                  placeholder={toLabel(name)}
                  onChange={(event) =>
                    onChange({ ...form, [name]: event.target.value })
                  }
                  className="field-input"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-5">
        <div>
          <h2 className="m-0 text-2xl font-semibold text-slate-900">
            Variant generator
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Use commas, semicolons, or new lines to build combinations. Merge
            keeps unmatched rows; replace resets the table to only the generated
            combinations.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(variantColumnNames || []).map((name) => (
              <input
                key={name}
                value={variantInputs?.[name] || ""}
                placeholder={`${toLabel(name)}: Value 1, Value 2`}
                onChange={(event) =>
                  onVariantInputsChange({
                    ...variantInputs,
                    [name]: event.target.value,
                  })
                }
                className="field-input"
              />
            ))}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Add variant column
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Create a new Google Sheet column like `author`, `expiry`, or
              `language` and use it across all variants.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={newVariantColumnName}
                placeholder="New column name"
                onChange={(event) =>
                  setNewVariantColumnName(event.target.value)
                }
                className="field-input"
              />
              <button
                type="button"
                onClick={() => {
                  onAddVariantColumn?.(newVariantColumnName);
                  setNewVariantColumnName("");
                }}
                className="btn-outline whitespace-nowrap"
              >
                Add column
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {generationStats.dimensionCount}
            </strong>
            <div className="mt-2 text-sm text-slate-500">Option groups</div>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {generationStats.optionCount}
            </strong>
            <div className="mt-2 text-sm text-slate-500">Values entered</div>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {generationStats.combinations}
            </strong>
            <div className="mt-2 text-sm text-slate-500">Combinations</div>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {variants.length}
            </strong>
            <div className="mt-2 text-sm text-slate-500">Current rows</div>
          </div>
        </div>
        {!!generationStats.optionGroups.length && (
          <div className="grid gap-3">
            {generationStats.optionGroups.map((group) => (
              <div key={group.name} className="grid gap-2">
                <strong className="text-sm font-semibold text-slate-900">
                  {toLabel(group.name)}
                </strong>
                <div className="flex flex-wrap gap-2">
                  {group.values.map((value) => (
                    <span key={`${group.name}-${value}`} className="chip-blue">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onGenerateVariants(combinations)}
            disabled={!combinations.length}
            className="btn-secondary"
          >
            Merge combinations
          </button>
          <button
            type="button"
            onClick={() => onReplaceVariants(combinations)}
            disabled={!combinations.length}
            className="btn-outline"
          >
            Replace with generated
          </button>
          <button
            type="button"
            onClick={onApplyVariantDefaults}
            disabled={!variants.length}
            className="btn-outline"
          >
            Fill missing defaults
          </button>
          <button
            type="button"
            onClick={onGenerateMissingSkus}
            disabled={!variants.length}
            className="btn-outline"
          >
            Generate missing SKUs
          </button>
          <button
            type="button"
            onClick={onClearVariantInputs}
            className="btn-ghost"
          >
            Clear inputs
          </button>
          <button
            type="button"
            onClick={() => onVariantsChange([])}
            disabled={!variants.length}
            className="btn-ghost"
          >
            Clear variants
          </button>
          {skuValidation?.sku && (
            <span className="chip-green">
              Last valid SKU: {skuValidation.sku}
            </span>
          )}
        </div>
      </section>

      <VariantEditor
        attributeNames={variantColumnNames}
        variants={variants}
        onChange={onVariantsChange}
        onAddManual={() =>
          onVariantsChange([
            ...variants,
            {
              sku: "",
              price: form.price || "",
              inventory: form.inventory || "",
              image: form.image || "",
              attributes: [],
            },
          ])
        }
      />
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default ProductForm;
