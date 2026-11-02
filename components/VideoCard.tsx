"use client";

// One video or playlist, in the YouTube/HackerTube card style. Shows a light
// thumbnail first and only loads the real player when clicked.

import { useState } from "react";
import type { Video } from "@/lib/videos";

// Cover colours for playlists that have no thumbnail image.
const SOURCE_COLOR: Record<string, string> = {
  Stanford: "#8c1515",
  Harvard: "#a51c30",
  MIT: "#750014",
  NPTEL: "#1f4e9c",
  "Andrej Karpathy": "#1f2937",
  "3Blue1Brown": "#1d4f73",
  Fireship: "#b45309",
};

function embedUrl(v: Video): string {
  const base = "https://www.youtube-nocookie.com/embed/";
  const params = "autoplay=1&rel=0";
  if (v.playlistId && v.youtubeId) return `${base}${v.youtubeId}?list=${v.playlistId}&${params}`;
  if (v.playlistId) return `${base}videoseries?list=${v.playlistId}&${params}`;
  return `${base}${v.youtubeId}?${params}`;
}

export default function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const isPlaylist = Boolean(video.playlistId);
  const isTamil = video.language !== "en";

  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-chip">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={embedUrl(video)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Play ${video.title}`}
          >
            {video.youtubeId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span
                className="flex h-full w-full flex-col items-start justify-end p-4 text-left text-white"
                style={{ background: SOURCE_COLOR[video.source] ?? "#374151" }}
              >
                <span className="text-xs font-medium tracking-wide uppercase opacity-80">
                  Full course
                </span>
                <span className="text-2xl font-bold">{video.source}</span>
              </span>
            )}

            {/* Bottom-right badge, like YouTube's duration / playlist label */}
            <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
              {isPlaylist ? (
                <>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M3 5h12v2H3zm0 4h12v2H3zm0 4h8v2H3zm13 0 6 3.5-6 3.5z" />
                  </svg>
                  {video.count ? `${video.count} lectures` : "Playlist"}
                </>
              ) : (
                "Video"
              )}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 pr-2">
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-fg">
          {video.title}
        </h3>
        <p className="text-sm text-muted">{video.channel}</p>
        <p className="line-clamp-2 text-sm leading-snug text-muted">{video.description}</p>
        {isTamil && (
          <span className="mt-1 w-fit rounded bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">
            தமிழ்
          </span>
        )}
      </div>
    </article>
  );
}
