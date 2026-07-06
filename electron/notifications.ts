import { Notification, app } from "electron";
import { openProduct, openSettings } from "./app-state";

/** Yerel macOS bildirimleri + dock rozeti. */

function notify(title: string, body: string, onClick?: () => void): void {
  if (!Notification.isSupported()) return;
  // macOS'ta açık bir sistem sesi ver (yalnızca silent:false her zaman çalmıyor).
  const n = new Notification({ title, body, silent: false, sound: "Glass" });
  if (onClick) n.on("click", onClick);
  n.show();
}

/** Ayarlardan tetiklenen test bildirimi — izin/kayıt akışını doğrulamak için. */
export function notifyTest(): void {
  notify("Atelier", "Bildirimler çalışıyor ✅");
}

export function notifyRestock(
  name: string,
  productId: number,
  size?: string | null,
): void {
  const sizeStr = size ? ` (${size})` : "";
  notify("Stokta! 🎉", `${name}${sizeStr} artık stokta.`, () =>
    openProduct(productId),
  );
}

export function notifyPriceDrop(
  name: string,
  productId: number,
  oldPrice: number,
  newPrice: number,
): void {
  const fmt = (v: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(v);
  notify("Fiyat düştü ↓", `${name}: ${fmt(oldPrice)} → ${fmt(newPrice)}`, () =>
    openProduct(productId),
  );
}

/** Yeni uygulama sürümü bulununca — tıklanınca ayarlar (indirme butonu) açılır. */
export function notifyUpdateAvailable(version: string): void {
  if (!Notification.isSupported()) return;
  const n = new Notification({
    title: "Güncelleme mevcut",
    body: `Atelier v${version} indirilebilir. Ayarlar'dan indirebilirsin.`,
    silent: false,
    sound: "Glass",
  });
  n.on("click", () => openSettings());
  n.show();
}

/** Dock simgesinde stokta-olan-ürün sayısı rozeti. */
export function setDockBadge(count: number): void {
  if (process.platform !== "darwin" || !app.dock) return;
  app.dock.setBadge(count > 0 ? String(count) : "");
}
