import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Student } from './useStudents';

// Funnel stage labels for readable descriptions
const funnelStageLabels: Record<string, string> = {
  novo_lead: 'Novo Lead',
  primeiro_contato: '1º Contato',
  qualificado: 'Qualificado',
  proposta: 'Proposta',
  matriculado: 'Matriculado',
  perdido: 'Perdido',
};

// Field labels for readable descriptions
const fieldLabels: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  phone: 'Telefone',
  cpf: 'CPF',
  birth_date: 'Data de nascimento',
  city: 'Cidade',
  state: 'Estado',
  cep: 'CEP',
  address: 'Endereço',
  course: 'Curso',
  lead_source: 'Origem',
  notes: 'Notas',
  deal_value: 'Valor do negócio',
  deal_currency: 'Moeda',
  expected_close_date: 'Previsão de fechamento',
  funnel_stage: 'Etapa do funil',
  status: 'Status',
  is_sc_client: 'Cliente S&C',
  tags: 'Tags',
  phones: 'Telefones',
  emails: 'Emails',
};

interface LogActivityParams {
  studentId: string;
  actionType: string;
  description: string;
  details?: Record<string, any>;
}

export function useLeadActivityLogger() {
  const { user } = useAuth();

  const logActivity = useCallback(async ({
    studentId,
    actionType,
    description,
    details,
  }: LogActivityParams) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('student_activity_logs')
        .insert({
          student_id: studentId,
          action_type: actionType,
          description,
          details: details || null,
          performed_by: user.id,
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user?.id]);

  const logStageChange = useCallback(async (
    studentId: string,
    studentName: string,
    fromStage: string,
    toStage: string
  ) => {
    const fromLabel = funnelStageLabels[fromStage] || fromStage;
    const toLabel = funnelStageLabels[toStage] || toStage;
    
    await logActivity({
      studentId,
      actionType: 'stage_changed',
      description: `Lead movido de "${fromLabel}" para "${toLabel}"`,
      details: {
        from_stage: fromStage,
        to_stage: toStage,
        from_label: fromLabel,
        to_label: toLabel,
      },
    });
  }, [logActivity]);

  const logLeadCreated = useCallback(async (
    studentId: string,
    studentName: string,
    stage: string
  ) => {
    const stageLabel = funnelStageLabels[stage] || stage;
    
    await logActivity({
      studentId,
      actionType: 'created',
      description: `Lead "${studentName}" criado na etapa "${stageLabel}"`,
      details: {
        student_name: studentName,
        initial_stage: stage,
        stage_label: stageLabel,
      },
    });
  }, [logActivity]);

  const logLeadUpdated = useCallback(async (
    studentId: string,
    studentName: string,
    changes: Record<string, { from: any; to: any }>
  ) => {
    // Filter out unchanged fields and format change list
    const changedFields = Object.entries(changes)
      .filter(([_, value]) => value.from !== value.to)
      .map(([field, _]) => fieldLabels[field] || field);

    if (changedFields.length === 0) return;

    const description = changedFields.length === 1
      ? `Campo "${changedFields[0]}" atualizado`
      : `${changedFields.length} campos atualizados: ${changedFields.join(', ')}`;

    await logActivity({
      studentId,
      actionType: 'updated',
      description,
      details: {
        student_name: studentName,
        changed_fields: changedFields,
        changes,
      },
    });
  }, [logActivity]);

  const logLeadDeleted = useCallback(async (
    studentId: string,
    studentName: string
  ) => {
    await logActivity({
      studentId,
      actionType: 'deleted',
      description: `Lead "${studentName}" movido para a lixeira`,
      details: {
        student_name: studentName,
      },
    });
  }, [logActivity]);

  const logLeadRestored = useCallback(async (
    studentId: string,
    studentName: string
  ) => {
    await logActivity({
      studentId,
      actionType: 'restored',
      description: `Lead "${studentName}" restaurado da lixeira`,
      details: {
        student_name: studentName,
      },
    });
  }, [logActivity]);

  const logLeadWon = useCallback(async (
    studentId: string,
    studentName: string
  ) => {
    await logActivity({
      studentId,
      actionType: 'won',
      description: `🎉 Lead "${studentName}" convertido em matrícula!`,
      details: {
        student_name: studentName,
      },
    });
  }, [logActivity]);

  const logLeadLost = useCallback(async (
    studentId: string,
    studentName: string
  ) => {
    await logActivity({
      studentId,
      actionType: 'lost',
      description: `Lead "${studentName}" marcado como perdido`,
      details: {
        student_name: studentName,
      },
    });
  }, [logActivity]);

  return {
    logActivity,
    logStageChange,
    logLeadCreated,
    logLeadUpdated,
    logLeadDeleted,
    logLeadRestored,
    logLeadWon,
    logLeadLost,
  };
}
