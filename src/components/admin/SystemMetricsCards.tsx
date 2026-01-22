import { StandardKPICard, StandardKPICardsGrid } from "@/components/ui/StandardKPICard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SystemMetricsCardsProps {
  totalUsers: number;
  activeToday: number;
  totalLogins: number;
  lastActivity: string;
}

export const SystemMetricsCards = ({
  totalUsers,
  activeToday,
  totalLogins,
  lastActivity
}: SystemMetricsCardsProps) => {
  const metrics = [
    {
      title: "Total de Usuários",
      value: totalUsers
    },
    {
      title: "Usuários Ativos Hoje",
      value: activeToday
    },
    {
      title: "Total de Logins",
      value: totalLogins
    },
    {
      title: "Última Atividade",
      value: lastActivity ? format(new Date(lastActivity), "dd/MM HH:mm", { locale: ptBR }) : "N/A"
    }
  ];

  return (
    <StandardKPICardsGrid columns={4}>
      {metrics.map((metric) => (
        <StandardKPICard
          key={metric.title}
          title={metric.title}
          value={metric.value}
        />
      ))}
    </StandardKPICardsGrid>
  );
};
