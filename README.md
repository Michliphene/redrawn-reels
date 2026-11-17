# Studio reels — REDRAWN (maps) and RECEIPTS (money)

Short vertical videos written as a cue sheet and rendered with Remotion. One codebase, several series, one art
direction kit. Channel names live in `public/studio.json`.

```
public/episodes/<id>/episode.json   ← script + cues (the only file written per video) and SOURCES.md
npm run validate <id>               ← pre-flight: cue words, map ids, assets, figures vs SOURCES.md, safe area
npm run stills <id> -- --n 12       ← contact sheet in ~45 s, without rendering the video
pipeline/render.sh <id>             ← voice (only if the script changed) → music → render → −14 LUFS → out/<id>.mp4
npm test                            ← type-check, pre-flight of every episode, unit tests
```

| Read | For |
|---|---|
| `docs/LOCAL_SETUP.md` | run everything on your own machine (`scripts/setup-local.sh`, French) |
| `CLAUDE.md` | the rules and the episode checklist |
| `docs/STUDIO.md` | art direction (DA 2), the shared kit, camera language, formats, quality gates, resilience |
| `docs/AXES_AMELIORATION.md` | diagnostic and next steps (French, for the owner) |
| `docs/01_SERIES_AND_TOPICS.md`, `docs/RECEIPTS_SERIES.md` | the two series bibles and their backlogs |
| `docs/VIRALITY_PLAYBOOK.md` | what the reviewers score against |

Art direction is versioned per episode: no `da` field = DA 1 (flat, as published), `"da": 2` = low-res 3D world with
crisp type (`src/atlas` for maps, `src/money/Money3D.tsx` for money). Templates: `ussr-1991-v2`, `costco-hotdog-v2`.
The 3D world needs WebGL; on a machine without a GPU the config falls back to software rendering, and without
WebGL at all an episode renders in its flat version.
