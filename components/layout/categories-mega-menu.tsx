'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  categoryGroups,
  primaryCategoryGroup,
  secondaryCategoryGroups,
  type CategoryGroup,
  type SareeCategory,
} from '@/lib/categories'

function CategoryLinks({
  categories,
  onNavigate,
  className,
}: {
  categories: SareeCategory[]
  onNavigate?: () => void
  className?: string
}) {
  return (
    <ul className={cn('flex flex-col gap-2.5', className)}>
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/collections/${category.slug}`}
            onClick={onNavigate}
            className={cn(
              'font-sans leading-snug tracking-nav transition-colors duration-300 hover:text-primary',
              category.prominent
                ? 'text-[0.9375rem] font-medium text-foreground/90'
                : 'text-[0.9375rem] font-normal text-muted-foreground',
            )}
          >
            {category.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function GroupHeading({
  group,
  onNavigate,
  variant = 'default',
}: {
  group: CategoryGroup
  onNavigate?: () => void
  variant?: 'primary' | 'default'
}) {
  return (
    <Link
      href={`/collections/${group.slug}`}
      onClick={onNavigate}
      className={cn(
        'font-serif uppercase transition-colors duration-300 hover:text-primary',
        variant === 'primary' &&
          'text-2xl tracking-[0.12em] text-primary md:text-[1.75rem]',
        variant === 'default' &&
          'text-base tracking-[0.14em] text-foreground/85 md:text-lg',
      )}
    >
      {group.name}
    </Link>
  )
}

export function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const primaryGroup = primaryCategoryGroup!

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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-[4.5rem] z-40 border-b border-border/30 bg-ivory/98 shadow-[0_24px_48px_-24px_rgba(40,28,24,0.18)] backdrop-blur-sm md:top-[5.625rem] lg:z-[49]"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <div className="mx-auto max-h-[min(78vh,720px)] max-w-7xl overflow-y-auto px-6 py-10 md:px-8 md:py-12">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))] lg:gap-x-10 xl:gap-x-12">
                <div className="space-y-5 border-border/40 lg:border-r lg:pr-10">
                  <GroupHeading group={primaryGroup} onNavigate={closeMenu} variant="primary" />
                  <CategoryLinks
                    categories={primaryGroup.categories}
                    onNavigate={closeMenu}
                    className="sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2.5"
                  />
                </div>

                {secondaryCategoryGroups.map((group) => (
                  <div key={group.slug} className="space-y-4">
                    <GroupHeading group={group} onNavigate={closeMenu} />
                    <CategoryLinks categories={group.categories} onNavigate={closeMenu} />
                  </div>
                ))}
              </div>

              <div className="mt-10 flex justify-end border-t border-border/25 pt-6">
                <Link
                  href="/collections"
                  onClick={closeMenu}
                  className="font-sans text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:text-primary"
                >
                  View all categories
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function CategoriesMobileAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(primaryCategoryGroup?.slug ?? null)

  const handleNavigate = () => {
    setExpanded(false)
    onNavigate?.()
  }

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
              {categoryGroups.map((group) => {
                const isOpen = openGroup === group.slug
                const isPrimary = group.primary

                return (
                  <div key={group.slug} className="border-t border-border/25 first:border-t-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenGroup(isOpen ? null : group.slug)}
                      className={cn(
                        'flex w-full items-center justify-between py-3 text-left font-serif uppercase tracking-[0.1em] transition-colors hover:text-primary',
                        isPrimary ? 'text-[0.9375rem] font-medium text-primary' : 'text-sm font-normal text-foreground/85',
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
                          className="space-y-2.5 overflow-hidden pb-3 pl-2"
                        >
                          <li>
                            <Link
                              href={`/collections/${group.slug}`}
                              onClick={handleNavigate}
                              className="font-sans text-xs uppercase tracking-[0.14em] text-accent transition-colors hover:text-primary"
                            >
                              All {group.name.toLowerCase()}
                            </Link>
                          </li>
                          {group.categories.map((category) => (
                            <li key={category.slug}>
                              <Link
                                href={`/collections/${category.slug}`}
                                onClick={handleNavigate}
                                className={cn(
                                  'font-sans leading-snug tracking-nav transition-colors hover:text-primary',
                                  category.prominent
                                    ? 'text-[0.9375rem] font-medium text-foreground/90'
                                    : 'text-[0.9375rem] font-normal text-muted-foreground',
                                )}
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
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
