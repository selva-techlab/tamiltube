// Data layer. The whole "backend" is data/videos.json.
// To add a video or playlist: edit that file (or run
// `python scripts/add_video.py <youtube url>`), commit, push — the site rebuilds itself.

import data from "@/data/videos.json";

export type Category = {
  id: string;   // used in videos.json -> "category"
  name: string; // English label
  ta: string;   // Tamil label
};

export type Video = {
  /** Single video: the 11 characters after v= in the URL.
   *  For a playlist this is optional — if given, it's used as the thumbnail. */
  youtubeId?: string;
  /** Playlist: the ID after list= in the URL (starts with PL...). */
  playlistId?: string;
  title: string;
  description: string;
  category: string;     // must match a Category.id
  tags: string[];
  source: string;       // filter group, e.g. "Stanford", "NPTEL", "Andrej Karpathy"
  channel: string;      // shown on the card, e.g. "Andrew Ng · Stanford Online"
  language: "ta" | "en" | "tanglish";
  count?: number;       // number of lectures in a playlist, if known
  added: string;        // YYYY-MM-DD
};

const categories = data.categories as Category[];
const videos = data.videos as Video[];

/** Stable unique key for React lists. */
export function videoKey(v: Video): string {
  return v.playlistId ?? v.youtubeId ?? v.title;
}

export function getCategories(): Category[] {
  return categories;
}

/** Tamil content first, then newest first — the point of the site. */
export function getVideos(): Video[] {
  const tamilFirst = (v: Video) => (v.language === "en" ? 1 : 0);
  return [...videos].sort(
    (a, b) => tamilFirst(a) - tamilFirst(b) || b.added.localeCompare(a.added)
  );
}

function byFrequency(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

/** Every tag used anywhere, most common first. */
export function getAllTags(): string[] {
  return byFrequency(videos.flatMap((v) => v.tags));
}

/** Every source (institution / creator), most common first. */
export function getAllSources(): string[] {
  return byFrequency(videos.map((v) => v.source));
}

/** Case-insensitive match on title, description, source, channel and tags. */
export function matchesQuery(v: Video, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [v.title, v.description, v.source, v.channel, ...v.tags]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
