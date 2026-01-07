"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  BLOG_IMAGE_DIMENSIONS,
  BLOG_IMAGE_BORDER_RADIUS,
} from "@/lib/constants";

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

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show light image during SSR
    return (
      <div className="my-8">
        <Image
          src={lightImage}
          alt={alt}
          width={BLOG_IMAGE_DIMENSIONS.width}
          height={BLOG_IMAGE_DIMENSIONS.height}
          className="w-full h-auto"
          style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
          priority
        />
      </div>
    );
  }

  const imageSrc =
    resolvedTheme === "dark" && darkImage ? darkImage : lightImage;

  return (
    <div className="my-8">
      <Image
        src={imageSrc}
        alt={alt}
        width={BLOG_IMAGE_DIMENSIONS.width}
        height={BLOG_IMAGE_DIMENSIONS.height}
        className="w-full h-auto"
        style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
        priority
      />
    </div>
  );
}
