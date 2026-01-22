import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SystemMetricsCards } from "@/components/admin/SystemMetricsCards";
import { AccessChart } from "@/components/admin/AccessChart";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import { ActivityTimeline } from "@/components/admin/ActivityTimeline";
import { AdminAuditTimeline } from "@/components/admin/AdminAuditTimeline";
import { AdminSettings } from "@/components/admin/settings/AdminSettings";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { usePageView } from "@/hooks/usePageView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserActivity {
  id: string;
  name: string;
  email: string;
  created_at: string;
  role: string;
  total_logins: number;
  last_login: string | null;
  total_page_views: number;
}

const AdminDashboard = () => {
  usePageView('/admin');
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { metrics, userActivity, dailyStats, loading: metricsLoading, refetch } = useSystemMetrics();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [serverVerified, setServerVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Server-side admin verification on mount
  useEffect(() => {
    const verifyAdminOnServer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setServerVerified(false);
          setVerifying(false);
          return;
        }

        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) throw error;
        setServerVerified(data || false);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying admin on server:', error);
        }
        setServerVerified(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyAdminOnServer();
  }, []);

  // Loading state
  if (adminLoading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not admin (client or server check)
  if (!isAdmin || !serverVerified) {
    return <Navigate to="/" replace />;
  }

  const handleViewUserDetails = (user: UserActivity) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => navigate("/")} 
            className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-300 font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Central
          </Button>
          {/* Visão Geral Section */}
          {activeSection === 'overview' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">
                  Visão Geral do Sistema
                </h2>
                <p className="text-muted-foreground">
                  Acompanhe as principais métricas e atividades da plataforma
                </p>
              </div>

              {metricsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : metrics ? (
                <>
                  {/* KPI Cards */}
                  <SystemMetricsCards
                    totalUsers={metrics.total_users}
                    activeToday={metrics.active_today}
                    totalLogins={metrics.total_logins}
                    lastActivity={metrics.last_activity}
                  />

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AccessChart data={dailyStats} />
                    <ActivityTimeline />
                  </div>

                  {/* Users Table */}
                  <UserManagementTable onViewDetails={handleViewUserDetails} onUserChanged={refetch} />
                </>
              ) : (
              <div className="text-center py-12 text-muted-foreground">
                  Erro ao carregar métricas do sistema
                </div>
              )}
            </>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">
                  Gestão de Usuários
                </h2>
                <p className="text-muted-foreground">
                  Visualize e gerencie todos os usuários da plataforma
                </p>
              </div>

              <UserManagementTable onViewDetails={handleViewUserDetails} onUserChanged={refetch} />
            </>
          )}

          {/* Activity Section */}
          {activeSection === 'activity' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">
                  Atividade do Sistema
                </h2>
                <p className="text-muted-foreground">
                  Monitore todas as atividades e acessos em tempo real
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityTimeline />
                {!metricsLoading && <AccessChart data={dailyStats} />}
              </div>
            </>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">Notificações</h2>
                <p className="text-muted-foreground">Envie e gerencie notificações para os usuários</p>
              </div>
              <AdminNotifications />
            </>
          )}

          {/* Audit Section */}
          {activeSection === 'audit' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">Auditoria</h2>
                <p className="text-muted-foreground">Registro de ações administrativas</p>
              </div>
              <AdminAuditTimeline />
            </>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <>
              <div>
                <h2 className="text-2xl font-outfit font-semibold text-foreground mb-1">
                  Configurações
                </h2>
                <p className="text-muted-foreground">
                  Gerencie as configurações do sistema e acesse a documentação
                </p>
              </div>
              <AdminSettings />
            </>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </div>
  );
};

export default AdminDashboard;
