import { BaseScraper } from "./base";
import { SNEAKSUP_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** SneaksUp: https://www.sneaksup.com/new-balance-9060-...-u9060blk-w-1 (Ticimax) */
export class SneaksupScraper extends BaseScraper {
  readonly brand = "sneaksup" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("sneaksup.com");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      const slug = parts[parts.length - 1];
      if (!slug) return null;
      return { brand: this.brand, productId: slug, url };
    } catch {
      return null;
    }
  }

  async fetchFromApi(parsed: ParsedProduct): Promise<ProductStock | null> {
    void parsed;
    return null;
  }

  pageScript(): string {
    return SNEAKSUP_PAGE_SCRIPT;
  }
}
