import type React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { CartProvider } from '@/components/cart/cart-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
})

const siteUrl = 'https://sambhavihandloom.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sambhavi Handloom — Timeless Handloom, Modern Elegance',
    template: '%s | Sambhavi Handloom',
  },
  description:
    'Sambhavi Handloom crafts premium handwoven sarees that celebrate Indian heritage, artistry and effortless elegance. Discover silk, Banarasi, Kanjeevaram, cotton and festive handloom sarees.',
  keywords: [
    'Sambhavi Handloom',
    'handloom sarees',
    'silk saree',
    'Banarasi saree',
    'Kanjeevaram saree',
    'Indian saree',
    'luxury saree',
  ],
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    title: 'Sambhavi Handloom — Timeless Handloom, Modern Elegance',
    description:
      'Beautifully crafted sarees that celebrate Indian heritage, artistry and effortless elegance.',
    url: siteUrl,
    siteName: 'Sambhavi Handloom',
    images: [{ url: '/images/hero-saree.png', width: 1200, height: 630, alt: 'Sambhavi Handloom saree' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sambhavi Handloom — Timeless Handloom, Modern Elegance',
    description:
      'Beautifully crafted sarees that celebrate Indian heritage, artistry and effortless elegance.',
    images: ['/images/hero-saree.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f3ec',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`light ${cormorant.variable} ${jost.variable} bg-background`}>
      <body className="antialiased">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
