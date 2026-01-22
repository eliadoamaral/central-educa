import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Copy, Check, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface ColorToken {
  name: string;
  variable: string;
  description: string;
  usage: string[];
}

interface ColorSection {
  title: string;
  description: string;
  colors: ColorToken[];
}

const colorSections: ColorSection[] = [
  {
    title: "Cores Base",
    description: "Cores fundamentais do sistema usadas em backgrounds e textos principais",
    colors: [
      {
        name: "Background",
        variable: "--background",
        description: "Fundo principal da aplicação",
        usage: ["Fundo de páginas", "Áreas de conteúdo principal"]
      },
      {
        name: "Foreground",
        variable: "--foreground",
        description: "Cor principal de texto",
        usage: ["Títulos", "Texto de corpo", "Ícones principais"]
      },
      {
        name: "Card",
        variable: "--card",
        description: "Fundo de cards e containers",
        usage: ["Cards", "Modais", "Dropdowns"]
      },
      {
        name: "Card Foreground",
        variable: "--card-foreground",
        description: "Texto dentro de cards",
        usage: ["Títulos de cards", "Conteúdo de cards"]
      },
      {
        name: "Popover",
        variable: "--popover",
        description: "Fundo de popovers e tooltips",
        usage: ["Tooltips", "Menus dropdown", "Popovers"]
      },
      {
        name: "Popover Foreground",
        variable: "--popover-foreground",
        description: "Texto em popovers",
        usage: ["Texto de menus", "Labels de tooltips"]
      }
    ]
  },
  {
    title: "Cores Primárias",
    description: "Azul profissional - cor principal da marca e ações primárias",
    colors: [
      {
        name: "Primary",
        variable: "--primary",
        description: "Cor primária principal (Azul Profissional)",
        usage: ["Botões primários", "Links", "Elementos de destaque", "Ícones ativos"]
      },
      {
        name: "Primary Foreground",
        variable: "--primary-foreground",
        description: "Texto sobre fundo primário",
        usage: ["Texto em botões primários", "Ícones sobre fundo primário"]
      },
      {
        name: "Primary Hover",
        variable: "--primary-hover",
        description: "Estado hover da cor primária",
        usage: ["Hover de botões", "Hover de links"]
      },
      {
        name: "Primary Light",
        variable: "--primary-light",
        description: "Versão clara da cor primária",
        usage: ["Backgrounds sutis", "Badges leves", "Estados selecionados"]
      }
    ]
  },
  {
    title: "Cores Secundárias",
    description: "Dourado elegante - usado para destaques e elementos premium",
    colors: [
      {
        name: "Secondary",
        variable: "--secondary",
        description: "Cor secundária (Dourado Elegante)",
        usage: ["Botões secundários", "Destaques premium", "Ícones especiais"]
      },
      {
        name: "Secondary Foreground",
        variable: "--secondary-foreground",
        description: "Texto sobre fundo secundário",
        usage: ["Texto em botões secundários"]
      },
      {
        name: "Secondary Hover",
        variable: "--secondary-hover",
        description: "Estado hover da cor secundária",
        usage: ["Hover de elementos secundários"]
      },
      {
        name: "Secondary Light",
        variable: "--secondary-light",
        description: "Versão clara da cor secundária",
        usage: ["Backgrounds de destaque", "Áreas premium"]
      }
    ]
  },
  {
    title: "Cores Terciárias",
    description: "Slate elegante - usado para elementos neutros e complementares",
    colors: [
      {
        name: "Tertiary",
        variable: "--tertiary",
        description: "Cor terciária (Slate Elegante)",
        usage: ["Elementos neutros", "Textos secundários fortes"]
      },
      {
        name: "Tertiary Foreground",
        variable: "--tertiary-foreground",
        description: "Texto sobre fundo terciário",
        usage: ["Texto sobre elementos terciários"]
      },
      {
        name: "Tertiary Light",
        variable: "--tertiary-light",
        description: "Versão clara da cor terciária",
        usage: ["Backgrounds neutros sutis"]
      }
    ]
  },
  {
    title: "Cores de Estado",
    description: "Cores para feedback e estados do sistema",
    colors: [
      {
        name: "Muted",
        variable: "--muted",
        description: "Fundo para elementos menos importantes",
        usage: ["Backgrounds desabilitados", "Áreas de baixa ênfase"]
      },
      {
        name: "Muted Foreground",
        variable: "--muted-foreground",
        description: "Texto secundário/labels",
        usage: ["Labels", "Texto de ajuda", "Placeholders", "Metadados"]
      },
      {
        name: "Accent",
        variable: "--accent",
        description: "Cor de destaque complementar",
        usage: ["Elementos de foco", "Destaques sutis"]
      },
      {
        name: "Accent Foreground",
        variable: "--accent-foreground",
        description: "Texto sobre fundo accent",
        usage: ["Texto sobre elementos accent"]
      },
      {
        name: "Destructive",
        variable: "--destructive",
        description: "Ações destrutivas e erros",
        usage: ["Botões de deletar", "Mensagens de erro", "Alertas críticos"]
      },
      {
        name: "Destructive Foreground",
        variable: "--destructive-foreground",
        description: "Texto sobre fundo destrutivo",
        usage: ["Texto em botões de erro"]
      }
    ]
  },
  {
    title: "Cores de Interface",
    description: "Bordas, inputs e elementos de UI",
    colors: [
      {
        name: "Border",
        variable: "--border",
        description: "Cor de bordas padrão",
        usage: ["Bordas de cards", "Separadores", "Divisores"]
      },
      {
        name: "Input",
        variable: "--input",
        description: "Bordas de inputs",
        usage: ["Campos de formulário", "Selects", "Textareas"]
      },
      {
        name: "Ring",
        variable: "--ring",
        description: "Anel de foco",
        usage: ["Estado de foco", "Indicadores de acessibilidade"]
      }
    ]
  },
  {
    title: "Cores de Gráficos",
    description: "Paleta de cores para visualização de dados (gradiente de azul)",
    colors: [
      { name: "Chart 1", variable: "--chart-1", description: "Cor mais clara do gradiente", usage: ["Valores menores", "Backgrounds de gráficos"] },
      { name: "Chart 2", variable: "--chart-2", description: "Segunda cor do gradiente", usage: ["Séries secundárias"] },
      { name: "Chart 3", variable: "--chart-3", description: "Terceira cor do gradiente", usage: ["Séries terciárias"] },
      { name: "Chart 4", variable: "--chart-4", description: "Cor intermediária", usage: ["Séries de dados"] },
      { name: "Chart 5", variable: "--chart-5", description: "Cor central do gradiente", usage: ["Valores médios"] },
      { name: "Chart 6", variable: "--chart-6", description: "Cor acima da média", usage: ["Destaques em gráficos"] },
      { name: "Chart 7", variable: "--chart-7", description: "Cor escura", usage: ["Valores altos"] },
      { name: "Chart 8", variable: "--chart-8", description: "Cor mais escura", usage: ["Valores mais altos"] },
      { name: "Chart 9", variable: "--chart-9", description: "Segunda mais escura", usage: ["Valores muito altos"] },
      { name: "Chart 10", variable: "--chart-10", description: "Cor mais escura do gradiente", usage: ["Valores máximos"] }
    ]
  },
  {
    title: "Cores de Sidebar",
    description: "Cores específicas para navegação lateral",
    colors: [
      { name: "Sidebar Background", variable: "--sidebar-background", description: "Fundo da sidebar", usage: ["Menu lateral"] },
      { name: "Sidebar Foreground", variable: "--sidebar-foreground", description: "Texto da sidebar", usage: ["Links de navegação"] },
      { name: "Sidebar Primary", variable: "--sidebar-primary", description: "Cor primária na sidebar", usage: ["Item ativo"] },
      { name: "Sidebar Accent", variable: "--sidebar-accent", description: "Cor de hover na sidebar", usage: ["Hover de itens"] },
      { name: "Sidebar Border", variable: "--sidebar-border", description: "Bordas na sidebar", usage: ["Separadores de seção"] }
    ]
  }
];

const gradients = [
  { name: "Gradient Primary", variable: "--gradient-primary", description: "Gradiente principal para CTAs e headers" },
  { name: "Gradient Secondary", variable: "--gradient-secondary", description: "Gradiente secundário dourado" },
  { name: "Gradient Background", variable: "--gradient-background", description: "Gradiente sutil de fundo" },
  { name: "Gradient Hero", variable: "--gradient-hero", description: "Gradiente para seções hero" },
  { name: "Gradient Card Hover", variable: "--gradient-card-hover", description: "Gradiente para hover de cards" },
  { name: "Gradient Subtle", variable: "--gradient-subtle", description: "Gradiente extremamente sutil" },
  { name: "Gradient Glass", variable: "--gradient-glass", description: "Efeito glassmorphism" }
];

const shadows = [
  { name: "Shadow Soft", variable: "--shadow-soft", description: "Sombra sutil para elementos leves" },
  { name: "Shadow Medium", variable: "--shadow-medium", description: "Sombra média para cards" },
  { name: "Shadow Large", variable: "--shadow-large", description: "Sombra grande para modais" },
  { name: "Shadow Glow", variable: "--shadow-glow", description: "Efeito de brilho primário" },
  { name: "Shadow Elegant", variable: "--shadow-elegant", description: "Sombra elegante para cards premium" },
  { name: "Shadow Glow LG", variable: "--shadow-glow-lg", description: "Brilho grande para destaques" }
];

function ColorSwatch({ token }: { token: ColorToken }) {
  const [copied, setCopied] = useState(false);

  const copyVariable = () => {
    navigator.clipboard.writeText(`hsl(var(${token.variable}))`);
    setCopied(true);
    toast.success(`Copiado: ${token.variable}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col gap-2 p-4 rounded-lg border bg-card hover:shadow-medium transition-all">
      <div className="flex items-start justify-between gap-2">
        <div 
          className="w-16 h-16 rounded-lg border shadow-soft flex-shrink-0"
          style={{ backgroundColor: `hsl(var(${token.variable}))` }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyVariable}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="space-y-1">
        <h4 className="font-medium text-sm">{token.name}</h4>
        <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {token.variable}
        </code>
      </div>
      
      <p className="text-xs text-muted-foreground">{token.description}</p>
      
      <div className="flex flex-wrap gap-1">
        {token.usage.map((use, i) => (
          <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
            {use}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function GradientSwatch({ name, variable, description }: { name: string; variable: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const copyVariable = () => {
    navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    toast.success(`Copiado: ${variable}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col gap-2 p-4 rounded-lg border bg-card hover:shadow-medium transition-all">
      <div className="flex items-start justify-between gap-2">
        <div 
          className="w-full h-16 rounded-lg border shadow-soft"
          style={{ background: `var(${variable})` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{name}</h4>
          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {variable}
          </code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyVariable}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ShadowSwatch({ name, variable, description }: { name: string; variable: string; description: string }) {
  const [copied, setCopied] = useState(false);

  const copyVariable = () => {
    navigator.clipboard.writeText(`var(${variable})`);
    setCopied(true);
    toast.success(`Copiado: ${variable}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col gap-2 p-4 rounded-lg border bg-card hover:shadow-medium transition-all">
      <div 
        className="w-full h-16 rounded-lg bg-background border"
        style={{ boxShadow: `var(${variable})` }}
      />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{name}</h4>
          <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {variable}
          </code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyVariable}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function TypographySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tipografia
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Classes de texto semânticas para uso consistente
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-foreground text-lg font-medium mb-1">text-foreground</p>
            <p className="text-foreground">Texto principal - usado para títulos, corpo de texto e conteúdo importante</p>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
              className="text-foreground"
            </code>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-muted-foreground text-lg font-medium mb-1">text-muted-foreground</p>
            <p className="text-muted-foreground">Texto secundário - usado para labels, descrições, metadados e texto de ajuda</p>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
              className="text-muted-foreground"
            </code>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-primary text-lg font-medium mb-1">text-primary</p>
            <p className="text-primary">Texto primário - usado para links, destaques e elementos interativos</p>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
              className="text-primary"
            </code>
          </div>
          
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-destructive text-lg font-medium mb-1">text-destructive</p>
            <p className="text-destructive">Texto destrutivo - usado para erros, alertas e ações perigosas</p>
            <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mt-2 inline-block">
              className="text-destructive"
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ButtonsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Botões</CardTitle>
        <p className="text-sm text-muted-foreground">
          Variantes de botões do design system
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Button>Default</Button>
            <p className="text-xs text-muted-foreground">variant="default"</p>
          </div>
          <div className="space-y-2">
            <Button variant="secondary">Secondary</Button>
            <p className="text-xs text-muted-foreground">variant="secondary"</p>
          </div>
          <div className="space-y-2">
            <Button variant="destructive">Destructive</Button>
            <p className="text-xs text-muted-foreground">variant="destructive"</p>
          </div>
          <div className="space-y-2">
            <Button variant="outline">Outline</Button>
            <p className="text-xs text-muted-foreground">variant="outline"</p>
          </div>
          <div className="space-y-2">
            <Button variant="ghost">Ghost</Button>
            <p className="text-xs text-muted-foreground">variant="ghost"</p>
          </div>
          <div className="space-y-2">
            <Button variant="link">Link</Button>
            <p className="text-xs text-muted-foreground">variant="link"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <p className="text-sm text-muted-foreground">
          Variantes de badges para status e categorias
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Badge>Default</Badge>
            <p className="text-xs text-muted-foreground">variant="default"</p>
          </div>
          <div className="space-y-2">
            <Badge variant="secondary">Secondary</Badge>
            <p className="text-xs text-muted-foreground">variant="secondary"</p>
          </div>
          <div className="space-y-2">
            <Badge variant="destructive">Destructive</Badge>
            <p className="text-xs text-muted-foreground">variant="destructive"</p>
          </div>
          <div className="space-y-2">
            <Badge variant="outline">Outline</Badge>
            <p className="text-xs text-muted-foreground">variant="outline"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CardAnimationLab() {
  const cardVariants = [
    {
      name: "Suave Elegante",
      description: "Translação leve + sombra suave (500ms)",
      className: "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
    },
    {
      name: "Rápido Sutil",
      description: "Movimento mínimo (300ms)",
      className: "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-medium"
    },
    {
      name: "Lento Premium",
      description: "Translação maior + duração longa (700ms)",
      className: "transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-large"
    },
    {
      name: "Scale Suave",
      description: "Escala sutil sem translação (500ms)",
      className: "transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-lg"
    },
    {
      name: "Glow Primary",
      description: "Efeito de brilho primário (500ms)",
      className: "transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)]"
    },
    {
      name: "Glow Intenso",
      description: "Brilho mais forte + borda colorida (600ms)",
      className: "transition-all duration-600 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.5)] hover:border-primary/50"
    },
    {
      name: "Border Glow",
      description: "Foco na borda com glow sutil (500ms)",
      className: "transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
      recommended: true
    },
    {
      name: "Combinado Completo",
      description: "Scale + Translate + Glow (600ms)",
      className: "transition-all duration-600 ease-out hover:scale-[1.01] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_-12px_hsl(var(--primary)/0.35)] hover:border-primary/40"
    },
    {
      name: "Spring Effect",
      description: "Efeito de mola com cubic-bezier (500ms)",
      className: "transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1.5 hover:shadow-lg"
    },
    {
      name: "Lift Elegante",
      description: "Elevação com sombra difusa (550ms)",
      className: "transition-all duration-[550ms] ease-out hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)]"
    },
    {
      name: "Minimal Clean",
      description: "Apenas sombra, sem movimento (400ms)",
      className: "transition-shadow duration-400 ease-out hover:shadow-elegant"
    },
    {
      name: "Icon Scale Combo",
      description: "Card + ícone interno escala (500ms)",
      className: "group transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg",
      hasIconAnimation: true
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 Card Animation Lab
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Teste diferentes combinações de animações e hover effects para definir o padrão do sistema
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cardVariants.map((variant, index) => (
            <Card
              key={index}
              className={`relative cursor-pointer border shadow-soft overflow-visible ${variant.className} ${variant.recommended ? 'ring-2 ring-primary/30 ring-offset-2' : ''}`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-soft ${
                    variant.hasIconAnimation 
                      ? 'transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-medium' 
                      : ''
                  }`}
                >
                  <span className="text-white font-bold text-lg">{index + 1}</span>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{variant.name}</h3>
                    {variant.recommended && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {variant.description}
                  </p>
                </div>

                {/* Fake Button */}
                <div className="h-9 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">Visualizar</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Code Reference */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium text-sm mb-3">Classes Tailwind Recomendadas:</h4>
          <div className="space-y-2">
            <code className="block text-xs bg-background p-2 rounded border">
              {`/* Border Glow - Recomendado */`}
              <br />
              {`transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]`}
            </code>
            <code className="block text-xs bg-background p-2 rounded border">
              {`/* Suave Elegante */`}
              <br />
              {`transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30`}
            </code>
            <code className="block text-xs bg-background p-2 rounded border">
              {`/* Ícone interno (adicione 'group' ao card) */`}
              <br />
              {`transition-all duration-500 ease-out group-hover:scale-105 group-hover:shadow-medium`}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DesignSystem() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Design System</h1>
                <p className="text-sm text-muted-foreground">
                  Documentação visual de cores, tipografia e componentes
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-8 space-y-12">
          {/* Color Sections */}
          {colorSections.map((section, index) => (
            <section key={index}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">{section.title}</h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.colors.map((color, i) => (
                  <ColorSwatch key={i} token={color} />
                ))}
              </div>
              {index < colorSections.length - 1 && <Separator className="mt-8" />}
            </section>
          ))}

          <Separator />

          {/* Gradients */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Gradientes</h2>
              <p className="text-muted-foreground">Gradientes para fundos, cards e elementos especiais</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gradients.map((gradient, i) => (
                <GradientSwatch key={i} {...gradient} />
              ))}
            </div>
          </section>

          <Separator />

          {/* Shadows */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Sombras</h2>
              <p className="text-muted-foreground">Níveis de elevação para criar hierarquia visual</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shadows.map((shadow, i) => (
                <ShadowSwatch key={i} {...shadow} />
              ))}
            </div>
          </section>

          <Separator />

          {/* Typography */}
          <TypographySection />

          <Separator />

          {/* Buttons */}
          <ButtonsSection />

          <Separator />

          {/* Badges */}
          <BadgesSection />

          <Separator />

          {/* Card Animation Lab */}
          <CardAnimationLab />

          {/* Usage Guide */}
          <Card className="bg-primary-light border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Como Usar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Em CSS/Tailwind:</h4>
                <code className="block bg-muted p-3 rounded-lg text-muted-foreground">
                  {`/* Cor de fundo */
bg-primary
bg-secondary
bg-muted

/* Cor de texto */
text-foreground
text-muted-foreground
text-primary

/* Bordas */
border-border
border-primary`}
                </code>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Em CSS customizado:</h4>
                <code className="block bg-muted p-3 rounded-lg text-muted-foreground">
                  {`.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  box-shadow: var(--shadow-elegant);
}`}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
