export type MatchSettings = {
  destination_weight: number
  category_weight: number
  budget_weight: number
  date_weight: number
  travelers_weight: number
  featured_bonus: number
  performance_bonus: number
  reputation_weight: number
}

export type MatchPackageInput = {
  title: string
  destination: string
  description: string
  categorySlug?: string | null
  categoryName?: string | null
  priceFrom?: number | null
  featured: boolean
  views: number
  leads: number
  reputationScore?: number | null
  priorityLevel?: number | null
}

export type MatchSearchInput = {
  query?: string | null
  categorySlug?: string | null
  budget?: number | null
  travelDate?: string | null
  travelersCount?: number | null
}

export const defaultMatchSettings: MatchSettings = {
  destination_weight: 45,
  category_weight: 20,
  budget_weight: 10,
  date_weight: 5,
  travelers_weight: 5,
  featured_bonus: 10,
  performance_bonus: 15,
  reputation_weight: 10,
}

export const normalizeSearchText = (value?: string | null) =>
  value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase() ?? ""

function includesTerm(value: string | null | undefined, term: string) {
  return term.length > 0 && normalizeSearchText(value).includes(term)
}

export function calculateMatchScore(
  pkg: MatchPackageInput,
  search: MatchSearchInput,
  settings: MatchSettings = defaultMatchSettings,
) {
  const term = normalizeSearchText(search.query)
  let score = 0

  if (term) {
    if (includesTerm(pkg.destination, term)) score += settings.destination_weight
    if (includesTerm(pkg.title, term)) score += Math.round(settings.destination_weight * 0.7)
    if (includesTerm(pkg.description, term)) score += Math.round(settings.destination_weight * 0.35)
    if (includesTerm(pkg.categorySlug, term) || includesTerm(pkg.categoryName, term)) {
      score += settings.category_weight
    }
  }

  if (search.categorySlug && normalizeSearchText(pkg.categorySlug) === normalizeSearchText(search.categorySlug)) {
    score += settings.category_weight
  }

  if (search.budget && pkg.priceFrom) {
    const distance = Math.abs(pkg.priceFrom - search.budget) / search.budget
    if (distance <= 0.15) score += settings.budget_weight
    else if (distance <= 0.35) score += Math.round(settings.budget_weight * 0.5)
  }

  if (search.travelDate) {
    score += settings.date_weight
  }

  if (search.travelersCount && search.travelersCount > 0) {
    score += settings.travelers_weight
  }

  if (pkg.featured && score > 0) {
    score += settings.featured_bonus
  }

  const performance = Math.min(settings.performance_bonus, Math.round(pkg.views / 10) + pkg.leads * 2)
  score += performance

  if (score > 0 && pkg.reputationScore) {
    score += Math.round((pkg.reputationScore / 100) * settings.reputation_weight)
  }

  if (score > 0 && pkg.priorityLevel) {
    score += Math.min(5, pkg.priorityLevel)
  }

  if (!term && !search.categorySlug) {
    score = (pkg.featured ? settings.featured_bonus : 0) + performance
  }

  return Math.max(0, Math.min(100, score))
}
