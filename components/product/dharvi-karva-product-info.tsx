import { cn } from '@/lib/utils'
import type { Product } from '@/lib/products'

const MARKERS = ['✦', '✧', '◇', '❖'] as const

function cleanDetailLine(raw: string): string {
  return raw
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\u200D]+\s*/u, '')
    .replace(/^[▶️▶︎▶•·▪◦●]+\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isPriceLine(text: string): boolean {
  return /wow\s*price|₹\s*\d/i.test(text)
}

/**
 * Presentation-only: structures existing Karva copy into editorial sections.
 * Does not invent product data — only formats what is already on the product.
 */
export function buildDharviKarvaEditorialSections(product: Product): {
  highlights: string[]
  fabricCraft: string[]
} {
  const highlights: string[] = []
  const seen = new Set<string>()

  const pushUnique = (list: string[], value: string) => {
    const cleaned = cleanDetailLine(value)
    if (!cleaned || isPriceLine(cleaned)) return
    const key = cleaned.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    list.push(cleaned)
  }

  for (const line of product.description.replace(/\r\n/g, '\n').split('\n')) {
    pushUnique(highlights, line)
  }

  const fabricCraft: string[] = []
  const fabric = cleanDetailLine(product.fabric)
  // Present the long fabric sentence as two scannable lines without inventing copy.
  const fabricSplit = fabric.match(
    /^(.*?Pallu Concept Print)\s+And\s+(Contrast Arco Cutwork Bordar With Contrast Blouse.*)$/i,
  )
  if (fabricSplit) {
    pushUnique(fabricCraft, fabricSplit[1])
    pushUnique(fabricCraft, fabricSplit[2])
  } else if (fabric) {
    pushUnique(fabricCraft, fabric)
  }

  const blouse = cleanDetailLine(product.blouse)
  if (blouse && !fabric.toLowerCase().includes(blouse.toLowerCase())) {
    pushUnique(fabricCraft, blouse)
  }

  return { highlights, fabricCraft }
}

function EditorialSection({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-serif text-[1.05rem] font-normal tracking-[0.06em] text-foreground md:text-lg">
          {title}
        </h3>
        <div className="h-px w-12 bg-gradient-to-r from-wine/55 via-accent/40 to-transparent" aria-hidden />
      </div>
      <ul className="space-y-0">
        {items.map((item, index) => (
          <li
            key={`${title}-${item}`}
            className="group flex gap-3 border-b border-border/40 py-3.5 transition-colors duration-300 last:border-b-0 hover:bg-secondary/35"
          >
            <span
              className="mt-0.5 shrink-0 font-serif text-[0.7rem] leading-5 text-wine/80 transition-transform duration-300 group-hover:translate-x-px"
              aria-hidden
            >
              {MARKERS[index % MARKERS.length]}
            </span>
            <span className="min-w-0 font-sans text-[0.9rem] font-normal leading-[1.65] tracking-[0.01em] text-foreground/88 text-pretty">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EditorialSpecRows({
  rows,
}: {
  rows: Array<{ label: string; value: string }>
}) {
  const filtered = rows.filter((row) => row.value.trim().length > 0)
  if (filtered.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-serif text-[1.05rem] font-normal tracking-[0.06em] text-foreground md:text-lg">
          Product Details
        </h3>
        <div className="h-px w-12 bg-gradient-to-r from-wine/55 via-accent/40 to-transparent" aria-hidden />
      </div>
      <dl className="overflow-hidden rounded-sm border border-border/50 bg-secondary/25">
        {filtered.map((row) => (
          <div
            key={row.label}
            className="group grid grid-cols-1 gap-1 border-b border-border/40 px-4 py-3.5 transition-colors duration-300 last:border-b-0 hover:bg-ivory/70 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-5"
          >
            <dt className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {row.label}
            </dt>
            <dd className="min-w-0 font-sans text-sm leading-relaxed tracking-[0.01em] text-foreground/90 text-pretty transition-opacity duration-300 group-hover:text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Editorial right-column info for Dharvi Karva Chauth saree only. */
export function DharviKarvaProductInfo({
  product,
  className,
  showSpecs = true,
}: {
  product: Product
  className?: string
  /** When false, only highlights + fabric/craft are rendered (purchase controls can sit between). */
  showSpecs?: boolean
}) {
  const { highlights, fabricCraft } = buildDharviKarvaEditorialSections(product)

  return (
    <div className={cn('space-y-8', className)}>
      <EditorialSection title="Product Highlights" items={highlights} />
      <EditorialSection title="Fabric & Craft" items={fabricCraft} />
      {showSpecs ? (
        <EditorialSpecRows
          rows={[
            { label: 'Fabric', value: product.fabric },
            { label: 'Weave', value: product.weave },
            { label: 'Length', value: product.length },
            { label: 'Blouse', value: product.blouse },
            { label: 'Care', value: product.care },
          ]}
        />
      ) : null}
    </div>
  )
}

export function DharviKarvaProductSpecs({
  product,
  className,
}: {
  product: Product
  className?: string
}) {
  return (
    <div className={cn(className)}>
      <EditorialSpecRows
        rows={[
          { label: 'Fabric', value: product.fabric },
          { label: 'Weave', value: product.weave },
          { label: 'Length', value: product.length },
          { label: 'Blouse', value: product.blouse },
          { label: 'Care', value: product.care },
        ]}
      />
    </div>
  )
}
