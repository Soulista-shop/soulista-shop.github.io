import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, cartLineKey } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useShippingDestinations } from "@/hooks/useShippingDestinations";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ShippingPlusLabel } from "@/components/ShippingPlusLabel";
import { sendOrderToTelegram } from "@/lib/telegram";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20),
  address: z.string().min(10, "Address must be at least 10 characters").max(500),
});

type CheckoutPaymentMethod = "cash_on_delivery" | "instapay";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const navigate = useNavigate();
  const {
    data: shippingRows = [],
    isLoading: shippingLoading,
    isError: shippingError,
  } = useShippingDestinations();
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cash_on_delivery");
  const [shippingDestinationId, setShippingDestinationId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const selectedShipping = useMemo(
    () => shippingRows.find((r) => r.id === shippingDestinationId),
    [shippingRows, shippingDestinationId]
  );

  const shippingFee = useMemo(
    () => (selectedShipping ? Number(selectedShipping.price_le) : 0),
    [selectedShipping]
  );

  const shippingReady = !shippingLoading && !shippingError && shippingRows.length > 0;

  const grandTotal = useMemo(
    () => Number((total + shippingFee).toFixed(2)),
    [total, shippingFee]
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = checkoutSchema.parse(formData);

      if (!shippingReady) {
        toast({
          title: "Shipping not available",
          description:
            "At least one shipping zone must exist in Admin (Shipping) before checkout. Try again later.",
          variant: "destructive",
        });
        return;
      }

      if (!shippingDestinationId || !selectedShipping) {
        toast({
          title: "Delivery area required",
          description: "Select your delivery area so we can calculate shipping and complete your order.",
          variant: "destructive",
        });
        return;
      }

      const shippingPlaceName = selectedShipping.place_name;
      const shippingFeeLe = shippingFee;

      const orderData = {
        customer_name: validated.name,
        customer_email: validated.email,
        customer_phone: validated.phone,
        customer_address: validated.address,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          ...(item.size ? { size: item.size } : {}),
        })),
        shipping_place_name: shippingPlaceName,
        shipping_fee_le: shippingFeeLe,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        status: "pending",
      };

      const { error } = await supabase.from("orders").insert([orderData]);

      if (error) throw error;

      // Send order notification to Telegram
      await sendOrderToTelegram(orderData);

      clearCart();

      if (paymentMethod === "instapay") {
        toast({
          title: "Order placed",
          description: "Complete your payment on the InstaPay page.",
        });
        navigate("/instapay", { replace: true, state: { fromCheckout: true } });
      } else {
        toast({
          title: "Order placed",
          description: "We will contact you to confirm cash on delivery.",
        });
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20 pb-12 px-4">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">
            Add some products to your cart to continue shopping
          </p>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={cartLineKey(item)}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                      {item.size ? (
                        <p className="text-sm text-muted-foreground mt-0.5">Size: {item.size}</p>
                      ) : null}
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1">
                        <p className="text-lg font-bold">{item.price} LE</p>
                        <ShippingPlusLabel />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 sm:w-12 text-center tabular-nums">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (items)</span>
                  <span className="tabular-nums font-medium">{total.toFixed(2)} LE</span>
                </div>
                {!isCheckout ? (
                  <>
                    {shippingLoading ? (
                      <p className="text-sm text-muted-foreground">Loading shipping zones…</p>
                    ) : shippingError ? (
                      <p className="text-sm text-destructive">
                        Could not load shipping zones. Refresh the page or try again later.
                      </p>
                    ) : !shippingReady ? (
                      <p className="text-sm text-destructive">
                        Checkout needs at least one shipping zone. Add them in Admin, then Shipping, then return
                        here.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        At checkout you must choose a delivery area (shipping is always included in your total),
                        then pick payment. InstaPay opens only if you select it.
                      </p>
                    )}
                  </>
                ) : null}
                {!isCheckout ? (
                  <Button
                    className="w-full"
                    disabled={!shippingReady}
                    onClick={() => {
                      setPaymentMethod("cash_on_delivery");
                      setShippingDestinationId("");
                      setIsCheckout(true);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal (items)</span>
                        <span className="tabular-nums font-medium">{total.toFixed(2)} LE</span>
                      </div>
                      {shippingLoading ? (
                        <p className="text-xs text-muted-foreground">Loading shipping zones…</p>
                      ) : shippingError || !shippingReady ? (
                        <p className="text-xs text-destructive">
                          Shipping zones are required but could not be loaded. Go back and refresh, or ask the
                          shop to add zones in Admin &gt; Shipping.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="shipping-area">
                            Delivery area (shipping) <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={shippingDestinationId || undefined}
                            onValueChange={setShippingDestinationId}
                            required
                          >
                            <SelectTrigger id="shipping-area" className="w-full bg-background">
                              <SelectValue placeholder="Select your area (required)" />
                            </SelectTrigger>
                            <SelectContent>
                              {shippingRows.map((row) => (
                                <SelectItem key={row.id} value={row.id}>
                                  {row.place_name} — {Number(row.price_le).toFixed(2)} LE
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedShipping ? (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className="tabular-nums font-medium">
                                {shippingFee.toFixed(2)} LE
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-destructive">
                              You must select a delivery area to place your order.
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border/80 pt-2 text-base font-bold">
                        <span>Total</span>
                        <span className="tabular-nums">{grandTotal.toFixed(2)} LE</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment method</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as CheckoutPaymentMethod)}
                        className="grid gap-3"
                      >
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="cash_on_delivery" id="pay-cod" className="mt-0.5" />
                          <div className="grid gap-0.5 leading-none">
                            <span className="text-sm font-medium leading-snug">Cash on delivery</span>
                            <span className="text-xs text-muted-foreground">
                              Pay when your order is delivered.
                            </span>
                          </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                          <RadioGroupItem value="instapay" id="pay-instapay" className="mt-0.5" />
                          <div className="grid gap-0.5 leading-none">
                            <span className="text-sm font-medium leading-snug">InstaPay</span>
                            <span className="text-xs text-muted-foreground">
                              After placing the order you will go to InstaPay, then send us a payment
                              screenshot on WhatsApp.
                            </span>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={
                          loading ||
                          shippingLoading ||
                          shippingError ||
                          !shippingReady ||
                          !shippingDestinationId
                        }
                      >
                        {loading ? "Placing Order..." : "Place Order"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCheckout(false)}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
