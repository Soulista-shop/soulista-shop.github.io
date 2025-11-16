import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface CategorySetting {
  id: string;
  category_name: string;
  frame_enabled: boolean;
  frame_image: string | null;
  background_image: string | null;
  background_opacity: number;
  background_blur: number;
}

// Resolve product asset image paths (supports assets and absolute URLs)
const imageModules = import.meta.glob("/src/assets/products/*", { eager: true, as: "url" }) as Record<string, string>;
const resolveImage = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  const filename = path.split("/").pop()!;
  const match = Object.keys(imageModules).find((k) => k.endsWith(`/${filename}`));
  return match ? imageModules[match] : path;
};
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  description: string;
  main_image: string;
  images: string[];
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [categorySetting, setCategorySetting] = useState<CategorySetting | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("category_settings")
      .select("category_name")
      .order("category_name");

    if (!error && data) {
      setCategories(["All", ...data.map(c => c.category_name)]);
    }
  };

  useEffect(() => {
    if (selectedCategory !== "All") {
      fetchCategorySetting();
    } else {
      setCategorySetting(null);
    }
  }, [selectedCategory]);

  const fetchCategorySetting = async () => {
    const { data } = await supabase
      .from("category_settings")
      .select("*")
      .eq("category_name", selectedCategory)
      .single();
    
    setCategorySetting(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="min-h-screen py-12 relative">
      {/* Category Background */}
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
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Shop Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our curated selection of modern casual wear
          </p>
        </div>

        {/* Category Filter */}
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

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: Number(product.price),
                    discount_price: product.discount_price ? Number(product.discount_price) : undefined,
                    images: (product.images && product.images.length > 0 ? product.images : [product.main_image]).map(resolveImage).filter(Boolean) as string[],
                    description: product.description,
                  }} 
                />
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  No products found in this category
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Shop;
