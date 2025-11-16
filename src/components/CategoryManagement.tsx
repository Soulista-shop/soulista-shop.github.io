import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { MediaPicker } from "@/components/MediaPicker";

interface Category {
  id: string;
  category_name: string;
  frame_enabled: boolean;
  frame_image: string | null;
  background_image: string | null;
  background_opacity: number;
  background_blur: number;
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showFramePicker, setShowFramePicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    category_name: "",
    frame_enabled: false,
    frame_image: "",
    background_image: "",
    background_opacity: 1.0,
    background_blur: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Get all unique categories from products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("category");

    if (productsError) {
      toast({ title: "Error", description: productsError.message, variant: "destructive" });
      return;
    }

    // Get unique categories
    const uniqueCategories = [...new Set(products?.map(p => p.category) || [])];

    // Get category settings
    const { data: settings, error: settingsError } = await supabase
      .from("category_settings")
      .select("*");

    if (settingsError) {
      toast({ title: "Error", description: settingsError.message, variant: "destructive" });
      return;
    }

    // Merge: create entries for categories that exist in products but not in settings
    const allCategories: Category[] = uniqueCategories.map(catName => {
      const existing = settings?.find(s => s.category_name === catName);
      if (existing) {
        return existing;
      } else {
        // Return a default entry for categories without settings
        return {
          id: `temp-${catName}`,
          category_name: catName,
          frame_enabled: false,
          frame_image: null,
          background_image: null,
          background_opacity: 1.0,
          background_blur: 0,
        };
      }
    });

    // Add any category settings that don't have products yet
    settings?.forEach(setting => {
      if (!uniqueCategories.includes(setting.category_name)) {
        allCategories.push(setting);
      }
    });

    setCategories(allCategories.sort((a, b) => a.category_name.localeCompare(b.category_name)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory && !editingCategory.id.startsWith('temp-')) {
      // Update existing category settings
      const { error } = await supabase
        .from("category_settings")
        .update({
          category_name: formData.category_name,
          frame_enabled: formData.frame_enabled,
          frame_image: formData.frame_image || null,
          background_image: formData.background_image || null,
          background_opacity: formData.background_opacity,
          background_blur: formData.background_blur,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category settings updated successfully" });
        fetchCategories();
        resetForm();
      }
    } else {
      // Create new category settings (either for existing category or new one)
      const { error } = await supabase
        .from("category_settings")
        .insert([{
          category_name: formData.category_name,
          frame_enabled: formData.frame_enabled,
          frame_image: formData.frame_image || null,
          background_image: formData.background_image || null,
          background_opacity: formData.background_opacity,
          background_blur: formData.background_blur,
        }]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category settings saved successfully" });
        fetchCategories();
        resetForm();
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      frame_enabled: category.frame_enabled,
      frame_image: category.frame_image || "",
      background_image: category.background_image || "",
      background_opacity: category.background_opacity,
      background_blur: category.background_blur,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (id.startsWith('temp-')) {
      toast({ 
        title: "Cannot Delete", 
        description: "This category has products. Delete the products first or just remove the settings.",
        variant: "destructive" 
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the settings for "${categoryName}"? The category will still exist if products use it.`)) return;

    const { error } = await supabase
      .from("category_settings")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category settings deleted successfully" });
      fetchCategories();
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      category_name: "",
      frame_enabled: false,
      frame_image: "",
      background_image: "",
      background_opacity: 1.0,
      background_blur: 0,
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Category Management</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Manage categories and their display settings (frames, backgrounds)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div>
                <Label htmlFor="category_name">Category Name</Label>
                <Input
                  id="category_name"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  placeholder="e.g., Sets, Kaftans, Dresses"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="frame_enabled"
                  checked={formData.frame_enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, frame_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="frame_enabled">Enable Custom Frame & Background</Label>
              </div>

              {formData.frame_enabled && (
                <div className="space-y-4 pl-6 border-l-2">
                  <div>
                    <Label>Frame Image (PNG with transparent center)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      This image will overlay on top of product images
                    </p>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowFramePicker(true)}
                      >
                        {formData.frame_image ? "Change Frame" : "Select Frame from Media"}
                      </Button>
                      {formData.frame_image && (
                        <div className="relative w-32 h-32 border rounded bg-gray-100">
                          <img src={formData.frame_image} alt="Frame" className="w-full h-full object-contain rounded" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => setFormData({ ...formData, frame_image: "" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Background Image</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      This image will appear behind the product image
                    </p>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowBgPicker(true)}
                      >
                        {formData.background_image ? "Change Background" : "Select Background from Media"}
                      </Button>
                      {formData.background_image && (
                        <div className="relative w-32 h-32 border rounded">
                          <img src={formData.background_image} alt="Background" className="w-full h-full object-cover rounded" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => setFormData({ ...formData, background_image: "" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="background_opacity">
                      Background Opacity: {(formData.background_opacity * 100).toFixed(0)}%
                    </Label>
                    <input
                      type="range"
                      id="background_opacity"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.background_opacity}
                      onChange={(e) => setFormData({ ...formData, background_opacity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="background_blur">
                      Background Blur: {formData.background_blur}px
                    </Label>
                    <input
                      type="range"
                      id="background_blur"
                      min="0"
                      max="20"
                      step="1"
                      value={formData.background_blur}
                      onChange={(e) => setFormData({ ...formData, background_blur: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingCategory ? "Update Category" : "Create Category"}
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
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No categories yet. Click "Add Category" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{category.category_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.frame_enabled ? "Custom styling enabled" : "Default styling"}
                          {category.id.startsWith('temp-') && " • No settings yet"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.category_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {category.frame_enabled && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Frame:</span>{" "}
                          {category.frame_image ? (
                            <img src={category.frame_image} alt="Frame" className="h-12 w-12 object-contain inline-block ml-2 border rounded" />
                          ) : (
                            "None"
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Background:</span>{" "}
                          {category.background_image ? (
                            <img src={category.background_image} alt="BG" className="h-12 w-16 object-cover inline-block ml-2 border rounded" />
                          ) : (
                            "None"
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Opacity: {(category.background_opacity * 100).toFixed(0)}% • Blur: {category.background_blur}px
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <MediaPicker
        open={showFramePicker}
        onOpenChange={setShowFramePicker}
        onSelect={(url) => setFormData({ ...formData, frame_image: url })}
      />

      <MediaPicker
        open={showBgPicker}
        onOpenChange={setShowBgPicker}
        onSelect={(url) => setFormData({ ...formData, background_image: url })}
      />
    </Card>
  );
}
