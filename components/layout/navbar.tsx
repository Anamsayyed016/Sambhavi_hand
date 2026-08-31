'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navLinks } from '@/lib/content'
import { useCart } from '@/components/cart/cart-provider'
import { BrandLogo } from '@/components/layout/brand-logo'
import {
  CategoriesMegaMenu,
  CategoriesMobileAccordion,
} from '@/components/layout/categories-mega-menu'

const navLinkClass =
  'group relative text-nav text-foreground transition-colors duration-300 hover:text-primary'

const iconClass = 'size-[1.375rem]'
const iconButtonClass =
  'rounded-full p-2.5 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count, openCart, wishlist } = useCart()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-ivory transition-colors duration-500">
      <nav className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 md:h-[5.625rem] md:px-8">
        {/* Left: logo */}
        <Link
          href="/"
          className="flex h-full shrink-0 items-center py-1 md:py-1.5"
          aria-label="Sambhavi Handloom home"
        >
          <BrandLogo priority className="h-16 w-auto object-contain md:h-[5.375rem]" />
        </Link>

        {/* Center: links */}
        <ul className="hidden items-center gap-9 xl:gap-10 lg:flex">
          {navLinks.flatMap((link) => {
            const item = (
              <li key={link.href}>
                <Link href={link.href} className={navLinkClass}>
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            )
            if (link.href === '/shop') {
              return [item, <li key="categories"><CategoriesMegaMenu /></li>]
            }
            return [item]
          })}
        </ul>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 text-foreground sm:gap-1.5">
          <Link href="/search" aria-label="Search products" className={iconButtonClass}>
            <Search className={iconClass} strokeWidth={1.5} aria-hidden />
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={cn('relative', iconButtonClass)}
          >
            <Heart
              className={cn(iconClass, wishlist.length > 0 && 'fill-primary text-primary')}
              strokeWidth={1.5}
              aria-hidden
            />
            {wishlist.length > 0 ? (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-medium text-accent-foreground">
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <Link href="/account" aria-label="Account" className={iconButtonClass}>
            <User className={iconClass} strokeWidth={1.5} aria-hidden />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="Shopping bag"
            className={cn('relative', iconButtonClass)}
          >
            <ShoppingBag className={iconClass} strokeWidth={1.5} aria-hidden />
            {count > 0 ? (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-medium text-primary-foreground">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className={cn(iconButtonClass, 'lg:hidden')}
          >
            {mobileOpen ? (
              <X className={iconClass} strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu className={iconClass} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-border/40 bg-ivory lg:hidden"
          >
            <ul className="flex flex-col px-4 py-4">
              {navLinks.flatMap((link, i) => {
                const item = (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i + 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block border-b border-border/40 py-3.5 text-nav text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                )
                if (link.href === '/shop') {
                  return [
                    item,
                    <motion.li
                      key="categories"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (i + 1) + 0.05 }}
                    >
                      <CategoriesMobileAccordion onNavigate={() => setMobileOpen(false)} />
                    </motion.li>,
                  ]
                }
                return [item]
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
