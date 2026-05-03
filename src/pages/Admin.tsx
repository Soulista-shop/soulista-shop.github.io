import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Settings, Upload, Truck, GripVertical, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CategorySettings } from "@/components/CategorySettings";
import { MediaManager } from "@/components/MediaManager";
import { MediaPicker } from "@/components/MediaPicker";
import { ContentSettings } from "@/components/ContentSettings";
import { ContactSettings } from "@/components/ContactSettings";
import { ShippingSettings } from "@/components/ShippingSettings";


interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discount_price?: number;
  description: string;
  main_image: string;
  images: string[];
  featured?: boolean;
  sort_order?: number;
  out_of_stock?: boolean;
  almost_sold_out?: boolean;
  sizes?: string[] | null;
}

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"] as const;

function SortableProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    zIndex: isDragging ? 2 : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 sm:gap-3 sm:p-3"
    >
      <button
        type="button"
        className="flex h-11 w-10 shrink-0 touch-none items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted active:cursor-grabbing sm:h-10 sm:w-9"
        aria-label={`Drag to reorder ${product.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 shrink-0" aria-hidden />
      </button>
      <img src={product.main_image} alt="" className="h-12 w-12 shrink-0 rounded object-cover sm:h-14 sm:w-14" />
      <div className="min-w-0 flex-1 basis-[min(100%,12rem)] sm:basis-48">
        <div className="truncate font-medium leading-tight">{product.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
          <span>{product.category}</span>
          <span className="tabular-nums">
            {product.discount_price ? (
              <>
                <span className="line-through">{product.price}</span>{" "}
                <span className="font-semibold text-primary">{product.discount_price} LE</span>
              </>
            ) : (
              <span>{product.price} LE</span>
            )}
          </span>
          <span className="hidden sm:inline">
            {product.out_of_stock ? (
              <span className="font-medium text-destructive">Out of stock</span>
            ) : product.almost_sold_out ? (
              <span className="font-medium text-amber-700 dark:text-amber-400">Low stock</span>
            ) : (
              <span>In stock</span>
            )}
          </span>
          {product.featured ? (
            <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-label="Featured" />
          ) : null}
          <span className="tabular-nums">#{product.sort_order ?? 0}</span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 gap-2">
        <Button variant="outline" size="sm" type="button" onClick={() => onEdit(product)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" type="button" onClick={() => onDelete(product.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: any;
  total_amount: number;
  status: string;
  created_at: string;
}



export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "categories" | "media" | "users" | "content" | "contact" | "shipping"
  >("products");
  const [showMainImagePicker, setShowMainImagePicker] = useState(false);
  const [showGalleryImagePicker, setShowGalleryImagePicker] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    discount_price: "",
    description: "",
    main_image: "",
    images: [] as string[],
    featured: false,
    sort_order: 0,
    out_of_stock: false,
    almost_sold_out: false,
    sizes: [] as string[],
  });
  const [newSizeInput, setNewSizeInput] = useState("");

  const productSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      fetchUsers();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("category_settings")
      .select("category_name")
      .order("display_order", { ascending: true })
      .order("category_name", { ascending: true });

    if (!error && data) {
      setCategories(data.map((c) => c.category_name));
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
  };

  const persistProductSortOrder = async (ordered: Product[]) => {
    try {
      const results = await Promise.all(
        ordered.map((row, index) =>
          supabase.from("products").update({ sort_order: index }).eq("id", row.id)
        )
      );
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save order";
      toast({ title: "Error", description: message, variant: "destructive" });
      fetchProducts();
    }
  };

  const handleProductDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = products.findIndex((i) => i.id === active.id);
    const newIndex = products.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(products, oldIndex, newIndex).map((p, index) => ({
      ...p,
      sort_order: index,
    }));
    setProducts(next);
    await persistProductSortOrder(next);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOrders(data || []);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order deleted successfully" });
      fetchOrders();
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*");

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      toast({ title: "Error", description: rolesError.message, variant: "destructive" });
      return;
    }

    const usersWithRoles = profiles?.map(profile => ({
      ...profile,
      roles: roles?.filter(r => r.user_id === profile.id) || []
    })) || [];

    setUsers(usersWithRoles);
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    // First, delete existing role for this user
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // Then insert the new role
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role: newRole as any }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User role updated successfully" });
      fetchUsers();
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure main_image is first in images array
    const allImages = formData.main_image 
      ? [formData.main_image, ...formData.images.filter(img => img !== formData.main_image)]
      : formData.images;

    const normalizedSizes = Array.from(
      new Set(
        formData.sizes
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      )
    );

    const nextSortOrder =
      products.length === 0 ? 0 : Math.max(...products.map((p) => p.sort_order ?? 0), -1) + 1;

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      description: formData.description,
      main_image: formData.main_image || allImages[0] || '',
      images: allImages,
      featured: formData.featured,
      sort_order: editingProduct ? formData.sort_order : nextSortOrder,
      out_of_stock: formData.out_of_stock,
      almost_sold_out: formData.almost_sold_out,
      sizes: normalizedSizes,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Product updated successfully" });
        fetchProducts();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("products").insert([productData]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Product created successfully" });
        fetchProducts();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Remove main_image from images array if it exists there
    const galleryImages = (product.images || []).filter(img => img !== product.main_image);
    
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || "",
      description: product.description,
      main_image: product.main_image,
      images: galleryImages,
      featured: product.featured || false,
      sort_order: product.sort_order || 0,
      out_of_stock: !!product.out_of_stock,
      almost_sold_out: !!product.almost_sold_out,
      sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
    });
    setNewSizeInput("");
    setIsProductDialogOpen(true);
  };

  const addCustomSize = () => {
    const v = newSizeInput.trim();
    if (!v) return;
    if (formData.sizes.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setNewSizeInput("");
      return;
    }
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, v] }));
    setNewSizeInput("");
  };

  const addPresetSize = (preset: string) => {
    if (formData.sizes.includes(preset)) return;
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, preset] }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      discount_price: "",
      description: "",
      main_image: "",
      images: [],
      featured: false,
      sort_order: 0,
      out_of_stock: false,
      almost_sold_out: false,
      sizes: [],
    });
    setNewSizeInput("");
    setEditingProduct(null);
    setIsProductDialogOpen(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order status updated" });
      fetchOrders();
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              onClick={() => setActiveTab("products")}
            >
              <Package className="mr-2 h-4 w-4" />
              Products
            </Button>
            <Button
              variant={activeTab === "orders" ? "default" : "outline"}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
            >
              Users
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "outline"}
              onClick={() => setActiveTab("categories")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Categories
            </Button>
            <Button
              variant={activeTab === "media" ? "default" : "outline"}
              onClick={() => setActiveTab("media")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Media Library
            </Button>
            <Button
              variant={activeTab === "content" ? "default" : "outline"}
              onClick={() => setActiveTab("content")}
            >
              Content
            </Button>
            <Button
              variant={activeTab === "contact" ? "default" : "outline"}
              onClick={() => setActiveTab("contact")}
            >
              Contact
            </Button>
            <Button
              variant={activeTab === "shipping" ? "default" : "outline"}
              onClick={() => setActiveTab("shipping")}
            >
              <Truck className="mr-2 h-4 w-4" />
              Shipping
            </Button>
          </div>
        </div>

        {activeTab === "products" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products</CardTitle>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pr-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border rounded-md p-2 bg-background"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (LE)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="discount_price">Discount Price (LE)</Label>
                        <Input
                          id="discount_price"
                          type="number"
                          step="0.01"
                          value={formData.discount_price}
                          onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, featured: checked as boolean })
                          }
                        />
                        <Label htmlFor="featured">Featured Product</Label>
                      </div>
                      <div>
                        <Label htmlFor="sort_order">Sort order (manual)</Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) =>
                            setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 0 })
                          }
                          disabled={!editingProduct}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          {editingProduct
                            ? "Optional override. You can also drag rows in the product list to set order."
                            : "New products are added at the end. Reorder with drag and drop in the list."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                      <p className="text-sm font-medium">Stock on storefront</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 rounded-md border bg-background p-3">
                          <Checkbox
                            id="out_of_stock"
                            checked={formData.out_of_stock}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                out_of_stock: checked as boolean,
                                almost_sold_out: checked ? false : formData.almost_sold_out,
                              })
                            }
                            className="mt-0.5"
                          />
                          <div>
                            <Label htmlFor="out_of_stock" className="cursor-pointer">
                              Out of stock
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Hides purchase; shows sold-out badge on the product.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-md border bg-background p-3">
                          <Checkbox
                            id="almost_sold_out"
                            checked={formData.almost_sold_out}
                            disabled={formData.out_of_stock}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, almost_sold_out: checked as boolean })
                            }
                            className="mt-0.5"
                          />
                          <div>
                            <Label htmlFor="almost_sold_out" className="cursor-pointer">
                              Almost sold out!
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Urgency badge; not shown when out of stock.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <div>
                        <Label>Sizes</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for one-size items. If you add sizes, customers must pick one before checkout.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newSizeInput}
                          onChange={(e) => setNewSizeInput(e.target.value)}
                          placeholder="e.g. 38, EU 40, One size"
                          className="flex-1 min-h-11"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSize();
                            }
                          }}
                        />
                        <Button type="button" variant="secondary" className="min-h-11 shrink-0" onClick={addCustomSize}>
                          Add size
                        </Button>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Quick add</p>
                        <div className="flex flex-wrap gap-2">
                          {SIZE_PRESETS.map((preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="min-h-10 min-w-10 touch-manipulation"
                              disabled={formData.sizes.includes(preset)}
                              onClick={() => addPresetSize(preset)}
                            >
                              {preset}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {formData.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {formData.sizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm"
                            >
                              {size}
                              <button
                                type="button"
                                className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                                aria-label={`Remove size ${size}`}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    sizes: prev.sizes.filter((s) => s !== size),
                                  }))
                                }
                              >
                                <span className="text-xs leading-none px-0.5">x</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No sizes added yet.</p>
                      )}
                    </div>

                    <div>
                      <Label>Main Image</Label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowMainImagePicker(true)}
                        >
                          {formData.main_image ? "Change Image" : "Select from Media Library"}
                        </Button>
                        {formData.main_image && (
                          <div className="relative w-32 h-32 border rounded">
                            <img src={formData.main_image} alt="Main" className="w-full h-full object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Gallery Images</Label>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowGalleryImagePicker(true)}
                        >
                          Add Images from Media Library
                        </Button>

                        {formData.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {formData.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="relative w-20 h-20 border rounded overflow-hidden"
                                draggable
                                onDragStart={() => setDragFromIndex(idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (dragFromIndex === null || dragFromIndex === idx) return;
                                  const newImages = [...formData.images];
                                  const [moved] = newImages.splice(dragFromIndex, 1);
                                  newImages.splice(idx, 0, moved);
                                  setFormData(prev => ({ ...prev, images: newImages }));
                                  setDragFromIndex(null);
                                }}
                              >
                                <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                  className="absolute top-1 right-1 bg-background/70 border rounded px-1 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">Tip: Drag images to change their order.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingProduct ? "Update" : "Create"} Product
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                Drag the handle on each row to change storefront order (same as shop listing). Order is saved
                when you drop a row.
              </p>
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products yet.</p>
              ) : (
                <DndContext
                  sensors={productSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleProductDragEnd}
                >
                  <SortableContext
                    items={products.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {products.map((product) => (
                        <SortableProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm">{order.customer_email}</p>
                          <p className="text-sm">{order.customer_phone}</p>
                          <p className="text-sm">{order.customer_address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Details</p>
                          <p className="font-medium">Total: {order.total_amount} LE</p>
                          <p className="text-sm">
                            Date: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <Label htmlFor={`status-${order.id}`}>Status</Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger id={`status-${order.id}`} className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Items</p>
                        <div className="space-y-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between gap-2 text-sm">
                              <span className="min-w-0">
                                {item.name}
                                {item.size ? (
                                  <span className="text-muted-foreground"> ({item.size})</span>
                                ) : null}{" "}
                                x{item.quantity}
                              </span>
                              <span className="shrink-0">{item.price * item.quantity} LE</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users found. Users will appear here after they sign up.</p>
                ) : (
                  users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="font-medium">{user.email || "No email"}</p>
                            <p className="text-sm text-muted-foreground">
                              User ID: {user.id.substring(0, 8)}...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-48">
                              <Label className="text-sm mb-2 block">Role</Label>
                              <Select
                                value={user.roles[0]?.role || "user"}
                                onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "categories" && <CategorySettings />}

        {activeTab === "media" && <MediaManager />}

        {activeTab === "content" && <ContentSettings />}

        {activeTab === "contact" && <ContactSettings />}

        {activeTab === "shipping" && <ShippingSettings />}
      </div>

      <MediaPicker
        open={showMainImagePicker}
        onOpenChange={setShowMainImagePicker}
        onSelect={(url) => setFormData({ ...formData, main_image: url })}
      />

      <MediaPicker
        open={showGalleryImagePicker}
        onOpenChange={setShowGalleryImagePicker}
        onSelect={(url) => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
        multiple={true}
        selectedUrls={formData.images}
      />
    </div>
  );
}