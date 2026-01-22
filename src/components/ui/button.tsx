import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover hover:shadow-medium transition-all duration-300",
        action: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover hover:shadow-medium transition-all duration-300 font-semibold btn-premium",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-medium",
        outline: "border border-border bg-background hover:bg-muted hover:border-primary shadow-soft",
        secondary: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary-hover hover:shadow-medium",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "bg-primary/10 backdrop-blur-md hover:bg-primary/20 text-primary border-2 border-primary/30 font-semibold transition-all duration-300",
        glass: "bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 font-medium transition-all duration-300",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
