import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/hooks/useStudents';

export type MatchedFieldType = 'cpf' | 'phone' | 'email' | 'name' | 'multiple' | null;

// Individual field duplicate result
export interface FieldDuplicateResult {
  isDuplicate: boolean;
  duplicateStudent: Student | null;
  isChecking: boolean;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateStudent: Student | null;
  matchedField: MatchedFieldType;
  matchedFields: string[];
  isChecking: boolean;
  // Individual field results
  nameDuplicate: FieldDuplicateResult;
  emailDuplicate: FieldDuplicateResult;
  phoneDuplicate: FieldDuplicateResult;
  cpfDuplicate: FieldDuplicateResult;
}

// Normalize CPF: remove dots, dashes, and spaces
export const normalizeCPF = (cpf: string): string => {
  if (!cpf) return '';
  return cpf.replace(/[.\-\s]/g, '');
};

// Normalize phone: remove ALL non-digit characters
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

// Normalize name: lowercase, trim, remove extra spaces
export const normalizeName = (name: string): string => {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Normalize email: lowercase, trim
export const normalizeEmail = (email: string): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

interface UseDuplicateCheckProps {
  cpf?: string | null;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  excludeId?: string | null;
  debounceMs?: number;
}

const emptyFieldResult: FieldDuplicateResult = {
  isDuplicate: false,
  duplicateStudent: null,
  isChecking: false
};

export function useDuplicateCheck({
  cpf,
  phone,
  email,
  name,
  excludeId,
  debounceMs = 500
}: UseDuplicateCheckProps): DuplicateCheckResult {
  const [result, setResult] = useState<DuplicateCheckResult>({
    isDuplicate: false,
    duplicateStudent: null,
    matchedField: null,
    matchedFields: [],
    isChecking: false,
    nameDuplicate: emptyFieldResult,
    emailDuplicate: emptyFieldResult,
    phoneDuplicate: emptyFieldResult,
    cpfDuplicate: emptyFieldResult
  });

  const checkDuplicate = useCallback(async () => {
    const normalizedCPF = normalizeCPF(cpf || '');
    const normalizedPhone = normalizePhone(phone || '');
    const normalizedEmail = normalizeEmail(email || '');
    const normalizedName = normalizeName(name || '');

    // Check if we have any value to search
    const hasCPF = normalizedCPF.length >= 11;
    const hasPhone = normalizedPhone.length >= 10;
    const hasEmail = normalizedEmail.length >= 5 && normalizedEmail.includes('@');
    const hasName = normalizedName.length >= 5;

    if (!hasCPF && !hasPhone && !hasEmail && !hasName) {
      setResult({
        isDuplicate: false,
        duplicateStudent: null,
        matchedField: null,
        matchedFields: [],
        isChecking: false,
        nameDuplicate: emptyFieldResult,
        emailDuplicate: emptyFieldResult,
        phoneDuplicate: emptyFieldResult,
        cpfDuplicate: emptyFieldResult
      });
      return;
    }

    setResult(prev => ({ 
      ...prev, 
      isChecking: true,
      nameDuplicate: hasName ? { ...prev.nameDuplicate, isChecking: true } : emptyFieldResult,
      emailDuplicate: hasEmail ? { ...prev.emailDuplicate, isChecking: true } : emptyFieldResult,
      phoneDuplicate: hasPhone ? { ...prev.phoneDuplicate, isChecking: true } : emptyFieldResult,
      cpfDuplicate: hasCPF ? { ...prev.cpfDuplicate, isChecking: true } : emptyFieldResult
    }));

    try {
      // Check each field individually for better results
      let nameResult: FieldDuplicateResult = emptyFieldResult;
      let emailResult: FieldDuplicateResult = emptyFieldResult;
      let phoneResult: FieldDuplicateResult = emptyFieldResult;
      let cpfResult: FieldDuplicateResult = emptyFieldResult;
      const matchedFields: string[] = [];
      let firstDuplicate: Student | null = null;

      // Check Name
      if (hasName) {
        let nameQuery = supabase
          .from('students')
          .select('*')
          .ilike('name', normalizedName)
          .is('deleted_at', null);
        
        if (excludeId) nameQuery = nameQuery.neq('id', excludeId);
        
        const { data: nameData } = await nameQuery.limit(1);
        
        if (nameData && nameData.length > 0) {
          const duplicate = nameData[0] as unknown as Student;
          nameResult = { isDuplicate: true, duplicateStudent: duplicate, isChecking: false };
          matchedFields.push('Nome');
          if (!firstDuplicate) firstDuplicate = duplicate;
        } else {
          nameResult = { isDuplicate: false, duplicateStudent: null, isChecking: false };
        }
      }

      // Check Email
      if (hasEmail) {
        let emailQuery = supabase
          .from('students')
          .select('*')
          .ilike('email', normalizedEmail)
          .is('deleted_at', null);
        
        if (excludeId) emailQuery = emailQuery.neq('id', excludeId);
        
        const { data: emailData } = await emailQuery.limit(1);
        
        if (emailData && emailData.length > 0) {
          const duplicate = emailData[0] as unknown as Student;
          emailResult = { isDuplicate: true, duplicateStudent: duplicate, isChecking: false };
          matchedFields.push('Email');
          if (!firstDuplicate) firstDuplicate = duplicate;
        } else {
          emailResult = { isDuplicate: false, duplicateStudent: null, isChecking: false };
        }
      }

      // Check Phone - search by normalized digits
      if (hasPhone) {
        // Get all non-deleted students with phone and check in memory
        let phoneQuery = supabase
          .from('students')
          .select('*')
          .not('phone', 'is', null)
          .is('deleted_at', null);
        
        if (excludeId) phoneQuery = phoneQuery.neq('id', excludeId);
        
        const { data: phoneData } = await phoneQuery;
        
        if (phoneData && phoneData.length > 0) {
          // Find matching phone by normalized comparison
          const matchingStudent = phoneData.find(s => {
            const studentPhone = normalizePhone(s.phone || '');
            return studentPhone.length >= 10 && studentPhone === normalizedPhone;
          });
          
          if (matchingStudent) {
            const duplicate = matchingStudent as unknown as Student;
            phoneResult = { isDuplicate: true, duplicateStudent: duplicate, isChecking: false };
            matchedFields.push('Telefone');
            if (!firstDuplicate) firstDuplicate = duplicate;
          } else {
            phoneResult = { isDuplicate: false, duplicateStudent: null, isChecking: false };
          }
        } else {
          phoneResult = { isDuplicate: false, duplicateStudent: null, isChecking: false };
        }
      }

      // Check CPF
      if (hasCPF) {
        const formattedCPF = normalizedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        
        let cpfQuery = supabase
          .from('students')
          .select('*')
          .or(`cpf.eq.${formattedCPF},cpf.eq.${normalizedCPF}`)
          .is('deleted_at', null);
        
        if (excludeId) cpfQuery = cpfQuery.neq('id', excludeId);
        
        const { data: cpfData } = await cpfQuery.limit(1);
        
        if (cpfData && cpfData.length > 0) {
          const duplicate = cpfData[0] as unknown as Student;
          cpfResult = { isDuplicate: true, duplicateStudent: duplicate, isChecking: false };
          matchedFields.push('CPF');
          if (!firstDuplicate) firstDuplicate = duplicate;
        } else {
          cpfResult = { isDuplicate: false, duplicateStudent: null, isChecking: false };
        }
      }

      // Determine primary match type
      let matchedField: MatchedFieldType = null;
      if (matchedFields.length > 1) {
        matchedField = 'multiple';
      } else if (matchedFields.includes('CPF')) {
        matchedField = 'cpf';
      } else if (matchedFields.includes('Telefone')) {
        matchedField = 'phone';
      } else if (matchedFields.includes('Email')) {
        matchedField = 'email';
      } else if (matchedFields.includes('Nome')) {
        matchedField = 'name';
      }

      setResult({
        isDuplicate: matchedFields.length > 0,
        duplicateStudent: firstDuplicate,
        matchedField,
        matchedFields,
        isChecking: false,
        nameDuplicate: nameResult,
        emailDuplicate: emailResult,
        phoneDuplicate: phoneResult,
        cpfDuplicate: cpfResult
      });
    } catch (error) {
      console.error('Error in duplicate check:', error);
      setResult(prev => ({ 
        ...prev, 
        isChecking: false,
        nameDuplicate: { ...prev.nameDuplicate, isChecking: false },
        emailDuplicate: { ...prev.emailDuplicate, isChecking: false },
        phoneDuplicate: { ...prev.phoneDuplicate, isChecking: false },
        cpfDuplicate: { ...prev.cpfDuplicate, isChecking: false }
      }));
    }
  }, [cpf, phone, email, name, excludeId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkDuplicate();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [checkDuplicate, debounceMs]);

  return result;
}
