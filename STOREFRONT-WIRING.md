# GSF Golf storefront — wired to the backend

The **Shop** page now loads the **live catalogue** from the shared golf backend (Medusa Store API)
instead of the hardcoded `data/products.ts`.

## Run it
```bash
cd frontend
npm install
npm run dev -- --port 3000     # http://localhost:3000  (port 3000 is allow-listed in backend CORS)
```
The backend must be running too (golf-backend → `yarn dev`, http://localhost:9000).
Then open **http://localhost:3000/shop** — you'll see GSF Golf's real 222 products.

## What changed (only the Shop data source — design untouched)
- `frontend/src/lib/medusa.ts` — fetches `/store/products` with this brand's publishable key and maps
  each product to the UI's `Product` shape (title, MYR price, first image, category from the Wix
  collections, specs from product options).
- `frontend/src/pages/Shop.tsx` — loads products via `fetchProducts()` in a `useEffect`; the category
  sidebar is now built dynamically from the live categories.
- `frontend/.env` — `VITE_MEDUSA_BACKEND_URL` + `VITE_MEDUSA_PUBLISHABLE_KEY` (GSF Golf's key).

**Verified:** 222 live GSF products load with images + MYR prices; CORS allows `localhost:3000`.

## Not done yet (next steps)
- **Cart + checkout** still use the local in-memory `useCart` (no real order/payment). Wiring checkout
  → backend cart → **Stripe** requires **Connect enabled** on the Stripe account first.
- Home page "featured" still uses static data — can be wired the same way.
- For **KaenGolf / KuroGolf**: clone their own frontend repos and set each one's publishable key
  (`VITE_MEDUSA_PUBLISHABLE_KEY`) — same backend, different key → different catalogue.
