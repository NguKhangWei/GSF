import { useEffect, useRef, useState } from 'react'
import { Phone, Mail, MapPin, Briefcase, ChevronRight } from 'lucide-react'

function useRevealAll() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const els = container.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

const studios = [
  {
    name: 'GolfSmart Tropicana Golf & Country Club',
    address: 'Tropicana Driving Range, Jalan TR8/3, 47410 Petaling Jaya, Selangor',
    contact: '+603-74993033',
    email: 'fitting@gsfgolf.com',
    mapSrc: 'https://www.google.com/maps?q=Tropicana+Golf+Country+Club+Petaling+Jaya&output=embed',
  },
  {
    name: 'GSF Kelab Rahman Putra Malaysia',
    address: 'Jalan BRP 2/1, Bukit Rahman Putra, 47000 Sungai Buloh, Selangor',
    contact: '+60183520899',
    email: 'fitting@gsfgolf.com',
    mapSrc: 'https://www.google.com/maps?q=Kelab+Rahman+Putra+Malaysia+Sungai+Buloh&output=embed',
  },
  {
    name: 'GolfSmart Johor Bahru (Southern Malaysia)',
    address: 'Horizon Hills Golf Resort, No 1, Jalan Eka, Horizon Hills, 79100 Nusajaya, Johor',
    contact: '+603-7497 4950',
    email: 'fitting@gsfgolf.com',
    mapSrc: 'https://www.google.com/maps?q=Horizon+Hills+Golf+Resort+Nusajaya+Johor&output=embed',
  },
  {
    name: 'GolfSmart Ara Damansara (PJ)',
    address: 'No. G-G-10, Jalan PJU 1A/3, Ara Damansara, 47301 Petaling Jaya, Selangor',
    contact: '+603-7497 4950',
    email: 'fitting@gsfgolf.com',
    mapSrc: 'https://www.google.com/maps?q=Ara+Damansara+Petaling+Jaya+Selangor&output=embed',
  },
]

export default function Contact() {
  const ref = useRevealAll()
  const [activeStudio, setActiveStudio] = useState(0)
  const [formState, setFormState] = useState({ firstName: '', lastName: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <article ref={ref}>
      {/* ── Hero ── */}
      <section className="relative bg-forest grain pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(184,146,58,0.20) 0%, transparent 60%), radial-gradient(ellipse at 90% 85%, rgba(232,136,28,0.10) 0%, transparent 55%)' }} />
        <div className="atmosphere" aria-hidden />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="section-eyebrow">We're Here</p>
          <h1 className="font-display font-bold text-gsf-white leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}>
            Contact Us
          </h1>
          <p className="text-gsf-white/65 text-base leading-relaxed max-w-xl">
            Whether you have a question about fittings, products, or want to visit one of our studios, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Message + Info ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Form */}
          <div className="reveal">
            <p className="section-eyebrow">Send a Message</p>
            <h2 className="section-title text-forest mb-8">Get in Touch</h2>

            {submitted ? (
              <div className="bg-forest text-gsf-white rounded-sm p-8 text-center">
                <div className="text-gold text-4xl mb-4">✓</div>
                <h3 className="font-display font-bold text-2xl mb-2">Message Sent</h3>
                <p className="text-gsf-white/65 text-sm">We'll get back to you at <strong>{formState.email}</strong> within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.firstName}
                      onChange={e => setFormState(s => ({ ...s, firstName: e.target.value }))}
                      className="w-full border border-cream-dark bg-gsf-white rounded-sm px-4 py-3 text-sm text-forest placeholder-gsf-muted/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                      placeholder="Jack"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.lastName}
                      onChange={e => setFormState(s => ({ ...s, lastName: e.target.value }))}
                      className="w-full border border-cream-dark bg-gsf-white rounded-sm px-4 py-3 text-sm text-forest placeholder-gsf-muted/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                      placeholder="Loi"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                    className="w-full border border-cream-dark bg-gsf-white rounded-sm px-4 py-3 text-sm text-forest placeholder-gsf-muted/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest/60 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                    className="w-full border border-cream-dark bg-gsf-white rounded-sm px-4 py-3 text-sm text-forest placeholder-gsf-muted/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="reveal">
            <p className="section-eyebrow">Direct Contact</p>
            <h2 className="section-title text-forest mb-8">Reach Us Directly</h2>

            <div className="space-y-4 mb-10">
              <a href="tel:+60374974950"
                className="flex items-start gap-4 p-5 bg-gsf-white border border-cream-dark rounded-sm hover:border-gold/40 transition-colors group">
                <div className="w-10 h-10 bg-forest rounded-sm flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-forest/50 mb-0.5">Phone</p>
                  <p className="font-semibold text-forest group-hover:text-gold transition-colors">+603-74974950</p>
                </div>
                <ChevronRight size={14} className="text-gsf-muted ml-auto mt-1 group-hover:text-gold transition-colors" />
              </a>

              <a href="mailto:fitting@gsfgolf.com"
                className="flex items-start gap-4 p-5 bg-gsf-white border border-cream-dark rounded-sm hover:border-gold/40 transition-colors group">
                <div className="w-10 h-10 bg-forest rounded-sm flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-forest/50 mb-0.5">Email</p>
                  <p className="font-semibold text-forest group-hover:text-gold transition-colors">fitting@gsfgolf.com</p>
                </div>
                <ChevronRight size={14} className="text-gsf-muted ml-auto mt-1 group-hover:text-gold transition-colors" />
              </a>
            </div>

            {/* Hiring */}
            <div className="p-6 bg-forest rounded-sm">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={18} className="text-gold" />
                <h3 className="font-semibold text-gsf-white">We Are Hiring</h3>
              </div>
              <p className="text-gsf-white/60 text-sm leading-relaxed mb-4">
                We are looking for dedicated professionals to join our GSF team — people with a positive attitude, proud to deliver a premier golf fitting experience.
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gsf-white/50">
                <div>
                  <p className="text-gold text-[0.65rem] tracking-wider uppercase font-semibold mb-1">East Malaysia</p>
                  <p>Kuala Lumpur · Penang · JB</p>
                  <p>Ipoh · Alor Setar · Kuantan</p>
                </div>
                <div>
                  <p className="text-gold text-[0.65rem] tracking-wider uppercase font-semibold mb-1">West Malaysia</p>
                  <p>Sarawak · Sabah</p>
                </div>
              </div>
              <a href="mailto:fitting@gsfgolf.com?subject=Career Enquiry"
                className="view-all-link-light mt-4 inline-flex">
                Apply Now <ChevronRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fitting Studios ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gsf-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 reveal">
            <p className="section-eyebrow">Locations</p>
            <h2 className="section-title text-forest">Our Fitting Studios</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Studio selector */}
            <div className="space-y-2 reveal">
              {studios.map((studio, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStudio(i)}
                  className={`w-full text-left p-5 rounded-sm border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    activeStudio === i
                      ? 'bg-forest border-forest text-gsf-white'
                      : 'bg-gsf-white border-cream-dark text-forest hover:border-forest/30'
                  }`}
                >
                  <h3 className={`font-semibold text-sm mb-1 ${activeStudio === i ? 'text-gold-light' : 'text-forest'}`}>
                    {studio.name}
                  </h3>
                  <div className={`flex items-start gap-1.5 text-xs ${activeStudio === i ? 'text-gsf-white/60' : 'text-gsf-muted'}`}>
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    {studio.address}
                  </div>
                  {activeStudio === i && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      <a href={`tel:${studio.contact.replace(/\s/g, '')}`}
                        className="flex items-center gap-1 text-gold text-xs hover:text-gold-light transition-colors">
                        <Phone size={11} /> {studio.contact}
                      </a>
                      <a href={`mailto:${studio.email}`}
                        className="flex items-center gap-1 text-gold text-xs hover:text-gold-light transition-colors">
                        <Mail size={11} /> {studio.email}
                      </a>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Map */}
            <div className="reveal rounded-sm overflow-hidden bg-cream" style={{ minHeight: '400px' }}>
              <iframe
                key={activeStudio}
                src={studios[activeStudio].mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={studios[activeStudio].name}
              />
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
