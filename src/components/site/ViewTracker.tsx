"use client";

import { useEffect } from "react";

/** يُرسل زيارة واحدة لكل جلسة متصفح — بيانات حقيقية لعداد الزيارات. */
export default function ViewTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ws_viewed")) return;
      sessionStorage.setItem("ws_viewed", "1");
      void fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: window.location.pathname }),
        keepalive: true,
      });
    } catch {
      /* لا شيء */
    }
  }, []);

  return null;
}
