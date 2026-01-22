import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HomeKPIs {
  totalStudents: number;
  leadsInFunnel: number;
  conversionRate: number;
  totalRevenue: number;
}

export function useHomeKPIs() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<HomeKPIs>({
    totalStudents: 0,
    leadsInFunnel: 0,
    conversionRate: 0,
    totalRevenue: 0
  });

  const fetchKPIs = async () => {
    try {
      setLoading(true);

      // Fetch all active students (not deleted)
      const { data: students, error } = await supabase
        .from('students')
        .select('id, status, deal_value, is_sc_client')
        .is('deleted_at', null);

      if (error) throw error;

      const allStudents = students || [];

      // Total de alunos ativos (matriculados ou formados)
      const enrolledStatuses = ['active', 'matriculado', 'formado', 'graduated'];
      const totalStudents = allStudents.filter(s => 
        enrolledStatuses.includes(s.status?.toLowerCase() || '')
      ).length;

      // Leads no funil (status de prospecção/lead)
      const leadStatuses = ['lead', 'prospeccao', 'prospection', 'prospect', 'em negociação', 'em negociacao'];
      const leadsInFunnel = allStudents.filter(s => 
        leadStatuses.includes(s.status?.toLowerCase() || '')
      ).length;

      // Taxa de conversão: alunos convertidos / (alunos + leads) * 100
      const totalPotential = totalStudents + leadsInFunnel;
      const conversionRate = totalPotential > 0 
        ? (totalStudents / totalPotential) * 100 
        : 0;

      // Receita total: soma de deal_value dos alunos convertidos
      const totalRevenue = allStudents
        .filter(s => enrolledStatuses.includes(s.status?.toLowerCase() || ''))
        .reduce((acc, s) => acc + (Number(s.deal_value) || 0), 0);

      setKpis({
        totalStudents,
        leadsInFunnel,
        conversionRate,
        totalRevenue
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching home KPIs:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  return {
    kpis,
    loading,
    refetch: fetchKPIs
  };
}
