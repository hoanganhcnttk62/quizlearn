"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  variant?: "dropdown" | "button" | "pill";
  className?: string;
}

export function LanguageToggle({ variant = "dropdown", className }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg p-0.5 bg-card border-2 border-border shadow-neo-xs text-xs font-extrabold select-none",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setLanguage("vi")}
          className={cn(
            "px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border-2",
            language === "vi"
              ? "bg-neo-yellow text-neo-ink border-border shadow-neo-xs"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span>🇻🇳</span>
          <span>VI</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={cn(
            "px-2.5 py-1 rounded-md transition-all flex items-center gap-1 border-2",
            language === "en"
              ? "bg-neo-blue text-neo-ink border-border shadow-neo-xs"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className={cn("h-9 px-2.5 flex items-center gap-1.5 font-extrabold rounded-lg", className)}
        title={t("header.selectLanguage")}
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-black uppercase">{language}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 px-3 gap-1.5 rounded-lg font-extrabold", className)}
          aria-label={t("header.selectLanguage")}
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-wider">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => setLanguage("vi")}
          className={cn("flex items-center justify-between", language === "vi" && "bg-neo-yellow/40 font-extrabold")}
        >
          <span className="flex items-center gap-2">
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </span>
          {language === "vi" && <Check className="h-4 w-4 stroke-[3]" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={cn("flex items-center justify-between", language === "en" && "bg-neo-blue/40 font-extrabold")}
        >
          <span className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English</span>
          </span>
          {language === "en" && <Check className="h-4 w-4 stroke-[3]" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
