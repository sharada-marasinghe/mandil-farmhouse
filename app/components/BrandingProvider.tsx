"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SystemConfig {
  systemName: string;
  logoUrl: string;
  themeColor: string;
}

interface BrandingContextType {
  config: SystemConfig;
  updateConfig: (newConfig: SystemConfig) => void;
}

export const THEMES: Record<string, Record<string, string>> = {
  emerald: {
    "50": "#ecfdf5",
    "100": "#d1fae5",
    "200": "#a7f3d0",
    "300": "#6ee7b7",
    "400": "#34d399",
    "500": "#10b981",
    "600": "#059669",
    "700": "#047857",
    "800": "#065f46",
    "900": "#064e3b",
    "950": "#022c22",
  },
  teal: {
    "50": "#f0fdfa",
    "100": "#ccfbf1",
    "200": "#99f6e4",
    "300": "#5eead4",
    "400": "#2dd4bf",
    "500": "#14b8a6",
    "600": "#0d9488",
    "700": "#0f766e",
    "800": "#115e59",
    "900": "#134e4a",
    "950": "#042f2e",
  },
  blue: {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
    "950": "#172554",
  },
  olive: {
    "50": "#f5f6f0",
    "100": "#e6ebdb",
    "200": "#ccd6b7",
    "300": "#abbc8e",
    "400": "#8fa46b",
    "500": "#6e854d",
    "600": "#556b2f",
    "700": "#425324",
    "800": "#313e1a",
    "900": "#212a12",
    "950": "#111609",
  }
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function applyTheme(themeColor: string) {
  if (typeof window === "undefined") return;
  const palette = THEMES[themeColor] || THEMES.emerald;
  for (const [key, val] of Object.entries(palette)) {
    document.documentElement.style.setProperty(`--theme-${key}`, val);
  }
}

export function BrandingProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig: SystemConfig;
}) {
  const [config, setConfig] = useState<SystemConfig>(initialConfig);

  const updateConfig = (newConfig: SystemConfig) => {
    setConfig(newConfig);
    applyTheme(newConfig.themeColor);
  };

  useEffect(() => {
    applyTheme(config.themeColor);

    async function fetchLatestConfig() {
      try {
        const res = await fetch("/api/admin/config");
        const data = await res.json();
        if (data.success && data.config) {
          updateConfig(data.config);
        }
      } catch (err) {
        console.warn("Failed to fetch fresh branding config:", err);
      }
    }
    fetchLatestConfig();
  }, []);

  return (
    <BrandingContext.Provider value={{ config, updateConfig }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
