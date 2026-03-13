import ProductCard from "./ProductCard";

const ProductGrid = ({
  products,
  emptyMessage = "No catalogue items available yet.",
}) => {
  if (!products.length) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
