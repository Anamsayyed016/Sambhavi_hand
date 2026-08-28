import type { Metadata } from 'next'
import { PageBanner } from '@/components/layout/page-banner'
import { ShopView } from '@/components/shop/shop-view'
import { getSareeCategory } from '@/lib/categories'

export const metadata: Metadata = {
  title: 'Shop All Sarees',
  description:
    'Browse the complete Sambhavi Handloom saree catalog — digital print, kota, handloom, powerloom, and festive categories.',
}

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category: categorySlug } = await searchParams
  const category = categorySlug ? getSareeCategory(categorySlug) : undefined

  return (
    <>
      <PageBanner
        title="All Sarees"
        subtitle="Explore our complete collection of handwoven sarees, crafted for every occasion."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sarees' }]}
      />
      <ShopView initialCategory={category?.name} />
    </>
  )
}
