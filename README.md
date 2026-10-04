# StyleMe: A Personal Retouch Memory for Portrait Editing

StyleMe is a browser prototype for people who repeat similar personal edits across portraits. It stores confirmed retouch settings and reapplies them using the next portrait’s detected face geometry. The user chooses the preferred look.

[Public application](https://styleme-portrait-memory.melodyli10-6666.chatgpt.site/) · [Product documentation](PRODUCT_DOCUMENTATION.md) · [Evaluation procedure](evals/evaluation_protocol.md)

## Implemented scope

Eye Enlargement, Face Slimming, five-photo confirmed Retouch Memory, Fixed Preset and Smart Style, aligned before/after comparison, exact reset and original-resolution PNG export. MediaPipe provides landmarks; local pixel-processing rules produce the edit. Smart Style can adapt eye strength when the confirmed examples support it; face strength uses the confirmed median and is fitted to the current geometry. No generative editing model is used.

## Run locally

Use Node.js 22.12+ and npm. From the repository:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The Evaluation link opens `/evaluation/`.

```sh
npm test
npm run build
node scripts/check-public-build.mjs
npm run preview
```

The stack is vanilla JavaScript, HTML/CSS, Vite, MediaPipe Tasks Vision, Canvas 2D, localStorage, Node’s test runner and fontsource fonts. Selected locale fonts and the landmark runtime/model also use external downloads.

## Repository map

- `src/main.js`: editor state, detection, confirmation and reset.
- `src/displayRectangle.js`, `src/product.js`, `src/preview.js`: contained display sizing and comparison.
- `src/eyeWarp.js`, `src/faceWarp.js`, `src/imagePipeline.js`: local retouch processing.
- `src/styleProfile.js`, `src/rememberedStyle.js`, `src/preferences.js`: confirmed memory and application.
- `src/exportImage.js`: PNG export; `src/guideSnippet.js`: explicitly simulated walkthrough.
- `evaluation/`: locked, anonymous scoring workflow and JSON export.
- `tests/`: algorithm, state and workflow regression tests; browser test pages are development-only.
- `data/`, `evals/`: dataset documentation and empty results template, not source portraits.

## Evaluation

Five development photos establish the confirmed profile; ten different held-out photos compare Fixed Preset with StyleMe. Fixed Preset freezes the first confirmed setup photo’s strengths; StyleMe uses the five-photo median, with eye adaptation only when the existing evidence checks pass. One correction unit is one supported setting still requiring adjustment. Eye Enlargement and Face Slimming each score 0 or 1, giving 0–2 per output. The proposal target is at least 30% fewer average corrections than Fixed Preset. **Pending final held-out evaluation.** Skips/failures remain separate, never zero-correction successes. Existing eye-only sessions retain their original scoring contract; start a new version-3 session for the corrected first-example baseline. Older sessions retain their original baseline.

## Privacy and limits

Selected photos and landmarks are processed in the browser and are not uploaded by the editing flow. Confirmed numeric settings, compact geometry summaries and duplicate-check digests are stored locally; raw portraits and landmarks are not persisted. Evaluation records remain in localStorage until explicitly exported. Browser storage is not encrypted or a secure multi-user vault. Hosting, font and model requests still involve network access. The built-in sample cannot teach the profile or enter evaluation.

The small evaluation set cannot establish broad generalization. Hair, occlusion and pose can limit contour edits; unsafe geometry may reduce or skip effects. No measured improvement or development-set validation is claimed here. Processing uses the user’s CPU/GPU and memory; no paid image-generation API is called. Downloads, hosting and device computation still have costs.

## Development note

This prototype is prepared for the PE6201 End-of-Course Project.

Codex was used as a coding assistant to implement and debug parts of the browser prototype. The project framing, product scope, retouch-memory logic, evaluation design, final validation and interpretation of results were defined and verified by the author.

Final held-out scoring remains pending; automated checks are not research results.

Development result reported by the author: confirmed Eye/Face pairs are 34/57, 43/53, 46/65, 47/68 and 43/65. The geometry/preference relationship did not pass validation. Fixed Preset is therefore 34/57 and StyleMe falls back to median 43/65, subject to existing per-image safety rules. No adaptation checks or confirmations were changed, and no held-out improvement is claimed.
