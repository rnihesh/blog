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
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageSrc =
    resolvedTheme === "dark" && darkImage ? darkImage : lightImage;

  // Reset loaded state when image source changes
  useEffect(() => {
    setImageLoaded(false);
  }, [imageSrc]);

  return (
    <div className="my-8">
      {!imageLoaded && (
        <Skeleton className="h-[800px] w-[450px] rounded-l" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={`w-full h-auto ${!imageLoaded ? "hidden" : ""}`}
        style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
        onLoad={() => setImageLoaded(true)}
        priority
      />
    </div>
  );
}
