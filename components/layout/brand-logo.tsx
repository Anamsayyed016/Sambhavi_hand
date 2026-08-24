import Image from 'next/image'
import { BRAND_LOGO_URL } from '@/lib/content'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  priority?: boolean
}

/**
 * Sambhavi brand mark. Vertical logo — height-driven, width auto, never stretched.
 */
export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_URL}
      alt="Sambhavi Handloom"
      width={160}
      height={200}
      priority={priority}
      className={cn('h-9 w-auto object-contain md:h-11', className)}
    />
  )
}
