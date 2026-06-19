export type ReputationSummary = {
  averageRating: number
  reviewCount: number
  recommendationRate: number
  reputationScore: number
}

export const emptyReputationSummary: ReputationSummary = {
  averageRating: 0,
  reviewCount: 0,
  recommendationRate: 0,
  reputationScore: 0,
}

export type ReputationSettings = {
  reviews_weight: number
  recommendation_weight: number
  conversion_weight: number
  response_time_weight: number
  service_weight: number
}

export const defaultReputationSettings: ReputationSettings = {
  reviews_weight: 40,
  recommendation_weight: 20,
  conversion_weight: 20,
  response_time_weight: 10,
  service_weight: 10,
}
