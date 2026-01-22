import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartBar as BarChart3, ClipboardCheck, DollarSign, ArrowLeft, Users, TrendingUp, Award, Sparkles, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import gestorasBg from "@/assets/gestoras-agro-bg.png";
const CursoGestorasAgro = () => {
  const navigate = useNavigate();
  const [selectedEdition, setSelectedEdition] = useState("1");
  usePageView("/gestoras-do-agro");
  const dashboards = [{
    title: "Mapeamento de Perfil",
    description: "Análise estratégica e detalhada do perfil das participantes, incluindo objetivos, experiência e áreas de interesse.",
    icon: BarChart3,
    route: "/gestoras-do-agro/mapeamento-perfil",
    available: true,
    badge: "Disponível",
    badgeVariant: "default" as const,
    stats: {
      label: "Respostas",
      value: "67"
    }
  }, {
    title: "Pesquisa de Satisfação",
    description: "Avaliação qualitativa do programa com feedback das participantes e identificação de oportunidades de melhoria.",
    icon: ClipboardCheck,
    route: "/gestoras-do-agro/pesquisa-de-satisfacao",
    available: false,
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    stats: {
      label: "Status",
      value: "Aguardando"
    }
  }, {
    title: "Resultado Financeiro",
    description: "Fechamento financeiro completo com análise de indicadores econômicos e métricas de rentabilidade.",
    icon: DollarSign,
    route: "/gestoras-do-agro/resultado-financeiro",
    available: false,
    badge: "Em breve",
    badgeVariant: "secondary" as const,
    stats: {
      label: "Status",
      value: "Aguardando"
    }
  }];
  const highlights = [{
    icon: Users,
    value: "79",
    label: "Participantes"
  }, {
    icon: TrendingUp,
    value: "80%",
    label: "Taxa de Resposta"
  }, {
    icon: Award,
    value: "35",
    label: "Clientes S&C"
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${gestorasBg})`
      }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Header Navigation */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-white/90 hover:text-white hover:bg-white/10 gap-2 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pb-16 pt-4 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Gestoras do Agro
            </h1>

            {/* Edition Selector + Stats Column */}
            <div className="flex flex-col items-start md:items-end gap-4">
              {/* Edition Selector */}
              <Select value={selectedEdition} onValueChange={setSelectedEdition}>
                <SelectTrigger className="w-fit gap-2 h-8 px-3 bg-white/15 border-white/25 text-white text-xs font-medium hover:bg-white/25 transition-all backdrop-blur-sm rounded-full shadow-lg">
                  <SelectValue placeholder="Edição" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="1">1ª Edição</SelectItem>
                </SelectContent>
              </Select>

              {/* Highlight Stats */}
              <div className="flex gap-6 md:gap-8">
                {highlights.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{item.value}</div>
                    <div className="text-xs md:text-sm text-white/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Dashboards & Análises
            </h2>
            <p className="text-muted-foreground mt-1">
              Acesse insights detalhados sobre o programa
            </p>
          </div>
        </div>

        {/* Dashboard Cards - Larger, More Impactful */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {dashboards.map((dashboard, index) => {
          const Icon = dashboard.icon;
          const isAvailable = dashboard.available && selectedEdition === "1";
          return <Card key={dashboard.route} className={cn("group relative overflow-hidden border-2 transition-all duration-500 ease-out", isAvailable ? "hover:border-primary hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] cursor-pointer bg-card" : "opacity-70 cursor-not-allowed bg-muted/30 border-dashed")} onClick={() => isAvailable && navigate(dashboard.route)}>
                {/* Card Gradient Overlay for Available */}
                {isAvailable && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
                
                <CardContent className="p-6 md:p-8 relative">
                  <div className="flex flex-col h-full min-h-[240px]">
                    {/* Top Row - Icon and Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", isAvailable ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground")}>
                        <Icon className="w-7 h-7" />
                      </div>
                      
                      <Badge variant={isAvailable ? "default" : "secondary"} className={cn("text-xs font-medium", isAvailable && "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10")}>
                        {isAvailable ? <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                            {dashboard.badge}
                          </> : <>
                            <Lock className="w-3 h-3 mr-1" />
                            {dashboard.badge}
                          </>}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {dashboard.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dashboard.description}
                      </p>
                    </div>

                    {/* Bottom Row - Stats and Action */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{dashboard.stats.label}</div>
                        <div className={cn("text-lg font-bold", isAvailable ? "text-foreground" : "text-muted-foreground")}>
                          {dashboard.stats.value}
                        </div>
                      </div>
                      
                      <Button variant={isAvailable ? "default" : "ghost"} size="sm" disabled={!isAvailable} className="gap-1.5 transition-colors hover:bg-primary/90">
                        {isAvailable ? 'Acessar' : 'Indisponível'}
                        {isAvailable && <ChevronRight className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* Info Notice */}
        {selectedEdition !== "1" && <Card className="border-dashed border-primary/30 bg-primary/5 mt-8">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Dashboards completos disponíveis apenas para a{" "}
                <span className="font-bold text-primary">1ª Edição</span>.
              </p>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default CursoGestorasAgro;