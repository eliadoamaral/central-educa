interface MetaInfoProps {
  lastUpdated: string;
  totalResponses: number;
}

export const MetaInfo = ({ lastUpdated, totalResponses }: MetaInfoProps) => {
  return (
    <div className="text-sm font-semibold text-white/95">
      <span>📅 Atualizado em {lastUpdated}</span>
    </div>
  );
};
