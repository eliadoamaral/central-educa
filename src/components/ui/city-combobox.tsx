import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CityOption {
  value: string;
  label: string;
}

interface CityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  cities: CityOption[];
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function CityCombobox({
  value,
  onValueChange,
  cities,
  disabled = false,
  isLoading = false,
  placeholder = "Selecione a cidade",
  icon,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCity = cities.find((city) => city.value === value);

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          {icon}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors h-10",
              icon && "pl-10",
              !value && "text-muted-foreground"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando cidades...
              </span>
            ) : selectedCity ? (
              selectedCity.label
            ) : disabled ? (
              "Selecione o estado primeiro"
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cidade..." />
          <CommandList>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {cities.map((city) => (
                <CommandItem
                  key={city.value}
                  value={city.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </div>
  );
}
