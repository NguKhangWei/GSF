import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Globe, Users } from 'lucide-react'
import golfSmartImg from '../../brand_assets/About us/golf smart.avif'
import golfSmartVietnamImg from '../../brand_assets/About us/golf smart vietnam.avif'
import backgroundImg from '../../brand_assets/background/backgroundavif.avif'
import strobeSwing from '../../styles2/background3.jpg'

// Our Work — moments from the GolfSmart journey
import aboutWork1 from '../../brand_assets/About us/work/work1.png'
import aboutWork2 from '../../brand_assets/About us/work/work2.png'
import aboutWork3 from '../../brand_assets/About us/work/work3.png'
import aboutWork4 from '../../brand_assets/About us/work/work4.png'
import aboutWork5 from '../../brand_assets/About us/work/work5.png'
import aboutWork6 from '../../brand_assets/About us/work/work6.png'
import aboutWork7 from '../../brand_assets/About us/work/work7.png'
import aboutWork8 from '../../brand_assets/About us/work/work8.png'

// Distributorship logos
import pxgLogo from '../../brand_assets/Distributorships/PXG.png'
import obanLogo from '../../brand_assets/Distributorships/OBAN.png'
import aerotechLogo from '../../brand_assets/Distributorships/Aerotech.png'
import sevenDreamersLogo from '../../brand_assets/Distributorships/seven dreamers.png'
import kaenLogo from '../../brand_assets/Distributorships/kaen_logo.avif'
import kuroLogo from '../../brand_assets/Distributorships/KuroGolf logo.jpg'
import baldoLogo from '../../brand_assets/Distributorships/Baldo.png'

// Authorised dealership logos
import golfPrideLogo from '../../brand_assets/Authorised dealership/golf pride.png'
import grafalloyLogo from '../../brand_assets/Authorised dealership/grafalloy.webp'
import graphiteDesignLogo from '../../brand_assets/Authorised dealership/graphite design.png'
import lamkinLogo from '../../brand_assets/Authorised dealership/lamkin.png'
import mitsubishiLogo from '../../brand_assets/Authorised dealership/mitsubishi chemical.webp'
import nipponLogo from '../../brand_assets/Authorised dealership/nippon shaft.png'
import projectXLogo from '../../brand_assets/Authorised dealership/project x.png'
import superStrokeLogo from '../../brand_assets/Authorised dealership/super stroke.webp'
import veylixLogo from '../../brand_assets/Authorised dealership/veylix.png'

const aboutWorkImages = [
  aboutWork1, aboutWork2, aboutWork3, aboutWork4,
  aboutWork5, aboutWork6, aboutWork7, aboutWork8,
]

const distributors = [
  {
    logo: pxgLogo,
    name: 'PXG',
    meta: 'Exclusive · Malaysia & Vietnam',
    desc: 'Appointed as Parsons Xtreme Golf’s exclusive distributor for Malaysia & Vietnam in 2018 and was a authorized dealer since 2014.',
  },
  {
    logo: obanLogo,
    name: 'Oban',
    meta: 'Distributor · Malaysia',
    desc: 'Appointed as Oban Shaft’s distributor for Malaysia since 2012 and was a authorized dealer since 2012.',
  },
  {
    logo: aerotechLogo,
    name: 'Aerotech Golf Shafts',
    meta: 'Distributor · Malaysia',
    desc: 'Appointed as Aerotech Golf Shaft’s distributor for Malaysia in 2012 and was a authorized dealer since 2012.',
  },
  {
    logo: sevenDreamersLogo,
    name: 'Seven Dreamers',
    meta: 'Distributor · Malaysia',
    desc: 'Appointed as Seven Dreamers’ distributor for Malaysia in 2018 and was a authorized dealer since 2016.',
  },
  {
    logo: kaenLogo,
    name: 'KAEN Performance Composite',
    meta: 'Global Partner · Worldwide',
    desc: 'Appointed as KAEN global partner since 2019 and distribute KAEN range of product worldwide.',
  },
  {
    logo: kuroLogo,
    name: 'KURO',
    meta: 'Global Partner · Worldwide',
    desc: 'Appointed as KURO global partner since 2019 and distribute KURO range of product worldwide.',
  },
  {
    logo: baldoLogo,
    name: 'BALDO Golf',
    meta: 'Distributor · SEA Region',
    desc: 'Appointed as BALDO GOLF distributor for Malaysia, Singapore, Vietnam, Indonesia, Myanmar, Cambodia since 2015.',
  },
]

const dealerships = [
  { logo: golfPrideLogo, name: 'Golf Pride' },
  { logo: grafalloyLogo, name: 'Grafalloy' },
  { logo: graphiteDesignLogo, name: 'Graphite Design' },
  { logo: lamkinLogo, name: 'Lamkin' },
  { logo: mitsubishiLogo, name: 'Mitsubishi Chemical' },
  { logo: nipponLogo, name: 'Nippon Shaft' },
  { logo: projectXLogo, name: 'Project X' },
  { logo: superStrokeLogo, name: 'Super Stroke' },
  { logo: veylixLogo, name: 'Veylix' },
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

export default function About() {
  const ref = useRevealAll()

  return (
    <article ref={ref}>
      {/* ── Page Hero ── */}
      <section className="relative bg-forest grain pt-40 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Background image — course/landscape at very low opacity for texture */}
        <img
          src={backgroundImg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-[0.18] pointer-events-none"
          style={{ objectPosition: 'center 40%' }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(184,146,58,0.20) 0%, transparent 60%)' }}
        />
        <div className="atmosphere" aria-hidden />
        <div className="max-w-4xl mx-auto relative z-10">
          <p className="section-eyebrow">Our Story</p>
          <h1
            className="font-display font-bold text-gsf-white leading-tight tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)' }}
          >
            Run by Golfers,<br />
            <span className="text-gold-light italic font-medium">For Golfers.</span>
          </h1>
          <p className="text-gsf-white/65 text-base leading-relaxed max-w-2xl">
            GolfSmart Group was founded on a single belief: that every serious golfer deserves access to premium fitting technology and expert instruction — not just professionals.
          </p>
        </div>
      </section>

      {/* ── Founder Story ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal">
            <p className="section-eyebrow">The Founder</p>
            <h2 className="section-title text-forest mb-6">Jack Loi &amp; GolfSmart Group</h2>
            <div className="space-y-4 text-gsf-muted leading-relaxed text-base">
              <p>
                GolfSmart Group, which started as GolfSmart Fitting Studio, was founded by Jack Loi — a Malaysian golf enthusiast certified by USGTF as a teaching professional and by the International Clubmakers Guild (ICG) as a club fitter.
              </p>
              <p>
                More than 11 years ago, Jack saw a gap in the industry: the lack of advanced fitting facilities and premium shaft selection available to serious amateur golfers. He founded GolfSmart Fitting Studio to fill it.
              </p>
              <p>
                Recognising the equal importance of modern coaching, he went on to found <strong>Swing Dynamic Academy</strong> — a teaching arm staffed by qualified professionals from USGTF and tour players.
              </p>
            </div>
          </div>
          <div className="reveal">
            <div className="relative overflow-hidden rounded-sm">
              <img
                src={golfSmartImg}
                alt="GolfSmart Studio"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '520px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-forest/80 to-transparent p-6">
                <p className="font-display italic text-gold-light text-lg">
                  "Nobody builds golf clubs like we do."
                </p>
                <p className="text-gsf-white/60 text-sm mt-1">— Jack Loi, Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-forest">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="reveal">
            <p className="section-eyebrow">Our Mission</p>
            <h2 className="section-title text-gsf-white mb-6">
              Extreme Performance<br />Clubs for Fanatics
            </h2>
            <p className="text-gsf-white/60 leading-relaxed text-base mb-6">
              GolfSmart Fitting Studio is committed to delivering extreme performance clubs for golf fanatics worldwide seeking improved and excellent performance. We assure our customers full satisfaction with our high-tech fitting facilities and deep knowledge in club fitting requirements.
            </p>
            <Link to="/services" className="view-all-link-light">
              Book a Fitting <ArrowRight size={14} />
            </Link>
          </div>
          <div className="reveal grid grid-cols-1 gap-4">
            {[
              {
                icon: <Award size={22} className="text-gold" />,
                title: 'Certified Expertise',
                desc: 'Our fitters hold USGTF and ICG certifications — the gold standard in golf instruction and club fitting.',
              },
              {
                icon: <Globe size={22} className="text-gold" />,
                title: 'Global Recognition',
                desc: 'Recognised by Oban, Aerotech, KAEN, Kuro, and PXG as their authorised dealer and fitting studio in Malaysia.',
              },
              {
                icon: <Users size={22} className="text-gold" />,
                title: 'A Growing Community',
                desc: 'From Tropicana to Vietnam, GolfSmart has established strategic partnerships across Asia, Europe, and the USA.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 bg-forest-mid/50 rounded-sm border border-gold/10">
                <div className="shrink-0 mt-0.5">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gsf-white text-sm mb-1">{item.title}</h3>
                  <p className="text-gsf-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Work Gallery ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-gsf-white">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Portfolio</p>
              <h2 className="section-title text-forest">Our Work</h2>
            </div>
            <p className="text-gsf-muted text-sm leading-relaxed max-w-xs">
              From the range in Malaysia to the grand opening in Ho Chi Minh City — moments from the GolfSmart journey.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {aboutWorkImages.map((src, i) => (
              <div
                key={i}
                className="reveal relative overflow-hidden rounded-sm aspect-square group"
              >
                <img
                  src={src}
                  alt={`GolfSmart — moment ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vietnam Expansion ── */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal">
            <div className="overflow-hidden rounded-sm">
              <img
                src={golfSmartVietnamImg}
                alt="GolfSmart Vietnam"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '460px' }}
              />
            </div>
          </div>
          <div className="reveal">
            <p className="section-eyebrow">Expansion</p>
            <h2 className="section-title text-forest mb-6">GolfSmart Vietnam</h2>
            <p className="text-gsf-muted leading-relaxed mb-6">
              With a modest start in Malaysia, GolfSmart has since made its entry into Vietnam — debuting with a professional, well-equipped studio at Rach Chiec Golf Range, Q2 in Ho Chi Minh City, with planned inroads into Hanoi and Da Nang.
            </p>
            <p className="text-gsf-muted leading-relaxed">
              From 2018, GolfSmart Group has been planning its expansion into other ASEAN countries with strategic partners across Asia, Europe, and the USA.
            </p>
          </div>
        </div>
      </section>

      {/* ── Distributorships ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-forest">
        <div className="atmosphere" aria-hidden />
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="reveal max-w-2xl mb-12 lg:mb-16">
            <p className="section-eyebrow">Distribution Rights</p>
            <h2
              className="font-display font-semibold text-gsf-white tracking-tight mb-4"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
            >
              Distributorships
            </h2>
            <p className="text-gsf-white/55 text-base leading-relaxed">
              Beyond fitting and retail, GolfSmart Group holds appointed distribution rights for a curated roster of premium shaft and equipment makers across Malaysia, ASEAN, and worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {distributors.map((d) => (
              <div
                key={d.name}
                className="reveal flex flex-col bg-forest-mid/60 border border-gold/10 rounded-sm p-6 transition-colors duration-300 hover:border-gold/30"
              >
                <div className="bg-gsf-white rounded-sm h-20 flex items-center justify-center px-6 mb-5">
                  <img
                    src={d.logo}
                    alt={`${d.name} logo`}
                    loading="lazy"
                    className="max-h-12 max-w-full w-auto object-contain"
                  />
                </div>
                <p className="text-gold text-[0.7rem] font-semibold uppercase tracking-widest mb-1.5">
                  {d.meta}
                </p>
                <h3 className="font-display font-semibold text-gsf-white text-xl leading-snug mb-2.5">
                  {d.name}
                </h3>
                <p className="text-gsf-white/55 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Authorised Dealerships ── */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 lg:px-12 bg-cream">
        {/* Iconic stroboscopic swing — faint technical motif (inverted so only the arc shows) */}
        <img
          src={strobeSwing}
          alt=""
          aria-hidden
          className="section-watermark hidden md:block"
          style={{ left: '-6%', top: '50%', transform: 'translateY(-50%)', width: '34%', opacity: 0.08, filter: 'invert(1)', mixBlendMode: 'multiply' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="reveal max-w-2xl mb-12 lg:mb-16">
            <p className="section-eyebrow">Authorised Dealer</p>
            <h2 className="section-title text-forest mb-4">Authorised Dealerships</h2>
            <p className="text-gsf-muted text-base leading-relaxed">
              As an authorised dealer, GolfSmart stocks genuine components from the industry’s most trusted grip, shaft, and material brands.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {dealerships.map((b) => (
              <div
                key={b.name}
                className="reveal bg-gsf-white border border-forest/10 rounded-sm h-24 sm:h-28 flex items-center justify-center px-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 10px 30px -18px rgba(0,0,0,0.4)' }}
              >
                <img
                  src={b.logo}
                  alt={`${b.name} logo`}
                  loading="lazy"
                  className="max-h-10 sm:max-h-12 max-w-[78%] w-auto object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
