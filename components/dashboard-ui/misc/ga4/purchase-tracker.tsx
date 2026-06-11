"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PurchaseData = {
  transaction_id: string;
  plan_type: string;
  value: number;
  currency: string;
  items: {
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }[];
};

export default function PurchaseTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tracked = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || tracked.current) return;

    // Prevent duplicate fires on refresh
    const storageKey = `purchase_tracked_${sessionId}`;
    if (sessionStorage.getItem(storageKey)) {
      router.replace("/dashboard/profile");
      return;
    }

    async function trackPurchase() {
      try {
        const res = await fetch(
          `/api/checkout-session?session_id=${encodeURIComponent(sessionId!)}`
        );
        if (!res.ok) return;

        const data: PurchaseData = await res.json();

        window.dataLayer = window.dataLayer || [];

        // Clear prior ecommerce object (GA4 best practice)
        window.dataLayer.push({ ecommerce: null });

        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: data.transaction_id,
            value: data.value,
            currency: data.currency,
            items: data.items,
          },
          plan_type: data.plan_type, // custom dimension if you want it in GTM
        });

        sessionStorage.setItem(storageKey, "1");
        tracked.current = true;

        // Remove session_id from URL so refresh doesn't re-trigger
        router.replace("/dashboard/profile");
      } catch (err) {
        console.error("Purchase tracking failed:", err);
      }
    }

    trackPurchase();
  }, [searchParams, router]);

  return null;
}