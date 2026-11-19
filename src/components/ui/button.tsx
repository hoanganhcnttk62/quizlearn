import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold border-2 border-border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-neo-yellow text-neo-ink shadow-neo-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        destructive:
          "bg-neo-coral text-neo-ink shadow-neo-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        outline:
          "bg-card text-foreground shadow-neo-xs hover:bg-neo-yellow hover:text-neo-ink hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "bg-neo-blue text-neo-ink shadow-neo-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        accent:
          "bg-neo-mint text-neo-ink shadow-neo-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        pink:
          "bg-neo-pink text-neo-ink shadow-neo-sm hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        ghost:
          "border-transparent shadow-none hover:border-border hover:bg-muted hover:shadow-neo-xs active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        link: "border-transparent shadow-none text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
