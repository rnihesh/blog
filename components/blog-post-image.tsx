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
      {!loaded && (
        <div>
          <Skeleton className="h-[125px] w-[450px] rounded-l bg-secondary" />
        </div>
      )}
      <div className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
          style={{ borderRadius: BLOG_IMAGE_BORDER_RADIUS }}
          onLoadingComplete={() => setLoaded(true)}
          priority
        />
      </div>
    </div>
  );
}
