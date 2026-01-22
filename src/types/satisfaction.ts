export interface SatisfactionData {
  expectations: string;
  comments: string;
  supportRating: number;
  infrastructureRating: number;
  materialsRating: number;
  foodRating: number;
  overallExperienceRating: number;
  inauguralClassContentRating: number;
  sandroDidacticRating: number;
  holdingClassContentRating: number;
  alessandraDidacticRating: number;
  accountingClassContentRating: number;
  danielDidacticRating: number;
  governanceClassContentRating: number;
  vanessaDidacticRating: number;
  financialClassContentRating: number;
  viniciusDidacticRating: number;
  wouldRecommend: boolean;
  futureTopicInterest: string;
  preferredMode: string;
  preferredFormat: string;
}

export interface SatisfactionMetrics {
  totalResponses: number;
  averageOverallRating: number;
  recommendationRate: number;
  supportAverage: number;
  infrastructureAverage: number;
  materialsAverage: number;
  foodAverage: number;
  contentAverages: {
    inaugural: number;
    holding: number;
    accounting: number;
    governance: number;
    financial: number;
  };
  didacticAverages: {
    sandro: number;
    alessandra: number;
    daniel: number;
    vanessa: number;
    vinicius: number;
  };
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface TopicInterest {
  topic: string;
  count: number;
  percentage: number;
}

export interface DimensionRating {
  dimension: string;
  average: number;
  distribution: RatingDistribution[];
}
