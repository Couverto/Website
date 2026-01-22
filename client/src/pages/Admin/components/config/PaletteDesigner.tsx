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
      <div
        key={key}
        className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm transition-all hover:border-primary/20"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{key.replace("-", " ")}</span>
          <span className="text-xs font-mono font-bold tracking-tight">{color.toUpperCase()}</span>
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

  return (
    <div className="space-y-8 mt-12">
      {/* Premium Header Section */}
      <div className="relative p-8 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 shadow-sm group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">{t("pages.admin.config_page.palette_title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              {t("pages.admin.config_page.palette_description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Button
              type="button"
              onClick={handleGenerate}
              className="group h-12 px-6 flex items-center gap-2 bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all rounded-2xl active:scale-95 font-bold"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              {t("pages.admin.config_page.generate_palette")}
              <Wand2 className="w-3 h-3 opacity-50" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-white dark:bg-transparent">
        <Tabs defaultValue="light" className="w-full">
          <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Customisation fine</h4>
            <TabsList className="bg-zinc-200/50 dark:bg-zinc-800/50 p-1 h-9 rounded-xl">
              <TabsTrigger
                value="light"
                className="px-6 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 shadow-sm transition-all"
              >
                {t("global.themes.light")}
              </TabsTrigger>
              <TabsTrigger
                value="dark"
                className="px-6 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 shadow-sm transition-all"
              >
                {t("global.themes.dark")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="light" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ColorGrid theme="light" palette={palette} onUpdateColor={updateColor} />
            </TabsContent>
            <TabsContent value="dark" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ColorGrid theme="dark" palette={palette} onUpdateColor={updateColor} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
