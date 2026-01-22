import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Lightbulb, Heart } from "lucide-react";

interface Comment {
  type: "suggestion" | "praise";
  text: string;
}

interface FeedbackCommentsCardProps {
  comments: Comment[];
}

export const FeedbackCommentsCard = ({ comments }: FeedbackCommentsCardProps) => {
  const sortedComments = [...comments].sort((a, b) => {
    if (a.type === "praise" && b.type === "suggestion") return -1;
    if (a.type === "suggestion" && b.type === "praise") return 1;
    return 0;
  });

  const getCommentIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "praise":
        return <Heart className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCommentBadgeVariant = (type: string): "default" | "secondary" => {
    switch (type) {
      case "suggestion":
        return "secondary";
      case "praise":
        return "default";
      default:
        return "secondary";
    }
  };

  const getCommentLabel = (type: string) => {
    switch (type) {
      case "suggestion":
        return "Sugestão";
      case "praise":
        return "Elogio";
      default:
        return "Comentário";
    }
  };

  return (
    <Card className="shadow-soft animate-fade-in bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            Comentários e Feedbacks
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Principais destaques dos participantes
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {sortedComments.map((comment, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getCommentIcon(comment.type)}</div>
                <div className="flex-1 space-y-2">
                  <Badge variant={getCommentBadgeVariant(comment.type)} className="text-xs font-medium">
                    {getCommentLabel(comment.type)}
                  </Badge>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
