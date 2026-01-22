import { StandardKPICard, StandardKPICardsGrid } from "@/components/ui/StandardKPICard";

interface GestorasKPIStats {
  totalParticipants: number;
  totalResponses: number;
  clientCount: number;
  clientPercentage: number;
  nonClientCount: number;
  nonClientPercentage: number;
}

interface GestorasOverviewCardsProps {
  stats?: GestorasKPIStats;
}

export const GestorasOverviewCards = ({ stats }: GestorasOverviewCardsProps) => {
  const cards = [
    {
      title: "Participantes",
      value: 79
    },
    {
      title: "Respostas",
      value: 67
    },
    {
      title: "Clientes S&C",
      value: 35
    },
    {
      title: "Leads Potenciais",
      value: 32
    }
  ];

  return (
    <StandardKPICardsGrid columns={4} className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StandardKPICard
          key={card.title}
          title={card.title}
          value={card.value}
        />
      ))}
    </StandardKPICardsGrid>
  );
};
