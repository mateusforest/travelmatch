"use client"

import { useEffect, useState } from "react"
import { Tag, MapPin, Layers, Search, FileText, Plus, X } from "lucide-react"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateMatchSettings, updateReputationSettings } from "@/app/actions/master"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { defaultMatchSettings, type MatchSettings } from "@/lib/match-score"
import { defaultReputationSettings, type ReputationSettings } from "@/lib/reputation"

const sections = [
  { key: "categorias", label: "Categorias", icon: Tag },
  { key: "destinos", label: "Destinos", icon: MapPin },
  { key: "planos", label: "Planos", icon: Layers },
  { key: "seo", label: "SEO", icon: Search },
  { key: "conteudo", label: "Conteúdo institucional", icon: FileText },
  { key: "match", label: "Match", icon: Search },
]

function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags] = useState(initial)
  const [value, setValue] = useState("")

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-foreground"
          >
            {t}
            <button
              onClick={() => setTags(tags.filter((x) => x !== t))}
              aria-label={`Remover ${t}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Adicionar novo item"
          className="h-10 rounded-xl"
        />
        <Button
          onClick={() => {
            if (value.trim()) {
              setTags([...tags, value.trim()])
              setValue("")
            }
          }}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  )
}

export default function MasterConfiguracoesPage() {
  const [active, setActive] = useState("categorias")
  const [matchSettings, setMatchSettings] = useState<MatchSettings>(defaultMatchSettings)
  const [reputationSettings, setReputationSettings] = useState<ReputationSettings>(defaultReputationSettings)
  const [matchFeedback, setMatchFeedback] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    void supabase
      .from("match_settings")
      .select("destination_weight,category_weight,budget_weight,date_weight,travelers_weight,featured_bonus,performance_bonus")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMatchSettings(data as MatchSettings)
      })
    void supabase
      .from("reputation_settings")
      .select("reviews_weight,recommendation_weight,conversion_weight,response_time_weight,service_weight")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setReputationSettings(data as ReputationSettings)
      })
  }, [])

  const setMatchValue = (key: keyof MatchSettings, value: string) => {
    setMatchSettings((current) => ({ ...current, [key]: Number(value) || 0 }))
  }

  const setReputationValue = (key: keyof ReputationSettings, value: string) => {
    setReputationSettings((current) => ({ ...current, [key]: Number(value) || 0 }))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Configurações"
        description="Configurações globais da plataforma."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                active === s.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <s.icon className="h-[18px] w-[18px]" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">
          {active === "categorias" && (
            <SectionCard title="Categorias de pacotes">
              <TagEditor initial={["Disney", "Praia", "Neve", "Lua de mel", "Família", "Cruzeiros", "Premium"]} />
            </SectionCard>
          )}

          {active === "destinos" && (
            <SectionCard title="Destinos em destaque">
              <TagEditor initial={["Orlando", "Rio de Janeiro", "Bariloche", "Maldivas", "Cancún", "Toscana"]} />
            </SectionCard>
          )}

          {active === "planos" && (
            <SectionCard title="Planos da plataforma">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { name: "Essencial", price: "R$ 189/mês", desc: "Para agências iniciando no marketplace." },
                  { name: "Performance", price: "R$ 489/mês", desc: "Destaque, analytics avançado e prioridade." },
                ].map((p) => (
                  <div key={p.name} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <span className="text-sm font-semibold text-primary">{p.price}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <Button variant="outline" size="sm" className="mt-4 rounded-lg">
                      Editar plano
                    </Button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {active === "seo" && (
            <SectionCard title="SEO global">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="seo-title">Título padrão</Label>
                  <Input
                    id="seo-title"
                    defaultValue="TravelMatch | Marketplace Inteligente de Viagens"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-desc">Meta descrição</Label>
                  <Textarea
                    id="seo-desc"
                    defaultValue="Descreva a viagem que você procura e o TravelMatch encontra os pacotes mais compatíveis entre agências selecionadas."
                    className="mt-1.5 min-h-24 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="seo-keywords">Palavras-chave</Label>
                  <Input
                    id="seo-keywords"
                    defaultValue="viagens, pacotes, agências, turismo, lua de mel"
                    className="mt-1.5 h-11 rounded-xl"
                  />
                </div>
                <div>
                  <Button className="w-fit rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}

          {active === "conteudo" && (
            <SectionCard title="Conteúdo institucional">
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="about">Sobre o TravelMatch</Label>
                  <Textarea
                    id="about"
                    defaultValue="O TravelMatch conecta viajantes às melhores agências do mercado por meio de curadoria e tecnologia."
                    className="mt-1.5 min-h-28 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="contact-email">E-mail de contato</Label>
                    <Input id="contact-email" defaultValue="contato@travelpromatch.com.br" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Telefone</Label>
                    <Input id="contact-phone" defaultValue="+55 11 4000-0000" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Button className="w-fit rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}
          {active === "match" && (
            <SectionCard title="Pesos do match">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(matchSettings).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={key}>{key}</Label>
                    <Input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(event) => setMatchValue(key as keyof MatchSettings, event.target.value)}
                      className="mt-1.5 h-11 rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  className="w-fit rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    const result = await updateMatchSettings(matchSettings)
                    setMatchFeedback(result.ok ? "Pesos salvos." : result.message ?? "Nao foi possivel salvar.")
                  }}
                >
                  Salvar pesos
                </Button>
                {matchFeedback && <p className="text-sm text-muted-foreground">{matchFeedback}</p>}
              </div>
              <div className="mt-6 border-t border-border pt-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Pesos de reputacao</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(reputationSettings).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        type="number"
                        value={value}
                        onChange={(event) => setReputationValue(key as keyof ReputationSettings, event.target.value)}
                        className="mt-1.5 h-11 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4 w-fit rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    const result = await updateReputationSettings(reputationSettings)
                    setMatchFeedback(result.ok ? "Pesos salvos." : result.message ?? "Nao foi possivel salvar.")
                  }}
                >
                  Salvar reputacao
                </Button>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
