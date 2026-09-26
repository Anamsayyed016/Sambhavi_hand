/** Presentation-only fashion icon for Categories nav links (never stored on Product.category). */
export type FashionNavIcon = '👗' | '🥻' | '🧵' | '👚'

export type SareeCategory = {
  slug: string
  name: string
  groupSlug: string
  /** Key catalog types shown with subtle emphasis in navigation. */
  prominent?: boolean
  /** When set, this category nests under another leaf category (e.g. CHHABILI under Navratri). */
  parentSlug?: string
  /**
   * Optional clothing/fashion emoji for mega-menu / mobile category links only.
   * Does not alter `name`, slugs, or Product.category values.
   */
  navIcon?: FashionNavIcon
  /** Keep this leaf in Categories nav before products are assigned. */
  showWhenEmpty?: boolean
}

export type CategoryGroup = {
  slug: string
  name: string
  categories: SareeCategory[]
  /** Main catalog section with extensive subcategories. */
  primary?: boolean
  /** Keep leaf links visible in nav before products are assigned. */
  showEmptyCategories?: boolean
}

const prominentCategorySlugs = new Set(['digital-print', 'kota-handloom'])

/** Leaf category entry inside a group — string name, or name + optional slug/visibility. */
type GroupCategoryDef =
  | string
  | { name: string; slug?: string; showWhenEmpty?: boolean }

const groupDefs: {
  slug: string
  name: string
  names: GroupCategoryDef[]
  primary?: boolean
  /**
   * Keep leaf categories in the Categories mega-menu even before products land
   * (same structural idea as nested Navratri children).
   */
  showEmptyCategories?: boolean
}[] = [
  {
    slug: 'handloom-powerloom',
    name: 'HANDLOOM & POWERLOOM',
    primary: true,
    names: [
      'Digital Print',
      'Kota Handloom',
      'KCS COLLECTION',
      'Banarasi',
      'Kanjivaram / Kanchipuram',
      'Maheshwari',
      'Paithani',
      'Patola',
      'Sambalpuri / Bomkai',
      'Jamdani',
      'Baluchari',
      'Tussar / Kosa Silk',
      'Pochampally',
      'Muga Silk',
      'Venkatagiri',
      'Gadwal',
      'Georgette',
      'Chiffon',
      'Cotton Prints',
      'Crepe',
      'Net / Embroidered',
      'Silk-Blend (Art Silk)',
      'Linen',
      'Satin',
    ],
  },
  {
    slug: 'festive-edition',
    name: 'FESTIVE EDITION',
    names: [
      'Wedding / Bridal',
      'Diwali Collection',
      'Durga Puja / Bengal Special',
      'Navratri Collection',
      'Raksha Bandhan / Family Sets',
    ],
  },
  {
    slug: 'summer-collection',
    name: 'Summer Collection',
    showEmptyCategories: true,
    names: [
      {
        name: '🌷Ritu fashion Kaftan collection🌷',
        slug: 'ritu-fashion-kaftan-collection',
      },
      'EXCLUSIVE KOTA DORIA',
    ],
  },
  {
    slug: 'kids-ethnic-wear',
    name: 'KIDS ETHNIC WEAR',
    names: [
      'Mini Lehenga-Saree Sets',
      'Ready-to-Wear Pre-Draped Sarees',
      'Half-Sarees / Langa Voni',
      'Mother-Daughter Sets',
      'Festive Frocks with Dupatta',
    ],
  },
  {
    slug: 'budget-sarees',
    name: 'BUDGET SAREES',
    names: [
      'Everyday Cotton Prints',
      'Simple Georgette / Chiffon',
      'Synthetic Silk-Blend',
      'Starter Puja / Daily-Wear',
    ],
  },
]

/** Nested festive sub-categories (parent is another leaf category, not a group). */
const nestedCategoryDefs: Array<{
  name: string
  parentSlug: string
  groupSlug: string
  /** Preserve an existing route when the display name would slug differently. */
  slug?: string
}> = [
  {
    name: 'CHHABILI',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'JOBANIYU',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'Lehenga Collection',
    /** Keep existing /collections/lehanga links & product collection chips. */
    slug: 'lehanga',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'DHARVI — DURGA POOJA EDITION',
    /** Canonical route: /collections/dharvi-durga-pooja-edition */
    slug: 'dharvi-durga-pooja-edition',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'Dharvi Karva Chauth Saree',
    /** Canonical route: /collections/dharvi-karva-chauth-saree */
    slug: 'dharvi-karva-chauth-saree',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: '🍁Tirupati Durga Puja Special 🍁',
    /** Canonical route: /collections/tirupati-durga-puja-special */
    slug: 'tirupati-durga-puja-special',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'LEHENGA CHOLI',
    /** Moved under Navratri; preserve /collections/lehenga-choli */
    slug: 'lehenga-choli',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'Vinayaka Pure Dola Silk Softy Fully Jari Jaqurad',
    /** Canonical route: /collections/vinayaka-pure-dola-silk-softy-fully-jari-jaqurad */
    slug: 'vinayaka-pure-dola-silk-softy-fully-jari-jaqurad',
    parentSlug: 'navratri-collection',
    groupSlug: 'festive-edition',
  },
  {
    name: 'KCS Handloom Khadi Cotton Saree',
    /** Canonical route: /collections/kcs-handloom-khadi-cotton-saree */
    slug: 'kcs-handloom-khadi-cotton-saree',
    parentSlug: 'kcs-collection',
    groupSlug: 'handloom-powerloom',
  },
  {
    name: '🧵 KCS KANCHI COTTON SAREES 🧵',
    /** Canonical route: /collections/kcs-kanchi-cotton-sarees */
    slug: 'kcs-kanchi-cotton-sarees',
    parentSlug: 'kcs-collection',
    groupSlug: 'handloom-powerloom',
  },
  {
    name: "KCS Handloom Southcottonmix Saree's",
    /** Canonical route: /collections/kcs-handloom-southcottonmix-sarees */
    slug: 'kcs-handloom-southcottonmix-sarees',
    parentSlug: 'kcs-collection',
    groupSlug: 'handloom-powerloom',
  },
  {
    name: 'KCS Mangalagiri pure Handloom orginal pattu by cotton',
    /** Canonical route: /collections/kcs-mangalagiri-pure-handloom-orginal-pattu-by-cotton */
    slug: 'kcs-mangalagiri-pure-handloom-orginal-pattu-by-cotton',
    parentSlug: 'kcs-collection',
    groupSlug: 'handloom-powerloom',
  },
  {
    name: 'KCS Kanchipuram Laxury',
    /** Canonical route: /collections/kcs-kanchipuram-laxury — keep spelling “Laxury”. */
    slug: 'kcs-kanchipuram-laxury',
    parentSlug: 'kcs-collection',
    groupSlug: 'handloom-powerloom',
  },
  {
    name: 'KOTA DORIA SOFT COTTON SUITS',
    /** Canonical route: /collections/kota-doria-soft-cotton-suits */
    slug: 'kota-doria-soft-cotton-suits',
    parentSlug: 'exclusive-kota-doria',
    groupSlug: 'summer-collection',
  },
  {
    name: 'EXCLUSIVE KOTA DORIA SOFT COTTON SUITS',
    /** Canonical route: /collections/exclusive-kota-doria-soft-cotton-suits */
    slug: 'exclusive-kota-doria-soft-cotton-suits',
    parentSlug: 'exclusive-kota-doria',
    groupSlug: 'summer-collection',
  },
]

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+\/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Explicit nav icons for known catalogs; fallback uses clothing-type heuristics. */
const NAV_ICON_BY_SLUG: Record<string, FashionNavIcon> = {
  'digital-print': '🥻',
  'kota-handloom': '🥻',
  'exclusive-kota-doria-soft-cotton-suits': '🥻',
  chhabili: '👗',
  jobaniyu: '👗',
  lehanga: '👗',
  'lehenga-choli': '👗',
  'dharvi-durga-pooja-edition': '🥻',
  'dharvi-karva-chauth-saree': '🥻',
  'tirupati-durga-puja-special': '🥻',
  'kcs-kanchi-cotton-sarees': '🧵',
  'kcs-handloom-khadi-cotton-saree': '🧵',
  'kcs-handloom-southcottonmix-sarees': '🧵',
  'kcs-mangalagiri-pure-handloom-orginal-pattu-by-cotton': '🧵',
  'kcs-kanchipuram-laxury': '🧵',
  'kota-doria-soft-cotton-suits': '🧵',
  'vinayaka-pure-dola-silk-softy-fully-jari-jaqurad': '🥻',
  'ritu-fashion-kaftan-collection': '👗',
  'mini-lehenga-saree-sets': '👗',
  'ready-to-wear-pre-draped-sarees': '🥻',
  'half-sarees-langa-voni': '👗',
  'mother-daughter-sets': '👗',
  'festive-frocks-with-dupatta': '👗',
  'navratri-collection': '👗',
  'wedding-bridal': '🥻',
  'diwali-collection': '🥻',
  'durga-puja-bengal-special': '🥻',
  'raksha-bandhan-family-sets': '👚',
}

export function resolveCategoryNavIcon(slug: string, name: string): FashionNavIcon {
  const mapped = NAV_ICON_BY_SLUG[slug]
  if (mapped) return mapped

  const haystack = `${slug} ${name}`.toLowerCase()
  if (
    /lehenga|choli|kaftan|frock|langa|jobaniyu|chhabili|garba/.test(haystack)
  ) {
    return '👗'
  }
  if (/blouse|top|set|family/.test(haystack) && !/saree|sari/.test(haystack)) {
    return '👚'
  }
  if (/embroider|thread|weave|handloom|cotton print|crepe|net/.test(haystack)) {
    return '🧵'
  }
  return '🥻'
}

function toCategory(
  name: string,
  groupSlug: string,
  parentSlug?: string,
  slugOverride?: string,
  showWhenEmpty?: boolean,
): SareeCategory {
  const slug = slugOverride ?? nameToSlug(name)
  return {
    slug,
    name,
    groupSlug,
    parentSlug,
    prominent: prominentCategorySlugs.has(slug),
    navIcon: resolveCategoryNavIcon(slug, name),
    showWhenEmpty,
  }
}

function resolveGroupCategoryDef(
  def: GroupCategoryDef,
  groupSlug: string,
): SareeCategory {
  if (typeof def === 'string') return toCategory(def, groupSlug)
  return toCategory(def.name, groupSlug, undefined, def.slug, def.showWhenEmpty)
}

export const categoryGroups: CategoryGroup[] = groupDefs.map((group) => ({
  slug: group.slug,
  name: group.name,
  primary: group.primary,
  showEmptyCategories: group.showEmptyCategories,
  categories: group.names.map((def) => resolveGroupCategoryDef(def, group.slug)),
}))

export const nestedCategories: SareeCategory[] = nestedCategoryDefs.map((def) =>
  toCategory(def.name, def.groupSlug, def.parentSlug, def.slug),
)

/**
 * Retired taxonomy — still resolves `/collections/[slug]` so old links do not 404,
 * but excluded from nav groups and Admin categoryNames.
 */
const retiredCategoryDefs: Array<{
  name: string
  slug: string
  groupSlug: string
}> = [
  {
    name: 'Chanderi',
    slug: 'chanderi',
    groupSlug: 'handloom-powerloom',
  },
]

export const retiredCategories: SareeCategory[] = retiredCategoryDefs.map((def) =>
  toCategory(def.name, def.groupSlug, undefined, def.slug),
)

/** Flat list of all browseable categories including nested sub-categories. */
export const sareeCategories: SareeCategory[] = [
  ...categoryGroups.flatMap((g) => g.categories),
  ...nestedCategories,
  ...retiredCategories,
]

/**
 * Canonical Admin + storefront category labels (full configured taxonomy).
 * Includes group names marked showEmptyCategories so the parent catalog
 * (e.g. Summer Collection) is assignable alongside its leaf categories.
 * Retired categories (e.g. Chanderi) are intentionally omitted.
 *
 * Prefer `getAdminAssignableCategoryNames()` for the Product Form dropdown —
 * that list matches storefront navigation structure (not every empty leaf).
 */
export const categoryNames = Array.from(
  new Set([
    ...categoryGroups.flatMap((g) => g.categories.map((c) => c.name)),
    ...nestedCategories.map((c) => c.name),
    ...categoryGroups.filter((g) => g.showEmptyCategories).map((g) => g.name),
  ]),
)

/**
 * Admin Product Category options — derived from the storefront nav taxonomy,
 * not from DISTINCT Product.category and not from every configured empty leaf.
 *
 * Includes:
 * - All nested nav children (KCS / Navratri / Kota soft-cotton suits, …)
 * - Top-level leaves that are structural in nav: nested parents, prominent
 *   (Digital Print, Kota Handloom), showWhenEmpty, or groups with
 *   showEmptyCategories (Summer Collection leaves)
 * - Group names for showEmptyCategories groups (e.g. Summer Collection)
 *
 * Excludes empty legacy leaves (Banarasi, Georgette, Diwali, Budget, …)
 * that are hidden from the Categories mega-menu until they have content.
 */
export function getAdminAssignableCategoryNames(): string[] {
  const names = new Set<string>()

  for (const child of nestedCategories) {
    names.add(child.name)
  }

  for (const group of categoryGroups) {
    if (group.showEmptyCategories) {
      names.add(group.name)
    }
    for (const category of group.categories) {
      const hasNestedChildren = getChildCategories(category.slug).length > 0
      if (
        category.showWhenEmpty ||
        group.showEmptyCategories ||
        hasNestedChildren ||
        category.prominent
      ) {
        names.add(category.name)
      }
    }
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b))
}

export function isAdminAssignableCategoryName(name: string): boolean {
  return getAdminAssignableCategoryNames().includes(name.trim())
}

export const primaryCategoryGroup = categoryGroups.find((g) => g.primary)
export const secondaryCategoryGroups = categoryGroups.filter((g) => !g.primary)

export function getCategoryGroup(slug: string): CategoryGroup | undefined {
  return categoryGroups.find((g) => g.slug === slug)
}

export function getSareeCategory(slug: string): SareeCategory | undefined {
  const resolved =
    slug === 'kota' ? 'kota-handloom' : slug === 'lehenga' ? 'lehanga' : slug
  return sareeCategories.find((c) => c.slug === resolved)
}

export function getChildCategories(parentSlug: string): SareeCategory[] {
  return nestedCategories.filter((c) => c.parentSlug === parentSlug)
}

export function getParentCategory(category: SareeCategory): SareeCategory | undefined {
  if (!category.parentSlug) return undefined
  return getSareeCategory(category.parentSlug)
}

export function isKotaCategorySlug(slug: string): boolean {
  return slug === 'kota' || slug === 'kota-handloom'
}

export function getSareeCategoryByName(name: string): SareeCategory | undefined {
  return sareeCategories.find((c) => c.name === name)
}

/** Legacy collection slugs still referenced on products or navbar — hidden from category UI. */
export const legacyCollectionSlugs = [
  'new-arrivals',
  'silk-sarees',
  'banarasi-sarees',
  'cotton-handloom',
  'festive-collection',
  'wedding-collection',
] as const

export type LegacyCollectionSlug = (typeof legacyCollectionSlugs)[number]

export function isLegacyCollectionSlug(slug: string): slug is LegacyCollectionSlug {
  return (legacyCollectionSlugs as readonly string[]).includes(slug)
}
