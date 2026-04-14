import { createContext, useContext, useMemo, useState } from "react";

const AppSettingsContext = createContext(null);

function readInitialLowBandwidth() {
  const stored = window.localStorage.getItem("lowBandwidthMode");
  return stored === "true";
}

export function AppSettingsProvider({ children }) {
  const [lowBandwidth, setLowBandwidth] = useState(readInitialLowBandwidth);

  const setLowBandwidthMode = (value) => {
    setLowBandwidth(value);
    window.localStorage.setItem("lowBandwidthMode", String(value));
  };

  const contextValue = useMemo(
    () => ({
      lowBandwidth,
      setLowBandwidthMode,
    }),
    [lowBandwidth],
  );

  return <AppSettingsContext.Provider value={contextValue}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const value = useContext(AppSettingsContext);
  if (!value) {
    throw new Error("useAppSettings must be used inside AppSettingsProvider");
  }
  return value;
}
