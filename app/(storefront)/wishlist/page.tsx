import type { Metadata } from 'next'
import { WishlistView } from '@/components/wishlist/wishlist-view'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Your saved Sambhavi Handloom sarees.',
  robots: { index: false, follow: false },
}

export default function WishlistPage() {
  return <WishlistView />
}
