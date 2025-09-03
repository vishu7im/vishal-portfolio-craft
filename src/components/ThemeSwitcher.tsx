import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Palette, X, Paintbrush, TextCursor } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { usePortfolioData, AppTheme } from "@/services/dataService";

// Font options
const fonts = [
  { name: "Default", value: "system-ui, sans-serif" },
  { name: "Sans", value: "'Open Sans', sans-serif" },
  { name: "Serif", value: "'Playfair Display', serif" },
  { name: "Mono", value: "'Roboto Mono', monospace" },
];

// Color palette options
const colorPalettes = [
  {
    name: "Default",
    primary: "hsl(var(--primary))",
    accent: "hsl(var(--accent))",
  },
  { name: "Ocean", primary: "#0ea5e9", accent: "#22d3ee" },
  { name: "Forest", primary: "#10b981", accent: "#84cc16" },
  { name: "Sunset", primary: "#f97316", accent: "#f59e0b" },
  { name: "Berry", primary: "#8b5cf6", accent: "#d946ef" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentFont, setCurrentFont] = useState(fonts[0]);

  const [savedTheme] = usePortfolioData<AppTheme | undefined>("theme");

  useEffect(() => {
    // Apply saved theme if available
    if (savedTheme) {
      // Apply font
      document.documentElement.style.setProperty(
        "--font-family",
        savedTheme.fontFamily
      );

      // Find and set current font
      const foundFont = fonts.find((f) => f.value === savedTheme.fontFamily);
      if (foundFont) {
        setCurrentFont(foundFont);
      }
    }
  }, [savedTheme]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const changeFont = (font: (typeof fonts)[0]) => {
    setCurrentFont(font);
    document.documentElement.style.setProperty("--font-family", font.value);
  };

  return (
    <>
      {/* Mobile theme switcher */}
      <div className="fixed bottom-6 right-6 z-[100] md:hidden">
        <Button
          onClick={toggleOpen}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full gradient-border bg-background/90 backdrop-blur-md shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <Palette size={20} className="rotate-0 scale-100 transition-all text-primary" />
          )}
        </Button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-slide-in">
            <Button
              size="icon"
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="h-10 w-10 rounded-full"
            >
              <Moon size={18} />
            </Button>
            <Button
              size="icon"
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="h-10 w-10 rounded-full"
            >
              <Sun size={18} />
            </Button>
            <Button
              size="icon"
              variant={theme === "cyberpunk" ? "default" : "outline"}
              onClick={() => setTheme("cyberpunk")}
              className="h-10 w-10 rounded-full bg-cyber-primary text-black"
            >
              <span className="text-xs font-bold">CP</span>
            </Button>
            <Button
              size="icon"
              variant={theme === "retro" ? "default" : "outline"}
              onClick={() => setTheme("retro")}
              className="h-10 w-10 rounded-full text-primary"
            >
              <span className="text-xs font-bold">RE</span>
            </Button>
          </div>
        )}
      </div>

      {/* Desktop theme switcher */}
      <div className="fixed bottom-6 right-6 z-[100] hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full gradient-border bg-background/90 backdrop-blur-md shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300"
            >
              <Palette size={20} className="text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-fade-in">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="flex items-center">
              <Moon size={16} className="mr-2" /> Theme
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={`cursor-pointer ${theme === "dark" ? "bg-accent/20" : ""
                }`}
            >
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={`cursor-pointer ${theme === "light" ? "bg-accent/20" : ""
                }`}
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("cyberpunk")}
              className={`cursor-pointer ${theme === "cyberpunk" ? "bg-accent/20" : ""
                }`}
            >
              Cyberpunk
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("retro")}
              className={`cursor-pointer ${theme === "retro" ? "bg-accent/20" : ""
                }`}
            >
              Retro
            </DropdownMenuItem>


          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
