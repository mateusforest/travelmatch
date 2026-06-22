const statusLabels: Record<string, string> = {
  active: "Ativo",
  trial: "Teste",
  canceled: "Cancelado",
  expired: "Expirado",
  suspended: "Suspenso",
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  scheduled: "Agendada",
  running: "Em andamento",
  completed: "Concluída",
}

const analyticsLabels: Record<string, string> = {
  basic: "Básico",
  complete: "Completo",
  advanced: "Avançado",
  unlimited: "Ilimitado",
}

const promotionLabels: Record<string, string> = {
  featured_7: "Destaque 7 dias",
  featured_15: "Destaque 15 dias",
  featured_30: "Destaque 30 dias",
  boost: "TravelMatch Boost",
}

const productLabels: Record<string, string> = {
  subscription: "Assinatura",
  promotion: "Produto patrocinado",
}

export function formatBillingStatus(value?: string | null) {
  if (!value) return "Pendente"
  return statusLabels[value] ?? value
}

export function formatAnalyticsLevel(value?: string | null) {
  if (!value) return "Básico"
  return analyticsLabels[value] ?? value
}

export function formatPromotionType(value?: string | null) {
  if (!value) return "Promoção"
  return promotionLabels[value] ?? value
}

export function formatProductType(value?: string | null) {
  if (!value) return "Pagamento"
  return productLabels[value] ?? value
}

export function formatGateway(value?: string | null) {
  if (!value) return "Stripe"
  return value.toLowerCase() === "stripe" ? "Stripe" : value
}
