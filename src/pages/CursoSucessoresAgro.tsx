import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageView } from "@/hooks/usePageView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartBar as BarChart3, ClipboardCheck, DollarSign, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CursoSucessoresAgro = () => {
  const navigate = useNavigate();
  const [selectedEdition, setSelectedEdition] = useState("8");
  
  usePageView("/sucessores-do-agro");

  const dashboards = [
    {
      title: "Mapeamento de Perfil",
      description: "Análise estratégica e detalhada do perfil dos participantes",
      icon: BarChart3,
      route: "/mapeamento-de-perfil",
      available: true,
      metrics: "55 participantes analisados"
    },
    {
      title: "Pesquisa de Satisfação",
      description: "Avaliação qualitativa do programa e identificação de melhorias",
      icon: ClipboardCheck,
      route: "/pesquisa-de-satisfacao",
      available: true,
      metrics: "Índice de satisfação geral"
    },
    {
      title: "Resultado Financeiro",
      description: "Fechamento financeiro completo e análise de indicadores econômicos",
      icon: DollarSign,
      route: "/sucessores-do-agro/resultado-financeiro",
      available: true,
      metrics: "Disponível em breve"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-primary shadow-soft border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-primary/95">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")} 
                className="text-white hover:bg-white/10 p-2 transition-colors" 
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="space-y-0.5">
                <h1 className="text-lg md:text-2xl font-bold leading-tight text-white">
                  Sucessores do Agro
                </h1>
                <p className="text-xs md:text-sm text-white/80">
                  Formação de líderes para o agronegócio
                </p>
              </div>
            </div>

            <Select value={selectedEdition} onValueChange={setSelectedEdition}>
              <SelectTrigger className="w-[120px] bg-white border-white text-foreground hover:bg-white/90 transition-colors h-9 text-sm font-medium shadow-soft">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8" className="font-semibold">8ª Edição</SelectItem>
                <SelectItem value="7" disabled>7ª Edição</SelectItem>
                <SelectItem value="6" disabled>6ª Edição</SelectItem>
                <SelectItem value="5" disabled>5ª Edição</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8">
        {/* Section Title */}
        <div>
          <h2 className="text-xl md:text-2xl font-outfit font-bold text-foreground mb-2">
            Dashboards Disponíveis
          </h2>
          <p className="text-muted-foreground">
            Selecione um dashboard para visualizar análises detalhadas
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((dashboard, index) => {
            const Icon = dashboard.icon;
            const isAvailable = dashboard.available && selectedEdition === "8";

            return (
              <Card
                key={dashboard.route}
                className={cn(
                  "group relative overflow-hidden border shadow-soft transition-all duration-500 ease-out",
                  isAvailable
                    ? "hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                )}
                onClick={() => isAvailable && navigate(dashboard.route)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col h-full space-y-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-soft transition-all duration-500 ease-out",
                        isAvailable && "group-hover:scale-105 group-hover:shadow-medium"
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold font-outfit text-foreground mb-2">
                        {dashboard.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {dashboard.description}
                      </p>
                    </div>

                    <Button
                      variant={isAvailable ? "default" : "ghost"}
                      disabled={!isAvailable}
                      className="w-full"
                    >
                      {isAvailable ? 'Visualizar Análises' : 'Disponível em breve'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Notice */}
        {selectedEdition !== "8" && (
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Dashboards completos disponíveis apenas para a{" "}
                <span className="font-bold text-primary">8ª Edição</span>. Edições anteriores em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CursoSucessoresAgro;
