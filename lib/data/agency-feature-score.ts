type AgencyFeatureScoreInput = {
  status: string
  city?: string | null
  state?: string | null
  description?: string | null
  publishedPackages: number
  profileViews: number
  packageViews: number
  leads: number
  wonLeads: number
  ctaEvents: number
}

const cap = (value: number, max: number) => Math.min(value, max)

export function hasCompletePublicProfile(input: Pick<AgencyFeatureScoreInput, "city" | "state" | "description">) {
  return Boolean(input.city?.trim() && input.state?.trim() && input.description?.trim())
}

export function calculateAgencyFeatureScore(input: AgencyFeatureScoreInput) {
  return calculateAgencyFeatureScoreBreakdown(input).totalScore
}

export function calculateAgencyFeatureScoreBreakdown(input: AgencyFeatureScoreInput) {
  if (input.status !== "active" || !hasCompletePublicProfile(input)) {
    return {
      profileViewsScore: 0,
      packageViewsScore: 0,
      leadsScore: 0,
      conversionScore: 0,
      ctaEventsScore: 0,
      publishedPackagesScore: 0,
      completenessScore: 0,
      totalScore: 0,
    }
  }

  const conversion = input.leads > 0 ? input.wonLeads / input.leads : 0
  const profileViewsScore = cap(input.profileViews, 25)
  const packageViewsScore = cap(input.packageViews, 20)
  const leadsScore = cap(input.leads * 4, 25)
  const conversionScore = cap(Math.round(conversion * 15), 15)
  const ctaEventsScore = cap(input.ctaEvents, 10)
  const publishedPackagesScore = cap(input.publishedPackages * 2, 10)
  const completenessScore = 10
  const packagePenalty = input.publishedPackages === 0 ? -20 : 0
  const score =
    completenessScore +
    profileViewsScore +
    packageViewsScore +
    leadsScore +
    conversionScore +
    ctaEventsScore +
    publishedPackagesScore +
    packagePenalty

  return {
    profileViewsScore,
    packageViewsScore,
    leadsScore,
    conversionScore,
    ctaEventsScore,
    publishedPackagesScore,
    completenessScore,
    totalScore: Math.max(0, Math.min(100, Math.round(score))),
  }
}
