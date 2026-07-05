import { BaseScraper } from "./base";
import { MANGO_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Mango: https://shop.mango.com/tr/tr/p/.../27045166/99/00 */
export class MangoScraper extends BaseScraper {
  readonly brand = "mango" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("shop.mango.com");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      // /tr/tr/p/.../27045166/99/00 → ilk 6+ haneli segment ürün kodu
      const seg = u.pathname
        .split("/")
        .filter(Boolean)
        .find((s) => /^\d{6,}$/.test(s));
      const productId =
        seg ?? u.pathname.split("/").filter(Boolean).pop() ?? "";
      if (!productId) return null;
      return { brand: this.brand, productId, url };
    } catch {
      return null;
    }
  }

  async fetchFromApi(parsed: ParsedProduct): Promise<ProductStock | null> {
    void parsed;
    return null;
  }

  pageScript(): string {
    return MANGO_PAGE_SCRIPT;
  }
}
