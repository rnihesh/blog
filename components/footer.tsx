"use client";

import Link from "next/link";
import { Rss } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Nihesh Rachakonda. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/rss.xml"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              aria-label="Subscribe to RSS feed"
            >
              <Rss className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>RSS</span>
            </Link>

            <Link
              href="https://niheshr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </Link>

            <Link
              href="https://github.com/rnihesh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground">
            <p>Built with Next.js, TypeScript, and Tailwind CSS.</p>
            <p>
              Licensed under{" "}
              <Link
                href="https://www.apache.org/licenses/LICENSE-2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                Apache 2.0
              </Link>
            </p>
            <Link
              href="mailto:contact@niheshr.com"
              className="hover:text-foreground transition-colors underline"
            >
              Contact me
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
