import Image from 'next/image'
import { Camera } from 'lucide-react'
import { instagramPosts } from '@/lib/content'
import { SectionHeader } from '@/components/layout/section-header'
import { Reveal } from '@/components/motion/reveal'

export function InstagramFeed() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeader
          eyebrow="@sambhavihandlooms"
          title="Woven Into Everyday"
          subtitle="Follow along for styling notes, artisan stories and glimpses from our atelier."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
          {instagramPosts.map((post, i) => (
            <Reveal key={post.image} delay={i * 0.05}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-sm bg-secondary"
              >
                <Image
                  src={post.image || '/placeholder.svg'}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-background" aria-hidden="true" />
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
