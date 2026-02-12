import React, { useEffect, useState } from "react";
import { useConfigContext } from "./contexts/configContext.js";
import { Loading } from "./components/customs/loading.js";

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { getConfigValue } = useConfigContext();
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initApp() {
      // Set static branding
      document.title = "Couverto";

      // Initialize with default/static values
      setConfigValues({
        APP_NAME: "Couverto",
      });

      setReady(true);
    }

    initApp();
  }, [getConfigValue]);

  return <>{ready ? children : <Loading />}</>;
}
