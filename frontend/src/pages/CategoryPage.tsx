import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { type Product } from '../data/products'
import { fetchProducts } from '../lib/medusa'
import { productPath, useSeo } from '../lib/seo'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const titleFromSlug = (slug = '') =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const slug = categorySlug || ''
  const title = titleFromSlug(slug)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () => products.filter((product) => toSlug(product.category) === slug),
    [products, slug]
  )

  useSeo({
    title: `${title || 'Golf'} Products`,
    description: `Browse ${title || 'golf'} products available from GSF GolfSmart Malaysia.`,
    path: `/category/${slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${title || 'Golf'} Products`,
      url: `https://www.gsfgolf.com/category/${slug}`,
    },
  })

  return (
    <main className="bg-cream min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-gold transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <p className="section-eyebrow">Category</p>
        <h1 className="section-title-lg text-forest mt-2">{title || 'Golf Products'}</h1>
        <p className="text-gsf-muted max-w-2xl mt-4">
          {loading
            ? 'Loading products...'
            : `${visible.length} product${visible.length === 1 ? '' : 's'} found in this category.`}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {visible.map((product) => (
            <Link
              key={product.id}
              to={productPath(product)}
              className="group bg-gsf-white border border-cream-dark rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.4)]"
            >
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="p-4">
                <p className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gold mb-1">{product.brand}</p>
                <h2 className="font-display font-semibold text-forest text-lg leading-tight">{product.name}</h2>
                <p className="font-display font-bold text-forest text-xl mt-3">MYR {product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        {!loading && visible.length === 0 && (
          <div className="bg-gsf-white border border-cream-dark p-8 mt-10 text-center">
            <h2 className="font-display text-forest text-2xl font-semibold">Category needs review</h2>
            <p className="text-gsf-muted mt-2">
              This legacy category exists in Wix, but it does not match the current backend category names yet.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
