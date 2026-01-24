import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorPicker from "@/components/customs/colorPicker";
import { ThemePalette, generatePalette, ColorPalette } from "@/lib/colorUtils";
import { Palette, Wand2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PaletteDesignerProps {
  paletteValue: string; // JSON string
  onPaletteChange: (value: string) => void;
}

const ColorGrid = ({
  theme,
  palette,
  onUpdateColor,
}: {
  theme: "light" | "dark";
  palette: ThemePalette;
  onUpdateColor: (theme: "light" | "dark", key: keyof ColorPalette, color: string) => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {Object.entries(palette[theme]).map(([key, color]) => (
      <div key={key} className="flex items-center justify-between p-3 border rounded-lg bg-background">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground capitalize mb-1">{key.replace("-", " ")}</span>
          <span className="text-xs font-mono">{color.toUpperCase()}</span>
        </div>
        <ColorPicker
          value={color as string}
          onChange={(newColor) => onUpdateColor(theme, key as keyof ColorPalette, newColor)}
          className="flex-shrink-0"
        />
      </div>
    ))}
  </div>
);

export const PaletteDesigner = ({ paletteValue, onPaletteChange }: PaletteDesignerProps) => {
  const { t } = useTranslation();
  const [palette, setPalette] = useState<ThemePalette | null>(null);

  useEffect(() => {
    try {
      if (paletteValue && paletteValue !== "__NOT_FOUND__" && paletteValue !== "") {
        setPalette(JSON.parse(paletteValue));
      } else {
        import("@/lib/colorUtils").then((mod) => setPalette(mod.defaultPalette));
      }
    } catch (e) {
      console.error("Failed to parse palette", e);
    }
  }, [paletteValue]);

  const handleUpdate = (newPalette: ThemePalette) => {
    setPalette(newPalette);
    onPaletteChange(JSON.stringify(newPalette));
  };

  const handleGenerate = () => {
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");
    const newPalette = generatePalette(randomHex);
    handleUpdate(newPalette);
  };

  const updateColor = (theme: "light" | "dark", key: keyof ColorPalette, color: string) => {
    if (!palette) return;
    const newPalette = { ...palette };
    newPalette[theme] = { ...newPalette[theme], [key]: color };
    handleUpdate(newPalette);
  };

  if (!palette) return null;

  if (!palette) return null;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{t("pages.admin.config_page.palette_title")}</h3>
          <p className="text-sm text-muted-foreground">{t("pages.admin.config_page.palette_description")}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleGenerate} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t("pages.admin.config_page.generate_palette")}
        </Button>
      </div>

      <div className="border rounded-md">
        <Tabs defaultValue="light" className="w-full">
          <div className="px-4 py-3 border-b bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium">Customisation</span>
            <TabsList>
              <TabsTrigger value="light" className="min-w-[100px]">
                {t("global.themes.light")}
              </TabsTrigger>
              <TabsTrigger value="dark" className="min-w-[100px]">
                {t("global.themes.dark")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 md:p-6">
            <TabsContent value="light" className="mt-0 space-y-4">
              <ColorGrid theme="light" palette={palette} onUpdateColor={updateColor} />
            </TabsContent>
            <TabsContent value="dark" className="mt-0 space-y-4">
              <ColorGrid theme="dark" palette={palette} onUpdateColor={updateColor} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
