import React, { useMemo, useState, useCallback, useEffect } from "react";
import { User, Mail, Phone, Building2, Calendar, Users, Globe, FileText, Check, Plus, X, Banknote, Trash2, MapPin, AlertTriangle, CreditCard, Home, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { PhoneInput, CPFInput, validatePhone, isPhoneComplete } from "@/components/ui/masked-input";
import { EmailInput, validateEmail, isEmailComplete } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CityCombobox } from "@/components/ui/city-combobox";
import { DuplicateAlert } from "@/components/DuplicateAlert";
import { InlineDuplicateAlert } from "@/components/InlineDuplicateAlert";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DuplicateCheckResult } from "@/hooks/useDuplicateCheck";
import { TagSelector, TagWithColor } from "./TagSelector";
import { FunnelStageBar } from "./FunnelStageBar";
import { useIBGELocations } from "@/hooks/useIBGELocations";
interface ContactEntry {
  value: string;
  type: string;
}
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  course: string;
  lead_source: string;
  notes: string;
  city: string;
  state: string;
  cep: string;
  address: string;
  funnel_stage: string;
  value?: string;
  currency?: string;
  phones?: ContactEntry[];
  emails?: ContactEntry[];
  tags?: TagWithColor[];
  expected_close_date?: string;
}
interface FunnelStage {
  id: string;
  label: string;
  color: string;
}
interface LeadSource {
  value: string;
  label: string;
}
interface LeadFormProps {
  formData: LeadFormData;
  onFormDataChange: (data: LeadFormData) => void;
  funnelStages: FunnelStage[];
  courses: string[];
  leadSources: LeadSource[];
  duplicateCheck: DuplicateCheckResult;
  onViewDuplicateStudent: (studentId: string) => void;
  onMerge?: (mergedData: any, existingStudentId: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}
const PHONE_TYPES = [{
  value: "comercial",
  label: "Comercial"
}, {
  value: "pessoal",
  label: "Pessoal"
}, {
  value: "whatsapp",
  label: "WhatsApp"
}];
const EMAIL_TYPES = [{
  value: "comercial",
  label: "Comercial"
}, {
  value: "pessoal",
  label: "Pessoal"
}];
const CURRENCIES = [{
  value: "BRL",
  label: "Real Brasileiro",
  symbol: "R$"
}, {
  value: "USD",
  label: "Dólar Americano",
  symbol: "$"
}, {
  value: "EUR",
  label: "Euro",
  symbol: "€"
}];
export const LeadForm = React.memo(function LeadForm({
  formData,
  onFormDataChange,
  funnelStages,
  courses,
  leadSources,
  duplicateCheck,
  onViewDuplicateStudent,
  onMerge,
  onSubmit,
  onCancel,
  isEditing
}: LeadFormProps) {
  // Local state for multiple phones and emails
  const [phones, setPhones] = useState<ContactEntry[]>(formData.phones || [{
    value: formData.phone || "",
    type: "comercial"
  }]);
  const [emails, setEmails] = useState<ContactEntry[]>(formData.emails || [{
    value: formData.email || "",
    type: "comercial"
  }]);
  const [tags, setTags] = useState<TagWithColor[]>(formData.tags || []);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // IBGE Locations hook
  const {
    states,
    cities,
    isLoadingStates,
    isLoadingCities
  } = useIBGELocations(formData.state);

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
        description: `${data.localidade} - ${data.uf}`
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
    const cleanCep = (formData.cep || "").replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetchAddressFromCep(formData.cep);
    }
  }, [formData.cep]);
  const handleStateChange = (uf: string) => {
    // When state changes, reset city
    onFormDataChange({
      ...formData,
      state: uf,
      city: ""
    });
  };
  const handleCityChange = (city: string) => {
    onFormDataChange({
      ...formData,
      city
    });
  };
  const handleInputChange = (field: keyof LeadFormData, value: string | string[]) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  // Phone handlers
  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = {
      ...newPhones[index],
      value
    };
    setPhones(newPhones);
    // Update main phone field with first phone
    if (index === 0) {
      onFormDataChange({
        ...formData,
        phone: value,
        phones: newPhones
      });
    } else {
      onFormDataChange({
        ...formData,
        phones: newPhones
      });
    }
  };
  const handlePhoneTypeChange = (index: number, type: string) => {
    const newPhones = [...phones];
    newPhones[index] = {
      ...newPhones[index],
      type
    };
    setPhones(newPhones);
    onFormDataChange({
      ...formData,
      phones: newPhones
    });
  };
  const addPhone = () => {
    const newPhones = [...phones, {
      value: "",
      type: "comercial"
    }];
    setPhones(newPhones);
    onFormDataChange({
      ...formData,
      phones: newPhones
    });
  };
  const removePhone = (index: number) => {
    if (phones.length <= 1) return;
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
    onFormDataChange({
      ...formData,
      phone: newPhones[0]?.value || "",
      phones: newPhones
    });
  };

  // Email handlers
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = {
      ...newEmails[index],
      value
    };
    setEmails(newEmails);
    // Update main email field with first email
    if (index === 0) {
      onFormDataChange({
        ...formData,
        email: value,
        emails: newEmails
      });
    } else {
      onFormDataChange({
        ...formData,
        emails: newEmails
      });
    }
  };
  const handleEmailTypeChange = (index: number, type: string) => {
    const newEmails = [...emails];
    newEmails[index] = {
      ...newEmails[index],
      type
    };
    setEmails(newEmails);
    onFormDataChange({
      ...formData,
      emails: newEmails
    });
  };
  const addEmail = () => {
    const newEmails = [...emails, {
      value: "",
      type: "comercial"
    }];
    setEmails(newEmails);
    onFormDataChange({
      ...formData,
      emails: newEmails
    });
  };
  const removeEmail = (index: number) => {
    if (emails.length <= 1) return;
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onFormDataChange({
      ...formData,
      email: newEmails[0]?.value || "",
      emails: newEmails
    });
  };

  // Tag handlers
  const handleTagsChange = (newTags: TagWithColor[]) => {
    setTags(newTags);
    onFormDataChange({
      ...formData,
      tags: newTags
    });
  };

  // Validation status
  const validation = useMemo(() => {
    // Validate all phones
    const phoneValidations = phones.map(p => {
      const hasContent = p.value.replace(/\D/g, "").length > 0;
      const isComplete = isPhoneComplete(p.value);
      const isValid = validatePhone(p.value);
      return {
        hasContent,
        isComplete,
        isValid: !hasContent || isComplete && isValid,
        isIncomplete: hasContent && !isComplete
      };
    });

    // Validate all emails
    const emailValidations = emails.map(e => {
      const hasContent = e.value.length > 0;
      const emailValidation = validateEmail(e.value);
      return {
        hasContent,
        isValid: !hasContent || emailValidation.isValid,
        error: emailValidation.error,
        isIncomplete: hasContent && e.value.includes("@") && !isEmailComplete(e.value)
      };
    });
    const allPhonesValid = phoneValidations.every(v => v.isValid && !v.isIncomplete);
    const allEmailsValid = emailValidations.every(v => v.isValid && !v.isIncomplete);
    const primaryEmailValid = emailValidations[0]?.isValid && !emailValidations[0]?.isIncomplete;
    return {
      phoneValidations,
      emailValidations,
      allPhonesValid,
      allEmailsValid,
      primaryEmailValid,
      isValid: allPhonesValid && allEmailsValid
    };
  }, [phones, emails]);
  const handleSubmit = () => {
    if (!formData.name || !emails[0]?.value) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    if (!validation.isValid) {
      const errors: string[] = [];
      validation.emailValidations.forEach((v, i) => {
        if (v.isIncomplete) errors.push(`Email ${i + 1} está incompleto`);else if (!v.isValid && v.hasContent) errors.push(v.error || `Email ${i + 1} inválido`);
      });
      validation.phoneValidations.forEach((v, i) => {
        if (v.isIncomplete) errors.push(`Telefone ${i + 1} está incompleto`);else if (!v.isValid && v.hasContent) errors.push(`Telefone ${i + 1} inválido`);
      });
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

  // Get funnel stage index for visual progress
  const currentStageIndex = funnelStages.findIndex(s => s.id === formData.funnel_stage);

  // Format value with currency
  const formatCurrencyValue = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    const number = parseInt(numericValue, 10) / 100;
    return number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    handleInputChange("value", rawValue);
  };
  return <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-muted/20">
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? "Editar negócio" : "Adicionar negócio"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados do lead para adicionar ao funil
        </p>
      </div>

      {/* Main Content - Synchronized Rows */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          
          {/* Row 1: Nome Completo | Curso de Interesse */}
          <div className="space-y-1 lg:pr-8">
            <Label htmlFor="name" className="text-sm text-muted-foreground">
              Nome Completo
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input id="name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Nome completo do aluno" className="h-10" icon={<User className="h-4 w-4" />} hasWarning={duplicateCheck.nameDuplicate.isDuplicate} isLoading={duplicateCheck.nameDuplicate.isChecking} />
            <InlineDuplicateAlert fieldResult={duplicateCheck.nameDuplicate} fieldLabel="nome" onViewStudent={onViewDuplicateStudent} />
          </div>
          <div className="space-y-1 lg:border-l lg:border-border lg:pl-8">
            <Label htmlFor="course" className="text-sm text-muted-foreground">
              Curso de Interesse
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Users className="h-4 w-4" />
              </div>
              <Select value={formData.course || "nenhum"} onValueChange={value => handleInputChange("course", value === "nenhum" ? "" : value)}>
                <SelectTrigger className="h-10 pl-10">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum definido</SelectItem>
                  {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: E-mail | Valor (R$) */}
          <div className="space-y-1 lg:pr-8">
            <Label className="text-sm text-muted-foreground">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <EmailInput value={emails[0]?.value || ""} onChange={value => handleEmailChange(0, value)} placeholder="email@exemplo.com" className="h-10" icon={<Mail className="h-4 w-4" />} hasWarning={duplicateCheck.emailDuplicate.isDuplicate} isLoading={duplicateCheck.emailDuplicate.isChecking} />
            <InlineDuplicateAlert fieldResult={duplicateCheck.emailDuplicate} fieldLabel="email" onViewStudent={onViewDuplicateStudent} />
          </div>
          <div className="space-y-1 lg:border-l lg:border-border lg:pl-8">
            <Label className="text-sm text-muted-foreground">
              Valor (R$)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10 text-sm font-medium">
                R$
              </div>
              <Input value={formatCurrencyValue(formData.value || "")} onChange={handleValueChange} placeholder="0,00" className="h-10 pl-10" />
            </div>
          </div>

          {/* Row 3: Telefone/Data | Etapa do Funil */}
          <div className="lg:pr-8">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Telefone
                </Label>
                <PhoneInput value={phones[0]?.value || ""} onChange={value => handlePhoneChange(0, value)} placeholder="(00) 00000-0000" className="h-10" icon={<Phone className="h-4 w-4" />} hasWarning={duplicateCheck.phoneDuplicate.isDuplicate} isLoading={duplicateCheck.phoneDuplicate.isChecking} />
                <InlineDuplicateAlert fieldResult={duplicateCheck.phoneDuplicate} fieldLabel="telefone" onViewStudent={onViewDuplicateStudent} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Data de Nascimento
                </Label>
                <DateInput value={formData.birth_date} onChange={value => handleInputChange("birth_date", value)} icon={<Calendar className="h-4 w-4" />} />
              </div>
            </div>
          </div>
          <div className="space-y-1 lg:border-l lg:border-border lg:pl-8">
            <Label className="text-sm text-muted-foreground">Etapa do Funil</Label>
            <FunnelStageBar stages={funnelStages} value={formData.funnel_stage || funnelStages[0]?.id} onChange={value => handleInputChange("funnel_stage", value)} />
          </div>

          {/* Row 4: CPF | Etiqueta */}
          <div className="space-y-1 lg:pr-8">
            <Label className="text-sm text-muted-foreground">
              CPF
            </Label>
            <CPFInput value={formData.cpf} onChange={value => handleInputChange("cpf", value)} placeholder="000.000.000-00" className="h-10" icon={<CreditCard className="h-4 w-4" />} />
          </div>
          <div className="space-y-1 lg:border-l lg:border-border lg:pl-8">
            <Label className="text-sm text-muted-foreground">Etiqueta</Label>
            <TagSelector tags={tags} onChange={handleTagsChange} />
          </div>

          {/* Row 5: CEP/Endereço | Canal de origem */}
          <div className="lg:pr-8">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  CEP
                </Label>
                <div className="relative">
                  <Input value={formData.cep || ""} onChange={e => {
                  const numbers = e.target.value.replace(/\D/g, "").slice(0, 8);
                  let formatted = numbers;
                  if (numbers.length > 5) {
                    formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
                  }
                  handleInputChange("cep", formatted);
                }} placeholder="00000-000" icon={isLoadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} disabled={isLoadingCep} />
                </div>
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Endereço
                </Label>
                <Input value={formData.address || ""} onChange={e => handleInputChange("address", e.target.value)} placeholder="Rua, número, bairro..." icon={<Home className="h-4 w-4" />} />
              </div>
            </div>
          </div>
          <div className="space-y-1 lg:border-l lg:border-border lg:pl-8">
            <Label htmlFor="lead_source" className="text-sm text-muted-foreground">
              Canal de origem
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Globe className="h-4 w-4" />
              </div>
              <Select value={formData.lead_source || "nao_informado"} onValueChange={value => handleInputChange("lead_source", value === "nao_informado" ? "" : value)}>
                <SelectTrigger className="h-10 pl-10">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_informado">Não informado</SelectItem>
                  {leadSources.map(source => <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6: Estado/Cidade - após CEP para auto-preenchimento */}
          <div className="lg:pr-8">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Estado
                </Label>
                <Select value={formData.state || ""} onValueChange={handleStateChange} disabled={isLoadingStates}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={isLoadingStates ? "..." : "UF"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => <SelectItem key={state.value} value={state.value}>
                        {state.value}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-sm text-muted-foreground">
                  Cidade
                </Label>
                <CityCombobox value={formData.city} onValueChange={handleCityChange} cities={cities} disabled={!formData.state} isLoading={isLoadingCities} placeholder="Selecione o estado primeiro" icon={<MapPin className="h-4 w-4" />} />
              </div>
            </div>
          </div>
          <div className="lg:border-l lg:border-border lg:pl-8" />
          

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
        <Button variant="outline" onClick={onCancel} className="h-10">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="h-10 gap-2 bg-action hover:bg-action-hover text-white">
          {isEditing ? <>
              <Check className="h-4 w-4" />
              Salvar
            </> : <>
              <Plus className="h-4 w-4" />
              Salvar
            </>}
        </Button>
      </div>

      {/* Duplicate Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleConfirmDuplicate} className="sm:flex-1 bg-muted hover:bg-muted/80 text-muted-foreground border border-border order-2 sm:order-1 font-normal">
              Criar novo mesmo assim
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => {
            setShowDuplicateConfirm(false);
            if (duplicateCheck.duplicateStudent) {
              onViewDuplicateStudent(duplicateCheck.duplicateStudent.id);
            }
          }} className="sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 order-1 sm:order-2 font-medium">
              Ver cadastro existente
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
});