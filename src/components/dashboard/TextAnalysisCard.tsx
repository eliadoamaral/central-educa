import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParticipantData } from "@/types/dashboard";
import { splitMultipleChoices, normalizeText } from "@/utils/csvParser";

interface TextAnalysisCardProps {
  title: string;
  participants: ParticipantData[];
  field: keyof ParticipantData;
  showCount?: boolean;
}

export const TextAnalysisCard = ({
  title,
  participants,
  field,
  showCount = true
}: TextAnalysisCardProps) => {
  const responses = participants
    .map(p => ({ name: p.name, response: p[field] as string }))
    .filter(item => item.response && item.response.trim() !== '' && item.response.trim() !== '.' && item.response.trim() !== '-')
    .slice(0, 10); // Show first 10 responses

  const titleEmojis: {
    [key: string]: string;
  } = {
    "expectativas": "💭",
    "additionalTopics": "📝"
  };
  const getEmoji = () => {
    if (field === 'expectations') return "💭";
    if (field === 'additionalTopics') return "📝";
    return "💬";
  };
  return <Card className="shadow-soft bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px] font-bold text-foreground flex items-center justify-between group">
          <div className="flex items-center gap-3">
            
            <span className="text-foreground text-[18px] font-bold">{title}</span>
          </div>
          {showCount}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {responses.length > 0 ? responses.map((item, index) => <div key={index} className="group p-4 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/10 hover:to-secondary/10 rounded-xl border border-border/50 hover:border-primary/30 text-sm text-foreground leading-relaxed transition-all duration-300 hover:shadow-medium animate-fade-in" style={{
          animationDelay: `${index * 50}ms`
        }}>
                <div className="flex items-start gap-3">
                  
                  <div className="text-foreground/90 group-hover:text-foreground transition-colors duration-300 bg-transparent">
                    <blockquote className="mb-2">
                      "{item.response}"
                    </blockquote>
                    <p className="text-xs text-muted-foreground font-medium">— {item.name}</p>
                  </div>
                </div>
              </div>) : <div className="text-center text-muted-foreground py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg font-medium">Nenhuma resposta disponível</p>
            </div>}
        </div>
      </CardContent>
    </Card>;
};

interface TopicsAnalysisCardProps {
  title: string;
  participants: ParticipantData[];
  field: keyof ParticipantData;
}

export const TopicsAnalysisCard = ({
  title,
  participants,
  field
}: TopicsAnalysisCardProps) => {
  const topicCounts: {
    [key: string]: number;
  } = {};
  participants.forEach(participant => {
    const value = participant[field] as string;
    if (value && value.trim() !== '-') {
      const topics = splitMultipleChoices(value);
      topics.forEach(topic => {
        if (topic.trim() !== '-') {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    }
  });
  const sortedTopics = Object.entries(topicCounts).sort(([, a], [, b]) => b - a).slice(0, 15);
  const totalCount = participants.length;
  const maxCount = sortedTopics.length > 0 ? sortedTopics[0][1] : 1;

  return (
    <Card className="shadow-soft bg-card animate-fade-in">
      <CardHeader className="pb-4 space-y-1">
        <CardTitle className="text-[18px] font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTopics.map(([topic, count], index) => {
            const percentage = (count / totalCount) * 100;
            const barWidth = (count / maxCount) * 100;
            
            return (
              <div 
                key={topic} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground font-medium">{topic}</span>
                  <span className="text-sm font-semibold text-foreground">{count}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};