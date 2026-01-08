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
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration to complete before using theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light image during SSR and before mounting to prevent hydration mismatch
  const theme = mounted ? (resolvedTheme ?? "light") : "light";
  const src = theme === "dark" && darkImage ? darkImage : lightImage;

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="my-8 relative">
      <div className="relative aspect-video w-full my-8">
        {!loaded && <Skeleton className="absolute inset-0 bg-muted" />}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className={`object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
          onLoad={() => setLoaded(true)}
          priority
        />
      </div>
    </div>
  );
}
