import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, Edit, Eye, Users, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download, CalendarIcon, X, ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Building2, UserCheck, Target, Megaphone, Check, Filter, Minus } from "lucide-react";
import { useDuplicateCheck } from "@/hooks/useDuplicateCheck";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { DateInput, dateToISO } from "@/components/ui/date-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerBR } from "@/components/ui/date-picker-br";
import { DuplicateAlert } from "@/components/DuplicateAlert";
import { MergeSuccessDialog, calculateMergeChanges, MergeChange } from "@/components/MergeSuccessDialog";
import { StudentForm, StudentFormData, CourseEnrollment } from "@/components/students/StudentForm";
import { EditStudentDialog } from "@/components/students/EditStudentDialog";
import { TrashDialog } from "@/components/students/TrashDialog";
// Duplicate report temporarily disabled - keeping detection active in forms
// import { DuplicateReportDialog } from "@/components/students/DuplicateReportDialog";

import { usePageView } from "@/hooks/usePageView";
import { useStudents, StudentInput, Student } from "@/hooks/useStudents";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, isEqual, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
const courses = [
  "Sucessores do Agro",
  "Gestoras do Agro",
  "Reforma Tributária",
  "Gestão Estratégica de Pessoas"
];

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


export default function Alunos() {
  usePageView('/alunos');
  const navigate = useNavigate();
  const { students, deletedStudents, loading, loadingDeleted, createStudent, updateStudent, deleteStudent, restoreStudent, restoreMultipleStudents, permanentlyDeleteStudent, emptyTrash, bulkCreateStudents, fetchStudents, fetchDeletedStudents } = useStudents();
  const { isAdmin } = useAdminRole();
  const { user } = useAuth();
  const [studentCourses, setStudentCourses] = useState<Record<string, Array<{ course_name: string; status: string; edition: string | null }>>>({});
  
  // Fetch all student courses with status and edition
  const fetchAllCourses = async () => {
    const { data, error } = await supabase
      .from('student_courses')
      .select('student_id, course_name, status, edition');
    
    if (!error && data) {
      const coursesMap: Record<string, Array<{ course_name: string; status: string; edition: string | null }>> = {};
      data.forEach(sc => {
        if (!coursesMap[sc.student_id]) {
          coursesMap[sc.student_id] = [];
        }
        coursesMap[sc.student_id].push({
          course_name: sc.course_name,
          status: sc.status,
          edition: sc.edition
        });
      });
      setStudentCourses(coursesMap);
    }
  };

  // Fetch courses on mount and when students change
  useEffect(() => {
    fetchAllCourses();
  }, [students]);

  // Realtime subscription for student_courses changes
  useEffect(() => {
    const channel = supabase
      .channel('student-courses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_courses'
        },
        () => {
          fetchAllCourses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState<string>("all");
  const [courseEditionFilter, setCourseEditionFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [scClientFilter, setScClientFilter] = useState<string>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [enrollmentDateFrom, setEnrollmentDateFrom] = useState<Date | undefined>(undefined);
  const [enrollmentDateTo, setEnrollmentDateTo] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<"name" | "enrollment_date" | "is_sc_client" | "lead_source" | "location" | "course" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get unique states and cities from students for filter options
  const availableStates = [...new Set(students.map(s => s.state).filter(Boolean))].sort() as string[];
  const availableCities = [...new Set(
    students
      .filter(s => stateFilter === "all" || s.state === stateFilter)
      .map(s => s.city)
      .filter(Boolean)
  )].sort() as string[];
  
  // Get unique editions from all student courses for filter options
  const availableEditions = useMemo(() => {
    const editions = new Set<string>();
    Object.values(studentCourses).forEach(courses => {
      courses.forEach(c => {
        if (c.edition) editions.add(c.edition);
      });
    });
    return [...editions].sort();
  }, [studentCourses]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== "" ||
      courseFilter !== "all" ||
      courseStatusFilter !== "all" ||
      courseEditionFilter !== "all" ||
      stateFilter !== "all" ||
      cityFilter !== "all" ||
      scClientFilter !== "all" ||
      leadSourceFilter !== "all" ||
      enrollmentDateFrom !== undefined ||
      enrollmentDateTo !== undefined
    );
  }, [searchTerm, courseFilter, courseStatusFilter, courseEditionFilter, stateFilter, cityFilter, scClientFilter, leadSourceFilter, enrollmentDateFrom, enrollmentDateTo]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bulk actions state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Trash dialog state
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  
  // Import CSV state - ParsedStudent type defined later in parseCSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<Array<StudentInput & { courses: string[]; isDuplicate?: boolean; duplicateInfo?: { field: string; existingName: string } }>>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[]; skipped: number } | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  
  // Merge success dialog state
  const [mergeSuccessOpen, setMergeSuccessOpen] = useState(false);
  const [mergeSuccessData, setMergeSuccessData] = useState<{
    studentName: string;
    studentId: string;
    changes: MergeChange[];
  } | null>(null);
  
  // Duplicate report dialog state - temporarily disabled
  // const [isDuplicateReportOpen, setIsDuplicateReportOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birth_date: "",
    city: "",
    state: "",
    cep: "",
    address: "",
    notes: "",
    is_sc_client: false,
    lead_source: ""
  });
  
  // Selected courses for multi-select
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  // Course enrollments with status and edition
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      birth_date: "",
      city: "",
      state: "",
      cep: "",
      address: "",
      notes: "",
      is_sc_client: false,
      lead_source: ""
    });
    setSelectedCourses([]);
    setCourseEnrollments([]);
  };

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(course)) {
        // Remove from enrollments too
        setCourseEnrollments(enrollments => enrollments.filter(e => e.course !== course));
        return prev.filter(c => c !== course);
      } else {
        // Add new enrollment with default values
        setCourseEnrollments(enrollments => [
          ...enrollments,
          { course, status: 'matriculado', edition: '1ª Edição' }
        ]);
        return [...prev, course];
      }
    });
  };

  // Handler that syncs both courseEnrollments and selectedCourses
  const handleCourseEnrollmentChange = (newEnrollments: CourseEnrollment[]) => {
    setCourseEnrollments(newEnrollments);
    // Keep selectedCourses in sync with enrollments
    setSelectedCourses(newEnrollments.map(e => e.course));
  };

  const handleAddStudent = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Erro", description: "Nome e email são obrigatórios", variant: "destructive" });
      return;
    }

    const newStudent = await createStudent({
      ...formData,
      birth_date: formData.birth_date || null,
      is_sc_client: formData.is_sc_client,
      lead_source: formData.lead_source || null
    });
    
    // Add selected courses to student_courses table with edition
    if (newStudent && courseEnrollments.length > 0) {
      const coursesToInsert = courseEnrollments.map(enrollment => ({
        student_id: newStudent.id,
        course_name: enrollment.course,
        status: 'matriculado',
        edition: enrollment.edition
      }));
      
      await supabase.from('student_courses').insert(coursesToInsert);
    }
    
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditStudent = async () => {
    if (!selectedStudent || !formData.name || !formData.email) {
      toast({ title: "Erro", description: "Nome e email são obrigatórios", variant: "destructive" });
      return;
    }

    // Track changes for activity log
    const changes: string[] = [];
    const oldData = selectedStudent;
    
    // Check each field for changes
    if (formData.name !== oldData.name) {
      changes.push(`Nome: "${oldData.name}" → "${formData.name}"`);
    }
    if (formData.email !== oldData.email) {
      changes.push(`Email: "${oldData.email}" → "${formData.email}"`);
    }
    if ((formData.phone || "") !== (oldData.phone || "")) {
      changes.push(`Telefone: "${oldData.phone || "—"}" → "${formData.phone || "—"}"`);
    }
    if ((formData.cpf || "") !== (oldData.cpf || "")) {
      changes.push(`CPF: "${oldData.cpf || "—"}" → "${formData.cpf || "—"}"`);
    }
    if ((formData.birth_date || "") !== (oldData.birth_date || "")) {
      changes.push(`Data de nascimento: "${oldData.birth_date || "—"}" → "${formData.birth_date || "—"}"`);
    }
    if ((formData.city || "") !== (oldData.city || "")) {
      changes.push(`Cidade: "${oldData.city || "—"}" → "${formData.city || "—"}"`);
    }
    if ((formData.state || "") !== (oldData.state || "")) {
      changes.push(`Estado: "${oldData.state || "—"}" → "${formData.state || "—"}"`);
    }
    if ((formData.notes || "") !== (oldData.notes || "")) {
      changes.push(`Observações atualizadas`);
    }
    if (formData.is_sc_client !== (oldData.is_sc_client || false)) {
      changes.push(`Cliente S&C: "${oldData.is_sc_client ? "Sim" : "Não"}" → "${formData.is_sc_client ? "Sim" : "Não"}"`);
    }
    if ((formData.lead_source || "") !== (oldData.lead_source || "")) {
      const oldLabel = oldData.lead_source ? leadSourceLabels[oldData.lead_source] || oldData.lead_source : "—";
      const newLabel = formData.lead_source ? leadSourceLabels[formData.lead_source] || formData.lead_source : "—";
      changes.push(`Origem: "${oldLabel}" → "${newLabel}"`);
    }

    await updateStudent(selectedStudent.id, {
      ...formData,
      birth_date: formData.birth_date || null,
      is_sc_client: formData.is_sc_client,
      lead_source: formData.lead_source || null
    });
    
    // Sync courses: get current courses for this student
    const currentCourses = studentCourses[selectedStudent.id] || [];
    const currentCourseNames = currentCourses.map(c => c.course_name);
    
    // Courses to add (in selectedCourses but not in current)
    const coursesToAdd = selectedCourses.filter(c => !currentCourseNames.includes(c));
    
    // Courses to remove (in current but not in selectedCourses)
    const coursesToRemove = currentCourseNames.filter(c => !selectedCourses.includes(c));
    
    // Add new courses with enrollment data
    if (coursesToAdd.length > 0) {
      const coursesToInsert = coursesToAdd.map(course_name => {
        const enrollment = courseEnrollments.find(e => e.course === course_name);
        return {
          student_id: selectedStudent.id,
          course_name,
          status: 'matriculado',
          edition: enrollment?.edition || '1ª Edição'
        };
      });
      await supabase.from('student_courses').insert(coursesToInsert);
      
      // Log course additions
      for (const course of coursesToAdd) {
        const enrollment = courseEnrollments.find(e => e.course === course);
        await supabase.from('student_activity_logs').insert({
          student_id: selectedStudent.id,
          action_type: 'course_added',
          description: `Curso "${course}" adicionado (${enrollment?.edition || '1ª Edição'})`,
          details: { 
            course_name: course,
            edition: enrollment?.edition || '1ª Edição'
          },
          performed_by: user?.id || null
        });
      }
    }
    
    // Remove deselected courses
    if (coursesToRemove.length > 0) {
      await supabase
        .from('student_courses')
        .delete()
        .eq('student_id', selectedStudent.id)
        .in('course_name', coursesToRemove);
      
      // Log course removals
      for (const course of coursesToRemove) {
        await supabase.from('student_activity_logs').insert({
          student_id: selectedStudent.id,
          action_type: 'course_removed',
          description: `Curso "${course}" removido`,
          details: { course_name: course },
          performed_by: user?.id || null
        });
      }
    }
    
    // Log student data changes if any
    if (changes.length > 0) {
      await supabase.from('student_activity_logs').insert({
        student_id: selectedStudent.id,
        action_type: 'student_updated',
        description: `Dados atualizados: ${changes.join(', ')}`,
        details: { 
          changes,
          old_values: {
            name: oldData.name,
            email: oldData.email,
            phone: oldData.phone,
            cpf: oldData.cpf,
            birth_date: oldData.birth_date,
            city: oldData.city,
            state: oldData.state,
            status: oldData.status,
            notes: oldData.notes
          },
          new_values: formData
        },
        performed_by: user?.id || null
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedStudent(null);
    resetForm();
  };

  const openDeleteDialog = (student: { id: string; name: string }) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      setIsDeleting(true);
      try {
        await deleteStudent(studentToDelete.id);
        toast({
          title: "Aluno movido para lixeira",
          description: "O aluno foi movido para a lixeira e pode ser restaurado.",
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
      }
    }
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (student: any) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  // CSV Import functions
  interface ParsedStudent extends StudentInput {
    courses: string[];
  }
  
  const parseCSV = (text: string): { data: ParsedStudent[]; errors: string[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const data: ParsedStudent[] = [];

    if (lines.length < 2) {
      errors.push("O arquivo CSV deve conter pelo menos um cabeçalho e uma linha de dados.");
      return { data, errors };
    }

    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(/[,;]/).map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Map expected columns
    const columnMap: Record<string, string> = {
      'nome': 'name',
      'name': 'name',
      'email': 'email',
      'e-mail': 'email',
      'telefone': 'phone',
      'phone': 'phone',
      'cpf': 'cpf',
      'data_nascimento': 'birth_date',
      'birth_date': 'birth_date',
      'data de nascimento': 'birth_date',
      'cidade': 'city',
      'city': 'city',
      'estado': 'state',
      'state': 'state',
      'uf': 'state',
      'cliente s&c': 'is_sc_client',
      'cliente sc': 'is_sc_client',
      'cliente safras': 'is_sc_client',
      'is_sc_client': 'is_sc_client',
      'origem': 'lead_source',
      'lead_source': 'lead_source',
      'fonte': 'lead_source',
      'source': 'lead_source',
      'cursos': 'courses',
      'curso': 'courses',
      'courses': 'courses',
      'course': 'courses',
      'status': 'status',
      'observacoes': 'notes',
      'observações': 'notes',
      'notes': 'notes'
    };

    const headerIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      const mappedKey = columnMap[header];
      if (mappedKey) {
        headerIndexes[mappedKey] = index;
      }
    });

    // Check required columns
    if (!('name' in headerIndexes) || !('email' in headerIndexes)) {
      errors.push("O CSV deve conter pelo menos as colunas 'nome' e 'email'.");
      return { data, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(/[,;]/).map(v => v.trim().replace(/"/g, ''));
      
      const name = values[headerIndexes['name']]?.trim();
      const email = values[headerIndexes['email']]?.trim();

      if (!name || !email) {
        errors.push(`Linha ${i + 1}: Nome e email são obrigatórios.`);
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Linha ${i + 1}: Email inválido (${email}).`);
        continue;
      }

      // Parse courses (separated by | or single course)
      const coursesRaw = headerIndexes['courses'] !== undefined ? values[headerIndexes['courses']] || '' : '';
      const parsedCourses = coursesRaw
        .split('|')
        .map(c => c.trim())
        .filter(c => c && courses.includes(c));

      // Parse is_sc_client
      const scClientRaw = headerIndexes['is_sc_client'] !== undefined ? values[headerIndexes['is_sc_client']]?.toLowerCase().trim() : '';
      const isScClient = ['sim', 'yes', 'true', '1', 's'].includes(scClientRaw);

      // Parse lead_source
      const leadSourceRaw = headerIndexes['lead_source'] !== undefined ? values[headerIndexes['lead_source']]?.toLowerCase().trim() : '';
      // Try to match with known sources or keep raw value
      const matchedSource = leadSources.find(s => s.label.toLowerCase() === leadSourceRaw || s.value === leadSourceRaw);
      const leadSource = matchedSource ? matchedSource.value : (leadSourceRaw || null);

      const student: ParsedStudent = {
        name,
        email,
        phone: headerIndexes['phone'] !== undefined ? values[headerIndexes['phone']] || null : null,
        cpf: headerIndexes['cpf'] !== undefined ? values[headerIndexes['cpf']] || null : null,
        birth_date: headerIndexes['birth_date'] !== undefined ? values[headerIndexes['birth_date']] || null : null,
        city: headerIndexes['city'] !== undefined ? values[headerIndexes['city']] || null : null,
        state: headerIndexes['state'] !== undefined ? values[headerIndexes['state']] || null : null,
        status: headerIndexes['status'] !== undefined ? values[headerIndexes['status']] || 'active' : 'active',
        notes: headerIndexes['notes'] !== undefined ? values[headerIndexes['notes']] || null : null,
        is_sc_client: isScClient,
        lead_source: leadSource,
        courses: parsedCourses
      };

      data.push(student);
    }

    return { data, errors };
  };

  // Check for duplicates in CSV data against existing students
  const checkCsvDuplicates = async (data: Array<StudentInput & { courses: string[] }>) => {
    const { normalizeCPF, normalizePhone, normalizeEmail, normalizeName } = await import('@/hooks/useDuplicateCheck');
    
    const checkedData = await Promise.all(data.map(async (student) => {
      const normalizedCPF = normalizeCPF(student.cpf || '');
      const normalizedPhone = normalizePhone(student.phone || '');
      const normalizedEmail = normalizeEmail(student.email || '');
      const normalizedName = normalizeName(student.name || '');
      
      const hasCPF = normalizedCPF.length >= 11;
      const hasPhone = normalizedPhone.length >= 10;
      const hasEmail = normalizedEmail.length >= 5 && normalizedEmail.includes('@');
      const hasName = normalizedName.length >= 5;
      
      // Only check if we have at least one field
      if (!hasCPF && !hasPhone && !hasEmail && !hasName) {
        return { ...student, isDuplicate: false };
      }
      
      const conditions: string[] = [];
      
      // CPF: search for formatted version
      if (hasCPF) {
        const formattedCPF = normalizedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        conditions.push(`cpf.eq.${formattedCPF}`);
        conditions.push(`cpf.eq.${normalizedCPF}`);
      }
      
      if (hasPhone) {
        conditions.push(`phone.ilike.%${normalizedPhone}%`);
      }
      
      if (hasEmail) {
        conditions.push(`email.ilike.${normalizedEmail}`);
      }
      
      if (hasName) {
        conditions.push(`name.ilike.${normalizedName}`);
      }
      
      const { data: duplicates } = await supabase
        .from('students')
        .select('name, cpf, phone, email')
        .or(conditions.join(','))
        .limit(1);
      
      if (duplicates && duplicates.length > 0) {
        const duplicate = duplicates[0];
        const duplicateCPF = normalizeCPF(duplicate.cpf || '');
        const duplicatePhone = normalizePhone(duplicate.phone || '');
        const duplicateEmail = normalizeEmail(duplicate.email || '');
        const duplicateName = normalizeName(duplicate.name || '');
        
        const matchedFields: string[] = [];
        
        if (hasCPF && duplicateCPF === normalizedCPF) {
          matchedFields.push('CPF');
        }
        if (hasPhone && duplicatePhone.includes(normalizedPhone)) {
          matchedFields.push('Telefone');
        }
        if (hasEmail && duplicateEmail === normalizedEmail) {
          matchedFields.push('Email');
        }
        if (hasName && duplicateName === normalizedName) {
          matchedFields.push('Nome');
        }
        
        if (matchedFields.length > 0) {
          return {
            ...student,
            isDuplicate: true,
            duplicateInfo: { field: matchedFields.join(', '), existingName: duplicate.name }
          };
        }
      }
      
      return { ...student, isDuplicate: false };
    }));
    
    return checkedData;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: "Erro", description: "Por favor, selecione um arquivo CSV.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const { data, errors } = parseCSV(text);
      
      // Check for duplicates
      toast({ title: "Verificando duplicatas...", description: "Aguarde enquanto verificamos os dados." });
      const checkedData = await checkCsvDuplicates(data);
      
      const duplicatesCount = checkedData.filter(s => s.isDuplicate).length;
      if (duplicatesCount > 0) {
        toast({ 
          title: "Duplicatas encontradas", 
          description: `${duplicatesCount} aluno(s) já existem no sistema.`,
          variant: "destructive"
        });
      }
      
      setCsvData(checkedData);
      setCsvErrors(errors);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvData.length === 0) {
      toast({ title: "Erro", description: "Nenhum aluno válido para importar.", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      const results = { success: 0, errors: [] as string[], skipped: 0 };
      
      for (const studentData of csvData) {
        try {
          // Skip duplicates if option is enabled
          if (skipDuplicates && studentData.isDuplicate) {
            results.skipped++;
            continue;
          }
          
          // Extract courses and duplicate info from parsed data
          const { courses: studentCoursesToAdd, isDuplicate, duplicateInfo, ...studentInput } = studentData;
          
          // Create student - cast to any to avoid type issues with Supabase insert
          const { data: newStudent, error } = await supabase
            .from('students')
            .insert(studentInput as any)
            .select()
            .single();

          if (error) {
            results.errors.push(`${studentInput.name}: ${error.message}`);
            continue;
          }

          results.success++;

          // Add courses if any
          if (newStudent && studentCoursesToAdd.length > 0) {
            const coursesToInsert = studentCoursesToAdd.map(course_name => ({
              student_id: newStudent.id,
              course_name,
              status: 'active'
            }));
            
            await supabase.from('student_courses').insert(coursesToInsert);
          }
        } catch (error: any) {
          results.errors.push(`${studentData.name}: ${error.message}`);
        }
      }

      setImportResult(results);
      
      if (results.success > 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} importado(s), ${results.skipped} duplicata(s) ignorada(s).`
        });
        // Refresh students list
        await fetchStudents();
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setCsvData([]);
    setCsvErrors([]);
    setImportResult(null);
    setSkipDuplicates(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
    resetImport();
  };

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ["nome", "email", "telefone", "cpf", "data_nascimento", "cidade", "estado", "cursos", "status", "observacoes", "cliente_sc", "origem"];
    const exampleRow = ["João Silva", "joao@email.com", "(11) 99999-9999", "123.456.789-00", "1990-01-15", "São Paulo", "SP", "Sucessores do Agro|Gestoras do Agro", "active", "Observação exemplo", "Sim", "Indicação"];
    
    const csvContent = [
      headers.join(";"),
      exampleRow.join(";")
    ].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_alunos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export students to CSV
  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      toast({ title: "Aviso", description: "Nenhum aluno para exportar.", variant: "destructive" });
      return;
    }

    const headers = ["Nome", "Email", "Telefone", "CPF", "Data Nascimento", "Cidade", "Estado", "Curso", "Situação", "Edição", "Data Matrícula", "Observações", "Cliente S&C", "Origem"];
    
    // Create one row per student-course combination for better filtering in spreadsheets
    const rows: string[][] = [];
    
    filteredStudents.forEach(student => {
      const courses = studentCourses[student.id] || [];
      
      if (courses.length === 0) {
        // Student with no courses - single row
        rows.push([
          student.name || "",
          student.email || "",
          student.phone || "",
          student.cpf || "",
          student.birth_date || "",
          student.city || "",
          student.state || "",
          "",
          "",
          "",
          student.enrollment_date ? format(new Date(student.enrollment_date), "dd/MM/yyyy", { locale: ptBR }) : "",
          student.notes || "",
          student.is_sc_client ? "Sim" : "Não",
          student.lead_source ? (leadSourceLabels[student.lead_source] || student.lead_source) : ""
        ]);
      } else {
        // One row per course enrollment
        courses.forEach(course => {
          rows.push([
            student.name || "",
            student.email || "",
            student.phone || "",
            student.cpf || "",
            student.birth_date || "",
            student.city || "",
            student.state || "",
            course.course_name || "",
            course.status === "matriculado" ? "Matriculado" : course.status === "concluido" ? "Concluído" : course.status || "",
            course.edition || "",
            student.enrollment_date ? format(new Date(student.enrollment_date), "dd/MM/yyyy", { locale: ptBR }) : "",
            student.notes || "",
            student.is_sc_client ? "Sim" : "Não",
            student.lead_source ? (leadSourceLabels[student.lead_source] || student.lead_source) : ""
          ]);
        });
      }
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alunos_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "Exportação concluída", description: `${filteredStudents.length} aluno(s) exportado(s).` });
  };

  const filteredStudents = students.filter(student => {
    // Only show students who are enrolled (matriculado) - leads should stay in Prospecção
    const isEnrolledStudent = student.status === 'active' || student.funnel_stage === 'matriculado';
    if (!isEnrolledStudent) return false;
    
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf?.includes(searchTerm);
    
    // Course, Status and Edition filters - work together
    const studentCoursesData = studentCourses[student.id] || [];
    let matchesCourseFilters = true;
    
    if (courseFilter !== "all" || courseStatusFilter !== "all" || courseEditionFilter !== "all") {
      matchesCourseFilters = studentCoursesData.some(c => {
        const matchesCourse = courseFilter === "all" || c.course_name === courseFilter;
        const matchesStatus = courseStatusFilter === "all" || c.status === courseStatusFilter;
        const matchesEdition = courseEditionFilter === "all" || c.edition === courseEditionFilter;
        return matchesCourse && matchesStatus && matchesEdition;
      });
    }
    
    const matchesState = stateFilter === "all" || student.state === stateFilter;
    const matchesCity = cityFilter === "all" || student.city === cityFilter;
    const matchesScClient = scClientFilter === "all" || 
      (scClientFilter === "yes" && student.is_sc_client === true) ||
      (scClientFilter === "no" && !student.is_sc_client);
    const matchesLeadSource = leadSourceFilter === "all" || student.lead_source === leadSourceFilter;
    
    // Date filters
    let matchesDateFrom = true;
    let matchesDateTo = true;
    
    if (student.enrollment_date) {
      const enrollmentDate = startOfDay(new Date(student.enrollment_date));
      
      if (enrollmentDateFrom) {
        const fromDate = startOfDay(enrollmentDateFrom);
        matchesDateFrom = isAfter(enrollmentDate, fromDate) || isEqual(enrollmentDate, fromDate);
      }
      
      if (enrollmentDateTo) {
        const toDate = startOfDay(enrollmentDateTo);
        matchesDateTo = isBefore(enrollmentDate, toDate) || isEqual(enrollmentDate, toDate);
      }
    } else {
      // If no enrollment date, only show if no date filter is applied
      if (enrollmentDateFrom || enrollmentDateTo) {
        return false;
      }
    }
    
    return matchesSearch && matchesCourseFilters && matchesState && matchesCity && matchesScClient && matchesLeadSource && matchesDateFrom && matchesDateTo;
  });

  // Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let comparison = 0;
    
    switch (sortColumn) {
      case "name":
        comparison = (a.name || "").localeCompare(b.name || "", "pt-BR");
        break;
      case "enrollment_date":
        const dateA = a.enrollment_date ? new Date(a.enrollment_date).getTime() : 0;
        const dateB = b.enrollment_date ? new Date(b.enrollment_date).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case "is_sc_client":
        // Sort: clients first (true = 1, false = 0)
        const clientA = a.is_sc_client ? 1 : 0;
        const clientB = b.is_sc_client ? 1 : 0;
        comparison = clientA - clientB;
        break;
      case "lead_source":
        const sourceA = a.lead_source ? (leadSourceLabels[a.lead_source] || a.lead_source) : "";
        const sourceB = b.lead_source ? (leadSourceLabels[b.lead_source] || b.lead_source) : "";
        comparison = sourceA.localeCompare(sourceB, "pt-BR");
        break;
      case "location":
        const locA = `${a.state || ""}${a.city || ""}`;
        const locB = `${b.state || ""}${b.city || ""}`;
        comparison = locA.localeCompare(locB, "pt-BR");
        break;
      case "course":
        const courseA = studentCourses[a.id]?.[0]?.course_name || "";
        const courseB = studentCourses[b.id]?.[0]?.course_name || "";
        comparison = courseA.localeCompare(courseB, "pt-BR");
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  // Selection handlers for bulk actions
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(studentId);
      } else {
        newSet.delete(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(paginatedStudents.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const isAllSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudents.has(s.id));
  const isSomeSelected = paginatedStudents.some(s => selectedStudents.has(s.id)) && !isAllSelected;

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;
    
    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedStudents).map(id => deleteStudent(id));
      await Promise.all(deletePromises);
      
      toast({
        title: "Sucesso",
        description: `${selectedStudents.size} aluno(s) movido(s) para a lixeira.`,
      });
      
      setSelectedStudents(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir os alunos selecionados.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Bulk export handler
  const handleBulkExport = () => {
    const selectedStudentsList = students.filter(s => selectedStudents.has(s.id));
    
    if (selectedStudentsList.length === 0) return;
    
    // Create CSV content
    const headers = ["Nome", "Email", "Telefone", "CPF", "Cidade", "Estado", "Cliente S&C", "Origem", "Data Matrícula", "Cursos"];
    const rows = selectedStudentsList.map(student => {
      const courses = studentCourses[student.id]?.map(c => `${c.course_name} (${c.status})`).join("; ") || "";
      return [
        student.name,
        student.email,
        student.phone || "",
        student.cpf || "",
        student.city || "",
        student.state || "",
        student.is_sc_client ? "Sim" : "Não",
        student.lead_source ? leadSourceLabels[student.lead_source] || student.lead_source : "",
        student.enrollment_date ? format(new Date(student.enrollment_date), "dd/MM/yyyy", { locale: ptBR }) : "",
        courses
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `alunos-selecionados-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    
    toast({
      title: "Exportação concluída",
      description: `${selectedStudentsList.length} aluno(s) exportado(s) com sucesso.`,
    });
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleCourseFilterChange = (value: string) => {
    setCourseFilter(value);
    setCurrentPage(1);
  };

  const handleCourseStatusFilterChange = (value: string) => {
    setCourseStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCourseEditionFilterChange = (value: string) => {
    setCourseEditionFilter(value);
    setCurrentPage(1);
  };

  const handleStateFilterChange = (value: string) => {
    setStateFilter(value);
    setCityFilter("all"); // Reset city when state changes
    setCurrentPage(1);
  };

  const handleCityFilterChange = (value: string) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const handleScClientFilterChange = (value: string) => {
    setScClientFilter(value);
    setCurrentPage(1);
  };

  const handleLeadSourceFilterChange = (value: string) => {
    setLeadSourceFilter(value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setEnrollmentDateFrom(date);
    setCurrentPage(1);
  };

  const handleDateToChange = (date: Date | undefined) => {
    setEnrollmentDateTo(date);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setEnrollmentDateFrom(undefined);
    setEnrollmentDateTo(undefined);
    setCurrentPage(1);
  };

  const handleSort = (column: "name" | "enrollment_date" | "is_sc_client" | "lead_source" | "location" | "course") => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ column }: { column: "name" | "enrollment_date" | "is_sc_client" | "lead_source" | "location" | "course" }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }
    return sortDirection === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3" /> 
      : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  // Duplicate check hook - memoize the excludeId to avoid unnecessary rerenders
  const duplicateExcludeId = useMemo(() => 
    isEditDialogOpen && selectedStudent ? selectedStudent.id : null, 
    [isEditDialogOpen, selectedStudent]
  );
  
  const duplicateCheck = useDuplicateCheck({
    cpf: formData.cpf,
    phone: formData.phone,
    email: formData.email,
    name: formData.name,
    excludeId: duplicateExcludeId
  });

  const handleViewDuplicateStudent = (studentId: string) => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    navigate(`/alunos/${studentId}`);
  };

  // Handler for merging duplicate students
  const handleMergeStudents = useCallback(async (mergedData: any, existingStudentId: string) => {
    try {
      // Get existing student data for comparison
      const { data: existingStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', existingStudentId)
        .single();

      // Calculate changes for the summary
      const fieldsToCompare = ['name', 'email', 'phone', 'cpf', 'birth_date', 'city', 'state', 'notes', 'lead_source', 'is_sc_client'];
      const changes = calculateMergeChanges(existingStudent || {}, mergedData, fieldsToCompare);

      // Update the existing student with the merged data
      await updateStudent(existingStudentId, {
        name: mergedData.name,
        email: mergedData.email,
        phone: mergedData.phone || null,
        cpf: mergedData.cpf || null,
        birth_date: mergedData.birth_date || null,
        city: mergedData.city || null,
        state: mergedData.state || null,
        notes: mergedData.notes || null,
        is_sc_client: mergedData.is_sc_client ?? false,
        lead_source: mergedData.lead_source || null
      });

      // Handle courses if they were selected
      if (mergedData.course && selectedCourses.length > 0) {
        const currentCourses = studentCourses[existingStudentId] || [];
        const currentCourseNames = currentCourses.map(c => c.course_name);
        const coursesToAdd = selectedCourses.filter(c => !currentCourseNames.includes(c));
        
        if (coursesToAdd.length > 0) {
          const coursesToInsert = coursesToAdd.map(course_name => {
            const enrollment = courseEnrollments.find(e => e.course === course_name);
            return {
              student_id: existingStudentId,
              course_name,
              status: 'matriculado',
              edition: enrollment?.edition || '1ª Edição'
            };
          });
          await supabase.from('student_courses').insert(coursesToInsert);
        }
      }

      // Log the merge action
      await supabase.from('student_activity_logs').insert({
        student_id: existingStudentId,
        action_type: 'student_updated',
        description: 'Cadastro mesclado com dados de novo formulário',
        details: { merged_data: mergedData, changes: changes.map(c => ({ field: c.field, from: c.oldValue, to: c.newValue })) },
        performed_by: user?.id || null
      });

      // Close dialogs and reset form
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
      
      // Refresh data
      fetchStudents();
      fetchAllCourses();

      // Show success dialog with summary
      setMergeSuccessData({
        studentName: mergedData.name,
        studentId: existingStudentId,
        changes
      });
      setMergeSuccessOpen(true);
    } catch (error: any) {
      console.error('Error merging students:', error);
      toast({
        title: "Erro ao mesclar cadastros",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [updateStudent, selectedCourses, studentCourses, user?.id, resetForm, fetchStudents]);

  // Memoized handlers for StudentForm to prevent unnecessary re-renders
  const handleFormDataChange = useCallback((newData: StudentFormData) => {
    setFormData(newData);
  }, []);

  const handleCancelForm = useCallback(() => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    resetForm();
  }, []);

  // Handler for merging from duplicate report - temporarily disabled
  /* const handleMergeFromReport = useCallback((student1: Student, student2: Student) => {
    // Pre-fill form with student1's data and open merge dialog
    setFormData({
      name: student1.name,
      email: student1.email,
      phone: student1.phone || "",
      cpf: student1.cpf || "",
      birth_date: student1.birth_date || "",
      city: student1.city || "",
      state: student1.state || "",
      status: student1.status,
      notes: student1.notes || "",
      is_sc_client: student1.is_sc_client || false,
      lead_source: student1.lead_source || ""
    });
    setSelectedCourses(studentCourses[student1.id] || []);
    setEditingStudent(student1);
    setIsDuplicateReportOpen(false);
    setIsEditDialogOpen(true);
    
    toast({
      title: "Revise os dados",
      description: `Compare os dados de "${student1.name}" com "${student2.name}" e salve as alterações para mesclar.`,
    });
  }, [studentCourses]); */

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-outfit font-bold text-foreground">Alunos</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Gerenciamento de banco de dados de alunos</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Trash Button - First position */}
              {isAdmin && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs md:text-sm relative hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                        onClick={() => {
                          setIsTrashOpen(true);
                          fetchDeletedStudents();
                        }}
                      >
                        <Trash2 className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Lixeira</span>
                        {deletedStudents.length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                            {deletedStudents.length > 99 ? '99+' : deletedStudents.length}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver alunos excluídos (auto-exclusão após 30 dias)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Export CSV Button */}
              <Button variant="outline" size="sm" onClick={exportToCSV} className="text-xs md:text-sm">
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Exportar CSV</span>
              </Button>

              {/* Admin-only actions */}
              {isAdmin && (
                <>
                  {/* Duplicate Report Button - Temporarily Disabled
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setIsDuplicateReportOpen(true)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verificar duplicidades</p>
                    </TooltipContent>
                  </Tooltip>
                  */}

                  {/* Import CSV Button */}
                  <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
                    setIsImportDialogOpen(open);
                    if (!open) resetImport();
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs md:text-sm">
                        <Upload className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Importar CSV</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Importar Alunos via CSV</DialogTitle>
                        <DialogDescription>
                          Faça upload de um arquivo CSV com os dados dos alunos para cadastro em massa.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        {/* Template info */}
                        <Alert>
                          <FileSpreadsheet className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                              <div>
                                <p className="font-medium mb-1">Formato esperado do CSV:</p>
                                <p className="text-xs text-muted-foreground">
                                  Colunas obrigatórias: <span className="font-semibold">nome, email</span><br />
                                  Colunas opcionais: telefone, cpf, data_nascimento, cidade, estado, curso, status, observacoes
                                </p>
                              </div>
                              <Button size="sm" onClick={downloadTemplate} className="flex-shrink-0 h-9 bg-action hover:bg-action-hover text-white !shadow-none !transform-none transition-colors duration-200">
                                <Download className="h-3 w-3 mr-1" />
                                Baixar Modelo
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>

                        {/* File input */}
                        <div className="space-y-2">
                          <Label htmlFor="csv-file">Selecionar Arquivo</Label>
                          <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="cursor-pointer"
                          />
                        </div>

                        {/* CSV Errors */}
                        {csvErrors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <p className="font-medium mb-1">Erros encontrados:</p>
                              <ScrollArea className="h-24">
                                <ul className="text-xs space-y-1">
                                  {csvErrors.map((error, i) => (
                                    <li key={i}>• {error}</li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Preview */}
                        {csvData.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  {csvData.filter(s => !s.isDuplicate).length} novo(s), {csvData.filter(s => s.isDuplicate).length} duplicata(s)
                                </span>
                              </div>
                              
                              {csvData.some(s => s.isDuplicate) && (
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id="skip-duplicates"
                                    checked={skipDuplicates}
                                    onCheckedChange={setSkipDuplicates}
                                  />
                                  <Label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                                    Ignorar duplicatas
                                  </Label>
                                </div>
                              )}
                            </div>
                            
                            {/* Duplicates warning */}
                            {csvData.some(s => s.isDuplicate) && (
                              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800 dark:text-amber-400">
                                  <p className="font-medium mb-1">Duplicatas encontradas:</p>
                                  <ScrollArea className="h-20">
                                    <ul className="text-xs space-y-1">
                                      {csvData.filter(s => s.isDuplicate).map((student, i) => (
                                        <li key={i}>
                                          • <strong>{student.name}</strong>: {student.duplicateInfo?.field} já existe 
                                          (cadastro de {student.duplicateInfo?.existingName})
                                        </li>
                                      ))}
                                    </ul>
                                  </ScrollArea>
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <ScrollArea className="h-48 border rounded-lg">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-8">Status</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="hidden sm:table-cell">CPF/Tel</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {csvData.slice(0, 15).map((student, i) => (
                                    <TableRow key={i} className={student.isDuplicate ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                                      <TableCell>
                                        {student.isDuplicate ? (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger>
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>{student.duplicateInfo?.field} duplicado</p>
                                                <p className="text-xs text-muted-foreground">
                                                  Existe: {student.duplicateInfo?.existingName}
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                      </TableCell>
                                      <TableCell className="text-sm">{student.name}</TableCell>
                                      <TableCell className="text-sm">{student.email}</TableCell>
                                      <TableCell className="text-sm hidden sm:table-cell">
                                        {student.cpf || student.phone || "-"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {csvData.length > 15 && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                  ... e mais {csvData.length - 15} aluno(s)
                                </p>
                              )}
                            </ScrollArea>
                          </div>
                        )}

                        {/* Import Result */}
                        {importResult && (
                          <Alert variant={importResult.errors.length > 0 ? "destructive" : "default"}>
                            <AlertDescription>
                              <p className="font-medium">
                                {importResult.success} importado(s), {importResult.skipped} duplicata(s) ignorada(s).
                              </p>
                              {importResult.errors.length > 0 && (
                                <ScrollArea className="h-24 mt-2">
                                  <ul className="text-xs space-y-1">
                                    {importResult.errors.map((error, i) => (
                                      <li key={i}>• {error}</li>
                                    ))}
                                  </ul>
                                </ScrollArea>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={closeImportDialog}>
                            {importResult ? "Fechar" : "Cancelar"}
                          </Button>
                          {!importResult && (
                            <ActionButton 
                              onClick={handleImport} 
                              disabled={csvData.length === 0}
                              loading={isImporting}
                              loadingText="Importando..."
                            >
                              <Upload className="h-4 w-4" />
                              Importar {csvData.length} Aluno(s)
                            </ActionButton>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Add Student Button */}
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <ActionButton onClick={resetForm} size="sm" className="text-xs md:text-sm">
                        <Plus className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Novo Aluno</span>
                      </ActionButton>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 border-0 overflow-hidden">
                      <StudentForm
                        formData={formData}
                        onFormDataChange={handleFormDataChange}
                        selectedCourses={selectedCourses}
                        onToggleCourse={toggleCourse}
                        courseEnrollments={courseEnrollments}
                        onCourseEnrollmentChange={handleCourseEnrollmentChange}
                        courses={courses}
                        leadSources={leadSources}
                        duplicateCheck={duplicateCheck}
                        onViewDuplicateStudent={handleViewDuplicateStudent}
                        onMerge={handleMergeStudents}
                        onSubmit={handleAddStudent}
                        onCancel={handleCancelForm}
                        submitLabel="Adicionar"
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="mb-6 md:mb-8 space-y-3">
          {/* Filter Active Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
              <Filter className="h-3 w-3" />
              <span>Exibindo resultados filtrados ({filteredStudents.length} de {students.length} alunos)</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={cn(
              "border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group",
              hasActiveFilters && "ring-1 ring-primary/20"
            )}>
              <CardContent className="p-4">
                <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Total</p>
                <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                  {filteredStudents.length}
                </span>
              </CardContent>
            </Card>

            <Card className={cn(
              "border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group",
              hasActiveFilters && "ring-1 ring-primary/20"
            )}>
              <CardContent className="p-4">
                <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Matriculados</p>
                <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                  {filteredStudents.filter(s => studentCourses[s.id]?.some(c => c.status === 'matriculado')).length}
                </span>
              </CardContent>
            </Card>

            <Card className={cn(
              "border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group",
              hasActiveFilters && "ring-1 ring-primary/20"
            )}>
              <CardContent className="p-4">
                <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Concluídos</p>
                <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                  {filteredStudents.filter(s => studentCourses[s.id]?.some(c => c.status === 'concluido')).length}
                </span>
              </CardContent>
            </Card>

            <Card className={cn(
              "border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group",
              hasActiveFilters && "ring-1 ring-primary/20"
            )}>
              <CardContent className="p-4">
                <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">Clientes S&C</p>
                <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                  {filteredStudents.filter(s => s.is_sc_client === true).length} ({filteredStudents.length > 0 ? ((filteredStudents.filter(s => s.is_sc_client === true).length / filteredStudents.length) * 100).toFixed(0) : 0}%)
                </span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtros
                    {(courseFilter !== "all" || courseStatusFilter !== "all" || courseEditionFilter !== "all" || stateFilter !== "all" || cityFilter !== "all" || scClientFilter !== "all" || leadSourceFilter !== "all" || enrollmentDateFrom || enrollmentDateTo) && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground hover:bg-primary/80">
                        {[
                          courseFilter !== "all",
                          courseStatusFilter !== "all",
                          courseEditionFilter !== "all",
                          stateFilter !== "all",
                          cityFilter !== "all",
                          scClientFilter !== "all",
                          leadSourceFilter !== "all",
                          !!enrollmentDateFrom || !!enrollmentDateTo
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Filtros</h4>
                      {(courseFilter !== "all" || courseStatusFilter !== "all" || courseEditionFilter !== "all" || stateFilter !== "all" || cityFilter !== "all" || scClientFilter !== "all" || leadSourceFilter !== "all" || enrollmentDateFrom || enrollmentDateTo) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setCourseFilter("all");
                            setCourseStatusFilter("all");
                            setCourseEditionFilter("all");
                            setStateFilter("all");
                            setCityFilter("all");
                            setScClientFilter("all");
                            setLeadSourceFilter("all");
                            setEnrollmentDateFrom(undefined);
                            setEnrollmentDateTo(undefined);
                            setCurrentPage(1);
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Limpar
                        </Button>
                      )}
                    </div>
                    
                    {/* Course Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Curso</Label>
                      <Select value={courseFilter} onValueChange={handleCourseFilterChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Curso" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="all">Todos os Cursos</SelectItem>
                          {courses.map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Course Status and Edition Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Situação e Edição</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={courseStatusFilter} onValueChange={handleCourseStatusFilterChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Situação" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="matriculado">Matriculado</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={courseEditionFilter} onValueChange={handleCourseEditionFilterChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Edição" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="all">Todas</SelectItem>
                            {availableEditions.map(edition => (
                              <SelectItem key={edition} value={edition}>{edition}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Location Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Localização</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={stateFilter} onValueChange={handleStateFilterChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="all">Todos</SelectItem>
                            {availableStates.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={cityFilter} onValueChange={handleCityFilterChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Cidade" />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="all">Todas</SelectItem>
                            {availableCities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Cliente S&C Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Cliente S&C</Label>
                      <Select value={scClientFilter} onValueChange={handleScClientFilterChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Cliente S&C" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="yes">Clientes S&C</SelectItem>
                          <SelectItem value="no">Leads (Não Clientes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Origem Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Origem</Label>
                      <Select value={leadSourceFilter} onValueChange={handleLeadSourceFilterChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Origem" />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="all">Todas as Origens</SelectItem>
                          {leadSources.map(source => (
                            <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Date Filters */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Data de Matrícula</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <DateInput
                          value={enrollmentDateFrom ? format(enrollmentDateFrom, "yyyy-MM-dd") : ""}
                          onChange={(value) => handleDateFromChange(value ? new Date(value) : undefined)}
                          showValidation={false}
                        />
                        <DateInput
                          value={enrollmentDateTo ? format(enrollmentDateTo, "yyyy-MM-dd") : ""}
                          onChange={(value) => handleDateToChange(value ? new Date(value) : undefined)}
                          showValidation={false}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Active Filters Display */}
            {(courseFilter !== "all" || courseStatusFilter !== "all" || courseEditionFilter !== "all" || stateFilter !== "all" || cityFilter !== "all" || scClientFilter !== "all" || leadSourceFilter !== "all" || enrollmentDateFrom || enrollmentDateTo) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {courseFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Curso: {courseFilter}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleCourseFilterChange("all")} />
                  </Badge>
                )}
                {courseStatusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Situação: {courseStatusFilter === "matriculado" ? "Matriculado" : "Concluído"}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleCourseStatusFilterChange("all")} />
                  </Badge>
                )}
                {courseEditionFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Edição: {courseEditionFilter}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleCourseEditionFilterChange("all")} />
                  </Badge>
                )}
                {stateFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Estado: {stateFilter}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleStateFilterChange("all")} />
                  </Badge>
                )}
                {cityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Cidade: {cityFilter}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleCityFilterChange("all")} />
                  </Badge>
                )}
                {scClientFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    {scClientFilter === "yes" ? "Clientes S&C" : "Leads"}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleScClientFilterChange("all")} />
                  </Badge>
                )}
                {leadSourceFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    <Megaphone className="h-3 w-3" />
                    {leadSourceLabels[leadSourceFilter] || leadSourceFilter}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleLeadSourceFilterChange("all")} />
                  </Badge>
                )}
                {(enrollmentDateFrom || enrollmentDateTo) && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30">
                    Data: {enrollmentDateFrom ? format(enrollmentDateFrom, "dd/MM/yy", { locale: ptBR }) : "..."} - {enrollmentDateTo ? format(enrollmentDateTo, "dd/MM/yy", { locale: ptBR }) : "..."}
                    <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={clearDateFilters} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedStudents.size > 0 && (
          <div className="sticky top-0 z-20 bg-primary text-primary-foreground rounded-lg p-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-foreground/20">
                  <span className="text-sm font-semibold">{selectedStudents.size}</span>
                </div>
                <span className="font-medium">
                  {selectedStudents.size === 1 ? "aluno selecionado" : "alunos selecionados"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkExport}
                  className="gap-2 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground border border-primary-foreground/30"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Alunos</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredStudents.length} aluno(s) encontrado(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum aluno encontrado</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <Table className="min-w-[800px] md:min-w-0">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Selecionar todos"
                            className={isSomeSelected ? "data-[state=checked]:bg-primary" : ""}
                          />
                          {isSomeSelected && !isAllSelected && (
                            <span className="sr-only">Alguns selecionados</span>
                          )}
                        </TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("name")}
                          >
                            Nome
                            <SortIcon column="name" />
                          </Button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                        <TableHead>
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("course")}
                          >
                            Curso
                            <SortIcon column="course" />
                          </Button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("is_sc_client")}
                          >
                            S&C
                            <SortIcon column="is_sc_client" />
                          </Button>
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("location")}
                          >
                            Cidade/UF
                            <SortIcon column="location" />
                          </Button>
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("lead_source")}
                          >
                            Origem
                            <SortIcon column="lead_source" />
                          </Button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <Button 
                            variant="ghost" 
                            className="h-8 px-2 -ml-2 hover:bg-transparent text-xs md:text-sm"
                            onClick={() => handleSort("enrollment_date")}
                          >
                            Matrícula
                            <SortIcon column="enrollment_date" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => (
                        <TableRow key={student.id} data-state={selectedStudents.has(student.id) ? "selected" : undefined}>
                          <TableCell className="w-[50px]">
                            <Checkbox
                              checked={selectedStudents.has(student.id)}
                              onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                              aria-label={`Selecionar ${student.name}`}
                            />
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              {student.name}
                              {student.is_sc_client && (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="md:hidden">
                                        <Building2 className="h-3.5 w-3.5 text-amber-600" />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Cliente Safras & Cifras</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{student.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm whitespace-nowrap">
                            {student.phone ? student.phone : <span className="text-muted-foreground/40">—</span>}
                          </TableCell>
                          <TableCell>
                            {studentCourses[student.id]?.length > 0 ? (
                              <div className="flex items-center gap-1 flex-nowrap">
                                <TooltipProvider delayDuration={200}>
                                  {(() => {
                                    const courseData = studentCourses[student.id][0];
                                    const shortNames: Record<string, string> = {
                                      "Sucessores do Agro": "Sucessores",
                                      "Gestoras do Agro": "Gestoras",
                                      "Reforma Tributária": "Reforma",
                                      "Gestão Estratégica de Pessoas": "GEP"
                                    };
                                    const shortName = shortNames[courseData.course_name] || courseData.course_name.split(" ")[0];
                                    const statusLabel = courseData.status === 'concluido' ? '✓' : '';
                                    return (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>
                                            <Badge variant="outline" className="text-xs font-normal cursor-default hover:bg-muted">
                                              {shortName}{statusLabel ? ` ${statusLabel}` : ''}
                                            </Badge>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="p-3">
                                          <div className="space-y-1">
                                            <p className="font-medium text-white">{courseData.course_name}</p>
                                            <p className="text-xs text-white/70">
                                              {courseData.status === 'concluido' ? 'Concluído' : 'Matriculado'} • {courseData.edition || '1ª Edição'}
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })()}
                                  {studentCourses[student.id].length > 1 && (
                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        <span>
                                          <Badge variant="outline" className="text-xs font-normal cursor-pointer hover:bg-muted">
                                            +{studentCourses[student.id].length - 1}
                                          </Badge>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-xs p-3">
                                        <div className="space-y-3">
                                          {studentCourses[student.id].slice(1).map((c, i) => (
                                            <div key={i} className="text-sm">
                                              <p className="font-medium text-white">{c.course_name}</p>
                                              <p className="text-xs text-white/70">
                                                {c.status === 'concluido' ? 'Concluído' : 'Matriculado'} • {c.edition || '1ª Edição'}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </TooltipProvider>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {student.is_sc_client ? (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Check className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>Cliente Safras & Cifras</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground/30" />
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {student.city && student.state 
                              ? `${student.city}/${student.state}` 
                              : student.city || student.state || <span className="text-muted-foreground/40">—</span>}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {student.lead_source ? (
                              <Badge variant="outline" className="text-xs">
                                {leadSourceLabels[student.lead_source] || student.lead_source}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {student.enrollment_date 
                              ? format(new Date(student.enrollment_date), "dd/MM/yyyy", { locale: ptBR })
                              : <span className="text-muted-foreground/40">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/alunos/${student.id}`)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditDialog(student)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    onClick={() => openDeleteDialog({ id: student.id, name: student.name })}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} de {filteredStudents.length} aluno(s)
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Por página:</span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <EditStudentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        student={editingStudent}
        onSuccess={() => {
          fetchStudents();
          fetchAllCourses();
        }}
        onNavigateToStudent={(studentId) => navigate(`/alunos/${studentId}`)}
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedStudent.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{selectedStudent.cpf || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">
                    {selectedStudent.birth_date 
                      ? format(new Date(selectedStudent.birth_date), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Curso</p>
                  <p className="font-medium">{selectedStudent.course || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cidade/UF</p>
                  <p className="font-medium">
                    {selectedStudent.city && selectedStudent.state 
                      ? `${selectedStudent.city}/${selectedStudent.state}` 
                      : selectedStudent.city || selectedStudent.state || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Matrícula</p>
                  <p className="font-medium">
                    {selectedStudent.enrollment_date 
                      ? format(new Date(selectedStudent.enrollment_date), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </p>
                </div>
              </div>
              {selectedStudent.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium whitespace-pre-wrap">{selectedStudent.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Merge Success Dialog */}
      <MergeSuccessDialog
        open={mergeSuccessOpen}
        onClose={() => {
          setMergeSuccessOpen(false);
          setMergeSuccessData(null);
        }}
        studentName={mergeSuccessData?.studentName || ""}
        changes={mergeSuccessData?.changes || []}
        onViewStudent={mergeSuccessData?.studentId ? () => {
          setMergeSuccessOpen(false);
          navigate(`/alunos/${mergeSuccessData.studentId}`);
        } : undefined}
      />

      {/* Duplicate Report Dialog - Temporarily Disabled
      <DuplicateReportDialog
        open={isDuplicateReportOpen}
        onClose={() => setIsDuplicateReportOpen(false)}
        students={students}
        onViewStudent={(studentId) => {
          setIsDuplicateReportOpen(false);
          navigate(`/alunos/${studentId}`);
        }}
        onMergeStudents={handleMergeFromReport}
        onRefreshStudents={fetchStudents}
      />
      */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover para lixeira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover o aluno <strong>{studentToDelete?.name}</strong> para a lixeira? 
              Você poderá restaurá-lo posteriormente ou excluí-lo permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Movendo...
                </>
              ) : (
                "Mover para lixeira"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trash Dialog */}
      <TrashDialog
        open={isTrashOpen}
        onOpenChange={setIsTrashOpen}
        deletedStudents={deletedStudents}
        loading={loadingDeleted}
        onRestore={restoreStudent}
        onRestoreMultiple={restoreMultipleStudents}
        onPermanentlyDelete={permanentlyDeleteStudent}
        onEmptyTrash={emptyTrash}
        onRefresh={fetchDeletedStudents}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="p-8 max-w-lg">
          <AlertDialogHeader className="text-center sm:text-center space-y-4">
            <div className="mx-auto flex items-center justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold">
              Excluir {selectedStudents.size} {selectedStudents.size === 1 ? "aluno" : "alunos"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
              Os alunos selecionados serão movidos para a lixeira. Você poderá restaurá-los posteriormente se necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel 
              className="flex-1 font-normal"
              disabled={isBulkDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Mover para lixeira"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
