"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  ImagePlus,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createAgencyPackage, updateAgencyPackage, type PackageInput } from "@/app/actions/packages"
import { generatePackageDescription } from "@/app/actions/cos"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { AgencyPackageDetails } from "@/lib/data/agency"
import { removePackageGalleryImage, uploadPackageDraftImage, uploadPackageImage } from "@/app/actions/packages"
import { destinationSuggestions } from "@/lib/travel-suggestions"

const steps = [
  { n: 1, title: "Informações básicas" },
  { n: 2, title: "Descrição" },
  { n: 3, title: "Galeria" },
  { n: 4, title: "Publicação" },
]

type Category = {
  id: string
  name: string
  slug: string
}

export function PackageForm({ pkg }: { pkg?: AgencyPackageDetails }) {
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(pkg?.title ?? "")
  const [destination, setDestination] = useState(pkg?.destination ?? "")
  const [categoryId, setCategoryId] = useState(pkg?.category_id ?? "")
  const [priceFrom, setPriceFrom] = useState(pkg?.price_from ? String(pkg.price_from) : "")
  const [durationDays, setDurationDays] = useState(pkg?.duration_days ? String(pkg.duration_days) : "")
  const [description, setDescription] = useState(pkg?.description ?? "")
  const [imageUrl, setImageUrl] = useState(pkg?.image_url ?? "")
  const [galleryImages, setGalleryImages] = useState<string[]>(pkg?.gallery_images ?? (pkg?.image_url ? [pkg.image_url] : []))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase
      .from("travel_categories")
      .select("id,name,slug")
      .eq("active", true)
      .order("name", { ascending: true })
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const next = () => setStep((s) => Math.min(4, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const generateWithCos = async () => {
    setGenerating(true)
    setError(null)
    const categoryName = categories.find((category) => category.id === categoryId)?.name
    const result = await generatePackageDescription({
      destination,
      durationDays,
      categoryName,
      priceFrom,
    })

    if (result.ok && result.description) {
      setDescription(result.description)
    } else {
      setError(result.message ?? "Não foi possível gerar a descrição.")
    }

    setGenerating(false)
  }

  const buildInput = (status: PackageInput["status"]): PackageInput => ({
    title,
    destination,
    categoryId,
    description,
    priceFrom,
    durationDays,
    status,
    imageUrl,
    galleryImages,
  })

  const savePackage = async (status: PackageInput["status"]) => {
    setError(null)
    setSubmitting(true)

    const result = pkg
      ? await updateAgencyPackage(pkg.id, buildInput(status))
      : await createAgencyPackage(buildInput(status))

    if (result && !result.ok) {
      setError(result.message)
      setSubmitting(false)
    }
  }

  const uploadImage = async (file: File | null) => {
    if (!file) return
    if (galleryImages.length >= 15) {
      setError("Limite de 15 imagens por pacote.")
      return
    }

    const formData = new FormData()
    formData.set("image", file)
    const result = pkg
      ? await uploadPackageImage(pkg.id, formData)
      : await uploadPackageDraftImage(formData)

    if (result.ok && result.url) {
      setImageUrl(result.url)
      setGalleryImages((current) => [...current, result.url!].slice(0, 15))
    } else if (result.message) {
      setError(result.message)
    }
  }

  const removeGalleryImage = async (url: string) => {
    if (pkg) {
      const result = await removePackageGalleryImage(pkg.id, url)
      if (!result.ok) {
        setError(result.message ?? "Não foi possível remover a imagem.")
        return
      }
    }
    setGalleryImages((current) => {
      const next = current.filter((item) => item !== url)
      if (imageUrl === url) setImageUrl(next[0] ?? "")
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/agencia/pacotes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pacotes
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
        {pkg ? "Editar pacote" : "Novo pacote"}
      </h1>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Preencha as etapas para publicar seu pacote no TravelMatch.
      </p>

      <div className="mt-8 flex items-center">
        {steps.map((s, i) => {
          const done = step > s.n
          const active = step === s.n
          return (
            <div key={s.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span
                  className={`hidden text-sm font-medium sm:block ${
                    active || done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 ${done ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm shadow-black/[0.03] md:p-8">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título do pacote</Label>
              <Input
                id="title"
                placeholder="Ex: Disney em família - 7 dias"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="destination">Destino</Label>
              <Input
                id="destination"
                placeholder="Ex: Orlando, EUA"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1.5"
                autoComplete="address-level2"
                list="package-destinations"
              />
              <datalist id="package-destinations">
                {destinationSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">Preço a partir de</Label>
              <Input
                id="price"
                placeholder="R$ 0,00"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="mt-1.5"
                inputMode="decimal"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                placeholder="Ex: 7 dias"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="mt-1.5"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="description">Descrição do pacote</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateWithCos}
                disabled={generating}
                className="rounded-full border-primary/30 text-primary hover:bg-primary/5"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {generating ? "Gerando..." : "Gerar com COS"}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a experiência, roteiro, diferenciais e o que está incluído..."
              className="min-h-44 resize-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Use o COS para gerar uma descrição persuasiva e ajuste como
              preferir.
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>Galeria de imagens</Label>
            <label
              htmlFor="gallery"
              className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
            >
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
                <ImagePlus className="h-6 w-6 text-primary" />
              </span>
              <span className="text-sm font-medium text-foreground">
                Arraste imagens ou clique para enviar
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                PNG, JPG até 10MB cada
              </span>
              <input
                id="gallery"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 15 - galleryImages.length)
                  files.forEach((file) => void uploadImage(file))
                }}
              />
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
                <Upload className="h-4 w-4" /> Selecionar arquivos
              </span>
            </label>
            {galleryImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryImages.map((url, index) => (
                  <div key={url} className="relative overflow-hidden rounded-xl border border-border">
                    <img src={url} alt="" className="aspect-video w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => void removeGalleryImage(url)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow-sm"
                      aria-label="Remover imagem"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {index === 0 && (
                      <p className="absolute bottom-0 left-0 right-0 bg-background/90 px-2 py-1 text-xs text-muted-foreground">Principal</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
              <Check className="h-7 w-7 text-primary" />
            </span>
            <h2 className="text-xl font-semibold text-foreground">
              Tudo pronto para publicar
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Ao publicar, seu pacote ficará visível para viajantes compatíveis
              através do Match inteligente. Você também pode salvar como
              rascunho.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => savePackage("published")}
                disabled={submitting}
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
              >
                Publicar agora
              </Button>
              <Button
                variant="outline"
                onClick={() => savePackage("draft")}
                disabled={submitting}
                className="rounded-full border-border px-6 hover:border-primary/40"
              >
                Salvar rascunho
              </Button>
            </div>
            {error && (
              <p className="mt-4 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 1}
              className="rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              onClick={next}
              className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

