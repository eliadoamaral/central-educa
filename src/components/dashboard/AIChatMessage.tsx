import { AIMessage } from '@/types/ai-insights';
import { BrainCircuit, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIChatMessageProps {
  message: AIMessage;
}

export const AIChatMessage = ({ message }: AIChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary' : 'bg-muted'
      }`}>
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
        ) : (
          <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className={`flex-1 max-w-[85%] sm:max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words">
              <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};
