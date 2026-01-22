import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  hasWarning?: boolean;
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, hasWarning, isLoading, ...props }, ref) => {
    const warningClass = hasWarning ? "border-amber-500 focus-visible:border-amber-500" : "";
    
    if (icon || isLoading) {
      return (
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
              icon ? "pl-10" : "pl-3",
              isLoading ? "pr-10" : "pr-3",
              warningClass,
              className,
            )}
            ref={ref}
            {...props}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          warningClass,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
