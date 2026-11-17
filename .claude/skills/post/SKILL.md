---
name: post
description: Deliver a reel of any series of this studio (REDRAWN, RECEIPTS) ready to publish — fresh video, Instagram cover, title, description + hashtags, pinned comment, YouTube description. Use whenever the owner asks to post / resend / "repasse" / "envoie" a reel by number (EP 1, reel 003…) or id.
---
# Posting routine

0. Run `npm run validate <id> -- --strict`. A `✗` blocks posting; read every `!` to the owner (an on-screen figure
   missing from `SOURCES.md` must be sourced or removed first).
1. Run `pipeline/post.sh <EP number or id>` (re-renders only if the video is stale, checks duration 30–75 s and ≈ −14 LUFS, writes `deliverables/<id>/POST.md`). Report any `!!` line.
   Two series can share an episode number: when the owner gives a number, say which series you took or use the id.
2. If covers are missing, render them: `npx remotion still src/index.ts <Episode|Money> deliverables/<id>/cover_9x16.png --frame=<N> --props='{"episodeId":"<id>","cover":true}'` then crop `crop=1080:1440:0:240` → `cover_3x4.jpg`. In DA 2 the title block already sits inside the safe area, so frame 0 with `cover` is a valid cover.
3. Send with SendUserFile: the video and the **phone-format designed cover** `thumb_9x16.png` (+ `thumb_3x4.jpg` grid crop) when the
   episode has a `thumb` config (owner prefers this to a raw frame; fall back to `cover_3x4.jpg` otherwise), `thumb_16x9.png` (if the episode has a `thumb` config — 16:9 YouTube/landscape
   thumbnail rendered by the `Thumb` composition: `kicker`, `main`, `badge`, `badgeSub`, `fit` ids, `mapBox`), and `POST.md`.
4. Reply in French, short, then paste the texts from `POST.md` in this order, each in its own code block (texts stay in English):
   **Titre** (YouTube Shorts) · **Description** (TikTok/Instagram, with hashtags) · **Commentaire épinglé** · **Description YouTube**.
5. Add at most 3 posting tips (Instagram cover, TikTok: post from the app + AI label if asked, US time slot ≈ 14h–17h Paris).
6. Never change facts in these texts without updating `SOURCES.md`; if a text in POSTING.md overclaims vs SOURCES.md, fix POSTING.md first.
7. Commit + push any changed files.
