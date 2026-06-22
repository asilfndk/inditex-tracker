import { BaseScraper } from "./base";
import { BOYNER_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Boyner: https://www.boyner.com.tr/...-p-15917358 */
export class BoynerScraper extends BaseScraper {
  readonly brand = "boyner" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("boyner.com.tr");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      // ...-p-15917358 → 15917358
      const m = u.pathname.match(/-p-(\d+)/i);
      const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
      const productId = m ? m[1] : last;
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
    return BOYNER_PAGE_SCRIPT;
  }
}
