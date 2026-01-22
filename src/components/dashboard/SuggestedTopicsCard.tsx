import { Card, CardContent } from "@/components/ui/card";
import { ParticipantData } from "@/types/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { AlertTriangle, Target, Lightbulb, Quote, ChevronDown, ChevronUp, Search, ChevronRight, MapPin, Building2, UserPlus } from "lucide-react";
interface ResponseData {
  text: string | undefined;
  name: string;
  state: string;
  isClient: boolean;
  id: number;
}
const ResponseCard = ({
  response
}: {
  response: ResponseData;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef<HTMLQuoteElement>(null);
  useEffect(() => {
    if (textRef.current) {
      setNeedsExpansion(textRef.current.scrollHeight > 72);
    }
  }, [response.text]);
  return <div className="p-5 rounded-2xl shadow-soft flex flex-col justify-between relative bg-gradient-to-br from-card to-muted/30 border border-border transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] h-full">
      <Quote className="absolute top-3 right-3 w-5 h-5 text-primary/15" />
      
      <div className="flex-1">
        <blockquote ref={textRef} className={`text-sm text-foreground leading-relaxed pr-6 transition-all duration-300 ${!isExpanded && needsExpansion ? "line-clamp-3" : ""}`}>
          {response.text}
        </blockquote>
        
        {needsExpansion && <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:text-primary/80 transition-colors">
            {isExpanded ? <>
                <ChevronUp className="w-3 h-3" />
                Recolher
              </> : <>
                <ChevronDown className="w-3 h-3" />
                Ver mais
              </>}
          </button>}
      </div>
      
      <footer className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-primary">{response.name}</span>
          {response.state && <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {response.state}
            </span>}
          {response.isClient ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[hsl(var(--action))]/10 text-[hsl(var(--action))] rounded text-[10px] font-medium">
              <Building2 className="w-3 h-3" />
              Cliente S&C
            </span>
          ) : (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[hsl(var(--lead))]/10 text-[hsl(var(--lead))] rounded text-[10px] font-medium">
              <UserPlus className="w-3 h-3" />
              Lead Potencial
            </span>
          )}
        </div>
      </footer>
    </div>;
};
interface InsightsSectionProps {
  responses: ResponseData[];
  tabType: 'challenges' | 'expectations' | 'suggestions';
}

// Temas categorizados para análise
const themeCategories = {
  gestao_pessoas: {
    label: "Gestão de Pessoas",
    keywords: ['pessoas', 'equipe', 'funcionários', 'colaboradores', 'mão de obra', 'liderança', 'líderes', 'trabalhista', 'qualificada', 'treinamento']
  },
  comunicacao: {
    label: "Comunicação",
    keywords: ['comunicação', 'comunicar', 'relacionamento', 'conflitos', 'família', 'familiar', 'convívio']
  },
  financeiro: {
    label: "Gestão Financeira",
    keywords: ['financeiro', 'financeira', 'custos', 'preço', 'bolsa', 'valores', 'investimento', 'investimentos', 'mercado', 'tributária', 'tributário']
  },
  sucessao: {
    label: "Sucessão Familiar",
    keywords: ['sucessão', 'sucessores', 'gerações', 'geração', 'herdeiros', 'governança', 'longevidade']
  },
  planejamento: {
    label: "Planejamento Estratégico",
    keywords: ['planejamento', 'estratégico', 'estratégia', 'estratégica', 'decisão', 'decisões', 'processos', 'organização']
  },
  conhecimento: {
    label: "Aprendizado e Networking",
    keywords: ['conhecimento', 'aprendizado', 'aprender', 'experiência', 'experiências', 'networking', 'conexões', 'network', 'crescimento']
  }
};
const InsightsSection = ({
  responses,
  tabType
}: InsightsSectionProps) => {
  const insights = useMemo(() => {
    const validResponses = responses.filter(r => r.text && r.text.length > 0);
    const totalCount = validResponses.length;
    const allText = validResponses.map(r => r.text?.toLowerCase() || '').join(' ');

    // Análise de temas recorrentes
    const themeOccurrences: {
      label: string;
      count: number;
      percentage: number;
    }[] = [];
    Object.entries(themeCategories).forEach(([, theme]) => {
      let count = 0;
      validResponses.forEach(r => {
        const text = r.text?.toLowerCase() || '';
        if (theme.keywords.some(kw => text.includes(kw))) {
          count++;
        }
      });
      if (count > 0) {
        themeOccurrences.push({
          label: theme.label,
          count,
          percentage: Math.round(count / totalCount * 100)
        });
      }
    });

    // Ordenar por frequência
    themeOccurrences.sort((a, b) => b.count - a.count);

    // Análise de estados
    const stateCount: Record<string, number> = {};
    validResponses.forEach(r => {
      if (r.state) {
        stateCount[r.state] = (stateCount[r.state] || 0) + 1;
      }
    });
    const topStates = Object.entries(stateCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([state, count]) => `${state} (${count})`);

    // Clientes vs não clientes
    const clientsCount = validResponses.filter(r => r.isClient).length;
    const clientPercentage = totalCount > 0 ? Math.round(clientsCount / totalCount * 100) : 0;

    // Construir insights baseados nos dados reais
    const resultInsights: string[] = [];

    // Insight principal sobre volume
    resultInsights.push(`📊 ${totalCount} respostas analisadas nesta categoria`);

    // Top 2 temas mais mencionados
    if (themeOccurrences.length >= 1) {
      const top1 = themeOccurrences[0];
      resultInsights.push(`🔥 Tema mais recorrente: **${top1.label}** (${top1.percentage}% das respostas)`);
    }
    if (themeOccurrences.length >= 2) {
      const top2 = themeOccurrences[1];
      resultInsights.push(`📌 Segundo tema: **${top2.label}** (${top2.percentage}% das respostas)`);
    }

    // Distribuição geográfica
    if (topStates.length > 0) {
      resultInsights.push(`📍 Principais estados: ${topStates.join(', ')}`);
    }

    // Proporção de clientes
    if (clientsCount > 0) {
      resultInsights.push(`💼 ${clientPercentage}% das respostas são de clientes Safras & Cifras`);
    }

    // Insight contextual por aba
    if (tabType === 'challenges' && themeOccurrences.length > 0) {
      const themes = themeOccurrences.slice(0, 3).map(t => t.label).join(', ');
      resultInsights.push(`💡 Principais áreas de desafio: ${themes}`);
    } else if (tabType === 'expectations') {
      if (allText.includes('conhecimento') || allText.includes('aprendizado')) {
        resultInsights.push(`💡 Forte demanda por conhecimento prático e aplicável`);
      }
      if (allText.includes('networking') || allText.includes('conexões') || allText.includes('mulheres')) {
        resultInsights.push(`💡 Interesse em networking e troca de experiências`);
      }
    } else if (tabType === 'suggestions') {
      if (allText.includes('tributária') || allText.includes('tributário')) {
        resultInsights.push(`💡 Reforma tributária é um tema de grande interesse`);
      }
      if (allText.includes('sucessão') || allText.includes('familiar')) {
        resultInsights.push(`💡 Sucessão familiar aparece como tema prioritário`);
      }
    }
    return resultInsights.slice(0, 6);
  }, [responses, tabType]);

  // Extrair temas para exibição visual
  const themeStats = useMemo(() => {
    const validResponses = responses.filter(r => r.text && r.text.length > 0);
    const totalCount = validResponses.length;
    const stats: {
      label: string;
      count: number;
      percentage: number;
    }[] = [];
    Object.entries(themeCategories).forEach(([, theme]) => {
      let count = 0;
      validResponses.forEach(r => {
        const text = r.text?.toLowerCase() || '';
        if (theme.keywords.some(kw => text.includes(kw))) {
          count++;
        }
      });
      if (count > 0) {
        stats.push({
          label: theme.label,
          count,
          percentage: Math.round(count / totalCount * 100)
        });
      }
    });
    return stats.sort((a, b) => b.count - a.count).slice(0, 4);
  }, [responses]);
  return <div className="mt-6 p-5 bg-gradient-to-br from-[hsl(var(--lead-light))] to-muted/50 rounded-xl border border-[hsl(var(--lead))]/20">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--lead))] mb-3">
        <Lightbulb className="w-4 h-4" />
        Tópicos Principais
      </h4>
      
      {themeStats.length > 0 && <div className="flex flex-wrap gap-2">
          {themeStats.map((theme, index) => <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--lead))]/10 text-[hsl(var(--lead))] rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--lead))]" style={{
          opacity: 1 - index * 0.2
        }} />
              {theme.label}
              <span className="text-[hsl(var(--lead))]/70">({theme.percentage}%)</span>
            </span>)}
        </div>}
    </div>;
};
interface TabContentProps {
  responses: ResponseData[];
  searchTerm: string;
  tabType: 'challenges' | 'expectations' | 'suggestions';
}
const TabContent = ({
  responses,
  searchTerm,
  tabType
}: TabContentProps) => {
  const [showAll, setShowAll] = useState(false);
  const filteredResponses = useMemo(() => {
    if (!searchTerm) return responses;
    const term = searchTerm.toLowerCase();
    return responses.filter(r => r.text?.toLowerCase().includes(term) || r.name.toLowerCase().includes(term) || r.state?.toLowerCase().includes(term));
  }, [responses, searchTerm]);
  const displayedResponses = showAll ? filteredResponses : filteredResponses.slice(0, 6);
  const hasMore = filteredResponses.length > 6;
  if (filteredResponses.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">
          {searchTerm ? 'Nenhuma resposta encontrada para sua busca.' : 'Nenhuma resposta disponível.'}
        </p>
      </div>;
  }
  return <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedResponses.map(response => <ResponseCard key={response.id} response={response} />)}
      </div>
      
      {hasMore && <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setShowAll(!showAll)} className="text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/50">
            {showAll ? <>
                Mostrar menos
                <ChevronUp className="w-4 h-4 ml-2" />
              </> : <>
                Ver todas as {filteredResponses.length} respostas
                <ChevronRight className="w-4 h-4 ml-2" />
              </>}
          </Button>
        </div>}
    </div>;
};
interface SuggestedTopicsCardProps {
  participants: ParticipantData[];
}
export const SuggestedTopicsCard = ({
  participants
}: SuggestedTopicsCardProps) => {
  const [activeTab, setActiveTab] = useState("challenges");
  const [searchTerm, setSearchTerm] = useState("");
  const parseIsClient = (value: string | boolean | undefined): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'sim' || value.toLowerCase() === 'yes' || value === 'true';
    return false;
  };
  const challengesResponses = useMemo(() => participants.map((p, index) => ({
    text: p.challenges?.trim(),
    name: p.name,
    state: p.state || '',
    isClient: parseIsClient(p.isClient),
    id: index
  })).filter(r => r.text && r.text.length > 0).sort((a, b) => (a.text?.length || 0) - (b.text?.length || 0)), [participants]);
  const expectationsResponses = useMemo(() => participants.map((p, index) => ({
    text: p.expectations?.trim(),
    name: p.name,
    state: p.state || '',
    isClient: parseIsClient(p.isClient),
    id: index + 1000
  })).filter(r => r.text && r.text.length > 0).sort((a, b) => (a.text?.length || 0) - (b.text?.length || 0)), [participants]);
  const suggestionsResponses = useMemo(() => participants.map((p, index) => ({
    text: p.additionalTopics?.trim(),
    name: p.name,
    state: p.state || '',
    isClient: parseIsClient(p.isClient),
    id: index + 2000
  })).filter(r => r.text && r.text.length > 0).sort((a, b) => (a.text?.length || 0) - (b.text?.length || 0)), [participants]);
  const tabConfig = [{
    value: "challenges",
    label: "Desafios na Gestão",
    icon: AlertTriangle,
    count: challengesResponses.length,
    responses: challengesResponses,
    tabType: 'challenges' as const
  }, {
    value: "expectations",
    label: "Expectativas do Curso",
    icon: Target,
    count: expectationsResponses.length,
    responses: expectationsResponses,
    tabType: 'expectations' as const
  }, {
    value: "suggestions",
    label: "Temas Sugeridos",
    icon: Lightbulb,
    count: suggestionsResponses.length,
    responses: suggestionsResponses,
    tabType: 'suggestions' as const
  }];
  return <section className="animate-fade-in" style={{
    animationDelay: '600ms'
  }}>
      <h2 className="text-2xl font-bold text-foreground mb-6">Temas Sugeridos</h2>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col gap-4 mb-6">
              <TabsList className="bg-muted/50 border border-border p-1 h-auto flex flex-wrap justify-start gap-1">
                {tabConfig.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-muted transition-all text-xs sm:text-sm">
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">{tab.label}</span>
                    <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-primary/10 text-primary group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>)}
              </TabsList>
              
              <div className="relative w-full sm:max-w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar nas respostas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-muted/50 border-border focus:border-primary/50" />
              </div>
            </div>

            {tabConfig.map(tab => <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <TabContent responses={tab.responses} searchTerm={searchTerm} tabType={tab.tabType} />
              </TabsContent>)}
          </Tabs>
        </CardContent>
      </Card>
    </section>;
};