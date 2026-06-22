const labelMap: Record<string, string> = {
  view_package: "Visualização de pacote",
  package_page: "Página do pacote",
  lead_submitted: "Lead enviado",
  whatsapp_click: "Clique no WhatsApp",
  view_agency: "Visualização de agência",
  agency_page: "Página da agência",
  search_results: "Resultado de busca",
  home: "Página inicial",
  featured_agency: "Agência em destaque",
  "/": "Página inicial",
}

export function humanizeTrackingLabel(value?: string | null) {
  if (!value) return "Não informado"

  const normalized = value.trim()
  if (labelMap[normalized]) return labelMap[normalized]
  if (normalized.startsWith("/?busca=")) return "Resultado de busca"
  if (normalized.startsWith("/pacotes")) return "Página do pacote"
  if (normalized.startsWith("/agencias")) return "Página da agência"

  return normalized
    .replace(/^\/+/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
