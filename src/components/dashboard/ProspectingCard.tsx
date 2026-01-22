import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticipantData } from "@/types/dashboard";
import { Users, Eye, EyeOff, Mail, MapPin } from "lucide-react";
interface ProspectingCardProps {
  participants: ParticipantData[];
}
export const ProspectingCard = ({
  participants
}: ProspectingCardProps) => {
  const [showProspects, setShowProspects] = useState(false);

  // Filter non-clients
  const nonClients = participants.filter(p => !p.isClient || !p.isClient.toLowerCase().includes('sim'));
  const toggleView = () => {
    setShowProspects(!showProspects);
  };

  // Group prospects by region for better visualization
  const prospectsByRegion = nonClients.reduce((acc, participant) => {
    const region = participant.region || 'Não informado';
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(participant);
    return acc;
  }, {} as {
    [key: string]: ParticipantData[];
  });
  return <Card className="shadow-soft bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px] font-bold text-foreground">Prospecção de Sucessores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-10">
          
          <h3 className="mb-3 font-bold text-foreground text-xl">Oportunidades de Prospecção</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
            Identifique e converta oportunidades entre os participantes do curso que ainda não são clientes
          </p>
          <Button onClick={toggleView} variant="default" className="gap-3 px-6 py-3 text-base font-semibold bg-gradient-primary hover:bg-gradient-secondary transition-all duration-300 hover:scale-105 shadow-medium hover:shadow-large">
            {showProspects ? <>
                <EyeOff className="h-5 w-5" />
                Ocultar Oportunidades
              </> : <>
                <Eye className="h-5 w-5" />
                Consultar oportunidades
              </>}
          </Button>
        </div>

        {showProspects && <div className="space-y-4 mt-6">
            {Object.entries(prospectsByRegion).map(([region, prospects]) => <div key={region} className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-foreground">{region}</h4>
                  <Badge variant="outline" className="ml-auto">
                    {prospects.length} {prospects.length === 1 ? 'lead' : 'leads'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prospects.map(prospect => <div key={prospect.id} className="p-4 bg-muted/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <div className="font-semibold text-foreground text-sm mb-3 border-b border-border/20 pb-2">
                        {prospect.name}
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2 text-xs text-muted-foreground custom-scrollbar">
                        <div><span className="font-medium text-foreground">Conhecimento Safras & Cifras:</span> {prospect.isClient}</div>
                        <div><span className="font-medium text-foreground">Idade:</span> {prospect.age}</div>
                        <div><span className="font-medium text-foreground">Região:</span> {prospect.region}</div>
                        <div><span className="font-medium text-foreground">Profissão:</span> {prospect.profession}</div>
                        <div><span className="font-medium text-foreground">Atividades:</span> {prospect.activities}</div>
                        <div><span className="font-medium text-foreground">Objetivos:</span> {prospect.objectives}</div>
                        <div><span className="font-medium text-foreground">Nível de Sucessão:</span> {prospect.successionLevel}</div>
                        <div><span className="font-medium text-foreground">Interesses:</span> {prospect.interests}</div>
                        {prospect.additionalTopics && (
                          <div><span className="font-medium text-foreground">Tópicos Adicionais:</span> {prospect.additionalTopics}</div>
                        )}
                        {prospect.expectations && (
                          <div><span className="font-medium text-foreground">Expectativas:</span> {prospect.expectations}</div>
                        )}
                      </div>
                    </div>)}
                </div>
              </div>)}
            
            {nonClients.length === 0 && <div className="text-center py-6 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Todos os participantes filtrados já são clientes da Safras & Cifras</p>
              </div>}
          </div>}
      </CardContent>
    </Card>;
};