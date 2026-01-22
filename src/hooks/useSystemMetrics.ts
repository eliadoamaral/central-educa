import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  total_users: number;
  active_today: number;
  total_logins: number;
  last_activity: string;
}

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

interface DailyStats {
  access_date: string;
  logins: number;
  page_views: number;
  unique_users: number;
}

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Fetch dashboard metrics using security definer function
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_admin_dashboard_metrics');

      if (metricsError) throw metricsError;
      setMetrics(metricsData?.[0] || null);

      // Fetch user activity using security definer function
      const { data: activityData, error: activityError } = await supabase
        .rpc('get_user_activity_detailed');

      if (activityError) throw activityError;
      setUserActivity(activityData || []);

      // Fetch daily stats using security definer function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_daily_access_stats');

      if (statsError) throw statsError;
      // Sort and limit to last 30 days
      const sortedStats = (statsData || []).sort((a, b) => 
        new Date(b.access_date).getTime() - new Date(a.access_date).getTime()
      ).slice(0, 30);
      setDailyStats(sortedStats);
    } catch (error) {
      // Error logged for debugging in development only
      if (import.meta.env.DEV) {
        console.error('Error fetching system metrics:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    userActivity,
    dailyStats,
    loading,
    refetch: fetchMetrics
  };
};
