import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface FunnelStageColor {
  id: string;
  stage_id: string;
  header_color: string;
  created_at: string;
  updated_at: string;
}

// Default colors for each stage
const DEFAULT_STAGE_COLORS: Record<string, string> = {
  novo_lead: "#6B7280",
  primeiro_contato: "#3B82F6",
  qualificado: "#8B5CF6",
  proposta: "#F97316",
  matriculado: "#10B981",
  perdido: "#EF4444",
};

export function useFunnelStageColors() {
  const queryClient = useQueryClient();

  const { data: stageColors = [], isLoading } = useQuery({
    queryKey: ["funnel-stage-colors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funnel_stage_colors")
        .select("*")
        .order("stage_id");

      if (error) throw error;
      return data as FunnelStageColor[];
    },
  });

  // Convert array to a map for easy access
  const colorsMap: Record<string, string> = {};
  stageColors.forEach((sc) => {
    colorsMap[sc.stage_id] = sc.header_color;
  });

  // Get color for a stage (fallback to default)
  const getStageColor = (stageId: string): string => {
    return colorsMap[stageId] || DEFAULT_STAGE_COLORS[stageId] || "#6B7280";
  };

  const updateColorMutation = useMutation({
    mutationFn: async ({
      stageId,
      color,
    }: {
      stageId: string;
      color: string;
    }) => {
      // Check if entry exists
      const { data: existing } = await supabase
        .from("funnel_stage_colors")
        .select("id")
        .eq("stage_id", stageId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("funnel_stage_colors")
          .update({ header_color: color })
          .eq("stage_id", stageId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("funnel_stage_colors")
          .insert({ stage_id: stageId, header_color: color });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funnel-stage-colors"] });
      toast({
        title: "Cor atualizada",
        description: "A cor da etapa foi salva com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error updating stage color:", error);
      toast({
        title: "Erro ao salvar cor",
        description: "Não foi possível salvar a cor da etapa",
        variant: "destructive",
      });
    },
  });

  return {
    stageColors,
    isLoading,
    getStageColor,
    updateColor: updateColorMutation.mutate,
    isUpdating: updateColorMutation.isPending,
  };
}
