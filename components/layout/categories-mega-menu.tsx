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

function CategoryLinkLabel({
  category,
  active = false,
  compact = false,
}: {
  category: SareeCategory
  active?: boolean
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        'font-sans leading-snug tracking-[0.03em] transition-colors duration-200',
        compact ? 'text-[0.875rem]' : 'text-[0.9375rem]',
        category.prominent
          ? 'font-medium text-charcoal/90'
          : 'font-normal text-charcoal/70',
        active && 'text-primary',
      )}
    >
      {category.name}
    </span>
  )
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

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/link relative flex min-w-0 items-start gap-2.5 py-1 transition-transform duration-200 ease-out',
        'hover:translate-x-1',
        nested && 'pl-0.5',
        active && 'translate-x-1',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-[0.55rem] h-px w-0 shrink-0 bg-gold/80 transition-all duration-200',
          'group-hover/link:w-3',
          active && 'w-3 bg-primary',
        )}
      />
      <CategoryLinkLabel
        category={category}
        active={active}
        compact={nested}
      />
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
    <ul className={cn('flex flex-col gap-1', className)}>
      {categories.map((category) => {
        const children = getVisibleNavChildCategories(category.slug, products)
        const isNavratri = category.slug === NAVRATRI_SLUG

        if (isNavratri && children.length > 0) {
          return (
            <li key={category.slug} className="mt-1 space-y-3 pt-1">
              <div className="space-y-2.5">
                <Link
                  href={`/collections/${category.slug}`}
                  onClick={onNavigate}
                  aria-current={
                    isActiveHref(pathname, `/collections/${category.slug}`)
                      ? 'page'
                      : undefined
                  }
                  className="group/navratri inline-flex flex-col gap-2"
                >
                  <span
                    className={cn(
                      'font-sans text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-wine/75 transition-colors duration-200',
                      'group-hover/navratri:text-primary',
                      isActiveHref(pathname, `/collections/${category.slug}`) &&
                        'text-primary',
                    )}
                  >
                    Navratri Collection
                  </span>
                  <span
                    aria-hidden
                    className="h-px w-10 bg-gradient-to-r from-gold/70 to-transparent"
                  />
                </Link>
              </div>
              <ul className="space-y-1.5 border-l border-gold/25 pl-3.5">
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
              <ul className="mt-1.5 space-y-1 border-l border-border/45 pl-3.5">
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
  variant = 'default',
  pathname,
}: {
  group: CategoryGroup
  onNavigate?: () => void
  variant?: 'primary' | 'default'
  pathname: string | null
}) {
  const href = `/collections/${group.slug}`
  const active = isActiveHref(pathname, href)

  return (
    <div className="space-y-3">
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'inline-block font-serif uppercase transition-colors duration-200 hover:text-primary',
          variant === 'primary' &&
            'text-[1.35rem] tracking-[0.14em] text-wine md:text-[1.5rem]',
          variant === 'default' &&
            'text-[1.05rem] tracking-[0.16em] text-wine/90 md:text-[1.15rem]',
          active && 'text-primary',
        )}
      >
        {group.name}
      </Link>
      <span
        aria-hidden
        className={cn(
          'block h-px bg-gradient-to-r from-gold/55 via-gold/20 to-transparent',
          variant === 'primary' ? 'w-16' : 'w-12',
        )}
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
        className="group relative inline-flex items-center gap-1.5 text-nav text-foreground transition-colors hover:text-primary"
      >
        Categories
        <ChevronDown
          className={cn(
            'size-3.5 transition-transform duration-300',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
        <span
          className={cn(
            'absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300',
            open ? 'w-full' : 'w-0 group-hover:w-full',
          )}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="categories-mega-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-40 mt-2 w-max max-w-[min(96vw,72rem)] -translate-x-1/2 rounded-sm border border-border/30 bg-ivory/98 shadow-[0_24px_48px_-24px_rgba(40,28,24,0.18)] backdrop-blur-sm lg:z-[49]"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="max-h-[85vh] overflow-y-auto overscroll-contain px-6 py-6 md:px-7 md:py-7">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
                <div className="shrink-0 space-y-4 border-border/35 lg:border-r lg:pr-9">
                  <GroupHeading
                    group={primaryGroup}
                    onNavigate={closeMenu}
                    variant="primary"
                    pathname={pathname}
                  />
                  <CategoryLinks
                    categories={primaryGroup.categories}
                    onNavigate={closeMenu}
                    pathname={pathname}
                    className="sm:grid sm:grid-cols-2 sm:items-start sm:gap-x-8 sm:gap-y-0.5"
                  />
                </div>

                {secondaryGroups.map((group) => (
                  <div key={group.slug} className="w-max max-w-[22rem] shrink-0 space-y-3.5">
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
                ))}
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
