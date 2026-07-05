import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, MapPin, Package, Truck, XCircle } from 'lucide-react'
import {
  completeCart,
  fmtMoney,
  loadConfirmation,
  loadPendingCheckout,
  saveConfirmation,
  type CheckoutSnapshot,
} from '../lib/checkoutApi'
import { forgetCart } from '../hooks/useCart'
import { useSeo } from '../lib/seo'

type Status = 'working' | 'success' | 'failed' | 'unknown'

// Dedupe completion calls (React StrictMode double-runs effects in dev, and
// completing an already-completed cart would surface a spurious error).
const completions = new Map<string, ReturnType<typeof completeCart>>()
function completeOnce(cartId: string) {
  let p = completions.get(cartId)
  if (!p) {
    p = completeCart(cartId)
    completions.set(cartId, p)
    p.catch(() => completions.delete(cartId))
  }
  return p
}

/**
 * Order confirmation. Reached two ways:
 *  1. Directly after an in-page card payment (checkout already completed the
 *     cart and stored the confirmation snapshot).
 *  2. Via Stripe's return_url after an off-site redirect (FPX/GrabPay) — in
 *     that case the cart still needs to be completed here.
 * Confirmation details render from the client-side snapshot because Mercur's
 * complete endpoint only returns the order_group id/total and the order-group
 * detail route requires an authenticated customer (guest checkout).
 */
export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const cartId = params.get('cart_id')
  const redirectStatus = params.get('redirect_status')
  const [status, setStatus] = useState<Status>('working')
  const [snapshot, setSnapshot] = useState<CheckoutSnapshot | null>(null)
  const [failMessage, setFailMessage] = useState<string | null>(null)

  useSeo({
    title: 'Order Confirmation',
    description: 'Your GSF GolfSmart order confirmation.',
    path: '/order-confirmation',
  })

  useEffect(() => {
    // Already completed (in-page card flow, or a refresh of this page).
    const confirmed = loadConfirmation(cartId)
    if (confirmed) {
      setSnapshot(confirmed)
      setStatus('success')
      return
    }

    if (!cartId) {
      setStatus('unknown')
      return
    }

    if (redirectStatus === 'failed') {
      setFailMessage('Your payment was not completed. You have not been charged.')
      setStatus('failed')
      return
    }

    // Redirect return (FPX/GrabPay) — the cart still needs completing.
    const pending = loadPendingCheckout(cartId)
    completeOnce(cartId)
      .then((result) => {
        if (result.type === 'order_group') {
          const snap: CheckoutSnapshot = {
            ...(pending ?? {
              cartId,
              items: [],
              subtotal: 0,
              discountTotal: 0,
              shippingTotal: 0,
              taxTotal: 0,
              total: result.order_group.total ?? 0,
              currencyCode: 'myr',
            }),
            orderGroupId: result.order_group.id,
            orderGroupTotal: result.order_group.total,
            completedAt: new Date().toISOString(),
          }
          saveConfirmation(snap)
          forgetCart()
          setSnapshot(snap)
          setStatus('success')
        } else {
          setFailMessage(
            result.error?.message ||
              'The payment could not be confirmed, so the order was not placed.',
          )
          setStatus('failed')
        }
      })
      .catch((e) => {
        setFailMessage(e instanceof Error ? e.message : 'Something went wrong finalising the order.')
        setStatus('failed')
      })
  }, [cartId, redirectStatus])

  if (status === 'working') {
    return (
      <div className="bg-cream min-h-screen pt-40 text-center">
        <Loader2 size={24} className="animate-spin inline-block text-gold" />
        <p className="mt-4 font-display text-2xl text-forest/50">Finalising your order…</p>
        <p className="text-gsf-muted text-sm mt-2">Please don't close this page.</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="bg-cream min-h-screen pt-40 px-6 text-center">
        <XCircle size={44} className="inline-block text-red-600" />
        <h1 className="font-display text-forest text-4xl font-bold mt-4">Payment unsuccessful</h1>
        <p className="text-gsf-muted mt-3 max-w-md mx-auto">{failMessage}</p>
        <p className="text-gsf-muted text-sm mt-2">Your cart has been kept — you can try again.</p>
        <Link to="/checkout" className="btn-primary mt-8 inline-flex">Return to checkout</Link>
      </div>
    )
  }

  if (status === 'unknown' || !snapshot) {
    return (
      <div className="bg-cream min-h-screen pt-40 px-6 text-center">
        <h1 className="font-display text-forest text-4xl font-bold">No order found</h1>
        <p className="text-gsf-muted mt-3">We couldn't find an order for this session.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Browse shop</Link>
      </div>
    )
  }

  const shortRef = snapshot.orderGroupId
    ? snapshot.orderGroupId.replace(/^ordgrp_/, '').slice(-8).toUpperCase()
    : null
  const addr = snapshot.shippingAddress

  return (
    <div className="bg-cream min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-10">
        {/* Success header */}
        <div className="text-center">
          <CheckCircle2 size={52} className="inline-block text-gold" />
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-gold mt-5">
            Order confirmed
          </p>
          <h1 className="font-display text-forest text-4xl sm:text-5xl font-bold leading-tight mt-2">
            Thank you{addr?.first_name ? `, ${addr.first_name}` : ''}.
          </h1>
          <p className="text-gsf-muted mt-4 max-w-lg mx-auto">
            Your payment was received and your order has been placed with GSF GolfSmart.
            {shortRef && (
              <> Your order reference is <span className="font-semibold text-forest">#{shortRef}</span> — please
              keep it for your records.</>
            )}
          </p>
          {snapshot.email && (
            <p className="text-gsf-muted text-sm mt-2">
              Ordered as <span className="text-forest font-medium">{snapshot.email}</span>
            </p>
          )}
        </div>

        {/* Order details */}
        <div className="bg-gsf-white border border-cream-dark rounded-sm mt-10 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-dark flex items-center gap-2">
            <Package size={16} className="text-gold" />
            <h2 className="font-display text-forest text-lg font-bold m-0">Order details</h2>
          </div>

          {snapshot.items.length > 0 && (
            <ul className="list-none m-0 p-0 divide-y divide-cream-dark">
              {snapshot.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-4">
                  {item.thumbnail && (
                    <div className="w-14 h-14 shrink-0 bg-cream border border-cream-dark rounded-sm overflow-hidden">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-forest font-medium text-sm truncate">{item.title}</p>
                    {item.variantTitle && (
                      <p className="text-gsf-muted text-xs mt-0.5 truncate">{item.variantTitle}</p>
                    )}
                    <p className="text-gsf-muted text-xs mt-0.5">Qty {item.quantity}</p>
                  </div>
                  <span className="text-forest font-medium text-sm shrink-0">{fmtMoney(item.total)}</span>
                </li>
              ))}
            </ul>
          )}

          <dl className="px-6 py-5 border-t border-cream-dark space-y-2 m-0 bg-cream/40">
            <div className="flex justify-between text-sm">
              <dt className="text-gsf-muted">Subtotal</dt>
              <dd className="text-forest m-0">{fmtMoney(snapshot.subtotal)}</dd>
            </div>
            {snapshot.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <dt className="text-gsf-muted">
                  Discount{snapshot.promoCodes?.length ? ` (${snapshot.promoCodes.join(', ')})` : ''}
                </dt>
                <dd className="text-gold m-0">− {fmtMoney(snapshot.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <dt className="text-gsf-muted">Shipping{snapshot.shippingMethod ? ` · ${snapshot.shippingMethod}` : ''}</dt>
              <dd className="text-forest m-0">{fmtMoney(snapshot.shippingTotal)}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gsf-muted">Tax</dt>
              <dd className="text-forest m-0">{fmtMoney(snapshot.taxTotal)}</dd>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-cream-dark">
              <dt className="text-forest font-semibold text-sm uppercase tracking-wider">Total paid</dt>
              <dd className="font-display text-forest text-2xl font-bold m-0">
                {fmtMoney(snapshot.orderGroupTotal ?? snapshot.total)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Delivery */}
        {(addr || snapshot.shippingMethod) && (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {addr && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm p-5">
                <p className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-widest uppercase text-forest/60 mb-2">
                  <MapPin size={13} className="text-gold" /> Delivery address
                </p>
                <p className="text-sm text-forest leading-relaxed m-0">
                  {addr.first_name} {addr.last_name}<br />
                  {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ''}<br />
                  {addr.postal_code} {addr.city}, {addr.province}<br />
                  Malaysia{addr.phone ? <><br />{addr.phone}</> : null}
                </p>
              </div>
            )}
            {snapshot.shippingMethod && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm p-5">
                <p className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-widest uppercase text-forest/60 mb-2">
                  <Truck size={13} className="text-gold" /> Delivery method
                </p>
                <p className="text-sm text-forest m-0">{snapshot.shippingMethod}</p>
                <p className="text-xs text-gsf-muted mt-1 m-0">
                  {/express/i.test(snapshot.shippingMethod) ? '1–3 business days' : '3–7 business days'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/shop" className="btn-primary inline-flex">Continue shopping</Link>
          <p className="text-gsf-muted text-xs mt-4">
            Questions about your order? <Link to="/contact" className="text-gold hover:underline">Contact us</Link> with your reference.
          </p>
        </div>
      </div>
    </div>
  )
}
