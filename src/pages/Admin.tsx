import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Settings, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CategorySettings } from "@/components/CategorySettings";
import { MediaManager } from "@/components/MediaManager";
import { MediaPicker } from "@/components/MediaPicker";


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
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "categories" | "media" | "users">("products");
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
  });


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
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
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

    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      description: formData.description,
      main_image: formData.main_image,
      images: formData.images,
      featured: formData.featured,
      sort_order: formData.sort_order,
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
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || "",
      description: product.description,
      main_image: product.main_image,
      images: product.images || [],
      featured: product.featured || false,
      sort_order: product.sort_order || 0,
    });
    setIsProductDialogOpen(true);
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
    });
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
              Category Settings
            </Button>
            <Button
              variant={activeTab === "media" ? "default" : "outline"}
              onClick={() => setActiveTab("media")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Media Library
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
                        <option value="Sets">Sets</option>
                        <option value="Kaftans">Kaftans</option>
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) =>
                            setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Sort</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {product.discount_price ? (
                          <>
                            <span className="line-through text-muted-foreground mr-2">{product.price} LE</span>
                            <span className="text-primary font-semibold">{product.discount_price} LE</span>
                          </>
                        ) : (
                          <span>{product.price} LE</span>
                        )}
                      </TableCell>
                      <TableCell>{product.featured ? "⭐" : ""}</TableCell>
                      <TableCell>{product.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                            <div key={idx} className="flex justify-between text-sm">
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>{item.price * item.quantity} LE</span>
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