import { BarChart, Users, Activity, Settings, X, FileText, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const sections = [
  { id: 'overview', label: 'Visão Geral', icon: BarChart },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'activity', label: 'Atividade do Sistema', icon: Activity },
  { id: 'audit', label: 'Auditoria', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const AdminSidebar = ({ activeSection, onSectionChange, mobileOpen, onMobileClose }: AdminSidebarProps) => {
  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    onMobileClose?.();
  };

  const sidebarContent = (
    <nav className="p-4 space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        
        return (
          <button key={section.id} onClick={() => handleSectionChange(section.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all", isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
            <Icon className="h-5 w-5" />
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border/50 overflow-y-auto">
        {sidebarContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-outfit font-semibold text-foreground">Menu</h2>
            <button onClick={onMobileClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
};
