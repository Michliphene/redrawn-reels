"""Copy-paste posting kit for one reel.

Usage: python3 pipeline/posting_kit.py <episode_id | EP number>
Reads deliverables/<id>/POSTING.md (sections: Title, Caption + **Hashtags**, Pinned comment,
YouTube Shorts description, Platform notes — missing ones are derived) and writes
deliverables/<id>/POST.md: the exact texts to paste, in a fixed order. Prints it too.
"""
import argparse
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
EPISODES = ROOT / "public/episodes"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def resolve(arg):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", arg):
        sys.exit("Use an episode id or a unique episode number")
    if not arg.isdigit():
        return arg
    matches = sorted(p.parent.name for p in EPISODES.glob("*/episode.json")
                     if read_json(p).get("episode") == int(arg))
    if len(matches) != 1:
        sys.exit(f"Ambiguous episode {arg}: {', '.join(matches)}" if matches else f"No episode with number {arg}")
    return matches[0]


def series_for(episode):
    series = read_json(ROOT / "public/studio.json")["series"]
    if episode.get("seriesId") in series:
        return series[episode["seriesId"]]
    legacy = re.sub(r"[^a-z0-9]", "", (episode.get("series") or "").lower())
    for key, item in series.items():
        names = [key, item["name"], *item.get("legacyNames", [])]
        if legacy and any(re.sub(r"[^a-z0-9]", "", name.lower()) == legacy for name in names):
            return item
    composition = episode.get("composition", "Episode")
    for item in series.values():
        if item["composition"] == composition:
            return item
    sys.exit(f"Unknown series for {episode['id']}")

def sections(md):
    out, cur = {}, None
    for line in md.splitlines():
        m = re.match(r"^## (.+)", line)
        if m:
            cur = m.group(1).split(" (")[0].strip().lower(); out[cur] = []
        elif cur:
            out[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in out.items()}

def strip_fence(s):
    m = re.search(r"```\w*\n(.*?)```", s, re.S)
    return (m.group(1) if m else s).strip()

def main():
    parser = argparse.ArgumentParser(description="Prepare posting copy locally")
    parser.add_argument("episode", help="Episode id or unique episode number")
    ep_id = resolve(parser.parse_args().episode)
    ep = read_json(EPISODES / ep_id / "episode.json")
    series = series_for(ep)
    kit_dir = ROOT / "deliverables" / ep_id
    S = sections((kit_dir / "POSTING.md").read_text(encoding="utf-8"))
    cap_block = S.get("caption", "")
    m = re.search(r"\*\*Hashtags[^*]*\*\*\s*(.+)", cap_block)
    hashtags = m.group(1).strip() if m else ""
    caption = strip_fence(re.split(r"\n\*\*Hashtags", cap_block)[0]).strip()
    tiktok = strip_fence(S.get("tiktok description", "")) or caption
    instagram = strip_fence(S.get("instagram description", "")) or caption
    pinned = strip_fence(S.get("pinned comment", ""))
    if not tiktok or not instagram or not pinned:
        sys.exit("POSTING.md requires caption copy for both platforms and a pinned comment")
    # title: Title section (first numbered/bold item) > YouTube title in platform notes > episode title
    title = None
    if "title" in S:
        m = re.search(r"\*\*(.+?)\*\*", S["title"]) or re.search(r"^\d+\.\s*(.+)$", S["title"], re.M)
        title = m.group(1).strip() if m else None
    if not title:
        m = re.search(r'YouTube Shorts:\*\*\s*title\s+"([^"]+)"', S.get("platform notes", ""))
        title = m.group(1) if m else ep["title"]
    yt = strip_fence(S["youtube shorts description"]) if "youtube shorts description" in S else None
    if not yt:
        src_line = pinned.split("\n")[0]
        tags = " ".join(hashtags.split()[:3])
        yt = f"{instagram.splitlines()[0]}\n\n{src_line}\n\n{series['name']}: {series['tagline']}\n\n#Shorts {tags}".strip()
    n = ep.get("episode", "?")
    tag = series["episodeTag"].format(n=n, nnn=str(n).zfill(3))
    out = f"""# {series['name']} {tag} — post kit ({ep_id})

The release manifest lists the video and covers that accompany this copy.

## TITLE (YouTube Shorts)
{title}

## DESCRIPTION (TikTok)
{tiktok}

{hashtags}

## DESCRIPTION (Instagram)
{instagram}

{hashtags}

## PINNED COMMENT (post it right after publishing, then pin)
{pinned}

## YOUTUBE SHORTS DESCRIPTION
{yt}
"""
    (kit_dir / "POST.md").write_text(out, encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    print(out)

if __name__ == "__main__":
    main()
