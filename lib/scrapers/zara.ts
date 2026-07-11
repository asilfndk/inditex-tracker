import { BaseScraper } from "./base";
import { ZARA_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/**
 * Zara: https://www.zara.com/tr/tr/...-p02446797.html
 * The `p<digits>` in the URL is the reference id.
 */
export class ZaraScraper extends BaseScraper {
  readonly brand = "zara" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("zara.com");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const m = u.pathname.match(/p(\d+)(?:\.html)?$/i);
      if (!m) return null;
      // locale: /tr/tr/... → "tr/tr"
      const parts = u.pathname.split("/").filter(Boolean);
      const locale = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : undefined;
      return { brand: this.brand, productId: m[1], locale, url };
    } catch {
      return null;
    }
  }

  async fetchFromApi(parsed: ParsedProduct): Promise<ProductStock | null> {
    // Zara's internal API sits behind Akamai and needs a store ID; it is
    // unreliable, so we leave it to the browser layer for now.
    void parsed;
    return null;
  }

  pageScript(): string {
    return ZARA_PAGE_SCRIPT;
  }
}
