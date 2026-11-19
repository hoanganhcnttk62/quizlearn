"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NeoTone } from "./NeoStatCard";

const iconBgMap: Record<NeoTone, string> = {
  yellow: "bg-neo-yellow text-neo-ink",
  blue: "bg-neo-blue text-neo-ink",
  mint: "bg-neo-mint text-neo-ink",
  coral: "bg-neo-coral text-neo-ink",
  orange: "bg-neo-orange text-neo-ink",
  pink: "bg-neo-pink text-neo-ink",
  default: "bg-card text-foreground",
};

interface NeoPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "yellow" | "blue" | "mint" | "coral" | "orange" | "pink" | "neutral";
  icon?: React.ReactNode;
  iconTone?: NeoTone;
  actions?: React.ReactNode;
  className?: string;
}

export function NeoPageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = "blue",
  icon,
  iconTone = "yellow",
  actions,
  className,
}: NeoPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-border",
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          {icon && (
            <div
              className={cn(
                "w-11 h-11 rounded-xl border-2 border-border shadow-neo-xs flex items-center justify-center flex-shrink-0",
                iconBgMap[iconTone]
              )}
            >
              {icon}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        {subtitle && (
          <p className="text-sm font-medium text-muted-foreground mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}
