import type React from 'react'
import { CartProvider } from '@/components/cart/cart-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
