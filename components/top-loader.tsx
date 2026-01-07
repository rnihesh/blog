"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { TOP_LOADER_COLORS } from "@/lib/constants";

export function TopLoader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const color =
    resolvedTheme === "dark" ? TOP_LOADER_COLORS.dark : TOP_LOADER_COLORS.light;

  return (
    <NextTopLoader
      color={color}
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow={`0 0 10px ${color},0 0 5px ${color}`}
    />
  );
}
