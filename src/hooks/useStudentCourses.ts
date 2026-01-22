import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentCourse {
  id: string;
  student_id: string;
  course_name: string;
  enrollment_date: string | null;
  completion_date: string | null;
  status: string;
  edition: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface StudentCourseInput {
  student_id: string;
  course_name: string;
  enrollment_date?: string | null;
  completion_date?: string | null;
  status?: string;
  edition?: string | null;
  notes?: string | null;
}

export function useStudentCourses(studentId?: string) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCourses = async (id?: string) => {
    const targetId = id || studentId;
    if (!targetId) {
      setCourses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', targetId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching student courses:', error);
      toast({
        title: "Erro ao carregar cursos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (input: StudentCourseInput) => {
    try {
      const { data, error } = await supabase
        .from('student_courses')
        .insert({
          ...input,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setCourses(prev => [data, ...prev]);
      toast({
        title: "Curso adicionado",
        description: `${input.course_name} foi adicionado ao aluno.`
      });

      return data;
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast({
        title: "Erro ao adicionar curso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCourse = async (id: string, input: Partial<StudentCourseInput>) => {
    try {
      const { data, error } = await supabase
        .from('student_courses')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCourses(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Curso atualizado",
        description: "Os dados do curso foram atualizados."
      });

      return data;
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Erro ao atualizar curso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('student_courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Curso removido",
        description: "O curso foi removido do aluno."
      });
    } catch (error: any) {
      console.error('Error removing course:', error);
      toast({
        title: "Erro ao remover curso",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchCourses(studentId);
    }
  }, [studentId]);

  // Realtime subscription for student courses changes
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`student-courses-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_courses',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCourse = payload.new as StudentCourse;
            setCourses(prev => {
              if (prev.some(c => c.id === newCourse.id)) return prev;
              return [newCourse, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedCourse = payload.new as StudentCourse;
            setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
          } else if (payload.eventType === 'DELETE') {
            const deletedCourse = payload.old as StudentCourse;
            setCourses(prev => prev.filter(c => c.id !== deletedCourse.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  return {
    courses,
    loading,
    fetchCourses,
    addCourse,
    updateCourse,
    removeCourse
  };
}
