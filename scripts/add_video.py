"""
Add a YouTube video OR playlist to data/videos.json from the terminal.

Usage (from the project folder):
    python scripts/add_video.py https://www.youtube.com/watch?v=VIDEO_ID
    python scripts/add_video.py https://www.youtube.com/playlist?list=PLAYLIST_ID

For single videos it fetches the title and channel automatically. Then it asks
for category, tags, source, language and a one-line description.
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "videos.json"


def parse(url: str) -> tuple[str | None, str | None]:
    """Return (video_id, playlist_id) — either may be None."""
    vid = None
    for p in (r"v=([\w-]{11})", r"youtu\.be/([\w-]{11})", r"(?:embed|shorts|live)/([\w-]{11})"):
        m = re.search(p, url)
        if m:
            vid = m.group(1)
            break
    pl = re.search(r"list=([\w-]+)", url)
    if not vid and not pl and re.fullmatch(r"[\w-]{11}", url):
        vid = url
    if not vid and not pl:
        sys.exit(f"Could not find a video or playlist ID in: {url}")
    return vid, pl.group(1) if pl else None


def fetch_meta(url: str) -> dict:
    """YouTube's public oEmbed endpoint — no API key needed."""
    try:
        q = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(url)
        with urllib.request.urlopen(q, timeout=10) as r:
            return json.load(r)
    except Exception:
        print("(Couldn't fetch the title automatically — you'll type it.)")
        return {}


def ask(prompt: str, default: str = "") -> str:
    shown = f" [{default}]" if default else ""
    return input(f"{prompt}{shown}: ").strip() or default


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)

    data = json.loads(DATA.read_text(encoding="utf-8"))
    vid, pl = parse(sys.argv[1])

    for v in data["videos"]:
        if (pl and v.get("playlistId") == pl) or (not pl and vid and v.get("youtubeId") == vid):
            sys.exit("That one is already in the list.")

    meta = fetch_meta(f"https://www.youtube.com/playlist?list={pl}" if pl else f"https://www.youtube.com/watch?v={vid}")
    cats = [c["id"] for c in data["categories"]]
    sources = sorted({v["source"] for v in data["videos"]})
    print("Categories:", ", ".join(cats))
    print("Existing sources:", ", ".join(sources))

    category = ask("Category", cats[0])
    if category not in cats:
        sys.exit(f"Unknown category '{category}'. Add it to 'categories' in videos.json first.")

    entry: dict = {}
    if vid:
        entry["youtubeId"] = vid
    if pl:
        entry["playlistId"] = pl
    entry.update({
        "title": ask("Title", meta.get("title", "")),
        "description": ask("One-line description"),
        "category": category,
        "tags": [t.strip().lower() for t in ask("Tags (comma separated)").split(",") if t.strip()],
        "source": ask("Source (e.g. Stanford, NPTEL)", meta.get("author_name", "")),
        "channel": ask("Shown as (instructor / channel)", meta.get("author_name", "")),
        "language": ask("Language (ta / en / tanglish)", "ta"),
    })
    if pl:
        n = ask("Number of lectures (optional)")
        if n.isdigit():
            entry["count"] = int(n)
    entry["added"] = date.today().isoformat()

    data["videos"].append(entry)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added: {entry['title']}")


if __name__ == "__main__":
    main()
