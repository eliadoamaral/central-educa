import React, { useMemo, useState, useEffect, useCallback } from "react";
import { User, Mail, Phone, CreditCard, Calendar, GraduationCap, MapPin, FileText, UserPlus, Plus, AlertTriangle, Globe, X, Check, Home, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CPFInput, PhoneInput, validateCPF, validatePhone, isCPFComplete, isPhoneComplete } from "@/components/ui/masked-input";
import { DateInput } from "@/components/ui/date-input";
import { EmailInput, validateEmail, isEmailComplete } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InlineDuplicateAlert } from "@/components/InlineDuplicateAlert";
import { CityCombobox } from "@/components/ui/city-combobox";
import { useIBGELocations } from "@/hooks/useIBGELocations";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DuplicateCheckResult } from "@/hooks/useDuplicateCheck";
export interface CourseEnrollment {
  course: string;
  edition: string;
}
export interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  city: string;
  state: string;
  cep: string;
  address: string;
  notes: string;
  is_sc_client: boolean;
  lead_source: string;
  birth_date: string;
}
interface StudentFormProps {
  formData: StudentFormData;
  onFormDataChange: (data: StudentFormData) => void;
  selectedCourses: string[];
  onToggleCourse: (course: string) => void;
  courseEnrollments: CourseEnrollment[];
  onCourseEnrollmentChange: (enrollments: CourseEnrollment[]) => void;
  courses: string[];
  leadSources: {
    value: string;
    label: string;
  }[];
  duplicateCheck: DuplicateCheckResult;
  onViewDuplicateStudent: (studentId: string) => void;
  onMerge?: (mergedData: any, existingStudentId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}
const isEmpty = (value: string): boolean => {
  return value.replace(/\D/g, "").length === 0;
};
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

// Course selector component with add functionality
const CourseSelector = ({
  courses,
  courseEnrollments,
  onAddCourse,
  onRemoveCourse,
  onEditionChange
}: {
  courses: string[];
  courseEnrollments: CourseEnrollment[];
  onAddCourse: (course: string, edition: string) => void;
  onRemoveCourse: (index: number) => void;
  onEditionChange: (index: number, edition: string) => void;
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedEdition, setSelectedEdition] = useState<string>("1ª Edição");
  // Todos os cursos ficam sempre disponíveis (aluno pode fazer múltiplas edições)
  const availableCourses = courses;

  // Verifica se a combinação curso + edição já existe
  const isDuplicate = selectedCourse && selectedEdition && courseEnrollments.some(e => e.course === selectedCourse && e.edition === selectedEdition);
  const handleAddCourse = () => {
    if (selectedCourse && selectedEdition && !isDuplicate) {
      onAddCourse(selectedCourse, selectedEdition);
      setSelectedCourse("");
      setSelectedEdition("1ª Edição");
    }
  };
  return <div className="space-y-3">
      {/* Add course section */}
      {availableCourses.length > 0 && <div className="space-y-2">
          {/* Course select - full width with icon */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
              <GraduationCap className="h-4 w-4" />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full h-10 pl-10">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map(course => <SelectItem key={course} value={course} className="text-sm">
                    {course}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Edition and add button - below */}
          {selectedCourse && <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex gap-2 items-center">
                <Select value={selectedEdition} onValueChange={setSelectedEdition}>
                  <SelectTrigger className={cn("flex-1 h-10", isDuplicate && "border-destructive")}>
                    <SelectValue placeholder="Edição" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-sm">
                        {opt.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Button type="button" size="icon" className="h-10 w-10 flex-shrink-0 bg-action hover:bg-action-hover text-white" onClick={handleAddCourse} disabled={!!isDuplicate}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {isDuplicate && <p className="text-xs text-destructive">
                  Esta combinação de curso e edição já foi adicionada
                </p>}
            </div>}
        </div>}

      {/* Selected courses as compact list - Enterprise Minimalist */}
      {courseEnrollments.length > 0 && <div className="max-h-[150px] overflow-y-auto">
          {[...courseEnrollments].map((enrollment, originalIndex) => ({
        enrollment,
        originalIndex
      })).sort((a, b) => a.enrollment.course.localeCompare(b.enrollment.course, 'pt-BR')).map(({
        enrollment,
        originalIndex
      }) => <div key={`${enrollment.course}-${originalIndex}`} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 transition-colors group">
                {/* Nome do Curso */}
                <span className="text-[13px] font-medium text-foreground flex-1 truncate">
                  {enrollment.course}
                </span>
                
                {/* Edição - texto sutil clicável */}
                <Select value={enrollment.edition} onValueChange={value => onEditionChange(originalIndex, value)}>
                  <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-muted-foreground text-xs hover:text-foreground focus:ring-0 focus:ring-offset-0 w-auto gap-0.5">
                    <SelectValue>{enrollment.edition}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {EDITION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                
                {/* Botão Remover - sutil, aparece no hover */}
                <button type="button" onClick={() => onRemoveCourse(originalIndex)} className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>)}
        </div>}
    </div>;
};
export const StudentForm = React.memo(function StudentForm({
  formData,
  onFormDataChange,
  selectedCourses,
  onToggleCourse,
  courseEnrollments,
  onCourseEnrollmentChange,
  courses,
  leadSources,
  duplicateCheck,
  onViewDuplicateStudent,
  onMerge,
  onSubmit,
  onCancel,
  submitLabel
}: StudentFormProps) {
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  // IBGE locations hook
  const { states, cities, isLoadingStates, isLoadingCities } = useIBGELocations(formData.state);

  // Clear city when state changes
  useEffect(() => {
    if (formData.state && cities.length > 0) {
      // Check if current city exists in the new state's cities
      const cityExists = cities.some(c => c.value === formData.city);
      if (!cityExists && formData.city) {
        onFormDataChange({ ...formData, city: "" });
      }
    }
  }, [formData.state, cities]);

  // ViaCEP lookup function
  const fetchAddressFromCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado.",
          variant: "destructive"
        });
        return;
      }

      // Build full address from ViaCEP response
      const addressParts = [data.logradouro, data.bairro].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      // Update form with fetched data
      onFormDataChange({
        ...formData,
        state: data.uf || formData.state,
        city: data.localidade || formData.city,
        address: fullAddress || formData.address
      });

      toast({
        title: "Endereço encontrado",
        description: `${data.localidade} - ${data.uf}`,
      });
    } catch (error) {
      console.error("Error fetching CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível consultar o CEP. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCep(false);
    }
  }, [formData, onFormDataChange]);

  // Auto-fetch address when CEP is complete
  useEffect(() => {
    const cleanCep = formData.cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressFromCep(formData.cep);
    }
  }, [formData.cep]);

  const handleInputChange = (field: keyof StudentFormData, value: string | boolean) => {
    // When state changes, clear city
    if (field === "state" && value !== formData.state) {
      onFormDataChange({
        ...formData,
        state: value as string,
        city: ""
      });
      return;
    }
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };
  const isEditing = submitLabel.toLowerCase().includes("salvar") || submitLabel.toLowerCase().includes("atualizar");

  // Validation status
  const validation = useMemo(() => {
    const cpfHasContent = !isEmpty(formData.cpf);
    const phoneHasContent = !isEmpty(formData.phone);
    const emailHasContent = formData.email.length > 0;
    const cpfValid = !cpfHasContent || isCPFComplete(formData.cpf) && validateCPF(formData.cpf);
    const phoneValid = !phoneHasContent || isPhoneComplete(formData.phone) && validatePhone(formData.phone);
    const emailValidation = validateEmail(formData.email);
    const emailValid = !emailHasContent || emailValidation.isValid;
    const cpfIncomplete = cpfHasContent && !isCPFComplete(formData.cpf);
    const phoneIncomplete = phoneHasContent && !isPhoneComplete(formData.phone);
    const emailIncomplete = emailHasContent && formData.email.includes("@") && !isEmailComplete(formData.email);
    return {
      cpfValid,
      phoneValid,
      emailValid,
      emailError: emailValidation.error,
      cpfIncomplete,
      phoneIncomplete,
      emailIncomplete,
      isValid: cpfValid && phoneValid && emailValid && !cpfIncomplete && !phoneIncomplete && !emailIncomplete
    };
  }, [formData.cpf, formData.phone, formData.email]);
  const handleSubmit = () => {
    if (!validation.isValid) {
      const errors: string[] = [];
      if (validation.emailIncomplete) errors.push("Email está incompleto");else if (!validation.emailValid) errors.push(validation.emailError || "Email inválido");
      if (validation.cpfIncomplete) errors.push("CPF está incompleto");else if (!validation.cpfValid) errors.push("CPF inválido");
      if (validation.phoneIncomplete) errors.push("Telefone está incompleto");else if (!validation.phoneValid) errors.push("Telefone inválido");
      toast({
        title: "Erro de validação",
        description: errors.join(". "),
        variant: "destructive"
      });
      return;
    }

    // If there's a duplicate detected and not editing, show confirmation dialog
    if (duplicateCheck.isDuplicate && !isEditing) {
      setShowDuplicateConfirm(true);
      return;
    }
    onSubmit();
  };
  const handleConfirmDuplicate = () => {
    setShowDuplicateConfirm(false);
    onSubmit();
  };
  return <div className="flex flex-col">
      {/* Main Content - Two Columns */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          
          {/* Left Column - Personal Data & Location */}
          <div className="space-y-3">
            {/* Nome */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Nome Completo
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input value={formData.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Nome completo do aluno" icon={<User className="h-4 w-4" />} hasWarning={duplicateCheck.nameDuplicate.isDuplicate} />
              {/* Inline Name Duplicate Alert */}
              <InlineDuplicateAlert fieldResult={duplicateCheck.nameDuplicate} fieldLabel="nome" onViewStudent={onViewDuplicateStudent} />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                E-mail
                <span className="text-destructive ml-1">*</span>
              </Label>
              <EmailInput value={formData.email} onChange={value => handleInputChange("email", value)} placeholder="email@exemplo.com" icon={<Mail className="h-4 w-4" />} hasWarning={duplicateCheck.emailDuplicate.isDuplicate} />
              {/* Inline Email Duplicate Alert */}
              <InlineDuplicateAlert fieldResult={duplicateCheck.emailDuplicate} fieldLabel="email" onViewStudent={onViewDuplicateStudent} />
            </div>

            {/* Telefone e Data de Nascimento - lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Telefone
                </Label>
                <PhoneInput value={formData.phone} onChange={value => handleInputChange("phone", value)} placeholder="(00) 00000-0000" icon={<Phone className="h-4 w-4" />} hasWarning={duplicateCheck.phoneDuplicate.isDuplicate} />
                {/* Inline Phone Duplicate Alert */}
                <InlineDuplicateAlert fieldResult={duplicateCheck.phoneDuplicate} fieldLabel="telefone" onViewStudent={onViewDuplicateStudent} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Data de Nascimento
                </Label>
                <DateInput value={formData.birth_date} onChange={value => handleInputChange("birth_date", value)} icon={<Calendar className="h-4 w-4" />} />
              </div>
            </div>

            {/* CPF */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                CPF
              </Label>
              <CPFInput value={formData.cpf} onChange={value => handleInputChange("cpf", value)} placeholder="000.000.000-00" icon={<CreditCard className="h-4 w-4" />} hasWarning={duplicateCheck.cpfDuplicate.isDuplicate} />
              {/* Inline CPF Duplicate Alert */}
              <InlineDuplicateAlert fieldResult={duplicateCheck.cpfDuplicate} fieldLabel="CPF" onViewStudent={onViewDuplicateStudent} />
            </div>

            {/* CEP e Endereço - primeiro para auto-preenchimento */}
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  CEP
                </Label>
                <div className="relative">
                  <Input 
                    value={formData.cep} 
                    onChange={e => {
                      // Format CEP as 00000-000
                      const numbers = e.target.value.replace(/\D/g, "").slice(0, 8);
                      let formatted = numbers;
                      if (numbers.length > 5) {
                        formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
                      }
                      handleInputChange("cep", formatted);
                    }} 
                    placeholder="00000-000" 
                    icon={isLoadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} 
                    disabled={isLoadingCep}
                  />
                </div>
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Endereço Completo
                </Label>
                <Input 
                  value={formData.address} 
                  onChange={e => handleInputChange("address", e.target.value)} 
                  placeholder="Rua, número, bairro..."
                  icon={<Home className="h-4 w-4" />} 
                />
              </div>
            </div>

            {/* Estado e Cidade - após CEP para permitir auto-preenchimento */}
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Estado
                </Label>
                <Select value={formData.state} onValueChange={value => handleInputChange("state", value)} disabled={isLoadingStates}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingStates ? "..." : "UF"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => <SelectItem key={state.value} value={state.value}>{state.value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Cidade
                </Label>
                <CityCombobox
                  value={formData.city}
                  onValueChange={value => handleInputChange("city", value)}
                  cities={cities}
                  disabled={!formData.state}
                  isLoading={isLoadingCities}
                  placeholder="Selecione a cidade"
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Courses & Settings */}
          <div className="lg:border-l lg:border-border lg:pl-6 flex flex-col space-y-3">
            {/* Row 1: Cursos (alinha com Nome) */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Cursos
              </Label>
              <CourseSelector courses={courses} courseEnrollments={courseEnrollments} onAddCourse={(course, edition) => {
                onCourseEnrollmentChange([...courseEnrollments, {
                  course,
                  edition
                }]);
              }} onRemoveCourse={index => {
                onCourseEnrollmentChange(courseEnrollments.filter((_, i) => i !== index));
              }} onEditionChange={(index, edition) => {
                onCourseEnrollmentChange(courseEnrollments.map((e, i) => i === index ? {
                  ...e,
                  edition
                } : e));
              }} />
              {courseEnrollments.length > 0 && <div className="pt-1">
                  <p className="text-xs text-primary font-medium">
                    {courseEnrollments.length} curso{courseEnrollments.length > 1 ? 's' : ''} adicionado{courseEnrollments.length > 1 ? 's' : ''}
                  </p>
                </div>}
            </div>

            {/* Row 2: Origem do Aluno (alinha com E-mail) */}
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">
                Origem do Aluno
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                  <Globe className="h-4 w-4" />
                </div>
                <Select value={formData.lead_source || "nao_informado"} onValueChange={value => handleInputChange("lead_source", value === "nao_informado" ? "" : value)}>
                  <SelectTrigger className="h-10 pl-10">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
                    {leadSources.map(source => <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Observações - flex-1 para ocupar espaço restante */}
            <div className="space-y-1 flex-1 flex flex-col">
              <Label className="text-sm text-muted-foreground">
                Observações
              </Label>
              <div className="relative flex-1">
                <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
                  <FileText className="h-4 w-4" />
                </div>
                <Textarea value={formData.notes} onChange={e => handleInputChange("notes", e.target.value)} placeholder="Anotações sobre o aluno..." className="resize-none pl-10 h-full min-h-[80px]" />
              </div>
            </div>

            {/* Cliente S&C Toggle - Minimal */}
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="is_sc_client" className="text-sm text-muted-foreground cursor-pointer">
                Cliente Safras & Cifras
              </Label>
              <Switch id="is_sc_client" checked={formData.is_sc_client} onCheckedChange={checked => handleInputChange("is_sc_client", checked)} className="data-[state=checked]:bg-action" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-3 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={onCancel} className="h-10">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="h-10 gap-2 bg-action hover:bg-action-hover text-white">
          {isEditing ? <>
              <Check className="h-4 w-4" />
              {submitLabel}
            </> : <>
              <Plus className="h-4 w-4" />
              {submitLabel}
            </>}
        </Button>
      </div>

      {/* Duplicate Confirmation Dialog - Premium Design */}
      <AlertDialog open={showDuplicateConfirm} onOpenChange={setShowDuplicateConfirm}>
        <AlertDialogContent className="max-w-lg p-8">
          <AlertDialogHeader className="text-center sm:text-center space-y-4">
            {/* Centered Icon with soft orange background */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-500/20">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            
            {/* Centered Title */}
            <AlertDialogTitle className="text-xl font-semibold text-center">
              Possível Duplicidade
            </AlertDialogTitle>
            
            {/* Centered Description */}
            <AlertDialogDescription className="text-center text-muted-foreground leading-relaxed">
              Encontramos um registro com dados similares em sua base. Para evitar duplicidade no sistema, recomendamos verificar o cadastro existente antes de prosseguir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogAction 
              onClick={handleConfirmDuplicate} 
              className="sm:flex-1 bg-muted hover:bg-muted/80 text-muted-foreground border border-border order-2 sm:order-1 font-normal"
            >
              Criar novo mesmo assim
            </AlertDialogAction>
            <AlertDialogCancel className="sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 order-1 sm:order-2 font-medium">
              Ver cadastro existente
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
});