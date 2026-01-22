import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Popular email domains for autocomplete
const popularDomains = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "globo.com",
  "ig.com.br",
  "msn.com",
  "protonmail.com",
  "zoho.com"
];

// Email format validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Basic domain validation (has at least one dot after @)
const domainRegex = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email: string): { isValid: boolean; error: string | null } => {
  if (!email) return { isValid: true, error: null };
  
  // Check basic format
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Formato de email inválido" };
  }
  
  // Check domain has proper structure
  if (!domainRegex.test(email)) {
    return { isValid: false, error: "Domínio de email inválido" };
  }
  
  return { isValid: true, error: null };
};

export const isEmailComplete = (email: string): boolean => {
  return email.includes("@") && domainRegex.test(email);
};

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
  icon?: React.ReactNode;
  hasWarning?: boolean;
  isLoading?: boolean;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, value, onChange, showValidation = true, icon, hasWarning, isLoading, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Generate suggestions based on current input
    React.useEffect(() => {
      if (value.includes("@")) {
        const [localPart, domainPart] = value.split("@");
        
        if (localPart && domainPart !== undefined) {
          // Filter domains that start with what user typed after @
          const filtered = popularDomains
            .filter(domain => domain.toLowerCase().startsWith(domainPart.toLowerCase()))
            .map(domain => `${localPart}@${domain}`)
            .slice(0, 5);
          
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0 && domainPart.length < 15);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
    }, [value]);

    // Handle click outside to close suggestions
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      // Delay hiding suggestions to allow click
      setTimeout(() => setShowSuggestions(false), 150);
      props.onBlur?.(e);
    };

    const handleFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onChange(suggestions[selectedIndex]);
            setShowSuggestions(false);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
        case "Tab":
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onChange(suggestions[selectedIndex]);
          }
          setShowSuggestions(false);
          break;
      }
    };

    const selectSuggestion = (suggestion: string) => {
      onChange(suggestion);
      setShowSuggestions(false);
      inputRef.current?.focus();
    };

    // Validation
    const validation = validateEmail(value);
    const hasContent = value.length > 0;
    const complete = isEmailComplete(value);
    const showError = showValidation && touched && hasContent && complete && !validation.isValid;
    const showIncomplete = showValidation && touched && hasContent && value.includes("@") && !complete;

    const errorMessage = showIncomplete ? "Email incompleto" : showError ? validation.error : null;
    
    const warningClass = hasWarning && !showError && !showIncomplete ? "border-amber-500 focus-visible:border-amber-500" : "";

    const inputElement = (
      <input
        type="email"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          icon ? "pl-10" : "pl-3",
          isLoading ? "pr-10" : "pr-3",
          (showError || showIncomplete) && "border-destructive focus-visible:border-destructive",
          warningClass,
          className
        )}
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        {...props}
      />
    );

    return (
      <div ref={containerRef} className="relative space-y-1">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}
          {inputElement}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                  index === selectedIndex && "bg-accent text-accent-foreground"
                )}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);
EmailInput.displayName = "EmailInput";
