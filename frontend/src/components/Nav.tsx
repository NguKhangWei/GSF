import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useCart } from '../hooks/useCart'
import { useCustomer } from '../context/CustomerContext'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()
  const { customer } = useCustomer()
  const location = useLocation()

  // Pages that don't have a full-screen dark hero need a solid nav at top
  const needsSolidNav = location.pathname !== '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    // { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || needsSolidNav
          ? 'bg-forest/85 backdrop-blur-md border-b border-gold/15 shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
          : 'bg-transparent'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/brand_assets/GSF LOGO ICON ONLY.avif"
            alt="GSF GolfSmart"
            className="h-9 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `link-underline text-[0.8rem] font-medium tracking-[0.08em] uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-gold-light is-active'
                      : 'text-gsf-white/80 hover:text-gold-light'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            to={customer ? '/account' : '/login'}
            className="p-2 text-gsf-white/80 hover:text-gold-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={customer ? 'My account' : 'Sign in'}
            title={customer ? `Signed in as ${customer.first_name || customer.email}` : 'Sign in'}
          >
            <User size={20} />
          </Link>
          <Link
            to="/shop"
            className="relative p-2 text-gsf-white/80 hover:text-gold-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-forest text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to="/shop" className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-[0.75rem]">
            Shop Now
          </Link>
          <button
            className="lg:hidden p-2 text-gsf-white/80 hover:text-gold-light transition-colors"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-forest/95 backdrop-blur-md border-t border-gold/15">
          <ul className="list-none m-0 p-0 flex flex-col">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-6 py-3.5 text-sm font-medium tracking-wider uppercase border-b border-white/5 transition-colors ${
                      isActive ? 'text-gold-light' : 'text-gsf-white/75 hover:text-gold-light'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
