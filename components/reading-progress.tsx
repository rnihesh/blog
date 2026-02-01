"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const windowHeight = window.innerHeight;
      const scrollableHeight = docHeight - windowHeight;

      if (scrollableHeight <= 0) {
        setProgress(100);
        return;
      }

      // Use a small buffer to ensure we hit 100%
      const scrollPercent = Math.min(
        100,
        (scrollTop / (scrollableHeight - 1)) * 100
      );
      setProgress(Math.max(0, scrollPercent));
    };

    updateProgress();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
      <div
        className="h-full bg-foreground/80 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
