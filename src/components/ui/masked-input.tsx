import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// CPF mask: 000.000.000-00
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

// Phone mask: (00) 00000-0000 or (00) 0000-0000
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : "";
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

// Validate CPF check digits
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");
  
  // Must have 11 digits
  if (numbers.length !== 11) return false;
  
  // Check for known invalid CPFs (all same digits)
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

// Validate phone number (must have 10 or 11 digits)
export const validatePhone = (phone: string): boolean => {
  const numbers = phone.replace(/\D/g, "");
  
  // Brazilian phone: 10 digits (landline) or 11 digits (mobile)
  if (numbers.length < 10 || numbers.length > 11) return false;
  
  // DDD must be between 11-99
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Mobile phones (11 digits) must start with 9
  if (numbers.length === 11 && numbers[2] !== '9') return false;
  
  return true;
};

// Check if field is empty or has content
const isEmpty = (value: string): boolean => {
  return value.replace(/\D/g, "").length === 0;
};

// Check if CPF is complete (11 digits)
export const isCPFComplete = (cpf: string): boolean => {
  return cpf.replace(/\D/g, "").length === 11;
};

// Check if phone is complete (10-11 digits)
export const isPhoneComplete = (phone: string): boolean => {
  const len = phone.replace(/\D/g, "").length;
  return len >= 10 && len <= 11;
};

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: "cpf" | "phone";
  value: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
  icon?: React.ReactNode;
  hasWarning?: boolean;
  isLoading?: boolean;
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, value, onChange, showValidation = true, icon, hasWarning, isLoading, ...props }, ref) => {
    const [touched, setTouched] = React.useState(false);
    
    const formatValue = mask === "cpf" ? formatCPF : formatPhone;
    const validateValue = mask === "cpf" ? validateCPF : validatePhone;
    const isComplete = mask === "cpf" ? isCPFComplete : isPhoneComplete;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatValue(e.target.value);
      onChange(formatted);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      props.onBlur?.(e);
    };

    // Only show error if touched, has content, is complete but invalid
    const hasContent = !isEmpty(value);
    const complete = isComplete(value);
    const isValid = validateValue(value);
    const showError = showValidation && touched && hasContent && complete && !isValid;
    const showIncomplete = showValidation && touched && hasContent && !complete;

    const errorMessage = mask === "cpf" 
      ? (showIncomplete ? "CPF incompleto" : showError ? "CPF inválido" : null)
      : (showIncomplete ? "Telefone incompleto" : showError ? "Telefone inválido" : null);

    const warningClass = hasWarning && !showError && !showIncomplete ? "border-amber-500 focus-visible:border-amber-500" : "";

    const inputElement = (
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          icon ? "pl-10" : "pl-3",
          isLoading ? "pr-10" : "pr-3",
          (showError || showIncomplete) && "border-destructive focus-visible:border-destructive",
          warningClass,
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );

    return (
      <div className="space-y-1">
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
        {errorMessage && (
          <p className="text-xs text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);
MaskedInput.displayName = "MaskedInput";

// Specific exports for convenience
export const CPFInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => <MaskedInput ref={ref} mask="cpf" {...props} />);
CPFInput.displayName = "CPFInput";

export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<MaskedInputProps, "mask">
>((props, ref) => <MaskedInput ref={ref} mask="phone" {...props} />);
PhoneInput.displayName = "PhoneInput";

export { MaskedInput };
