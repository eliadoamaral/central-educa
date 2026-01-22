import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import { DashboardFilters, ParticipantData } from "@/types/dashboard";
import { getUniqueValues } from "@/utils/csvParser";
import { applyCustomOrder } from "@/utils/filterOrdering";
interface DashboardSidebarProps {
  participants: ParticipantData[];
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}
export const DashboardSidebar = ({
  participants,
  filters,
  onFiltersChange
}: DashboardSidebarProps) => {
  const [openSections, setOpenSections] = useState({
    region: true,
    gender: true,
    age: true,
    isClient: true,
    successionLevel: true,
    experience: true
  });
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const handleFilterChange = (category: keyof DashboardFilters, value: string, checked: boolean) => {
    const currentFilters = [...filters[category]];
    if (checked) {
      currentFilters.push(value);
    } else {
      const index = currentFilters.indexOf(value);
      if (index > -1) {
        currentFilters.splice(index, 1);
      }
    }
    onFiltersChange({
      ...filters,
      [category]: currentFilters
    });
  };
  const clearFilters = () => {
    onFiltersChange({
      region: [],
      gender: [],
      age: [],
      isClient: [],
      successionLevel: [],
      experience: []
    });
  };
  const hasActiveFilters = Object.values(filters).some(filter => filter.length > 0);
  const regions = applyCustomOrder(getUniqueValues(participants, 'region'), 'region');
  const genders = getUniqueValues(participants, 'gender');
  const ages = applyCustomOrder(getUniqueValues(participants, 'age'), 'age');
  const clientStatus = getUniqueValues(participants, 'isClient');
  const successionLevels = applyCustomOrder(getUniqueValues(participants, 'successionLevel').map(level => {
    if (level.includes('Iniciante')) return 'Iniciante';
    if (level.includes('Intermediario') || level.includes('Intermediário')) return 'Intermediário';
    if (level.includes('Avancado') || level.includes('Avançado')) return 'Avançado';
    return level;
  }), 'successionLevel');
  const experiences = applyCustomOrder(getUniqueValues(participants, 'experience'), 'experience');
  const sectionEmojis: {
    [key: string]: string;
  } = {
    region: "🌎",
    gender: "👤",
    age: "📅",
    isClient: "🤝",
    successionLevel: "📈",
    experience: "⭐"
  };
  const FilterSection = ({
    title,
    options,
    category,
    isOpen
  }: {
    title: string;
    options: string[];
    category: keyof DashboardFilters;
    isOpen: boolean;
  }) => <Collapsible open={isOpen} onOpenChange={() => toggleSection(category as keyof typeof openSections)}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-3 md:p-4 h-auto hover:bg-muted transition-colors duration-200">
          <span className="font-medium text-sm text-foreground">{title}</span>
          <ChevronDown className={`h-4 w-4 transition-all duration-200 text-muted-foreground ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 md:px-4 pb-3 md:pb-4 pt-0">
        {options.map((option, index) => <div key={option} className="flex items-center space-x-2 md:space-x-3 group hover:bg-primary/5 rounded-lg p-2 transition-colors duration-200" style={{
        animationDelay: `${index * 50}ms`
      }}>
            <Checkbox id={`${category}-${option}`} checked={filters[category].includes(option)} onCheckedChange={checked => handleFilterChange(category, option, checked as boolean)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-glow transition-all duration-200" />
            <Label htmlFor={`${category}-${option}`} className="text-sm text-foreground cursor-pointer flex-1">
              {option}
            </Label>
          </div>)}
      </CollapsibleContent>
    </Collapsible>;
  return <Card className="w-full md:w-80 h-fit shadow-soft bg-card animate-slide-up hover:scale-100 hover:shadow-soft">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base md:text-lg text-foreground">Filtros</h2>
            </div>
          </div>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2 h-8 md:h-9 text-xs hover:bg-destructive/10 hover:text-destructive transition-colors duration-200">
              <X className="h-3 w-3" />
              Limpar
            </Button>}
        </div>
      </div>
      
      <div className="divide-y divide-border">
        <FilterSection title="Região" options={regions} category="region" isOpen={openSections.region} />
        <FilterSection title="Gênero" options={genders} category="gender" isOpen={openSections.gender} />
        <FilterSection title="Idade" options={ages} category="age" isOpen={openSections.age} />
        <FilterSection title="Cliente S&C" options={clientStatus} category="isClient" isOpen={openSections.isClient} />
        <FilterSection title="Nível de Sucessão" options={successionLevels} category="successionLevel" isOpen={openSections.successionLevel} />
        <FilterSection title="Experiência no Agro" options={experiences} category="experience" isOpen={openSections.experience} />
      </div>
    </Card>;
};