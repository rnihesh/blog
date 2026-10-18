"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, type CSSProperties } from "react";
import { BLOG_IMAGE_BORDER_RADIUS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const loadedImageSources = new Set<string>();

interface BlogPostImageProps {
  lightImage: string;
  darkImage?: string;
  alt: string;
  className?: string;
  transitionName?: string;
  priority?: boolean;
  sizes?: string;
}

export function BlogPostImage({
  lightImage,
  darkImage,
  alt,
  className = "my-8",
  transitionName,
  priority = true,
  sizes = "(min-width: 768px) 768px, 100vw",
}: BlogPostImageProps) {
  const { resolvedTheme } = useTheme();
  const [lightLoaded, setLightLoaded] = useState(() =>
    loadedImageSources.has(lightImage),
  );
  const [darkLoaded, setDarkLoaded] = useState(() =>
    darkImage ? loadedImageSources.has(darkImage) : false,
  );

  useEffect(() => {
    setLightLoaded(loadedImageSources.has(lightImage));
  }, [lightImage]);

  useEffect(() => {
    setDarkLoaded(Boolean(darkImage && loadedImageSources.has(darkImage)));
  }, [darkImage]);

  const effectiveTheme =
    resolvedTheme ??
    (typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light");

  const wantsDark = effectiveTheme === "dark" && Boolean(darkImage);
  const showDark = wantsDark && darkLoaded;
  const showLight = !showDark;
  const isVisibleImageLoaded = showLight ? lightLoaded : darkLoaded;

  return (
    <div
      className={className}
      style={
        transitionName
          ? ({ "--vt-name": transitionName } as CSSProperties)
          : undefined
      }
    >
      <div
        className="relative aspect-video w-full overflow-hidden"
        style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
      >
        {!isVisibleImageLoaded && (
          <Skeleton className="absolute inset-0 bg-muted" />
        )}

        <Image
          src={lightImage}
          alt={alt}
          fill
          sizes={sizes}
          className={`object-cover transition-opacity duration-200 ${
            showLight && lightLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => {
            loadedImageSources.add(lightImage);
            setLightLoaded(true);
          }}
          priority={priority}
        />

        {darkImage && (
          <Image
            src={darkImage}
            alt={alt}
            fill
            sizes={sizes}
            className={`object-cover transition-opacity duration-200 ${
              showDark ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => {
              loadedImageSources.add(darkImage);
              setDarkLoaded(true);
            }}
            priority={priority}
          />
        )}
      </div>
    </div>
  );
}
