import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Folder, Image as ImageIcon, Upload, ChevronLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: any;
  path: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
  selectedUrls?: string[];
}

export function MediaPicker({ open, onOpenChange, onSelect, multiple = false, selectedUrls = [] }: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFiles();
    }
  }, [currentFolder, open]);

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from("media").list(currentFolder, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    const folderSet = new Set<string>();
    const fileList: MediaFile[] = [];

    data?.forEach((item) => {
      if (item.id === null) {
        folderSet.add(item.name);
      } else {
        fileList.push({
          name: item.name,
          id: item.id,
          created_at: item.created_at,
          metadata: item.metadata,
          path: currentFolder ? `${currentFolder}/${item.name}` : item.name,
        });
      }
    });

    setFolders(Array.from(folderSet));
    setFiles(fileList);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;

      const { error } = await supabase.storage.from("media").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        toast({ title: "Error", description: `Failed to upload ${file.name}: ${error.message}`, variant: "destructive" });
      }
    }

    setUploading(false);
    fetchFiles();
    toast({ title: "Success", description: "Files uploaded successfully" });
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const navigateToFolder = (folder: string) => {
    setCurrentFolder(currentFolder ? `${currentFolder}/${folder}` : folder);
  };

  const navigateUp = () => {
    const parts = currentFolder.split("/");
    parts.pop();
    setCurrentFolder(parts.join("/"));
  };

  const handleSelect = (path: string) => {
    const url = getPublicUrl(path);
    onSelect(url);
    if (!multiple) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Select Image from Media Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentFolder && (
                <Button variant="outline" size="sm" onClick={navigateUp}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                /{currentFolder || "root"}
              </span>
            </div>
            <div>
              <Input
                type="file"
                id="media-picker-upload"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("media-picker-upload")?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[60vh] min-h-[280px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 items-start">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => navigateToFolder(folder)}
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition"
                >
                  <Folder className="h-12 w-12 mb-2 text-primary" />
                  <span className="text-sm truncate w-full text-center">{folder}</span>
                </button>
              ))}

              {files.map((file) => {
                const url = getPublicUrl(file.path);
                const isSelected = selectedUrls.includes(url);
                return (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file.path)}
                    className={`relative aspect-square w-full border rounded-lg overflow-hidden hover:border-primary transition ${
                      isSelected ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-muted flex items-center justify-center p-1 min-w-0 min-h-0">
                      <img
                        src={url}
                        alt={file.name}
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition">
                      {file.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {files.length === 0 && folders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>No files in this folder</p>
                <p className="text-sm">Upload some images to get started</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
