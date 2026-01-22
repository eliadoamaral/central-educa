import { useState, useEffect, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, Loader2, X, Trash2 } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import { AIInsightsContext } from '@/types/ai-insights';
import { AIChatMessage } from './AIChatMessage';
import { AIQuickPrompts } from './AIQuickPrompts';
import { toast } from 'sonner';

interface AIInsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AIInsightsContext;
}

export const AIInsightsDrawer = ({ open, onOpenChange, context }: AIInsightsDrawerProps) => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearHistory } = useAIInsights();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');
    
    await sendMessage(question, context);
  };

  const handleQuickPrompt = async (prompt: string) => {
    await sendMessage(prompt, context);
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.success('Histórico limpo');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] sm:h-[85vh] flex flex-col">
        <DrawerHeader className="border-b flex-shrink-0 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DrawerTitle className="text-base sm:text-lg">Assistente de IA</DrawerTitle>
                <DrawerDescription className="text-xs sm:text-sm">
                  {context.dashboardType === 'profile' 
                    ? 'Análise de perfil dos participantes'
                    : 'Análise de satisfação do curso'}
                </DrawerDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="font-semibold text-lg">
                    Como posso ajudar?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Faça perguntas sobre os dados exibidos no dashboard. 
                    Posso gerar insights, comparações e análises detalhadas.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  <AIQuickPrompts 
                    dashboardType={context.dashboardType}
                    onSelectPrompt={handleQuickPrompt}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <AIChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando dados...</span>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3 sm:p-4 flex-shrink-0 bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Faça uma pergunta sobre os dados..."
                disabled={isLoading}
                className="flex-1 text-base"
                style={{ fontSize: '16px' }}
                enterKeyHint="send"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
              Pressione Enter para enviar • Shift+Enter para nova linha
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
