# studio-board

A Claude Code pane for the reel studio in this repository. It shows every episode of every series, where it
stands in the pipeline (sources, map data, pre-flight, voice, music, stills, render, review, post kit,
publication), its review and virality scores, its views once posted, and the exact next command.
It follows pipeline commands Claude runs (render, stills, pre-flight, voice, post kit): status line while they
run, a toast when a render ends. `/board` opens it and refreshes; `/board <id|n>` prints one episode in detail.
The data comes from `node scripts/board.mjs --json` (the same board as `npm run board`). Read-only.
