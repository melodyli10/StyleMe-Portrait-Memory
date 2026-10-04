# Final held-out evaluation

The final evaluation compared **Fixed Preset** with **StyleMe** on ten held-out portraits.

## Final result

- 10 held-out portraits
- **4 successfully scored paired cases**
- **6 safely skipped**
- **0 processing failures**
- Fixed Preset: **7 total corrections**, **1.75 mean corrections per scored image**
- StyleMe: **3 total corrections**, **0.75 mean corrections per scored image**
- Relative reduction: **57.1%**

The original target was at least 30% fewer average correction units than Fixed Preset. StyleMe exceeded this target within the four evaluable paired cases.

The 57.1% figure does **not** describe all ten portraits. Six portraits were skipped and kept separate from the correction averages.

## Case-level outcomes

| Case | Fixed Preset corrections | StyleMe corrections | Outcome |
| --- | ---: | ---: | --- |
| H01 | — | — | Skipped: 0 faces detected |
| H02 | — | — | Skipped: 0 faces detected |
| H03 | 2 | 0 | Scored |
| H04 | — | — | Skipped: 0 faces detected |
| H05 | 2 | 2 | Scored |
| H06 | 1 | 0 | Scored |
| H07 | — | — | Skipped: unreliable / nearly closed eyes |
| H08 | — | — | Skipped: 0 faces detected |
| H09 | — | — | Skipped: eyes too small to adjust safely |
| H10 | 2 | 1 | Scored |

One correction means one supported setting still needs manual adjustment after the automatic output. Eye Enlargement and Face Slimming were each scored 0 or 1, giving 0–2 correction units per scored output.

Skipped cases were never counted as successful zero-correction outputs.

## What was compared

Fixed Preset used the first confirmed development example:

- Eye Enlargement = 34
- Face Slimming = 57

The five confirmed development pairs were:

- 34 / 57
- 43 / 53
- 46 / 65
- 47 / 68
- 43 / 65

Their median was Eye 43 / Face 65.

I tested whether Eye Enlargement could adapt to the detected face geometry, but the five examples did not show a clear pattern between geometry and my preferred settings. I therefore kept the median rather than forcing an adaptation rule.

The final measured comparison was therefore:

**Fixed Preset 34/57 vs StyleMe median 43/65**, with the same per-image safety checks.

The 57.1% reduction is not evidence that geometry-based adaptation improved the result.

## Blind scoring

The Evaluation Lab presented the two methods as anonymous Output A and Output B. Their identities were hidden during scoring and revealed only after finalization.

The protocol, acceptance criteria, profile and held-out dataset were frozen before scoring. The author remained the evaluator, so concealing A/B identity reduced one source of bias but did not remove evaluator subjectivity.

See:
- [Evaluation protocol](evaluation_protocol.md)
- [Case-level results](results.csv)

## Interpretation

StyleMe required fewer manual corrections than the fixed preset on the portraits it could safely process.

The main limitation was coverage: only 4/10 held-out portraits were evaluable. Four had no reliable single-face detection, one had unreliable or nearly closed eye geometry, and one had eyes that were too small to adjust safely.

The dataset is also small and comes from one person and one photo series. These results therefore do not establish broad generalization.
