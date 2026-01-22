import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  GraduationCap, 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  Users,
  LogOut,
  Shield,
  Map,
  Bell,
  Trash2,
  Check,
  Loader2,
  User,
  ChevronDown,
  Menu,
  X,
  Megaphone,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route?: string;
  section?: string;
  requiresFullAccess?: boolean;
}

interface ExecutiveSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const menuItems: MenuItem[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard, section: "overview", requiresFullAccess: true },
  { id: "students", label: "Alunos", icon: Users, route: "/alunos", requiresFullAccess: true },
  { id: "prospecting", label: "Prospecção", icon: Target, route: "/prospeccao", requiresFullAccess: true },
  { id: "marketing", label: "Marketing", icon: Megaphone, route: "/marketing", requiresFullAccess: true },
  { id: "courses", label: "Cursos", icon: GraduationCap, section: "courses", requiresFullAccess: false },
  { id: "financial", label: "Financeiro", icon: DollarSign, section: "financial", requiresFullAccess: true },
  { id: "geographic", label: "Alcance Geográfico", icon: Map, section: "geographic", requiresFullAccess: true },
];

export const ExecutiveSidebar = ({ activeSection, onSectionChange, mobileOpen, onMobileClose }: ExecutiveSidebarProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isAdmin, hasFullAccess } = useUserPermissions();
  const { profile } = useUserProfile();
  const {
    notifications,
    loading: notificationsLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getTimeAgo
  } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  
  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => 
    !item.requiresFullAccess || hasFullAccess
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logout realizado" });
    navigate("/auth");
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.route) {
      navigate(item.route);
    } else if (item.section) {
      onSectionChange(item.section);
    }
    onMobileClose?.();
  };

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-border/50 px-4",
        collapsed && !isMobile ? "justify-center" : "gap-3"
      )}>
        <img 
          src={educasafrasLogo} 
          alt="EducaSafras" 
          className={cn("transition-all duration-300", collapsed && !isMobile ? "h-8 w-8" : "h-10")} 
        />
        {(!collapsed || isMobile) && (
          <span className="font-outfit font-semibold text-foreground text-lg">EducaSafras</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.section;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  collapsed && !isMobile ? "justify-center" : "",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Admin Link */}
        {isAdmin && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <button
              onClick={() => {
                navigate("/admin");
                onMobileClose?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && !isMobile ? "justify-center" : ""
              )}
              title={collapsed && !isMobile ? "Administração" : undefined}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="text-sm font-medium">Administração</span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Footer with User Actions */}
      <div className="border-t border-border/50 p-2 space-y-2">
        {/* Quick Actions Row - Notifications & Theme */}
        <div className={cn(
          "flex items-center gap-1 px-1",
          collapsed && !isMobile ? "flex-col" : "justify-center"
        )}>
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="relative p-2 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Notificações"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side={isMobile ? "top" : "right"} className="w-80 p-0 bg-background border border-border shadow-lg z-50">
              <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-foreground">Notificações</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary h-auto py-1 px-2"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
              </DropdownMenuLabel>
              
              <ScrollArea className="h-[300px]">
                {notificationsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <p className="text-sm">Carregando...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            notification.read ? "bg-muted-foreground/30" : "bg-primary"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm text-foreground",
                              !notification.read && "font-medium"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {getTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && !isMobile ? "justify-center" : ""
              )}
              title={collapsed && !isMobile ? profile?.name || "Usuário" : undefined}
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-white text-xs font-medium">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              {(!collapsed || isMobile) && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isMobile ? "top" : "right"} className="w-56 bg-background border border-border shadow-lg z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">{profile?.name || user?.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              navigate("/perfil");
              onMobileClose?.();
            }} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex fixed left-0 top-0 bottom-0 z-50 bg-background border-r border-border/50 flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent(false)}
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>
    </>
  );
};
