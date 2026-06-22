import { BaseScraper } from "./base";
import { GENERIC_PAGE_SCRIPT } from "./page-script";
import type { ParsedProduct, ProductStock } from "./types";

/** Superstep: https://www.superstep.com.tr/urun/adidas-...-spor-ayakkabi/ki6678/ */
export class SuperstepScraper extends BaseScraper {
  readonly brand = "superstep" as const;

  canHandle(url: string): boolean {
    try {
      return new URL(url).hostname.includes("superstep.com.tr");
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedProduct | null {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      // /urun/<slug>/<kod>/ → ürün kodu (ör. ki6678); aksi halde son segment.
      const idx = parts.indexOf("urun");
      let productId =
        idx >= 0 && parts.length > idx + 2
          ? parts[idx + 2]
          : parts[parts.length - 1];
      if (!productId) productId = parts[parts.length - 1] ?? "";
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
