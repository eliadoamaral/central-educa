import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface CourseInfo {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: React.ElementType;
}
const courses: CourseInfo[] = [{
  id: "sucessores",
  name: "Sucessores do Agro",
  description: "Formação de lideranças para a sucessão no agronegócio",
  route: "/sucessores-do-agro",
  icon: Sprout
}, {
  id: "gestoras",
  name: "Gestoras do Agro",
  description: "Capacitação de mulheres gestoras no agronegócio",
  route: "/gestoras-do-agro",
  icon: Users
}];
export const CoursesSection = () => {
  const navigate = useNavigate();
  return <div className="space-y-8">
      <div>
        <h3 className="text-lg font-outfit font-semibold text-foreground mb-6">
          Selecione um curso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => {
          const Icon = course.icon;
          return <Card key={course.id} className="group relative overflow-hidden border shadow-soft transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] cursor-pointer bg-gradient-to-br from-card to-muted/30" onClick={() => navigate(course.route)}>
                <div className="p-6 flex flex-col h-full">
                  
                  
                  <h4 className="text-lg font-semibold font-outfit text-foreground mb-2">
                    {course.name}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    {course.description}
                  </p>

                  <Button variant="default" className="w-full">
                    Visualizar Análises
                  </Button>
                </div>
              </Card>;
        })}
        </div>
      </div>
    </div>;
};