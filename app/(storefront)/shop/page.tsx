import type { Metadata } from 'next'
import { PageBanner } from '@/components/layout/page-banner'
import { ShopView } from '@/components/shop/shop-view'

export const metadata: Metadata = {
  title: 'Shop All Sarees',
  description:
    'Browse the complete collection of Sambhavi Handloom sarees — silk, Banarasi, Kanjeevaram, cotton and festive handloom drapes.',
}

export default function ShopPage() {
  return (
    <>
      <PageBanner
        title="All Sarees"
        subtitle="Explore our complete collection of handwoven sarees, crafted for every occasion."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sarees' }]}
      />
      <ShopView />
    </>
  )
}
