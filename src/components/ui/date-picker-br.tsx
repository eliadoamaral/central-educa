import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DatePickerBRProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

export function DatePickerBR({
  value,
  onChange,
  placeholder = "Selecione a data",
  disabled = false,
  className,
  fromYear = 1920,
  toYear = new Date().getFullYear() + 10,
}: DatePickerBRProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  // Convert value to Date if it's a string
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    // Try to parse ISO string (yyyy-MM-dd)
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  // Sync input value with date value
  React.useEffect(() => {
    if (dateValue) {
      setInputValue(format(dateValue, "dd/MM/yyyy"));
    } else {
      setInputValue("");
    }
  }, [dateValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/\D/g, "");
    
    // Auto-format as user types
    if (newValue.length >= 2) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2);
    }
    if (newValue.length >= 5) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5);
    }
    if (newValue.length > 10) {
      newValue = newValue.slice(0, 10);
    }
    
    setInputValue(newValue);

    // Try to parse complete date
    if (newValue.length === 10) {
      const parsed = parse(newValue, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      const parsed = parse(inputValue, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        onChange(parsed);
      } else {
        // Reset to previous valid value
        if (dateValue) {
          setInputValue(format(dateValue, "dd/MM/yyyy"));
        } else {
          setInputValue("");
        }
      }
    } else if (inputValue.length > 0 && inputValue.length < 10) {
      // Incomplete date, reset
      if (dateValue) {
        setInputValue(format(dateValue, "dd/MM/yyyy"));
      } else {
        setInputValue("");
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
            type="button"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
            className="pointer-events-auto"
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
