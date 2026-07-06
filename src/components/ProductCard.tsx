import { useNavigate } from "react-router-dom";
import { ShippingPlusLabel } from "@/components/ShippingPlusLabel";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useCategorySettingsMap } from "@/hooks/useCategorySettings";

interface MinimalProduct {
  id: string | number;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  images: string[];
  description: string;
  out_of_stock?: boolean;
  almost_sold_out?: boolean;
  sizes?: string[] | null;
}

interface ProductCardProps {
  product: MinimalProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { map: categorySettingsMap } = useCategorySettingsMap();
  const categorySetting = categorySettingsMap.get(product.category) ?? null;
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price;
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
          <div className="absolute inset-0 overflow-hidden bg-muted rounded-t-lg">
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

          {hasFrame && categorySetting?.frame_image && (
            <div
              className="absolute inset-0 bg-center bg-no-repeat pointer-events-none z-20"
              style={{
                backgroundImage: `url(${categorySetting.frame_image})`,
                backgroundSize: "100% 100%",
              }}
            />
          )}

          {product.out_of_stock ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-white/95 text-foreground text-xs font-semibold shadow-md border border-border/60 pointer-events-none">
              Out of stock
            </div>
          ) : product.almost_sold_out ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-md bg-white/95 text-foreground text-xs font-semibold shadow-md border border-border/60 pointer-events-none">
              Almost sold out!
            </div>
          ) : null}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-semibold text-base mb-2 line-clamp-1">{product.name}</h3>
          {product.sizes && product.sizes.length > 0 ? (
            <p className="text-xs text-muted-foreground line-clamp-2">
              Sizes: {product.sizes.join(", ")}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-1">
          {hasDiscount ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-sm text-muted-foreground line-through">{product.price} LE</p>
              <p className="text-lg font-bold text-primary">{displayPrice} LE</p>
              <ShippingPlusLabel />
            </div>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-lg font-bold text-primary">{product.price} LE</p>
              <ShippingPlusLabel />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
