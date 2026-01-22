import { ParticipantData } from "@/types/dashboard";
import { splitMultipleChoices } from "./csvParser";

export interface ScoredParticipant extends ParticipantData {
  score: number;
  scoreLevel: 'Alto' | 'Médio-Alto' | 'Médio' | 'Baixo';
}

export const calculateProspectScore = (participant: ParticipantData): number => {
  let score = 0;

  // Não é cliente: +40
  const lowercaseIsClient = participant.isClient?.toLowerCase().trim() || '';
  const isRealClient = lowercaseIsClient === 'sim, ja sou cliente' || 
                       lowercaseIsClient === 'sim, já sou cliente' ||
                       lowercaseIsClient === 'sim';
  if (!isRealClient) {
    score += 40;
  }

  // Interesse em "Gestão Financeira": +20
  if (participant.interests) {
    const interests = splitMultipleChoices(participant.interests);
    if (interests.some(i => i.toLowerCase().includes('gestão financeira') || i.toLowerCase().includes('financeira'))) {
      score += 20;
    }
  }

  // Experiência no Agro
  if (participant.experience) {
    if (participant.experience.includes('6 a 10 anos')) {
      score += 15;
    } else if (participant.experience.includes('Mais de 10 anos')) {
      score += 10;
    }
  }

  // Região Centro-Oeste: +5
  if (participant.region === 'Centro-Oeste') {
    score += 5;
  }

  // Participa de Soja/Milho: +5
  if (participant.activities) {
    const activities = splitMultipleChoices(participant.activities);
    if (activities.some(a => a.toLowerCase().includes('soja') || a.toLowerCase().includes('milho'))) {
      score += 5;
    }
  }

  return score;
};

export const getScoreLevel = (score: number): 'Alto' | 'Médio-Alto' | 'Médio' | 'Baixo' => {
  if (score >= 60) return 'Alto';
  if (score >= 40) return 'Médio-Alto';
  if (score >= 20) return 'Médio';
  return 'Baixo';
};

export const scorePotentialClients = (participants: ParticipantData[]): ScoredParticipant[] => {
  return participants
    .filter(p => {
      const lowercaseIsClient = p.isClient?.toLowerCase().trim() || '';
      const isRealClient = lowercaseIsClient === 'sim, ja sou cliente' || 
                          lowercaseIsClient === 'sim, já sou cliente' ||
                          lowercaseIsClient === 'sim';
      return !isRealClient;
    })
    .map(participant => {
      const score = calculateProspectScore(participant);
      return {
        ...participant,
        score,
        scoreLevel: getScoreLevel(score)
      };
    })
    .sort((a, b) => b.score - a.score);
};
