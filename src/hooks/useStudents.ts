import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface ContactEntry {
  value: string;
  type: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  address: string | null;
  course: string | null;
  enrollment_date: string | null;
  status: string;
  notes: string | null;
  is_sc_client: boolean | null;
  lead_source: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  // New fields for lead management
  deal_value?: number | null;
  deal_currency?: string | null;
  phones?: ContactEntry[] | null;
  emails?: ContactEntry[] | null;
  tags?: string[] | null;
  expected_close_date?: string | null;
  funnel_stage?: string | null;
}

export interface StudentInput {
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  birth_date?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  address?: string | null;
  course?: string | null;
  status?: string;
  notes?: string | null;
  is_sc_client?: boolean | null;
  lead_source?: string | null;
  // New fields for lead management
  deal_value?: number | null;
  deal_currency?: string | null;
  phones?: ContactEntry[] | null;
  emails?: ContactEntry[] | null;
  tags?: string[] | null;
  expected_close_date?: string | null;
  funnel_stage?: string | null;
}

// Helper function to convert database record to Student type
function parseStudent(data: any): Student {
  return {
    ...data,
    phones: Array.isArray(data.phones) ? data.phones as ContactEntry[] : null,
    emails: Array.isArray(data.emails) ? data.emails as ContactEntry[] : null,
    tags: Array.isArray(data.tags) ? data.tags as string[] : null,
  };
}

function parseStudents(data: any[]): Student[] {
  return data.map(parseStudent);
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [deletedStudents, setDeletedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const { user } = useAuth();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(parseStudents(data || []));
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Erro ao carregar alunos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedStudents = async () => {
    try {
      setLoadingDeleted(true);
      
      // First, auto-delete items older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      await supabase
        .from('students')
        .delete()
        .not('deleted_at', 'is', null)
        .lt('deleted_at', thirtyDaysAgo.toISOString());

      // Then fetch remaining deleted students
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedStudents(parseStudents(data || []));
    } catch (error: any) {
      console.error('Error fetching deleted students:', error);
      toast({
        title: "Erro ao carregar lixeira",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingDeleted(false);
    }
  };

  const createStudent = async (input: StudentInput) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          ...input,
          phones: input.phones as unknown as Json,
          emails: input.emails as unknown as Json,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const parsed = parseStudent(data);
      setStudents(prev => [parsed, ...prev]);
      toast({
        title: "Aluno adicionado",
        description: `${input.name} foi adicionado com sucesso.`
      });

      return parsed;
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast({
        title: "Erro ao adicionar aluno",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateStudent = async (id: string, input: Partial<StudentInput>) => {
    try {
      const updateData: any = { ...input };
      if (input.phones !== undefined) {
        updateData.phones = input.phones as unknown as Json;
      }
      if (input.emails !== undefined) {
        updateData.emails = input.emails as unknown as Json;
      }

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Aluno não encontrado');
      }

      const parsed = parseStudent(data);
      setStudents(prev => prev.map(s => s.id === id ? parsed : s));
      toast({
        title: "Aluno atualizado",
        description: "Os dados do aluno foram atualizados com sucesso."
      });

      return parsed;
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Erro ao atualizar aluno",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Soft delete - move to trash
  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq('id', id);

      if (error) throw error;

      // Move student from active list to deleted list
      const deletedStudent = students.find(s => s.id === id);
      if (deletedStudent) {
        setStudents(prev => prev.filter(s => s.id !== id));
        setDeletedStudents(prev => [{
          ...deletedStudent,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null
        }, ...prev]);
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Erro ao excluir aluno",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Restore from trash
  const restoreStudent = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = parseStudent(data);
      // Move student from deleted list back to active list
      setDeletedStudents(prev => prev.filter(s => s.id !== id));
      setStudents(prev => [parsed, ...prev]);

      toast({
        title: "Aluno restaurado",
        description: "O aluno foi restaurado com sucesso."
      });

      return parsed;
    } catch (error: any) {
      console.error('Error restoring student:', error);
      toast({
        title: "Erro ao restaurar aluno",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Restore multiple students from trash
  const restoreMultipleStudents = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .in('id', ids)
        .select();

      if (error) throw error;

      const parsed = parseStudents(data || []);
      // Move students from deleted list back to active list
      setDeletedStudents(prev => prev.filter(s => !ids.includes(s.id)));
      setStudents(prev => [...parsed, ...prev]);

      toast({
        title: "Alunos restaurados",
        description: `${ids.length} ${ids.length === 1 ? 'aluno foi restaurado' : 'alunos foram restaurados'} com sucesso.`
      });

      return parsed;
    } catch (error: any) {
      console.error('Error restoring students:', error);
      toast({
        title: "Erro ao restaurar alunos",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Permanently delete
  const permanentlyDeleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeletedStudents(prev => prev.filter(s => s.id !== id));

      toast({
        title: "Aluno excluído permanentemente",
        description: "O aluno foi removido definitivamente do sistema."
      });
    } catch (error: any) {
      console.error('Error permanently deleting student:', error);
      toast({
        title: "Erro ao excluir aluno",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Empty trash - permanently delete all
  const emptyTrash = async () => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .not('deleted_at', 'is', null);

      if (error) throw error;

      setDeletedStudents([]);

      toast({
        title: "Lixeira esvaziada",
        description: "Todos os alunos da lixeira foram excluídos permanentemente."
      });
    } catch (error: any) {
      console.error('Error emptying trash:', error);
      toast({
        title: "Erro ao esvaziar lixeira",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const bulkCreateStudents = async (studentsInput: StudentInput[]): Promise<{ success: number; errors: string[] }> => {
    const results = { success: 0, errors: [] as string[] };
    
    for (const input of studentsInput) {
      try {
        const { error } = await supabase
          .from('students')
          .insert({
            ...input,
            phones: input.phones as unknown as Json,
            emails: input.emails as unknown as Json,
            created_by: user?.id
          });

        if (error) {
          results.errors.push(`${input.name}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (error: any) {
        results.errors.push(`${input.name}: ${error.message}`);
      }
    }

    // Refresh the list after bulk insert
    await fetchStudents();

    return results;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    deletedStudents,
    loading,
    loadingDeleted,
    fetchStudents,
    fetchDeletedStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    restoreStudent,
    restoreMultipleStudents,
    permanentlyDeleteStudent,
    emptyTrash,
    bulkCreateStudents
  };
}
