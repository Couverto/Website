"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Palette, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

const presetColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#D7BDE2",
  "#3B82F6",
];

export default function ColorPicker({ value = "#3B82F6", onChange, className, disabled = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const [hexInput, setHexInput] = useState(value);
  const [copied, setCopied] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const hexToHsl = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  }, []);

  const hslToHex = useCallback((h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  useEffect(() => {
    if (value && value.match(/^#[0-9A-F]{6}$/i)) {
      const [h, s, l] = hexToHsl(value);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setCurrentColor(value);
      setHexInput(value);
    }
  }, [value, hexToHsl]);

  const updateAll = (h: number, s: number, l: number) => {
    const newColor = hslToHex(h, s, l);
    setCurrentColor(newColor);
    setHexInput(newColor);
    onChange?.(newColor);
  };

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "h-10 px-3 flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm font-mono text-sm transition-all",
          "hover:border-zinc-300 dark:hover:border-zinc-700",
          isOpen && "ring-2 ring-primary/20 border-primary",
        )}
      >
        <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: currentColor }} />
        <span>{currentColor.toUpperCase()}</span>
        <ChevronDown className={cn("w-3 h-3 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <Tabs defaultValue="swatch" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 h-8 p-1">
              <TabsTrigger value="swatch" className="text-xs">
                {t("global.buttons.presets")}
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">
                {t("global.buttons.custom")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swatch" className="mt-0">
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const [h, s, l] = hexToHsl(color);
                      updateAll(h, s, l);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group relative w-10 h-10 rounded-lg border-2 border-transparent transition-all",
                      currentColor.toLowerCase() === color.toLowerCase() ? "border-primary scale-110 shadow-lg" : "hover:scale-105",
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {currentColor.toLowerCase() === color.toLowerCase() && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div
                  className="h-3 rounded-full relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setHue(h);
                      updateAll(h, saturation, lightness);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white border border-black/20 pointer-events-none shadow-sm"
                    style={{ left: `${(hue / 360) * 100}%` }}
                  />
                </div>

                <div
                  className="h-3 rounded-full relative overflow-hidden"
                  style={{ background: `linear-gradient(to right, hsl(${hue}, 0%, 50%), hsl(${hue}, 100%, 50%))` }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={saturation}
                    onChange={(e) => {
                      const s = Number(e.target.value);
                      setSaturation(s);
                      updateAll(hue, s, lightness);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white border border-black/20 pointer-events-none shadow-sm"
                    style={{ left: `${saturation}%` }}
                  />
                </div>

                <div
                  className="h-3 rounded-full relative overflow-hidden"
                  style={{ background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)` }}
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightness}
                    onChange={(e) => {
                      const l = Number(e.target.value);
                      setLightness(l);
                      updateAll(hue, saturation, l);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white border border-black/20 pointer-events-none shadow-sm"
                    style={{ left: `${lightness}%` }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <div className="flex-1 flex items-center h-8 px-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 font-mono text-xs">
              <span className="opacity-50 mr-1">#</span>
              <input
                type="text"
                value={hexInput.replace("#", "")}
                onChange={(e) => {
                  const val = "#" + e.target.value;
                  setHexInput(val);
                  if (val.match(/^#[0-9A-F]{6}$/i)) {
                    const [h, s, l] = hexToHsl(val);
                    setHue(h);
                    setSaturation(s);
                    setLightness(l);
                    setCurrentColor(val);
                    onChange?.(val);
                  }
                }}
                className="bg-transparent border-none outline-none w-full uppercase"
              />
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 opacity-50" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
