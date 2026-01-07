"use client";

import Image from "next/image";
import { BLOG_IMAGE_BORDER_RADIUS } from "@/lib/constants";

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
  return (
    <div className="my-8">
      {/* Light image */}
      <Image
        src={lightImage}
        alt={alt}
        width={0}
        height={0}
        sizes="100vw"
        className={`w-full h-auto ${darkImage ? "dark:hidden" : ""}`}
        style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
        priority
      />

      {/* Dark image */}
      {darkImage && (
        <Image
          src={darkImage}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="hidden w-full h-auto dark:block"
          style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
          priority
        />
      )}
    </div>
  );
}
