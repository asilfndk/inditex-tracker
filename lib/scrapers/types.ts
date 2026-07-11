import { z } from "zod";
import type { Brand } from "@/db/schema";

/** A single size's stock status */
export const sizeSchema = z.object({
  label: z.string(),
  inStock: z.boolean(),
  /** Per-variant price (e.g. Sephora ml sizes) — absent for most brands */
  price: z.number().nullable().optional(),
});
export type SizeAvailability = z.infer<typeof sizeSchema>;

/** Color-specific variant data — image/sizes/price update from this on color selection */
export const colorVariantSchema = z.object({
  color: z.string(),
  /** Color-specific product URL (?v1=<id>) — tracking + background checks use this URL */
  url: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sizes: z.array(sizeSchema).optional(),
  price: z.number().nullable().optional(),
  /** Stock status of a sizeless color variant (e.g. Sephora shades) */
  inStock: z.boolean().nullable().optional(),
});
export type ColorVariant = z.infer<typeof colorVariantSchema>;

/** Normalized product state returned by every scraper */
export const productStockSchema = z.object({
  name: z.string(),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  imageUrl: z.string().nullable(),
  colors: z.array(z.string()),
  sizes: z.array(sizeSchema),
  /** Whether at least one size/color is in stock */
  inStock: z.boolean(),
  /** Per-color image/sizes/URL (produced by Zara, Mango and Sephora) */
  colorVariants: z.array(colorVariantSchema).optional(),
});
export type ProductStock = z.infer<typeof productStockSchema>;

/** Product identity extracted from the URL */
export interface ParsedProduct {
  brand: Brand;
  productId: string;
  /** Locale on the brand site (e.g. "tr/tr") — if present */
  locale?: string;
  url: string;
}

/** Also carries which layer the scrape result came from */
export interface ScrapeResult extends ProductStock {
  source: "api" | "browser";
}
