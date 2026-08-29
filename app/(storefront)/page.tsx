import { Hero } from '@/components/home/hero'
import { WhyChoose } from '@/components/home/why-choose'
import { FeaturedCollection } from '@/components/home/featured-collection'
import { BrandStory } from '@/components/home/brand-story'
import { Editorial } from '@/components/home/editorial'
import { NewArrivals } from '@/components/home/new-arrivals'
import { Reels } from '@/components/home/reels'
import { Testimonials } from '@/components/home/testimonials'
import { InstagramFeed } from '@/components/home/instagram-feed'
import { Newsletter } from '@/components/home/newsletter'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChoose />
      <FeaturedCollection />
      <BrandStory />
      <Editorial />
      <NewArrivals />
      <Reels />
      <Testimonials />
      <InstagramFeed />
      <Newsletter />
    </>
  )
}
