import { FileText, BookOpen, Archive, Sparkles, Database, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Doc {
  id: string;
  title: string;
  file: string;
  icon: React.ElementType;
}

const docs: Doc[] = [
  { id: "readme", title: "Introdução", file: "README.md", icon: FileText },
  { id: "changelog", title: "Histórico de Versões", file: "CHANGELOG.md", icon: Archive },
  { id: "architecture", title: "Arquitetura Técnica", file: "ARCHITECTURE.md", icon: BookOpen },
  { id: "features", title: "Funcionalidades", file: "FEATURES.md", icon: Sparkles },
  { id: "database", title: "Banco de Dados", file: "DATABASE.md", icon: Database },
  { id: "security", title: "Segurança", file: "SECURITY.md", icon: Shield },
];

interface DocumentationSidebarProps {
  activeDoc: string;
  onSelectDoc: (docId: string) => void;
}

export const DocumentationSidebar = ({ activeDoc, onSelectDoc }: DocumentationSidebarProps) => {
  return (
    <nav className="space-y-1">
      <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">
        Documentação do Sistema
      </h3>
      {docs.map((doc) => {
        const Icon = doc.icon;
        const isActive = activeDoc === doc.id;
        
        return (
          <button
            key={doc.id}
            onClick={() => onSelectDoc(doc.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{doc.title}</span>
          </button>
        );
      })}
    </nav>
  );
};

export const getDocFile = (docId: string): string => {
  const doc = docs.find(d => d.id === docId);
  return doc?.file || "README.md";
};
