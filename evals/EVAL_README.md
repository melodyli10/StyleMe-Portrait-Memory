# Evaluation

**Pending final held-out evaluation.** `results.csv` is an empty 20-row template, not measured evidence or an application CSV export.

Fixed Preset freezes the first confirmed setup photo’s valid strengths and reuses them unchanged on every held-out portrait. StyleMe Smart Style uses the same retouch engine and can adapt eye strength when the teaching evidence supports it. StyleMe uses the five-photo median for Face Slimming; Fixed Preset uses the first example’s face strength. Both retain the existing current-face safety rules. Do not claim a separate learned face predictor.

Five development examples establish the profile. The same ten held-out images are processed by both methods. Score each supported setting—Eye Enlargement and Face Slimming—as 0 (no adjustment) or 1 (adjustment required). An output has 0–2 correction units. Intermediate slider movements are not additional units.

Follow [the locked procedure](evaluation_protocol.md). The Lab records anonymous A/B scores, final accepted values, artifacts and separate skip/failure outcomes, then exports finalized JSON. Transfer actual finalized case-level results to the CSV template only after method identities are revealed. Preserve missing/skipped scores as empty, with a reason; do not fill them with zero.

Use totals and means over the same successful paired cases. Report the paired count out of ten. Reduction = `(FixedPresetCorrections - StyleMeCorrections) / FixedPresetCorrections × 100%`; it is undefined if the baseline is zero. The proposal target is >=30%, not an achieved result. All-skipped runs cannot demonstrate improvement.

The author is also the evaluator. Client-side blinding reduces obvious method cues but cannot eliminate bias or prevent inspection. The 15-image series is limited evidence. Actual development-set Face Slimming checks and final held-out scoring remain the author’s pending validation work.

For the author’s completed setup, Fixed Preset is Eye 34 / Face 57; StyleMe is median Eye 43 / Face 65. The reported geometry/preference relationship did not pass validation, so StyleMe honestly uses the median fallback. Start a new version-3 Lab session to lock this baseline; legacy sessions retain their original definition. Held-out scores remain pending.
