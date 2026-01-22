import { useMemo } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilterOption {
  value: string;
  label: string;
}

export interface LeadFiltersState {
  courses: string[];
  sources: string[];
  funnelStages: string[];
  scClient: "all" | "yes" | "no";
  states: string[];
  cities: string[];
  dateFrom: string;
  dateTo: string;
}

interface LeadFiltersProps {
  filters: LeadFiltersState;
  onFiltersChange: (filters: LeadFiltersState) => void;
  courseOptions: FilterOption[];
  sourceOptions: FilterOption[];
  funnelStageOptions: FilterOption[];
  stateOptions: string[];
  cityOptions: string[];
}

export function LeadFilters({
  filters,
  onFiltersChange,
  courseOptions,
  sourceOptions,
  funnelStageOptions,
  stateOptions,
  cityOptions,
}: LeadFiltersProps) {
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.courses.length;
    count += filters.sources.length;
    count += filters.funnelStages.length;
    count += filters.scClient !== "all" ? 1 : 0;
    count += filters.states.length;
    count += filters.cities.length;
    count += filters.dateFrom ? 1 : 0;
    count += filters.dateTo ? 1 : 0;
    return count;
  }, [filters]);

  const toggleArrayFilter = (key: keyof LeadFiltersState, value: string) => {
    const current = filters[key] as string[];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      courses: [],
      sources: [],
      funnelStages: [],
      scClient: "all",
      states: [],
      cities: [],
      dateFrom: "",
      dateTo: "",
    });
  };

  const removeFilter = (key: keyof LeadFiltersState, value?: string) => {
    if (key === "scClient") {
      onFiltersChange({ ...filters, scClient: "all" });
    } else if (key === "dateFrom" || key === "dateTo") {
      onFiltersChange({ ...filters, [key]: "" });
    } else if (value) {
      const current = filters[key] as string[];
      onFiltersChange({ ...filters, [key]: current.filter((v) => v !== value) });
    }
  };

  const getFilterLabel = (key: string, value: string): string => {
    switch (key) {
      case "courses":
        return courseOptions.find((c) => c.value === value)?.label || value;
      case "sources":
        return sourceOptions.find((s) => s.value === value)?.label || value;
      case "funnelStages":
        return funnelStageOptions.find((f) => f.value === value)?.label || value;
      default:
        return value;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={activeFiltersCount > 0 ? "default" : "outline"}
          size="sm"
          className="h-10 gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-5 px-1.5 text-xs font-medium bg-background text-foreground"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-5 pr-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={clearAllFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar tudo
                </Button>
              )}
            </div>

            {/* Funnel Stage Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Etapa do Funil</Label>
              <div className="grid grid-cols-2 gap-2">
                {funnelStageOptions.map((stage) => (
                  <label
                    key={stage.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={filters.funnelStages.includes(stage.value)}
                      onCheckedChange={() => toggleArrayFilter("funnelStages", stage.value)}
                    />
                    <span className="text-sm">{stage.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Course Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Curso</Label>
              <div className="space-y-1">
                {courseOptions.map((course) => (
                  <label
                    key={course.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={filters.courses.includes(course.value)}
                      onCheckedChange={() => toggleArrayFilter("courses", course.value)}
                    />
                    <span className="text-sm">{course.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Origem do Lead</Label>
              <div className="grid grid-cols-2 gap-1">
                {sourceOptions.map((source) => (
                  <label
                    key={source.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={filters.sources.includes(source.value)}
                      onCheckedChange={() => toggleArrayFilter("sources", source.value)}
                    />
                    <span className="text-sm truncate">{source.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* S&C Client Filter */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Cliente S&C</Label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Todos" },
                  { value: "yes", label: "Clientes S&C" },
                  { value: "no", label: "Não Clientes" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={filters.scClient === option.value}
                      onCheckedChange={() =>
                        onFiltersChange({ ...filters, scClient: option.value as "all" | "yes" | "no" })
                      }
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filters */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Localização</Label>
              <div className="grid grid-cols-2 gap-2">
                {/* States */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Estado</span>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {stateOptions.length > 0 ? (
                      stateOptions.map((state) => (
                        <label
                          key={state}
                          className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={filters.states.includes(state)}
                            onCheckedChange={() => toggleArrayFilter("states", state)}
                          />
                          <span className="text-sm">{state}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">Nenhum estado disponível</p>
                    )}
                  </ScrollArea>
                </div>
                {/* Cities */}
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Cidade</span>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {cityOptions.length > 0 ? (
                      cityOptions.map((city) => (
                        <label
                          key={city}
                          className="flex items-center gap-2 px-1 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={filters.cities.includes(city)}
                            onCheckedChange={() => toggleArrayFilter("cities", city)}
                          />
                          <span className="text-sm truncate">{city}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-2">Nenhuma cidade disponível</p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Data de Criação</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">De</span>
                  <DateInput
                    value={filters.dateFrom}
                    onChange={(value) => onFiltersChange({ ...filters, dateFrom: value })}
                    showValidation={false}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Até</span>
                  <DateInput
                    value={filters.dateTo}
                    onChange={(value) => onFiltersChange({ ...filters, dateTo: value })}
                    showValidation={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
