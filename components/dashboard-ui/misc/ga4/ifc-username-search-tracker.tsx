"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function IFCUsernameSearchTracker() {
  const { name } = useParams<{ name: string }>();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("searched") === "true") {
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "search_ifc_username",
        search_type: "ifc_user",
        search_term: name,
      });
    }
  }, [name, searchParams]);

  return null;
}