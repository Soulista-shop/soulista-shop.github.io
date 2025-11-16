import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MinimalProduct {
  id: string | number;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  images: string[];
  description: string;
}

interface CategorySetting {
  frame_enabled: boolean;
  frame_image: string | null;
  background_image: string | null;
  background_opacity: number;
  background_blur: number;
}

interface ProductCardProps {
  product: MinimalProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const [categorySetting, setCategorySetting] = useState<CategorySetting | null>(null);
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price;

  useEffect(() => {
    const fetchCategorySetting = async () => {
      const { data } = await supabase
        .from("category_settings")
        .select("*")
        .eq("category_name", product.category)
        .single();
      
      if (data) {
        setCategorySetting(data as CategorySetting);
      }
    };

    fetchCategorySetting();
  }, [product.category]);

  const hasFrame = categorySetting?.frame_enabled;

  return (
    <div 
      onClick={() => { 
        navigate(`/product/${String(product.id)}`); 
        window.scrollTo(0, 0); 
      }}
      className="cursor-pointer"
    >
      <Card className="group overflow-visible transition-all duration-300 hover:-translate-y-1 border-border hover:shadow-elegant">
        <div className="aspect-[3/4] relative">
          {/* Product Image Container */}
          <div className="absolute inset-0 overflow-hidden bg-muted rounded-t-lg">
            {/* Background Image Layer */}
            {hasFrame && categorySetting?.background_image && (
              <div 
                className="absolute inset-0 bg-cover bg-center rounded-t-lg"
                style={{
                  backgroundImage: `url(${categorySetting.background_image})`,
                  opacity: categorySetting.background_opacity,
                  filter: `blur(${categorySetting.background_blur}px)`,
                }}
              />
            )}

            {/* Product Image */}
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                e.currentTarget.onerror = null;
              }}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          {/* Frame Overlay - Around the image */}
          {hasFrame && categorySetting?.frame_image && (
            <div 
              className="absolute inset-0 bg-center bg-no-repeat pointer-events-none z-20"
              style={{
                backgroundImage: `url(${categorySetting.frame_image})`,
                backgroundSize: '100% 100%',
              }}
            />
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-semibold text-base mb-2 line-clamp-1">{product.name}</h3>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground line-through">{product.price} LE</p>
              <p className="text-lg font-bold text-primary">{displayPrice} LE</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-primary">{product.price} LE</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
