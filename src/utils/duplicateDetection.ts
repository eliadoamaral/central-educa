import { Student } from "@/hooks/useStudents";

// Levenshtein distance algorithm for fuzzy matching
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// Calculate similarity percentage (0-100)
export function similarityPercentage(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  
  const distance = levenshteinDistance(s1, s2);
  return Math.round((1 - distance / maxLen) * 100);
}

// Normalize strings for comparison
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Normalize CPF (remove formatting)
export function normalizeCPF(cpf: string | null | undefined): string {
  if (!cpf) return '';
  return cpf.replace(/[.\-\s]/g, '');
}

// Normalize phone (remove formatting)
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/[\(\)\-\s\+]/g, '');
}

// Normalize email
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

export type DuplicateMatchType = 'exact' | 'high' | 'medium' | 'low';

export interface DuplicateMatch {
  field: string;
  fieldLabel: string;
  value1: string;
  value2: string;
  similarity: number;
  matchType: DuplicateMatchType;
}

export interface DuplicateGroup {
  id: string;
  students: Student[];
  matches: DuplicateMatch[];
  overallSimilarity: number;
  matchType: DuplicateMatchType;
  primaryField: string;
}

// Get match type based on similarity percentage
function getMatchType(similarity: number): DuplicateMatchType {
  if (similarity === 100) return 'exact';
  if (similarity >= 90) return 'high';
  if (similarity >= 75) return 'medium';
  return 'low';
}

// Field labels for display
const fieldLabels: Record<string, string> = {
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  cpf: 'CPF'
};

// Compare two students and find matching fields
function compareStudents(student1: Student, student2: Student): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  
  // Compare name
  const name1 = normalizeString(student1.name);
  const name2 = normalizeString(student2.name);
  if (name1 && name2) {
    const nameSimilarity = similarityPercentage(name1, name2);
    if (nameSimilarity >= 70) {
      matches.push({
        field: 'name',
        fieldLabel: fieldLabels.name,
        value1: student1.name,
        value2: student2.name,
        similarity: nameSimilarity,
        matchType: getMatchType(nameSimilarity)
      });
    }
  }
  
  // Compare email
  const email1 = normalizeEmail(student1.email);
  const email2 = normalizeEmail(student2.email);
  if (email1 && email2) {
    const emailSimilarity = similarityPercentage(email1, email2);
    if (emailSimilarity >= 85) {
      matches.push({
        field: 'email',
        fieldLabel: fieldLabels.email,
        value1: student1.email,
        value2: student2.email,
        similarity: emailSimilarity,
        matchType: getMatchType(emailSimilarity)
      });
    }
  }
  
  // Compare phone
  const phone1 = normalizePhone(student1.phone);
  const phone2 = normalizePhone(student2.phone);
  if (phone1 && phone2 && phone1.length >= 8 && phone2.length >= 8) {
    const phoneSimilarity = similarityPercentage(phone1, phone2);
    if (phoneSimilarity >= 85) {
      matches.push({
        field: 'phone',
        fieldLabel: fieldLabels.phone,
        value1: student1.phone || '',
        value2: student2.phone || '',
        similarity: phoneSimilarity,
        matchType: getMatchType(phoneSimilarity)
      });
    }
  }
  
  // Compare CPF
  const cpf1 = normalizeCPF(student1.cpf);
  const cpf2 = normalizeCPF(student2.cpf);
  if (cpf1 && cpf2 && cpf1.length >= 11 && cpf2.length >= 11) {
    const cpfSimilarity = similarityPercentage(cpf1, cpf2);
    if (cpfSimilarity >= 90) {
      matches.push({
        field: 'cpf',
        fieldLabel: fieldLabels.cpf,
        value1: student1.cpf || '',
        value2: student2.cpf || '',
        similarity: cpfSimilarity,
        matchType: getMatchType(cpfSimilarity)
      });
    }
  }
  
  return matches;
}

// Find all duplicate groups in a list of students
export function findDuplicates(
  students: Student[], 
  options: { 
    minSimilarity?: number;
    includeExactOnly?: boolean;
  } = {}
): DuplicateGroup[] {
  const { minSimilarity = 70, includeExactOnly = false } = options;
  
  const duplicateGroups: DuplicateGroup[] = [];
  const processedPairs = new Set<string>();
  const studentInGroup = new Map<string, string>(); // studentId -> groupId
  
  for (let i = 0; i < students.length; i++) {
    for (let j = i + 1; j < students.length; j++) {
      const student1 = students[i];
      const student2 = students[j];
      
      const pairKey = [student1.id, student2.id].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);
      
      const matches = compareStudents(student1, student2);
      
      if (matches.length === 0) continue;
      
      // Filter by minimum similarity if needed
      const validMatches = matches.filter(m => m.similarity >= minSimilarity);
      if (validMatches.length === 0) continue;
      
      // Filter exact only if needed
      if (includeExactOnly && !validMatches.some(m => m.similarity === 100)) continue;
      
      // Calculate overall similarity (max of all matches)
      const overallSimilarity = Math.max(...validMatches.map(m => m.similarity));
      const matchType = getMatchType(overallSimilarity);
      const primaryField = validMatches.reduce((prev, curr) => 
        curr.similarity > prev.similarity ? curr : prev
      ).fieldLabel;
      
      // Check if either student is already in a group
      const existingGroupId1 = studentInGroup.get(student1.id);
      const existingGroupId2 = studentInGroup.get(student2.id);
      
      if (existingGroupId1 && existingGroupId2) {
        // Both already in groups - skip for now (complex merge case)
        continue;
      } else if (existingGroupId1) {
        // Add student2 to student1's group
        const group = duplicateGroups.find(g => g.id === existingGroupId1);
        if (group && !group.students.some(s => s.id === student2.id)) {
          group.students.push(student2);
          group.matches.push(...validMatches);
          studentInGroup.set(student2.id, existingGroupId1);
        }
      } else if (existingGroupId2) {
        // Add student1 to student2's group
        const group = duplicateGroups.find(g => g.id === existingGroupId2);
        if (group && !group.students.some(s => s.id === student1.id)) {
          group.students.push(student1);
          group.matches.push(...validMatches);
          studentInGroup.set(student1.id, existingGroupId2);
        }
      } else {
        // Create new group
        const groupId = `group-${duplicateGroups.length + 1}`;
        duplicateGroups.push({
          id: groupId,
          students: [student1, student2],
          matches: validMatches,
          overallSimilarity,
          matchType,
          primaryField
        });
        studentInGroup.set(student1.id, groupId);
        studentInGroup.set(student2.id, groupId);
      }
    }
  }
  
  // Sort groups by similarity (highest first)
  return duplicateGroups.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
}

// Get statistics from duplicate groups
export function getDuplicateStats(groups: DuplicateGroup[]): {
  totalGroups: number;
  totalDuplicates: number;
  exactMatches: number;
  highSimilarity: number;
  mediumSimilarity: number;
  lowSimilarity: number;
  byField: Record<string, number>;
} {
  const stats = {
    totalGroups: groups.length,
    totalDuplicates: groups.reduce((acc, g) => acc + g.students.length, 0),
    exactMatches: groups.filter(g => g.matchType === 'exact').length,
    highSimilarity: groups.filter(g => g.matchType === 'high').length,
    mediumSimilarity: groups.filter(g => g.matchType === 'medium').length,
    lowSimilarity: groups.filter(g => g.matchType === 'low').length,
    byField: {} as Record<string, number>
  };
  
  // Count by primary field
  groups.forEach(g => {
    stats.byField[g.primaryField] = (stats.byField[g.primaryField] || 0) + 1;
  });
  
  return stats;
}
