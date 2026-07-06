import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { resolveProductImages } from "@/lib/productImages";

export type StorefrontProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  description: string;
  images: string[];
  out_of_stock?: boolean;
  almost_sold_out?: boolean;
  sizes?: string[] | null;
};

function mapProductRow(p: {
  id: string;
  name: string;
  category: string;
  price: number;
  discount_price?: number | null;
  description: string | null;
  main_image: string | null;
  images: string[] | null;
  out_of_stock?: boolean;
  almost_sold_out?: boolean;
  sizes?: string[] | null;
}): StorefrontProduct {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    discount_price: p.discount_price ? Number(p.discount_price) : undefined,
    description: p.description ?? "",
    images: resolveProductImages(p.main_image ?? undefined, p.images),
    out_of_stock: p.out_of_stock,
    almost_sold_out: p.almost_sold_out,
    sizes: p.sizes,
  };
}

export function useShopProducts() {
  return useQuery({
    queryKey: ["products", "shop"],
    queryFn: async (): Promise<StorefrontProduct[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, category, price, discount_price, description, main_image, images, out_of_stock, almost_sold_out, sizes"
        )
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(mapProductRow);
    },
    staleTime: 5 * 60_000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async (): Promise<StorefrontProduct[]> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, category, price, discount_price, description, main_image, images, out_of_stock, almost_sold_out, sizes"
        )
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .limit(8);

      if (error) throw error;
      return (data ?? []).map(mapProductRow);
    },
    staleTime: 5 * 60_000,
  });
}
