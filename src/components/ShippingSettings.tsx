import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Save } from "lucide-react";

type Row = {
  id: string;
  place_name: string;
  price_le: string;
  sort_order: string;
};

export function ShippingSettings() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const invalidateShippingQuery = () => {
    queryClient.invalidateQueries({ queryKey: ["shipping-destinations"] });
  };

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shipping_destinations")
      .select("id, place_name, price_le, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setRows([]);
    } else {
      setRows(
        (data || []).map((r) => ({
          id: r.id,
          place_name: r.place_name,
          price_le: String(r.price_le),
          sort_order: String(r.sort_order ?? 0),
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const updateRow = (id: string, field: keyof Row, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSave = async (row: Row) => {
    const price = parseFloat(row.price_le);
    const sort = parseInt(row.sort_order, 10);
    if (!row.place_name.trim()) {
      toast({ title: "Missing name", description: "Enter a place or area name.", variant: "destructive" });
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      toast({ title: "Invalid price", description: "Enter a valid shipping price in LE.", variant: "destructive" });
      return;
    }

    setSavingId(row.id);
    const { error } = await supabase
      .from("shipping_destinations")
      .update({
        place_name: row.place_name.trim(),
        price_le: price,
        sort_order: Number.isNaN(sort) ? 0 : sort,
      })
      .eq("id", row.id);

    setSavingId(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Shipping row updated." });
      invalidateShippingQuery();
    }
  };

  const handleAdd = async () => {
    const nextOrder = rows.length;
    const { data, error } = await supabase
      .from("shipping_destinations")
      .insert({
        place_name: "New destination",
        price_le: 0,
        sort_order: nextOrder,
      })
      .select("id, place_name, price_le, sort_order")
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (data) {
      setRows((prev) => [
        ...prev,
        {
          id: data.id,
          place_name: data.place_name,
          price_le: String(data.price_le),
          sort_order: String(data.sort_order ?? 0),
        },
      ]);
      toast({ title: "Added", description: "Edit the row and click Save." });
      invalidateShippingQuery();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this shipping destination?")) return;
    const { error } = await supabase.from("shipping_destinations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Removed" });
      invalidateShippingQuery();
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading shipping settings...</div>;
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Shipping by destination</CardTitle>
        <p className="text-sm text-muted-foreground">
          These rates appear when customers tap or hover &quot;+ shipping&quot; next to product prices. Use clear place
          names (e.g. Cairo, Alexandria, Delta).
        </p>
        <Button type="button" size="sm" className="w-fit" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add destination
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Place / area</TableHead>
                <TableHead className="min-w-[100px]">Price (LE)</TableHead>
                <TableHead className="min-w-[80px] w-24">Order</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No destinations yet. Add one to show rates on the shop.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="align-top py-3">
                      <Label htmlFor={`place-${row.id}`} className="sr-only">
                        Place
                      </Label>
                      <Input
                        id={`place-${row.id}`}
                        value={row.place_name}
                        onChange={(e) => updateRow(row.id, "place_name", e.target.value)}
                        className="min-h-10"
                        placeholder="e.g. Greater Cairo"
                      />
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <Label htmlFor={`price-${row.id}`} className="sr-only">
                        Price LE
                      </Label>
                      <Input
                        id={`price-${row.id}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={row.price_le}
                        onChange={(e) => updateRow(row.id, "price_le", e.target.value)}
                        className="min-h-10"
                      />
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <Label htmlFor={`sort-${row.id}`} className="sr-only">
                        Sort order
                      </Label>
                      <Input
                        id={`sort-${row.id}`}
                        type="number"
                        value={row.sort_order}
                        onChange={(e) => updateRow(row.id, "sort_order", e.target.value)}
                        className="min-h-10"
                      />
                    </TableCell>
                    <TableCell className="align-top py-3 text-right">
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={savingId === row.id}
                          onClick={() => handleSave(row)}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          {savingId === row.id ? "..." : "Save"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
