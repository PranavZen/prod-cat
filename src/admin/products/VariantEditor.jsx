// default fields are set by the parent; the editor itself should not
// hardcode a baseline list so that columns truly follow the prop.
const toLabel = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
const getAttributeValue = (variant, name) =>
  variant.attributes?.find((attribute) => attribute.attribute_name === name)
    ?.attribute_value || "";
const setAttributeValue = (attributes = [], name, value) => {
  const next = (attributes || []).filter(
    (attribute) => attribute.attribute_name !== name,
  );
  if (String(value).trim() !== "")
    next.push({
      attribute_name: name,
      attribute_label: toLabel(name),
      attribute_value: value,
    });
  return next;
};

const VariantEditor = ({
  attributeNames: inputAttributeNames,
  variants,
  onChange,
  onAddManual,
}) => {
  // start with whatever the parent told us, then include any names already
  // present on the variants themselves (so editing retains values).  we no
  // longer inject a fixed set of defaults here.
  const attributeNames = Array.from(
    new Set([
      ...(inputAttributeNames || []),
      ...variants.flatMap((variant) =>
        (variant.attributes || []).map((attribute) => attribute.attribute_name),
      ),
    ]),
  ).filter(Boolean);
  const missingSkuCount = variants.filter(
    (variant) => !String(variant.sku || "").trim(),
  ).length;
  const missingPriceCount = variants.filter(
    (variant) => !String(variant.price || "").trim(),
  ).length;
  const updateVariant = (index, updater) =>
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index ? updater(variant) : variant,
      ),
    );
  const removeVariant = (index) =>
    onChange(variants.filter((_, variantIndex) => variantIndex !== index));

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-2xl font-semibold text-slate-900">
            Variants
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Each variant below becomes one row in Google Sheet; the table
            columns update to match the attributes you define above.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="chip-blue">{variants.length} rows</span>
          <span className="chip-amber">{missingSkuCount} missing SKU</span>
          <span className="chip-slate">{missingPriceCount} missing price</span>
          <button type="button" onClick={onAddManual} className="btn-secondary">
            Add variant
          </button>
        </div>
      </div>
      <div className="table-shell">
        <div className="table-scroll">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="th-cell">Row</th>
                {attributeNames.map((name) => (
                  <th key={name} className="th-cell">
                    {toLabel(name)}
                  </th>
                ))}
                <th className="th-cell">SKU</th>
                <th className="th-cell">Price</th>
                <th className="th-cell">Inventory</th>
                <th className="th-cell">Image URL</th>
                <th className="th-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr
                  key={variant.variant_id || variant.id || `variant-${index}`}
                  className="hover:bg-slate-50/80"
                >
                  <td className="td-cell font-semibold text-slate-900">
                    #{index + 1}
                  </td>
                  {attributeNames.map((name) => (
                    <td key={name} className="td-cell">
                      <input
                        value={getAttributeValue(variant, name)}
                        onChange={(event) =>
                          updateVariant(index, (current) => ({
                            ...current,
                            attributes: setAttributeValue(
                              current.attributes,
                              name,
                              event.target.value,
                            ),
                          }))
                        }
                        placeholder={toLabel(name)}
                        className="field-input min-w-[140px]"
                      />
                    </td>
                  ))}
                  <td className="td-cell">
                    <input
                      value={variant.sku || ""}
                      onChange={(event) =>
                        updateVariant(index, (current) => ({
                          ...current,
                          sku: event.target.value,
                        }))
                      }
                      placeholder="SKU"
                      className="field-input min-w-[160px]"
                    />
                  </td>
                  <td className="td-cell">
                    <input
                      value={variant.price || ""}
                      onChange={(event) =>
                        updateVariant(index, (current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      placeholder="Price"
                      className="field-input min-w-[120px]"
                    />
                  </td>
                  <td className="td-cell">
                    <input
                      value={variant.inventory || ""}
                      onChange={(event) =>
                        updateVariant(index, (current) => ({
                          ...current,
                          inventory: event.target.value,
                        }))
                      }
                      placeholder="Inventory"
                      className="field-input min-w-[120px]"
                    />
                  </td>
                  <td className="td-cell">
                    <input
                      value={variant.image || variant.primary_image || ""}
                      onChange={(event) =>
                        updateVariant(index, (current) => ({
                          ...current,
                          image: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="field-input min-w-[220px]"
                    />
                  </td>
                  <td className="td-cell">
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="btn-outline text-rose-600 hover:border-rose-200 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!variants.length && (
                <tr>
                  <td
                    className="td-cell text-slate-500"
                    colSpan={attributeNames.length + 6}
                  >
                    No variants yet. Generate them above or add one manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default VariantEditor;
