import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  checkHistory,
  settings,
  trackedProducts,
  type Brand,
  type NewTrackedProduct,
  type Settings,
  type TrackedProduct,
} from "@/db/schema";

/** All tracked products (newest first) */
export function listProducts(): TrackedProduct[] {
  return db.select().from(trackedProducts).orderBy(desc(trackedProducts.createdAt)).all();
}

export function getProduct(id: number): TrackedProduct | undefined {
  return db.select().from(trackedProducts).where(eq(trackedProducts.id, id)).get();
}

export interface TrackInput {
  url: string;
  brand: Brand;
  productId: string;
  name?: string | null;
  imageUrl?: string | null;
  targetSize?: string | null;
  targetColor?: string | null;
  trackStock?: boolean;
  trackPrice?: boolean;
  lastPrice?: number | null;
  lastInStock?: boolean | null;
  /** Size/color snapshot at track time (for instant display) */
  sizes?: { label: string; inStock: boolean }[] | null;
  colors?: string[] | null;
}

/**
 * Adds a product to tracking. If the same url+size+color combination already
 * exists, returns it (duplicate-record guard — edge case #1).
 */
export function trackProduct(input: TrackInput): TrackedProduct {
  const existing = db
    .select()
    .from(trackedProducts)
    .where(
      and(
        eq(trackedProducts.url, input.url),
        eq(trackedProducts.targetSize, input.targetSize ?? ""),
        eq(trackedProducts.targetColor, input.targetColor ?? ""),
      ),
    )
    .get();
  if (existing) return existing;

  const row: NewTrackedProduct = {
    url: input.url,
    brand: input.brand,
    productId: input.productId,
    name: input.name ?? null,
    imageUrl: input.imageUrl ?? null,
    targetSize: input.targetSize ?? null,
    targetColor: input.targetColor ?? null,
    trackStock: input.trackStock ?? true,
    trackPrice: input.trackPrice ?? true,
    lastPrice: input.lastPrice ?? null,
    lastInStock: input.lastInStock ?? null,
    // Price-drop baseline: starts from the price at track time.
    lowestPrice: input.lastPrice ?? null,
    lastSizes: input.sizes ? JSON.stringify(input.sizes) : null,
    lastColors: input.colors ? JSON.stringify(input.colors) : null,
    lastCheckedAt: new Date(),
  };
  return db.insert(trackedProducts).values(row).returning().get();
}

/** Partially update product fields (toggle price tracking, lowestPrice maintenance). */
export function updateProduct(
  id: number,
  patch: Partial<
    Pick<TrackedProduct, "trackStock" | "trackPrice" | "lowestPrice">
  >,
): TrackedProduct {
  return db
    .update(trackedProducts)
    .set(patch)
    .where(eq(trackedProducts.id, id))
    .returning()
    .get();
}

export function untrackProduct(id: number): void {
  db.delete(trackedProducts).where(eq(trackedProducts.id, id)).run();
}

/** Record a check result in history and update the product's latest state */
export function recordCheck(
  id: number,
  inStock: boolean,
  price: number | null,
  sizes?: { label: string; inStock: boolean }[] | null,
  colors?: string[] | null,
  imageUrl?: string | null,
): void {
  db.insert(checkHistory).values({ productId: id, inStock, price }).run();
  // If price is null, leave lastPrice alone: a broken scrape must not wipe
  // the last known good price (and the price-drop comparison).
  const patch: Partial<TrackedProduct> = {
    lastInStock: inStock,
    lastCheckedAt: new Date(),
  };
  if (price != null) patch.lastPrice = price;
  if (sizes && sizes.length > 0) patch.lastSizes = JSON.stringify(sizes);
  if (colors && colors.length > 0) patch.lastColors = JSON.stringify(colors);
  // If imageUrl is empty/null, leave it alone: a broken scrape must not wipe the existing image.
  if (imageUrl) patch.imageUrl = imageUrl;
  db.update(trackedProducts).set(patch).where(eq(trackedProducts.id, id)).run();
}

export function priceHistory(id: number, limit = 50) {
  return db
    .select()
    .from(checkHistory)
    .where(eq(checkHistory.productId, id))
    .orderBy(desc(checkHistory.checkedAt))
    .limit(limit)
    .all();
}

const DEFAULT_SETTINGS: Omit<Settings, "id"> = {
  checkIntervalCron: "*/15 * * * *",
  autolaunch: false,
  notifyStock: true,
  notifyPrice: true,
  autoUpdateCheck: true,
};

/** Get settings; create the default row if missing */
export function getSettings(): Settings {
  const row = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (row) return row;
  return db
    .insert(settings)
    .values({ id: 1, ...DEFAULT_SETTINGS })
    .returning()
    .get();
}

export function updateSettings(patch: Partial<Omit<Settings, "id">>): Settings {
  getSettings(); // guarantee the row exists
  return db
    .update(settings)
    .set(patch)
    .where(eq(settings.id, 1))
    .returning()
    .get();
}
