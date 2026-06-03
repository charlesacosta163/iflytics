"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignupTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("setup") === "success") {
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "sign_up",
        method: "ifc_username-registration",
      });
    }
  }, [searchParams]);

  return null;
}