# Product documentation

## Persona, input and output

The user regularly edits portraits and repeats similar personal choices. Inputs are a portrait, explicitly confirmed retouch settings and landmarks detected from the current image. Output is a locally edited portrait, reviewed/corrected by the user and exported as PNG. Current slider movements are temporary until an explicit save/confirmation.

## Architecture

```mermaid
flowchart TD
    A[Portrait input] --> B[MediaPipe Face Landmarker]
    B --> C[Current eye and face geometry]
    D[Confirmed local preference memory] --> E[Fixed Preset or Smart Style resolver]
    C --> E
    E --> F[Controlled local pixel warps]
    A --> F
    F --> G[Review / compare / manual correction]
    G --> H[Original-resolution PNG]
    G -->|Explicit confirmation only| D
```

MediaPipe is reused, not trained by this project. It supplies landmarks, not beauty decisions or generated pixels. StyleMe implements the confirmed-memory, adaptation and local warp logic. There is no RAG, agent workflow or generative image model in the editing path.

## Implementation map

`main.js` handles upload, detection and editor state. `eyeWarp.js` / `faceWarp.js` derive usable geometry from the detected landmarks. `eyeWarp.js` / `faceWarp.js` implement bounded inverse mapping with bilinear sampling. `imagePipeline.js` renders from the pristine source; zero strengths restore original pixels rather than undoing prior edits. `displayRectangle.js` computes a single contained display rectangle; `product.js` uses it for the aligned canvases and divider. This changes display size, not processing/export resolution. `exportImage.js` excludes UI and landmarks from PNG output.

`styleProfile.js` saves up to five distinct confirmations, numeric strengths, compact geometry ratios and photo digests. `preferences.js` supports explicit saved settings. Neither stores portraits. `rememberedStyle.js` resolves Fixed Preset or Smart Style: Fixed Preset uses the first confirmed setup photo’s valid strengths unchanged across held-out portraits. Smart Style can adjust eye strength using a robust relationship with eye geometry only when five examples pass range, consistency and leave-one-out checks; otherwise it falls back to the median. It limits adaptation to the supported range. StyleMe Face Slimming uses the five-photo median; Fixed Preset uses the first setup example’s face strength. Both use the existing per-image geometry/safety rules. There is no separate learned face-strength predictor.

`guideSnippet.js` is a simulation with decoded, cached local portrait assets and illustrative values. Its draggable comparison tint illustrates the control; it is not an additional retouch engine and never saves preferences.

## Evaluation and targeted metric

Use five development images and ten held-out images. Freeze rules, profile, acceptance criteria and skip policy before scoring. For each anonymous output, Eye Enlargement and Face Slimming each receive one unit if further adjustment is needed, otherwise zero. Total: 0–2. Target: at least 30% reduction in average correction units versus Fixed Preset on the same evaluable cases. If baseline corrections are zero, percentage reduction is undefined. Report successful case counts out of ten and explicit skips/failures alongside paired aggregates.

The local Evaluation Lab freezes the five-example profile and ten-file digests, randomizes A/B assignment, hides identities until finalization, locks confirmed scores and exports JSON. Version-1 sessions remain eye-only; version-2 sessions use both dimensions with the legacy median baseline; new version-3 sessions freeze the first-example baseline. Existing sessions are not migrated. Local client-side concealment cannot stop source inspection. The author is the evaluator, so bias remains possible.

## Metrics reached

Pending final held-out evaluation.

Later record Fixed Preset total corrections, StyleMe total corrections, average per successful paired image, percentage reduction and skip/failure observations. The empty template is not a result. The actual 15 development/evaluation portraits were not available during this implementation pass, so no development-set Face Slimming validation is claimed.

## Practical limits

Single-person portraits and reliable landmarks are required. Pose, occlusion, hair and background near the face can limit natural contour deformation. Geometry safeguards reduce or skip unsafe edits; they do not guarantee artifact-free output. File hashes cannot reliably identify crops or re-encoded duplicates. Five examples and ten held-out photos are a small course experiment, not broad evidence of generalization. Browser storage is origin-specific and can be cleared by the browser/user. Fonts and model assets require network downloads; image processing itself is local with no per-photo AI API fee.

## Confirmed development outcome

The author’s five Eye/Face settings are 34/57, 43/53, 46/65, 47/68 and 43/65. The reported geometry/preference relationship failed the existing validation checks. This valid negative adaptation result is preserved: Fixed Preset uses 34/57, while StyleMe uses median 43/65 unless existing safety rules reduce/skip the effect. These development settings are not held-out evaluation results.
