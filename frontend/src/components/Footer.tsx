import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest text-gsf-white/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 pb-10 border-b border-gold/20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/brand_assets/GSF FULL LOGO.avif"
              alt="GSF GolfSmart"
              className="h-10 w-auto mb-4"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <p className="text-sm leading-relaxed text-gsf-white/50">
              At our core, we are a golfing company — run by golfers, for golfers.
            </p>
            <p className="text-xs tracking-widest uppercase text-gold mt-4">
              Certified by USGTF & ICG
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-gold mb-5">
              Navigate
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Services' },
                { to: '/shop', label: 'Shop' },
                { to: '/about', label: 'About Us' },
                { to: '/our-guarantee', label: 'Our Guarantee' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gsf-white/55 hover:text-gold-light transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-gold mb-5">
              Products
            </h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {['Drivers & Woods', 'Irons & Wedges', 'Putters', 'Shafts', 'Grips', 'Pre-Owned'].map(item => (
                <li key={item}>
                  <Link
                    to="/shop"
                    className="text-sm text-gsf-white/55 hover:text-gold-light transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[0.65rem] font-semibold tracking-[0.22em] uppercase text-gold mb-5">
              Get In Touch
            </h4>
            <ul className="space-y-3 list-none p-0 m-0">
              <li className="flex items-start gap-2.5 text-sm text-gsf-white/55">
                <Phone size={14} className="mt-0.5 shrink-0 text-gold/60" />
                +603-74974950
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gsf-white/55">
                <Mail size={14} className="mt-0.5 shrink-0 text-gold/60" />
                fitting@gsfgolf.com
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gsf-white/55">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gold/60" />
                Tropicana Golf & Country Club,<br />Petaling Jaya, Selangor
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[0.7rem] text-gsf-white/30">
          <span>© {new Date().getFullYear()} GolfSmart Group. All rights reserved.</span>
          <span>GolfSmart Fitting Studio · Swing Dynamic Academy</span>
        </div>
      </div>
    </footer>
  )
}
