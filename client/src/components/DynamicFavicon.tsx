import { useEffect } from "react";

interface DynamicFaviconProps {
  color?: string;
  appName?: string;
}

export const DynamicFavicon = ({ color = "#000000", appName = "C" }: DynamicFaviconProps) => {
  useEffect(() => {
    const updateFavicon = () => {
      const letter = appName.charAt(0).toUpperCase() || "C";

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="20" fill="${color}" />
          <text x="50%" y="55%" font-family="Arial, sans-serif" font-weight="bold" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">
            ${letter}
          </text>
        </svg>
      `.trim();

      const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement("link");
      link.type = "image/svg+xml";
      link.rel = "icon";
      link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      document.head.appendChild(link);
    };

    updateFavicon();
  }, [color, appName]);

  return null;
};
