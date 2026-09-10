import { cn } from '@/lib/utils'

/** Elegant monochrome markers for CHHABILI / Navratri 2026 product details. */
const MARKERS = ['✦', '✧', '◇', '❖'] as const

const BULLET_RE = /^(?:[•\-\*·▪◦●]|[✦✧◇❖])\s*(.+)$/
const SECTION_RE = /^(specifications|package\s*contains|weight)\s*:?\s*$/i

type ProseBlock = { type: 'prose'; text: string }
type SectionBlock = {
  type: 'section'
  title: string
  items: Array<{ marker: string; text: string }>
}

export type ChhabiliDescriptionBlock = ProseBlock | SectionBlock

function nextMarker(index: number): string {
  return MARKERS[index % MARKERS.length]
}

function titleCaseSection(raw: string): string {
  const key = raw.replace(/:/g, '').trim().toLowerCase()
  if (key.startsWith('spec')) return 'Specifications'
  if (key.startsWith('package')) return 'Package Contains'
  if (key.startsWith('weight')) return 'Weight'
  return raw.replace(/:/g, '').trim()
}

/**
 * Presentation-only parser: keeps product copy intact, upgrades bullet styling.
 * Works for every CHHABILI product description shape (static + admin/DB).
 */
export function parseChhabiliDescription(description: string): ChhabiliDescriptionBlock[] {
  const lines = description.replace(/\r\n/g, '\n').split('\n')
  const blocks: ChhabiliDescriptionBlock[] = []
  let proseBuf: string[] = []
  let section: SectionBlock | null = null
  let markerIndex = 0

  const flushProse = () => {
    const text = proseBuf.join('\n').trim()
    if (text) blocks.push({ type: 'prose', text })
    proseBuf = []
  }

  const flushSection = () => {
    if (section) blocks.push(section)
    section = null
    markerIndex = 0
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      if (section) {
        flushSection()
      } else {
        proseBuf.push('')
      }
      continue
    }

    const sectionMatch = trimmed.match(SECTION_RE)
    if (sectionMatch) {
      flushProse()
      flushSection()
      section = { type: 'section', title: titleCaseSection(sectionMatch[1]), items: [] }
      continue
    }

    // "Weight:\n1.300 Kg" or "Weight: 1.300 Kg"
    const inlineSection = trimmed.match(/^(specifications|package\s*contains|weight)\s*:\s*(.+)$/i)
    if (inlineSection) {
      flushProse()
      flushSection()
      const title = titleCaseSection(inlineSection[1])
      const rest = inlineSection[2].trim()
      const bullet = rest.match(BULLET_RE)
      section = {
        type: 'section',
        title,
        items: [
          {
            marker: nextMarker(0),
            text: bullet ? bullet[1] : rest,
          },
        ],
      }
      markerIndex = 1
      continue
    }

    const bullet = trimmed.match(BULLET_RE)
    if (bullet) {
      if (!section) {
        flushProse()
        section = { type: 'section', title: '', items: [] }
      }
      section.items.push({ marker: nextMarker(markerIndex), text: bullet[1] })
      markerIndex += 1
      continue
    }

    if (section) {
      // Non-bullet line inside an open section (e.g. weight value)
      section.items.push({ marker: nextMarker(markerIndex), text: trimmed })
      markerIndex += 1
      continue
    }

    proseBuf.push(line)
  }

  flushProse()
  flushSection()
  return blocks
}

export function ChhabiliProductDescription({
  description,
  className,
}: {
  description: string
  className?: string
}) {
  const blocks = parseChhabiliDescription(description)

  return (
    <div className={cn('space-y-5 font-sans text-sm leading-relaxed text-foreground/85', className)}>
      {blocks.map((block, index) => {
        if (block.type === 'prose') {
          return (
            <p
              key={`prose-${index}`}
              className="whitespace-pre-line text-pretty"
            >
              {block.text}
            </p>
          )
        }

        return (
          <div key={`section-${block.title}-${index}`} className="space-y-3">
            {block.title ? (
              <h3 className="font-serif text-base tracking-[0.04em] text-foreground md:text-lg">
                {block.title}
              </h3>
            ) : null}
            <ul className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item.text}-${itemIndex}`}
                  className="flex gap-2.5 text-pretty"
                >
                  <span
                    className="mt-0.5 shrink-0 text-[0.7rem] leading-5 text-accent/90"
                    aria-hidden="true"
                  >
                    {item.marker}
                  </span>
                  <span className="min-w-0 leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
