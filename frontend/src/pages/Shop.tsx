import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { X, ShoppingCart, Plus, Minus, Filter, ChevronDown, ChevronUp, SlidersHorizontal, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { type Product } from '../data/products'
import { fetchProducts } from '../lib/medusa'
import { productPath } from '../lib/seo'
import { useCart } from '../hooks/useCart'
import { resolveVariantId } from '../lib/checkoutApi'
import { parseSpecs } from '../lib/specs'

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const { addItem } = useCart()
  const isConfigurable = parseSpecs(product.specs).some((s) => s.selectable)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isConfigurable) {
      onClick()
      return
    }
    addItem(product)
  }

  return (
    <div
      className="group bg-gsf-white border border-cream-dark rounded-sm overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.4)]"
      onClick={onClick}
    >
      <div className="overflow-hidden aspect-square bg-cream relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/10 transition-colors duration-300" />
      </div>
      <div className="p-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gold mb-1">{product.brand}</p>
        <h3 className="font-display font-semibold text-forest text-lg leading-tight mb-1">{product.name}</h3>
        <p className="text-gsf-muted text-xs mb-3">{product.category}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display font-bold text-forest text-xl">
            MYR {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-forest text-gsf-white text-xs font-semibold tracking-wider uppercase px-3 py-2 rounded-sm hover:bg-forest-mid transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {isConfigurable ? <SlidersHorizontal size={12} /> : <ShoppingCart size={12} />}
            {isConfigurable ? 'Configure' : 'Add'}
          </button>
        </div>
        <Link
          to={productPath(product)}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex mt-3 text-xs font-semibold uppercase tracking-wider text-forest hover:text-gold transition-colors"
        >
          View details
        </Link>
      </div>
    </div>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, cart, updateQty, removeItem } = useCart()
  const [qty, setQty] = useState(1)
  const parsedSpecs = parseSpecs(product.specs)
  const choices = parsedSpecs.filter((s) => s.selectable)
  const details = parsedSpecs.filter((s) => !s.selectable && s.values.length === 1)
  const features = parsedSpecs.filter((s) => !s.selectable && s.values.length === 0)
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(choices.map((c) => [c.label, c.values[0]])),
  )

  const selectedVariantId = resolveVariantId(product, choices.length ? selected : undefined)
  const sameOptions = (a?: Record<string, string>, b?: Record<string, string>) => {
    const aKeys = Object.keys(a || {})
    const bKeys = Object.keys(b || {})
    return aKeys.length === bKeys.length && aKeys.every((key) => a?.[key] === b?.[key])
  }
  const cartItem = cart.find(c =>
    selectedVariantId
      ? c.variantId === selectedVariantId && (!choices.length || sameOptions(c.selectedOptions, selected))
      : c.productId === product.id,
  )

  const handleAdd = () => {
    addItem(product, choices.length ? selected : undefined, qty)
    setQty(1)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gsf-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gold mb-1">{product.brand}</p>
            <h2 className="font-display font-bold text-forest text-3xl leading-tight">{product.name}</h2>
            <p className="text-gsf-muted text-sm mt-1">{product.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gsf-muted hover:text-forest rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image */}
        <div className="mx-6 mt-4 bg-cream rounded-sm overflow-hidden aspect-video">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gsf-muted leading-relaxed text-sm mb-6">{product.description}</p>

          {choices.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[0.65rem] font-semibold tracking-widest uppercase text-forest/60 mb-3">Configure</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {choices.map((choice) => (
                  <label key={choice.label} className="block">
                    <span className="block text-[0.65rem] font-semibold tracking-widest uppercase text-forest/60 mb-1.5">
                      {choice.label}
                    </span>
                    <span className="relative block">
                      <select
                        value={selected[choice.label] ?? ''}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [choice.label]: e.target.value }))
                        }
                        className="w-full appearance-none bg-gsf-white border border-cream-dark rounded-sm pl-3 pr-9 py-2.5 text-sm text-forest font-medium cursor-pointer transition-colors hover:border-gold focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                      >
                        {choice.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(details.length > 0 || features.length > 0) && (
            <div className="mb-6">
              <h4 className="text-[0.65rem] font-semibold tracking-widest uppercase text-forest/60 mb-3">Specifications</h4>
              {details.length > 0 && (
                <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-0 m-0">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex items-baseline justify-between gap-3 border-b border-cream-dark py-2">
                      <dt className="text-sm text-gsf-muted">{detail.label}</dt>
                      <dd className="text-sm font-medium text-forest text-right m-0">{detail.values[0]}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {features.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2 list-none p-0 m-0">
                  {features.map((feature) => (
                    <li
                      key={feature.label}
                      className="bg-cream border border-cream-dark rounded-sm px-3 py-1.5 text-xs font-medium text-forest/80"
                    >
                      {feature.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Price + Cart */}
          <div className="border-t border-cream-dark pt-5">
            <p className="font-display font-bold text-forest text-3xl mb-4">
              MYR {product.price.toLocaleString()}
            </p>

            {cartItem ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-forest/20 rounded-sm overflow-hidden">
                  <button
                    onClick={() => updateQty(cartItem.lineId, cartItem.qty - 1)}
                    className="px-3 py-2 hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-forest min-w-[2.5rem] text-center">
                    {cartItem.qty}
                  </span>
                  <button
                    onClick={() => updateQty(cartItem.lineId, cartItem.qty + 1)}
                    className="px-3 py-2 hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(cartItem.lineId)}
                  className="text-xs text-gsf-muted underline hover:text-forest transition-colors"
                >
                  Remove
                </button>
                <span className="text-xs text-gold font-semibold ml-auto">In Cart</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-forest/20 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-cream transition-colors focus-visible:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-forest min-w-[2.5rem] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="px-3 py-2 hover:bg-cream transition-colors focus-visible:outline-none"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="btn-primary flex-1 justify-center"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ onClose }: { onClose: () => void }) {
  const { cart, itemCount, subtotal, updateQty, removeItem, clearCart, pending, error } = useCart()

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-forest/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gsf-white w-full max-w-md h-full flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-cream-dark">
          <h2 className="font-display font-bold text-forest text-2xl">
            Your Cart{' '}
            {itemCount > 0 && (
              <span className="text-gold text-lg font-medium">({itemCount})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gsf-muted hover:text-forest rounded transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingCart size={40} className="text-forest/20 mb-4" />
            <p className="font-display text-forest/40 text-xl">Your cart is empty</p>
            <p className="text-gsf-muted text-sm mt-2">Browse products to get started</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-cream-dark list-none m-0 p-0">
              {cart.map(item => (
                <li key={item.lineId} className="p-5 flex items-start gap-4">
                  {item.image && (
                    <div className="w-16 h-16 shrink-0 bg-cream border border-cream-dark rounded-sm overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-forest truncate">{item.name}</p>
                    {item.optionsText && (
                      <p className="text-xs text-gsf-muted mt-0.5 truncate">{item.optionsText}</p>
                    )}
                    <p className="text-sm text-gsf-muted mt-0.5">
                      MYR {item.price.toLocaleString()} × {item.qty}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-display font-bold text-forest text-lg">
                      MYR {(item.price * item.qty).toLocaleString()}
                    </p>
                    <div className="flex items-center border border-forest/15 rounded-sm overflow-hidden">
                      <button
                        onClick={() => updateQty(item.lineId, item.qty - 1)}
                        className="px-2 py-1 hover:bg-cream transition-colors text-xs"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 py-1 text-xs font-semibold text-forest min-w-[1.75rem] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.lineId, item.qty + 1)}
                        className="px-2 py-1 hover:bg-cream transition-colors text-xs"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.lineId)}
                      className="text-[0.7rem] text-gsf-muted/60 hover:text-forest transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-cream-dark p-6">
              <div className="flex justify-between mb-4">
                <span className="text-gsf-muted text-sm">Subtotal</span>
                <span className="font-display font-bold text-forest text-xl">
                  MYR {subtotal.toLocaleString()}
                </span>
              </div>
              {error && (
                <p className="text-red-700 text-xs mb-3">{error}</p>
              )}
              <p className="text-gsf-muted/60 text-xs mb-4 leading-relaxed">
                Shipping and taxes calculated at checkout. Custom orders require consultation.
              </p>
              <Link
                to="/checkout"
                className={`btn-primary w-full justify-center mb-2 ${pending ? 'pointer-events-none opacity-60' : ''}`}
              >
                <ShoppingCart size={14} />
                Proceed to Checkout
              </Link>
              <button
                onClick={clearCart}
                className="w-full text-xs text-gsf-muted/60 hover:text-forest transition-colors py-1.5"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const PAGE_SIZE = 12

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const { itemCount } = useCart()

  // Load this brand's live catalogue from the backend Store API.
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products])

  // Live text search across name, brand and category.
  const normalizedQuery = query.trim().toLowerCase()
  const searchMatched = useMemo(() => {
    if (!normalizedQuery) return products
    return products.filter(p =>
      p.name.toLowerCase().includes(normalizedQuery) ||
      p.brand.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery),
    )
  }, [products, normalizedQuery])

  const filtered = useMemo(() =>
    selectedCategory === 'All'
      ? searchMatched
      : searchMatched.filter(p => p.category === selectedCategory),
    [searchMatched, selectedCategory],
  )

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat)
    setMobileFiltersOpen(false)
  }, [])

  // Category counts reflect the active search so the numbers stay honest.
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: searchMatched.length }
    categories.forEach(cat => {
      c[cat] = searchMatched.filter(p => p.category === cat).length
    })
    return c
  }, [searchMatched, categories])

  // Progressive (lazy) rendering: only mount a batch of cards, growing as the
  // shopper scrolls. Reset back to the first batch whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [selectedCategory, normalizedQuery])

  const visibleProducts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(c => Math.min(c + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, filtered.length])

  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* ── Shop Header ── */}
      <div className="bg-forest grain relative overflow-hidden px-6 lg:px-12 pt-24 pb-12">
        <div className="absolute inset-0 tech-grid pointer-events-none" aria-hidden />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(184,146,58,0.18) 0%, transparent 60%), radial-gradient(ellipse at 92% 90%, rgba(232,136,28,0.10) 0%, transparent 55%)' }} />
        <div className="atmosphere" aria-hidden />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Products</p>
            <h1 className="font-display font-bold text-gsf-white leading-tight tracking-tight"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}>
              The GSF Catalogue
            </h1>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold px-4 py-2.5 rounded-sm hover:bg-gold/20 transition-colors text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ShoppingCart size={16} />
            Cart
            {itemCount > 0 && (
              <span className="ml-1 bg-gold text-forest text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-12 py-8">
        {/* Mobile filter toggle */}
        <button
          className="lg:hidden flex items-center gap-2 text-forest font-semibold text-sm mb-5 border border-forest/20 px-4 py-2.5 rounded-sm w-full justify-between bg-gsf-white"
          onClick={() => setMobileFiltersOpen(v => !v)}
        >
          <span className="flex items-center gap-2"><Filter size={14} /> Filter by Category</span>
          {mobileFiltersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-52 shrink-0`}>
            <div className="bg-gsf-white rounded-sm border border-cream-dark p-1 lg:sticky lg:top-24">
              <p className="text-[0.65rem] font-semibold tracking-widest uppercase text-forest/40 px-3 pt-3 pb-2">
                Category
              </p>
              <ul className="list-none m-0 p-0">
                {['All', ...categories].map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategorySelect(cat)}
                      className={`w-full text-left flex items-center justify-between px-3 py-2.5 text-sm rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
                        selectedCategory === cat
                          ? 'bg-forest text-gsf-white font-semibold'
                          : 'text-forest/70 hover:bg-cream hover:text-forest'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[0.65rem] font-bold ${selectedCategory === cat ? 'text-gold-light' : 'text-gsf-muted/50'}`}>
                        {counts[cat]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Live search */}
            <div className="relative mb-5">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products, brands or categories…"
                aria-label="Search products"
                className="w-full bg-gsf-white border border-cream-dark rounded-sm pl-10 pr-10 py-3 text-sm text-forest placeholder:text-gsf-muted/60 transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gsf-muted hover:text-forest rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gsf-muted">
                <span className="font-semibold text-forest">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All' && <span className="text-gold"> · {selectedCategory}</span>}
                {normalizedQuery && <span className="text-gold"> · “{query.trim()}”</span>}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20 text-gsf-muted">
                <p className="font-display text-2xl text-forest/30">Loading catalogue…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gsf-muted">
                <p className="font-display text-2xl text-forest/30">No products found</p>
                {normalizedQuery && (
                  <p className="text-sm text-gsf-muted mt-2">
                    Nothing matches “{query.trim()}”. Try a different term.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                  {visibleProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-10 text-gsf-muted">
                    <p className="font-display text-lg text-forest/30 animate-pulse">Loading more…</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer onClose={() => setCartOpen(false)} />
      )}
    </div>
  )
}
