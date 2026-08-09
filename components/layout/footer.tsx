import Link from 'next/link'
import { Camera, Globe, Video, Mail, Phone, MapPin } from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const customerCare = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'FAQs', href: '/faqs' },
]

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Camera },
  { label: 'Facebook', href: 'https://facebook.com', icon: Globe },
  { label: 'YouTube', href: 'https://youtube.com', icon: Video },
]

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <div className="flex flex-col leading-none">
              <span className="font-serif text-2xl font-semibold text-ivory">Sambhavi</span>
              <span className="text-xs uppercase tracking-luxe text-accent">Handloom</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ivory/70">
              Celebrating the beauty of Indian handloom — one thoughtfully woven saree at a time.
            </p>
            <div className="mt-2 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors hover:border-accent hover:text-accent"
                >
                  <s.icon className="size-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* quick links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg text-ivory">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* customer care */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg text-ivory">Customer Care</h3>
            <ul className="flex flex-col gap-2.5">
              {customerCare.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg text-ivory">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm text-ivory/70">
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
                <a href="mailto:care@sambhavihandloom.com" className="hover:text-accent">
                  care@sambhavihandloom.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-accent" strokeWidth={1.5} />
                <a href="tel:+919000000000" className="hover:text-accent">
                  +91 90000 00000
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.5} />
                <span>Weavers&apos; Lane, Kanchipuram, Tamil Nadu 631501, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ivory/15 pt-8 sm:flex-row">
          <p className="text-xs text-ivory/50">
            &copy; {new Date().getFullYear()} Sambhavi Handloom. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-wide text-ivory/50">
            <span className="rounded-sm border border-ivory/20 px-2 py-1">Visa</span>
            <span className="rounded-sm border border-ivory/20 px-2 py-1">Mastercard</span>
            <span className="rounded-sm border border-ivory/20 px-2 py-1">UPI</span>
            <span className="rounded-sm border border-ivory/20 px-2 py-1">Rupay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
