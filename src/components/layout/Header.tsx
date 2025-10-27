"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image src="/globe.svg" alt="Buzfi" fill className="object-contain" />
            </div>
            <span className="text-lg font-semibold text-black dark:text-zinc-50">Buzfi</span>
          </Link>
        </div>

        {/* Center: Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-black dark:text-zinc-50 hover:underline">Home</Link>
          <Link href="/checkout" className="text-black dark:text-zinc-50 hover:underline">Checkout</Link>
        </nav>

        {/* Right: Search + Hamburger */}
        <div className="flex items-center gap-3">
          <form onSubmit={onSearchSubmit} className="hidden sm:flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="h-9 w-44 md:w-64 rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-[#0a0a0a] px-3 text-sm text-black dark:text-zinc-50 focus:outline-none"
            />
          </form>
          <button
            aria-label="Toggle menu"
            className="md:hidden h-9 w-9 rounded-lg border border-black/10 dark:border-white/20 text-black dark:text-zinc-50"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {/* Simple hamburger icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/10 dark:border-white/15 bg-white dark:bg-black">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
            <form onSubmit={onSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="h-10 w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-[#0a0a0a] px-3 text-sm text-black dark:text-zinc-50 focus:outline-none"
              />
            </form>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="text-black dark:text-zinc-50" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/checkout" className="text-black dark:text-zinc-50" onClick={() => setMenuOpen(false)}>Checkout</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}