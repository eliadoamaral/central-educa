import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIMessage, AIInsightsContext } from '@/types/ai-insights';
import { toast } from 'sonner';

export const useAIInsights = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (question: string, context: AIInsightsContext) => {
    if (!question.trim() || isLoading) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`;

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          dashboardType: context.dashboardType,
          question,
          context,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Muitas requisições. Aguarde alguns segundos.');
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast.error('Limite de uso de IA atingido. Contate o administrador.');
          setIsLoading(false);
          return;
        }
        throw new Error('Erro ao conectar com a IA');
      }

      if (!response.body) {
        throw new Error('Resposta sem corpo');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      // Create placeholder assistant message
      const assistantMessageId = `assistant-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              // Update assistant message with accumulated content
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId
                  ? { ...msg, content: assistantContent }
                  : msg
              ));
            }
          } catch (e) {
            // Incomplete JSON, put back and wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao processar sua pergunta. Tente novamente.');
      setIsLoading(false);
      
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  }, [isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
  };
};
