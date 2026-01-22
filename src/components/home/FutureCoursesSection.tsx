import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin } from "lucide-react";
interface FutureCourse {
  name: string;
  description: string;
  expectedDate: string;
  targetAudience: string;
  estimatedParticipants: number;
  status: "planning" | "development" | "soon";
}
const futureCourses: FutureCourse[] = [{
  name: "Reforma Tributária",
  description: "Atualização sobre as mudanças na legislação tributária e impactos no agronegócio",
  expectedDate: "Q1 2026",
  targetAudience: "Gestores e contadores do setor",
  estimatedParticipants: 30,
  status: "development"
}, {
  name: "Gestão Estratégica de Pessoas",
  description: "Desenvolvimento de liderança e gestão de equipes no ambiente rural",
  expectedDate: "Q2 2026",
  targetAudience: "Líderes e gestores de RH",
  estimatedParticipants: 25,
  status: "planning"
}];
export const FutureCoursesSection = () => {
  const getStatusBadge = (status: FutureCourse["status"]) => {
    switch (status) {
      case "development":
        return;
      case "planning":
        return;
      case "soon":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Em breve</Badge>;
    }
  };
  return <Card className="border-0 shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          
          Próximos Cursos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {futureCourses.map((course, index) => <div key={index} className="p-5 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-foreground">{course.name}</h4>
                {getStatusBadge(course.status)}
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {course.expectedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  ~{course.estimatedParticipants} participantes
                </span>
              </div>
              
            </div>)}
        </div>
      </CardContent>
    </Card>;
};