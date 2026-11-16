"""Copy-paste posting kit for one reel.

Usage: python3 pipeline/posting_kit.py <episode_id | EP number>
Reads deliverables/<id>/POSTING.md (sections: Title, Caption + **Hashtags**, Pinned comment,
YouTube Shorts description, Platform notes — missing ones are derived) and writes
deliverables/<id>/POST.md: the exact texts to paste, in a fixed order. Prints it too.
"""
import json, os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def resolve(arg):
    if not arg.isdigit():
        return arg
    for p in glob.glob(os.path.join(ROOT, "public/episodes/*/episode.json")):
        ep = json.load(open(p))
        if ep.get("episode") == int(arg):
            return ep["id"]
    sys.exit(f"no episode with number {arg}")

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
    ep_id = resolve(sys.argv[1])
    ep = json.load(open(os.path.join(ROOT, "public/episodes", ep_id, "episode.json")))
    kit_dir = os.path.join(ROOT, "deliverables", ep_id)
    S = sections(open(os.path.join(kit_dir, "POSTING.md")).read())
    cap_block = S.get("caption", "")
    m = re.search(r"\*\*Hashtags[^*]*\*\*\s*(.+)", cap_block)
    hashtags = m.group(1).strip() if m else ""
    caption = strip_fence(re.split(r"\n\*\*Hashtags", cap_block)[0]).strip()
    pinned = strip_fence(S.get("pinned comment", ""))
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
        yt = f"{caption.splitlines()[0]}\n\n{src_line}\n\nREDRAWN: map history in under a minute.\n\n#Shorts {tags}".strip()
    n = ep.get("episode", "?")
    out = f"""# REDRAWN EP {n} — post kit ({ep_id})

Video: out/{ep_id}.mp4 · Covers: deliverables/{ep_id}/cover_3x4.jpg (Instagram), cover_9x16.png (TikTok/Shorts)

## TITLE (YouTube Shorts)
{title}

## DESCRIPTION (TikTok / Instagram)
{caption}

{hashtags}

## PINNED COMMENT (post it right after publishing, then pin)
{pinned}

## YOUTUBE SHORTS DESCRIPTION
{yt}
"""
    open(os.path.join(kit_dir, "POST.md"), "w").write(out)
    print(out)

if __name__ == "__main__":
    main()
