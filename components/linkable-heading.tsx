"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface LinkableHeadingProps {
  id: string;
  level: 2 | 3 | 4;
  children: React.ReactNode;
}

export function LinkableHeading({ id, level, children }: LinkableHeadingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Tag = `h${level}` as const;

  return (
    <Tag id={id} className="group relative scroll-mt-24">
      {children}
      <a
        href={`#${id}`}
        onClick={handleCopy}
        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
        aria-label="Copy link to section"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Link2 className="w-4 h-4 text-muted-foreground" />
        )}
      </a>
    </Tag>
  );
}
