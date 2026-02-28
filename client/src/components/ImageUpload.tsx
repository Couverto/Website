import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  showPreview?: boolean;
  endpoint?: string;
  multiple?: boolean;
  onMultipleChange?: (urls: string[]) => void;
}

export const ImageUpload = ({
  value,
  onChange,
  className,
  placeholder = "Ajouter une image",
  aspectRatio = "auto",
  showPreview = true,
  endpoint = "/uploads/image",
  multiple = false,
  onMultipleChange,
}: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = fileArray.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);

    if (validFiles.length === 0) {
      toast.error("Veuillez sélectionner des images valides (max 5MB)");
      return;
    }

    if (validFiles.length < fileArray.length) {
      toast.error("Certaines images ont été ignorées (invalides ou trop volumineuses)");
    }

    const filesToUpload = multiple ? validFiles : [validFiles[0]];

    setLoading(true);

    try {
      if (multiple && onMultipleChange) {
        const uploadPromises = filesToUpload.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const response = await axiosConfig.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data.url;
        });

        const urls = await Promise.all(uploadPromises);
        onMultipleChange(urls);
        toast.success(`${urls.length} image(s) téléchargée(s) avec succès`);
      } else {
        const formData = new FormData();
        formData.append("image", filesToUpload[0]);
        const response = await axiosConfig.post(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        onChange(response.data.url);
        toast.success("Image téléchargée avec succès");
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        multiple={multiple}
      />

      {showPreview && value ? (
        <div
          className={cn(
            "relative group rounded-xl overflow-hidden border bg-muted",
            aspectRatio === "square"
              ? "aspect-square"
              : aspectRatio === "video"
                ? "aspect-video"
                : aspectRatio === "wide"
                  ? "aspect-[21/9]"
                  : "h-full",
            className, // merge className here too if we want to control height of preview? probably not needed if container handles it
          )}
        >
          <img src={value} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={triggerUpload} disabled={loading} className="h-9">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Modifier
            </Button>
            <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={() => onChange("")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/50 hover:border-primary/50",
            aspectRatio === "square"
              ? "aspect-square"
              : aspectRatio === "video"
                ? "aspect-video"
                : aspectRatio === "wide"
                  ? "aspect-[21/9]"
                  : "h-32", // Default compact height if no aspect ratio
            // If className has a height class, it should override or append.
            // Ideally we want to override the h-32 if provided via className.
            // But className is on the parent div. Code below puts it on the dropzone div too?
            // Actually, the component prop `className` is applied to the wrapper div.
            // Let's modify so `className` applies to the Dropzone/Preview container instead of wrapper?
            // Or just make sure the wrapper doesn't conflict.
            // The implementation below applied `className` to the wrapper div.
          )}
        >
          {loading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground">{placeholder}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
