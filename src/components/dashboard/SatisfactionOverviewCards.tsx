import { StandardKPICard, StandardKPICardsGrid } from "@/components/ui/StandardKPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface SatisfactionOverviewCardsProps {
  totalResponses: number;
  averageRating: number;
  recommendationRate: number;
  topDimensionRating: number;
}

export const SatisfactionOverviewCards = ({
  totalResponses,
  averageRating,
  recommendationRate,
  topDimensionRating
}: SatisfactionOverviewCardsProps) => {
  const isExcellence = recommendationRate === 100;

  const standardCards = [
    {
      title: "Total de Respostas",
      value: totalResponses,
      subtitle: "Participantes avaliaram o curso"
    },
    {
      title: "Avaliação Média Geral",
      value: averageRating.toFixed(2),
      subtitle: "De 5.00 pontos possíveis"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {standardCards.map((card) => (
        <StandardKPICard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
        />
      ))}
      
      {/* Special card for 100% recommendation rate */}
      {isExcellence ? (
        <Card className="group relative overflow-hidden bg-action shadow-[0_0_20px_-4px_hsl(var(--action)/0.4)] hover:shadow-[0_0_28px_-4px_hsl(var(--action)/0.5)] hover:-translate-y-0.5 hover:border-action/50 transition-all duration-[2000ms] ease-in-out cursor-default border border-transparent">
          <Trophy className="absolute bottom-4 right-4 w-20 h-20 text-white/10 z-0" strokeWidth={1.5} />
          <CardContent className="p-4 relative z-10">
            <p className="text-white/90 font-medium mb-2 transition-colors duration-[2000ms] text-sm">
              Taxa de Recomendação
            </p>
            <span className="text-2xl font-bold font-outfit text-white transition-colors duration-[2000ms]">
              {recommendationRate}%
            </span>
            <p className="text-xs text-white/80 mt-1 transition-colors duration-[2000ms]">
              Recomendariam o curso
            </p>
          </CardContent>
        </Card>
      ) : (
        <StandardKPICard
          title="Taxa de Recomendação"
          value={`${recommendationRate}%`}
          subtitle="Recomendariam o curso"
        />
      )}
    </div>
  );
};
