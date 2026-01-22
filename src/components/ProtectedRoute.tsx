import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPermissions, isRouteAllowedForViewer } from '@/hooks/useUserPermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireFullAccess?: boolean;
}

export const ProtectedRoute = ({ children, requireFullAccess = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasFullAccess, loading: permissionsLoading } = useUserPermissions();
  const location = useLocation();

  // Show loading while checking auth
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is a viewer and route requires full access, redirect to gestoras page
  if (!hasFullAccess && requireFullAccess) {
    return <Navigate to="/gestoras-do-agro" replace />;
  }

  // If user is a viewer and trying to access restricted routes, redirect to gestoras page
  if (!hasFullAccess && !isRouteAllowedForViewer(location.pathname)) {
    return <Navigate to="/gestoras-do-agro" replace />;
  }

  return <>{children}</>;
};
