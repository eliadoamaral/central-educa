import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'admin' | 'user' | 'viewer';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  user: 'Usuário',
  viewer: 'Visualizador'
};

export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Change user role to a specific new role
   */
  const changeUserRole = async (userId: string, currentRole: AppRole, newRole: AppRole) => {
    if (currentRole === newRole) return true;
    
    setLoading(true);
    try {
      // Remove current role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Add new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'role_change',
        p_target_user_id: userId,
        p_action_details: {
          old_role: currentRole,
          new_role: newRole,
        },
      });

      toast.success(`Usuário alterado para ${ROLE_LABELS[newRole]} com sucesso`);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error changing user role:', error);
      }
      toast.error('Erro ao alterar permissão do usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Legacy toggle function - now cycles through roles: viewer -> user -> admin -> user
   */
  const toggleUserRole = async (userId: string, currentRole: string) => {
    const current = currentRole as AppRole;
    let newRole: AppRole;
    
    if (current === 'viewer') {
      newRole = 'user';
    } else if (current === 'user') {
      newRole = 'admin';
    } else {
      newRole = 'user';
    }
    
    return changeUserRole(userId, current, newRole);
  };

  /**
   * Promote viewer to user (grant full access)
   */
  const promoteToUser = async (userId: string) => {
    return changeUserRole(userId, 'viewer', 'user');
  };

  /**
   * Promote to admin
   */
  const promoteToAdmin = async (userId: string, currentRole: AppRole) => {
    return changeUserRole(userId, currentRole, 'admin');
  };

  /**
   * Demote admin to user
   */
  const demoteToUser = async (userId: string) => {
    return changeUserRole(userId, 'admin', 'user');
  };

  /**
   * Demote to viewer (restrict access)
   */
  const demoteToViewer = async (userId: string, currentRole: AppRole) => {
    return changeUserRole(userId, currentRole, 'viewer');
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // Log admin action before deletion
      await supabase.rpc('log_admin_action', {
        p_action_type: 'user_delete',
        p_target_user_id: userId,
        p_action_details: {},
      });

      // Delete user from auth.users (this will cascade to profiles and user_roles)
      const { error } = await supabase.rpc('delete_user' as any, { user_id: userId });

      if (error) throw error;

      toast.success('Usuário excluído com sucesso');
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting user:', error);
      }
      toast.error('Erro ao excluir usuário');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleUserRole,
    changeUserRole,
    promoteToUser,
    promoteToAdmin,
    demoteToUser,
    demoteToViewer,
    deleteUser,
  };
};
