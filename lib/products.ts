import { categoryNames } from '@/lib/categories'

export type Product = {
  slug: string
  name: string
  price: number
  originalPrice?: number
  image: string
  images: string[]
  category: string
  collections: string[]
  fabric: string
  weave: string
  length: string
  blouse: string
  care: string
  availability: 'In Stock' | 'Low Stock' | 'Made to Order'
  isNew?: boolean
  description: string
}

export const products: Product[] = [
  {
    slug: 'handwoven-silk-saree',
    name: 'Handwoven Silk Saree',
    price: 12999,
    originalPrice: 15999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740183/10.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740183/10.png'],
    category: 'Silk',
    collections: ['silk-sarees', 'new-arrivals'],
    fabric: 'Pure Mulberry Silk',
    weave: 'Handwoven',
    length: '5.5 metres + 0.8 m blouse',
    blouse: 'Unstitched blouse piece included',
    care: 'Dry clean only. Store wrapped in muslin cloth.',
    availability: 'In Stock',
    isNew: true,
    description:
      'A luminous handwoven silk saree with a fine gold zari border, crafted on traditional pit looms. Its fluid drape and understated sheen make it a timeless addition to any wardrobe.',
  },
  {
    slug: 'banarasi-heritage-saree',
    name: 'Banarasi Heritage Saree',
    price: 22499,
    originalPrice: 26999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740183/9.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740183/9.png'],
    category: 'Banarasi',
    collections: ['banarasi-sarees', 'wedding-collection'],
    fabric: 'Katan Silk',
    weave: 'Handwoven Banarasi Brocade',
    length: '5.5 metres + 0.8 m blouse',
    blouse: 'Matching brocade blouse piece included',
    care: 'Dry clean only. Avoid direct sunlight.',
    availability: 'Low Stock',
    isNew: true,
    description:
      'An opulent Banarasi saree woven with intricate all-over gold brocade zari. Each piece takes weeks to weave, carrying the legacy of Varanasi master craftsmen.',
  },
  {
    slug: 'elegant-kanjeevaram-saree',
    name: 'Elegant Kanjeevaram Saree',
    price: 18999,
    originalPrice: 21999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/6.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/6.png'],
    category: 'Silk',
    collections: ['silk-sarees', 'wedding-collection', 'festive-collection'],
    fabric: 'Pure Kanjeevaram Silk',
    weave: 'Handwoven with contrast border',
    length: '6.0 metres + 0.8 m blouse',
    blouse: 'Contrast blouse piece included',
    care: 'Dry clean only. Store flat, refold periodically.',
    availability: 'In Stock',
    description:
      'A regal Kanjeevaram saree with a lustrous mustard-gold body and a deep maroon temple border. A South Indian classic reserved for the most cherished occasions.',
  },
  {
    slug: 'soft-cotton-handloom-saree',
    name: 'Soft Cotton Handloom Saree',
    price: 5499,
    originalPrice: 6999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/4.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740182/4.png'],
    category: 'Cotton',
    collections: ['cotton-handloom', 'new-arrivals'],
    fabric: 'Handspun Cotton',
    weave: 'Handloom',
    length: '5.5 metres + 0.8 m blouse',
    blouse: 'Unstitched blouse piece included',
    care: 'Gentle hand wash in cold water. Line dry in shade.',
    availability: 'In Stock',
    isNew: true,
    description:
      'A breathable handspun cotton saree in natural undyed tones with a subtle woven border. Effortless everyday elegance for the modern woman.',
  },
  {
    slug: 'traditional-chanderi-saree',
    name: 'Traditional Chanderi Saree',
    price: 7999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/5.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/5.png'],
    category: 'Chanderi',
    collections: ['cotton-handloom', 'festive-collection'],
    fabric: 'Chanderi Silk-Cotton',
    weave: 'Handwoven with buti motifs',
    length: '5.5 metres + 0.8 m blouse',
    blouse: 'Unstitched blouse piece included',
    care: 'Dry clean recommended.',
    availability: 'Made to Order',
    description:
      'A feather-light Chanderi saree in soft blush pink, scattered with delicate gold buti motifs. Sheer, graceful and beautifully translucent.',
  },
  {
    slug: 'festive-silk-collection-saree',
    name: 'Festive Silk Collection Saree',
    price: 16499,
    originalPrice: 19999,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/3.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/3.png'],
    category: 'Silk',
    collections: ['silk-sarees', 'festive-collection', 'new-arrivals'],
    fabric: 'Pure Silk',
    weave: 'Handwoven with zari pallu',
    length: '5.5 metres + 0.8 m blouse',
    blouse: 'Matching blouse piece included',
    care: 'Dry clean only.',
    availability: 'In Stock',
    isNew: true,
    description:
      'A celebratory emerald silk saree with an opulent gold zari pallu. Rich, radiant and made for festivities and milestone moments.',
  },
  {
    slug: 'product-7',
    name: 'Product 7 — Details Coming Soon',
    // PLACEHOLDER: replace with real price (do not use as sale price)
    price: 0,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/8.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/8.png'],
    category: 'Saree',
    collections: ['new-arrivals'],
    fabric: 'PLACEHOLDER',
    weave: 'PLACEHOLDER',
    length: 'PLACEHOLDER',
    blouse: 'PLACEHOLDER',
    care: 'PLACEHOLDER',
    availability: 'In Stock',
    isNew: true,
    description: 'PLACEHOLDER — product details coming soon.',
  },
  {
    slug: 'product-8',
    name: 'Product 8 — Details Coming Soon',
    // PLACEHOLDER: replace with real price (do not use as sale price)
    price: 0,
    image: 'https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/2.png',
    images: ['https://res.cloudinary.com/tcjtyr02/image/upload/v1787740181/2.png'],
    category: 'Saree',
    collections: ['new-arrivals'],
    fabric: 'PLACEHOLDER',
    weave: 'PLACEHOLDER',
    length: 'PLACEHOLDER',
    blouse: 'PLACEHOLDER',
    care: 'PLACEHOLDER',
    availability: 'In Stock',
    isNew: true,
    description: 'PLACEHOLDER — product details coming soon.',
  },
  {
    slug: 'masterpiece-embroidery-pure-cotton-kota-handloom-saree',
    name: 'Masterpiece Embroidery Pure Cotton Kota Handloom Saree',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916349/WhatsApp_Image_2026-08-28_at_4.03.22_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916349/WhatsApp_Image_2026-08-28_at_4.03.22_PM.jpg',
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916348/WhatsApp_Image_2026-08-28_at_4.03.21_PM.jpg',
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916348/WhatsApp_Image_2026-08-28_at_4.03.21_PM_2.jpg',
    ],
    category: 'Kota',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'masterpiece-embroidery-kota-handloom-saree-sky-blue-floral',
    name: 'Masterpiece Embroidery Pure Cotton Kota Handloom Saree — Sky Blue Floral',
    price: 4700,
    originalPrice: 5400,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.21_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.21_PM_1.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection', 'new-arrivals'],
    fabric: 'Pure Cotton Kota Handloom',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description:
      'Masterpiece embroidery pure cotton Kota handloom saree featuring elegant floral embroidery and a lightweight breathable weave. Perfect for festive occasions, office wear, and elegant everyday styling.',
  },
  {
    slug: 'masterpiece-embroidery-kota-handloom-saree-beige-floral',
    name: 'Masterpiece Embroidery Pure Cotton Kota Handloom Saree — Beige Floral',
    price: 4700,
    originalPrice: 5400,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.20_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.20_PM.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection', 'new-arrivals'],
    fabric: 'Pure Cotton Kota Handloom',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description:
      'Elegant beige Kota handloom saree with intricate embroidery, soft cotton texture, and timeless handcrafted detailing.',
  },
  {
    slug: 'masterpiece-embroidery-kota-handloom-saree-lavender-floral',
    name: 'Masterpiece Embroidery Pure Cotton Kota Handloom Saree — Lavender Floral',
    price: 4700,
    originalPrice: 5400,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.20_PM_2.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916347/WhatsApp_Image_2026-08-28_at_4.03.20_PM_2.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection', 'new-arrivals'],
    fabric: 'Pure Cotton Kota Handloom',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description:
      'Soft lavender pure cotton Kota handloom saree with premium floral embroidery and lightweight festive drape.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-01',
    name: 'Kota Handloom Saree — New Collection 01',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916346/WhatsApp_Image_2026-08-28_at_4.03.20_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916346/WhatsApp_Image_2026-08-28_at_4.03.20_PM_1.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-02',
    name: 'Kota Handloom Saree — New Collection 02',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916346/WhatsApp_Image_2026-08-28_at_4.03.19_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916346/WhatsApp_Image_2026-08-28_at_4.03.19_PM.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-03',
    name: 'Kota Handloom Saree — New Collection 03',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916345/WhatsApp_Image_2026-08-28_at_4.03.19_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916345/WhatsApp_Image_2026-08-28_at_4.03.19_PM_1.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-04',
    name: 'Kota Handloom Saree — New Collection 04',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916345/WhatsApp_Image_2026-08-28_at_4.03.19_PM_2.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916345/WhatsApp_Image_2026-08-28_at_4.03.19_PM_2.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-05',
    name: 'Kota Handloom Saree — New Collection 05',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916344/WhatsApp_Image_2026-08-28_at_4.03.18_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916344/WhatsApp_Image_2026-08-28_at_4.03.18_PM.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'kota-handloom-saree-new-collection-06',
    name: 'Kota Handloom Saree — New Collection 06',
    price: 4700,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916344/WhatsApp_Image_2026-08-28_at_4.03.18_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916344/WhatsApp_Image_2026-08-28_at_4.03.18_PM_1.jpg',
    ],
    category: 'Kota Handloom',
    collections: ['kota-collection'],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: 'With Blouse',
    care: '—',
    availability: 'In Stock',
    isNew: true,
    description: 'With Blouse. Free Shipping.',
  },
  {
    slug: 'digital-print-saree-01',
    name: 'Digital Print Saree 01',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916480/WhatsApp_Image_2026-08-28_at_4.02.45_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916480/WhatsApp_Image_2026-08-28_at_4.02.45_PM.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-02',
    name: 'Digital Print Saree 02',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916480/WhatsApp_Image_2026-08-28_at_4.02.44_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916480/WhatsApp_Image_2026-08-28_at_4.02.44_PM.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-03',
    name: 'Digital Print Saree 03',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916479/WhatsApp_Image_2026-08-28_at_4.02.44_PM_2.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916479/WhatsApp_Image_2026-08-28_at_4.02.44_PM_2.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-04',
    name: 'Digital Print Saree 04',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916478/WhatsApp_Image_2026-08-28_at_4.02.44_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916478/WhatsApp_Image_2026-08-28_at_4.02.44_PM_1.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-05',
    name: 'Digital Print Saree 05',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916477/WhatsApp_Image_2026-08-28_at_4.02.43_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916477/WhatsApp_Image_2026-08-28_at_4.02.43_PM.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-06',
    name: 'Digital Print Saree 06',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916476/WhatsApp_Image_2026-08-28_at_4.02.43_PM_2.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916476/WhatsApp_Image_2026-08-28_at_4.02.43_PM_2.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-07',
    name: 'Digital Print Saree 07',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916475/WhatsApp_Image_2026-08-28_at_4.02.43_PM_1.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916475/WhatsApp_Image_2026-08-28_at_4.02.43_PM_1.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-08',
    name: 'Digital Print Saree 08',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916474/WhatsApp_Image_2026-08-28_at_4.02.42_PM.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916474/WhatsApp_Image_2026-08-28_at_4.02.42_PM.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
  {
    slug: 'digital-print-saree-09',
    name: 'Digital Print Saree 09',
    // PLACEHOLDER: replace with real price when provided
    price: 0,
    image:
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916473/WhatsApp_Image_2026-08-28_at_4.02.42_PM_2.jpg',
    images: [
      'https://res.cloudinary.com/tcjtyr02/image/upload/v1787916473/WhatsApp_Image_2026-08-28_at_4.02.42_PM_2.jpg',
    ],
    category: 'Digital Print',
    collections: [],
    fabric: '—',
    weave: '—',
    length: '—',
    blouse: '—',
    care: '—',
    availability: 'In Stock',
    description: 'Details coming soon.',
  },
]

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const current = getProduct(slug)
  if (!current) return products.slice(0, limit)
  return products
    .filter((p) => p.slug !== slug && p.collections.some((c) => current.collections.includes(c)))
    .slice(0, limit)
}

export const categories = categoryNames

export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
