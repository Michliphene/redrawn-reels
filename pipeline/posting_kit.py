"""Build a local copy/paste kit; never publish or silently shorten authored copy.
python pipeline/posting_kit.py <id> [--check]
Canonical policy: docs/STUDIO.md, Packaging and image provenance.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def read_json(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))

def resolve(arg):
    if not arg.isdigit():
        if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', arg):
            raise ValueError('Use an episode id, not a path.')
        return arg
    hits = [read_json(p)['id'] for p in Path(ROOT, 'public/episodes').glob('*/episode.json')
            if read_json(p).get('episode') == int(arg)]
    if len(hits) != 1:
        raise ValueError(f'Episode {arg}: use an id ({", ".join(sorted(hits)) or "no match"}).')
    return hits[0]

def sections(md):
    out, cur = {}, None
    for line in md.splitlines():
        m = re.match(r'^## (.+)', line)
        if m:
            cur = m.group(1).split(' (')[0].strip().lower()
            out[cur] = []
        elif cur:
            out[cur].append(line)
    return {k: '\n'.join(v).strip() for k, v in out.items()}

def strip_fence(s):
    m = re.search(r'```\w*\n(.*?)```', s, re.S)
    return (m.group(1) if m else s).strip()

def caption_from(s):
    key = next((k for k in s if k == 'caption' or 'caption' in k or k == 'description'), None)
    block = s.get(key, '')
    parts = re.split(r'\n\*\*Hashtags[^\n]*\*\*\s*', block, maxsplit=1, flags=re.I)
    body = strip_fence(parts[0])
    tags = re.findall(r'(?<!\w)#[\w]+', body + '\n' + (parts[1] if len(parts) > 1 else s.get('hashtags', '')))
    body = re.sub(r'(?<!\w)#[\w]+', '', body).strip()
    return body, ' '.join(dict.fromkeys(tags))

def check_caption(caption, hashtags):
    # 120 is a target, 220 the default export ceiling. Never truncate qualifiers or credits.
    if not caption or len(caption) > 220:
        raise ValueError(f'Caption is {len(caption)} characters; write 1–2 short sentences, target 120–220, excluding hashtags. Copy was not truncated.')
    if len(re.findall(r'#[\w]+', hashtags)) > 3:
        raise ValueError('Use 0–3 relevant hashtags. Copy was not changed.')
    return ['Caption below the 120-character target; keep it if the idea is complete.'] if len(caption) < 120 else []

def build_kit(ep, s):
    caption, hashtags = caption_from(s)
    check_caption(caption, hashtags)
    pinned = strip_fence(s.get('pinned comment', ''))
    if not pinned:
        raise ValueError('Pinned comment missing: preserve sources, calculations and required credits here.')
    registry = read_json(Path(ROOT, 'public/studio.json'))['series']
    slug = lambda v: re.sub(r'[^a-z0-9]', '', str(v or '').lower())
    series = registry.get(ep.get('seriesId')) or next((v for k, v in registry.items()
        if slug(ep.get('series')) in [slug(k), slug(v['name']), *map(slug, v.get('legacyNames', []))]), None)
    if series is None:
        raise ValueError('Unknown series; set seriesId from public/studio.json.')
    title_block = strip_fence(s.get('title', ep['title']))
    m = re.search(r'\*\*(.+?)\*\*', title_block) or re.search(r'^\d+\.\s*(.+)$', title_block, re.M)
    title = m.group(1).strip() if m else title_block.splitlines()[0]
    yt = strip_fence(s.get('youtube shorts description', '')) or f'{caption}\n\n{pinned}\n\n{series["tagline"]}'
    return f'''# {series["name"]} EP {ep.get("episode", "?")} — post kit ({ep["id"]})

## TITLE (YouTube Shorts)
{title}

## DESCRIPTION (TikTok / Instagram)
{caption}{chr(10) + chr(10) + hashtags if hashtags else ""}

## PINNED COMMENT
{pinned}

## YOUTUBE SHORTS DESCRIPTION
{yt}
'''

def main():
    ep_id = resolve(sys.argv[1])
    ep = read_json(Path(ROOT, 'public/episodes', ep_id, 'episode.json'))
    kit_dir = Path(ROOT, 'deliverables', ep_id)
    s = sections((kit_dir / 'POSTING.md').read_text(encoding='utf-8'))
    out = build_kit(ep, s)
    caption, tags = caption_from(s)
    for warning in check_caption(caption, tags):
        print('! ' + warning, file=sys.stderr)
    if '--check' in sys.argv:
        print(f'{ep_id}: {len(caption)} characters, {len(tags.split())} hashtags; local kit valid')
    else:
        (kit_dir / 'POST.md').write_text(out, encoding='utf-8')
        print(out)

if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, IndexError) as e:
        sys.exit(str(e))
