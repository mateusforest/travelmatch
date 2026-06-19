"use client"

import { useState } from "react"
import { Sparkles, ArrowUp } from "lucide-react"

const suggestions = [
  "Criar pacote",
  "Melhorar anúncio",
  "Ver desempenho",
  "Responder lead",
  "Gerar descrição",
]

export function CosField({ compact = false }: { compact?: boolean }) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`group relative flex items-center gap-2 rounded-full border bg-card transition-all duration-300 ${
          focused
            ? "border-primary/50 shadow-lg shadow-primary/10 ring-2 ring-primary/10"
            : "border-border shadow-sm shadow-black/[0.03] hover:border-border/80"
        } ${compact ? "h-10 pl-3 pr-1.5" : "h-12 pl-4 pr-2"}`}
      >
        <Sparkles
          className={`shrink-0 text-primary ${compact ? "h-4 w-4" : "h-[18px] w-[18px]"}`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Como posso ajudar sua agência hoje?"
          aria-label="Fale com o COS"
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/80 focus:outline-none ${
            compact ? "text-sm" : "text-[15px]"
          }`}
        />
        <button
          type="submit"
          aria-label="Enviar para o COS"
          className={`grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 ${
            compact ? "h-7 w-7" : "h-8 w-8"
          }`}
        >
          <ArrowUp className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </form>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
