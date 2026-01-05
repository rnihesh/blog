"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageVisit = async () => {
      const conn = (navigator as any).connection || {};
      const hasBatteryAPI = "getBattery" in navigator;
      let bat = {
        level: null as number | null,
        charging: null as boolean | null,
      };

      if (hasBatteryAPI) {
        try {
          const battery = await (navigator as any).getBattery();
          bat.level = battery.level;
          bat.charging = battery.charging;
        } catch (e) {
          // Battery API error
        }
      }

      const payload = {
        url: location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        touchSupport: "ontouchstart" in window,
        orientation: screen.orientation?.type,
        batteryLevel: bat.level,
        charging: bat.charging,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "production") {
        fetch("https://traana.vercel.app/tra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {
          // Silently fail
        });
      }
    };

    trackPageVisit();
  }, [pathname]); // Re-run on route change

  return null;
}
