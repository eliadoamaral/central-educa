import { useState, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
interface GestorasBrazilMapProps {
  stateData: {
    name: string;
    value: number;
  }[];
  cityData?: {
    name: string;
    value: number;
  }[];
}
const stateNameMapping: {
  [key: string]: string;
} = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO"
};
export const GestorasBrazilMap = ({
  stateData,
  cityData = []
}: GestorasBrazilMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0
  });
  const [viewMode, setViewMode] = useState<"state" | "city">("state");
  const getStateCount = (stateName: string) => {
    const stateAbbr = stateNameMapping[stateName];
    const found = stateData.find(s => s.name === stateAbbr || s.name === stateName);
    return found ? found.value : 0;
  };
  const maxCount = stateData.length > 0 ? Math.max(...stateData.map(s => s.value)) : 1;
  const getStateColor = (count: number) => {
    // Estados sem participantes: cor clara (cinza suave)
    if (count === 0) return "hsl(160, 17%, 94%)";
    // Estados com participantes: gradiente de verde baseado na intensidade
    const intensity = count / maxCount;
    const hue = Math.round(160 - intensity * 10); // 160 to 150 (green range)
    const saturation = Math.round(35 + intensity * 30); // 35% to 65%
    const lightness = Math.round(75 - intensity * 45); // 75% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  const sortedStatesWithParticipants = stateData.filter(state => state.value > 0).sort((a, b) => b.value - a.value);
  const sortedCitiesWithParticipants = cityData.filter(city => city.value > 0).sort((a, b) => b.value - a.value);
  const currentData = viewMode === "state" ? sortedStatesWithParticipants : sortedCitiesWithParticipants;
  const currentLabel = "participante";
  return <Card className="bg-card shadow-soft">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-[18px] font-bold text-foreground">
          Distribuição por Estado e Cidade
        </CardTitle>
      </CardHeader>

      <div className="flex flex-col lg:flex-row gap-4 px-3 pb-3">
        <div ref={mapContainerRef} className="relative flex-1 overflow-visible min-h-[300px] lg:min-h-0">
          <ComposableMap projection="geoMercator" projectionConfig={{
          scale: 850,
          center: [-52, -15]
        }} className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-background rounded-lg">
            <Geographies geography="/data/brazil-states.geojson">
              {({
              geographies
            }) => geographies.map(geo => {
              const stateName = geo.properties.name;
              const count = getStateCount(stateName);
              return <Geography key={geo.rsmKey} geography={geo} fill={getStateColor(count)} stroke="hsl(var(--border))" strokeWidth={1} style={{
                default: {
                  outline: "none"
                },
                hover: {
                  fill: "hsl(var(--primary))",
                  outline: "none",
                  cursor: "pointer"
                },
                pressed: {
                  outline: "none"
                }
              }} onMouseEnter={() => {
                setTooltipContent(`${stateName}: ${count} participante${count !== 1 ? 's' : ''}`);
              }} onMouseMove={evt => {
                if (!mapContainerRef.current) return;
                const rect = mapContainerRef.current.getBoundingClientRect();
                const {
                  clientX,
                  clientY
                } = evt;
                setTooltipPosition({
                  x: clientX - rect.left,
                  y: clientY - rect.top
                });
              }} onMouseLeave={() => {
                setTooltipContent("");
              }} />;
            })}
            </Geographies>
          </ComposableMap>

          {tooltipContent && <div className="absolute z-50 pointer-events-none transition-all duration-200 ease-in-out bg-card border border-border rounded-lg shadow-medium px-3 py-2 text-foreground text-sm font-medium" style={{
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y + 10}px`
        }}>
              {tooltipContent}
            </div>}
        </div>

        <div className="w-full lg:w-[340px] flex flex-col">
          <div className="flex gap-2 mb-3">
            <Button variant={viewMode === "state" ? "default" : "outline"} size="sm" onClick={() => setViewMode("state")} className="flex-1">
              Estado
            </Button>
            <Button variant={viewMode === "city" ? "default" : "outline"} size="sm" onClick={() => setViewMode("city")} className="flex-1">
              Cidade
            </Button>
          </div>

          <ScrollArea className="h-[280px] sm:h-[350px] lg:h-[445px] pr-4">
            <div className="space-y-2">
              {currentData.length > 0 ? currentData.map((item, index) => <div key={item.name} className="group relative flex items-center justify-between p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{item.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.value === 1 ? currentLabel : currentLabel + 's'}
                      </span>
                    </div>
                  </div>) : <div className="text-center text-muted-foreground py-8">
                  Dados serão adicionados em breve...
                </div>}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>;
};