import { getChildCategories, categoryNames } from './lib/categories.ts'

const kids = getChildCategories('kcs-collection')
console.log(kids.map((c) => ({ slug: c.slug, name: c.name, icon: c.navIcon })))
console.log(
  'once',
  kids.filter((c) => c.slug === 'kcs-handloom-southcottonmix-sarees').length,
)
console.log(
  'admin',
  categoryNames.includes("KCS Handloom Southcottonmix Saree's"),
)
console.log(
  'after kanchi',
  kids.map((c) => c.slug).join(' -> '),
)
