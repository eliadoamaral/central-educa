import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AdminAction, AdminActionType } from '@/types/admin';

export const useAdminAudit = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<AdminActionType | 'all'>('all');

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('admin_actions')
        .select(`
          *,
          admin:admin_user_id(name, email),
          target:target_user_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match AdminAction interface
      const transformedData: AdminAction[] = (data || []).map((action: any) => ({
        id: action.id,
        admin_user_id: action.admin_user_id,
        admin_name: action.admin?.name,
        admin_email: action.admin?.email,
        action_type: action.action_type,
        target_user_id: action.target_user_id,
        target_user_name: action.target?.name,
        target_user_email: action.target?.email,
        action_details: action.action_details || {},
        ip_address: action.ip_address,
        user_agent: action.user_agent,
        created_at: action.created_at,
      }));

      setActions(transformedData);
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Error fetching audit logs:', err);
      }
      setError(err.message || 'Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filterType]);

  const refresh = () => {
    fetchAuditLogs();
  };

  // Estatísticas de ações
  const stats = {
    total: actions.length,
    byType: actions.reduce((acc, action) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {} as Record<AdminActionType, number>),
    mostActiveAdmin: actions.reduce((acc, action) => {
      const adminId = action.admin_user_id;
      acc[adminId] = (acc[adminId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    actions,
    loading,
    error,
    filterType,
    setFilterType,
    refresh,
    stats,
  };
};
