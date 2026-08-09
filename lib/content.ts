export type Collection = {
  slug: string
  name: string
  description: string
  image: string
}

export const collections: Collection[] = [
  {
    slug: 'silk-sarees',
    name: 'Silk Sarees',
    description: 'Lustrous handwoven silks for timeless occasions.',
    image: '/images/product-silk.png',
  },
  {
    slug: 'banarasi-sarees',
    name: 'Banarasi Sarees',
    description: 'Opulent brocade weaves from Varanasi.',
    image: '/images/product-banarasi.png',
  },
  {
    slug: 'cotton-handloom',
    name: 'Cotton Handloom',
    description: 'Breathable everyday elegance.',
    image: '/images/product-cotton.png',
  },
  {
    slug: 'festive-collection',
    name: 'Festive Collection',
    description: 'Radiant drapes for celebrations.',
    image: '/images/product-festive.png',
  },
  {
    slug: 'wedding-collection',
    name: 'Wedding Collection',
    description: 'Heirloom sarees for once-in-a-lifetime moments.',
    image: '/images/collection-wedding.png',
  },
  {
    slug: 'new-arrivals',
    name: 'New Arrivals',
    description: 'The latest weaves to join our atelier.',
    image: '/images/product-kanjeevaram.png',
  },
]

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug)
}

export type Testimonial = {
  name: string
  location: string
  rating: number
  quote: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Ananya Menon',
    location: 'Bengaluru',
    rating: 5,
    quote:
      'The Banarasi saree I ordered is even more beautiful in person. The zari work is exquisite and the drape is heavenly. It felt like unwrapping an heirloom.',
  },
  {
    name: 'Rukmini Iyer',
    location: 'Chennai',
    rating: 5,
    quote:
      'Authentic Kanjeevaram at last. You can feel the craftsmanship in every thread. Sambhavi has become my go-to for every wedding in the family.',
  },
  {
    name: 'Sneha Kapoor',
    location: 'Mumbai',
    rating: 5,
    quote:
      'The cotton handloom sarees are so breathable and elegant for daily wear. Packaging was gorgeous and delivery was quick. Truly premium.',
  },
  {
    name: 'Devika Rao',
    location: 'Hyderabad',
    rating: 5,
    quote:
      'I love that they support traditional weavers. Every saree tells a story and the quality is unmatched. Highly recommend to every saree lover.',
  },
]

export type InstagramPost = {
  image: string
  caption: string
}

export const instagramPosts: InstagramPost[] = [
  { image: '/images/ig-1.png', caption: 'Sunlit mornings in soft handloom.' },
  { image: '/images/ig-2.png', caption: 'A palette of weaves.' },
  { image: '/images/ig-3.png', caption: 'Gold that never fades.' },
  { image: '/images/ig-4.png', caption: 'Wrapped with love.' },
  { image: '/images/product-kanjeevaram.png', caption: 'The regal Kanjeevaram.' },
  { image: '/images/product-chanderi.png', caption: 'Featherlight Chanderi.' },
]

export type Reel = {
  poster: string
  video?: string
  caption: string
  productSlug: string
}

export const reels: Reel[] = [
  {
    poster: '/images/reel-1.png',
    caption: 'Elegance in every weave.',
    productSlug: 'handwoven-silk-saree',
  },
  {
    poster: '/images/reel-2.png',
    caption: 'Your festive drape, reimagined.',
    productSlug: 'festive-silk-collection-saree',
  },
  {
    poster: '/images/reel-3.png',
    caption: 'Handloom stories.',
    productSlug: 'soft-cotton-handloom-saree',
  },
  {
    poster: '/images/reel-4.png',
    caption: 'Made for timeless moments.',
    productSlug: 'elegant-kanjeevaram-saree',
  },
]

export const whyPoints = [
  {
    title: 'Authentic Handloom',
    description: 'Crafted with traditional weaving techniques passed down through generations.',
  },
  {
    title: 'Premium Fabrics',
    description: 'Carefully selected fabrics chosen for lasting elegance and comfort.',
  },
  {
    title: 'Artisan Crafted',
    description: 'Every purchase directly supports skilled Indian craftsmanship.',
  },
  {
    title: 'Pan India Delivery',
    description: 'Beautiful handloom delivered safely to your doorstep, nationwide.',
  },
  {
    title: 'Secure Shopping',
    description: 'A safe, seamless and secure checkout experience, always.',
  },
]

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Sarees', href: '/shop' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Collections', href: '/collections' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]
