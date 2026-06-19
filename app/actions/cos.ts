"use server"

type GeneratePackageDescriptionInput = {
  destination: string
  durationDays?: string
  categoryName?: string
  priceFrom?: string
}

export async function generatePackageDescription(input: GeneratePackageDescriptionInput) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY não configurada." }
  }

  const prompt = [
    "Crie uma descrição comercial para um pacote de viagem no estilo consultivo, humano e sofisticado da JT Viagens.",
    "Evite texto genérico. Valorize curadoria, segurança, experiência e suporte.",
    `Destino: ${input.destination || "não informado"}`,
    `Categoria: ${input.categoryName || "não informada"}`,
    `Duração: ${input.durationDays || "sob consulta"}`,
    `Preço: ${input.priceFrom || "sob consulta"}`,
    "Responda em português do Brasil, em 1 a 2 parágrafos, pronto para usar no cadastro do pacote.",
  ].join("\n")

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 450,
    }),
  })
  const data = await response.json() as {
    output_text?: string
    error?: { message?: string }
  }

  if (!response.ok) {
    return { ok: false, message: data.error?.message ?? "Não foi possível gerar a descrição." }
  }

  const text = data.output_text?.trim()
  if (!text) {
    return { ok: false, message: "A IA não retornou uma descrição." }
  }

  return { ok: true, description: text }
}
