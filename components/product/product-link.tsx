'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import { rememberBrowseContext } from '@/lib/navigation-return'

type ProductLinkProps = ComponentProps<typeof Link>

/** Product link that remembers the current collection/shop context for Back. */
export function ProductLink({ onClick, ...props }: ProductLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    rememberBrowseContext()
    onClick?.(event)
  }

  return <Link {...props} onClick={handleClick} />
}
