# Review: alaska-1867, pass 5 (regression check)

Video `out/alaska-1867.mp4`: 55.63 s (1669 frames). The voice and cues end at 55.13 s; after that the title fades back in for the loop.
I read all 13 fresh beat sheets and `cues.md`. I also pulled extra frames into `/tmp/claude-0/review-tmp/p5_*.jpg`
at 0, 0.8, 46.7, 51.0, 52.2, 55.0 and 55.3 s. The comparison strip is `p5_sheet.jpg`.

## Verdict: 9/10. Postable: **YES**

I found no P1 and no P2. Every change made since pass 4 works, and none of them broke anything:

| Change since pass 4 | Result |
|---|---|
| Oil line "the largest oil field in the United States" + callout "Largest U.S. oil field / Prudhoe Bay · discovery announced 1968" | OK. It matches SOURCES.md line 31 word for word (claim limited to the U.S.; "announced 1968" with the Dec 1967 account logged). The pass-4 P1 (dates vary) and P2 (Cantarell) are both closed. |
| Oil holds trimmed | OK. The callout, Prudhoe marker and pipeline are gone before the loop's "All" (53.62 s). The loop beat starts on a clean white-outlined Alaska. |
| Hook pointer from [190,-230], fired on "million." | OK. The arrow comes in from the top right onto Alaska's interior. It does not cross the title or the $7,200,000 figure, and it is gone before the Texas ghost on "all" (3.65 s). |
| Pulse on "Alaska" in the state beat | OK. At 46.53 s Alaska gets a white outline exactly on the word. This fixes the 2 s dead stretch flagged in pass 4. The gold markers fade out underneath it. |
| Shorter flag caption "Sitka, 1867 · flags stylised" | OK. It sits on one line under the flagpole and clears the captions band. |
| LATER MYTH stamp offset | OK. The stamp lands on "largely" at the lower right of Alaska and only lightly overlaps the callout's top-right corner. It stays readable and is not cut off at the edge. |
| Gold line "So what did America get? Gold rushes." | OK. Juneau · 1880 lands on "Gold" and Nome · 1899 on "rushes". The date badge moves from 1880 to 1899. |
| Hook label "FOR ALL THIS?" | OK. It reads well under the figure, and the spoken "all of this" echoes it. |

Loop seam: the last voiced frame shows a red Alaska and the money bag on "bought for…". In the 0.5 s tail the title and the EP 2 chip
fade back in (55.3 s). Frame 0 shows the same red Alaska, title and "$7,200,000". The camera framing matches.

## Remaining items (none block posting)

1. **[P3] gold · 42.80–44.22 s · For 1.4 s ("So what did America get?") the screen shows only the chip and a "1880" badge.**
   The badge also appears before any place has been named. This is acceptable because it is a question beat.
   Optional fix: fire a pulse on "America" so the shape reacts during the question:
   ```json
   {"type":"pulse","ids":["ALASKA"],"atWord":"America"}
   ```
2. **[P3] loop seam · timeline.** The timeline dot sits at 1968 on the last frame and jumps to 1860 on frame 0.
   Viewers barely notice this. If you want it fixed, add a backward-moving date to the loop beat:
   `{"type":"date","date":"1867","atWord":"bought"}`. This also makes "bought" read as 1867. Check that the badge does not
   reappear over the clean loop frame; if it does, drop this fix.
3. **[P3] natives · 42.1 s · The Iñupiat and Athabascan labels fade about 0.4 s before "consulted" ends.** This is harmless.
   For a uniform exit, set `"hold":3.0` on the two regions that fire on "Native".

The accuracy re-check is clean. Every on-screen figure and date matches SOURCES.md: $7,200,000; ≈1.9¢ and 375M acres; Crimean War 1853–1856;
March 30 / April 9 / October 18, 1867; 37–2; ≈4,300 miles; Juneau 1880; Nome 1899; January 3, 1959; Prudhoe Bay with "discovery announced 1968"; pipeline 1977.
There are no layout collisions with the captions band (y ≈ 1380–1560) or the timeline.
