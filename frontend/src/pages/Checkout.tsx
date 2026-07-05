import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe, type Stripe, type Appearance } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  X,
} from 'lucide-react'
import {
  addShippingMethod,
  applyPromoCode,
  attachCustomerToCart,
  completeCart,
  fmtMoney,
  initiatePaymentSession,
  lineTotal,
  listShippingOptions,
  removePromoCode,
  retrieveCart,
  saveConfirmation,
  savePendingCheckout,
  selectedOptionsText,
  snapshotFromCart,
  updateCart,
  STRIPE_PUBLISHABLE_KEY,
  type MedusaAddress,
  type MedusaCart,
  type PaymentSessionInfo,
  type ShippingOption,
} from '../lib/checkoutApi'
import { forgetCart, refreshCart } from '../hooks/useCart'
import { useSeo } from '../lib/seo'
import { useCustomer } from '../context/CustomerContext'
import * as customerApi from '../lib/customerApi'
import type { CustomerAddress } from '../lib/customerApi'
import { MY_STATES } from '../lib/states'

/* ─────────────────────────── Constants ─────────────────────────── */

type Step = 'info' | 'shipping' | 'payment'
const STEP_ORDER: Step[] = ['info', 'shipping', 'payment']

interface AddressForm {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  phone: string
}

const emptyAddress = (): AddressForm => ({
  first_name: '', last_name: '', company: '', address_1: '', address_2: '',
  city: '', province: '', postal_code: '', phone: '',
})

const fromMedusaAddress = (a?: MedusaAddress | null): AddressForm => ({
  first_name: a?.first_name || '', last_name: a?.last_name || '',
  company: a?.company || '', address_1: a?.address_1 || '',
  address_2: a?.address_2 || '', city: a?.city || '',
  province: a?.province || '', postal_code: a?.postal_code || '',
  phone: a?.phone || '',
})

const fromCustomerAddress = (a: CustomerAddress): AddressForm => ({
  first_name: a.first_name || '', last_name: a.last_name || '',
  company: a.company || '', address_1: a.address_1 || '',
  address_2: a.address_2 || '', city: a.city || '',
  province: a.province || '', postal_code: a.postal_code || '',
  phone: a.phone || '',
})

const toMedusaAddress = (f: AddressForm): MedusaAddress => ({
  first_name: f.first_name.trim(), last_name: f.last_name.trim(),
  company: f.company.trim() || undefined, address_1: f.address_1.trim(),
  address_2: f.address_2.trim() || undefined, city: f.city.trim(),
  province: f.province, postal_code: f.postal_code.trim(),
  country_code: 'my', phone: f.phone.trim() || undefined,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateAddress(f: AddressForm, prefix: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!f.first_name.trim()) errors[`${prefix}first_name`] = 'First name is required'
  if (!f.last_name.trim()) errors[`${prefix}last_name`] = 'Last name is required'
  if (!f.address_1.trim()) errors[`${prefix}address_1`] = 'Address is required'
  if (!f.city.trim()) errors[`${prefix}city`] = 'City is required'
  if (!f.province) errors[`${prefix}province`] = 'Select a state'
  if (!/^\d{5}$/.test(f.postal_code.trim())) errors[`${prefix}postal_code`] = 'Enter a valid 5-digit postcode'
  return errors
}

/* ─────────────────────────── Stripe setup ─────────────────────────── */

const stripeCache: Record<string, Promise<Stripe | null>> = {}
function getStripe(connectedAccountId: string) {
  if (!stripeCache[connectedAccountId]) {
    stripeCache[connectedAccountId] = loadStripe(STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: connectedAccountId,
    })
  }
  return stripeCache[connectedAccountId]
}

const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#B8923A',
    colorBackground: '#FAFAF7',
    colorText: '#0D0D0F',
    colorTextSecondary: '#6B6B72',
    colorDanger: '#B91C1C',
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: '2px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid #EDE8DC', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #B8923A', boxShadow: '0 0 0 1px #B8923A' },
    '.Label': {
      textTransform: 'uppercase', letterSpacing: '0.08em',
      fontSize: '11px', fontWeight: '600', color: '#6B6B72',
    },
  },
}

/* ─────────────────────────── Small UI atoms ─────────────────────────── */

const inputCls = (invalid?: boolean) =>
  `w-full bg-gsf-white border rounded-sm px-4 py-3 text-sm text-forest font-medium transition-colors placeholder:text-gsf-muted/60 focus-visible:outline-none focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold ${
    invalid ? 'border-red-400' : 'border-cream-dark hover:border-gold/50'
  }`

const labelCls = 'block text-[0.68rem] font-semibold tracking-widest uppercase text-forest/60 mb-1.5'

function Field({
  label, error, children, optional,
}: {
  label: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {optional && <span className="text-gsf-muted/60 normal-case tracking-normal font-normal"> (optional)</span>}
      </span>
      {children}
      {error && <span className="block text-red-700 text-xs mt-1">{error}</span>}
    </label>
  )
}

function SavedAddressPicker({
  label, addresses, selectedId, onSelect, onNew,
}: {
  label: string
  addresses: CustomerAddress[]
  selectedId: string
  onSelect: (a: CustomerAddress) => void
  onNew: () => void
}) {
  if (!addresses.length) return null
  return (
    <div className="mb-5 space-y-2.5">
      <p className={labelCls}>{label}</p>
      {addresses.map((a) => (
        <label key={a.id}
          className={`flex items-center gap-3 border rounded-sm px-4 py-3.5 cursor-pointer transition-colors ${selectedId === a.id ? 'border-gold bg-gold-faint' : 'border-cream-dark hover:border-gold/40'}`}>
          <input type="radio" checked={selectedId === a.id} onChange={() => onSelect(a)} className="accent-[#B8923A]" />
          <span className="text-sm">
            <span className="block font-medium text-forest">{a.first_name} {a.last_name}</span>
            <span className="block text-xs text-gsf-muted">
              {[a.address_1, a.city, a.postal_code].filter(Boolean).join(', ')}
            </span>
          </span>
        </label>
      ))}
      <label className={`flex items-center gap-3 border rounded-sm px-4 py-3.5 cursor-pointer transition-colors ${selectedId === 'new' ? 'border-gold bg-gold-faint' : 'border-cream-dark hover:border-gold/40'}`}>
        <input type="radio" checked={selectedId === 'new'} onChange={onNew} className="accent-[#B8923A]" />
        <span className="text-sm font-medium text-forest">Enter a new address</span>
      </label>
    </div>
  )
}

function AddressFields({
  form, setForm, errors, prefix,
}: {
  form: AddressForm
  setForm: (f: AddressForm) => void
  errors: Record<string, string>
  prefix: string
}) {
  const set = (k: keyof AddressForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="First name" error={errors[`${prefix}first_name`]}>
        <input className={inputCls(!!errors[`${prefix}first_name`])} value={form.first_name}
          onChange={set('first_name')} autoComplete="given-name" />
      </Field>
      <Field label="Last name" error={errors[`${prefix}last_name`]}>
        <input className={inputCls(!!errors[`${prefix}last_name`])} value={form.last_name}
          onChange={set('last_name')} autoComplete="family-name" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Company" optional>
          <input className={inputCls()} value={form.company} onChange={set('company')}
            autoComplete="organization" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Address" error={errors[`${prefix}address_1`]}>
          <input className={inputCls(!!errors[`${prefix}address_1`])} value={form.address_1}
            onChange={set('address_1')} placeholder="Street address, unit, building"
            autoComplete="address-line1" />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Apartment, suite, etc." optional>
          <input className={inputCls()} value={form.address_2} onChange={set('address_2')}
            autoComplete="address-line2" />
        </Field>
      </div>
      <Field label="City" error={errors[`${prefix}city`]}>
        <input className={inputCls(!!errors[`${prefix}city`])} value={form.city}
          onChange={set('city')} autoComplete="address-level2" />
      </Field>
      <Field label="State" error={errors[`${prefix}province`]}>
        <span className="relative block">
          <select
            className={`${inputCls(!!errors[`${prefix}province`])} appearance-none pr-10 cursor-pointer`}
            value={form.province} onChange={set('province')} autoComplete="address-level1"
          >
            <option value="">Select state…</option>
            {MY_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold" />
        </span>
      </Field>
      <Field label="Postcode" error={errors[`${prefix}postal_code`]}>
        <input className={inputCls(!!errors[`${prefix}postal_code`])} value={form.postal_code}
          onChange={set('postal_code')} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
      </Field>
      <Field label="Country">
        <input className={`${inputCls()} bg-cream text-gsf-muted cursor-not-allowed`} value="Malaysia" disabled />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Phone" error={errors[`${prefix}phone`]}>
          <input className={inputCls(!!errors[`${prefix}phone`])} value={form.phone}
            onChange={set('phone')} placeholder="+60 12-345 6789" inputMode="tel" autoComplete="tel" />
        </Field>
      </div>
    </div>
  )
}

/* ─────────────────────────── Payment form ─────────────────────────── */

function PaymentForm({
  cart, onCompleted, onError,
}: {
  cart: MedusaCart
  onCompleted: (orderGroupId?: string, orderGroupTotal?: number) => void
  onError: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const handlePay = async () => {
    if (!stripe || !elements || submitting) return
    setSubmitting(true)
    setPayError(null)
    // Snapshot the cart so the confirmation page can render for guests even
    // after an off-site redirect (FPX/GrabPay) — see checkoutApi.ts.
    savePendingCheckout(snapshotFromCart(cart))

    const returnUrl = `${window.location.origin}/order-confirmation?cart_id=${cart.id}`
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    })

    if (error) {
      setPayError(error.message || 'Payment failed. Please try again.')
      setSubmitting(false)
      return
    }
    if (
      paymentIntent &&
      ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)
    ) {
      try {
        const result = await completeCart(cart.id)
        if (result.type === 'order_group') {
          onCompleted(result.order_group.id, result.order_group.total)
        } else {
          onError(result.error?.message || 'The payment went through, but the order could not be finalized. Please contact us.')
        }
      } catch (e) {
        onError(e instanceof Error ? e.message : 'The order could not be finalized. Please contact us.')
      }
    } else {
      setPayError('The payment could not be confirmed. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <PaymentElement options={{ layout: 'tabs' }} />
      {payError && (
        <p className="text-red-700 text-sm mt-4" role="alert">{payError}</p>
      )}
      <button
        onClick={handlePay}
        disabled={!stripe || submitting}
        className="btn-primary w-full justify-center mt-6 disabled:opacity-60 disabled:pointer-events-none"
      >
        {submitting ? (
          <><Loader2 size={15} className="animate-spin" /> Processing…</>
        ) : (
          <><Lock size={14} /> Pay {fmtMoney(cart.total)}</>
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[0.7rem] text-gsf-muted mt-4">
        <ShieldCheck size={13} className="text-gold" />
        Payments are encrypted and processed securely by Stripe.
      </p>
    </div>
  )
}

/* ─────────────────────────── Order summary ─────────────────────────── */

function OrderSummary({
  cart, busy, onApplyPromo, onRemovePromo, promoError,
}: {
  cart: MedusaCart
  busy: boolean
  onApplyPromo: (code: string) => Promise<void>
  onRemovePromo: (code: string) => Promise<void>
  promoError: string | null
}) {
  const [code, setCode] = useState('')
  const [applying, setApplying] = useState(false)
  const codes = (cart.promotions || []).filter((p) => p.code && !p.is_automatic)

  const apply = async () => {
    if (!code.trim() || applying) return
    setApplying(true)
    await onApplyPromo(code.trim().toUpperCase())
    setApplying(false)
    setCode('')
  }

  const shippingSelected = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <aside className="bg-forest border border-gold/20 rounded-sm p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-gsf-white text-xl font-bold mb-5 flex items-center gap-2">
        <ShoppingBag size={17} className="text-gold" />
        Order Summary
      </h2>

      <ul className="list-none m-0 p-0 space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="relative w-14 h-14 shrink-0 rounded-sm overflow-hidden bg-forest-light border border-white/10">
              {item.thumbnail && (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              )}
              <span className="absolute -top-0 -right-0 bg-gold text-forest text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-bl-sm flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gsf-white text-sm font-medium leading-snug truncate">
                {item.product_title || item.title}
              </p>
              {selectedOptionsText(item) && (
                <p className="text-gsf-white/50 text-xs mt-0.5 truncate">{selectedOptionsText(item)}</p>
              )}
            </div>
            <span className="text-gsf-white text-sm font-medium shrink-0">{fmtMoney(lineTotal(item))}</span>
          </li>
        ))}
      </ul>

      {/* Promo code */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/70" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
              placeholder="Promo code"
              className="w-full bg-forest-mid border border-white/15 rounded-sm pl-9 pr-3 py-2.5 text-sm text-gsf-white placeholder:text-gsf-white/40 focus-visible:outline-none focus-visible:border-gold"
            />
          </div>
          <button
            onClick={apply}
            disabled={!code.trim() || applying || busy}
            className="px-4 py-2.5 bg-gold/15 border border-gold/40 text-gold text-xs font-semibold tracking-wider uppercase rounded-sm hover:bg-gold/25 transition-colors disabled:opacity-50"
          >
            {applying ? '…' : 'Apply'}
          </button>
        </div>
        {promoError && <p className="text-red-400 text-xs mt-2">{promoError}</p>}
        {codes.length > 0 && (
          <ul className="flex flex-wrap gap-2 list-none m-0 p-0 mt-3">
            {codes.map((p) => (
              <li key={p.id} className="inline-flex items-center gap-1.5 bg-gold/15 border border-gold/40 text-gold text-xs font-semibold px-2.5 py-1 rounded-sm">
                <Tag size={11} />
                {p.code}
                <button
                  onClick={() => onRemovePromo(p.code!)}
                  className="text-gold/70 hover:text-gold ml-0.5"
                  aria-label={`Remove code ${p.code}`}
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totals */}
      <dl className="mt-6 pt-5 border-t border-white/10 space-y-2.5 m-0">
        <div className="flex justify-between text-sm">
          <dt className="text-gsf-white/60">Subtotal</dt>
          <dd className="text-gsf-white m-0">{fmtMoney(cart.item_subtotal)}</dd>
        </div>
        {cart.discount_total > 0 && (
          <div className="flex justify-between text-sm">
            <dt className="text-gsf-white/60">Discount</dt>
            <dd className="text-gold m-0">− {fmtMoney(cart.discount_total)}</dd>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <dt className="text-gsf-white/60">Shipping</dt>
          <dd className="text-gsf-white m-0">
            {shippingSelected ? fmtMoney(cart.shipping_total) : 'Calculated at next step'}
          </dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-gsf-white/60">Tax</dt>
          <dd className="text-gsf-white m-0">{fmtMoney(cart.tax_total)}</dd>
        </div>
        <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
          <dt className="text-gsf-white font-semibold text-sm uppercase tracking-wider">Total</dt>
          <dd className="font-display text-gold text-2xl font-bold m-0">{fmtMoney(cart.total)}</dd>
        </div>
      </dl>

      <p className="flex items-center gap-2 text-[0.7rem] text-gsf-white/50 mt-5">
        <Lock size={12} className="text-gold/70 shrink-0" />
        Secure SSL checkout · Cards, FPX &amp; GrabPay via Stripe
      </p>
    </aside>
  )
}

/* ─────────────────────────── Checkout page ─────────────────────────── */

export default function Checkout() {
  const navigate = useNavigate()
  const { customer } = useCustomer()
  const [cart, setCart] = useState<MedusaCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('info')
  const [busy, setBusy] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)

  // Step 1 — contact + addresses
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(false)
  const [shipping, setShipping] = useState<AddressForm>(emptyAddress())
  const [billingSame, setBillingSame] = useState(true)
  const [billing, setBilling] = useState<AddressForm>(emptyAddress())
  const [orderNotes, setOrderNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Saved addresses (logged-in customers only)
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([])
  const [selectedShipId, setSelectedShipId] = useState('new')
  const [selectedBillId, setSelectedBillId] = useState('new')
  const attachedCustomerCartId = useRef<string | null>(null)

  // Step 2 — shipping method
  const [options, setOptions] = useState<ShippingOption[] | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Step 3 — payment
  const [payment, setPayment] = useState<PaymentSessionInfo | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useSeo({
    title: 'Checkout',
    description: 'Secure checkout — GSF GolfSmart. Cards, FPX and GrabPay accepted.',
    path: '/checkout',
  })

  const syncCart = useCallback((next: MedusaCart) => {
    setCart(next)
    refreshCart(next)
  }, [])

  // Load the cart and prefill from any previous attempt.
  useEffect(() => {
    retrieveCart()
      .then((c) => {
        if (c) {
          setCart(c)
          if (c.email) setEmail(c.email)
          if (c.shipping_address?.address_1) setShipping(fromMedusaAddress(c.shipping_address))
          if (c.billing_address?.address_1) {
            setBilling(fromMedusaAddress(c.billing_address))
            setBillingSame(false)
          }
        }
      })
      .catch(() => setStepError('We could not load your cart. Please refresh the page.'))
      .finally(() => setLoading(false))
  }, [])

  // Logged-in customers: load the address book and prefill the contact email.
  useEffect(() => {
    if (!customer) {
      setSavedAddresses([])
      return
    }
    customerApi.listAddresses().then(setSavedAddresses).catch(() => {})
    setEmail((e) => e || customer.email)
  }, [customer])

  // Associate the cart with the logged-in customer so the completed order
  // shows up under Account → Orders (guest carts otherwise stay unlinked).
  useEffect(() => {
    if (!customer || !cart || attachedCustomerCartId.current === cart.id) return
    attachedCustomerCartId.current = cart.id
    attachCustomerToCart(cart.id).catch(() => {})
  }, [customer, cart])

  const chooseSavedAddress = (kind: 'ship' | 'bill', addr: CustomerAddress) => {
    const mapped = fromCustomerAddress(addr)
    if (kind === 'ship') {
      setShipping(mapped)
      setSelectedShipId(addr.id)
    } else {
      setBilling(mapped)
      setSelectedBillId(addr.id)
    }
  }

  /* ── Step 1 submit ── */
  const submitInfo = async () => {
    if (!cart || busy) return
    const nextErrors: Record<string, string> = {}
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = 'Enter a valid email address'
    if (!shipping.phone.trim()) nextErrors['ship_phone'] = 'Phone is required for delivery updates'
    Object.assign(nextErrors, validateAddress(shipping, 'ship_'))
    if (!billingSame) Object.assign(nextErrors, validateAddress(billing, 'bill_'))
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setBusy(true)
    setStepError(null)
    try {
      const shippingAddress = toMedusaAddress(shipping)
      const updated = await updateCart(cart.id, {
        email: email.trim(),
        shipping_address: shippingAddress,
        billing_address: billingSame ? shippingAddress : toMedusaAddress(billing),
        metadata: {
          newsletter_opt_in: newsletter,
          ...(orderNotes.trim() ? { order_notes: orderNotes.trim() } : {}),
        },
      })
      syncCart(updated)
      setStep('shipping')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setStepError(e instanceof Error ? e.message : 'Could not save your details.')
    } finally {
      setBusy(false)
    }
  }

  /* ── Step 2: load options when entering ── */
  useEffect(() => {
    if (step !== 'shipping' || !cart || options) return
    listShippingOptions(cart.id)
      .then((opts) => {
        setOptions(opts)
        const current = cart.shipping_methods?.[0]?.shipping_option_id
        setSelectedOption(current || opts[0]?.id || null)
      })
      .catch((e) =>
        setStepError(e instanceof Error ? e.message : 'Could not load shipping options.'),
      )
  }, [step, cart, options])

  const submitShipping = async () => {
    if (!cart || !selectedOption || busy) return
    setBusy(true)
    setStepError(null)
    try {
      const updated = await addShippingMethod(cart.id, selectedOption)
      syncCart(updated)
      setPayment(null) // totals changed → session must be (re)created
      setStep('payment')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setStepError(e instanceof Error ? e.message : 'Could not set the shipping method.')
    } finally {
      setBusy(false)
    }
  }

  /* ── Step 3: initiate the Stripe session when entering / after total changes ── */
  useEffect(() => {
    if (step !== 'payment' || !cart || payment || paymentLoading) return
    if (!STRIPE_PUBLISHABLE_KEY) {
      setStepError('Payment is not configured (missing Stripe publishable key).')
      return
    }
    setPaymentLoading(true)
    setStepError(null)
    initiatePaymentSession(cart.id)
      .then(setPayment)
      .catch((e) =>
        setStepError(e instanceof Error ? e.message : 'Could not start the payment.'),
      )
      .finally(() => setPaymentLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cart?.id, cart?.total, payment])

  /* ── Promotions (usable at any step; resyncs payment session) ── */
  const handleApplyPromo = async (codeInput: string) => {
    if (!cart) return
    setPromoError(null)
    try {
      const updated = await applyPromoCode(cart.id, codeInput)
      const applied = (updated.promotions || []).some(
        (p) => p.code?.toUpperCase() === codeInput.toUpperCase(),
      )
      syncCart(updated)
      if (!applied) {
        setPromoError(`Code “${codeInput}” is not valid for this order.`)
      } else if (step === 'payment') {
        setPayment(null) // total changed → recreate the payment session
      }
    } catch (e) {
      setPromoError(e instanceof Error ? e.message : 'Could not apply that code.')
    }
  }

  const handleRemovePromo = async (codeInput: string) => {
    if (!cart) return
    setPromoError(null)
    try {
      const updated = await removePromoCode(cart.id, codeInput)
      syncCart(updated)
      if (step === 'payment') setPayment(null)
    } catch (e) {
      setPromoError(e instanceof Error ? e.message : 'Could not remove that code.')
    }
  }

  /* ── Completion ── */
  const handleCompleted = (orderGroupId?: string, orderGroupTotal?: number) => {
    if (cart) {
      saveConfirmation({
        ...snapshotFromCart(cart),
        orderGroupId,
        orderGroupTotal,
        completedAt: new Date().toISOString(),
      })
    }
    forgetCart()
    navigate(`/order-confirmation?cart_id=${cart?.id ?? ''}`)
  }

  /* ─────────────────────────── Render ─────────────────────────── */

  if (loading) {
    return (
      <div className="bg-cream min-h-screen pt-40 text-center text-gsf-muted">
        <Loader2 size={22} className="animate-spin inline-block text-gold" />
        <p className="mt-3 font-display text-xl text-forest/40">Preparing checkout…</p>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-cream min-h-screen pt-40 px-6 text-center">
        <ShoppingBag size={40} className="text-forest/20 inline-block" />
        <h1 className="font-display text-forest text-4xl font-bold mt-4">Your cart is empty</h1>
        <p className="text-gsf-muted mt-3">Add something from the catalogue to check out.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Browse shop</Link>
      </div>
    )
  }

  const stepIndex = STEP_ORDER.indexOf(step)
  const stepsMeta: { key: Step; label: string }[] = [
    { key: 'info', label: 'Information' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
  ]

  const shipSummary = [
    shipping.address_1, shipping.address_2, shipping.city,
    shipping.province, shipping.postal_code, 'Malaysia',
  ].filter(Boolean).join(', ')

  return (
    <div className="bg-cream min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="pt-8 pb-6">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-gold transition-colors">
            <ChevronLeft size={16} />
            Continue shopping
          </Link>
          <h1 className="font-display text-forest text-4xl sm:text-5xl font-bold leading-tight mt-3">
            Checkout
          </h1>

          {/* Stepper */}
          <ol className="flex items-center gap-2 sm:gap-3 mt-6 list-none m-0 p-0 flex-wrap">
            {stepsMeta.map((s, i) => {
              const done = i < stepIndex
              const active = i === stepIndex
              return (
                <li key={s.key} className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => done && setStep(s.key)}
                    disabled={!done}
                    className={`flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                      active ? 'text-gold' : done ? 'text-forest hover:text-gold' : 'text-gsf-muted/50'
                    } ${done ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] ${
                      active ? 'border-gold bg-gold text-forest' : done ? 'border-gold text-gold' : 'border-gsf-muted/30'
                    }`}>
                      {done ? <Check size={13} /> : i + 1}
                    </span>
                    {s.label}
                  </button>
                  {i < stepsMeta.length - 1 && <span className="w-8 sm:w-12 h-px bg-forest/15" />}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
          {/* ── Left: steps ── */}
          <div className="space-y-5 min-w-0">
            {stepError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-sm px-4 py-3" role="alert">
                {stepError}
              </div>
            )}

            {/* Completed-step recaps */}
            {stepIndex > 0 && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm divide-y divide-cream-dark">
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0 text-sm">
                    <span className="text-gsf-muted text-xs uppercase tracking-wider font-semibold mr-3">Contact</span>
                    <span className="text-forest">{email}</span>
                  </div>
                  <button onClick={() => setStep('info')} className="text-xs font-semibold text-gold hover:text-gold-muted uppercase tracking-wider shrink-0">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0 text-sm">
                    <span className="text-gsf-muted text-xs uppercase tracking-wider font-semibold mr-3">Ship to</span>
                    <span className="text-forest">{shipSummary}</span>
                  </div>
                  <button onClick={() => setStep('info')} className="text-xs font-semibold text-gold hover:text-gold-muted uppercase tracking-wider shrink-0">
                    Change
                  </button>
                </div>
                {stepIndex > 1 && cart.shipping_methods?.[0] && (
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0 text-sm">
                      <span className="text-gsf-muted text-xs uppercase tracking-wider font-semibold mr-3">Method</span>
                      <span className="text-forest">
                        {cart.shipping_methods[0].name} · {fmtMoney(cart.shipping_methods[0].amount)}
                      </span>
                    </div>
                    <button onClick={() => setStep('shipping')} className="text-xs font-semibold text-gold hover:text-gold-muted uppercase tracking-wider shrink-0">
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 1 — Information */}
            {step === 'info' && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm p-6 sm:p-8">
                <h2 className="font-display text-forest text-2xl font-bold mb-5">Contact</h2>
                <div className="grid gap-4">
                  <Field label="Email" error={errors.email}>
                    <input
                      type="email" className={inputCls(!!errors.email)} value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email"
                    />
                  </Field>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox" checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="w-4 h-4 accent-[#B8923A]"
                    />
                    <span className="text-sm text-gsf-muted">Email me with news and offers</span>
                  </label>
                </div>

                <h2 className="font-display text-forest text-2xl font-bold mt-8 mb-2">Shipping address</h2>
                <p className="text-gsf-muted text-xs mb-5">We currently deliver within Malaysia only.</p>
                <SavedAddressPicker
                  label="Ship to a saved address"
                  addresses={savedAddresses}
                  selectedId={selectedShipId}
                  onSelect={(a) => chooseSavedAddress('ship', a)}
                  onNew={() => { setSelectedShipId('new'); setShipping(emptyAddress()) }}
                />
                <AddressFields form={shipping} setForm={setShipping} errors={errors} prefix="ship_" />

                <h2 className="font-display text-forest text-2xl font-bold mt-8 mb-4">Billing address</h2>
                <div className="space-y-2.5">
                  <label className={`flex items-center gap-3 border rounded-sm px-4 py-3.5 cursor-pointer transition-colors ${billingSame ? 'border-gold bg-gold-faint' : 'border-cream-dark hover:border-gold/40'}`}>
                    <input type="radio" name="billing" checked={billingSame}
                      onChange={() => setBillingSame(true)} className="accent-[#B8923A]" />
                    <span className="text-sm font-medium text-forest">Same as shipping address</span>
                  </label>
                  <label className={`flex items-center gap-3 border rounded-sm px-4 py-3.5 cursor-pointer transition-colors ${!billingSame ? 'border-gold bg-gold-faint' : 'border-cream-dark hover:border-gold/40'}`}>
                    <input type="radio" name="billing" checked={!billingSame}
                      onChange={() => setBillingSame(false)} className="accent-[#B8923A]" />
                    <span className="text-sm font-medium text-forest">Use a different billing address</span>
                  </label>
                </div>
                {!billingSame && (
                  <div className="mt-5 pt-5 border-t border-cream-dark">
                    <SavedAddressPicker
                      label="Bill to a saved address"
                      addresses={savedAddresses}
                      selectedId={selectedBillId}
                      onSelect={(a) => chooseSavedAddress('bill', a)}
                      onNew={() => { setSelectedBillId('new'); setBilling(emptyAddress()) }}
                    />
                    <AddressFields form={billing} setForm={setBilling} errors={errors} prefix="bill_" />
                  </div>
                )}

                <div className="mt-8">
                  <Field label="Order notes" optional>
                    <textarea
                      className={`${inputCls()} min-h-[80px] resize-y`} value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Delivery instructions, fitting requests…"
                    />
                  </Field>
                </div>

                <button onClick={submitInfo} disabled={busy}
                  className="btn-primary w-full justify-center mt-8 disabled:opacity-60 disabled:pointer-events-none">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
                  Continue to shipping
                </button>
              </div>
            )}

            {/* Step 2 — Shipping method */}
            {step === 'shipping' && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm p-6 sm:p-8">
                <h2 className="font-display text-forest text-2xl font-bold mb-5">Delivery method</h2>
                {!options ? (
                  <p className="text-gsf-muted text-sm py-6 text-center">
                    <Loader2 size={16} className="animate-spin inline-block mr-2 text-gold" />
                    Loading delivery options…
                  </p>
                ) : options.length === 0 ? (
                  <p className="text-gsf-muted text-sm">
                    No delivery options are available for this address. Please
                    <Link to="/contact" className="text-gold hover:underline ml-1">contact us</Link>.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {options.map((opt) => {
                      const express = /express/i.test(opt.name)
                      return (
                        <label key={opt.id}
                          className={`flex items-center gap-4 border rounded-sm px-4 py-4 cursor-pointer transition-colors ${
                            selectedOption === opt.id ? 'border-gold bg-gold-faint' : 'border-cream-dark hover:border-gold/40'
                          }`}>
                          <input type="radio" name="shipping-option" checked={selectedOption === opt.id}
                            onChange={() => setSelectedOption(opt.id)} className="accent-[#B8923A]" />
                          <Truck size={18} className={express ? 'text-gold' : 'text-forest/50'} />
                          <span className="flex-1">
                            <span className="block text-sm font-semibold text-forest">{opt.name}</span>
                            <span className="block text-xs text-gsf-muted mt-0.5">
                              {express ? '1–3 business days' : '3–7 business days'} · Malaysia-wide
                            </span>
                          </span>
                          <span className="font-display font-bold text-forest">{fmtMoney(opt.amount)}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 mt-8">
                  <button onClick={() => setStep('info')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-gold transition-colors">
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button onClick={submitShipping} disabled={busy || !selectedOption}
                    className="btn-primary disabled:opacity-60 disabled:pointer-events-none">
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                    Continue to payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Payment */}
            {step === 'payment' && (
              <div className="bg-gsf-white border border-cream-dark rounded-sm p-6 sm:p-8">
                <h2 className="font-display text-forest text-2xl font-bold mb-1">Payment</h2>
                <p className="flex items-center gap-1.5 text-xs text-gsf-muted mb-6">
                  <Lock size={12} className="text-gold" />
                  All transactions are secure and encrypted. Card, FPX &amp; GrabPay accepted.
                </p>
                {paymentLoading || !payment ? (
                  <p className="text-gsf-muted text-sm py-8 text-center">
                    <Loader2 size={16} className="animate-spin inline-block mr-2 text-gold" />
                    Preparing secure payment…
                  </p>
                ) : (
                  <Elements
                    key={payment.clientSecret}
                    stripe={getStripe(payment.connectedAccountId)}
                    options={{
                      clientSecret: payment.clientSecret,
                      appearance: stripeAppearance,
                      fonts: [{
                        cssSrc: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
                      }],
                    }}
                  >
                    <PaymentForm cart={cart} onCompleted={handleCompleted} onError={setStepError} />
                  </Elements>
                )}
                <button onClick={() => setStep('shipping')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-gold transition-colors mt-6">
                  <ChevronLeft size={15} /> Back to shipping
                </button>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <OrderSummary
            cart={cart}
            busy={busy}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            promoError={promoError}
          />
        </div>
      </div>
    </div>
  )
}
