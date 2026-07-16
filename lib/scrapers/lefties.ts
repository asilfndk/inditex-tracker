import { BaseScraper } from "./base";
import { LEFTIES_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Lefties: https://www.lefties.com/tr/en/...-c1030267526p747880059.html?colorId=104 */
export class LeftiesScraper extends BaseScraper {
  readonly brand = "lefties" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("lefties.com");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const m = u.pathname.match(/[lp](\d+)(?:\.html)?$/i);
      if (!m) return null;
      const parts = u.pathname.split("/").filter(Boolean);
      const locale = parts[0];
      return { brand: this.brand, productId: m[1], locale, url };
    } catch {
      return null;
    }
  }

  async fetchFromApi(parsed: ParsedProduct): Promise<ProductStock | null> {
    void parsed;
    return null;
  }

  pageScript(): string {
    return LEFTIES_PAGE_SCRIPT;
  }
}
