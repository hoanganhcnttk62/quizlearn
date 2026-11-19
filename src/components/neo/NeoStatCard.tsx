"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type NeoTone = "yellow" | "blue" | "mint" | "coral" | "orange" | "pink" | "default";

const iconBgMap: Record<NeoTone, string> = {
  yellow: "bg-neo-yellow text-neo-ink",
  blue: "bg-neo-blue text-neo-ink",
  mint: "bg-neo-mint text-neo-ink",
  coral: "bg-neo-coral text-neo-ink",
  orange: "bg-neo-orange text-neo-ink",
  pink: "bg-neo-pink text-neo-ink",
  default: "bg-muted text-foreground",
};

interface NeoStatCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon: React.ReactNode;
  tone?: NeoTone;
  cardTone?: NeoTone;
  className?: string;
}

export function NeoStatCard({
  title,
  value,
  description,
  icon,
  tone = "yellow",
  cardTone = "default",
  className,
}: NeoStatCardProps) {
  return (
    <Card
      tone={cardTone}
      className={cn(
        "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-neo-lg transition-all",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-extrabold tracking-wider uppercase text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "w-10 h-10 rounded-lg border-2 border-border shadow-neo-xs flex items-center justify-center",
            iconBgMap[tone]
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tight text-foreground">
          {value}
        </div>
        {description && (
          <p className="text-xs font-semibold text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
