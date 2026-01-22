import { useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
const geoUrl = "/data/brazil-states.geojson";

// Dados reais consolidados dos cursos Sucessores do Agro (55) + Gestoras do Agro (75) = 130 participantes
// Sucessores: GO=22, MT=18, PR=4, BA=4, MS=3, ES=2, MG=2, SP=2, TO=1, SC=1
// Gestoras: GO=28, MS=21, MG=6, MT=5, PR=4, SP=3, TO=2, PI=2, BA=1, CE=1, PA=1, DF=1
const consolidatedStateData = [{
  name: "GO",
  value: 50
},
// 22 + 28
{
  name: "MT",
  value: 23
},
// 18 + 5
{
  name: "MS",
  value: 24
},
// 3 + 21
{
  name: "MG",
  value: 8
},
// 2 + 6
{
  name: "PR",
  value: 8
},
// 4 + 4
{
  name: "SP",
  value: 5
},
// 2 + 3
{
  name: "BA",
  value: 5
},
// 4 + 1
{
  name: "TO",
  value: 3
},
// 1 + 2
{
  name: "ES",
  value: 2
},
// 2 + 0
{
  name: "PI",
  value: 2
},
// 0 + 2
{
  name: "SC",
  value: 1
},
// 1 + 0
{
  name: "CE",
  value: 1
},
// 0 + 1
{
  name: "PA",
  value: 1
},
// 0 + 1
{
  name: "DF",
  value: 1
} // 0 + 1
];

// Dados consolidados de cidades dos dois cursos
const consolidatedCityData = [{
  name: "Goiânia",
  value: 12
}, {
  name: "São Gabriel do Oeste",
  value: 10
}, {
  name: "Querência",
  value: 9
}, {
  name: "Chapadão do Sul",
  value: 12
},
// 3 + 9
{
  name: "Jataí",
  value: 7
}, {
  name: "Chapadão do Céu",
  value: 5
}, {
  name: "Catalão",
  value: 4
}, {
  name: "Pires do Rio",
  value: 4
}, {
  name: "Rio Verde",
  value: 4
}, {
  name: "Unaí",
  value: 6
},
// 2 + 4
{
  name: "Caiapônia",
  value: 4
},
// 3 + 1
{
  name: "Luís Eduardo Magalhães",
  value: 4
},
// 3 + 1
{
  name: "Água Boa",
  value: 2
}, {
  name: "Paranavaí",
  value: 2
}, {
  name: "Gaúcha do Norte",
  value: 2
}, {
  name: "Ribeirão Cascalheira",
  value: 2
}, {
  name: "Sidrolândia",
  value: 2
}, {
  name: "São Paulo",
  value: 3
},
// 1 + 2
{
  name: "Palmas",
  value: 2
}, {
  name: "Formosa",
  value: 2
}, {
  name: "Guarapuava",
  value: 2
}, {
  name: "Castro",
  value: 2
},
// 1 + 1
{
  name: "Bela Vista de Goiás",
  value: 2
},
// 1 + 1
{
  name: "Canarana",
  value: 2
},
// 1 + 1
{
  name: "Sorriso",
  value: 1
}, {
  name: "Morrinhos",
  value: 1
}, {
  name: "Joinville",
  value: 1
}, {
  name: "Vila Valério",
  value: 1
}, {
  name: "Miranorte",
  value: 1
}, {
  name: "Cambará",
  value: 1
}, {
  name: "Linhares",
  value: 1
}, {
  name: "Jaboticabal",
  value: 1
}, {
  name: "Cuiabá",
  value: 2
},
// 1 + 1
{
  name: "Joviânia",
  value: 1
}, {
  name: "Barreiras",
  value: 1
}, {
  name: "Goiatuba",
  value: 1
}, {
  name: "Teresina",
  value: 1
}, {
  name: "Sinop",
  value: 1
}, {
  name: "Campo Verde",
  value: 1
}, {
  name: "Ituiutaba",
  value: 1
}, {
  name: "Nova Mutum",
  value: 1
}, {
  name: "Bom Jesus",
  value: 1
}, {
  name: "Capão Bonito",
  value: 1
}, {
  name: "Ponta Grossa",
  value: 1
}, {
  name: "Juazeiro do Norte",
  value: 1
}, {
  name: "Silvânia",
  value: 1
}, {
  name: "Aruanã",
  value: 1
}, {
  name: "Mineiros",
  value: 1
}, {
  name: "Alfenas",
  value: 1
}, {
  name: "Brasília",
  value: 1
}, {
  name: "Rio Maria",
  value: 1
}, {
  name: "Alto Araguaia",
  value: 1
}, {
  name: "Piracanjuba",
  value: 1
}, {
  name: "Jarinu",
  value: 1
}].sort((a, b) => b.value - a.value);
const stateNameToAbbr: Record<string, string> = {
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
export const GeographicReachSection = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0
  });
  const [viewMode, setViewMode] = useState<"state" | "city">("state");
  const maxCount = useMemo(() => Math.max(...consolidatedStateData.map(s => s.value)), []);
  const totalParticipants = useMemo(() => consolidatedStateData.reduce((acc, s) => acc + s.value, 0), []);
  const totalStates = consolidatedStateData.length;
  const getStateCount = (stateName: string): number => {
    const abbr = stateNameToAbbr[stateName];
    const found = consolidatedStateData.find(s => s.name === abbr);
    return found ? found.value : 0;
  };
  const getStateColor = (count: number, isDark: boolean = false): string => {
    if (count === 0) return isDark ? "hsl(160, 15%, 20%)" : "hsl(160, 17%, 94%)";
    const intensity = count / maxCount;
    const hue = 160 - intensity * 10; // 160 to 150 (green range)
    const saturation = 35 + intensity * 30; // 35% to 65%
    const lightness = isDark ? 35 + intensity * 25 : 75 - intensity * 45; // 75% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  const currentData = viewMode === "state" ? consolidatedStateData : consolidatedCityData;
  return <Card className="border-0 shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Distribuição por Estado e Cidade
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              <strong className="text-foreground">{totalStates}</strong> estados
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{totalParticipants}</strong> participantes
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Map */}
          <div ref={mapContainerRef} className="relative flex-1 overflow-visible">
            <ComposableMap projection="geoMercator" projectionConfig={{
            scale: 850,
            center: [-52, -15]
          }} className="w-full h-[500px] bg-background rounded-lg">
              <Geographies geography={geoUrl}>
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
                          fill: count > 0 ? "hsl(160, 45%, 40%)" : "hsl(var(--muted))",
                          outline: "none",
                          cursor: count > 0 ? "pointer" : "default"
                        },
                  pressed: {
                    outline: "none"
                  }
                }} onMouseEnter={() => {
                  if (count > 0) {
                    setTooltipContent(`${stateName}: ${count} participante${count !== 1 ? 's' : ''}`);
                  }
                }} onMouseMove={evt => {
                  if (!mapContainerRef.current) return;
                  const rect = mapContainerRef.current.getBoundingClientRect();
                  setTooltipPosition({
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                  });
                }} onMouseLeave={() => setTooltipContent("")} />;
              })}
              </Geographies>
            </ComposableMap>
            
            {/* Tooltip */}
            {tooltipContent && <div className="absolute z-50 pointer-events-none bg-card border border-border rounded-lg shadow-medium px-3 py-2 text-sm font-medium text-foreground" style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`
          }}>
                {tooltipContent}
              </div>}
          </div>

          {/* State/City List */}
          <div className="w-[320px] flex flex-col">
            <div className="flex gap-2 mb-3">
              <Button variant={viewMode === "state" ? "default" : "outline"} size="sm" onClick={() => setViewMode("state")} className="flex-1">
                Estado
              </Button>
              <Button variant={viewMode === "city" ? "default" : "outline"} size="sm" onClick={() => setViewMode("city")} className="flex-1 px-0 mx-[9px]">
                Cidade
              </Button>
            </div>
            
            <ScrollArea className="h-[445px] pr-2">
              <div className="space-y-2">
                {currentData.map((item, index) => <div key={item.name} className="group flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 px-[8px] py-[8px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-primary">{item.value}</span>
                      <span className="text-xs text-muted-foreground">
                        participante{item.value !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>)}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>;
};