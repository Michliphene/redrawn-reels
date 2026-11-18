---
name: post
description: Recheck and hand off an already reviewed local REDRAWN or RECEIPTS video and posting kit when the owner asks to resend or receive it.
---
# Posting routine

1. Resolve the episode id and variant. If the episode number is ambiguous, present the matching ids and let the owner identify the episode.
2. Run `npm run post -- <id>` or pass the explicit `--manifest <path> --approval <path>` for a variant. See [the release runbook](../../../docs/STUDIO_DELIVERY.md). Treat a non-zero exit as blocked. The resend path is read-only.
3. On success, hand off the exact `VIDEO=` and `KIT=` paths it prints. Recheck if a file changes before handoff. Reply in French with the English title, platform-specific descriptions and pinned comment from the verified kit.
4. On failure, report the specific gate. Preparation or re-rendering is a separate workflow. Ask for the real source, listening and rights checks when they are missing. An agent may prepare a draft record for the owner to review.
5. Upload, scheduling, publication, and remote Git writes require their own authorization. A verified local handoff is a check of the saved human decision and the matching files.
