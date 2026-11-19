import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border-2 border-border px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide shadow-neo-xs transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neo-yellow text-neo-ink",
        yellow: "bg-neo-yellow text-neo-ink",
        blue: "bg-neo-blue text-neo-ink",
        mint: "bg-neo-mint text-neo-ink",
        coral: "bg-neo-coral text-neo-ink",
        orange: "bg-neo-orange text-neo-ink",
        pink: "bg-neo-pink text-neo-ink",
        neutral: "bg-muted text-foreground",
        outline: "bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
