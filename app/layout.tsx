import type React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Manrope } from 'next/font/google'
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
})

const siteUrl = 'https://sambhaviheritagereimagined.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Sambhavi Handloom — Heritage Reimagined',
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
  icons: {
    icon: [{ url: '/icon.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/icon.jpg', type: 'image/jpeg' }],
  },
  openGraph: {
    type: 'website',
    title: 'Sambhavi Handloom — Heritage Reimagined',
    description:
      'Beautifully crafted sarees that celebrate Indian heritage, artistry and effortless elegance.',
    url: siteUrl,
    siteName: 'Sambhavi Handloom',
    images: [{ url: '/images/hero-saree.png', width: 1200, height: 630, alt: 'Sambhavi Handloom saree' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sambhavi Handloom — Heritage Reimagined',
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
    <html lang="en" className={`light ${dmSerif.variable} ${manrope.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
