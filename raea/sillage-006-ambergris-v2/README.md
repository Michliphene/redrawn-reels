# SILLAGE N°6 · It was never whale vomit (ambergris) · on the shared kit (raea/sillage-kit, luxury pass v3)

Same voice, timings and facts as the first build (`public/episodes/scent-006-ambergris/`, Brian, 65.2 s). All content
lives in `compositions/reel.json`; `sillage.tsx` is the kit's 10-line entry. First build (hand-made set):
`raea/sillage-006-ambergris/`.

- Plates: 7 new photoreal Nano Banana images in the kit's style (`media/manifest.json`), full frame (kit rule P4).
- Flacon as dataviz: empty until "ambroxide", fills (1.3 s), drains on the cut to "price" (loop: level 0 → 0).
- Floating petals off on every shot: rose petals do not belong to a sea/whale subject.
- `setup.sh` merges the voice's "E U," into one caption word "EU,".
- Pre-flight (`../sillage-kit/tools/validate.mjs`): 0 ✗; 10 caption pages that repeat the title are hidden by the kit.

```bash
raea/sillage-006-ambergris-v2/render.sh                 # pre-flight → media → frames + mix → MP4 → raea check
raea/sillage-006-ambergris-v2/render.sh --stills "0,600"  # frames only
```
