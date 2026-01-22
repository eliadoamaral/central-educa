import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import educasafrasLogo from "@/assets/educasafras-main-logo.png";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border/50 flex items-center justify-between px-4 md:px-6 z-50">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <img src={educasafrasLogo} alt="Logo" className="h-8 md:h-10" />
        <div className="hidden sm:block h-6 w-px bg-border" />
        <h1 className="hidden sm:block text-lg md:text-xl font-outfit font-semibold text-foreground">
          Painel Administrativo
        </h1>
      </div>
    </header>
  );
};
