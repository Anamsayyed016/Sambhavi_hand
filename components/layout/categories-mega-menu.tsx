'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type CategoryGroup, type SareeCategory } from '@/lib/categories'
import {
  getVisibleNavCategoryGroups,
  getVisibleNavChildCategories,
} from '@/lib/catalog-nav'
import { getStorefrontProducts, type Product } from '@/lib/products'

const NAVRATRI_SLUG = 'navratri-collection'

function isActiveHref(pathname: string | null, href: string) {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavCategoryLink({
  category,
  onNavigate,
  pathname,
  nested = false,
}: {
  category: SareeCategory
  onNavigate?: () => void
  pathname: string | null
  nested?: boolean
}) {
  const href = `/collections/${category.slug}`
  const active = isActiveHref(pathname, href)
  const icon = category.navIcon

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/link relative flex min-w-0 items-start gap-2 py-[0.3rem] transition-colors duration-150',
        nested ? 'pl-0.5' : '',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-[0.7em] h-px w-0 shrink-0 bg-gold/75 transition-all duration-150',
          'group-hover/link:w-2.5',
          active && 'w-2.5 bg-primary',
        )}
      />
      {icon ? (
        <span
          aria-hidden
          className="mt-[0.05em] w-[1.15em] shrink-0 text-center text-[0.875rem] leading-snug"
        >
          {icon}
        </span>
      ) : null}
      <span
        className={cn(
          'min-w-0 font-sans text-[0.875rem] font-normal leading-snug tracking-[0.02em] text-charcoal/70 transition-colors duration-150',
          category.prominent && 'font-medium text-charcoal/88',
          'group-hover/link:text-primary',
          active && 'text-primary',
        )}
      >
        {category.name}
      </span>
    </Link>
  )
}

function CategoryLinks({
  categories,
  onNavigate,
  className,
  pathname,
}: {
  categories: SareeCategory[]
  onNavigate?: () => void
  className?: string
  pathname: string | null
}) {
  const products = useMemo(() => getStorefrontProducts(), [])

  return (
    <ul className={cn('flex flex-col gap-0', className)}>
      {categories.map((category) => {
        const children = getVisibleNavChildCategories(category.slug, products)
        const isNavratri = category.slug === NAVRATRI_SLUG

        if (isNavratri && children.length > 0) {
          return (
            <li key={category.slug} className="mt-1.5 space-y-2 pt-1">
              <Link
                href={`/collections/${category.slug}`}
                onClick={onNavigate}
                aria-current={
                  isActiveHref(pathname, `/collections/${category.slug}`)
                    ? 'page'
                    : undefined
                }
                className="group/navratri inline-flex flex-col gap-1.5"
              >
                <span
                  className={cn(
                    'font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-wine/80 transition-colors duration-150',
                    'group-hover/navratri:text-primary',
                    isActiveHref(pathname, `/collections/${category.slug}`) &&
                      'text-primary',
                  )}
                >
                  Navratri Collection
                </span>
                <span
                  aria-hidden
                  className="h-px w-9 bg-gradient-to-r from-gold/65 to-transparent"
                />
              </Link>
              <ul className="space-y-0 border-l border-gold/20 pl-3">
                {children.map((child) => (
                  <li key={child.slug}>
                    <NavCategoryLink
                      category={child}
                      onNavigate={onNavigate}
                      pathname={pathname}
                      nested
                    />
                  </li>
                ))}
              </ul>
            </li>
          )
        }

        return (
          <li key={category.slug}>
            <NavCategoryLink
              category={category}
              onNavigate={onNavigate}
              pathname={pathname}
            />
            {children.length > 0 ? (
              <ul className="mt-0.5 space-y-0 border-l border-border/40 pl-3">
                {children.map((child) => (
                  <li key={child.slug}>
                    <NavCategoryLink
                      category={child}
                      onNavigate={onNavigate}
                      pathname={pathname}
                      nested
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function GroupHeading({
  group,
  onNavigate,
  pathname,
}: {
  group: CategoryGroup
  onNavigate?: () => void
  pathname: string | null
}) {
  const href = `/collections/${group.slug}`
  const active = isActiveHref(pathname, href)

  return (
    <div className="space-y-2">
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'inline-block font-serif text-[0.9375rem] uppercase tracking-[0.14em] text-wine/90 transition-colors duration-150 hover:text-primary md:text-[1rem]',
          active && 'text-primary',
        )}
      >
        {group.name}
      </Link>
      <span
        aria-hidden
        className="block h-px w-11 bg-gradient-to-r from-gold/60 via-gold/25 to-transparent"
      />
    </div>
  )
}

export function CategoriesMegaMenu({
  products: productsProp,
}: {
  products?: Pick<Product, 'slug' | 'image' | 'images' | 'category' | 'collections'>[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const products = useMemo(
    () => (productsProp && productsProp.length > 0 ? productsProp : getStorefrontProducts()),
    [productsProp],
  )
  const visibleGroups = useMemo(() => getVisibleNavCategoryGroups(products as Product[]), [products])
  const primaryGroup = visibleGroups.find((group) => group.primary) ?? visibleGroups[0]
  const secondaryGroups = visibleGroups.filter((group) => group.slug !== primaryGroup?.slug)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }, [clearCloseTimer])

  const openMenu = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const closeMenu = useCallback(() => {
    clearCloseTimer()
    setOpen(false)
  }, [clearCloseTimer])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      clearCloseTimer()
    }
  }, [closeMenu, clearCloseTimer])

  if (!primaryGroup) return null

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group relative inline-flex items-center gap-1.5 text-nav transition-colors duration-150 hover:text-primary',
          open ? 'text-primary' : 'text-foreground',
        )}
      >
        Categories
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        <span
          className={cn(
            'absolute -bottom-1 left-0 h-px bg-accent transition-all duration-200',
            open ? 'w-full' : 'w-0 group-hover:w-full',
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="categories-mega-menu"
            role="navigation"
            aria-label="Product categories"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute left-1/2 top-full z-40 mt-3 -translate-x-1/2',
              'w-max max-w-[min(94vw,60rem)]',
              'rounded-md border border-border/40 bg-ivory/98',
              'shadow-[0_18px_40px_-22px_rgba(40,28,24,0.28)]',
              'backdrop-blur-sm lg:z-[49]',
            )}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="max-h-[min(78vh,36rem)] overflow-y-auto overscroll-contain px-5 py-5 md:px-6 md:py-5">
              <div className="flex flex-col gap-7 md:flex-row md:items-start md:gap-9 lg:gap-11">
                <div className="min-w-[11rem] shrink-0 space-y-3 border-border/30 md:border-r md:pr-8">
                  <GroupHeading
                    group={primaryGroup}
                    onNavigate={closeMenu}
                    pathname={pathname}
                  />
                  <CategoryLinks
                    categories={primaryGroup.categories}
                    onNavigate={closeMenu}
                    pathname={pathname}
                  />
                </div>

                {secondaryGroups.map((group) => {
                  const isFestive = group.slug === 'festive-edition'
                  return (
                    <div
                      key={group.slug}
                      className={cn(
                        'shrink-0 space-y-3',
                        isFestive
                          ? 'min-w-[14rem] max-w-[24rem]'
                          : 'min-w-[12rem] max-w-[18rem]',
                      )}
                    >
                      <GroupHeading
                        group={group}
                        onNavigate={closeMenu}
                        pathname={pathname}
                      />
                      <CategoryLinks
                        categories={group.categories}
                        onNavigate={closeMenu}
                        pathname={pathname}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function CategoriesMobileAccordion({
  onNavigate,
  products: productsProp,
}: {
  onNavigate?: () => void
  products?: Pick<Product, 'slug' | 'image' | 'images' | 'category' | 'collections'>[]
}) {
  const products = useMemo(
    () => (productsProp && productsProp.length > 0 ? (productsProp as Product[]) : getStorefrontProducts()),
    [productsProp],
  )
  const visibleGroups = useMemo(() => getVisibleNavCategoryGroups(products), [products])
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(visibleGroups[0]?.slug ?? null)

  const handleNavigate = () => {
    setExpanded(false)
    onNavigate?.()
  }

  if (visibleGroups.length === 0) return null

  return (
    <li className="border-b border-border/40">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between py-3.5 text-nav text-foreground transition-colors hover:text-primary"
      >
        Categories
        <ChevronDown
          className={cn('size-4 transition-transform duration-300', expanded && 'rotate-180')}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="mobile-categories"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-4 pl-1">
              {visibleGroups.map((group) => {
                const isOpen = openGroup === group.slug
                const isPrimary = group.primary

                return (
                  <div key={group.slug} className="border-t border-border/25 first:border-t-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenGroup(isOpen ? null : group.slug)}
                      className={cn(
                        'flex w-full items-center justify-between py-3 text-left font-serif uppercase tracking-[0.12em] transition-colors hover:text-primary',
                        isPrimary
                          ? 'text-[0.9375rem] font-medium text-wine'
                          : 'text-sm font-normal text-wine/90',
                      )}
                    >
                      {group.name}
                      <ChevronDown
                        className={cn(
                          'size-3.5 shrink-0 transition-transform duration-300',
                          isOpen && 'rotate-180',
                        )}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.ul
                          key={`${group.slug}-list`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-2 overflow-hidden pb-3 pl-1"
                        >
                          <li className="pb-1">
                            <Link
                              href={`/collections/${group.slug}`}
                              onClick={handleNavigate}
                              className="font-sans text-[0.6875rem] uppercase tracking-[0.18em] text-gold transition-colors hover:text-primary"
                            >
                              All {group.name.toLowerCase()}
                            </Link>
                          </li>
                          {group.categories.map((category) => {
                            const children = getVisibleNavChildCategories(
                              category.slug,
                              products,
                            )
                            const isNavratri = category.slug === NAVRATRI_SLUG

                            if (isNavratri && children.length > 0) {
                              return (
                                <li key={category.slug} className="space-y-2.5 pt-1">
                                  <Link
                                    href={`/collections/${category.slug}`}
                                    onClick={handleNavigate}
                                    className="inline-flex flex-col gap-1.5"
                                  >
                                    <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-wine/80">
                                      Navratri Collection
                                    </span>
                                    <span
                                      aria-hidden
                                      className="h-px w-8 bg-gradient-to-r from-gold/70 to-transparent"
                                    />
                                  </Link>
                                  <ul className="space-y-2 border-l border-gold/25 pl-3">
                                    {children.map((child) => (
                                      <li key={child.slug} className="min-w-0">
                                        <NavCategoryLink
                                          category={child}
                                          onNavigate={handleNavigate}
                                          pathname={pathname}
                                          nested
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              )
                            }

                            return (
                              <li key={category.slug} className="min-w-0">
                                <NavCategoryLink
                                  category={category}
                                  onNavigate={handleNavigate}
                                  pathname={pathname}
                                />
                                {children.length > 0 ? (
                                  <ul className="mt-1.5 space-y-1.5 border-l border-border/40 pl-3">
                                    {children.map((child) => (
                                      <li key={child.slug} className="min-w-0">
                                        <NavCategoryLink
                                          category={child}
                                          onNavigate={handleNavigate}
                                          pathname={pathname}
                                          nested
                                        />
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            )
                          })}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}
