"use client";

import { Link } from "next-view-transitions";
import { ReactNode } from "react";

interface ViewTransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function ViewTransitionLink({
  href,
  children,
  className,
  "aria-label": ariaLabel,
}: ViewTransitionLinkProps) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
