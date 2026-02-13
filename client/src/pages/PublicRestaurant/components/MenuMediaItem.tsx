import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuMediaItemProps {
  url: string;
  index: number;
}

export const MenuMediaItem = ({ url, index }: MenuMediaItemProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const extension = url.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Voir le menu #{index + 1}</span>
          <Badge variant="outline" className="text-[10px] uppercase">
            {extension}
          </Badge>
        </div>
        <a href={url} download target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink className="h-3 w-3" />
          {"Télécharger"}
        </a>
      </div>
      <div className="bg-muted/10 relative min-h-[200px] flex items-center justify-center">
        {isImage ? (
          <>
            {isLoading && <Skeleton className="absolute inset-0 w-full h-[600px]" />}
            <img
              src={url}
              alt={`Menu ${index + 1}`}
              className={`w-full max-h-[600px] object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
              onLoad={() => setIsLoading(false)}
            />
          </>
        ) : isPdf ? (
          <iframe src={`${url}#toolbar=0&navpanes=0`} className="w-full h-[600px] border-0" title={`Menu ${index + 1}`} />
        ) : (
          <div className="p-8 text-center text-muted-foreground w-full">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{"Aperçu non disponible"}</p>
            <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm mt-2 inline-block">
              {"Ouvrir dans un nouvel onglet"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
