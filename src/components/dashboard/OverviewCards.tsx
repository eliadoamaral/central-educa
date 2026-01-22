import { StandardKPICard, StandardKPICardsGrid } from "@/components/ui/StandardKPICard";

interface KPIStats {
  totalParticipants: number;
  maleCount: number;
  malePercentage: number;
  femaleCount: number;
  femalePercentage: number;
  topAgeRange: string;
  topAgeCount: number;
  topAgePercentage: number;
  clientCount: number;
  clientPercentage: number;
  nonClientCount: number;
  nonClientPercentage: number;
}

interface OverviewCardsProps {
  stats: KPIStats;
}

export const OverviewCards = ({ stats }: OverviewCardsProps) => {
  const cards = [
    {
      title: "Participantes",
      value: 59,
      subtitle: "Responderam ao formulário"
    },
    {
      title: "Respostas",
      value: 55,
      subtitle: "Formulários completos"
    },
    {
      title: "Clientes S&C",
      value: `${stats.clientCount} (${stats.clientPercentage}%)`,
      subtitle: "Já são clientes"
    },
    {
      title: "Leads Potenciais",
      value: `${stats.nonClientCount} (${stats.nonClientPercentage}%)`,
      subtitle: "Oportunidades de prospecção"
    }
  ];

  return (
    <StandardKPICardsGrid columns={4}>
      {cards.map((card) => (
        <StandardKPICard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
        />
      ))}
    </StandardKPICardsGrid>
  );
};
