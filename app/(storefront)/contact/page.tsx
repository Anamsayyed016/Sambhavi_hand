import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { PageBanner } from '@/components/layout/page-banner'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Sambhavi Handloom for saree enquiries, styling advice, bulk and bridal orders, or any assistance you need.',
}

const details = [
  {
    icon: MapPin,
    title: 'Visit Our Atelier',
    lines: ['142 Weavers Lane, Silk Market', 'Kanchipuram, Tamil Nadu 631502'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: ['+91 98765 43210', 'Mon – Sat'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['care@sambhavihandloom.com', 'orders@sambhavihandloom.com'],
  },
  {
    icon: Clock,
    title: 'Store Hours',
    lines: ['Mon – Sat: 10am – 8pm', 'Sunday: 11am – 6pm'],
  },
]

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Get in Touch"
        subtitle="We'd love to hear from you — whether it's a styling question, a bridal enquiry or simply a hello."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* details */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-serif text-2xl text-foreground">Reach Us Directly</h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground text-pretty">
                Our team is here to help you find the perfect drape and answer any questions along
                the way.
              </p>
            </div>
            <ul className="flex flex-col gap-6">
              {details.map(({ icon: Icon, title, lines }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-foreground">{title}</h3>
                    {lines.map((line) => (
                      <p key={line} className="font-sans text-sm text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* form */}
          <div className="rounded-md border border-border bg-card p-6 md:p-10">
            <h2 className="mb-6 font-serif text-2xl text-foreground">Send Us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
