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

export function BlogPostImage({ lightImage, darkImage, alt }: BlogPostImageProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme ?? "light";
  const [loaded, setLoaded] = useState(false);
  const src = theme === "dark" && darkImage ? darkImage : lightImage;

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className="my-8 relative">
      <div className="relative aspect-[16/9] w-full my-8">
  {!loaded && <Skeleton className="absolute inset-0 bg-muted" />}
  <Image
    src={src}
    alt={alt}
    fill
    className={`object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
    style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
    onLoadingComplete={() => setLoaded(true)}
    priority
  />
</div>
    </div>
  );
}
