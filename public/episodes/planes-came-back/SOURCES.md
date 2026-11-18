# UNGRADED #003 — The planes that came back

Format: A. explainer with a twist + C. a counted game. Art direction: **Blueprint** (motion design on an engineering
sheet, `composition: Blueprint`, `src/blueprint/`). Inspired by the reference channel's angle "making money once
is luck, knowing why is a skill"; our own story, script and sources.

## Script (voice)
1. 1943. Bombers come home full of bullet holes. Where do you add armour?
2. That's how the famous story starts. The details are disputed. The lesson isn't.
3. The obvious answer: the wings, the tail, the body. That's where the holes are.
4. A statistician named Abraham Wald looks at the same planes and sees the opposite.
5. These are only the planes that came back.
6. Planes hit in the engines didn't come home. Their holes never got counted.
7. So the clean spots on the survivors are the dangerous ones.
8. Wald's real 1943 memo has a plain title: estimating plane vulnerability from the damage of survivors.
9. Now a game. 1,024 people each flip a coin ten times.
10. Tails, you're out. Every round, about half drop out.
11. After ten rounds, about one person has flipped ten heads in a row.
12. Pure luck. And that's the person who gets interviewed.
13. Success stories work the same way. We hear from the planes that came back.
14. Not from the people who made the same choices and never made it home.
15. Making money once can be luck. Knowing why it worked, and checking who didn't make it, is the skill.
16. Before you copy anyone, look for the missing holes. Like a statistician did in… → (loop) 1943.

## Facts table
| On screen / spoken | Status | Source |
|---|---|---|
| Abraham Wald, statistician; a 1943 memo, "A Method of Estimating Plane Vulnerability Based on Damage of Survivors" | real document, written for the Statistical Research Group (SRG), Columbia University, for the US war effort; reprinted by the Center for Naval Analyses (CRC 432, July 1980) | Mangel & Samaniego, "Abraham Wald's Work on Aircraft Survivability", *Journal of the American Statistical Association* 79 (386), 1984, pp. 259–267; Wikipedia "Abraham Wald" |
| "Bombers come home full of holes… armour the holes… the opposite" | **the popular version of the story; details disputed** (who asked, which aircraft, what exactly was recommended) | Bill Casselman, "The Legend of Abraham Wald", AMS Feature Column, June 2016: "extremely little source material", much of the narrative is "plausible reconstruction" |
| Holes on wings, tail and body; none on engines and cockpit | **illustrative drawing**, not data; the plane is a schematic, not a real type (labelled "schematic · not to scale") | — |
| 1,024 people, 10 flips, about 1 left (10 heads in a row) | arithmetic: 1,024 = 2^10; each round halves the field on average; chance of 10 heads = 1/1,024 | our calculation |
| round counter 512, 256, 128, 64, 32, 16, 8, 4, 2, 1 | the expected halving shown as exact for readability | our calculation |

## Debated points (be ready for comments)
- "The story is a myth": we say it on screen ("the story as usually told · details disputed") and in the voice
  ("The details are disputed. The lesson isn't."). The memo is real; the dialogue around it is folklore.
- Survivorship bias is not an argument against effort or skill: the script says skill = knowing why something
  worked and checking who did not make it.
- No claim that any particular success story is luck.

## Pinned comment
The famous bomber story is told many ways; historians say little source material survives (AMS Feature Column,
2016). What is real: Abraham Wald's 1943 memo on estimating plane vulnerability from the damage of survivors.
The coin game is plain arithmetic: 1,024 = 2^10. Which success story do you think had the most "missing holes"?

## To tick before posting (owner)
- [ ] Memo title and 1943 date checked against Mangel & Samaniego (1984) or the CNA reprint.
