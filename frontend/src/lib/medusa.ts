import { products, type Product } from "../data/products";

// Backend removed for this deployment — the storefront ships with the local
// demo catalogue instead of a live Medusa Store API connection.
export async function fetchProducts(): Promise<Product[]> {
  return products;
}
