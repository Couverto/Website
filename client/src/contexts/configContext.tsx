import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { axiosConfig } from "@/config/axiosConfig";

type ConfigMap = Record<string, string>;

interface ConfigContextType {
  configValues: ConfigMap;
  getConfigValue: (keys: string[]) => Promise<ConfigMap>;
  updateConfigValues: (config: ConfigMap) => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [configValues, setConfigValues] = useState<ConfigMap>({});

  const loadConfig = useCallback(
    async (keys: string[]) => {
      // Static override - no API calls for branding
      const staticConfig: ConfigMap = {
        APP_NAME: "Couverto",
        ACCENT_COLOR: "#2d5a43",
      };

      const combined = { ...configValues, ...staticConfig };
      setConfigValues(combined);
      return combined;
    },
    [configValues],
  );

  const getConfigValue = useCallback(
    async (keys: string[]): Promise<ConfigMap> => {
      return loadConfig(keys);
    },
    [loadConfig],
  );

  const updateConfigValues = useCallback((config: ConfigMap) => {
    setConfigValues((prevConfig) => ({ ...prevConfig, ...config }));
  }, []);

  return <ConfigContext.Provider value={{ configValues, getConfigValue, updateConfigValues }}>{children}</ConfigContext.Provider>;
};

export const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === null) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
};
