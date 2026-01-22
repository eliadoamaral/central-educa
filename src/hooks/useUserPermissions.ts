import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user' | 'viewer';

export interface UserPermissions {
  role: UserRole | null;
  hasFullAccess: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  loading: boolean;
}

/**
 * Hook to check user permissions and access levels
 * - admin: Full access to everything including admin panel
 * - user: Full access to all features except admin panel
 * - viewer: Limited access - only courses pages
 */
export const useUserPermissions = (): UserPermissions => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    const fetchPermissions = async () => {
      // If no user, they're not logged in - no role needed
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check for admin role first
        const { data: isAdminData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (isAdminData) {
          setRole('admin');
          setLoading(false);
          return;
        }

        // Check for user role
        const { data: isUserData } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'user'
        });

        if (isUserData) {
          setRole('user');
          setLoading(false);
          return;
        }

        // Default to viewer
        setRole('viewer');
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching permissions:', error);
        }
        setRole('viewer');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user, authLoading]);

  // hasFullAccess is true for admin and user roles
  const hasFullAccess = role === 'admin' || role === 'user';

  return {
    role,
    hasFullAccess,
    isAdmin: role === 'admin',
    isViewer: role === 'viewer',
    loading: loading || authLoading
  };
};

// Routes that viewers CAN access
export const VIEWER_ALLOWED_ROUTES = [
  '/gestoras-do-agro',
  '/gestoras-do-agro/mapeamento-perfil',
  '/sucessores-do-agro',
  '/mapeamento-de-perfil',
  '/perfil',
  '/auth',
  '/reset-password'
];

// Check if a route is allowed for viewers
export const isRouteAllowedForViewer = (route: string): boolean => {
  return VIEWER_ALLOWED_ROUTES.some(allowed => 
    route === allowed || route.startsWith(allowed + '/')
  );
};
