import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  description: string;
  main_image: string;
  images: string[];
  out_of_stock?: boolean;
  almost_sold_out?: boolean;
  sizes?: string[] | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      setProduct(null);
    } else {
      setProduct(data as Product);
      if (data) {
        const sizes = Array.isArray((data as Product).sizes)
          ? ((data as Product).sizes as string[]).filter(Boolean)
          : [];
        setSelectedSize(sizes.length > 0 ? sizes[0] : null);
        fetchRelatedProducts((data as Product).category, productId);
      }
    }
    setLoading(false);
  };

  const fetchRelatedProducts = async (category: string, currentId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", currentId)
      .limit(4);

    if (error) {
      console.error("Error fetching related products:", error);
    } else {
      setRelatedProducts((data as Product[]) || []);
    }
  };

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on("select", () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/shop">
            <Button>Return to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.images.length > 0 ? product.images : [product.main_image];
  const sizeOptions = Array.isArray(product.sizes)
    ? product.sizes.filter((s) => String(s).trim().length > 0)
    : [];
  const needsSize = sizeOptions.length > 0;
  const outOfStock = !!product.out_of_stock;

  const handleAddToCart = () => {
    if (outOfStock) {
      toast.error("This product is out of stock.");
      return;
    }
    if (needsSize && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    const displayPrice = product.discount_price || product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(displayPrice),
      image: product.main_image,
      ...(selectedSize ? { size: selectedSize } : {}),
    });
    toast.success("Added to cart!", {
      description: `${product.name}${selectedSize ? ` (${selectedSize})` : ""} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <Link to="/shop">
          <Button variant="ghost" className="mb-6 sm:mb-8 -ml-2 sm:ml-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 sm:mb-20">
          <div className="flex flex-col md:flex-row gap-4">
            {productImages.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible order-2 md:order-1 pb-1 md:pb-0">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImage(index);
                      if (isMobile && carouselApi) {
                        carouselApi.scrollTo(index);
                      }
                    }}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 md:w-20 md:h-24 overflow-hidden rounded-lg bg-muted transition-all duration-300",
                      selectedImage === index
                        ? "ring-2 ring-primary scale-105 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                        : "opacity-60 hover:opacity-100 hover:scale-110"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className="h-full w-full object-contain transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 order-1 md:order-2 relative">
              {outOfStock ? (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-md bg-white/95 text-sm font-semibold shadow-md border border-border/60">
                  Out of stock
                </div>
              ) : product.almost_sold_out ? (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-md bg-white/95 text-sm font-semibold shadow-md border border-border/60">
                  Almost sold out!
                </div>
              ) : null}

              {isMobile ? (
                <Carousel className="w-full" setApi={setCarouselApi}>
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {productImages.map((image, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4">
                        <div className="w-full rounded-lg bg-muted shadow-elegant h-[50vh] sm:h-[60vh] flex items-center justify-center overflow-hidden transition-transform duration-300">
                          <img
                            src={image}
                            alt={`${product.name} - View ${index + 1}`}
                            className="max-h-full max-w-full object-contain animate-scale-in"
                            onClick={() => setSelectedImage(index)}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div className="max-w-md w-full mx-auto rounded-lg bg-muted shadow-elegant h-auto aspect-[3/4] flex items-center justify-center overflow-hidden group cursor-zoom-in">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>

            <div className="mb-4 flex flex-wrap gap-2">
              {outOfStock ? (
                <span className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium">
                  Out of stock
                </span>
              ) : product.almost_sold_out ? (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                  Almost sold out!
                </span>
              ) : null}
            </div>

            <div className="mb-6">
              {product.discount_price ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xl sm:text-2xl text-muted-foreground line-through">
                    {product.price} LE
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    {product.discount_price} LE
                  </p>
                </div>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {product.price} LE
                </p>
              )}
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 whitespace-pre-wrap">
              {product.description}
            </p>

            {needsSize ? (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-medium">Select size</p>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Product sizes"
                >
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "min-h-11 min-w-[2.75rem] px-4 rounded-md border text-sm font-medium transition-colors touch-manipulation",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-accent",
                        outOfStock && "opacity-50 pointer-events-none"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3 sm:space-y-4">
              <Button
                size="lg"
                className="w-full shadow-elegant min-h-12 touch-manipulation"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {outOfStock ? "Out of stock" : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline" className="w-full min-h-12 touch-manipulation" type="button">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>

            <div className="mt-10 sm:mt-12 space-y-3">
              <h3 className="font-semibold text-lg">Product details</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {needsSize ? (
                  <li>Available sizes: {sizeOptions.join(", ")}</li>
                ) : (
                  <li>One size / no size selection required</li>
                )}
                <li>Premium quality fabrics</li>
                <li>Comfortable fit</li>
                <li>Easy care and maintenance</li>
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <ProductCard
                    product={{
                      id: relatedProduct.id,
                      name: relatedProduct.name,
                      category: relatedProduct.category,
                      price: Number(relatedProduct.price),
                      discount_price: relatedProduct.discount_price
                        ? Number(relatedProduct.discount_price)
                        : undefined,
                      images:
                        relatedProduct.images.length > 0
                          ? relatedProduct.images
                          : [relatedProduct.main_image],
                      description: relatedProduct.description,
                      out_of_stock: relatedProduct.out_of_stock,
                      almost_sold_out: relatedProduct.almost_sold_out,
                      sizes: relatedProduct.sizes,
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
