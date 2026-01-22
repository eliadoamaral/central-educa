import * as React from "react";
import { cn } from "@/lib/utils";

// Date mask: dd/mm/yyyy
export const formatDateBR = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 8);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

// Convert dd/mm/yyyy to yyyy-mm-dd (ISO format for database)
export const dateToISO = (dateBR: string): string => {
  const numbers = dateBR.replace(/\D/g, "");
  if (numbers.length !== 8) return "";
  
  const day = numbers.slice(0, 2);
  const month = numbers.slice(2, 4);
  const year = numbers.slice(4, 8);
  
  return `${year}-${month}-${day}`;
};

// Convert yyyy-mm-dd (ISO format) to dd/mm/yyyy
export const isoToDateBR = (isoDate: string): string => {
  if (!isoDate) return "";
  
  const parts = isoDate.split("-");
  if (parts.length !== 3) return "";
  
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

// Validate date
export const validateDateBR = (dateBR: string): boolean => {
  const numbers = dateBR.replace(/\D/g, "");
  if (numbers.length !== 8) return false;
  
  const day = parseInt(numbers.slice(0, 2), 10);
  const month = parseInt(numbers.slice(2, 4), 10);
  const year = parseInt(numbers.slice(4, 8), 10);
  
  // Basic validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Days per month validation
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Leap year check
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }
  
  if (day > daysInMonth[month - 1]) return false;
  
  return true;
};

// Check if date is complete (8 digits)
export const isDateComplete = (dateBR: string): boolean => {
  return dateBR.replace(/\D/g, "").length === 8;
};

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string; // ISO format (yyyy-mm-dd) for database compatibility
  onChange: (isoValue: string) => void;
  showValidation?: boolean;
  icon?: React.ReactNode;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, showValidation = true, icon, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false);
    const [displayValue, setDisplayValue] = React.useState(() => isoToDateBR(value));
    
    // Sync displayValue when external value changes
    React.useEffect(() => {
      const converted = isoToDateBR(value);
      if (converted !== displayValue && value) {
        setDisplayValue(converted);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatDateBR(e.target.value);
      setDisplayValue(formatted);
      
      // Only update parent with ISO format when date is complete
      if (isDateComplete(formatted)) {
        const isoDate = dateToISO(formatted);
        onChange(isoDate);
      } else if (formatted === "") {
        onChange("");
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      
      // Update parent with current value on blur
      if (isDateComplete(displayValue)) {
        const isoDate = dateToISO(displayValue);
        onChange(isoDate);
      } else if (displayValue === "") {
        onChange("");
      }
      
      props.onBlur?.(e);
    };

    // Only show error if touched, has content, is complete but invalid
    const hasContent = displayValue.replace(/\D/g, "").length > 0;
    const complete = isDateComplete(displayValue);
    const isValid = validateDateBR(displayValue);
    const showError = showValidation && touched && hasContent && complete && !isValid;
    const showIncomplete = showValidation && touched && hasContent && !complete;

    const errorMessage = showIncomplete ? "Data incompleta" : showError ? "Data inválida" : null;

    const inputElement = (
      <input
        type="text"
        inputMode="numeric"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          icon ? "pl-10 pr-3" : "px-3",
          (showError || showIncomplete) && "border-destructive focus-visible:border-destructive",
          className
        )}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="dd/mm/aaaa"
        maxLength={10}
        {...props}
      />
    );

    return (
      <div className="space-y-1">
        {icon ? (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
            {inputElement}
          </div>
        ) : (
          inputElement
        )}
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";
