# RECEIPTS #007 · Where $100 at Amazon goes · raea edition

Built in **raea 0.1.8-rc11** (first episode on the 0.1.8 line; earlier projects were made with 0.1.7, and
`chipotle-3d` renders unchanged on rc11). The text is the episode `amazon-100`: its voice (ElevenLabs George),
word timings and figures (`public/episodes/amazon-100/SOURCES.md`, Amazon 10-K FY2025).

| Beat | What the set does |
|---|---|
| hook | crane-in on three plain parcels on a plinth, "$717B"; on "never see" a server rack lights up in the dark behind |
| take / shop / cloud | $100 = 100 identical cubes (1 cube = $1): 82 parcels drop onto a pallet on "$82", 18 servers slide into a rack on "$18" |
| ship | a conveyor in front of the pallet runs parcels out; "$103B shipping · 2025" |
| shopkeep / cloudkeep | the kept dollars light lime: 4.79 parcels, 6.36 servers (the last cube in part) |
| share / year | the two lime amounts stand as two columns, the AWS one flares on "57%"; "$45.6B" over the rack |
| point / loop | low on the boxes, crane up the glowing rack; back to the parcels, the top box drops on "box" (= frame 0) |

## Run it

```bash
raea/amazon-3d/setup.sh     # media/ from public/ (voice, music, sfx, fonts as TTF), timings.json
RAEA_BIN="$USERPROFILE/.raea/versions/0.1.8-rc11/raea/bin/raea.exe" raea/amazon-3d/render.sh
```

rc11 is unpacked beside the installed 0.1.7 app (`~/.raea/versions/0.1.8-rc11`, sha256 checked against the release).
Without `RAEA_BIN`, `render.sh` uses the app's 0.1.7.
