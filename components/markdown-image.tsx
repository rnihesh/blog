import fs from "fs";
import path from "path";
import type { ComponentPropsWithoutRef } from "react";
import type { ExtraProps } from "react-markdown";

const publicDirectory = path.join(process.cwd(), "public");

/**
 * Inline images follow the same convention as cover images: next to
 * `/images/post/shot.webp`, a `/images/post/shot-dark.webp` is shown in dark mode.
 * Returns the dark variant's URL when that file exists in `public/`.
 */
function findDarkVariant(src: string): string | undefined {
  if (!src.startsWith("/") || src.startsWith("//")) return undefined;

  const ext = path.extname(src);
  if (!ext) return undefined;

  const darkSrc = `${src.slice(0, -ext.length)}-dark${ext}`;
  const darkPath = path.join(publicDirectory, darkSrc);
  if (!darkPath.startsWith(publicDirectory + path.sep)) return undefined;

  return fs.existsSync(darkPath) ? darkSrc : undefined;
}

type MarkdownImageProps = ComponentPropsWithoutRef<"img"> & ExtraProps;

/**
 * Markdown `img` renderer. Plain `<img>` is deliberate: markdown carries no
 * dimensions for next/image, and these files are already sized and compressed.
 * When a `-dark` variant exists, both are emitted and CSS shows the one that
 * matches the theme class, so there is no flash and no client JavaScript.
 */
export function MarkdownImage({
  src,
  alt = "",
  className,
  node,
  ...props
}: MarkdownImageProps) {
  void node; // react-markdown's syntax-tree node; not a DOM attribute
  const darkSrc = typeof src === "string" ? findDarkVariant(src) : undefined;
  const classes = (extra?: string) =>
    [className, extra].filter(Boolean).join(" ") || undefined;

  if (!darkSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={classes()}
        loading="lazy"
        decoding="async"
        {...props}
      />
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={classes("theme-light-only")}
        loading="lazy"
        decoding="async"
        {...props}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={darkSrc}
        alt={alt}
        className={classes("theme-dark-only")}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </>
  );
}
