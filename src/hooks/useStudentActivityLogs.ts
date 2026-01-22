import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface StudentActivityLog {
  id: string;
  student_id: string;
  action_type: string;
  description: string;
  details: Json | null;
  performed_by: string | null;
  created_at: string;
  performer_name?: string;
}

export function useStudentActivityLogs(studentId?: string) {
  const [logs, setLogs] = useState<StudentActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    if (!studentId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_activity_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch performer names for logs with performed_by
      const logsWithNames: StudentActivityLog[] = await Promise.all(
        (data || []).map(async (log) => {
          if (log.performed_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', log.performed_by)
              .single();
            return { ...log, performer_name: profile?.name || 'Usuário' };
          }
          return { ...log, performer_name: undefined };
        })
      );

      setLogs(logsWithNames);
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (
    action_type: string,
    description: string,
    details?: Record<string, any>
  ) => {
    if (!studentId || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('student_activity_logs')
        .insert({
          student_id: studentId,
          action_type,
          description,
          details: details || null,
          performed_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add performer name to the new log
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const newLog: StudentActivityLog = { ...data, performer_name: profile?.name || 'Usuário' };
      setLogs(prev => [newLog, ...prev]);

      return data;
    } catch (error: any) {
      console.error('Error adding activity log:', error);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchLogs();
    }
  }, [studentId]);

  // Realtime subscription for activity logs changes
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`student-activity-logs-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_activity_logs',
          filter: `student_id=eq.${studentId}`
        },
        async (payload) => {
          const newLog = payload.new as StudentActivityLog;
          
          // Fetch performer name if available
          if (newLog.performed_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newLog.performed_by)
              .single();
            newLog.performer_name = profile?.name || 'Usuário';
          }
          
          setLogs(prev => {
            // Avoid duplicates
            if (prev.some(log => log.id === newLog.id)) return prev;
            return [newLog, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  return {
    logs,
    loading,
    addLog,
    refetch: fetchLogs
  };
}
