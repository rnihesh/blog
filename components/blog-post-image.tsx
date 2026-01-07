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
  const [imageLoading, setImageLoading] = useState(true);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const imageSrc =
    resolvedTheme === "dark" && darkImage ? darkImage : lightImage;

  // Reset loading state when image source changes
  useEffect(() => {
    if (mounted) {
      setImageLoading(true);
    }
  }, [imageSrc, mounted]);

  if (!mounted) {
    // Show skeleton during SSR to avoid hydration mismatch
    return (
      <div className="my-8">
        <Skeleton
          className="w-full"
          style={{
            borderRadius: BLOG_IMAGE_BORDER_RADIUS,
            minHeight: "300px",
          }}
          role="presentation"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="my-8 relative">
      {/* Show skeleton while image is loading */}
      {imageLoading && (
        <Skeleton
          className="w-full absolute inset-0"
          style={{
            borderRadius: BLOG_IMAGE_BORDER_RADIUS,
            minHeight: "300px",
          }}
          role="presentation"
          aria-hidden="true"
        />
      )}
      {/* Image is always rendered but hidden until loaded */}
      <Image
        src={imageSrc}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={`w-full h-auto ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
        priority
        onLoad={() => setImageLoading(false)}
      />
    </div>
  );
}
