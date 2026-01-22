import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Link as LinkIcon, Eye } from "lucide-react";
import { ScoredParticipant, scorePotentialClients } from "@/utils/scoringSystem";
import { ParticipantData } from "@/types/dashboard";
import { splitMultipleChoices } from "@/utils/csvParser";
import { toast } from "sonner";

interface ProspectingDrawerProps {
  participants: ParticipantData[];
}

export const ProspectingDrawer = ({ participants }: ProspectingDrawerProps) => {
  const [open, setOpen] = useState(false);
  const prospects = scorePotentialClients(participants);

  const getScoreBadgeColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return 'bg-primary text-white hover:bg-primary/90';
      case 'Médio-Alto':
        return 'bg-tertiary text-white hover:bg-tertiary/90';
      case 'Médio':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
      default:
        return 'bg-muted-foreground text-white hover:bg-muted-foreground/90';
    }
  };

  const exportCSV = () => {
    const headers = ['Nome', 'Região', 'Principais Atividades', 'Tema de Interesse', 'Nível de Sucessão', 'Experiência no Agro', 'Score', 'Nível'];
    const rows = prospects.map(p => [
      p.name,
      p.region,
      splitMultipleChoices(p.activities)[0] || 'N/A',
      splitMultipleChoices(p.interests)[0] || 'N/A',
      p.successionLevel,
      p.experience,
      p.score.toString(),
      p.scoreLevel
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oportunidades-prospeccao.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const exportPDF = () => {
    toast.info("Funcionalidade de exportação para PDF em desenvolvimento");
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Eye className="h-4 w-4" />
          Consultar oportunidades
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Oportunidades de Prospecção</SheetTitle>
          <SheetDescription>
            Leads potenciais classificados por score de prioridade
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 my-4">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Copiar link
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Região</TableHead>
                <TableHead>Atividade Principal</TableHead>
                <TableHead>Interesse</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Experiência</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.name}</TableCell>
                  <TableCell>{prospect.region}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {splitMultipleChoices(prospect.activities)[0] || 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {splitMultipleChoices(prospect.interests)[0] || 'N/A'}
                  </TableCell>
                  <TableCell>{prospect.successionLevel}</TableCell>
                  <TableCell>{prospect.experience}</TableCell>
                  <TableCell>
                    <Badge className={getScoreBadgeColor(prospect.scoreLevel)}>
                      {prospect.score} - {prospect.scoreLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Detalhes de ${prospect.name}`)}
                    >
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
};
