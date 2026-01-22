import { useState } from "react";
import { usePageView } from "@/hooks/usePageView";
import { ExecutiveSidebar } from "@/components/home/ExecutiveSidebar";
import { ExecutiveHeader } from "@/components/home/ExecutiveHeader";
import { GlobalKPICards } from "@/components/home/GlobalKPICards";
import { FinancialSection } from "@/components/home/FinancialSection";
import { GeographicReachSection } from "@/components/home/GeographicReachSection";
import { FutureCoursesSection } from "@/components/home/FutureCoursesSection";
import { CoursesSection } from "@/components/home/CoursesSection";
import { cn } from "@/lib/utils";

const sectionTitles: Record<string, {
  title: string;
  subtitle: string;
}> = {
  overview: {
    title: "Visão Geral",
    subtitle: "Métricas consolidadas de todos os programas educacionais"
  },
  courses: {
    title: "Cursos",
    subtitle: "Selecione um curso para acessar informações detalhadas"
  },
  geographic: {
    title: "Alcance Geográfico",
    subtitle: "Distribuição de participantes por região"
  },
  performance: {
    title: "Performance",
    subtitle: "Análise de desempenho dos cursos"
  },
  financial: {
    title: "Financeiro",
    subtitle: "Visão consolidada de receitas e custos"
  }
};

const Home = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  usePageView('/');
  const currentSection = sectionTitles[activeSection] || sectionTitles.overview;
  
  const renderSectionContent = () => {
    switch (activeSection) {
      case "courses":
        return <CoursesSection />;
      case "geographic":
        return <GeographicReachSection />;
      case "performance":
        return <GeographicReachSection />;
      case "financial":
        return <FinancialSection />;
      case "overview":
      default:
        return <>
            <GlobalKPICards />
            <GeographicReachSection />
            <div>
              <h3 className="text-lg font-outfit font-semibold text-foreground mb-4">
                Visão Financeira
              </h3>
              <FinancialSection />
            </div>
            <FutureCoursesSection />
          </>;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ExecutiveSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Header */}
      <ExecutiveHeader 
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Content */}
      <main className={cn(
        "pt-24 pb-8 px-4 md:px-6 transition-all duration-300",
        "lg:ml-64" // sidebar width only on large screens
      )}>
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Page Title */}
          <div>
            <h2 className="text-xl md:text-2xl font-outfit font-bold text-foreground">
              {currentSection.title}
            </h2>
          </div>

          {/* Dynamic Content */}
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;