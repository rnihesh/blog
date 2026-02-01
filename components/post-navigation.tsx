import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BlogPost } from "@/lib/posts";

interface PostNavigationProps {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export function PostNavigation({ prev, next }: PostNavigationProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {prev ? (
          <Link
            href={`/${prev.name}`}
            className="group flex-1 p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </div>
            <span className="font-medium text-foreground group-hover:underline line-clamp-2">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/${next.name}`}
            className="group flex-1 p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors text-right"
          >
            <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mb-1">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <span className="font-medium text-foreground group-hover:underline line-clamp-2">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </nav>
  );
}
