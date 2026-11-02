"use client";

// The whole page: top bar (menu, logo, search, help), side menu, tag chips
// and the video grid. All filtering happens in the browser — no API.

import { useEffect, useMemo, useRef, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { matchesQuery, videoKey, type Category, type Video } from "@/lib/videos";

/* ── Small inline icons (no icon library needed) ── */
const Icon = {
  menu: <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />,
  search: (
    <path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3m0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10" />
  ),
  help: (
    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20m0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16m0 11a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4M12 6a3.5 3.5 0 0 1 1.2 6.8c-.5.2-.7.5-.7.9v.3h-2v-.3c0-1.3.7-2.2 1.9-2.7a1.5 1.5 0 1 0-1.9-1.5h-2A3.5 3.5 0 0 1 12 6" />
  ),
  home: <path d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z" />,
  close: <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z" />,
};
function Svg({ children, className = "h-6 w-6" }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {children}
    </svg>
  );
}

const sideItem = (on: boolean) =>
  `flex w-full cursor-pointer items-center gap-4 rounded-lg px-3 py-2 text-left text-sm ${
    on ? "bg-chip font-semibold text-fg" : "text-fg hover:bg-chip"
  }`;

export default function VideoBrowser({
  videos,
  categories,
  tags,
  sources,
}: {
  videos: Video[];
  categories: Category[];
  tags: string[];
  sources: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [tamilOnly, setTamilOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true); // desktop side menu
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile side menu
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function goHome() {
    setQuery("");
    setCategory(null);
    setSource(null);
    setTag(null);
    setTamilOnly(false);
    setDrawerOpen(false);
  }

  // "/" focuses search, Esc clears it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        setHelpOpen(false);
        setDrawerOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleMenu() {
    if (window.matchMedia("(min-width: 1024px)").matches) setMenuOpen((o) => !o);
    else setDrawerOpen((o) => !o);
  }

  const filtered = useMemo(
    () =>
      videos.filter(
        (v) =>
          matchesQuery(v, query) &&
          (!category || v.category === category) &&
          (!source || v.source === source) &&
          (!tag || v.tags.includes(tag)) &&
          (!tamilOnly || v.language !== "en")
      ),
    [videos, query, category, source, tag, tamilOnly]
  );

  const isHome = !query && !category && !source && !tag && !tamilOnly;

  /* ── Side menu content (shared by desktop sidebar and mobile drawer) ── */
  const menu = (
    <nav className="flex flex-col gap-1 p-3">
      <button type="button" onClick={goHome} className={sideItem(isHome)}>
        <Svg>{Icon.home}</Svg> Home
      </button>
      <button
        type="button"
        onClick={() => setTamilOnly((t) => !t)}
        className={sideItem(tamilOnly)}
      >
        <span className="flex h-6 w-6 items-center justify-center text-base font-bold text-accent">
          அ
        </span>
        தமிழ் only
      </button>

      <hr className="my-3 border-line" />
      <p className="px-3 pb-1 text-base font-semibold">Topics</p>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => {
            setCategory((cur) => (cur === c.id ? null : c.id));
            setDrawerOpen(false);
          }}
          className={sideItem(category === c.id)}
        >
          <span className="flex flex-col">
            <span>{c.name}</span>
            <span className="text-xs font-normal text-muted">{c.ta}</span>
          </span>
        </button>
      ))}

      <hr className="my-3 border-line" />
      <p className="px-3 pb-1 text-base font-semibold">From</p>
      {sources.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => {
            setSource((cur) => (cur === s ? null : s));
            setDrawerOpen(false);
          }}
          className={sideItem(source === s)}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-chip text-xs font-bold text-muted">
            {s[0]}
          </span>
          {s}
        </button>
      ))}

      <p className="mt-6 px-3 text-xs leading-relaxed text-muted">
        Free, hand-picked videos. No ads, no algorithm.
      </p>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-bg px-2 sm:gap-4 sm:px-4">
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={toggleMenu}
            className="cursor-pointer rounded-full p-2 hover:bg-chip"
            aria-label="Menu"
          >
            <Svg>{Icon.menu}</Svg>
          </button>
          <button
            type="button"
            onClick={goHome}
            className="cursor-pointer text-xl font-bold tracking-tight sm:text-2xl"
            aria-label="TamilTube home"
          >
            <span className="text-fg">Tamil</span>
            <span className="text-accent">Tube</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
          className="mx-auto flex h-10 w-full max-w-2xl min-w-0"
          role="search"
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search · தேடுக"
            aria-label="Search videos"
            className="h-full w-full min-w-0 rounded-l-full border border-line px-4 text-base text-fg placeholder:text-muted focus:border-[#1c62b9] focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-full w-12 shrink-0 cursor-pointer items-center justify-center rounded-r-full border border-l-0 border-line bg-chip hover:bg-chip-hover sm:w-16"
            aria-label="Search"
          >
            <Svg className="h-5 w-5">{Icon.search}</Svg>
          </button>
        </form>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setHelpOpen((o) => !o)}
            className="cursor-pointer rounded-full p-2 hover:bg-chip"
            aria-label="Help"
            aria-expanded={helpOpen}
          >
            <Svg>{Icon.help}</Svg>
          </button>
          {helpOpen && (
            <div className="absolute top-12 right-0 w-64 rounded-xl border border-line bg-bg p-4 text-sm shadow-lg">
              <p className="font-semibold">About TamilTube</p>
              <p className="mt-1 text-muted">
                Free AI, ML and data videos picked by hand for Tamil speakers.
              </p>
              <p className="mt-3 font-semibold">Shortcuts</p>
              <p className="mt-1 text-muted">
                <kbd className="rounded border border-line px-1">/</kbd> search ·{" "}
                <kbd className="rounded border border-line px-1">Esc</kbd> clear
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* ── Desktop side menu ── */}
        {menuOpen && (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto lg:block">
            {menu}
          </aside>
        )}

        {/* ── Mobile drawer ── */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            />
            <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-bg shadow-xl">
              <div className="flex h-14 items-center gap-3 px-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="cursor-pointer rounded-full p-2 hover:bg-chip"
                  aria-label="Close menu"
                >
                  <Svg>{Icon.close}</Svg>
                </button>
                <span className="text-xl font-bold tracking-tight">
                  Tamil<span className="text-accent">Tube</span>
                </span>
              </div>
              {menu}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6">
          {/* ── Tag chips ── */}
          <div className="no-scrollbar sticky top-14 z-20 -mx-4 flex gap-3 overflow-x-auto bg-bg px-4 py-3 sm:-mx-6 sm:px-6">
            {[null, ...tags].map((t) => {
              const on = tag === t;
              return (
                <button
                  key={t ?? "all"}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    on ? "bg-fg text-bg" : "bg-chip text-fg hover:bg-chip-hover"
                  }`}
                >
                  {t ? t.replace(/-/g, " ") : "All"}
                </button>
              );
            })}
          </div>

          {/* ── Results ── */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-semibold">No results · எதுவும் கிடைக்கவில்லை</p>
              <button
                type="button"
                onClick={goHome}
                className="mt-4 cursor-pointer rounded-full bg-chip px-4 py-2 text-sm font-medium hover:bg-chip-hover"
              >
                Clear filters
              </button>
            </div>
          ) : (
            categories.map((cat) => {
              const items = filtered.filter((v) => v.category === cat.id);
              if (items.length === 0) return null;
              return (
                <section key={cat.id} className="pt-4 pb-6">
                  <h2 className="mb-4 flex items-baseline gap-3 text-xl font-bold">
                    {cat.name}
                    <span className="text-sm font-normal text-muted">{cat.ta}</span>
                  </h2>
                  <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {items.map((v) => (
                      <VideoCard key={videoKey(v)} video={v} />
                    ))}
                  </div>
                  <hr className="mt-8 border-line" />
                </section>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
