import { Link, BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import NewsletterModal from './components/NewsletterModal'
import { CustomerProvider } from './context/CustomerContext'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import OurGuarantee from './pages/OurGuarantee'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'

function NotFound() {
  return (
    <section className="relative bg-forest grain min-h-[70vh] flex items-center px-6 lg:px-12">
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <p className="section-eyebrow justify-center">404</p>
        <h1 className="font-display font-bold text-gsf-white text-5xl lg:text-6xl mb-6">
          Page not found
        </h1>
        <p className="text-gsf-white/60 mb-10 leading-relaxed">
          This page doesn't exist. Browse the current range instead.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-gold text-forest text-sm font-semibold px-6 py-3 rounded-sm hover:bg-gold-light transition-colors"
        >
          Go to the shop
        </Link>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomerProvider>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/products/:handle" element={<ProductDetail />} />
            <Route path="/product-page/:legacySlug" element={<ProductDetail />} />
            <Route path="/our-guarantee" element={<OurGuarantee />} />
            <Route path="/copy-of-our-guarantee" element={<OurGuarantee />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <NewsletterModal />
      </CustomerProvider>
    </BrowserRouter>
  )
}
