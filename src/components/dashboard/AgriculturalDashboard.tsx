import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { Card } from "@/components/ui/card";
import { FileText, Filter, ChevronDown, ChevronUp, Download, Eye, ArrowLeft, ArrowUp, ArrowDown, ArrowUpDown, Search, Target, Lightbulb, Sparkles } from "lucide-react";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DashboardSidebar } from "./DashboardSidebar";
import { OverviewCards } from "./OverviewCards";
import { ChartCard } from "./ChartCard";
import { DonutChart } from "./DonutChart";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { VerticalBarChart } from "./VerticalBarChart";
import { TopicsAnalysisCard } from "./TextAnalysisCard";
import { SuggestedTopicsCard } from "./SuggestedTopicsCard";
import { InsightsCard } from "./InsightsCard";
import { ProspectingDrawer } from "./ProspectingDrawer";
import { ActiveFiltersBar } from "./ActiveFiltersBar";
import { MetaInfo } from "./MetaInfo";
import { BrazilMap } from "./BrazilMap";
import { ParticipantData, DashboardFilters } from "@/types/dashboard";
import { parseCSVData, calculateChartData, splitMultipleChoices, calculateCityDataWithState } from "@/utils/csvParser";
import { AIInsightsDrawer } from "./AIInsightsDrawer";
import { AIInsightsContext } from "@/types/ai-insights";
export const AgriculturalDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  usePageView(location.pathname);
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantData[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    region: [],
    gender: [],
    age: [],
    isClient: [],
    successionLevel: [],
    experience: []
  });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [participantsListExpanded, setParticipantsListExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showProspectsOnly, setShowProspectsOnly] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/data/sucessores-agro-data.csv?t=${Date.now()}`);
        const csvText = await response.text();
        const data = parseCSVData(csvText);
        setParticipants(data);
        setFilteredParticipants(data);
        setLoading(false);
        toast.success("Dados carregados com sucesso!");
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error("Erro ao carregar os dados");
        setLoading(false);
      }
    };
    loadData();
  }, []);
  useEffect(() => {
    let filtered = participants;
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(participant => {
          const field = key as keyof ParticipantData;
          const participantValue = participant[field] as string;
          if (field === 'profession' || field === 'activities' || field === 'objectives' || field === 'interests') {
            const multipleValues = splitMultipleChoices(participantValue);
            return values.some(filterValue => multipleValues.includes(filterValue));
          } else if (field === 'isClient') {
            // Handle simplified client status filtering - use rigorous check
            const lowercaseValue = participantValue.toLowerCase().trim();
            const isRealClient = lowercaseValue === 'sim, ja sou cliente' || lowercaseValue === 'sim, já sou cliente' || lowercaseValue === 'sim';
            const simplified = isRealClient ? 'Sim' : 'Não';
            return values.includes(simplified);
          } else if (field === 'successionLevel') {
            // Handle succession level mapping
            let mappedLevel = participantValue;
            if (participantValue.includes('Iniciante')) mappedLevel = 'Iniciante'; else if (participantValue.includes('Intermediario') || participantValue.includes('Intermediário')) mappedLevel = 'Intermediário'; else if (participantValue.includes('Avancado') || participantValue.includes('Avançado')) mappedLevel = 'Avançado';
            return values.includes(mappedLevel);
          }
          return values.includes(participantValue);
        });
      }
    });
    setFilteredParticipants(filtered);
  }, [filters, participants]);
  const calculateKPIStats = () => {
    const total = filteredParticipants.length;

    // FIXED VALUES - Hardcoded as per user request
    const maleCount = 33;
    const femaleCount = 26;
    const clientCount = 43;
    const nonClientCount = 16;

    // Age analysis - find most common age range
    const ageCounts = filteredParticipants.reduce((acc, p) => {
      acc[p.age] = (acc[p.age] || 0) + 1;
      return acc;
    }, {} as {
      [key: string]: number;
    });
    const topAge = Object.entries(ageCounts).sort(([, a], [, b]) => b - a)[0];
    const topAgeRange = topAge?.[0] || "N/A";
    const topAgeCount = topAge?.[1] || 0;
    return {
      totalParticipants: total,
      maleCount,
      malePercentage: 56,
      // 33/59 = ~56%
      femaleCount,
      femalePercentage: 44,
      // 26/59 = ~44%
      topAgeRange,
      topAgeCount,
      topAgePercentage: total > 0 ? Math.round(topAgeCount / total * 100) : 0,
      clientCount,
      clientPercentage: 73,
      // 43/59 = ~73%
      nonClientCount,
      nonClientPercentage: 27 // 16/59 = ~27%
    };
  };
  const exportData = () => {
    const csvContent = [['Nome', 'Idade', 'Gênero', 'Região', 'Profissão', 'Experiência', 'Cliente S&C'], ...filteredParticipants.map(p => [p.name, p.age, p.gender, p.region, p.profession, p.experience, p.isClient])].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-sucessores-agro.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso!");
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="p-6 md:p-8 shadow-medium max-w-sm w-full">
        <div className="flex items-center gap-4">
          <img src={educasafrasLogo} alt="EducaSafras" className="h-8 w-8 animate-pulse" />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">Carregando Dashboard</h3>
            <p className="text-sm md:text-base text-muted-foreground">Processando dados dos participantes...</p>
          </div>
        </div>
      </Card>
    </div>;
  }
  const kpiStats = calculateKPIStats();
  const hasActiveFilters = Object.values(filters).some(filter => filter.length > 0);
  const regionData = calculateChartData(filteredParticipants, 'region');
  const ageData = calculateChartData(filteredParticipants, 'age');
  const genderData = calculateChartData(filteredParticipants, 'gender');

  // Override gender data with fixed values (base: 59) and filter out "-"
  const genderDataOverride = genderData.filter(item => item.name !== '-').map(item => {
    if (item.name === 'Masculino') return {
      ...item,
      value: 33,
      percentage: 56
    };
    if (item.name === 'Feminino') return {
      ...item,
      value: 26,
      percentage: 44
    };
    return item;
  });
  const clientData = calculateChartData(filteredParticipants, 'isClient');
  const experienceData = calculateChartData(filteredParticipants, 'experience').filter(item => item.name !== '-');
  const successionData = calculateChartData(filteredParticipants, 'successionLevel').filter(item => item.name !== '-');
  const cityData = calculateCityDataWithState(filteredParticipants).filter(item => item.name !== '-');
  const stateData = calculateChartData(filteredParticipants, 'state').filter(item => item.name !== '-');

  // Override specific values with fixed data
  const ageDataOverride = ageData.map(item => {
    if (item.name === '21 a 30 anos') return {
      ...item,
      value: 23,
      percentage: 42
    };
    if (item.name === '31 a 40 anos') return {
      ...item,
      value: 19,
      percentage: 35
    };
    if (item.name === '41 a 50 anos') return {
      ...item,
      value: 6,
      percentage: 11
    };
    if (item.name === 'Menos de 20 anos') return {
      ...item,
      value: 3,
      percentage: 5
    };
    if (item.name === '51 a 60 anos') return {
      ...item,
      value: 2,
      percentage: 4
    };
    if (item.name === 'Mais de 60 anos') return {
      ...item,
      value: 2,
      percentage: 4
    };
    return item;
  });
  const experienceDataOverride = experienceData.map(item => {
    if (item.name === 'Mais de 10 anos') return {
      ...item,
      value: 20,
      percentage: 36
    };
    if (item.name === '6 a 10 anos') return {
      ...item,
      value: 16,
      percentage: 29
    };
    if (item.name === '2 a 5 anos') return {
      ...item,
      value: 10,
      percentage: 18
    };
    if (item.name === 'Menos de 2 anos') return {
      ...item,
      value: 9,
      percentage: 16
    };
    return item;
  });
  const successionDataOverride = successionData.map(item => {
    if (item.name === 'Intermediario - Ja vivencio o processo na pratica' || item.name.includes('Intermediário')) return {
      ...item,
      value: 34,
      percentage: 62
    };
    if (item.name === 'Avancado - Ja atuo diretamente na Sucessão' || item.name.includes('Avançado')) return {
      ...item,
      value: 12,
      percentage: 22
    };
    if (item.name === 'Iniciante - Quero entender conceitos Básicos' || item.name.includes('Iniciante')) return {
      ...item,
      value: 9,
      percentage: 16
    };
    return item;
  });
  const stateDataOverride = stateData.map(item => {
    if (item.name === 'GO') return {
      ...item,
      value: 22
    };
    if (item.name === 'MT') return {
      ...item,
      value: 18
    };
    if (item.name === 'PR') return {
      ...item,
      value: 4
    };
    return item;
  });
  const professionData = calculateChartData(filteredParticipants, 'profession').filter(item => item.name !== '-');
  const professionDataOverride = professionData.map(item => {
    if (item.name === 'Sucessor Familiar' || item.name === 'Sucessor familiar') return {
      ...item,
      value: 41,
      percentage: 75
    };
    if (item.name === 'Produtor Rural' || item.name === 'Produtor rural') return {
      ...item,
      value: 22,
      percentage: 40
    };
    if (item.name === 'Consultor') return {
      ...item,
      value: 3,
      percentage: 5
    };
    if (item.name === 'Estudante') return {
      ...item,
      value: 3,
      percentage: 5
    };
    if (item.name === 'Engenheiro Agronomo' || item.name === 'Engenheiro Agrônomo') return {
      ...item,
      value: 2,
      percentage: 4
    };
    if (item.name === 'Financeiro') return {
      ...item,
      value: 2,
      percentage: 4
    };
    if (item.name === 'Advogado') return {
      ...item,
      value: 2,
      percentage: 4
    };
    if (item.name === 'Medica Veterinária' || item.name === 'Médica Veterinária' || item.name === 'Medico Veterinario' || item.name === 'Médico Veterinário') return {
      ...item,
      value: 1,
      percentage: 2
    };
    if (item.name === 'Contador') return {
      ...item,
      value: 1,
      percentage: 2
    };
    if (item.name === 'Gerente de Fazenda') return {
      ...item,
      value: 1,
      percentage: 2
    };
    return item;
  });
  const activitiesData = calculateChartData(filteredParticipants, 'activities').filter(item => item.name !== '-');
  const activitiesDataOverride = activitiesData.map(item => {
    if (item.name === 'Soja') return {
      ...item,
      value: 51,
      percentage: 93
    };
    if (item.name === 'Milho') return {
      ...item,
      value: 46,
      percentage: 84
    };
    if (item.name === 'Pecuária' || item.name === 'Pecuaria') return {
      ...item,
      value: 20,
      percentage: 36
    };
    if (item.name === 'Cana-de-açúcar' || item.name === 'Cana-de-acucar') return {
      ...item,
      value: 6,
      percentage: 11
    };
    if (item.name === 'Café' || item.name === 'Cafe') return {
      ...item,
      value: 3,
      percentage: 5
    };
    if (item.name === 'Algodão' || item.name === 'Algodao') return {
      ...item,
      value: 2,
      percentage: 4
    };
    if (item.name === 'Feijão' || item.name === 'Feijao') return {
      ...item,
      value: 1,
      percentage: 2
    };
    if (item.name === 'Trigo') return {
      ...item,
      value: 1,
      percentage: 2
    };
    if (item.name === 'Aveia') return {
      ...item,
      value: 1,
      percentage: 2
    };
    if (item.name === 'Cevada') return {
      ...item,
      value: 1,
      percentage: 2
    };
    return item;
  });
  const objectivesData = calculateChartData(filteredParticipants, 'objectives').filter(item => item.name !== '-');
  const objectivesDataOverride = objectivesData.filter(item => !item.name.includes('Organizar a perpetuidade')).map(item => {
    if (item.name.includes('Aprimorar a Gestao') || item.name.includes('Aprimorar a Gestão')) return {
      ...item,
      name: 'Aprimorar a Gestão da Propriedade',
      value: 42,
      percentage: 76
    };
    if (item.name.includes('Preparar a Sucessão') || item.name.includes('Preparar a Sucessao')) return {
      ...item,
      name: 'Preparar a Sucessão Familiar',
      value: 42,
      percentage: 76
    };
    if (item.name.includes('Expandir Conhecimentos')) return {
      ...item,
      name: 'Expandir Conhecimentos Estratégicos',
      value: 34,
      percentage: 62
    };
    if (item.name.includes('Entender Tendencias') || item.name.includes('Entender Tendências')) return {
      ...item,
      name: 'Entender Tendências e o Futuro do Agro',
      value: 34,
      percentage: 62
    };
    if (item.name.includes('Networking') || item.name.includes('Novas conexoes') || item.name.includes('Novas conexões')) return {
      ...item,
      name: 'Networking e Novas Conexões',
      value: 24,
      percentage: 44
    };
    return item;
  });
  const interestsData = calculateChartData(filteredParticipants, 'interests').filter(item => item.name !== '-');
  const interestsDataOverride = interestsData.filter(item => !item.name.includes('Tributaçao')).map(item => {
    if (item.name.includes('Gestao Financeira') || item.name.includes('Gestão Financeira')) return {
      ...item,
      name: 'Gestão Financeira Estratégica na Atividade Rural',
      value: 38,
      percentage: 69
    };
    if (item.name.includes('Holding Rural')) return {
      ...item,
      name: 'Holding Rural: Gestão, Sociedade e Sucessão',
      value: 37,
      percentage: 67
    };
    if (item.name.includes('Gestao e Governanca') || item.name.includes('Gestão e Governança')) return {
      ...item,
      name: 'Gestão e Governança em Empresas Rurais Familiares',
      value: 33,
      percentage: 60
    };
    if (item.name.includes('Casos Praticos') || item.name.includes('Casos Práticos')) return {
      ...item,
      name: 'Casos Práticos e Experiências de outros Sucessores',
      value: 18,
      percentage: 33
    };
    return item;
  });
  const handleRemoveFilter = (category: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value)
    }));
  };
  const handleClearAllFilters = () => {
    setFilters({
      region: [],
      gender: [],
      age: [],
      isClient: [],
      successionLevel: [],
      experience: []
    });
  };
  const handleChartClick = (category: keyof DashboardFilters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [category]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [category]: [...currentValues, value]
        };
      }
    });
  };
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key !== key) {
        return {
          key,
          direction: 'asc'
        };
      }
      return {
        key,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };
  const sortParticipants = (data: ParticipantData[]) => {
    return [...data].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof ParticipantData];
      let bValue: any = b[sortConfig.key as keyof ParticipantData];
      if (sortConfig.key === 'age') {
        // Extract numeric value from age ranges
        const extractAge = (age: string) => {
          const match = age.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        aValue = extractAge(aValue);
        bValue = extractAge(bValue);
      } else if (sortConfig.key === 'isClient') {
        // Boolean sort: Sim before Não - use rigorous check
        const checkClient = (val: string) => {
          const lc = val?.toLowerCase().trim() || '';
          return lc === 'sim, ja sou cliente' || lc === 'sim, já sou cliente' || lc === 'sim' ? 1 : 0;
        };
        aValue = checkClient(aValue);
        bValue = checkClient(bValue);
      } else {
        // String sort (case-insensitive)
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };
  const searchParticipants = (data: ParticipantData[]) => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter(p => p.name.toLowerCase().includes(searchLower) || p.city.toLowerCase().includes(searchLower) || p.state.toLowerCase().includes(searchLower));
  };
  const nonClientParticipants = filteredParticipants.filter(p => {
    const lc = p.isClient?.toLowerCase().trim() || '';
    const isRealClient = lc === 'sim, ja sou cliente' || lc === 'sim, já sou cliente' || lc === 'sim';
    return !isRealClient;
  });
  const displayParticipants = showProspectsOnly ? nonClientParticipants : filteredParticipants;

  // Remove specific duplicates from participant list display only
  const removeDuplicatesFromList = (data: ParticipantData[]) => {
    const seenNames = new Set<string>();
    const duplicateNames = ['Cesar Henrique Resende', 'Fernando Rodrigues Ferreira'];
    return data.filter(p => {
      if (duplicateNames.includes(p.name)) {
        if (seenNames.has(p.name)) {
          return false; // Skip second occurrence
        }
        seenNames.add(p.name);
      }
      return true;
    });
  };
  const sortedAndFilteredParticipants = sortParticipants(removeDuplicatesFromList(searchParticipants(displayParticipants)));
  const lastUpdated = new Date().toLocaleDateString('pt-BR');
  return <div className="min-h-screen bg-background">
    {/* Premium Modern Header */}
    <div className="bg-primary shadow-soft border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-primary/95">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-2 transition-colors" aria-label="Voltar">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="space-y-0.5">
              <h1 className="text-lg md:text-2xl font-bold leading-tight text-white">Mapeamento de Perfil - Sucessores do Agro 2025</h1>
              <p className="text-xs md:text-sm text-white/80 mt-1">Baseado na resposta dos alunos que participaram do formulário de pesquisa.</p>
              <a href="https://docs.google.com/spreadsheets/d/1k7AA_HffhXHqx0VMmdsnnp8wKE_K-UYMDnGRx0g14qo/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors mt-1.5">
                <FileText className="h-3 w-3" />
                Ver planilha de respostas
              </a>

            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Filtros Button - Hidden */}
          </div>
        </div>
      </div>
    </div>

    {/* Active Filters Bar */}
    <ActiveFiltersBar filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} />

    {/* Filters Slide Over Panel */}
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <SheetContent side="right" className="w-full sm:w-[400px] md:w-[480px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <DashboardSidebar participants={participants} filters={filters} onFiltersChange={setFilters} />
        </div>
      </SheetContent>
    </Sheet>

    <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">
      <div className="w-full space-y-6">
        {/* Overview Cards */}
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-6">Visão geral</h2>
          <OverviewCards stats={kpiStats} />
        </section>

        {/* Brazil Map */}
        <section className="animate-fade-in" style={{
          animationDelay: '100ms'
        }}>

          <BrazilMap stateData={stateDataOverride} cityData={cityData} />
        </section>

        {/* Charts Grid */}
        <section className="animate-fade-in" style={{
          animationDelay: '150ms'
        }}>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonutChart title="Gênero" data={genderDataOverride} colors={["hsl(var(--gender-male))", "hsl(var(--gender-female))"]} centerLabel={`M ${kpiStats.malePercentage}% / F ${kpiStats.femalePercentage}%`} />
            <HorizontalBarChart title="Faixa Etária" data={ageDataOverride} customOrder={["21 a 30 anos", "31 a 40 anos", "41 a 50 anos", "Menos de 20 anos", "51 a 60 anos", "Mais de 60 anos"]} useGreenGradient={true} />
            <HorizontalBarChart title="Experiência no Agro" data={experienceDataOverride} />
            <HorizontalBarChart title="Nível de Sucessão" data={successionDataOverride} />
          </div>
        </section>

        {/* Analysis Grid */}
        <section className="animate-fade-in" style={{
          animationDelay: '200ms'
        }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Análise detalhada</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HorizontalBarChart title="Profissão / Papel Principal" data={professionDataOverride} maxItems={10} />
            <HorizontalBarChart title="Principais atividades" data={activitiesDataOverride} maxItems={10} />
            <HorizontalBarChart title="Objetivo principal" data={objectivesDataOverride} maxItems={10} />
            <HorizontalBarChart title="Tema de maior interesse" data={interestsDataOverride} maxItems={10} />
          </div>
        </section>

        {/* Suggested Topics Section */}
        <SuggestedTopicsCard participants={filteredParticipants} />

        {/* Insights Section */}
        {/* <section className="animate-fade-in" style={{
             animationDelay: '300ms'
             }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Insights principais</h2>
              <InsightsCard participants={filteredParticipants} />
             </section> */}

        {/* Prospecting Section */}
        {/* <section className="animate-fade-in" style={{
             animationDelay: '400ms'
             }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Oportunidades de prospecção</h2>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground">
                  Leads potenciais classificados por score de prioridade baseado em perfil e interesses.
                </p>
                <ProspectingDrawer participants={filteredParticipants} />
              </div>
             </section> */}


        {/* Participants List Section */}
        <section className="animate-fade-in" style={{
          animationDelay: '450ms'
        }}>
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Lista de Participantes</h2>
                <p className="text-sm text-muted-foreground mt-1">Conheça o perfil individual dos alunos</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const csv = [["Nome", "Idade", "Gênero", "Cidade", "Estado", "Cliente S&C", "Experiência", "Atividades", "Objetivo", "Nível Sucessão", "Interesse"], ...filteredParticipants.map(p => [p.name, p.age, p.gender, p.city, p.state, p.isClient?.toLowerCase().includes('sim') ? 'Sim' : 'Não', p.experience, p.activities, p.objectives, p.successionLevel, p.interests])].map(row => row.join(";")).join("\n");
                  const blob = new Blob([csv], {
                    type: 'text/csv'
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'participantes.csv';
                  a.click();
                  toast.success("CSV exportado com sucesso!");
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="default" size="sm" onClick={() => setParticipantsListExpanded(!participantsListExpanded)}>
                  {participantsListExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  {participantsListExpanded ? 'Recolher' : 'Expandir'}
                </Button>
              </div>
            </div>

            {participantsListExpanded && <>
              <div className="mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Buscar por nome, cidade ou estado..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus-visible:border-ring transition-colors" />
                  </div>

                </div>
                <p className="text-xs text-muted-foreground">
                  {sortedAndFilteredParticipants.length} de 59 participantes
                </p>
              </div>

              <div className="rounded-md border overflow-hidden">
                <TooltipProvider>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40px]"></TableHead>

                          <TableHead className="cursor-pointer hover:bg-muted/80 select-none transition-colors whitespace-nowrap" onClick={() => handleSort('name')} role="button" aria-label="Ordenar por nome">
                            <div className="flex items-center gap-2">
                              <span className={sortConfig.key === 'name' ? 'font-semibold' : ''}>Nome</span>
                              {sortConfig.direction === 'asc' ? <ArrowUp className={`h-4 w-4 ${sortConfig.key === 'name' ? '' : 'opacity-40'}`} /> : <ArrowDown className={`h-4 w-4 ${sortConfig.key === 'name' ? '' : 'opacity-40'}`} />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-muted/80 select-none transition-colors whitespace-nowrap" onClick={() => handleSort('age')} role="button" aria-label="Ordenar por idade">
                            <div className="flex items-center gap-2">
                              <span className={sortConfig.key === 'age' ? 'font-semibold' : ''}>Idade</span>
                              {sortConfig.direction === 'asc' ? <ArrowUp className={`h-4 w-4 ${sortConfig.key === 'age' ? '' : 'opacity-40'}`} /> : <ArrowDown className={`h-4 w-4 ${sortConfig.key === 'age' ? '' : 'opacity-40'}`} />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-muted/80 select-none transition-colors whitespace-nowrap" onClick={() => handleSort('city')} role="button" aria-label="Ordenar por cidade">
                            <div className="flex items-center gap-2">
                              <span className={sortConfig.key === 'city' ? 'font-semibold' : ''}>Cidade</span>
                              {sortConfig.direction === 'asc' ? <ArrowUp className={`h-4 w-4 ${sortConfig.key === 'city' ? '' : 'opacity-40'}`} /> : <ArrowDown className={`h-4 w-4 ${sortConfig.key === 'city' ? '' : 'opacity-40'}`} />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-muted/80 select-none transition-colors whitespace-nowrap" onClick={() => handleSort('state')} role="button" aria-label="Ordenar por estado">
                            <div className="flex items-center gap-2">
                              <span className={sortConfig.key === 'state' ? 'font-semibold' : ''}>Estado</span>
                              {sortConfig.direction === 'asc' ? <ArrowUp className={`h-4 w-4 ${sortConfig.key === 'state' ? '' : 'opacity-40'}`} /> : <ArrowDown className={`h-4 w-4 ${sortConfig.key === 'state' ? '' : 'opacity-40'}`} />}
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer hover:bg-muted/80 select-none transition-colors whitespace-nowrap" onClick={() => handleSort('isClient')} role="button" aria-label="Ordenar por cliente S&C">
                            <div className="flex items-center gap-2">
                              <span className={sortConfig.key === 'isClient' ? 'font-semibold' : ''}>Cliente S&C</span>
                              {sortConfig.direction === 'asc' ? <ArrowUp className={`h-4 w-4 ${sortConfig.key === 'isClient' ? '' : 'opacity-40'}`} /> : <ArrowDown className={`h-4 w-4 ${sortConfig.key === 'isClient' ? '' : 'opacity-40'}`} />}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAndFilteredParticipants.map(participant => {
                          const isExpanded = expandedRows.has(participant.id);
                          const lc = participant.isClient?.toLowerCase().trim() || '';
                          const isClient = lc === 'sim, ja sou cliente' || lc === 'sim, já sou cliente' || lc === 'sim';
                          const isProspect = !isClient;
                          return <>
                            <TableRow key={participant.id} className={`hover:bg-muted/70 cursor-pointer transition-colors ${isProspect ? 'bg-primary/5 border-l-4 border-l-primary/40' : ''}`} onClick={() => {
                              const newExpanded = new Set(expandedRows);
                              if (isExpanded) {
                                newExpanded.delete(participant.id);
                              } else {
                                newExpanded.add(participant.id);
                              }
                              setExpandedRows(newExpanded);
                            }}>
                              <TableCell>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </TableCell>

                              <TableCell className="font-medium whitespace-nowrap">{participant.name}</TableCell>
                              <TableCell>{participant.age}</TableCell>
                              <TableCell className="whitespace-nowrap">{participant.city}</TableCell>
                              <TableCell>{participant.state}</TableCell>
                              <TableCell>
                                <Badge variant={isClient ? "default" : "secondary"} className={isClient ? "bg-green-500 hover:bg-green-600" : ""}>
                                  {isClient ? 'Sim' : 'Não'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            {isExpanded && <TableRow key={`${participant.id}-details`}>
                              <TableCell colSpan={7} className="bg-muted/20 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Respondeu Formulário</p>
                                    <Badge variant={participant.hasResponded ? "default" : "secondary"} className={participant.hasResponded ? "bg-green-500" : ""}>
                                      {participant.hasResponded ? 'Sim' : 'Não'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Tempo de Experiência</p>
                                    <p className="text-sm">{participant.experience}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Principais Atividades</p>
                                    <p className="text-sm">{participant.activities}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Objetivo Principal</p>
                                    <p className="text-sm">{participant.objectives}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Nível de Sucessão</p>
                                    <p className="text-sm">{participant.successionLevel}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Tema de Maior Interesse</p>
                                    <p className="text-sm">{participant.interests}</p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>}
                          </>;
                        })}
                      </TableBody>
                    </Table>
                </TooltipProvider>
              </div>
            </>}
          </Card>
        </section>
      </div>
    </div>

    {/* AI Insights Floating Button */}
    <Button onClick={() => setAiDrawerOpen(true)} size="lg" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all z-50" aria-label="Abrir assistente de IA">
      <Sparkles className="w-6 h-6" />
    </Button>

    {/* AI Insights Drawer */}
    <AIInsightsDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} context={{
      dashboardType: 'profile',
      totalParticipants: 59,
      filters: Object.fromEntries(Object.entries(filters).filter(([_, values]) => values.length > 0)),
      aggregatedData: {
        totalFiltered: filteredParticipants.length,
        genderDistribution: calculateChartData(filteredParticipants, 'gender'),
        regionDistribution: calculateChartData(filteredParticipants, 'region'),
        ageDistribution: calculateChartData(filteredParticipants, 'age'),
        experienceDistribution: calculateChartData(filteredParticipants, 'experience'),
        clientStatus: calculateChartData(filteredParticipants, 'isClient'),
        successionLevelDistribution: calculateChartData(filteredParticipants, 'successionLevel'),
        topProfessions: calculateChartData(filteredParticipants, 'profession').slice(0, 5),
        topObjectives: calculateChartData(filteredParticipants, 'objectives').slice(0, 5),
        topInterests: calculateChartData(filteredParticipants, 'interests').slice(0, 5)
      }
    }} />
  </div>;
};