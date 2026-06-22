type PackageDescriptionInput = {
  title?: string | null
  destination?: string | null
  durationDays?: string | null
  categoryName?: string | null
  priceFrom?: string | null
}

type CosTextResult = {
  text: string
  usedFallback: boolean
  message?: string
}

type DashboardSuggestionInput = {
  activePackages: number
  leadsLast30Days: number
  viewsLast30Days: number
  conversionRate: string
  unansweredAlerts: number
  averageRating: number
  reviewCount: number
  plan: string
  activePromotions: number
  topViewedPackages: { title: string; destination: string; views: number; leads: number }[]
}

type AnalyticsInsightInput = {
  periodLabel: string
  stats: { views: number; clicks: number; leads: number; conversions: number }
  ctaEvents: { name: string; value: string }[]
  leadSources: { name: string; value: string }[]
  topClickedPackages: { name: string; value: string }[]
  topLeadPackages: { name: string; value: string }[]
  conversionsByPage: { name: string; value: string }[]
  leadsByStatus: { name: string; value: string }[]
}

async function requestOpenAI(prompt: string, fallback: string): Promise<CosTextResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      text: fallback,
      usedFallback: true,
      message: "COS operando em modo seguro: OPENAI_API_KEY não configurada.",
    }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        temperature: 0.65,
        max_output_tokens: 650,
      }),
    })
    const data = await response.json() as {
      output_text?: string
      output?: { content?: { text?: string }[] }[]
      error?: { message?: string }
    }

    if (!response.ok) {
      return {
        text: fallback,
        usedFallback: true,
        message: data.error?.message ?? "COS não conseguiu acessar a OpenAI agora.",
      }
    }

    const text = data.output_text?.trim()
      || data.output?.flatMap((item) => item.content ?? []).map((item) => item.text).join("\n").trim()

    if (!text) {
      return {
        text: fallback,
        usedFallback: true,
        message: "COS não recebeu uma resposta útil da OpenAI agora.",
      }
    }

    return { text, usedFallback: false }
  } catch {
    return {
      text: fallback,
      usedFallback: true,
      message: "COS operando em modo seguro: não foi possível concluir a chamada de IA.",
    }
  }
}

function formatField(value?: string | null, fallback = "sob consulta") {
  return value?.trim() || fallback
}

export function buildPackageDescriptionFallback(input: PackageDescriptionInput) {
  const destination = formatField(input.destination, "este destino")
  const category = formatField(input.categoryName, "viagem personalizada")
  const duration = formatField(input.durationDays)
  const price = formatField(input.priceFrom)
  const title = formatField(input.title, `Experiência em ${destination}`)

  return `${title} foi pensado para quem deseja viver ${destination} com orientação próxima, escolhas bem cuidadas e suporte em cada etapa da viagem. A proposta combina o perfil ${category.toLowerCase()} com uma curadoria consultiva, ajudando o viajante a entender o melhor momento, o ritmo ideal e os detalhes que tornam a experiência mais tranquila.\n\nCom duração de ${duration} e investimento a partir de ${price}, este pacote pode ser ajustado conforme preferências, datas e estilo de viagem. A agência acompanha o planejamento com atenção aos detalhes para transformar a intenção de viajar em uma experiência segura, bem organizada e memorável.`
}

export async function generatePackageDescriptionWithCos(input: PackageDescriptionInput): Promise<CosTextResult> {
  const fallback = buildPackageDescriptionFallback(input)
  const prompt = [
    "Você é o COS, assistente comercial do TravelMatch para agências de viagem.",
    "Crie uma descrição comercial humanizada, consultiva e persuasiva para um pacote.",
    "Estilo: TravelMatch/JT Viagens, português natural do Brasil, sofisticado sem exagero, sem emoji, sem promessas absolutas.",
    "Não invente itens inclusos. Se algum dado estiver ausente, trate como sob consulta.",
    "",
    `Título: ${formatField(input.title, "não informado")}`,
    `Destino: ${formatField(input.destination, "não informado")}`,
    `Categoria: ${formatField(input.categoryName, "não informada")}`,
    `Duração: ${formatField(input.durationDays)}`,
    `Preço: ${formatField(input.priceFrom)}`,
    "",
    "Responda em 2 parágrafos prontos para colar no campo de descrição do pacote.",
  ].join("\n")

  return requestOpenAI(prompt, fallback)
}

export function buildDashboardSuggestions(input: DashboardSuggestionInput) {
  const suggestions: string[] = []
  const conversion = Number(input.conversionRate.replace("%", "")) || 0
  const topPackage = input.topViewedPackages[0]

  if (input.unansweredAlerts > 0) {
    suggestions.push(`Você possui ${input.unansweredAlerts} lead(s) sem resposta. Priorize o contato para reduzir perda de oportunidade.`)
  }

  if (topPackage && topPackage.views > 0 && topPackage.leads === 0) {
    suggestions.push(`Seu pacote ${topPackage.title} recebeu visualizações, mas ainda não gerou leads. Revise imagem principal, título e chamada para contato.`)
  }

  if (input.leadsLast30Days > 0 && conversion >= 40) {
    suggestions.push(`Sua taxa de conversão está em ${input.conversionRate}, um bom sinal para o período. Mantenha acompanhamento rápido dos novos leads.`)
  } else if (input.leadsLast30Days > 0 && conversion === 0) {
    suggestions.push("Você já recebe leads, mas ainda não marcou oportunidades como ganhas. Atualize o funil para medir a conversão real.")
  }

  if (input.activePackages === 0) {
    suggestions.push("Publique seu primeiro pacote para começar a aparecer nas buscas e gerar dados reais para o COS analisar.")
  } else if (input.plan.toLowerCase().includes("free") && input.activePackages >= 2) {
    suggestions.push(`Você está no plano Free e já publicou ${input.activePackages} de 3 pacotes. Considere upgrade antes de atingir o limite.`)
  }

  if (input.reviewCount === 0 && input.leadsLast30Days > 0) {
    suggestions.push("Quando um lead for ganho, envie a avaliação para começar a construir reputação pública da agência.")
  } else if (input.reviewCount > 0 && input.averageRating >= 4.5) {
    suggestions.push(`Sua reputação média está em ${input.averageRating.toFixed(1)}. Use essa prova social nos pacotes mais estratégicos.`)
  }

  if (input.activePromotions > 0) {
    suggestions.push("Você possui produto patrocinado ativo. Acompanhe cliques e leads para decidir se vale renovar a exposição.")
  }

  return suggestions.slice(0, 5)
}

export function buildAnalyticsInsights(input: AnalyticsInsightInput) {
  const insights: string[] = []
  const topSource = input.leadSources[0]
  const topClicked = input.topClickedPackages[0]
  const topLeadPackage = input.topLeadPackages[0]
  const topCta = input.ctaEvents[0]
  const conversionRate = input.stats.leads > 0 ? Math.round((input.stats.conversions / input.stats.leads) * 100) : 0

  if (input.stats.views === 0 && input.stats.leads === 0 && input.stats.clicks === 0) {
    return [
      `No período ${input.periodLabel}, ainda não há volume suficiente para uma leitura comercial profunda.`,
      "A principal oportunidade é publicar e divulgar pacotes com destino, imagem e CTA bem definidos.",
      "Próxima ação recomendada: revise o pacote mais importante e acompanhe os primeiros cliques e leads.",
    ]
  }

  insights.push(`No período ${input.periodLabel}, sua agência registrou ${input.stats.views} visualizações, ${input.stats.clicks} cliques e ${input.stats.leads} leads.`)

  if (topSource) {
    insights.push(`A principal origem de leads foi ${topSource.name}, indicando onde a atenção comercial está se concentrando.`)
  }

  if (topClicked && topLeadPackage) {
    insights.push(`${topClicked.name} lidera em cliques, enquanto ${topLeadPackage.name} concentra mais leads. Compare imagem, preço e CTA entre eles.`)
  } else if (topClicked) {
    insights.push(`${topClicked.name} concentra os cliques. A próxima ação é reforçar o CTA e revisar se a oferta está clara.`)
  }

  if (topCta) {
    insights.push(`O CTA com maior interação foi ${topCta.name}. Use esse sinal para priorizar chamadas parecidas nos pacotes com maior intenção.`)
  }

  insights.push(conversionRate > 0
    ? `A conversão do período está em ${conversionRate}%. Mantenha resposta rápida e registro disciplinado dos status do funil.`
    : "Ainda não há conversões registradas no período. Atualize os status dos leads e priorize contatos recentes.")

  return insights.slice(0, 5)
}

export async function generateDashboardSuggestionsWithCos(input: DashboardSuggestionInput) {
  const fallbackItems = buildDashboardSuggestions(input)
  const fallback = fallbackItems.join("\n")
  const prompt = [
    "Você é o COS, analista comercial do TravelMatch.",
    "Gere de 3 a 5 sugestões objetivas para uma agência, usando somente os dados reais abaixo.",
    "Não invente números. Não use emoji. Seja consultivo e direto.",
    "",
    JSON.stringify(input, null, 2),
    "",
    "Responda somente com uma sugestão por linha, sem numeração.",
  ].join("\n")

  const result = await requestOpenAI(prompt, fallback || "Publique pacotes e acompanhe leads para gerar recomendações comerciais mais precisas.")
  const items = result.text.split("\n").map((item) => item.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5)
  return items.length > 0 ? items : fallbackItems
}

export async function generateAnalyticsInsightsWithCos(input: AnalyticsInsightInput) {
  const fallbackItems = buildAnalyticsInsights(input)
  const prompt = [
    "Você é o COS, analista comercial do TravelMatch.",
    "Gere uma análise curta para analytics de agência com: resumo, oportunidade, alerta se existir e próxima ação.",
    "Use somente os dados reais abaixo. Não invente dados. Não use emoji.",
    "",
    JSON.stringify(input, null, 2),
    "",
    "Responda em até 4 linhas, uma ideia por linha, sem numeração.",
  ].join("\n")

  const result = await requestOpenAI(prompt, fallbackItems.join("\n"))
  const items = result.text.split("\n").map((item) => item.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 4)
  return items.length > 0 ? items : fallbackItems
}
