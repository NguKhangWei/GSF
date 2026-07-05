import { useState, useCallback, useEffect } from 'react'
import type { Product } from '../data/products'
import {
  addLineItem,
  clearPersistedCartId,
  ensureCart,
  removeLineItem,
  resolveVariantId,
  retrieveCart,
  selectedOptionsRecord,
  selectedOptionsText,
  updateLineItem,
  type MedusaCart,
} from '../lib/checkoutApi'

// The cart is a real Medusa cart on the shared golf backend (persisted via a
// cart id in localStorage) — no more in-memory price math. This hook keeps the
// same module-level store + listener pattern as before so every component
// using it re-renders together.

export interface CartItem {
  /** Cart line id — use this for quantity updates / removal. */
  lineId: string
  productId: string
  variantId: string
  name: string
  /** Variant option summary, e.g. "10.5° / S" (absent for default variants). */
  optionsText?: string
  selectedOptions?: Record<string, string>
  /** Unit price in the cart currency (MYR). */
  price: number
  qty: number
  image?: string
}

let _cart: MedusaCart | null = null
let _initialized = false
let _pending = 0
let _error: string | null = null
let _listeners: Array<() => void> = []

function notify() {
  _listeners.forEach(fn => fn())
}

function setCart(cart: MedusaCart | null) {
  _cart = cart
  notify()
}

async function withPending<T>(work: () => Promise<T>): Promise<T | undefined> {
  _pending += 1
  _error = null
  notify()
  try {
    return await work()
  } catch (e) {
    _error = e instanceof Error ? e.message : 'Something went wrong updating your cart.'
    return undefined
  } finally {
    _pending -= 1
    notify()
  }
}

function mapItems(cart: MedusaCart | null): CartItem[] {
  const items = [...(cart?.items ?? [])]
  // Keep a stable, oldest-first order (the API returns newest first).
  items.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
  return items.map(i => ({
    lineId: i.id,
    productId: i.product_id || '',
    variantId: i.variant_id || '',
    name: i.product_title || i.title,
    optionsText: selectedOptionsText(i),
    selectedOptions: selectedOptionsRecord(i),
    price: i.unit_price,
    qty: i.quantity,
    image: i.thumbnail,
  }))
}

/** Drop the local reference to the cart (used after a completed order). */
export function forgetCart() {
  clearPersistedCartId()
  _cart = null
  notify()
}

/** Re-read the cart from the backend (used by checkout after cart updates). */
export function refreshCart(cart?: MedusaCart | null) {
  if (cart !== undefined) {
    setCart(cart)
    return
  }
  retrieveCart()
    .then(setCart)
    .catch(() => {})
}

export function useCart() {
  const [, rerender] = useState(0)

  useEffect(() => {
    const fn = () => rerender(v => v + 1)
    _listeners.push(fn)
    if (!_initialized) {
      _initialized = true
      retrieveCart()
        .then(c => { if (c) setCart(c) })
        .catch(() => {})
    }
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addItem = useCallback(
    async (product: Product, options?: Record<string, string>, qty = 1) => {
      const variantId = resolveVariantId(product, options)
      if (!variantId) {
        _error = 'This product cannot be added to the cart right now.'
        notify()
        return
      }
      await withPending(async () => {
        const cart = _cart ?? (await ensureCart())
        const metadata = options && Object.keys(options).length
          ? { selected_options: options }
          : undefined
        setCart(await addLineItem(cart.id, variantId, qty, metadata))
      })
    },
    [],
  )

  const removeItem = useCallback(async (lineId: string) => {
    if (!_cart) return
    await withPending(async () => {
      setCart(await removeLineItem(_cart!.id, lineId))
    })
  }, [])

  const updateQty = useCallback(async (lineId: string, qty: number) => {
    if (!_cart) return
    await withPending(async () => {
      if (qty < 1) {
        setCart(await removeLineItem(_cart!.id, lineId))
      } else {
        setCart(await updateLineItem(_cart!.id, lineId, qty))
      }
    })
  }, [])

  const clearCart = useCallback(() => {
    // Cheap + reliable: abandon the backend cart and start fresh next add.
    forgetCart()
  }, [])

  const items = mapItems(_cart)
  const itemCount = items.reduce((s, c) => s + c.qty, 0)
  const subtotal = _cart?.item_subtotal ?? 0
  const total = _cart?.total ?? 0

  return {
    cart: items,
    medusaCart: _cart,
    itemCount,
    subtotal,
    total,
    pending: _pending > 0,
    error: _error,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  }
}
