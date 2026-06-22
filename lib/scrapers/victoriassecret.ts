import { BaseScraper } from "./base";
import { VICTORIASSECRET_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Victoria's Secret TR: https://www.victoriassecret.com.tr/...-VS27291321 */
export class VictoriassecretScraper extends BaseScraper {
  readonly brand = "victoriassecret" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("victoriassecret.com.tr");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const last = u.pathname.split("/").filter(Boolean).pop() ?? "";
      // ...-VS27291321 → VS27291321; aksi halde slug.
      const m = last.match(/-(VS\d+)$/i);
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
    return VICTORIASSECRET_PAGE_SCRIPT;
  }
}
