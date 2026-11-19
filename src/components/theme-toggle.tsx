"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-border bg-neo-yellow text-neo-ink shadow-neo-xs transition-all duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:outline-none"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 stroke-[2.5]" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 stroke-[2.5]" />
    </button>
  );
}
