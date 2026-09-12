export type Collection = {
  slug: string
  name: string
  description: string
  image: string
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
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1787822226/2.mp4',
    caption: 'Elegance in every weave.',
    productSlug: 'handwoven-silk-saree',
  },
  {
    poster: '/images/reel-2.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1787822223/3.mp4',
    caption: 'Your festive drape, reimagined.',
    productSlug: 'festive-silk-collection-saree',
  },
  {
    poster: '/images/reel-3.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1787822223/1.mp4',
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
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** Official Sambhavi Handloom brand mark */
export const BRAND_LOGO_URL =
  'https://res.cloudinary.com/tcjtyr02/image/upload/v1787571350/logo.jpg'

/** Public storefront contact details (source of truth for footer / contact page). */
export const contactDetails = {
  email: 'customerconnect@sambhaviheritagereimagined.com',
  phoneDisplay: '+91 77888 47279',
  phoneTel: '+917788847279',
  address:
    'Plot No. 529, Sector K-8, Kalinga Nagar, Ghatikia, Bhubaneswar, India, 751003',
  addressLines: [
    'Plot No. 529, Sector K-8, Kalinga Nagar',
    'Ghatikia, Bhubaneswar, India, 751003',
  ],
} as const

export type HeroSlide = {
  image: string
  /** Optional full-bleed background video (Cloudinary mp4). When set, replaces image on capable clients. */
  video?: string
  alt: string
  eyebrow: string
  headline: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  /** CSS object-position for responsive crop */
  objectPosition?: string
}

/** Homepage hero carousel — real project imagery only */
export const heroSlides: HeroSlide[] = [
  {
    image: '/images/hero-saree.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1789201988/2wt.mp4',
    alt: 'Sambhavi Handloom festive fashion film',
    eyebrow: 'Sambhavi Handloom',
    headline: 'Timeless Handloom.\nModern Elegance.',
    description:
      'Discover beautifully crafted sarees that celebrate Indian heritage, artistry and effortless elegance.',
    primaryLabel: 'Shop Sarees',
    primaryHref: '/shop',
    secondaryLabel: 'Explore Navratri',
    secondaryHref: '/collections/navratri-collection',
    objectPosition: 'center center',
  },
  {
    image: '/images/editorial-drape.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1789201983/3wt.mp4',
    alt: 'Sambhavi Handloom saree edit fashion film',
    eyebrow: 'The Saree Edit',
    headline: 'Timeless Sarees',
    description:
      'Timeless weaves, refined details, and effortless elegance — crafted for every occasion.',
    primaryLabel: 'Shop Sarees',
    primaryHref: '/shop',
    secondaryLabel: 'View Collection',
    secondaryHref: '/collections/handloom-powerloom',
    objectPosition: 'center center',
  },
  {
    image: '/images/artisan-weaving.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1789201981/1wt.mp4',
    alt: 'Sambhavi Handloom lehenga edit fashion film',
    eyebrow: 'The Lehenga Edit',
    headline: 'Grace in Every Twirl',
    description:
      'Statement silhouettes, intricate details and timeless Indian craftsmanship — made for moments that deserve to be remembered.',
    primaryLabel: 'Shop Lehengas',
    primaryHref: '/collections/lehenga-choli',
    secondaryLabel: 'View Collection',
    secondaryHref: '/collections/lehanga',
    objectPosition: 'center center',
  },
  {
    image: '/images/hero-saree.png',
    video: 'https://res.cloudinary.com/tcjtyr02/video/upload/v1789201983/4wt.mp4',
    alt: 'Sambhavi Handloom Navratri special fashion film',
    eyebrow: 'Navratri Special',
    headline: 'Celebrate Every Twirl',
    description:
      'Festive colours, graceful silhouettes and timeless craftsmanship — made for the spirit of Navratri.',
    primaryLabel: 'Shop Navratri',
    primaryHref: '/collections/navratri-collection',
    secondaryLabel: 'Explore Collection',
    secondaryHref: '/collections/chhabili',
    objectPosition: 'center center',
  },
]

export type EditorialSlide = {
  image: string
  alt: string
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
  objectPosition?: string
}

/** Split-screen editorial carousel — imagery distinct from hero carousel */
export const editorialSlides: EditorialSlide[] = [
  {
    image: '/images/reel-1.png',
    alt: 'Elegant handloom saree drape in soft natural light',
    eyebrow: 'Handwoven Stories',
    headline: 'Crafted With Patience',
    description:
      'Every thread carries a story. Every weave reflects generations of craftsmanship and quiet devotion.',
    ctaLabel: 'Shop the Look',
    ctaHref: '/shop',
    objectPosition: 'center center',
  },
  {
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/6.png',
    alt: 'Elegant Kanjeevaram silk saree with contrast border',
    eyebrow: 'Timeless Craft',
    headline: 'Woven For Generations',
    description:
      'Rooted in Indian heritage, designed for the modern woman — regal Kanjeevaram silks with enduring grace.',
    ctaLabel: 'Explore Kanjeevaram',
    ctaHref: '/product/elegant-kanjeevaram-saree',
    objectPosition: 'center 22%',
  },
  {
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/5.png',
    alt: 'Traditional Chanderi saree with delicate gold buti motifs',
    eyebrow: 'Chanderi Collection',
    headline: 'Featherlight Grace',
    description:
      'Sheer, translucent Chanderi weaves scattered with delicate motifs — effortless elegance for every occasion.',
    ctaLabel: 'Shop Chanderi',
    ctaHref: '/product/traditional-chanderi-saree',
    objectPosition: 'center 20%',
  },
  {
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/3.png',
    alt: 'Festive emerald silk saree with gold zari pallu',
    eyebrow: 'Festive Silk',
    headline: 'Made For Milestones',
    description:
      'Opulent silk sarees with radiant zari pallus — crafted for weddings, celebrations and cherished moments.',
    ctaLabel: 'Explore Collection',
    ctaHref: '/collections/festive-collection',
    objectPosition: 'center 25%',
  },
  {
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/4.png',
    alt: 'Soft cotton handloom saree in natural tones',
    eyebrow: 'Everyday Elegance',
    headline: 'Breathable Beauty',
    description:
      'Handspun cotton sarees in natural tones — understated everyday luxury woven for comfort and poise.',
    ctaLabel: 'Shop Cotton',
    ctaHref: '/product/soft-cotton-handloom-saree',
    objectPosition: 'center 30%',
  },
]
