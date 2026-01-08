"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

interface Post {
  name: string;
  title: string;
  excerpt: string;
  tags: string[];
}

interface SearchCommandProps {
  posts: Post[];
}

export function SearchCommand({ posts }: SearchCommandProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [inlineOpen, setInlineOpen] = React.useState(false);
  const [inlineSearch, setInlineSearch] = React.useState("");
  const router = useRouter();
  const inlineRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcut for dialog
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setDialogOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click outside to close inline search
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inlineRef.current && !inlineRef.current.contains(e.target as Node)) {
        setInlineOpen(false);
        setInlineSearch("");
      }
    };

    if (inlineOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [inlineOpen]);

  const handleDialogSelect = (slug: string) => {
    setDialogOpen(false);
    router.push(`/${slug}`);
  };

  const handleInlineSelect = (slug: string) => {
    setInlineOpen(false);
    setInlineSearch("");
    router.push(`/${slug}`);
  };

  const filteredPosts = inlineSearch
    ? posts.filter(
        (post) =>
          post.title.toLowerCase().includes(inlineSearch.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(inlineSearch.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(inlineSearch.toLowerCase()),
          ),
      )
    : posts;

  return (
    <>
      {/* Inline search */}
      <div ref={inlineRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inlineSearch}
            onChange={(e) => {
              setInlineSearch(e.target.value);
              setInlineOpen(true);
            }}
            onFocus={() => setInlineOpen(true)}
            placeholder="Search posts..."
            className="pl-10 pr-20 h-12"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
          {inlineSearch && (
            <button
              onClick={() => {
                setInlineSearch("");
                setInlineOpen(false);
              }}
              className="absolute right-16 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Inline results dropdown */}
        {inlineOpen && inlineSearch && (
          <Command className="absolute top-full mt-2 w-full rounded-lg border shadow-md bg-popover z-50 h-[20vh]">
            <CommandList>
              <CommandEmpty>No posts found.</CommandEmpty>
              <CommandGroup>
                {filteredPosts.slice(0, 5).map((post) => (
                  <CommandItem
                    key={post.name}
                    value={post.name}
                    onSelect={() => handleInlineSelect(post.name)}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{post.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {post.excerpt}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </div>

      {/* Dialog search (Cmd+K / Ctrl+K) */}
      <CommandDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <CommandInput placeholder="Search posts..." />
        <CommandList>
          <CommandEmpty>No posts found.</CommandEmpty>
          <CommandGroup heading="Posts">
            {posts.map((post) => (
              <CommandItem
                key={post.name}
                value={`${post.title} ${post.excerpt} ${post.tags.join(" ")}`}
                onSelect={() => handleDialogSelect(post.name)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{post.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {post.excerpt}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
