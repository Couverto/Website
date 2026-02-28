import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ImageUpload";
import { Label } from "@/components/ui/label";
import { Link, Upload } from "lucide-react";

interface MediaInputProps {
  onFileChange: (url: string) => void;
  onUrlChange: (url: string) => void;
  onUrlSubmit?: () => void;
  urlValue: string;
  placeholder?: string;
  endpoint?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  multiple?: boolean;
  onMultipleFileChange?: (urls: string[]) => void;
}

export const MediaInput = ({
  onFileChange,
  onUrlChange,
  onUrlSubmit,
  urlValue,
  placeholder = "Image",
  endpoint,
  aspectRatio = "auto",
  multiple = false,
  onMultipleFileChange,
}: MediaInputProps) => {
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Téléverser
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <Link className="h-4 w-4" />
          Lien URL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-0">
        <ImageUpload
          onChange={onFileChange}
          placeholder={placeholder}
          aspectRatio={aspectRatio}
          showPreview={false} // We might want to handle preview outside or make it conditional
          endpoint={endpoint}
          className="h-full min-h-[128px]" // Fills container if larger, else defaults to equivalent of h-32
          multiple={multiple}
          onMultipleChange={onMultipleFileChange}
        />
      </TabsContent>

      <TabsContent value="url" className="mt-0 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={`https://exemple.com/${placeholder.toLowerCase()}.jpg`}
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onUrlSubmit?.())}
          />
        </div>
        <p className="text-[10px] text-muted-foreground pl-1">Collez le lien direct vers votre image ou document</p>
      </TabsContent>
    </Tabs>
  );
};
