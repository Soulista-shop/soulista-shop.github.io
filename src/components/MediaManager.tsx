import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Upload, Trash2, FolderPlus, Folder, Image as ImageIcon, Copy, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  deleteMediaFile,
  getMediaPublicUrl,
  listMediaFiles,
  uploadMediaFiles,
} from "@/lib/mediaApi";

interface MediaFile {
  name: string;
  created_at: string;
  path: string;
}

export function MediaManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [folders, setFolders] = useState<string[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [currentFolder]);

  const fetchFiles = async () => {
    try {
      const { folders: folderList, files: fileList } = await listMediaFiles(currentFolder);
      setFolders(folderList.filter((f) => f && !f.startsWith(".")));
      setFiles(fileList);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = document.getElementById("file-upload") as HTMLInputElement;
    const selectedFiles = input?.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Error", description: "Please select files to upload", variant: "destructive" });
      return;
    }

    setUploadingFiles(true);

    try {
      await uploadMediaFiles(currentFolder, Array.from(selectedFiles));
      setIsUploadDialogOpen(false);
      toast({ title: "Success", description: "Files uploaded successfully" });
      fetchFiles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteMediaFile(path);
      toast({ title: "Success", description: "File deleted successfully" });
      fetchFiles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({ title: "Error", description: "Folder name is required", variant: "destructive" });
      return;
    }

    const folderPath = currentFolder
      ? `${currentFolder}/${newFolderName.trim()}`
      : newFolderName.trim();

    const transparentPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    try {
      const keepFile = new File([transparentPng], ".keep", { type: "image/png" });
      await uploadMediaFiles(folderPath, [keepFile]);
      toast({ title: "Success", description: "Folder created successfully" });
      setNewFolderName("");
      setIsFolderDialogOpen(false);
      fetchFiles();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getPublicUrl = (path: string) => getMediaPublicUrl(path);

  const copyUrl = (pathOrUrl: string) => {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : getPublicUrl(pathOrUrl);
    navigator.clipboard.writeText(url);
    toast({ title: "Success", description: "URL copied to clipboard" });
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(newPath);
  };

  const navigateUp = () => {
    const parts = currentFolder.split("/");
    parts.pop();
    setCurrentFolder(parts.join("/"));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Media Library</CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentFolder ? (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentFolder("")}>
                    Home
                  </Button>
                  {currentFolder.split("/").map((part, idx, arr) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span>/</span>
                      <span>{part}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span>Home</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g., products, backgrounds"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateFolder}>Create</Button>
                    <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Media Files</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload">Select Files</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max size: 10MB per file. Supported: JPG, PNG, WEBP, GIF
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploadingFiles}>
                      {uploadingFiles ? "Uploading..." : "Upload"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentFolder && (
          <Button variant="ghost" size="sm" onClick={navigateUp} className="mb-4">
            ← Back
          </Button>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Folders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => navigateToFolder(folder)}
                  className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Folder className="h-12 w-12 text-primary" />
                  <span className="text-xs text-center truncate w-full">{folder}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Files ({files.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {files.map((file) => (
              <div key={file.path} className="group relative border rounded-lg overflow-hidden flex flex-col">
                <div className="aspect-square w-full bg-muted flex items-center justify-center p-1 min-h-0 shrink-0">
                  <img
                    src={getPublicUrl(file.path)}
                    alt={file.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain cursor-pointer"
                    onClick={() => setSelectedImage(getPublicUrl(file.path))}
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 p-0"
                    onClick={() => copyUrl(file.path)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(file.path)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {files.length === 0 && folders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No files in this folder</p>
              <p className="text-sm">Upload files to get started</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Image Preview</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="mt-4 flex gap-2">
                <Input value={selectedImage} readOnly className="flex-1" />
                <Button onClick={() => copyUrl(selectedImage)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
