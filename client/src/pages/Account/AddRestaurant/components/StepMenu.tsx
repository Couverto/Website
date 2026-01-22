import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardData } from "../types";
import { useTranslation } from "react-i18next";
import { Plus, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StepProps } from "@/interfaces/Components";

export const StepMenu = ({ data, updateData, errors }: StepProps) => {
  const { t } = useTranslation();
  const [newMenuUrl, setNewMenuUrl] = useState("");

  const addMenu = () => {
    if (newMenuUrl) {
      updateData({ menu: [...(data.menu || []), newMenuUrl] });
      setNewMenuUrl("");
    }
  };

  const removeMenu = (index: number) => {
    const newMenu = [...(data.menu || [])];
    newMenu.splice(index, 1);
    updateData({ menu: newMenu });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("create.steps.menu.add_menu_link") || "Add Link to Menu"}
          </Label>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="https://example.com/menu.pdf"
                value={newMenuUrl}
                onChange={(e) => setNewMenuUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addMenu()}
                className="pl-10 h-12 border-muted-foreground/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            <Button
              onClick={addMenu}
              type="button"
              size="icon"
              className="h-12 w-12 rounded-xl shadow-lg hover:shadow-primary/20 transition-all shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {errors?.menu && <p className="text-xs font-medium text-red-500 px-1 animate-in slide-in-from-top-1">{errors.menu}</p>}

        <div className="space-y-4 pt-4 border-t">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("create.steps.menu.added_links") || "Added Links"}
          </Label>
          <div className="grid gap-4">
            {data.menu?.map((url: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-background border border-muted-foreground/10 rounded-2xl group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate max-w-[300px]">{url}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      {url.split(".").pop()?.toUpperCase()} Document
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMenu(idx)}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!data.menu || data.menu.length === 0) && (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-4 border-background">
                  <FileText className="h-6 w-6 opacity-30" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{t("create.placeholders.no_menu_links")}</p>
                  <p className="text-xs opacity-60">Add PDF or Image links to your restaurant menu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
