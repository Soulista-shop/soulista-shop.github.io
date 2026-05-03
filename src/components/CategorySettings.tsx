import { useEffect, useState, useCallback } from "react";
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
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { GripVertical, Plus, Pencil, Trash2, X } from "lucide-react";

import { MediaPicker } from "@/components/MediaPicker";

interface CategorySetting {
  id: string;
  category_name: string;
  frame_enabled: boolean;
  frame_image: string | null;
  background_image: string | null;
  background_opacity: number;
  background_blur: number;
  display_order: number;
}

function SortableCategoryRow({
  setting,
  onEdit,
  onDelete,
}: {
  setting: CategorySetting;
  onEdit: (c: CategorySetting) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: setting.id,
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
      className="grid grid-cols-[2.5rem_minmax(0,1.2fr)_auto_auto_auto_auto_auto] items-center gap-2 rounded-lg border bg-card p-2 sm:gap-3 sm:p-3 md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4rem_4rem_4rem_auto]"
    >
      <button
        type="button"
        className="flex h-11 w-10 shrink-0 touch-none items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted active:cursor-grabbing sm:h-10 sm:w-9"
        aria-label={`Drag to reorder ${setting.category_name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 shrink-0" aria-hidden />
      </button>
      <div className="min-w-0 font-medium leading-tight">{setting.category_name}</div>
      <div className="text-center text-sm tabular-nums sm:text-base">{setting.frame_enabled ? "Yes" : "No"}</div>
      <div className="flex justify-center">
        {setting.frame_image ? (
          <img src={setting.frame_image} alt="" className="h-8 w-8 rounded border object-cover" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="flex justify-center">
        {setting.background_image ? (
          <img src={setting.background_image} alt="" className="h-8 w-10 rounded border object-cover" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="text-center text-xs tabular-nums sm:text-sm">{setting.background_opacity}</div>
      <div className="text-center text-xs tabular-nums sm:text-sm">{setting.background_blur}px</div>
      <div className="col-span-full flex justify-end gap-2 border-t border-border/60 pt-2 md:col-span-1 md:justify-center md:border-0 md:pt-0">
        <Button variant="outline" size="sm" type="button" onClick={() => onEdit(setting)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" type="button" onClick={() => onDelete(setting.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategorySettings() {
  const [categorySettings, setCategorySettings] = useState<CategorySetting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategorySetting | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCategorySettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("category_settings")
      .select("*")
      .order("display_order", { ascending: true })
      .order("category_name", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const rows = (data || []) as CategorySetting[];
      setCategorySettings(
        rows.map((r, i) => ({
          ...r,
          display_order: typeof r.display_order === "number" ? r.display_order : i,
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchCategorySettings();
  }, [fetchCategorySettings]);

  const persistDisplayOrder = async (ordered: CategorySetting[]) => {
    try {
      const results = await Promise.all(
        ordered.map((row, index) =>
          supabase.from("category_settings").update({ display_order: index }).eq("id", row.id)
        )
      );
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save order";
      toast({ title: "Error", description: message, variant: "destructive" });
      fetchCategorySettings();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categorySettings.findIndex((i) => i.id === active.id);
    const newIndex = categorySettings.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(categorySettings, oldIndex, newIndex);
    setCategorySettings(next);
    await persistDisplayOrder(next);
  };

  const nextDisplayOrder = () => {
    if (categorySettings.length === 0) return 0;
    return Math.max(...categorySettings.map((c) => c.display_order ?? 0), -1) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      const { error } = await supabase
        .from("category_settings")
        .update(formData)
        .eq("id", editingCategory.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category settings updated" });
        fetchCategorySettings();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("category_settings").insert([
        {
          ...formData,
          display_order: nextDisplayOrder(),
        },
      ]);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Category settings created" });
        fetchCategorySettings();
        resetForm();
      }
    }
  };

  const handleEdit = (category: CategorySetting) => {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category setting?")) return;

    const { error } = await supabase.from("category_settings").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category settings deleted" });
      fetchCategorySettings();
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

  const sortableIds = categorySettings.map((c) => c.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Categories</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product categories and their display settings. Drag the handle to change the order
            shown in the shop (desktop and mobile).
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
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
                  disabled={!!editingCategory}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {editingCategory ? "Category name cannot be changed" : "Enter a new category name"}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="frame_enabled"
                  checked={formData.frame_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, frame_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="frame_enabled">Enable Custom Frame</Label>
              </div>

              {formData.frame_enabled && (
                <>
                  <div>
                    <Label>Frame Image (PNG with transparent background)</Label>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowFramePicker(true)}
                      >
                        {formData.frame_image ? "Change Frame" : "Select from Media Library"}
                      </Button>
                      {formData.frame_image && (
                        <div className="relative h-32 w-32 rounded border">
                          <img
                            src={formData.frame_image}
                            alt="Frame"
                            className="h-full w-full rounded object-contain"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
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
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowBgPicker(true)}
                      >
                        {formData.background_image ? "Change Background" : "Select from Media Library"}
                      </Button>
                      {formData.background_image && (
                        <div className="relative h-32 w-32 rounded border">
                          <img
                            src={formData.background_image}
                            alt="Background"
                            className="h-full w-full rounded object-cover"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
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
                      Background Opacity: {formData.background_opacity.toFixed(2)}
                    </Label>
                    <input
                      type="range"
                      id="background_opacity"
                      min="0"
                      max="1"
                      step="0.01"
                      value={formData.background_opacity}
                      onChange={(e) =>
                        setFormData({ ...formData, background_opacity: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="background_blur">Background Blur (px): {formData.background_blur}</Label>
                    <input
                      type="range"
                      id="background_blur"
                      min="0"
                      max="20"
                      step="1"
                      value={formData.background_blur}
                      onChange={(e) =>
                        setFormData({ ...formData, background_blur: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit">{editingCategory ? "Update" : "Create"} Settings</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categorySettings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet. Click &quot;Add Category&quot; to create one.</p>
        ) : (
          <>
            <div className="mb-2 hidden rounded-lg border bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4rem_4rem_4rem_auto] md:gap-3 md:px-3">
              <span className="sr-only">Reorder</span>
              <span>Category</span>
              <span className="text-center">Frame</span>
              <span className="text-center">Frame img</span>
              <span className="text-center">BG</span>
              <span className="text-center">Opacity</span>
              <span className="text-center">Blur</span>
              <span className="text-center">Actions</span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {categorySettings.map((setting) => (
                    <SortableCategoryRow
                      key={setting.id}
                      setting={setting}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
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
