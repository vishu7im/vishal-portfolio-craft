import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "cyberpunk" | "retro";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themes = ["dark", "light", "cyberpunk", "retro"];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(

    "dark"

    // 'retro' 
  );

  useEffect(() => {
    // Update class and save to localStorage when theme changes
    const root = document.documentElement;

    // First remove all theme classes
    root.classList.remove("light", "dark", "theme-cyberpunk", "theme-retro");

    // Then add the current theme class
    if (theme === "light" || theme === "dark") {
      root.classList.add(theme);
    } else {
      root.classList.add("dark", `theme-${theme}`);
    }

    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
