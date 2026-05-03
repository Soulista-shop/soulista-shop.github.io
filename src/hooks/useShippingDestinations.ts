import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ShippingDestinationRow = {
  id: string;
  place_name: string;
  price_le: number;
  sort_order: number;
};

export function useShippingDestinations() {
  return useQuery({
    queryKey: ["shipping-destinations"],
    queryFn: async (): Promise<ShippingDestinationRow[]> => {
      const { data, error } = await supabase
        .from("shipping_destinations")
        .select("id, place_name, price_le, sort_order")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data as ShippingDestinationRow[]) ?? [];
    },
    staleTime: 60_000,
  });
}
