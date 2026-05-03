import { useIsMobile } from "@/hooks/use-mobile";
import { useShippingDestinations } from "@/hooks/useShippingDestinations";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function ShippingRatesPanel({ className }: { className?: string }) {
  const { data: rows = [], isLoading, isError } = useShippingDestinations();

  if (isLoading) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Loading shipping info...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Could not load shipping rates.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Shipping rates are not listed yet. Contact us for a quote.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Shipping by area
      </p>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.id} className="flex justify-between gap-4 border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
            <span className="text-foreground min-w-0 break-words">{r.place_name}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {Number(r.price_le).toFixed(2)} LE
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const triggerClassName =
  "inline underline decoration-muted-foreground/70 underline-offset-2 text-muted-foreground hover:text-foreground text-sm font-normal align-baseline cursor-help touch-manipulation bg-transparent border-0 p-0";

type ShippingPlusLabelProps = {
  className?: string;
};

export function ShippingPlusLabel({ className }: ShippingPlusLabelProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(triggerClassName, className)}
            aria-label="View shipping prices"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            + shipping
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-2rem,20rem)] p-3 sm:p-4"
          align="start"
          sideOffset={6}
          collisionPadding={12}
        >
          <ShippingRatesPanel />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(triggerClassName, className)}
          aria-label="View shipping prices"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          + shipping
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3 sm:p-4" align="start" sideOffset={6} collisionPadding={12}>
        <ShippingRatesPanel />
      </HoverCardContent>
    </HoverCard>
  );
}
