import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipantData } from "@/types/dashboard";
import { Lightbulb, Target } from "lucide-react";
interface InsightsCardProps {
  participants: ParticipantData[];
}
export const InsightsCard = ({
  participants
}: InsightsCardProps) => {
  // Calculate key insights from the data
  const calculateInsights = () => {
    const total = participants.length;

    // Most common interest
    const interestCounts = participants.reduce((acc, p) => {
      if (p.interests) {
        const interests = p.interests.split(',').map(i => i.trim());
        interests.forEach(interest => {
          acc[interest] = (acc[interest] || 0) + 1;
        });
      }
      return acc;
    }, {} as {
      [key: string]: number;
    });
    const topInterest = Object.entries(interestCounts).sort(([, a], [, b]) => b - a)[0];

    // Client percentage
    const clientCount = participants.filter(p => p.isClient && p.isClient.toLowerCase().includes('sim')).length;
    const clientPercentage = Math.round(clientCount / total * 100);

    // Most common region
    const regionCounts = participants.reduce((acc, p) => {
      acc[p.region] = (acc[p.region] || 0) + 1;
      return acc;
    }, {} as {
      [key: string]: number;
    });
    const topRegion = Object.entries(regionCounts).sort(([, a], [, b]) => b - a)[0];

    // Most common experience level
    const experienceCounts = participants.reduce((acc, p) => {
      acc[p.experience] = (acc[p.experience] || 0) + 1;
      return acc;
    }, {} as {
      [key: string]: number;
    });
    const topExperience = Object.entries(experienceCounts).sort(([, a], [, b]) => b - a)[0];
    return {
      topInterest: topInterest?.[0] || "N/A",
      clientPercentage,
      topRegion: topRegion?.[0] || "N/A",
      topExperience: topExperience?.[0] || "N/A",
      nonClientCount: total - clientCount
    };
  };
  const insights = calculateInsights();
  const discoveries = [`${insights.topInterest} é o tema de maior interesse`, `${insights.clientPercentage}% dos participantes já são clientes da Safras`, `${insights.topRegion} é a região com maior participação`, `Maioria tem experiência ${insights.topExperience.toLowerCase()} em sucessão`];
  const opportunities = [`Potencial de conversão de ${insights.nonClientCount} leads em clientes`, "Demanda alta por conteúdo sobre gestão financeira", "Interesse em casos práticos de sucessão", "Networking valorizado pelos participantes"];
  return <Card className="shadow-soft bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px] font-bold text-foreground">Insights e Descobertas</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Principais Descobertas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="text-foreground text-[16px] font-medium">Principais Descobertas</h3>
            </div>
            <div className="space-y-3">
              {discoveries.map((discovery, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all duration-200 animate-fade-in border-l-2 border-primary" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <span className="leading-relaxed text-foreground text-sm">{discovery}</span>
                </div>)}
            </div>
          </div>

          {/* Oportunidades */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-secondary" />
              <h3 className="text-foreground text-[16px] font-medium">Oportunidades</h3>
            </div>
            <div className="space-y-3">
              {opportunities.map((opportunity, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/5 hover:bg-secondary/10 transition-all duration-200 animate-fade-in border-l-2 border-secondary" style={{
              animationDelay: `${(index + 4) * 100}ms`
            }}>
                  <span className="leading-relaxed text-foreground text-sm">{opportunity}</span>
                </div>)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};