"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PromoBanner() {
  const [open, setOpen] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("christmasPromoBanner2024") === "true";
    if (dismissed) setOpen(false);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("christmasPromoBanner2024", "true");
  };

  return (
    <div
      className="
        relative w-full
        bg-gradient-to-r from-red-600 via-green-600 to-red-600
        text-white
      "
      role="region"
      aria-label="Holiday promotional discount code"
    >
      {/* Scrolling area */}
      <div className="promo-viewport py-2 sm:py-2.5 pr-12 sm:pr-16 pl-12 sm:pl-16">
        <div className={`promo-track ${reduced ? "paused" : ""}`}>
          {/* Duplicate sequence twice for seamless loop */}
          <div className="promo-seq">
            <span className="font-semibold tracking-wide text-sm sm:text-base">
              🎄 Holiday Sale — code expires <span className="underline decoration-2">January&nbsp;3</span>! ❄️
            </span>
            <span className="mx-3 opacity-70">|</span>
            <span className="text-xs sm:text-sm">
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">IFHOLIDAY50</span>{" "}
              → <span className="font-semibold">50% OFF</span> <em>LIFETIME & PREMIUM Plans</em>
            </span>
            <span className="mx-3 opacity-70">|</span>
            <span className="text-xs sm:text-sm">
              ⭐ Valid <span className="font-semibold">December 15 - January 3</span> ⭐
            </span>
          </div>

          <div className="promo-seq">
            <span className="font-semibold tracking-wide text-sm sm:text-base">
              🎄 Holiday Sale — code expires <span className="underline decoration-2">January&nbsp;3</span>! ❄️
            </span>
            <span className="mx-3 opacity-70">|</span>
            <span className="text-xs sm:text-sm">
              <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">IFHOLIDAY50</span>{" "}
              → <span className="font-semibold">50% OFF</span> <em>LIFETIME & PREMIUM Plans</em>
            </span>
            <span className="mx-3 opacity-70">|</span>
            <span className="text-xs sm:text-sm">
              ⭐ Valid <span className="font-semibold">December 15 - January 3</span> ⭐
            </span>
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleClose}
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          inline-flex items-center justify-center
          h-8 w-8 rounded-full
          bg-white/20 hover:bg-white/30 active:bg-white/40
          text-white transition
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-100
        "
        aria-label="Dismiss promotion"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
