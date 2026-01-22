import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  created_by: string | null;
}

export function useLeadTags() {
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["lead-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as LeadTag[];
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (tag: { name: string; color: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("lead_tags")
        .insert({
          name: tag.name,
          color: tag.color,
          created_by: user?.user?.id || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma etiqueta com esse nome");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tags"] });
      toast.success("Etiqueta criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar etiqueta");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from("lead_tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tags"] });
      toast.success("Etiqueta removida");
    },
    onError: () => {
      toast.error("Erro ao remover etiqueta");
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async (tag: { id: string; name: string; color: string }) => {
      const { data, error } = await supabase
        .from("lead_tags")
        .update({ name: tag.name, color: tag.color })
        .eq("id", tag.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-tags"] });
      toast.success("Etiqueta atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar etiqueta");
    },
  });

  return {
    tags,
    isLoading,
    createTag: createTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    isCreating: createTagMutation.isPending,
  };
}
