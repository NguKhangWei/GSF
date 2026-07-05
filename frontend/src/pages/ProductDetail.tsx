import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ShoppingCart } from 'lucide-react'
import { type Product } from '../data/products'
import { fetchProducts } from '../lib/medusa'
import { findProductBySlug, productJsonLd, productPath, useSeo } from '../lib/seo'
import { parseSpecs } from '../lib/specs'
import { useCart } from '../hooks/useCart'

function ProductDetailContent({ product }: { product: Product }) {
  const { addItem } = useCart()
  const path = productPath(product)

  const parsedSpecs = useMemo(() => parseSpecs(product.specs), [product.specs])
  const choices = useMemo(() => parsedSpecs.filter((s) => s.selectable), [parsedSpecs])
  const details = useMemo(
    () => parsedSpecs.filter((s) => !s.selectable && s.values.length === 1),
    [parsedSpecs],
  )
  const features = useMemo(
    () => parsedSpecs.filter((s) => !s.selectable && s.values.length === 0),
    [parsedSpecs],
  )

  // Default every dropdown to its first value so the configuration is always valid.
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(choices.map((c) => [c.label, c.values[0]])),
  )

  useSeo({
    title: `${product.name} - ${product.brand}`,
    description: product.description.slice(0, 155),
    path,
    image: product.image,
    type: 'product',
    jsonLd: productJsonLd(product),
  })

  const handleAddToCart = () =>
    addItem(product, choices.length ? selected : undefined)

  return (
    <article className="bg-cream min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-gold transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] gap-8 lg:gap-12 items-start">
          <div className="bg-gsf-white border border-cream-dark rounded-sm overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          </div>

          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-gold mb-2">{product.brand}</p>
            <h1 className="font-display text-forest text-4xl sm:text-5xl font-bold leading-tight">{product.name}</h1>
            <p className="text-gsf-muted mt-3">{product.category}</p>
            <p className="font-display text-forest text-3xl font-bold mt-7">MYR {product.price.toLocaleString()}</p>
            <p className="text-gsf-muted leading-relaxed mt-6">{product.description}</p>

            {choices.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[0.7rem] font-semibold tracking-widest uppercase text-forest/60 mb-3">Configure</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {choices.map((choice) => (
                    <label key={choice.label} className="block">
                      <span className="block text-[0.7rem] font-semibold tracking-widest uppercase text-forest/60 mb-1.5">
                        {choice.label}
                      </span>
                      <span className="relative block">
                        <select
                          value={selected[choice.label] ?? ''}
                          onChange={(e) =>
                            setSelected((prev) => ({ ...prev, [choice.label]: e.target.value }))
                          }
                          className="w-full appearance-none bg-gsf-white border border-cream-dark rounded-sm pl-4 pr-10 py-3 text-sm text-forest font-medium cursor-pointer transition-colors hover:border-gold focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
                        >
                          {choice.values.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {details.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[0.7rem] font-semibold tracking-widest uppercase text-forest/60 mb-3">Specifications</h2>
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-0 m-0">
                  {details.map((detail) => (
                    <div
                      key={detail.label}
                      className="flex items-baseline justify-between gap-4 border-b border-cream-dark py-2.5"
                    >
                      <dt className="text-sm text-gsf-muted">{detail.label}</dt>
                      <dd className="text-sm font-medium text-forest text-right m-0">{detail.values[0]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 list-none p-0 m-0">
                {features.map((feature) => (
                  <li
                    key={feature.label}
                    className="bg-gsf-white border border-cream-dark rounded-sm px-3 py-1.5 text-xs font-medium text-forest/80"
                  >
                    {feature.label}
                  </li>
                ))}
              </ul>
            )}

            <button onClick={handleAddToCart} className="btn-primary mt-8">
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ProductDetail() {
  const params = useParams()
  const slug = params.handle || params.legacySlug
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const product = useMemo(() => findProductBySlug(products, slug), [products, slug])

  if (loading) {
    return (
      <div className="bg-cream min-h-screen pt-32 px-6 text-center text-forest">
        Loading product...
      </div>
    )
  }

  if (params.legacySlug && product) {
    return <Navigate to={productPath(product)} replace />
  }

  if (!product) {
    return (
      <div className="bg-cream min-h-screen pt-32 px-6 text-center">
        <h1 className="font-display text-forest text-4xl font-bold">Product not found</h1>
        <p className="text-gsf-muted mt-3">This product may have moved during the catalog migration.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Browse shop</Link>
      </div>
    )
  }

  return <ProductDetailContent key={product.id} product={product} />
}
