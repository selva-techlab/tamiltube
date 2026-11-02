# TamilTube

Curated AI, LLM and data videos for Tamil speakers. No ads, no algorithm.
The entire "backend" is one file: `data/videos.json`.

## Folder structure

```
tamiltube/
├── app/
│   ├── layout.tsx        # fonts, page shell
│   ├── page.tsx          # homepage: loads the data
│   └── globals.css       # colour palette (white + orange) + base styles
├── components/
│   ├── VideoBrowser.tsx  # top bar, search, side menu, tag chips, grid
│   └── VideoCard.tsx     # one video: thumbnail → YouTube player on click
├── lib/
│   └── videos.ts         # reads the JSON, types, search logic
├── data/
│   └── videos.json       # ← THE ONLY FILE YOU EDIT DAY TO DAY
└── scripts/
    └── add_video.py      # optional: add a video from a YouTube URL
```

## Run it locally

Needs Node.js 20+ (`node -v` to check; install from nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3000. Edits to any file reload the page instantly.

## Add a video

**Option A — Python helper (easiest)**

```bash
python scripts/add_video.py https://www.youtube.com/watch?v=VIDEO_ID
```

It pulls the title and channel automatically and asks for category, tags,
language and a one-line description.

Works for playlists too — paste a `youtube.com/playlist?list=...` URL.

**Option B — edit `data/videos.json` by hand.** Copy any existing entry and change it:

```json
{
  "youtubeId": "abc123XYZ_0",
  "title": "...",
  "description": "One line on why it's worth watching.",
  "category": "llms",
  "tags": ["llm", "beginner"],
  "source": "Stanford",
  "channel": "Andrew Ng · Stanford Online",
  "language": "ta",
  "added": "2026-11-02"
}
```

- `youtubeId` = the 11 characters after `v=` in the URL.
- For a whole course, use `"playlistId": "PL..."` (the part after `list=`) instead.
  Optionally keep a `youtubeId` of its first lecture to get a thumbnail, and add `"count": 73`.
- `source` is what the "from:" filter groups by (Stanford, NPTEL, Harvard…).
- `category` must match an `id` in the `categories` list at the top of the file.
- `language`: `ta`, `en` or `tanglish`.

**Add a category:** append to `categories`, e.g.
`{ "id": "python", "name": "Python", "ta": "பைதான்" }`. It shows up automatically.

## Deploy (free, ~5 minutes) — Vercel

1. Create a GitHub repo and push:
   ```bash
   git add -A
   git commit -m "first version"
   git branch -M main
   git remote add origin https://github.com/<you>/tamiltube.git
   git push -u origin main
   ```
2. Go to vercel.com → sign in with GitHub → **Add New → Project** → pick `tamiltube` → **Deploy**. No settings to change.
3. You get a URL like `tamiltube.vercel.app`. Add your own domain under Project → Settings → Domains.

From then on, every `git push` redeploys the site automatically (~1 min).
Daily workflow: add videos → `git commit -am "add videos"` → `git push`. Done.

## When to move beyond JSON

The JSON file comfortably handles a few hundred videos. Move to Supabase only
if you want non-technical people adding videos through a form, user accounts,
or view counts. Only `lib/videos.ts` would need to change.

## Customise the look

Colours live in the `:root` block at the top of `app/globals.css`
(`--accent` is the orange in the logo).
