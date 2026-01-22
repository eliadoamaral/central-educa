import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StudentNote {
  id: string;
  student_id: string;
  content: string;
  created_at: string;
  created_by: string | null;
  author_name?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
}

export interface AddNoteInput {
  content: string;
  attachment?: File | null;
}

export function useStudentNotes(studentId: string | undefined) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!studentId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_notes')
        .select(`
          id,
          student_id,
          content,
          created_at,
          created_by,
          attachment_url,
          attachment_name,
          attachment_type,
          attachment_size
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author names for each note
      const notesWithAuthors = await Promise.all(
        (data || []).map(async (note) => {
          if (note.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', note.created_by)
              .single();
            
            return {
              ...note,
              author_name: profile?.name || 'Usuário'
            };
          }
          return { ...note, author_name: 'Sistema' };
        })
      );

      setNotes(notesWithAuthors);
    } catch (error) {
      console.error('Error fetching student notes:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const uploadAttachment = async (file: File): Promise<{ url: string; name: string; type: string; size: number } | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-attachments')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Erro ao enviar anexo');
      return null;
    }
  };

  const addNote = useCallback(async (input: AddNoteInput) => {
    if (!studentId || !user) {
      return null;
    }

    // Allow notes with just attachments (no content required)
    if (!input.content.trim() && !input.attachment) {
      return null;
    }

    try {
      let attachmentData = null;
      
      if (input.attachment) {
        attachmentData = await uploadAttachment(input.attachment);
        if (!attachmentData) return null;
      }

      const { data, error } = await supabase
        .from('student_notes')
        .insert({
          student_id: studentId,
          content: input.content.trim(),
          created_by: user.id,
          attachment_url: attachmentData?.url || null,
          attachment_name: attachmentData?.name || null,
          attachment_type: attachmentData?.type || null,
          attachment_size: attachmentData?.size || null
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch author name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const newNote: StudentNote = {
        ...data,
        author_name: profile?.name || 'Usuário'
      };

      setNotes(prev => [newNote, ...prev]);
      toast.success('Observação adicionada');
      return newNote;
    } catch (error: any) {
      console.error('Error adding note:', error);
      toast.error('Erro ao adicionar observação');
      return null;
    }
  }, [studentId, user]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      // Find the note to get attachment info
      const noteToDelete = notes.find(n => n.id === noteId);
      
      const { error } = await supabase
        .from('student_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      // Try to delete attachment from storage if exists
      if (noteToDelete?.attachment_url && user) {
        try {
          const url = new URL(noteToDelete.attachment_url);
          const pathParts = url.pathname.split('/');
          const filePath = pathParts.slice(-2).join('/'); // Get user_id/filename
          
          await supabase.storage
            .from('student-attachments')
            .remove([filePath]);
        } catch (e) {
          console.warn('Could not delete attachment file:', e);
        }
      }

      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Observação removida');
      return true;
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error('Erro ao remover observação');
      return false;
    }
  }, [notes, user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Realtime subscription
  useEffect(() => {
    if (!studentId) return;

    const channel = supabase
      .channel(`student-notes-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_notes',
          filter: `student_id=eq.${studentId}`
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    deleteNote,
    refetch: fetchNotes
  };
}
