# Final held-out evaluation

Final version-3 held-out evaluation (baseline: `first-confirmed-example`, scope: Eye Enlargement + Face Slimming), supplied by the author:

- 10 held-out portraits: **4 successfully scored paired cases**, 6 safely skipped, 0 failed.
- Fixed Preset: **7 total corrections**, **1.75 mean corrections per scored image**.
- StyleMe: **3 total corrections**, **0.75 mean corrections per scored image**.
- Reduction: `(7 - 3) / 7 × 100 = 57.1%`, calculated only on the four evaluable paired cases.

The original >=30% target was exceeded within the evaluable subset. This does not demonstrate broad generalization: only 4/10 portraits were evaluable. The six safety skips are excluded from correction means, not counted as successful zero-correction cases.

The protocol remained frozen and A/B identities were concealed until finalization. The author remained the evaluator and supplied the finalized results recorded in [results.csv](results.csv). The locked [evaluation procedure](evaluation_protocol.md) has not changed. The CSV is a documentation transcription, not a new application export format.

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

Each setting contributes 0 if no further adjustment is needed or 1 if adjustment is required; each scored output has 0–2 units. Skipped CSV rows retain empty numeric fields and explicit reasons. Six skipped cases are not zero-correction wins. Means divide totals by four scored pairs, not ten portraits.

## What was compared

Fixed Preset used the first confirmed setup photo: Eye 34 / Face 57. The five confirmed Eye/Face pairs were 34/57, 43/53, 46/65, 47/68 and 43/65. Their geometry/preference relationship did not pass the existing validation checks. StyleMe therefore used the five-photo median fallback: Eye 43 / Face 65. No confirmations or adaptation checks were changed.

The measured comparison is a first-example fixed preset versus a multi-example remembered median, subject to the same per-image safety rules. It is not evidence that geometry-dependent Eye adaptation produced the reduction. Face Slimming has no separate learned strength predictor.

## Interpretation and limits

The >=30% target was exceeded only within the four scored paired cases. StyleMe reduced manual correction needs on portraits it could safely process, but coverage was limited. The observed coverage bottleneck was reliable face/eye geometry on smaller or less suitable portraits: four no-face skips, one unreliable/nearly-closed-eye skip and one eyes-too-small skip. This small experiment does not establish broad generalization.

The author evaluated their own preferences. Concealing A/B identities reduces obvious method cues but cannot eliminate evaluator bias or prevent source inspection. Software tests are separate from these supplied evaluation results.
