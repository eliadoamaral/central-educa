import { StandardKPICard, StandardKPICardsGrid } from "@/components/ui/StandardKPICard";
import { formatCurrency, formatPercentage } from "@/utils/financialParser";

interface FinancialOverviewCardsProps {
  totalRevenue: number;
  netResult: number;
  roi: number;
  averageTicket: number;
}

export const FinancialOverviewCards = ({
  totalRevenue,
  netResult,
  roi,
  averageTicket,
}: FinancialOverviewCardsProps) => {
  const cards = [
    {
      title: "Receita Total",
      value: formatCurrency(totalRevenue)
    },
    {
      title: "Resultado Líquido",
      value: formatCurrency(netResult)
    },
    {
      title: "Margem",
      value: formatPercentage(roi)
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(averageTicket)
    }
  ];

  return (
    <StandardKPICardsGrid columns={4}>
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
