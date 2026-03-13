import { useMemo } from "react";

export const useSearch = (products, query) => {
  return useMemo(() => {
    if (!query) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);
};