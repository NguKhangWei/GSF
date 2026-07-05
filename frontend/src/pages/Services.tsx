import { useEffect, useRef } from 'react'
import { MessageCircle, ChevronRight } from 'lucide-react'
import bookLesson from '../../brand_assets/services/book a golf lesson.avif'
import bookFitting from '../../brand_assets/services/book a fitting.avif'
import golferImg from '../../brand_assets/background/golfer.png'

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

export default function Services() {
  const ref = useRevealAll()

  return (
    <article ref={ref}>
      {/* ── Hero ── */}
      <section className="relative bg-forest grain pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Golfer silhouette — anchored to right, fades left */}
        <img
          src={golferImg}
          alt=""
          aria-hidden
          className="absolute right-0 bottom-0 h-full w-auto max-w-[55%] object-cover object-top opacity-25 pointer-events-none"
          style={{ maskImage: 'linear-gradient(to left, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)' }}
        />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 75% 40%, rgba(184,146,58,0.22) 0%, transparent 60%), radial-gradient(ellipse at 88% 85%, rgba(232,136,28,0.10) 0%, transparent 55%)' }}
        />
        <div className="atmosphere" aria-hidden />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="section-eyebrow">Expertise &amp; Craft</p>
          <h1
            className="font-display font-bold text-gsf-white leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}
          >
            Services
          </h1>
          <p className="font-display italic text-gold-light text-2xl font-medium mb-6">
            Golf Smart, Fit Smart.
          </p>
          <p className="text-gsf-white/65 text-base leading-relaxed max-w-2xl">
            Regardless of your skill level, improving your golf game is simply about putting the proper tools in play. Using the right clubs leads to a more consistent swing and a higher level of performance on the course.
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-16 px-6 lg:px-12 bg-cream">
        <div className="max-w-4xl mx-auto reveal">
          <p className="text-gsf-muted text-base leading-relaxed">
            If nothing else, custom club-fitting can reassure you that your existing clubs are performing as well as possible for your unique golf swing — taking away any doubt that an errant shot is the result of poor equipment.
          </p>
        </div>
      </section>

      {/* ── Service: Golf Lesson ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gsf-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal order-2 lg:order-1">
            <p className="section-eyebrow">Teaching</p>
            <h2 className="section-title text-forest mb-6">Book a Golf Lesson</h2>
            <p className="text-gsf-muted leading-relaxed mb-6">
              We offer a premier fitting experience — delivering unbiased expert advice and equipment recommendations ideal to your swing according to your swing analysis using state-of-the-art technology.
            </p>
            <p className="text-gsf-muted leading-relaxed mb-8">
              Our USGTF-certified teaching professionals from Swing Dynamic Academy work with players of all levels — from raw beginners to single-figure handicappers. Every session is data-driven and tailored to your specific needs.
            </p>

            <div className="p-5 bg-cream rounded-sm border border-gold/20 flex items-start gap-4 mb-6">
              <MessageCircle size={18} className="text-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-forest mb-1">Book via WhatsApp</p>
                <a
                  href="https://wa.link/1anew7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors font-medium text-sm flex items-center gap-1"
                >
                  +60183520899 <ChevronRight size={14} />
                </a>
              </div>
            </div>

            <a
              href="https://wa.link/1anew7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Book a Lesson
              <MessageCircle size={14} />
            </a>
          </div>
          <div className="reveal order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-sm">
              <img
                src={bookLesson}
                alt="Golf Lesson"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '520px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-forest/60 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Service: Fitting ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-forest">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal">
            <div className="relative overflow-hidden rounded-sm">
              <img
                src={bookFitting}
                alt="Club Fitting"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '520px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-forest/60 to-transparent" />
            </div>
          </div>
          <div className="reveal">
            <p className="section-eyebrow">Fitting</p>
            <h2 className="section-title text-gsf-white mb-6">Book a Fitting</h2>
            <p className="text-gsf-white/65 leading-relaxed mb-6">
              We create a set of clubs that is perfectly matched to your swing. To do that, every aspect of the club is studied and analysed thoroughly. Every club is built to the best — there is no compromise.
            </p>
            <p className="text-gsf-white/65 leading-relaxed mb-8">
              Nobody builds golf clubs like we do. Using ICG-certified fitters and the latest in launch monitor technology, we ensure every element — shaft flex, lie angle, loft, length, and grip — is perfectly calibrated for your swing.
            </p>

            <div className="p-5 bg-forest-mid rounded-sm border border-gold/20 flex items-start gap-4 mb-6">
              <MessageCircle size={18} className="text-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gsf-white mb-1">Book via WhatsApp</p>
                <a
                  href="https://wa.link/xk2vuv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors font-medium text-sm flex items-center gap-1"
                >
                  +6012002660 <ChevronRight size={14} />
                </a>
              </div>
            </div>

            <a
              href="https://wa.link/xk2vuv"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex"
            >
              Book a Fitting
              <MessageCircle size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-title text-forest">The Fitting Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Swing Analysis',
                desc: 'We record and analyse your current ball flight, swing path, face angle, and club delivery using launch monitor technology.',
              },
              {
                step: '02',
                title: 'Club Build',
                desc: 'Based on your data, we select and assemble the optimal combination of head, shaft, and grip from our premium range.',
              },
              {
                step: '03',
                title: 'On-Course Testing',
                desc: 'You hit shots with your new build on our range. We fine-tune until every club performs exactly as required.',
              },
            ].map((item) => (
              <div key={item.step} className="reveal p-8 bg-gsf-white rounded-sm border border-cream-dark relative">
                <span className="font-display font-bold text-gold/30 text-5xl leading-none block mb-4">
                  {item.step}
                </span>
                <h3 className="font-semibold text-forest text-lg mb-2">{item.title}</h3>
                <p className="text-gsf-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
