---
description: How to turn user criteria into scores and a ranked applicant list.
---

# Ranking rubric

## Before you score

1. Call `get_ranking_criteria` for the active profile (default unless the user names one).
2. If none are saved and the user described a bar, call `set_ranking_criteria` first.
3. If still missing, ask for must-haves, nice-to-haves, and dealbreakers. Do not invent a bar.

## Scoring

- Start every applicant at 50.
- Must-haves: each clear miss −15 (floor 0). Each clear hit +5 (cap before nice-to-haves).
- Nice-to-haves: each clear hit +5 (cap 100).
- Dealbreakers: any hit → recommendation `reject`, score at most 20.
- When `weights` exist, scale the must-have / nice-to-have deltas by relative weight.
- Use only evidence in the applicant text. Mark unknowns in `gaps`, do not assume.

## Recommendations

- `advance`: no dealbreakers, all must-haves met, score ≥ 70.
- `maybe`: no dealbreakers, at most one soft must-have gap, score 45–69.
- `reject`: any dealbreaker, or multiple must-have misses, or score < 45.

## Output

1. Call `rank_applicants` with ranks `1..N` (best first), stable `applicantId`s, and short rationales.
2. Reply with a compact table: rank, name, score, recommendation, one-line why.
3. Call out anyone rejected for a dealbreaker explicitly.
