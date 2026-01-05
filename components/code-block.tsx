"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  language: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(children);
      } else {
        // Fallback for iOS and older browsers
        const textArea = document.createElement("textarea");
        textArea.value = children;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowButton(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTouch = () => {
    setShowButton(true);
    // Auto hide after 3 seconds of inactivity
    setTimeout(() => {
      setShowButton(false);
    }, 3000);
  };

  const currentTheme = mounted ? resolvedTheme || theme : "dark";
  const selectedTheme = currentTheme === "dark" ? vscDarkPlus : vs;

  return (
    <div className="relative group my-4" onTouchStart={handleTouch}>
      <button
        onClick={copyToClipboard}
        className={`absolute right-2 top-2 p-2 rounded-md bg-muted hover:bg-accent transition-opacity duration-300 z-10 md:opacity-0 md:group-hover:opacity-100 ${showButton ? "opacity-100" : "opacity-0"}`}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <SyntaxHighlighter
        style={selectedTheme}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          padding: "1rem",
          paddingTop: "1rem",
          paddingRight: "1rem",
          paddingBottom: "1rem",
          paddingLeft: "1rem",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          overflowX: "auto",
          ...(currentTheme === "light" && { backgroundColor: "#f6f8fa" }),
        }}
        codeTagProps={{
          style: {
            lineHeight: "1.5",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
