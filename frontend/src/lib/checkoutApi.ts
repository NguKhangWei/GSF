import type { Product } from "../data/products";

// Backend removed for this deployment: every call below rejects immediately
// instead of reaching the shared golf backend's Medusa/Mercur Store API.
// Pages that depend on this (cart, checkout, account orders) degrade to their
// empty/error states gracefully rather than crashing.

/** Stripe's own publishable key (pk_test_/pk_live_), NOT the Medusa key. */
export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

/** The custom Stripe Connect direct-charge provider registered on the backend. */
export const PAYMENT_PROVIDER_ID = "pp_stripe-direct_stripe-direct";

/**
 * Extra cart fields beyond Medusa's defaults ("+" = additive): the default
 * payload omits shipping method names and item-level totals (verified against
 * the live backend).
 */
const CART_QUERY = "?fields=%2Bshipping_methods.name,%2Bitems.total";

/** This storefront's seller on the marketplace backend. */
const SELLER_HANDLE = "gsf-golf";

const CART_ID_KEY = "gsf_cart_id";
const PENDING_CHECKOUT_KEY = "gsf_pending_checkout";
const CONFIRMATION_KEY = "gsf_order_confirmation";

export class StoreApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = "StoreApiError";
    this.status = status;
  }
}

async function storeFetch<T>(
  _path: string,
  _init?: { method?: string; body?: unknown }
): Promise<T> {
  throw new StoreApiError(
    "The store is not available in this preview.",
    0
  );
}

/* ─────────────────────────── Types ─────────────────────────── */

export interface MedusaAddress {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
}

export interface MedusaLineItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  quantity: number;
  unit_price: number;
  /** Item-level totals are NOT in the default cart payload (verified against
   * the live backend) — use lineTotal() for display. */
  total?: number;
  product_id?: string;
  variant_id?: string;
  product_title?: string;
  variant_title?: string;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

/** Line display total: prefer the decorated total when present. */
export function lineTotal(item: MedusaLineItem): number {
  return typeof item.total === "number"
    ? item.total
    : item.unit_price * item.quantity;
}

/** Shopper-selected configuration stored on the cart line metadata. */
export function selectedOptionsRecord(
  item: MedusaLineItem
): Record<string, string> | undefined {
  const selected = item.metadata?.selected_options;
  if (selected && typeof selected === "object" && !Array.isArray(selected)) {
    const entries = Object.entries(selected as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([label, value]) => [label, String(value)]);
    if (entries.length) return Object.fromEntries(entries);
  }
  return undefined;
}

/** Shopper-selected configuration stored on the cart line metadata. */
export function selectedOptionsText(item: MedusaLineItem): string | undefined {
  const selected = selectedOptionsRecord(item);
  if (selected) {
    return Object.entries(selected)
      .map(([label, value]) => `${label}: ${value}`)
      .join(" / ");
  }
  return item.variant_title && item.variant_title.toLowerCase() !== "default"
    ? item.variant_title
    : undefined;
}

export interface MedusaCart {
  id: string;
  email?: string;
  currency_code: string;
  completed_at?: string | null;
  region_id?: string;
  items: MedusaLineItem[];
  total: number;
  subtotal: number;
  item_subtotal: number;
  item_total: number;
  discount_total: number;
  shipping_total: number;
  shipping_subtotal: number;
  tax_total: number;
  shipping_address?: MedusaAddress | null;
  billing_address?: MedusaAddress | null;
  shipping_methods?: {
    id: string;
    shipping_option_id: string;
    amount: number;
    name: string;
  }[];
  promotions?: { id: string; code?: string; is_automatic?: boolean }[];
  metadata?: Record<string, unknown> | null;
}

export interface ShippingOption {
  id: string;
  name: string;
  amount: number;
  price_type?: string;
}

export type CompleteCartResult =
  | {
      type: "order_group";
      order_group: {
        id: string;
        customer_id?: string;
        cart_id?: string;
        seller_count?: number;
        total?: number;
        created_at?: string;
      };
    }
  | {
      type: "cart";
      cart: MedusaCart;
      error?: { message?: string; name?: string; type?: string };
    };

/* ─────────────────────────── Money ─────────────────────────── */

/** Format a backend (MYR) amount for display, e.g. "MYR 1,890.00". */
export function fmtMoney(amount?: number | null): string {
  const n = typeof amount === "number" && isFinite(amount) ? amount : 0;
  return `MYR ${n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* ─────────────────────────── Region ─────────────────────────── */

let regionPromise: Promise<{ id: string; currency_code: string }> | null = null;

export function getRegion(): Promise<{ id: string; currency_code: string }> {
  if (!regionPromise) {
    regionPromise = storeFetch<{ regions: any[] }>("/store/regions")
      .then(({ regions }) => {
        const region =
          (regions || []).find((r) => r.currency_code === "myr") ||
          regions?.[0];
        if (!region) throw new StoreApiError("No region configured.");
        return { id: region.id, currency_code: region.currency_code };
      })
      .catch((e) => {
        regionPromise = null;
        throw e;
      });
  }
  return regionPromise;
}

/* ─────────────────────── Cart persistence ─────────────────────── */

export function getPersistedCartId(): string | null {
  try {
    return localStorage.getItem(CART_ID_KEY);
  } catch {
    return null;
  }
}

export function clearPersistedCartId(): void {
  try {
    localStorage.removeItem(CART_ID_KEY);
  } catch {
    /* private mode */
  }
}

function persistCartId(id: string): void {
  try {
    localStorage.setItem(CART_ID_KEY, id);
  } catch {
    /* private mode */
  }
}

/* ─────────────────────────── Cart ops ─────────────────────────── */

/** Fetch the persisted cart, or null when none exists / it was completed. */
export async function retrieveCart(): Promise<MedusaCart | null> {
  const id = getPersistedCartId();
  if (!id) return null;
  try {
    const { cart } = await storeFetch<{ cart: MedusaCart }>(
      `/store/carts/${id}${CART_QUERY}`
    );
    if (cart.completed_at) {
      clearPersistedCartId();
      return null;
    }
    return cart;
  } catch (e) {
    if (e instanceof StoreApiError && e.status >= 400 && e.status < 500) {
      clearPersistedCartId();
      return null;
    }
    throw e;
  }
}

/** Get the current cart, creating (and persisting) one when needed. */
export async function ensureCart(): Promise<MedusaCart> {
  const existing = await retrieveCart();
  if (existing) return existing;
  const region = await getRegion();
  const { cart } = await storeFetch<{ cart: MedusaCart }>(`/store/carts${CART_QUERY}`, {
    method: "POST",
    body: { region_id: region.id },
  });
  persistCartId(cart.id);
  return cart;
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number,
  metadata?: Record<string, unknown>
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items${CART_QUERY}`,
    {
      method: "POST",
      body: {
        variant_id: variantId,
        quantity,
        ...(metadata ? { metadata } : {}),
      },
    }
  );
  return cart;
}

export async function updateLineItem(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/line-items/${lineId}${CART_QUERY}`,
    { method: "POST", body: { quantity } }
  );
  return cart;
}

export async function removeLineItem(
  cartId: string,
  lineId: string
): Promise<MedusaCart | null> {
  await storeFetch(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: "DELETE",
  });
  return retrieveCart();
}

export async function updateCart(
  cartId: string,
  data: {
    email?: string;
    shipping_address?: MedusaAddress;
    billing_address?: MedusaAddress;
    metadata?: Record<string, unknown>;
  }
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}${CART_QUERY}`,
    { method: "POST", body: data }
  );
  return cart;
}

/* ─────────────────────────── Promotions ─────────────────────────── */

export async function applyPromoCode(
  cartId: string,
  code: string
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/promotions${CART_QUERY}`,
    { method: "POST", body: { promo_codes: [code] } }
  );
  return cart;
}

export async function removePromoCode(
  cartId: string,
  code: string
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/promotions${CART_QUERY}`,
    { method: "DELETE", body: { promo_codes: [code] } }
  );
  return cart;
}

/* ─────────────────────────── Shipping ─────────────────────────── */

export async function listShippingOptions(
  cartId: string
): Promise<ShippingOption[]> {
  const { shipping_options } = await storeFetch<{
    // Mercur's marketplace override groups options by seller id
    // ({ sel_x: [...] }); stock Medusa returns a flat array. Handle both.
    shipping_options: any[] | Record<string, any[]>;
  }>(`/store/shipping-options?cart_id=${cartId}`);
  const flat = Array.isArray(shipping_options)
    ? shipping_options
    : Object.values(shipping_options || {}).flat();
  return flat.map((o) => ({
    id: o.id,
    name: o.name,
    amount: o.amount ?? o.calculated_price?.calculated_amount ?? 0,
    price_type: o.price_type,
  }));
}

export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/shipping-methods${CART_QUERY}`,
    { method: "POST", body: { option_id: optionId } }
  );
  return cart;
}

/* ─────────────────────────── Payment ─────────────────────────── */

let sellerAccountPromise: Promise<{
  sellerId: string;
  connectedAccountId?: string;
}> | null = null;

/**
 * Resolve this brand's seller + its Stripe connected account id from public
 * seller metadata (metadata.stripe_connected_account_id — backend convention,
 * see golf-backend/packages/api/src/modules/stripe-direct/README.md).
 */
export function resolveSellerPaymentAccount(): Promise<{
  sellerId: string;
  connectedAccountId?: string;
}> {
  if (!sellerAccountPromise) {
    sellerAccountPromise = storeFetch<{ sellers: any[] }>(
      "/store/sellers?fields=id,name,handle,metadata&limit=50"
    )
      .then(({ sellers }) => {
        const seller = (sellers || []).find((s) => s.handle === SELLER_HANDLE);
        if (!seller) {
          throw new StoreApiError(`Seller '${SELLER_HANDLE}' not found.`);
        }
        const connectedAccountId = seller.metadata
          ?.stripe_connected_account_id as string | undefined;
        return { sellerId: seller.id as string, connectedAccountId };
      })
      .catch((e) => {
        sellerAccountPromise = null;
        throw e;
      });
  }
  return sellerAccountPromise;
}

export interface PaymentSessionInfo {
  clientSecret: string;
  connectedAccountId: string;
  paymentCollectionId: string;
}

/**
 * Create/refresh the payment collection for the cart and initiate a Stripe
 * direct-charge payment session on the brand's connected account. Call again
 * whenever the cart total changes so the PaymentIntent amount stays in sync.
 */
export async function initiatePaymentSession(
  cartId: string
): Promise<PaymentSessionInfo> {
  const { connectedAccountId } = await resolveSellerPaymentAccount();
  if (!connectedAccountId) {
    throw new StoreApiError(
      "Online payment is not available yet for this store (no payment account connected). Please contact us to complete your order."
    );
  }
  const { payment_collection } = await storeFetch<{
    payment_collection: { id: string };
  }>("/store/payment-collections", {
    method: "POST",
    body: { cart_id: cartId },
  });
  const { payment_collection: withSessions } = await storeFetch<{
    payment_collection: {
      id: string;
      payment_sessions?: {
        id: string;
        provider_id?: string;
        data?: { client_secret?: string };
      }[];
    };
  }>(`/store/payment-collections/${payment_collection.id}/payment-sessions`, {
    method: "POST",
    body: {
      provider_id: PAYMENT_PROVIDER_ID,
      data: { connected_account_id: connectedAccountId },
    },
  });
  const session =
    (withSessions.payment_sessions || []).find(
      (s) => s.provider_id === PAYMENT_PROVIDER_ID
    ) ?? withSessions.payment_sessions?.[0];
  const clientSecret = session?.data?.client_secret;
  if (!clientSecret) {
    throw new StoreApiError("Could not start the payment session.");
  }
  return {
    clientSecret,
    connectedAccountId,
    paymentCollectionId: withSessions.id,
  };
}

/**
 * Complete the cart. Mercur-specific response: `{ type: "order_group", ... }`
 * on success, or `{ type: "cart", cart, error }` (HTTP 200!) when payment
 * isn't authorized yet or completion failed — always check `type`.
 */
export async function completeCart(cartId: string): Promise<CompleteCartResult> {
  return storeFetch<CompleteCartResult>(`/store/carts/${cartId}/complete`, {
    method: "POST",
  });
}

/**
 * Associate the authenticated customer with a cart (Medusa v2 standard route).
 * Needed so the resulting order is queryable via `/store/orders` afterward —
 * carts created/updated while a customer token is present are auto-linked,
 * but this covers carts started as a guest before the shopper logged in.
 */
export async function attachCustomerToCart(cartId: string): Promise<MedusaCart> {
  const { cart } = await storeFetch<{ cart: MedusaCart }>(
    `/store/carts/${cartId}/customer`,
    { method: "POST" }
  );
  return cart;
}

/* ─────────────────── Variant resolution ─────────────────── */

/**
 * Find the variant id matching the shopper's selected options
 * (spec label -> value). Falls back to the first variant — which is also the
 * Medusa auto-created "Default" variant for option-less products.
 */
export function resolveVariantId(
  product: Product,
  selected?: Record<string, string>
): string | undefined {
  const variants = product.variants || [];
  if (!variants.length) return undefined;
  const entries = Object.entries(selected || {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length) {
    const match = variants.find((v) =>
      entries.every(([label, value]) => v.options[label] === value)
    );
    if (match) return match.id;
  }
  return variants[0].id;
}

/* ─────────── Confirmation snapshot (guest-safe fallback) ─────────── */

// Mercur's cart-complete response only returns the order_group id/total, and
// the order-groups detail route requires an authenticated customer — so for
// guest checkout the confirmation page renders from this client-side snapshot
// taken just before payment (see CHECKOUT-INTEGRATION-GUIDE.md §5.7).

export interface CheckoutSnapshot {
  cartId: string;
  email?: string;
  items: {
    title: string;
    variantTitle?: string;
    quantity: number;
    total: number;
    thumbnail?: string;
  }[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  shippingAddress?: MedusaAddress | null;
  shippingMethod?: string;
  promoCodes?: string[];
  orderGroupId?: string;
  orderGroupTotal?: number;
  completedAt?: string;
}

export function snapshotFromCart(cart: MedusaCart): CheckoutSnapshot {
  return {
    cartId: cart.id,
    email: cart.email,
    items: (cart.items || []).map((i) => ({
      title: i.product_title || i.title,
      variantTitle: selectedOptionsText(i),
      quantity: i.quantity,
      total: lineTotal(i),
      thumbnail: i.thumbnail,
    })),
    subtotal: cart.item_subtotal ?? cart.subtotal ?? 0,
    discountTotal: cart.discount_total ?? 0,
    shippingTotal: cart.shipping_total ?? 0,
    taxTotal: cart.tax_total ?? 0,
    total: cart.total ?? 0,
    currencyCode: cart.currency_code,
    shippingAddress: cart.shipping_address,
    shippingMethod: cart.shipping_methods?.[0]?.name,
    promoCodes: (cart.promotions || [])
      .map((p) => p.code)
      .filter((c): c is string => !!c),
  };
}

export function savePendingCheckout(snapshot: CheckoutSnapshot): void {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(snapshot));
  } catch {
    /* private mode */
  }
}

export function loadPendingCheckout(cartId: string): CheckoutSnapshot | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as CheckoutSnapshot;
    return snap.cartId === cartId ? snap : null;
  } catch {
    return null;
  }
}

export function saveConfirmation(snapshot: CheckoutSnapshot): void {
  try {
    sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(snapshot));
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* private mode */
  }
}

export function loadConfirmation(cartId?: string | null): CheckoutSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CONFIRMATION_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as CheckoutSnapshot;
    if (cartId && snap.cartId !== cartId) return null;
    return snap;
  } catch {
    return null;
  }
}
