export type SareeCategory = {
  slug: string
  name: string
  groupSlug: string
}

export type CategoryGroup = {
  slug: string
  name: string
  categories: SareeCategory[]
}

const groupDefs: { slug: string; name: string; names: string[] }[] = [
  {
    slug: 'handloom',
    name: 'HANDLOOM',
    names: [
      'Banarasi',
      'Kanjivaram / Kanchipuram',
      'Chanderi',
      'Maheshwari',
      'Paithani',
      'Patola',
      'Sambalpuri / Bomkai',
      'Jamdani',
      'Baluchari',
      'Tussar / Kosa Silk',
      'Kota Doria',
      'Pochampally',
      'Muga Silk',
      'Venkatagiri',
      'Gadwal',
    ],
  },
  {
    slug: 'powerloom',
    name: 'POWERLOOM',
    names: [
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

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+\/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const categoryGroups: CategoryGroup[] = groupDefs.map((group) => ({
  slug: group.slug,
  name: group.name,
  categories: group.names.map((name) => ({
    slug: nameToSlug(name),
    name,
    groupSlug: group.slug,
  })),
}))

export const sareeCategories: SareeCategory[] = categoryGroups.flatMap((g) => g.categories)

export const categoryNames = sareeCategories.map((c) => c.name)

export function getCategoryGroup(slug: string): CategoryGroup | undefined {
  return categoryGroups.find((g) => g.slug === slug)
}

export function getSareeCategory(slug: string): SareeCategory | undefined {
  return sareeCategories.find((c) => c.slug === slug)
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
