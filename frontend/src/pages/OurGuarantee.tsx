import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'
import { useSeo } from '../lib/seo'
import backgroundImg from '../../brand_assets/background/backgroundavif.avif'
// Industry leading brands
import brand01 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-01.avif'
import brand02 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-02.avif'
import brand03 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-03.avif'
import brand04 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-04.avif'
import brand05 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-05.avif'
import brand06 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-06.avif'
import brand07 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-07.avif'
import brand08 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-08.avif'
import brand09 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-09.avif'
import brand10 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-10.avif'
import brand11 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-11.avif'
import brand12 from '../../brand_assets/guarantee-updated/industry-leading-brands/brand-12.avif'
// Services · Golf Smart, Fit Smart
import service1 from '../../brand_assets/guarantee-updated/services-golf-smart-fit-smart/service-1.png'
import service2 from '../../brand_assets/guarantee-updated/services-golf-smart-fit-smart/service-2.png'
import service3 from '../../brand_assets/guarantee-updated/services-golf-smart-fit-smart/service-3.png'
// Built to your measurement
import measure1 from '../../brand_assets/guarantee-updated/Built-to-your-measurement/measure-1.jpg'
import measure2 from '../../brand_assets/guarantee-updated/Built-to-your-measurement/measure-2.jpg'

const brandLogos = [
  brand01, brand02, brand03, brand04, brand05, brand06,
  brand07, brand08, brand09, brand10, brand11, brand12,
]
const serviceIcons = [service1, service2, service3]
const measurementImages = [measure1, measure2]

const customServices = [
  'Re-shafting',
  'Loft and Lie Alterations',
  'Putter Fitting',
  'Re-gripping',
  'Swing Weight Adjustment',
]

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

// A small gold rule used in place of a worded eyebrow.
function Rule() {
  return <span className="block w-12 h-px bg-gold mb-6" />
}

export default function OurGuarantee() {
  const ref = useRevealAll()

  useSeo({
    title: 'Our Guarantee',
    description:
      'We combine in-depth knowledge with industry leading technology to guarantee the results of every fitting — highly trained professionals, hand built clubs, and custom services.',
    path: '/our-guarantee',
  })

  return (
    <article ref={ref}>
      {/* ── Hero ── */}
      <section className="relative bg-forest grain pt-40 pb-28 px-6 lg:px-12 overflow-hidden">
        <img
          src={backgroundImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-[0.16] pointer-events-none"
          style={{ objectPosition: 'center 40%' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 75% 45%, rgba(184,146,58,0.22) 0%, transparent 62%)' }}
        />
        <div className="atmosphere" aria-hidden />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="section-eyebrow">100% Sastisfied Customer</p>
          <h1
            className="font-display font-bold text-gsf-white leading-[0.95] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          >
            Our <span className="text-gold-light italic font-medium">Guarantee.</span>
          </h1>
        </div>
      </section>

      {/* ── Highly Trained Professionals ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-20 items-start">
          <div className="reveal">
            <Rule />
            <h2 className="section-title text-forest">
              Highly Trained<br />Professionals
            </h2>
          </div>
          <div className="reveal space-y-5 text-gsf-muted leading-relaxed text-base lg:text-[1.05rem] lg:pt-3">
            <p>
              Our highly trained team is dedicated to providing the highest level of service to you. We
              are privileged to work with some of the best professional golfers in the the world. More
              importantly, we have worked with thousands of amateur golfers of all skill levels that have
              experienced tremendous success from properly fit golf clubs.
            </p>
            <p>
              We pride ourselves in having an in-depth knowledge on pairing the right components together
              to make a measurable improvement to your game. We combine this knowledge with industry
              leading technology to guarantee the results of every fitting.
            </p>
          </div>
        </div>
      </section>

      {/* ── Club Building ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-forest">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="reveal">
            <Rule />
            <h2 className="section-title text-gsf-white mb-6">Club Building</h2>
            <p className="text-gsf-white/60 leading-relaxed text-base lg:text-[1.05rem]">
              Every club fit by Golfsmart Fitting is hand built in our workshop. We combine cutting edge
              technology and the highest grade components to ensure that your clubs built to the exact
              specifications that were determined during the fitting process. Our team works tirelessly to
              ensure that all clients get their clubs in a timely manner. We also offer custom services,
              such as:
            </p>
          </div>
          <div className="reveal lg:pt-2">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {customServices.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-3 p-4 bg-forest-mid/50 rounded-sm border border-gold/10 transition-colors duration-300 hover:border-gold/30"
                >
                  <span className="shrink-0 w-8 h-8 rounded-sm bg-gold/15 flex items-center justify-center">
                    <Wrench size={15} className="text-gold" />
                  </span>
                  <span className="text-gsf-white text-sm font-medium">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Industry Leading Brands ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gsf-white">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-12 lg:mb-14">
            <Rule />
            <h2 className="section-title text-forest">Industry Leading Brands</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {brandLogos.map((src, i) => (
              <div
                key={i}
                className="reveal bg-cream border border-forest/10 rounded-sm h-24 sm:h-28 flex items-center justify-center px-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 10px 30px -20px rgba(0,0,0,0.35)' }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="max-h-12 sm:max-h-14 max-w-[80%] w-auto object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services · Golf Smart, Fit Smart ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="reveal max-w-3xl mb-12 lg:mb-16">
            <Rule />
            <p className="text-gold text-[0.7rem] font-semibold uppercase tracking-[0.22em] mb-3">
              Golf Smart, Fit Smart
            </p>
            <h2 className="section-title text-forest mb-7">Services</h2>
            <div className="space-y-5 text-gsf-muted leading-relaxed text-base lg:text-[1.05rem]">
              <p>
                Regardless of your skill level and experience, improving your golf game is simply about
                putting the proper tools in play. Using the right clubs will lead to a more consistent golf
                swing and a higher level of performance on the golf course.
              </p>
              <p>
                If nothing else, custom club-fitting can reassure you that your existing golf clubs are in
                fact performing as well as possible for your unique golf swing, taking away any doubt that
                an errant shot is the result of poor equipment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {serviceIcons.map((src, i) => (
              <div
                key={i}
                className="reveal bg-gsf-white border border-forest/10 rounded-sm flex items-center justify-center p-8 lg:p-10 transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 12px 34px -20px rgba(0,0,0,0.4)' }}
              >
                <img src={src} alt="" loading="lazy" className="max-h-28 lg:max-h-32 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built to Your Measurement ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-forest">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="reveal mb-12 lg:mb-14">
            <Rule />
            <h2 className="section-title text-gsf-white">Built to Your Measurement</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {measurementImages.map((src, i) => (
              <div key={i} className="reveal relative overflow-hidden rounded-sm group">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover aspect-[3/2] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          <div className="reveal mt-14 flex flex-wrap items-center gap-4">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-gold text-forest text-sm font-semibold px-6 py-3 rounded-sm hover:bg-gold-light transition-colors"
            >
              Explore Our Services <ArrowRight size={14} />
            </Link>
            <Link to="/contact" className="view-all-link-light">
              Book a Fitting <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
