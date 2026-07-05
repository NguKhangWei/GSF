import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import introVideo from '../../brand_assets/background/GSF introduction videomp4.mp4'
import cinematicGolf from '../../brand_assets/background/cinematic golf.webp'
import powerElite from '../../brand_assets/achievements/power elite.avif'
import fiveStars from '../../brand_assets/achievements/5 starrs.png'
import wheatDesign from '../../brand_assets/achievements/wheat design.png'
import bookLesson from '../../brand_assets/services/book a golf lesson.avif'
import bookFitting from '../../brand_assets/services/book a fitting.avif'
import sunsetGolfer from '../../styles2/background1.jpg'
import moodySwing from '../../styles2/background2.jpg'
import work1 from '../../brand_assets/work/work1.png'
import work2 from '../../brand_assets/work/work2.png'
import work3 from '../../brand_assets/work/work3.png'
import work4 from '../../brand_assets/work/work4.png'
import work5 from '../../brand_assets/work/work5.png'
import work6 from '../../brand_assets/work/work6.png'
import work7 from '../../brand_assets/work/work7.png'
import work8 from '../../brand_assets/work/work8.png'
import work9 from '../../brand_assets/work/work9.png'
import work10 from '../../brand_assets/work/work10.png'
import work11 from '../../brand_assets/work/work11.png'
import work12 from '../../brand_assets/work/work12.png'
import work13 from '../../brand_assets/work/work13.png'
import work14 from '../../brand_assets/work/work14.png'
import work15 from '../../brand_assets/work/work15.png'

const workImages = [
  work1, work2, work3, work4, work5,
  work6, work7, work8, work9, work10,
  work11, work12, work13, work14, work15,
]
// Show the gallery in editorial sets of five, rotating through three batches
const workBatches = [
  workImages.slice(0, 5),
  workImages.slice(5, 10),
  workImages.slice(10, 15),
]

// Brands GolfSmart fits, distributes, or stocks — shown as a running marquee
const partnerBrands = [
  'PXG', 'Oban', 'Aerotech', 'Seven Dreamers', 'KAEN', 'Kuro', 'Baldo',
  'Graphite Design', 'Mitsubishi Chemical', 'Nippon', 'Golf Pride', 'Lamkin', 'Project X',
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

function CountUp({ end, duration = 1800, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return
        done.current = true
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setVal(end)
          return
        }
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(end * eased))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [end, duration])
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Home() {
  const ref = useRevealAll()
  const [batch, setBatch] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-advance through the work batches, but hold still while hovered or
  // when the visitor prefers reduced motion.
  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setBatch(b => (b + 1) % workBatches.length), 5200)
    return () => clearInterval(id)
  }, [paused])

  return (
    <article ref={ref}>
      {/* ── Hero ── */}
      <section className="relative min-h-screen bg-forest grain flex items-center">
        {/* Background video with cinematic golf as poster fallback */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={cinematicGolf}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <source src={introVideo} type="video/mp4" />
        </video>

        {/* Primary dark overlay for readability */}
        <div className="absolute inset-0 bg-forest/80 pointer-events-none" style={{ zIndex: 1 }} />

        {/* Machined grid texture */}
        <div className="absolute inset-0 tech-grid pointer-events-none" style={{ zIndex: 1, opacity: 0.5 }} />

        {/* Top gradient — darkens the navbar region so the video doesn't cut into it */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{ height: '10rem', background: 'linear-gradient(to bottom, rgba(13,13,15,0.85) 0%, transparent 100%)', zIndex: 2 }}
        />

        {/* Bottom fade into the next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0D0D0F 0%, transparent 100%)', zIndex: 2 }}
        />

        {/* Radial atmosphere — warm gold glow + deep vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            background:
              'radial-gradient(ellipse at 70% 42%, rgba(184,146,58,0.22) 0%, transparent 55%), radial-gradient(circle at 12% 86%, rgba(13,13,15,0.92) 0%, transparent 55%), radial-gradient(ellipse at 88% 88%, rgba(232,136,28,0.10) 0%, transparent 50%)',
          }}
        />
        {/* Animated drifting glow */}
        <div className="atmosphere" aria-hidden style={{ zIndex: 2 }} />

        {/* Content */}
        <div className="relative px-6 lg:px-20 max-w-3xl pt-24 pb-16" style={{ zIndex: 3 }}>
          <p
            className="flex items-center gap-3 text-gold text-[0.7rem] font-semibold tracking-[0.22em] uppercase mb-6"
            style={{ opacity: 0, animation: 'fadeUp 0.7s 0.3s ease forwards' }}
          >
            <span className="inline-block w-8 h-px bg-gold" />
            Malaysia's Premier Golf Fitting Studio
          </p>

          {/* <h1
            className="font-display font-bold text-gsf-white leading-none tracking-tight mb-4"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              opacity: 0,
              animation: 'fadeUp 0.7s 0.45s ease forwards',
            }}
          >
            GSF<br />GolfSmart
          </h1> */}

          <img
              src="/brand_assets/GSF FULL LOGO.avif"
              alt="GSF GolfSmart"
              className="h-10 w-auto mb-4"
              style={{ width: '600px', height: 'auto', opacity: 0, animation: 'fadeUp 0.7s 0.45s ease forwards' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

          <p
            className="font-display italic font-medium mb-5 text-gold-gradient"
            style={{
              fontSize: 'clamp(1.15rem, 2.5vw, 1.6rem)',
              opacity: 0,
              animation: 'fadeUp 0.7s 0.6s ease forwards',
            }}
          >
            The Ultimate Fitting Experience
          </p>

          <p
            className="text-gsf-white/65 text-base leading-relaxed max-w-md mb-8"
            style={{ opacity: 0, animation: 'fadeUp 0.7s 0.75s ease forwards' }}
          >
            Custom club fitting by USGTF-certified professionals. Built for golfers who demand nothing less than perfection from their equipment.
          </p>

          <div
            className="flex flex-wrap gap-4 items-center"
            style={{ opacity: 0, animation: 'fadeUp 0.7s 0.9s ease forwards' }}
          >
            <Link to="/shop" className="btn-primary sheen">
              Browse Our Products
              <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="btn-ghost">
              Our Services
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40"
          style={{ animation: 'bounce 2s infinite', zIndex: 3 }}
        >
          <div className="w-px h-8 bg-gsf-white/40" />
          <span className="text-gsf-white/60 text-[0.6rem] tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── Achievements ── */}
      <section className="relative bg-forest-mid overflow-hidden py-16 lg:py-24 px-6 lg:px-12">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="section-eyebrow flex justify-center mb-10 lg:mb-12">Recognised &amp; Proven</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-2 place-items-center">
            {/* Power Elite */}
            <div className="crest reveal float-slow" style={{ animationDelay: '0s' }}>
              <div className="crest-inner">
                <span className="crest-glow" aria-hidden />
                <img src={wheatDesign} alt="" aria-hidden className="crest-wreath" />
                <div className="crest-content">
                  <img src={powerElite} alt="Power Elite" className="h-12 w-auto mb-3 object-contain" />
                  <span className="font-mono text-gsf-white/55 text-[0.62rem] tracking-[0.2em] uppercase">
                    Power Elite Authors
                  </span>
                </div>
              </div>
            </div>

            {/* Clubs Built */}
            <div className="crest reveal float-slow" style={{ animationDelay: '-2.3s' }}>
              <div className="crest-inner">
                <span className="crest-glow" aria-hidden />
                <img src={wheatDesign} alt="" aria-hidden className="crest-wreath" />
                <div className="crest-content">
                  <span
                    className="font-display font-bold text-gold-gradient block leading-none mb-2"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
                  >
                    <CountUp end={28380} suffix="+" />
                  </span>
                  <span className="font-mono text-gsf-white/55 text-[0.62rem] tracking-[0.2em] uppercase">
                    Clubs Built
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Star Rated */}
            <div className="crest reveal float-slow" style={{ animationDelay: '-4.6s' }}>
              <div className="crest-inner">
                <span className="crest-glow" aria-hidden />
                <img src={wheatDesign} alt="" aria-hidden className="crest-wreath" />
                <div className="crest-content">
                  <img src={fiveStars} alt="5 Star Rating" className="h-8 w-auto mb-3 object-contain" />
                  <span className="font-mono text-gsf-white/55 text-[0.62rem] tracking-[0.2em] uppercase">
                    5-Star Rated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Marquee ── */}
      <section className="relative bg-forest border-y border-white/5 overflow-hidden py-7 lg:py-9">
        <div className="atmosphere" aria-hidden />
        <p className="relative z-10 section-eyebrow flex justify-center mb-5 !text-gold/70">
          Fitted · Distributed · Stocked
        </p>
        <div className="marquee-mask relative z-10">
          <div className="marquee">
            {[...partnerBrands, ...partnerBrands].map((b, i) => (
              <span
                key={i}
                className="mx-7 lg:mx-9 inline-flex items-center gap-7 lg:gap-9 font-display text-2xl lg:text-3xl text-gsf-white/35 hover:text-gold-light transition-colors duration-300 whitespace-nowrap"
              >
                {b}
                <span className="text-gold/30 not-italic">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="relative overflow-hidden bg-cream py-20 lg:py-28 px-6 lg:px-12">
        {/* Faded golfer silhouette — adds depth to the light section */}
        <img
          src={moodySwing}
          alt=""
          aria-hidden
          className="section-watermark hidden sm:block"
          style={{ right: '-4%', top: '0', height: '100%', width: 'auto', opacity: 0.1, mixBlendMode: 'multiply', maskImage: 'linear-gradient(to left, black 30%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-eyebrow">What We Offer</p>
              <h2 className="section-title text-forest">Our Services</h2>
            </div>
            <Link to="/services" className="view-all-link shrink-0">
              View All Services <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                img: bookLesson,
                tag: 'Teaching',
                title: 'Book a Golf Lesson',
                desc: 'Premier fitting experiences with unbiased expert advice and equipment recommendations tailored to your swing using state-of-the-art technology.',
              },
              {
                img: bookFitting,
                tag: 'Fitting',
                title: 'Book a Fitting',
                desc: 'We create a set of clubs perfectly matched to your swing — every aspect studied and analysed. Nobody builds golf clubs like we do.',
              },
            ].map((svc, i) => (
              <div key={i} className="reveal sheen relative h-[420px] lg:h-[480px] overflow-hidden rounded-sm card-hover-scale border border-transparent hover:border-gold/30 transition-colors duration-300">
                <img
                  src={svc.img}
                  alt={svc.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent" />
                <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end">
                  <span className="section-eyebrow">{svc.tag}</span>
                  <h3
                    className="font-display font-semibold text-gsf-white leading-tight tracking-tight mb-3"
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                  >
                    {svc.title}
                  </h3>
                  <p className="text-gsf-white/70 text-sm leading-relaxed mb-5">{svc.desc}</p>
                  <Link to="/services" className="view-all-link-light">
                    Learn More <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Work ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gsf-white">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Portfolio</p>
              <h2 className="section-title text-forest">Our Work</h2>
            </div>
            <p className="text-gsf-muted text-sm leading-relaxed max-w-xs">
              On the range, at the fittings, and out with the community — a rotating look at GolfSmart in motion.
            </p>
          </div>

          <div
            className="reveal"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              key={batch}
              className="work-batch grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2 lg:h-[520px]"
            >
              {workBatches[batch].map((src, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-sm group ${
                    i === 0
                      ? 'col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto'
                      : 'aspect-square lg:aspect-auto'
                  }`}
                >
                  <img
                    src={src}
                    alt={`GolfSmart at work — ${batch * 5 + i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>

            {/* Batch controls */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {workBatches.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBatch(i)}
                    aria-label={`Show work set ${i + 1} of ${workBatches.length}`}
                    aria-current={i === batch}
                    className={`h-1.5 rounded-full outline-none transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${
                      i === batch ? 'w-8 bg-gold' : 'w-3 bg-forest/20 hover:bg-forest/40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-display text-forest/45 text-base tracking-wide tabular-nums">
                {String(batch + 1).padStart(2, '0')} / {String(workBatches.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="relative bg-forest-mid py-24 lg:py-32 px-6 lg:px-12 overflow-hidden">
        {/* Cinematic golden-hour golfer */}
        <img
          src={sunsetGolfer}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 28%' }}
        />
        <div className="absolute inset-0 bg-forest/80" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(13,13,15,0.35) 0%, rgba(13,13,15,0.9) 100%)' }}
        />
        <div className="atmosphere" aria-hidden />
        <div className="relative z-10 max-w-4xl mx-auto text-center reveal">
          <p className="section-eyebrow justify-center flex">Ready to Play Better?</p>
          <h2
            className="font-display font-semibold text-gsf-white tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Elevate your game with a <span className="text-gold-gradient">custom fitting</span>
          </h2>
          <p className="text-gsf-white/60 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Improving your golf game starts with the right equipment. Our certified fitters use state-of-the-art technology to find the perfect clubs for your unique swing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/services" className="btn-primary sheen">
              Book a Fitting <ArrowRight size={14} />
            </Link>
            <Link to="/contact" className="btn-ghost">
              Contact Us <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </article>
  )
}
