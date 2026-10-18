"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Non-standard browser APIs that TypeScript's lib.dom does not declare.
interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}
interface BatteryManager {
  level: number;
  charging: boolean;
}
interface ExtendedNavigator extends Navigator {
  connection?: NetworkInformation;
  deviceMemory?: number;
  getBattery?: () => Promise<BatteryManager>;
}

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const trackPageVisit = async () => {
      const nav = navigator as ExtendedNavigator;
      const conn: NetworkInformation = nav.connection ?? {};
      const hasBatteryAPI = "getBattery" in navigator;
      const bat = {
        level: null as number | null,
        charging: null as boolean | null,
      };

      if (hasBatteryAPI) {
        try {
          const battery = await nav.getBattery!();
          bat.level = battery.level;
          bat.charging = battery.charging;
        } catch {
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
        deviceMemory: nav.deviceMemory,
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
