"use client";

import React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage, Language } from "@/i18n/LanguageContext";
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
          "inline-flex items-center rounded-full p-0.5 bg-muted/80 border border-border text-xs font-semibold select-none",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setLanguage("vi")}
          className={cn(
            "px-2.5 py-1 rounded-full transition-all flex items-center gap-1",
            language === "vi"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>🇻🇳</span>
          <span>VI</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={cn(
            "px-2.5 py-1 rounded-full transition-all flex items-center gap-1",
            language === "en"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
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
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className={cn("h-9 px-2.5 flex items-center gap-1.5 font-medium rounded-full", className)}
        title={t("header.selectLanguage")}
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-bold uppercase">{language}</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-2.5 gap-1.5 rounded-full border-border bg-background/80 hover:bg-muted font-medium transition-colors",
            className
          )}
          aria-label={t("header.selectLanguage")}
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setLanguage("vi")}
          className={cn("flex items-center justify-between cursor-pointer", language === "vi" && "font-semibold text-primary")}
        >
          <span className="flex items-center gap-2">
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </span>
          {language === "vi" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={cn("flex items-center justify-between cursor-pointer", language === "en" && "font-semibold text-primary")}
        >
          <span className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>English</span>
          </span>
          {language === "en" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

