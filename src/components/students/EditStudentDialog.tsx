import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { StudentForm, StudentFormData, CourseEnrollment } from "./StudentForm";
import { MergeSuccessDialog, calculateMergeChanges, MergeChange } from "@/components/MergeSuccessDialog";
import type { Student } from "@/hooks/useStudents";

const leadSources = [
  { value: "indicacao", label: "Indicação" },
  { value: "evento", label: "Evento" },
  { value: "redes_sociais", label: "Redes Sociais" },
  { value: "google", label: "Google/Busca" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "email_marketing", label: "Email Marketing" },
  { value: "parceiro", label: "Parceiro/Afiliado" },
  { value: "outro", label: "Outro" }
];

const leadSourceLabels: Record<string, string> = leadSources.reduce((acc, source) => {
  acc[source.value] = source.label;
  return acc;
}, {} as Record<string, string>);

const courses = [
  "Sucessores do Agro",
  "Gestoras do Agro",
  "Reforma Tributária",
  "Gestão Estratégica de Pessoas"
];

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess?: () => void;
  onNavigateToStudent?: (studentId: string) => void;
}

export function EditStudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
  onNavigateToStudent
}: EditStudentDialogProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    city: "",
    state: "",
    cep: "",
    address: "",
    notes: "",
    is_sc_client: false,
    lead_source: "",
    birth_date: ""
  });
  
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(false);

  // Merge success dialog state
  const [mergeSuccessOpen, setMergeSuccessOpen] = useState(false);
  const [mergeSuccessData, setMergeSuccessData] = useState<{
    studentName: string;
    studentId: string;
    changes: MergeChange[];
  } | null>(null);

  // Duplicate check for edit form
  const duplicateCheck = useDuplicateCheck({
    cpf: formData.cpf,
    phone: formData.phone,
    email: formData.email,
    name: formData.name,
    excludeId: student?.id,
    debounceMs: 500
  });

  // Load student data when dialog opens or student changes
  const loadStudentData = useCallback(async () => {
    if (!student) return;
    
    // Fetch student courses for the form
    const { data: studentCoursesData } = await supabase
      .from('student_courses')
      .select('course_name, status, edition')
      .eq('student_id', student.id);
    
    setFormData({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      cpf: student.cpf || "",
      birth_date: student.birth_date || "",
      city: student.city || "",
      state: student.state || "",
      cep: (student as any).cep || "",
      address: (student as any).address || "",
      notes: student.notes || "",
      is_sc_client: student.is_sc_client || false,
      lead_source: student.lead_source || ""
    });
    
    // Set selected courses and enrollments
    if (studentCoursesData && studentCoursesData.length > 0) {
      setSelectedCourses(studentCoursesData.map(c => c.course_name));
      setCourseEnrollments(studentCoursesData.map(c => ({
        course: c.course_name,
        edition: c.edition || '1ª Edição'
      })));
    } else {
      setSelectedCourses([]);
      setCourseEnrollments([]);
    }
  }, [student]);

  useEffect(() => {
    if (open && student) {
      loadStudentData();
    }
  }, [open, student, loadStudentData]);

  // Toggle course selection
  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(course)) {
        setCourseEnrollments(enrollments => enrollments.filter(e => e.course !== course));
        return prev.filter(c => c !== course);
      } else {
        setCourseEnrollments(enrollments => [
          ...enrollments,
          { course, edition: '1ª Edição' }
        ]);
        return [...prev, course];
      }
    });
  };

  // Handler that syncs both courseEnrollments and selectedCourses
  const handleCourseEnrollmentChange = (newEnrollments: CourseEnrollment[]) => {
    setCourseEnrollments(newEnrollments);
    setSelectedCourses(newEnrollments.map(e => e.course));
  };

  // Handle student edit
  const handleEditStudent = async () => {
    if (!student) return;

    setLoading(true);
    try {
      // Build changes array for logging
      const changes: string[] = [];
      
      if (formData.name !== student.name) changes.push(`Nome: "${student.name}" → "${formData.name}"`);
      if (formData.email !== student.email) changes.push(`E-mail: "${student.email}" → "${formData.email}"`);
      if (formData.phone !== (student.phone || "")) {
        changes.push(`Telefone: "${student.phone || "—"}" → "${formData.phone || "—"}"`);
      }
      if (formData.cpf !== (student.cpf || "")) {
        changes.push(`CPF: "${student.cpf || "—"}" → "${formData.cpf || "—"}"`);
      }
      if (formData.city !== (student.city || "")) {
        changes.push(`Cidade: "${student.city || "—"}" → "${formData.city || "—"}"`);
      }
      if (formData.state !== (student.state || "")) {
        changes.push(`Estado: "${student.state || "—"}" → "${formData.state || "—"}"`);
      }
      if (formData.notes !== (student.notes || "")) {
        const oldNotes = student.notes ? (student.notes.length > 30 ? student.notes.substring(0, 30) + "..." : student.notes) : "—";
        const newNotes = formData.notes ? (formData.notes.length > 30 ? formData.notes.substring(0, 30) + "..." : formData.notes) : "—";
        changes.push(`Observações: "${oldNotes}" → "${newNotes}"`);
      }
      if (formData.is_sc_client !== (student.is_sc_client || false)) {
        changes.push(`Cliente S&C: "${student.is_sc_client ? "Sim" : "Não"}" → "${formData.is_sc_client ? "Sim" : "Não"}"`);
      }
      if (formData.lead_source !== (student.lead_source || "")) {
        const oldLabel = student.lead_source ? leadSourceLabels[student.lead_source] || student.lead_source : "—";
        const newLabel = formData.lead_source ? leadSourceLabels[formData.lead_source] || formData.lead_source : "—";
        changes.push(`Origem: "${oldLabel}" → "${newLabel}"`);
      }
      if (formData.birth_date !== (student.birth_date || "")) {
        const oldDate = student.birth_date ? format(new Date(student.birth_date + 'T00:00:00'), "dd/MM/yyyy") : "—";
        const newDate = formData.birth_date ? format(new Date(formData.birth_date + 'T00:00:00'), "dd/MM/yyyy") : "—";
        changes.push(`Data de nascimento: "${oldDate}" → "${newDate}"`);
      }

      // Update student data
      const { error } = await supabase
        .from("students")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          cpf: formData.cpf || null,
          birth_date: formData.birth_date || null,
          city: formData.city || null,
          state: formData.state || null,
          cep: formData.cep || null,
          address: formData.address || null,
          notes: formData.notes || null,
          is_sc_client: formData.is_sc_client,
          lead_source: formData.lead_source || null
        })
        .eq("id", student.id);

      if (error) throw error;

      // Sync courses: get current courses for this student (with id and edition)
      const { data: currentCourses } = await supabase
        .from('student_courses')
        .select('id, course_name, edition')
        .eq('student_id', student.id);
      
      // Create unique keys for comparison: "course_name|edition"
      const currentCourseKeys = currentCourses?.map(c => `${c.course_name}|${c.edition || ''}`) || [];
      const selectedCourseKeys = courseEnrollments.map(e => `${e.course}|${e.edition}`);
      
      // Courses to add (in selected but not in current)
      const coursesToAdd = courseEnrollments.filter(e => 
        !currentCourseKeys.includes(`${e.course}|${e.edition}`)
      );
      
      // Courses to remove (in current but not in selected)
      const coursesToRemove = currentCourses?.filter(c => 
        !selectedCourseKeys.includes(`${c.course_name}|${c.edition || ''}`)
      ) || [];
      
      // Add new courses with enrollment data
      if (coursesToAdd.length > 0) {
        const coursesToInsert = coursesToAdd.map(enrollment => ({
          student_id: student.id,
          course_name: enrollment.course,
          status: 'matriculado',
          edition: enrollment.edition || '1ª Edição'
        }));
        await supabase.from('student_courses').insert(coursesToInsert);
        
        // Log course additions
        for (const enrollment of coursesToAdd) {
          await supabase.from('student_activity_logs').insert({
            student_id: student.id,
            action_type: 'course_added',
            description: `Curso "${enrollment.course}" adicionado (${enrollment.edition || '1ª Edição'})`,
            details: { 
              course_name: enrollment.course,
              edition: enrollment.edition || '1ª Edição'
            },
            performed_by: user?.id || null
          });
        }
      }
      
      // Remove deselected courses by ID (more reliable)
      if (coursesToRemove.length > 0) {
        const idsToRemove = coursesToRemove.map(c => c.id);
        await supabase
          .from('student_courses')
          .delete()
          .in('id', idsToRemove);
        
        // Log course removals
        for (const course of coursesToRemove) {
          await supabase.from('student_activity_logs').insert({
            student_id: student.id,
            action_type: 'course_removed',
            description: `Curso "${course.course_name}" (${course.edition || '—'}) removido`,
            details: { course_name: course.course_name, edition: course.edition },
            performed_by: user?.id || null
          });
        }
      }

      // Log student data changes if any
      if (changes.length > 0) {
        await supabase.from('student_activity_logs').insert({
          student_id: student.id,
          action_type: 'student_updated',
          description: `Dados do aluno atualizados: ${changes.join(", ")}`,
          details: { changes }
        });
      }

      toast.success("Aluno atualizado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Erro ao atualizar aluno");
    } finally {
      setLoading(false);
    }
  };

  // Handler for merging duplicate students
  const handleMergeStudents = useCallback(async (mergedData: any, existingStudentId: string) => {
    if (!student) return;
    
    try {
      // Get existing student data for comparison
      const { data: existingStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', existingStudentId)
        .single();

      // Calculate changes for the summary
      const fieldsToCompare = ['name', 'email', 'phone', 'cpf', 'birth_date', 'city', 'state', 'notes', 'lead_source', 'course'];
      const changesForMerge = calculateMergeChanges(existingStudent || {}, mergedData, fieldsToCompare);

      // Update the existing student with the merged data
      const { error } = await supabase
        .from('students')
        .update({
          name: mergedData.name,
          email: mergedData.email,
          phone: mergedData.phone || null,
          cpf: mergedData.cpf || null,
          birth_date: mergedData.birth_date || null,
          city: mergedData.city || null,
          state: mergedData.state || null,
          notes: mergedData.notes || null,
          is_sc_client: mergedData.is_sc_client || false,
          lead_source: mergedData.lead_source || null
        })
        .eq('id', existingStudentId);

      if (error) throw error;

      // Log the merge activity
      await supabase.from('student_activity_logs').insert([{
        student_id: existingStudentId,
        action_type: 'student_merged',
        description: `Dados mesclados com cadastro duplicado`,
        details: { 
          merged_from_form: true,
          changes: changesForMerge 
        } as any,
        performed_by: user?.id || null
      }]);

      // Show success dialog
      setMergeSuccessData({
        studentName: mergedData.name,
        studentId: existingStudentId,
        changes: changesForMerge
      });
      setMergeSuccessOpen(true);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error merging students:", error);
      toast.error("Erro ao mesclar alunos");
    }
  }, [student, user?.id, onOpenChange, onSuccess]);

  const handleViewDuplicateStudent = (studentId: string) => {
    onOpenChange(false);
    onNavigateToStudent?.(studentId);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!student) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl p-0 border-0 overflow-hidden">
          <StudentForm
            formData={formData}
            onFormDataChange={setFormData}
            selectedCourses={selectedCourses}
            onToggleCourse={toggleCourse}
            courseEnrollments={courseEnrollments}
            onCourseEnrollmentChange={handleCourseEnrollmentChange}
            courses={courses}
            leadSources={leadSources}
            duplicateCheck={duplicateCheck}
            onViewDuplicateStudent={handleViewDuplicateStudent}
            onMerge={handleMergeStudents}
            onSubmit={handleEditStudent}
            onCancel={handleCancel}
            submitLabel="Salvar"
          />
        </DialogContent>
      </Dialog>

      <MergeSuccessDialog
        open={mergeSuccessOpen}
        onClose={() => {
          setMergeSuccessOpen(false);
          setMergeSuccessData(null);
        }}
        studentName={mergeSuccessData?.studentName || ""}
        changes={mergeSuccessData?.changes || []}
        onViewStudent={mergeSuccessData?.studentId ? () => {
          const id = mergeSuccessData.studentId;
          setMergeSuccessOpen(false);
          setMergeSuccessData(null);
          onNavigateToStudent?.(id);
        } : undefined}
      />
    </>
  );
}
