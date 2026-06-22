"use client"

import { useState } from "react"
import {
  ImagePlus,
  Store,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Star,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader, SectionCard } from "@/components/agencia/ui-bits"
import { updateAgencyProfile, uploadAgencyBanner, uploadAgencyLogo } from "@/app/actions/profile"
import type { AgencyProfileData } from "@/lib/data/agency"
import { citySuggestions } from "@/lib/travel-suggestions"

const allSpecialties = [
  "Europa",
  "Disney",
  "Cruzeiros",
  "Lua de Mel",
  "Família",
  "Premium",
  "Nacional",
  "Internacional",
]

export function PerfilForm({ profile }: { profile: AgencyProfileData | null }) {
  const [name, setName] = useState(profile?.agency_name ?? "")
  const [responsibleName, setResponsibleName] = useState(profile?.responsible_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [city, setCity] = useState(profile?.city ?? "")
  const [state, setState] = useState(profile?.state ?? "")
  const [description, setDescription] = useState(profile?.description ?? "")
  const [website, setWebsite] = useState(profile?.website ?? "")
  const [instagram, setInstagram] = useState(profile?.instagram ?? "")
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url ?? "")
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url ?? "")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toggle = (s: string) =>
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )

  const save = async () => {
    setError(null)
    setSaved(false)
    setSubmitting(true)

    const result = await updateAgencyProfile({
      agency_name: name,
      responsible_name: responsibleName,
      phone,
      city,
      state,
      description,
      website,
      instagram,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    })

    if (result.ok) {
      setSaved(true)
    } else {
      setError(result.message ?? "Não foi possível salvar o perfil.")
    }

    setSubmitting(false)
  }

  const uploadLogo = async (file: File | null) => {
    if (!file) return

    const formData = new FormData()
    formData.set("logo", file)
    const result = await uploadAgencyLogo(formData)
    if (result.ok && result.url) {
      setLogoUrl(result.url)
      setSaved(true)
    } else {
      setError(result.message ?? "Não foi possível enviar o logo.")
    }
  }

  const uploadBanner = async (file: File | null) => {
    if (!file) return

    const formData = new FormData()
    formData.set("banner", file)
    const result = await uploadAgencyBanner(formData)
    if (result.ok && result.url) {
      setBannerUrl(result.url)
      setSaved(true)
    } else {
      setError(result.message ?? "Não foi possível enviar o banner.")
    }
  }

  return (
    <>
      <PageHeader
        title="Perfil Público"
        description="Esta é a página da sua agência vista pelos viajantes."
        action={
          <Button
            onClick={save}
            disabled={submitting}
            className="rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
          >
            Salvar alterações
          </Button>
        }
      />

      {(error || saved) && (
        <p className={`mb-4 text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
          {error ?? "Alterações salvas."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <SectionCard title="Identidade visual">
            <div className="space-y-5">
              <div>
                <Label>Banner</Label>
                <label
                  htmlFor="banner"
                  className="mt-1.5 flex aspect-[3/1] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40 text-center transition-colors hover:border-primary/40"
                  style={bannerUrl ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  <span className={`flex flex-col items-center ${bannerUrl ? "rounded-lg bg-background/80 px-3 py-2 text-foreground" : "text-muted-foreground"}`}>
                    <ImagePlus className="mb-1 h-6 w-6" />
                    <span className="text-xs">Enviar banner (1200×400)</span>
                  </span>
                  <input
                    id="banner"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => uploadBanner(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div>
                <Label>Logo</Label>
                <label
                  htmlFor="logo"
                  className="mt-1.5 flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary/40"
                  style={logoUrl ? { backgroundImage: `url(${logoUrl})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" } : undefined}
                >
                  {!logoUrl && <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => uploadLogo(e.target.files?.[0] ?? null)}
                  />
                </label>
                {logoUrl && (
                  <p className="mt-2 text-xs text-muted-foreground">Logo salvo.</p>
                )}
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-3"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Informações">
            <div className="space-y-5">
              <div>
                <Label htmlFor="name">Nome da agência</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mundo Afora Viagens"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="responsible">Nome do responsável</Label>
                <Input
                  id="responsible"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="desc">Descrição</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte quem é a sua agência e no que vocês são especialistas..."
                  className="mt-1.5 min-h-28 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 0000-0000"
                    className="mt-1.5"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sua cidade"
                    className="mt-1.5"
                    autoComplete="address-level2"
                    list="agency-cities"
                  />
                  <datalist id="agency-cities">
                    {citySuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="UF"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="insta">Instagram</Label>
                  <Input
                    id="insta"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@suaagencia"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="suaagencia.com.br"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input value={profile?.status ?? ""} readOnly className="mt-1.5" />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Especialidades">
            <div className="flex flex-wrap gap-2">
              {allSpecialties.map((s) => {
                const on = specialties.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      on
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard title="Avaliações">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary">
                <Star className="h-[18px] w-[18px]" />
              </span>
              As avaliações dos viajantes aparecerão aqui assim que sua agência
              começar a receber feedbacks.
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Pré-visualização
            </p>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.03]">
              <div
                className="h-24 bg-gradient-to-r from-primary/30 to-primary/10 bg-cover bg-center"
                style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
              />
              <div className="px-5 pb-5">
                <div
                  className="-mt-8 mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 bg-center bg-no-repeat"
                  style={logoUrl ? { backgroundImage: `url(${logoUrl})`, backgroundSize: "contain" } : undefined}
                >
                  {!logoUrl && <Store className="h-7 w-7 text-primary" />}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {name || "Nome da agência"}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {description ||
                    "A descrição da sua agência aparecerá aqui para os viajantes."}
                </p>

                {specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {city || "Brasil"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Telefone
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Instagram className="h-3.5 w-3.5" /> Instagram
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> Site
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
