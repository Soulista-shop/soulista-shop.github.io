import { useState, type ReactNode } from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const SIZE_CHART_SRC = "/size-chart.jpg";

interface SizeChartGuideProps {
  className?: string;
  /** product = underlined link with icon; footer = plain footer-style link */
  variant?: "product" | "footer";
  label?: string;
  children?: ReactNode;
}

export function SizeChartGuide({
  className,
  variant = "product",
  label = "Size guide",
  children,
}: SizeChartGuideProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "touch-manipulation transition-colors",
        variant === "product" &&
          "inline-flex items-center gap-1.5 py-1 text-sm text-foreground/80 underline underline-offset-4 decoration-foreground/40 hover:text-foreground hover:decoration-foreground",
        variant === "footer" &&
          "block w-full text-left text-sm text-muted-foreground hover:text-primary transition-smooth",
        className
      )}
    >
      {children ?? (
        <>
          {variant === "product" ? (
            <Ruler className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : null}
          {label}
        </>
      )}
    </button>
  );

  const chartImage = (
    <div className="bg-[#f7f5f1] overflow-auto overscroll-contain -mx-1 px-1">
      <img
        src={SIZE_CHART_SRC}
        alt="Soulista size chart showing bust and length measurements for S–M and L–XL"
        className="mx-auto w-full max-w-xl h-auto select-none"
        loading="lazy"
        decoding="async"
      />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[92dvh]">
            <DrawerHeader className="text-left border-b pb-4">
              <DrawerTitle className="text-lg font-semibold tracking-wide">
                Size guide
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Find your fit using garment measurements (laid flat).
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-2 pt-4 flex-1 min-h-0">
              {chartImage}
            </div>
            <div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="w-full min-h-11">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden sm:rounded-lg">
          <DialogHeader className="border-b px-6 py-4 text-left space-y-1">
            <DialogTitle className="text-xl font-semibold tracking-wide">
              Size guide
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Find your fit using garment measurements (laid flat).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(75vh,720px)] overflow-y-auto px-6 py-5">
            {chartImage}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
