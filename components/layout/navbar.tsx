'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/content'
import { useCart } from '@/components/cart/cart-provider'
import { BrandLogo } from '@/components/layout/brand-logo'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count, openCart, wishlist } = useCart()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-ivory transition-colors duration-500">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
        {/* Left: logo */}
        <Link
          href="/"
          className="flex h-full shrink-0 items-center py-1 md:py-0.5"
          aria-label="Sambhavi Handloom home"
        >
          <BrandLogo priority className="h-14 w-auto object-contain md:h-[4.9rem]" />
        </Link>

        {/* Center: links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group relative text-sm font-light tracking-wide text-foreground transition-colors hover:text-primary"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: actions */}
        <div className="flex items-center gap-1 text-foreground sm:gap-3">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 transition-colors hover:text-accent"
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2 transition-colors hover:text-accent"
          >
            <Heart className="size-5" strokeWidth={1.5} />
            {wishlist.length > 0 ? (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[0.6rem] font-medium text-accent-foreground">
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2 transition-colors hover:text-accent sm:block"
          >
            <User className="size-5" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label="Shopping bag"
            className="relative rounded-full p-2 transition-colors hover:text-accent"
          >
            <ShoppingBag className="size-5" strokeWidth={1.5} />
            {count > 0 ? (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-medium text-primary-foreground">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="rounded-full p-2 transition-colors hover:text-accent lg:hidden"
          >
            {mobileOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
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
            className="overflow-hidden border-t border-border/40 bg-ivory lg:hidden"
          >
            <ul className="flex flex-col px-4 py-4">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block border-b border-border/40 py-3 font-serif text-lg text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
