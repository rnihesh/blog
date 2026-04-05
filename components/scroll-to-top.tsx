"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const VISIBILITY_THRESHOLD = 300;
const IDLE_HIDE_DELAY_MS = 1500;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const updateVisibility = () => {
      const shouldShow = window.scrollY > VISIBILITY_THRESHOLD;
      setVisible(shouldShow);
      setIsIdle(false);

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      if (shouldShow) {
        idleTimer = setTimeout(() => {
          setIsIdle(true);
        }, IDLE_HIDE_DELAY_MS);
      }
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 rounded-full border border-border bg-background/90 p-3 text-foreground shadow-md backdrop-blur transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        visible && !isIdle
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
