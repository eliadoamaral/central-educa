import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DatePickerBR } from "@/components/ui/date-picker-br";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, MapPin, Calendar as CalendarIcon, GraduationCap, FileText, CheckCircle2, XCircle, PauseCircle, UserPlus, Edit, Plus, Trash2, MoreVertical, Check, Download, Save, Loader2, Building2, Megaphone, Home, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Student } from "@/hooks/useStudents";
import { useStudentCourses, StudentCourse } from "@/hooks/useStudentCourses";
import { useStudentActivityLogs } from "@/hooks/useStudentActivityLogs";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { MergeSuccessDialog, calculateMergeChanges, MergeChange } from "@/components/MergeSuccessDialog";
import { StudentForm, StudentFormData, CourseEnrollment } from "@/components/students/StudentForm";
import { EditStudentDialog } from "@/components/students/EditStudentDialog";
import { StudentNotesCard } from "@/components/students/StudentNotesCard";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import companyLogo from "@/assets/company-logo-pdf.png";
const courses = ["Sucessores do Agro", "Gestoras do Agro", "Reforma Tributária", "Gestão Estratégica de Pessoas"];
const availableCourses = ["Sucessores do Agro", "Gestoras do Agro", "Reforma Tributária", "Gestão Estratégica de Pessoas"];
const EDITION_OPTIONS = [{
  value: '1ª Edição',
  label: '1ª Edição'
}, {
  value: '2ª Edição',
  label: '2ª Edição'
}, {
  value: '3ª Edição',
  label: '3ª Edição'
}, {
  value: '4ª Edição',
  label: '4ª Edição'
}, {
  value: '5ª Edição',
  label: '5ª Edição'
}, {
  value: '6ª Edição',
  label: '6ª Edição'
}, {
  value: '7ª Edição',
  label: '7ª Edição'
}, {
  value: '8ª Edição',
  label: '8ª Edição'
}, {
  value: '9ª Edição',
  label: '9ª Edição'
}, {
  value: '10ª Edição',
  label: '10ª Edição'
}];

// Component for adding multiple courses
const AddCourseSelector = ({
  availableCourses,
  existingCourses,
  pendingCourses,
  onAddCourse,
  onRemoveCourse,
  onEditionChange
}: {
  availableCourses: string[];
  existingCourses: {
    course_name: string;
    edition?: string | null;
  }[];
  pendingCourses: Array<{
    course: string;
    edition: string;
  }>;
  onAddCourse: (course: string, edition: string) => void;
  onRemoveCourse: (index: number) => void;
  onEditionChange: (index: number, edition: string) => void;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedEdition, setSelectedEdition] = useState<string>("1ª Edição");

  // Check if this combination already exists (in existing or pending)
  const isDuplicate = selectedCourse && selectedEdition && (existingCourses.some(c => c.course_name === selectedCourse && c.edition === selectedEdition) || pendingCourses.some(p => p.course === selectedCourse && p.edition === selectedEdition));
  const handleAdd = () => {
    if (selectedCourse && selectedEdition && !isDuplicate) {
      onAddCourse(selectedCourse, selectedEdition);
      setSelectedCourse("");
      setSelectedEdition("1ª Edição");
    }
  };
  return <div className="space-y-3">
      {/* Course select */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
          <GraduationCap className="h-4 w-4" />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full h-10 pl-10">
            <SelectValue placeholder="Selecione um curso" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {availableCourses.map(course => <SelectItem key={course} value={course} className="text-sm">
                {course}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      {/* Edition and add button */}
      {selectedCourse && <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2 items-center">
            <Select value={selectedEdition} onValueChange={setSelectedEdition}>
              <SelectTrigger className={cn("flex-1 h-10", isDuplicate && "border-destructive")}>
                <SelectValue placeholder="Edição" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {EDITION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-sm">
                    {opt.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            
            <Button type="button" size="icon" className="h-10 w-10 flex-shrink-0 bg-action hover:bg-action-hover text-white" onClick={handleAdd} disabled={!!isDuplicate}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {isDuplicate && <p className="text-xs text-destructive">
              Esta combinação de curso e edição já existe
            </p>}
        </div>}

      {/* Pending courses list */}
      {pendingCourses.length > 0 && <div className="border rounded-lg divide-y">
          {pendingCourses.map((pending, index) => <div key={`${pending.course}-${index}`} className="flex items-center gap-2 px-3 py-2 group">
              <span className="text-sm font-medium text-foreground flex-1 truncate">
                {pending.course}
              </span>
              <Select value={pending.edition} onValueChange={value => onEditionChange(index, value)}>
                <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-muted-foreground text-xs hover:text-foreground focus:ring-0 focus:ring-offset-0 w-auto gap-0.5">
                  <SelectValue>{pending.edition}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {EDITION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              <button type="button" onClick={() => onRemoveCourse(index)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>)}
        </div>}
    </div>;
};
const leadSources = [{
  value: "indicacao",
  label: "Indicação"
}, {
  value: "evento",
  label: "Evento"
}, {
  value: "redes_sociais",
  label: "Redes Sociais"
}, {
  value: "google",
  label: "Google/Busca"
}, {
  value: "linkedin",
  label: "LinkedIn"
}, {
  value: "instagram",
  label: "Instagram"
}, {
  value: "youtube",
  label: "YouTube"
}, {
  value: "email_marketing",
  label: "Email Marketing"
}, {
  value: "parceiro",
  label: "Parceiro/Afiliado"
}, {
  value: "outro",
  label: "Outro"
}];
const leadSourceLabels: Record<string, string> = leadSources.reduce((acc, source) => {
  acc[source.value] = source.label;
  return acc;
}, {} as Record<string, string>);
export default function AlunoDetalhes() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    courses,
    loading: coursesLoading,
    addCourse,
    updateCourse,
    removeCourse
  } = useStudentCourses(id);
  const {
    logs: activityLogs,
    loading: logsLoading,
    addLog,
    refetch: refetchLogs
  } = useStudentActivityLogs(id);
  const {
    isAdmin
  } = useAdminRole();

  // Add course dialog state
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [pendingCourses, setPendingCourses] = useState<Array<{
    course: string;
    edition: string;
  }>>([]);
  const [addingCourse, setAddingCourse] = useState(false);

  // Geocoding state for map (disabled for now)
  // const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  // const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);

  // Edit course dialog state
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<StudentCourse | null>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    status: "",
    edition: ""
  });

  // Remove course confirmation dialog state
  const [removeCourseDialogOpen, setRemoveCourseDialogOpen] = useState(false);
  const [courseToRemove, setCourseToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRemovingCourse, setIsRemovingCourse] = useState(false);

  // Edit student dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const {
    user
  } = useAuth();
  const fetchStudent = async () => {
    if (!id) return;
    try {
      const {
        data,
        error
      } = await supabase.from("students").select("*").eq("id", id).single();
      if (error) throw error;
      // Parse JSONB fields - cast through unknown to handle Json type
      const parsedData = {
        ...data,
        phones: Array.isArray(data.phones) ? data.phones : null,
        emails: Array.isArray(data.emails) ? data.emails : null,
        tags: Array.isArray(data.tags) ? data.tags : null
      } as unknown as Student;
      setStudent(parsedData);
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudent();
  }, [id]);

  // Realtime subscription for student changes
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`student-${id}-changes`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'students',
      filter: `id=eq.${id}`
    }, payload => {
      if (payload.eventType === 'UPDATE') {
        setStudent(payload.new as Student);
      } else if (payload.eventType === 'DELETE') {
        navigate('/alunos');
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate]);

  // Geocoding with Nominatim API (disabled for now)
  /*
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!student) return;
      
      const hasAddress = student.address || student.city || student.state;
      if (!hasAddress) return;
      
      setIsLoadingGeocode(true);
      
      try {
        // Use structured search for better precision with street addresses
        const params = new URLSearchParams({
          format: 'json',
          limit: '1',
          addressdetails: '1',
          countrycodes: 'br'
        });
        
        // Try with street address first for maximum precision
        if (student.address) {
          params.set('street', student.address);
        }
        if (student.city) {
          params.set('city', student.city);
        }
        if (student.state) {
          params.set('state', student.state);
        }
        if (student.cep) {
          params.set('postalcode', student.cep.replace(/\D/g, ''));
        }
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              'User-Agent': 'EducaSafras-CRM/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
          });
        } else {
          // Fallback: free-form query with full address string
          const fullQuery = [student.address, student.city, student.state, student.cep, "Brasil"]
            .filter(Boolean)
            .join(", ");
          
          const fallbackResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1&countrycodes=br`,
            {
              headers: {
                'User-Agent': 'EducaSafras-CRM/1.0'
              }
            }
          );
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && fallbackData.length > 0) {
            setCoordinates({
              lat: parseFloat(fallbackData[0].lat),
              lon: parseFloat(fallbackData[0].lon)
            });
          } else {
            // Last resort: just city and state
            const cityQuery = [student.city, student.state, "Brasil"].filter(Boolean).join(", ");
            const cityResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=1&countrycodes=br`,
              {
                headers: {
                  'User-Agent': 'EducaSafras-CRM/1.0'
                }
              }
            );
            const cityData = await cityResponse.json();
            
            if (cityData && cityData.length > 0) {
              setCoordinates({
                lat: parseFloat(cityData[0].lat),
                lon: parseFloat(cityData[0].lon)
              });
            } else {
              setCoordinates(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setCoordinates(null);
      } finally {
        setIsLoadingGeocode(false);
      }
    };
    
    fetchCoordinates();
  }, [student?.address, student?.city, student?.state, student?.cep]);
  */
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    // Parse date string as local time to avoid timezone offset issues
    // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return "—";
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return "—";
    const date = new Date(year, month - 1, day);
    return format(date, "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR
    });
  };
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };
  const handleAddCourses = async () => {
    if (pendingCourses.length === 0 || !id) return;
    setAddingCourse(true);
    try {
      for (const pending of pendingCourses) {
        await addCourse({
          student_id: id,
          course_name: pending.course,
          enrollment_date: new Date().toISOString(),
          status: "matriculado",
          edition: pending.edition
        });

        // Log the activity
        await addLog('course_added', `Curso "${pending.course}" (${pending.edition}) adicionado`, {
          course_name: pending.course,
          edition: pending.edition,
          enrollment_date: new Date().toISOString()
        });
      }
      toast.success(pendingCourses.length === 1 ? "Curso adicionado com sucesso!" : `${pendingCourses.length} cursos adicionados com sucesso!`);
      setPendingCourses([]);
      setIsAddCourseOpen(false);
    } finally {
      setAddingCourse(false);
    }
  };
  const openRemoveCourseDialog = (courseId: string, courseName: string) => {
    setCourseToRemove({
      id: courseId,
      name: courseName
    });
    setRemoveCourseDialogOpen(true);
  };
  const handleConfirmRemoveCourse = async () => {
    if (courseToRemove) {
      setIsRemovingCourse(true);
      try {
        await removeCourse(courseToRemove.id);
        await addLog('course_removed', `Curso "${courseToRemove.name}" removido`, {
          course_name: courseToRemove.name
        });
        toast.success("Curso removido com sucesso");
      } finally {
        setIsRemovingCourse(false);
        setRemoveCourseDialogOpen(false);
        setCourseToRemove(null);
      }
    }
  };

  // Open edit course dialog
  const handleOpenEditCourse = (course: StudentCourse) => {
    setEditingCourse(course);
    setEditCourseForm({
      status: course.status || "matriculado",
      edition: course.edition || ""
    });
    setIsEditCourseOpen(true);
  };

  // Save course edits
  const handleSaveCourseEdit = async () => {
    if (!editingCourse) return;
    const changes: string[] = [];
    const updateData: {
      edition?: string;
    } = {};

    // Check edition change
    if (editCourseForm.edition !== (editingCourse.edition || "")) {
      changes.push(`Edição: "${editingCourse.edition || "—"}" → "${editCourseForm.edition || "—"}"`);
      updateData.edition = editCourseForm.edition || null;
    }
    if (changes.length === 0) {
      toast.info("Nenhuma alteração detectada");
      setIsEditCourseOpen(false);
      return;
    }
    if (changes.length === 0) {
      toast.info("Nenhuma alteração detectada");
      setIsEditCourseOpen(false);
      return;
    }

    // Close dialog immediately for better UX (optimistic update)
    setIsEditCourseOpen(false);
    setEditingCourse(null);
    toast.success("Curso atualizado com sucesso!");

    // Execute database operations in parallel in background
    try {
      await Promise.all([updateCourse(editingCourse.id, updateData), addLog('course_updated', `Curso "${editingCourse.course_name}" atualizado: ${changes.join(", ")}`, {
        course_name: editingCourse.course_name,
        changes
      })]);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Erro ao atualizar curso");
    }
  };

  // Get timeline events from activity logs + created event
  const getTimelineEvents = () => {
    if (!student) return [];
    const events: Array<{
      id: string;
      icon: typeof UserPlus;
      title: string;
      description?: string;
      date: string;
      color: string;
      performer?: string;
    }> = [];

    // Created event (always show)
    events.push({
      id: "created",
      icon: UserPlus,
      title: "Aluno cadastrado no sistema",
      date: student.created_at,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30"
    });

    // Add activity logs
    activityLogs.forEach(log => {
      let icon = Edit;
      let color = "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
      switch (log.action_type) {
        case 'course_added':
          icon = Plus;
          color = "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
          break;
        case 'course_removed':
          icon = Trash2;
          color = "text-red-600 bg-red-100 dark:bg-red-900/30";
          break;
        case 'course_status_changed':
          icon = Edit;
          color = "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
          break;
        case 'student_updated':
          icon = Edit;
          color = "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
          break;
      }
      events.push({
        id: log.id,
        icon,
        title: log.description,
        date: log.created_at,
        color,
        performer: log.performer_name
      });
    });

    // Sort by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  const handleExportPDF = async () => {
    if (!student) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Add logo
    try {
      const logoImg = new Image();
      logoImg.src = companyLogo;
      await new Promise(resolve => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      // Add logo centered at top (30x30 size)
      const logoSize = 25;
      doc.addImage(logoImg, 'PNG', (pageWidth - logoSize) / 2, yPos, logoSize, logoSize);
      yPos += logoSize + 8;
    } catch (error) {
      console.error('Error loading logo:', error);
      yPos += 10;
    }

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico do Aluno", pageWidth / 2, yPos, {
      align: "center"
    });
    yPos += 12;

    // Student Name
    doc.setFontSize(14);
    doc.text(student.name, pageWidth / 2, yPos, {
      align: "center"
    });
    yPos += 8;

    // Personal Info Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Informações Pessoais", 14, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const formatBirthDate = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return format(new Date(year, month - 1, day), "dd/MM/yyyy");
    };
    const personalInfo = [["E-mail:", student.email], ["Telefone:", student.phone || "—"], ["CPF:", student.cpf || "—"], ["Data de Nascimento:", student.birth_date ? formatBirthDate(student.birth_date) : "—"], ["Localização:", student.city && student.state ? `${student.city}, ${student.state}` : student.city || student.state || "—"], ["CEP:", student.cep || "—"], ["Endereço:", student.address || "—"], ["Origem:", student.lead_source ? leadSourceLabels[student.lead_source] || student.lead_source : "—"], ["Cliente S&C:", student.is_sc_client ? "Sim" : "Não"], ["Cadastrado em:", format(new Date(student.created_at), "dd/MM/yyyy")]];
    personalInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 14, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 60, yPos);
      yPos += 6;
    });
    yPos += 10;

    // Courses Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Cursos", 14, yPos);
    yPos += 5;
    if (courses.length > 0) {
      const courseData = courses.map(course => [course.course_name, course.edition || "—", course.enrollment_date ? format(new Date(course.enrollment_date), "dd/MM/yyyy") : "—", course.completion_date ? format(new Date(course.completion_date), "dd/MM/yyyy") : "—"]);
      autoTable(doc, {
        startY: yPos,
        head: [["Curso", "Edição", "Matrícula", "Conclusão"]],
        body: courseData,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246]
        },
        margin: {
          left: 14,
          right: 14
        }
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    } else {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Nenhum curso registrado", 14, yPos);
      yPos += 10;
    }

    // Activity Timeline Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Timeline de Atividades", 14, yPos);
    yPos += 5;
    if (timelineEvents.length > 0) {
      const timelineData = timelineEvents.map(event => [event.title, format(new Date(event.date), "dd/MM/yyyy HH:mm"), event.performer || "Sistema"]);
      autoTable(doc, {
        startY: yPos,
        head: [["Atividade", "Data/Hora", "Responsável"]],
        body: timelineData,
        theme: "striped",
        headStyles: {
          fillColor: [59, 130, 246]
        },
        margin: {
          left: 14,
          right: 14
        }
      });
    } else {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Nenhuma atividade registrada", 14, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
        align: "center"
      });
    }

    // Save PDF
    const fileName = `aluno-${student.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(fileName);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  if (!student) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/alunos")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>
      </div>;
  }
  const timelineEvents = getTimelineEvents();
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate("/alunos")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para alunos
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{student.name}</h1>
                {student.is_sc_client && <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    <Building2 className="h-3 w-3" />
                    Cliente S&C
                  </Badge>}
              </div>
              <p className="text-muted-foreground">{student.email}</p>
              {student.course && <p className="text-sm text-muted-foreground mt-1">
                  <GraduationCap className="h-4 w-4 inline mr-1" />
                  {student.course}
                </p>}
            </div>

            <div className="flex gap-2">
              {isAdmin && <>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <EditStudentDialog open={isEditOpen} onOpenChange={setIsEditOpen} student={student} onSuccess={() => {
                fetchStudent();
                refetchLogs();
              }} onNavigateToStudent={studentId => navigate(`/alunos/${studentId}`)} />
                </>}
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nome completo</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {student.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {student.phone || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{student.cpf || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data de nascimento</p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {formatDate(student.birth_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {student.city && student.state ? `${student.city}, ${student.state}` : student.city || student.state || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium">{student.cep || "—"}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {student.address || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Origem</p>
                  <p className="font-medium flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    {student.lead_source ? leadSourceLabels[student.lead_source] || student.lead_source : "—"}
                  </p>
                </div>

                {/* Map Section (disabled for now)
                {(student.address || student.city || student.state) && (
                  <div className="md:col-span-2 space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Mapa
                        {isLoadingGeocode && <Loader2 className="h-3 w-3 animate-spin" />}
                      </p>
                      <a
                        href={coordinates 
                          ? `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=15/${coordinates.lat}/${coordinates.lon}`
                          : `https://www.openstreetmap.org/search?query=${encodeURIComponent(
                              [student.address, student.city, student.state, student.cep, "Brasil"]
                                .filter(Boolean)
                                .join(", ")
                            )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-action hover:text-action-hover flex items-center gap-1"
                      >
                        Abrir no OpenStreetMap
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="rounded-lg overflow-hidden border h-[200px] relative">
                      {isLoadingGeocode ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : coordinates ? (
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.01},${coordinates.lat - 0.01},${coordinates.lon + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`}
                          style={{ border: 0 }}
                          title="Localização do aluno"
                          className="bg-muted"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <p className="text-sm text-muted-foreground">Localização não encontrada</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                */}
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  
                  Histórico de Cursos
                </CardTitle>
                {isAdmin && <Dialog open={isAddCourseOpen} onOpenChange={open => {
                setIsAddCourseOpen(open);
                if (!open) setPendingCourses([]);
              }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Curso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Cursos</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <AddCourseSelector availableCourses={availableCourses} existingCourses={courses} pendingCourses={pendingCourses} onAddCourse={(course, edition) => {
                      setPendingCourses(prev => [...prev, {
                        course,
                        edition
                      }]);
                    }} onRemoveCourse={index => {
                      setPendingCourses(prev => prev.filter((_, i) => i !== index));
                    }} onEditionChange={(index, edition) => {
                      setPendingCourses(prev => prev.map((p, i) => i === index ? {
                        ...p,
                        edition
                      } : p));
                    }} />
                        <ActionButton onClick={handleAddCourses} disabled={pendingCourses.length === 0} loading={addingCourse} loadingText="Adicionando..." className="w-full">
                          {pendingCourses.length === 0 ? "Adicionar Curso" : pendingCourses.length === 1 ? "Adicionar 1 Curso" : `Adicionar ${pendingCourses.length} Cursos`}
                        </ActionButton>
                      </div>
                    </DialogContent>
                  </Dialog>}
              </CardHeader>
              <CardContent>
                {coursesLoading ? <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div> : courses.length > 0 ? <div className="space-y-3">
                    {courses.map(course => <div key={course.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{course.course_name}</h3>
                                  {course.edition && <Badge variant="outline" className="text-xs">
                                      {course.edition}
                                    </Badge>}
                                </div>
                                {course.completion_date && <p className="text-sm text-muted-foreground">
                                    Concluído em {formatDate(course.completion_date)}
                                  </p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdmin && <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updatingCourseId === course.id}>
                                      {updatingCourseId === course.id ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <MoreVertical className="h-4 w-4" />}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-background">
                                    <DropdownMenuItem onClick={() => handleOpenEditCourse(course)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <Separator className="my-1" />
                                    <DropdownMenuItem onClick={() => openRemoveCourseDialog(course.id, course.course_name)} className="text-destructive focus:text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remover curso
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>}
                            </div>
                          </div>
                        </div>)}
                  </div> : <p className="text-muted-foreground text-center py-8">
                    Nenhum curso registrado
                  </p>}
              </CardContent>
            </Card>

            {/* Notes with History */}
            <StudentNotesCard studentId={id || ''} onNoteAdded={(content, hasAttachment) => {
            const preview = content.length > 50 ? content.substring(0, 50) + '...' : content || '(sem texto)';
            const attachmentText = hasAttachment ? ' com anexo' : '';
            addLog('note_added', `Observação adicionada${attachmentText}: "${preview}"`, {
              content_preview: preview,
              has_attachment: hasAttachment
            });
          }} onNoteDeleted={(content, hasAttachment) => {
            const preview = content.length > 50 ? content.substring(0, 50) + '...' : content || '(sem texto)';
            const attachmentText = hasAttachment ? ' com anexo' : '';
            addLog('note_deleted', `Observação removida${attachmentText}: "${preview}"`, {
              content_preview: preview,
              has_attachment: hasAttachment
            });
          }} />
          </div>

          {/* Right Column - Timeline */}
          <div>
            {/* Timeline */}
            <Card className="flex flex-col max-h-[350px] lg:sticky lg:top-6">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  
                  Timeline de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {logsLoading ? <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div> : timelineEvents.length > 0 ? <div className="space-y-4">
                    {timelineEvents.map((event, index) => {
                  const EventIcon = event.icon;
                  return <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${event.color}`}>
                              <EventIcon className="h-4 w-4" />
                            </div>
                            {index < timelineEvents.length - 1 && <div className="w-px flex-1 bg-border mt-2 min-h-[20px]" />}
                          </div>
                          <div className="pb-4 flex-1">
                            <p className="font-medium text-sm leading-tight">{event.title}</p>
                            <div className="flex flex-wrap items-center gap-x-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(event.date)}
                              </p>
                              {event.performer && <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <p className="text-xs text-muted-foreground">
                                    por {event.performer}
                                  </p>
                                </>}
                            </div>
                          </div>
                        </div>;
                })}
                  </div> : <p className="text-muted-foreground text-center py-8 text-sm">
                    Nenhuma atividade registrada ainda
                  </p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Editar Curso
            </DialogTitle>
          </DialogHeader>
          {editingCourse && <div className="space-y-4 pt-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{editingCourse.course_name}</p>
              </div>
              
              {/* Edition Selection */}
              <div className="space-y-2">
                <Label>Edição</Label>
                <Select value={editCourseForm.edition} onValueChange={value => setEditCourseForm({
              ...editCourseForm,
              edition: value
            })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a edição" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {Array.from({
                  length: 10
                }, (_, i) => <SelectItem key={i + 1} value={`${i + 1}ª Edição`}>
                        {i + 1}ª Edição
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => {
              setIsEditCourseOpen(false);
              setEditingCourse(null);
            }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCourseEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Remove Course Confirmation Dialog */}
      <AlertDialog open={removeCourseDialogOpen} onOpenChange={setRemoveCourseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o curso <strong>{courseToRemove?.name}</strong> deste aluno? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingCourse}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemoveCourse} disabled={isRemovingCourse} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRemovingCourse ? <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removendo...
                </> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}