import { BaseScraper } from "./base";
import { GENERIC_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Tommy Hilfiger TR: https://tr.tommy.com/erkek-hirka_206739 */
export class TommyScraper extends BaseScraper {
  readonly brand = "tommy" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("tommy.com");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
      // ...erkek-hirka_206739 → 206739; otherwise the slug itself.
      const m = last.match(/_(\d+)$/);
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
    return GENERIC_PAGE_SCRIPT;
  }
}
