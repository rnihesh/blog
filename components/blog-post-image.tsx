"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BLOG_IMAGE_BORDER_RADIUS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPostImageProps {
  lightImage: string;
  darkImage?: string;
  alt: string;
}

export function BlogPostImage({
  lightImage,
  darkImage,
  alt,
}: BlogPostImageProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lightLoaded, setLightLoaded] = useState(false);
  const [darkLoaded, setDarkLoaded] = useState(false);

  // Wait for client-side hydration to complete before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light image during SSR and before mounting to prevent hydration mismatch
  const theme = mounted ? (resolvedTheme ?? "light") : "light";
  const showDark = theme === "dark" && darkImage;

  return (
    <div className="my-8 relative">
      <div className="relative aspect-video w-full my-8">
        {/* Show skeleton until the correct image for current theme loads */}
        {((theme === "light" && !lightLoaded) ||
          (theme === "dark" && showDark && !darkLoaded)) && (
          <Skeleton className="absolute inset-0 bg-muted" />
        )}

        {/* Light image - always render but hide until loaded and appropriate */}
        <Image
          src={lightImage}
          alt={alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className={`object-cover ${!showDark && lightLoaded ? "block" : "hidden"}`}
          style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
          onLoad={() => setLightLoaded(true)}
          priority
        />

        {/* Dark image - always render but hide until loaded and appropriate */}
        {darkImage && (
          <Image
            src={darkImage}
            alt={alt}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className={`object-cover ${showDark && darkLoaded ? "block" : "hidden"}`}
            style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
            onLoad={() => setDarkLoaded(true)}
            priority
          />
        )}
      </div>
    </div>
  );
}
