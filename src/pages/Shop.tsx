import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCategorySettings } from "@/hooks/useCategorySettings";
import { useShopProducts } from "@/hooks/useProducts";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: categoryRows = [] } = useCategorySettings();
  const { data: products = [], isLoading: loading } = useShopProducts();

  const categories = useMemo(
    () => ["All", ...categoryRows.map((c) => c.category_name)],
    [categoryRows]
  );

  const categorySetting = useMemo(() => {
    if (selectedCategory === "All") return null;
    return categoryRows.find((c) => c.category_name === selectedCategory) ?? null;
  }, [categoryRows, selectedCategory]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 relative">
      {categorySetting?.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${categorySetting.background_image})`,
            opacity: categorySetting.background_opacity,
            filter: `blur(${categorySetting.background_blur}px)`,
          }}
        />
      )}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Collection</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of modern casual wear
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-12 relative z-10">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="transition-smooth"
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No products found in this category</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Shop;
