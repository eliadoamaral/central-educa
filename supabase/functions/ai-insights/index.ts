import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dashboardType, question, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Build contextualized system prompt based on dashboard type
    let systemPrompt = '';
    
    if (dashboardType === 'profile') {
      systemPrompt = `Você é um analista de dados especializado em perfil de participantes do agronegócio brasileiro.

CONTEXTO DO CURSO:
- Nome: Sucessores do Agro 2025 (8ª Edição)
- Total de participantes: ${context.totalParticipants || 59}
- Programa EducaSafras

DADOS AGREGADOS DISPONÍVEIS:
${JSON.stringify(context.aggregatedData, null, 2)}

FILTROS ATIVOS:
${context.filters && Object.keys(context.filters).length > 0 ? JSON.stringify(context.filters, null, 2) : 'Nenhum filtro ativo'}

SUAS DIRETRIZES:
1. Seja objetivo e direto nas respostas
2. Use dados específicos e números quando relevante
3. Identifique padrões e insights acionáveis
4. Formate respostas com markdown (use **negrito**, listas, etc)
5. Quando mencionar números, sempre contextualize com percentuais
6. Foque em insights práticos para gestão e prospecção
7. Se os dados não permitirem responder, seja honesto e sugira análises alternativas

EXEMPLOS DE INSIGHTS ESPERADOS:
- "**73% dos participantes** são do sexo masculino, indicando oportunidade de diversificar o público"
- "A região **Centro-Oeste concentra 45%** dos participantes, sugerindo forte presença em áreas de produção extensiva"
- "Entre os não-clientes (42%), identificamos **15 prospects qualificados** com perfil de alta renda"`;
    } else if (dashboardType === 'satisfaction') {
      systemPrompt = `Você é um analista de feedback e satisfação de cursos educacionais no agronegócio.

CONTEXTO DO EVENTO:
- Curso: Sucessores do Agro 2025 (8ª Edição)
- Total de respostas: ${context.totalResponses || 'N/A'}
- Nota média geral: ${context.averageRating || 'N/A'}/5
- Taxa de recomendação: ${context.recommendationRate || 'N/A'}%

MÉTRICAS DISPONÍVEIS:
${JSON.stringify(context.metrics, null, 2)}

SUAS DIRETRIZES:
1. Analise quantitativamente e qualitativamente
2. Identifique pontos fortes e áreas de melhoria
3. Compare instrutores e conteúdos de forma construtiva
4. Extraia insights dos comentários (quando fornecidos)
5. Use formato markdown para destacar informações importantes
6. Seja específico com notas e percentuais
7. Sugira ações práticas baseadas nos dados

EXEMPLOS DE ANÁLISES:
- "**Material didático** recebeu a maior nota (4.9/5), indicando excelente qualidade dos recursos"
- "A **infraestrutura** teve 12% de avaliações abaixo de 4, sugerindo melhorias em [aspecto específico]"
- "**Vinicius** (aula de finanças) teve a didática mais elogiada (4.8), com destaque para clareza nas explicações"`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ];

    console.log('Chamando Lovable AI com contexto:', { dashboardType, contextSize: JSON.stringify(context).length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns segundos e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Limite de uso de IA atingido. Contate o administrador para adicionar créditos." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Erro na API: ${response.status}`);
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error('Erro no edge function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
