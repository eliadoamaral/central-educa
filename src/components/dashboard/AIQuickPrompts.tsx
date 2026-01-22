import { Button } from '@/components/ui/button';
import { DashboardType, QuickPrompt } from '@/types/ai-insights';
import { Target, TrendingUp, MapPin, Lightbulb, MessageCircle, Star, AlertTriangle, Users, BookOpen, BarChart } from 'lucide-react';

interface AIQuickPromptsProps {
  dashboardType: DashboardType;
  onSelectPrompt: (prompt: string) => void;
}

const profilePrompts: QuickPrompt[] = [
  {
    icon: 'target',
    label: 'Perfil predominante',
    prompt: 'Qual o perfil predominante dos participantes? Idade, região, experiência e objetivos principais.',
  },
  {
    icon: 'trending',
    label: 'Clientes vs Não-clientes',
    prompt: 'Compare o perfil de participantes que já são clientes versus os que não são. Identifique diferenças relevantes.',
  },
  {
    icon: 'map',
    label: 'Distribuição geográfica',
    prompt: 'Analise a distribuição geográfica dos participantes. Quais regiões e estados têm maior presença?',
  },
  {
    icon: 'lightbulb',
    label: 'Oportunidades de prospecção',
    prompt: 'Identifique oportunidades de prospecção entre os não-clientes. Quem tem perfil ideal para conversão?',
  },
  {
    icon: 'message',
    label: 'Principais objetivos',
    prompt: 'Quais são os principais objetivos que levaram os participantes a fazer o curso? Agrupe por temas.',
  },
];

const satisfactionPrompts: QuickPrompt[] = [
  {
    icon: 'star',
    label: 'Pontos mais elogiados',
    prompt: 'Quais foram os aspectos mais elogiados do curso? Liste os top 3 com suas respectivas notas.',
  },
  {
    icon: 'alert',
    label: 'Áreas de melhoria',
    prompt: 'Identifique as principais áreas de melhoria com base nas avaliações mais baixas. O que precisa ser ajustado?',
  },
  {
    icon: 'users',
    label: 'Comparação de instrutores',
    prompt: 'Compare a avaliação didática de todos os instrutores. Destaque pontos fortes de cada um.',
  },
  {
    icon: 'book',
    label: 'Interesse por novos temas',
    prompt: 'Quais temas futuros geraram mais interesse entre os participantes? Liste em ordem de preferência.',
  },
  {
    icon: 'chart',
    label: 'Resumo executivo',
    prompt: 'Gere um resumo executivo das avaliações: nota geral, destaques positivos e principais oportunidades de melhoria.',
  },
];

const iconMap: Record<string, any> = {
  target: Target,
  trending: TrendingUp,
  map: MapPin,
  lightbulb: Lightbulb,
  message: MessageCircle,
  star: Star,
  alert: AlertTriangle,
  users: Users,
  book: BookOpen,
  chart: BarChart,
};

export const AIQuickPrompts = ({ dashboardType, onSelectPrompt }: AIQuickPromptsProps) => {
  const prompts = dashboardType === 'profile' ? profilePrompts : satisfactionPrompts;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium px-1">
        Sugestões rápidas:
      </p>
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt, index) => {
          const Icon = iconMap[prompt.icon];
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start min-h-[44px] py-2.5 px-3 text-left hover:bg-accent active:scale-95 transition-transform"
              onClick={() => onSelectPrompt(prompt.prompt)}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{prompt.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
