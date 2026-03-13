export function generateVariantCombinations(attributeMap = {}) {
  const keys = Object.keys(attributeMap).filter((key) => (attributeMap[key] || []).length);
  return keys.reduce((acc, key) => {
    const values = attributeMap[key];
    if (!acc.length) {
      return values.map((value) => ({ [key]: value }));
    }
    return acc.flatMap((entry) =>
      values.map((value) => ({
        ...entry,
        [key]: value,
      }))
    );
  }, []);
}

export function parseVariantOptions(text) {
  return Array.from(
    new Set(
      String(text || "")
        .split(/[\n,;|]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function buildVariantGenerationStats(attributeMap = {}) {
  const optionGroups = Object.entries(attributeMap)
    .filter(([, values]) => (values || []).length)
    .map(([name, values]) => ({ name, values }));

  return {
    optionGroups,
    dimensionCount: optionGroups.length,
    optionCount: optionGroups.reduce((sum, group) => sum + group.values.length, 0),
    combinations: generateVariantCombinations(attributeMap).length,
  };
}

