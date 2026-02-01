"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight, List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

interface TableOfContentsProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseHeaders(markdown: string): TocItem[] {
  const headerRegex = /^(#{2,4})\s+(.+)$/gm;
  const headers: { level: number; text: string; id: string }[] = [];

  let match;
  while ((match = headerRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headers.push({ level, text, id: slugify(text) });
  }

  const root: TocItem[] = [];
  const stack: { item: TocItem; level: number }[] = [];

  for (const header of headers) {
    const item: TocItem = {
      id: header.id,
      text: header.text,
      level: header.level,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].level >= header.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      stack[stack.length - 1].item.children.push(item);
    }

    stack.push({ item, level: header.level });
  }

  return root;
}

// Find all parent IDs that contain a given ID
function findParentIds(
  items: TocItem[],
  targetId: string,
  path: string[] = []
): string[] | null {
  for (const item of items) {
    if (item.id === targetId) {
      return path;
    }
    if (item.children.length > 0) {
      const result = findParentIds(item.children, targetId, [
        ...path,
        item.id,
      ]);
      if (result) return result;
    }
  }
  return null;
}

function TocLink({
  item,
  activeId,
  expandedIds,
  onToggle,
  onNavigate,
}: {
  item: TocItem;
  activeId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
}) {
  const hasChildren = item.children.length > 0;
  const isActive = activeId === item.id;
  const isExpanded = expandedIds.has(item.id);

  const handleClick = () => {
    const element = document.getElementById(item.id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      onNavigate?.();
    }
  };

  return (
    <li>
      <div className="flex items-start gap-1">
        {hasChildren ? (
          <button
            onClick={() => onToggle(item.id)}
            className="mt-1.5 p-0.5 hover:bg-muted rounded shrink-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          onClick={handleClick}
          data-toc-id={item.id}
          className={`text-[13px] leading-relaxed py-0.5 transition-colors hover:text-foreground block text-left ${
            isActive ? "text-foreground font-medium" : "text-muted-foreground"
          }`}
        >
          {item.text}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {item.children.map((child) => (
            <TocLink
              key={child.id}
              item={child}
              activeId={activeId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function MobileTableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toc = useMemo(() => parseHeaders(content), [content]);

  const flatHeaders = useMemo(() => {
    const flatten = (items: TocItem[]): string[] => {
      return items.flatMap((item) => [item.id, ...flatten(item.children)]);
    };
    return flatten(toc);
  }, [toc]);

  // Initialize all sections as expanded
  useEffect(() => {
    const allIds = new Set<string>();
    const collectIds = (items: TocItem[]) => {
      items.forEach((item) => {
        if (item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(toc);
    setExpandedIds(allIds);
  }, [toc]);

  // Auto-expand when active item is inside a collapsed section
  useEffect(() => {
    if (!activeId) return;
    const parentIds = findParentIds(toc, activeId);
    if (parentIds && parentIds.length > 0) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        parentIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [activeId, toc]);

  const updateActiveId = useCallback(() => {
    if (flatHeaders.length === 0) return;

    const headingElements = flatHeaders
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const scrollTop = window.scrollY;
    const offset = 120;

    let currentId = flatHeaders[0];

    for (const element of headingElements) {
      const elementTop = element.offsetTop;
      if (elementTop <= scrollTop + offset) {
        currentId = element.id;
      } else {
        break;
      }
    }

    setActiveId(currentId);
  }, [flatHeaders]);

  useEffect(() => {
    if (flatHeaders.length === 0) return;
    updateActiveId();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveId();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [flatHeaders, updateActiveId]);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (toc.length === 0) return null;

  return (
    <div className="xl:hidden mb-8">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center gap-2 w-full px-4 py-3 bg-secondary/50 hover:bg-secondary/70 rounded-lg text-sm font-medium text-foreground transition-colors border border-border"
      >
        <List className="w-4 h-4" />
        <span>Table of Contents</span>
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform duration-200 ${
            mobileOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          mobileOpen ? "max-h-[60vh] mt-2" : "max-h-0"
        }`}
      >
        <nav className="p-4 bg-secondary/30 rounded-lg border border-border overflow-y-auto max-h-[calc(60vh-1rem)]">
          <ul className="space-y-1">
            {toc.map((item) => (
              <TocLink
                key={item.id}
                item={item}
                activeId={activeId}
                expandedIds={expandedIds}
                onToggle={handleToggle}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function DesktopTableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [topOffset, setTopOffset] = useState(96); // 24 * 4 = 96px (top-24)
  const navRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const toc = useMemo(() => parseHeaders(content), [content]);

  const flatHeaders = useMemo(() => {
    const flatten = (items: TocItem[]): string[] => {
      return items.flatMap((item) => [item.id, ...flatten(item.children)]);
    };
    return flatten(toc);
  }, [toc]);

  // Initialize all sections as expanded
  useEffect(() => {
    const allIds = new Set<string>();
    const collectIds = (items: TocItem[]) => {
      items.forEach((item) => {
        if (item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(toc);
    setExpandedIds(allIds);
  }, [toc]);

  // Auto-expand when active item is inside a collapsed section
  useEffect(() => {
    if (!activeId) return;
    const parentIds = findParentIds(toc, activeId);
    if (parentIds && parentIds.length > 0) {
      setExpandedIds((prev) => {
        const newSet = new Set(prev);
        parentIds.forEach((id) => newSet.add(id));
        return newSet;
      });
    }
  }, [activeId, toc]);

  // Auto-scroll ToC nav to show active item
  useEffect(() => {
    if (!activeId || !navRef.current) return;

    const activeElement = navRef.current.querySelector(
      `[data-toc-id="${activeId}"]`
    );
    if (activeElement) {
      const navRect = navRef.current.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      // Check if active element is outside visible area
      if (activeRect.top < navRect.top || activeRect.bottom > navRect.bottom) {
        activeElement.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [activeId]);

  const updateActiveId = useCallback(() => {
    if (flatHeaders.length === 0) return;

    const headingElements = flatHeaders
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const scrollTop = window.scrollY;
    const offset = 120;

    let currentId = flatHeaders[0];

    for (const element of headingElements) {
      const elementTop = element.offsetTop;
      if (elementTop <= scrollTop + offset) {
        currentId = element.id;
      } else {
        break;
      }
    }

    setActiveId(currentId);

    // Calculate sticky behavior - stop before footer
    const footer = document.querySelector("footer");
    const aside = asideRef.current;
    if (footer && aside) {
      const footerTop = footer.getBoundingClientRect().top + window.scrollY;
      const asideHeight = aside.offsetHeight;
      const normalTop = 96; // top-24 = 96px
      const stopPoint = footerTop - asideHeight - 180; // 150px gap before footer

      if (scrollTop + normalTop > stopPoint) {
        // ToC would overlap footer, so push it up
        setTopOffset(stopPoint - scrollTop);
      } else {
        setTopOffset(normalTop);
      }
    }
  }, [flatHeaders]);

  useEffect(() => {
    if (flatHeaders.length === 0) return;
    updateActiveId();

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveId();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [flatHeaders, updateActiveId]);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (toc.length === 0) return null;

  return (
    <aside
      ref={asideRef}
      className="hidden xl:block fixed right-8 w-56 z-40"
      style={{ top: `${topOffset}px` }}
    >
      <nav
        ref={navRef}
        className="max-h-[calc(100vh-8rem)] overflow-y-auto"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pl-5">
          On this page
        </h2>
        <ul className="space-y-1">
          {toc.map((item) => (
            <TocLink
              key={item.id}
              item={item}
              activeId={activeId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
