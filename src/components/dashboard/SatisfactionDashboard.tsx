import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";
import { usePageView } from "@/hooks/usePageView";
import { SatisfactionOverviewCards } from "./SatisfactionOverviewCards";
import { RatingDistributionChart } from "./RatingDistributionChart";
import { DimensionComparisonChart } from "./DimensionComparisonChart";
import { FeedbackCommentsCard } from "./FeedbackCommentsCard";
import { WhatsAppCard } from "./WhatsAppCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { parseSatisfactionCSV, getRatingDistribution, getContentRatings, getDidacticRatings, getComments, getWhatsAppComments, getTopicInterests, getCoursePreferences } from "@/utils/satisfactionParser";
import { AIInsightsDrawer } from "./AIInsightsDrawer";
import { AIInsightsContext } from "@/types/ai-insights";
import { useState } from "react";
export const SatisfactionDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const metrics = parseSatisfactionCSV("");
  usePageView(location.pathname);
  const comments = getComments();
  const whatsappComments = getWhatsAppComments();
  const topicInterests = getTopicInterests();
  const coursePreferences = getCoursePreferences();
  const infrastructureDimensions = [getRatingDistribution("support"), getRatingDistribution("infrastructure"), getRatingDistribution("materials"), getRatingDistribution("food")];
  const contentRatings = getContentRatings();
  const didacticRatings = getDidacticRatings();
  const topicData = topicInterests.map(t => ({
    name: t.topic,
    value: t.count,
    percentage: t.percentage
  }));
  const modeData = coursePreferences.mode;
  const formatData = coursePreferences.format;
  return <div className="min-h-screen bg-background">
      <div className="bg-primary shadow-soft border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-primary/95">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 p-2 transition-colors" aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="space-y-0.5">
                <h1 className="text-lg md:text-2xl font-bold leading-tight text-white">
                  Pesquisa de Satisfação - Sucessores do Agro 2025
                </h1>
                <p className="text-xs md:text-sm text-white/80 mt-1">Avaliação e feedback dos participantes da 8ª Edição.</p>
                <a href="https://docs.google.com/spreadsheets/d/1k7AA_HffhXHqx0VMmdsnnp8wKE_K-UYMDnGRx0g14qo/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors mt-1.5">
                  <FileText className="h-3 w-3" />
                  Ver planilha de respostas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <div className="w-full space-y-8">
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-6">Visão Geral</h2>
            <SatisfactionOverviewCards totalResponses={metrics.totalResponses} averageRating={metrics.averageOverallRating} recommendationRate={metrics.recommendationRate} topDimensionRating={4.91} />
          </section>

          {/* <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Avaliação da Experiência Geral
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RatingDistributionChart data={getRatingDistribution("overall")} />
              <DimensionComparisonChart
                title="Dimensões de Infraestrutura"
                data={infrastructureDimensions}
              />
            </div>
           </section> */}

          <section className="animate-fade-in" style={{
          animationDelay: "100ms"
        }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Avaliação detalhada por área
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RatingDistributionChart data={getRatingDistribution("support")} />
              <RatingDistributionChart data={getRatingDistribution("materials")} />
              <RatingDistributionChart data={getRatingDistribution("infrastructure")} />
              <RatingDistributionChart data={getRatingDistribution("food")} />
            </div>
          </section>

          <section className="animate-fade-in" style={{
          animationDelay: "150ms"
        }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Avaliação por conteúdo e instrutor
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aula Inaugural: Início da Jornada - Desafios e Oportunidades dos Sucessores do Agro
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Instrutor: Sandro Elias</p>
              </div>
              <RatingDistributionChart data={contentRatings.find(r => r.dimension === "Aula Inaugural")!} customTitle="Conteúdo" />
              <RatingDistributionChart data={didacticRatings.find(r => r.dimension === "Sandro Elias")!} customTitle="Didática e clareza" />

              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aula 1: Holding Rural - Gestão, Sociedade e Sucessão
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Instrutor: Alessandra Braga</p>
              </div>
              <RatingDistributionChart data={contentRatings.find(r => r.dimension === "Patrimonial")!} customTitle="Conteúdo" />
              <RatingDistributionChart data={didacticRatings.find(r => r.dimension === "Alessandra Braga")!} customTitle="Didática e clareza" />

              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aula 2: Gestão Contábil e Reforma Tributária
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Instrutor: Daniel Chiechelski</p>
              </div>
              <RatingDistributionChart data={contentRatings.find(r => r.dimension === "Gestão Contábil e Reforma Tributária")!} customTitle="Conteúdo" />
              <RatingDistributionChart data={didacticRatings.find(r => r.dimension === "Daniel Chiechelski")!} customTitle="Didática e clareza" />

              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aula 3: Gestão e Governança em Empresas Rurais Familiares
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Instrutor: Vanessa Alam</p>
              </div>
              <RatingDistributionChart data={contentRatings.find(r => r.dimension === "Governança")!} customTitle="Conteúdo" />
              <RatingDistributionChart data={didacticRatings.find(r => r.dimension === "Vanessa Alam")!} customTitle="Didática e clareza" />

              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aula 4: Gestão Financeira Estratégica na Atividade Rural
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Instrutor: Vinícius Kaefer</p>
              </div>
              <RatingDistributionChart data={contentRatings.find(r => r.dimension === "Gestão Econômica e Financeira")!} customTitle="Conteúdo" />
              <RatingDistributionChart data={didacticRatings.find(r => r.dimension === "Vinícius Kaefer")!} customTitle="Didática e clareza" />
            </div>
          </section>

          <section className="animate-fade-in" style={{
          animationDelay: "200ms"
        }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Interesses e preferências
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HorizontalBarChart title="Temas de Interesse para Cursos Futuros" data={topicData} maxItems={10} />
              <div className="space-y-6">
                <HorizontalBarChart title="Preferência de Modalidade" data={modeData} maxItems={10} />
                <HorizontalBarChart title="Preferência de Formato" data={formatData} maxItems={10} />
              </div>
            </div>
          </section>

          <section className="animate-fade-in" style={{
          animationDelay: "250ms"
        }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Feedback Qualitativo
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WhatsAppCard comments={whatsappComments} />
              <FeedbackCommentsCard comments={comments} />
            </div>
          </section>
        </div>
      </div>

      {/* AI Insights Floating Button */}
      <Button onClick={() => setAiDrawerOpen(true)} size="lg" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all z-50" aria-label="Abrir assistente de IA">
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* AI Insights Drawer */}
      <AIInsightsDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} context={{
      dashboardType: 'satisfaction',
      totalResponses: metrics.totalResponses,
      averageRating: metrics.averageOverallRating,
      recommendationRate: metrics.recommendationRate,
      metrics: {
        support: metrics.supportAverage,
        infrastructure: metrics.infrastructureAverage,
        materials: metrics.materialsAverage,
        food: metrics.foodAverage,
        contentAverages: metrics.contentAverages,
        didacticAverages: metrics.didacticAverages,
        topicInterests: topicInterests.slice(0, 5),
        coursePreferences: {
          mode: modeData,
          format: formatData
        }
      }
    }} />
    </div>;
};