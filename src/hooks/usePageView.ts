import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { UserAccessLog } from '@/types/supabase-extensions';

export const usePageView = (pageRoute: string) => {
  const { user } = useAuth();
  const lastLoggedRef = useRef<{ route: string; timestamp: number } | null>(null);

  useEffect(() => {
    if (!user) return;

    const now = Date.now();
    const lastLogged = lastLoggedRef.current;

    // Evitar duplicatas: não registrar se a mesma rota foi acessada há menos de 30 segundos
    if (
      lastLogged &&
      lastLogged.route === pageRoute &&
      now - lastLogged.timestamp < 30000 // 30 segundos
    ) {
      return;
    }

    let isMounted = true;

    const logPageView = async () => {
      const logData: UserAccessLog = {
        user_id: user.id,
        page_route: pageRoute,
        access_type: 'page_view',
      };

      const { error } = await supabase.from('user_access_logs').insert(logData);
      
      if (error && isMounted) {
        console.error('Erro ao registrar visualização de página:', error);
      } else if (isMounted) {
        lastLoggedRef.current = { route: pageRoute, timestamp: now };
      }
    };

    logPageView();

    return () => {
      isMounted = false;
    };
  }, [user?.id, pageRoute]);
};
