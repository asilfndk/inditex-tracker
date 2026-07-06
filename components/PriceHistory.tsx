"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/brands";
import { getApi, hasApi } from "@/lib/client-api";

interface PricePoint {
  price: number;
  checkedAt: Date;
}

const W = 640;
const H = 120;
const PAD = 6;

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(d);
}

/**
 * check_history'den fiyat çizgi grafiği. Yalnızca izleme listesinden seçilen
 * ürünlerde gösterilir; 2'den az fiyat noktası varsa hiç render edilmez.
 */
export function PriceHistory({ productId }: { productId: number }) {
  const [points, setPoints] = useState<PricePoint[]>([]);

  useEffect(() => {
    if (!hasApi()) return;
    let active = true;
    getApi()
      .priceHistory(productId)
      .then((rows) => {
        if (!active) return;
        setPoints(
          rows
            .filter((r) => r.price != null)
            .map((r) => ({
              price: r.price!,
              checkedAt: new Date(r.checkedAt),
            }))
            // repo en-yeni-önce döner; grafik kronolojik ister.
            .reverse(),
        );
      })
      .catch(() => {
        // Geçmiş okunamazsa grafik sessizce gizli kalır.
      });
    return () => {
      active = false;
    };
  }, [productId]);

  if (points.length < 2) return null;

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1; // sabit fiyatta düz çizgi
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (price: number) => PAD + ((max - price) / span) * (H - PAD * 2);
  const polyline = points.map((p, i) => `${x(i)},${y(p.price)}`).join(" ");
  const last = points[points.length - 1];
  const dropped = last.price < points[0].price;

  return (
    <div className="mt-6 border-t border-hairline pt-4">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>Fiyat geçmişi · {points.length} kontrol</span>
        <span>
          en düşük {formatPrice(min, "TRY")} · en yüksek {formatPrice(max, "TRY")}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-28 w-full"
        role="img"
        aria-label="Fiyat geçmişi grafiği"
      >
        <line
          x1={PAD}
          y1={y(min)}
          x2={W - PAD}
          y2={y(min)}
          className="stroke-hairline"
          strokeDasharray="3 4"
          strokeWidth={1}
        />
        <polyline
          points={polyline}
          fill="none"
          strokeWidth={1.5}
          className={dropped ? "stroke-price-drop" : "stroke-signal"}
        />
        <circle
          cx={x(points.length - 1)}
          cy={y(last.price)}
          r={3}
          className={dropped ? "fill-price-drop" : "fill-signal"}
        />
      </svg>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted">
        <span>{formatDate(points[0].checkedAt)}</span>
        <span className="text-ink">
          {formatDate(last.checkedAt)} · {formatPrice(last.price, "TRY")}
        </span>
      </div>
    </div>
  );
}
