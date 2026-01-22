import React, { useEffect, useState } from "react";
import { useConfigContext } from "./contexts/configContext.js";
import { Loading } from "./components/customs/loading.js";
import { ThemePalette, defaultPalette } from "./lib/colorUtils.js";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { getConfigValue } = useConfigContext();
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      const configKeys = ["APP_NAME", "ACCENT_COLOR", "COLOR_PALETTE"];
      const values = await getConfigValue(configKeys);

      // Handle Color Palette
      let palette: ThemePalette = defaultPalette;
      const savedPalette = values["COLOR_PALETTE"];

      if (savedPalette && savedPalette !== "__NOT_FOUND__") {
        try {
          palette = JSON.parse(savedPalette);
        } catch (e) {
          console.error("Failed to parse COLOR_PALETTE", e);
        }
      } else if (values["ACCENT_COLOR"] && values["ACCENT_COLOR"] !== "__NOT_FOUND__") {
        // Fallback or Migration: If only ACCENT_COLOR exists, we could ideally generate it,
        // but for now let's just apply the accent color as before or stick to default.
        const accent = values["ACCENT_COLOR"];
        document.documentElement.style.setProperty("--accent", accent);
        document.documentElement.style.setProperty("--primary", accent);
        document.documentElement.style.setProperty("--ring", accent);
      }

      // Apply the full palette
      const applyPalette = (theme: "light" | "dark", colors: any) => {
        const root = theme === "light" ? document.documentElement : (document.querySelector(".dark") as HTMLElement);
        if (!root && theme === "dark") return; // Dark class might not be on body yet

        // If theme is dark and we don't have .dark yet, we might need a different approach
        // usually we apply to document.documentElement and use dark mode classes
        const target = document.documentElement;
        const prefix = theme === "dark" ? ".dark " : "";

        Object.entries(colors).forEach(([key, value]) => {
          if (theme === "light") {
            target.style.setProperty(`--${key}`, value as string);
          } else {
            // For dark mode, we can't easily set properties on :root that only apply to .dark
            // via JS unless we use a specific strategy.
            // Better: use a style tag for the dynamic palette
          }
        });
      };

      // Improved approach: Inject a style tag for dark mode and light mode variables
      let styleTag = document.getElementById("dynamic-palette");
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "dynamic-palette";
        document.head.appendChild(styleTag);
      }

      const lightVars = Object.entries(palette.light)
        .map(([k, v]) => `--${k}: ${v};`)
        .join(" ");
      const darkVars = Object.entries(palette.dark)
        .map(([k, v]) => `--${k}: ${v};`)
        .join(" ");

      styleTag.innerHTML = `
        :root { ${lightVars} }
        .dark { ${darkVars} }
      `;

      if (values["APP_NAME"]) {
        document.title = values["APP_NAME"];
        setConfigValues(values);
      }

      setReady(true);
    }

    fetchConfig();
  }, [getConfigValue]);

  if (!ready) {
    return <Loading />;
  }

  return <>{children}</>;
}
