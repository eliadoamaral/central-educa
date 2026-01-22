import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardFilters } from "@/types/dashboard";

interface ActiveFiltersBarProps {
  filters: DashboardFilters;
  onRemoveFilter: (category: keyof DashboardFilters, value: string) => void;
  onClearAll: () => void;
}

export const ActiveFiltersBar = ({ filters, onRemoveFilter, onClearAll }: ActiveFiltersBarProps) => {
  const activeFilters: { category: keyof DashboardFilters; value: string }[] = [];
  
  Object.entries(filters).forEach(([category, values]) => {
    values.forEach((value) => {
      activeFilters.push({ category: category as keyof DashboardFilters, value });
    });
  });

  if (activeFilters.length === 0) return null;

  const categoryLabels: Record<keyof DashboardFilters, string> = {
    region: "Região",
    gender: "Gênero",
    age: "Idade",
    isClient: "Cliente",
    successionLevel: "Nível",
    experience: "Experiência"
  };

  return (
    <div className="sticky top-[68px] z-40 bg-card border-b border-border shadow-soft animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Filtros:</span>
          {activeFilters.map(({ category, value }) => (
            <Badge
              key={`${category}-${value}`}
              className="gap-1 cursor-pointer bg-primary/10 text-primary border border-primary/20 hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-200"
              onClick={() => onRemoveFilter(category, value)}
            >
              <span className="text-xs">{categoryLabels[category]}:</span>
              <span>{value}</span>
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            Limpar tudo
          </Button>
        </div>
      </div>
    </div>
  );
};
