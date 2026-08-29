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
  { label: 'Collections', href: '/collections' },
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
