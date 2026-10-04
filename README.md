# StyleMe: A Personal Retouch Memory for Portrait Editing

StyleMe is a browser-based portrait editing prototype that remembers retouch settings a user has already confirmed and reuses them on another portrait.

The project focuses on a simple problem: people often repeat similar edits across portrait photos, but a generic preset applies the same values to every image and starting from zero each time is repetitive. StyleMe keeps the user in control. The user chooses the preferred edit, confirms it, and the system stores those settings as a personal Retouch Memory.

The current prototype supports two retouch settings:

- Eye Enlargement
- Face Slimming

MediaPipe Face Landmarker is used to detect facial landmarks. The actual edits are produced with local browser-based image-processing rules rather than a generative image model.

**Public application:**  
https://styleme-portrait-memory.melodyli10-6666.chatgpt.site/

**Product documentation:**  
[PRODUCT_DOCUMENTATION.md](PRODUCT_DOCUMENTATION.md)

**Evaluation protocol:**  
[evals/evaluation_protocol.md](evals/evaluation_protocol.md)

---

## What StyleMe does

The main workflow is:

**Upload portrait → Edit → Confirm → Build Retouch Memory → Apply to another portrait → Compare → Export**

A user first adjusts Eye Enlargement and Face Slimming until the portrait looks right to them. After five confirmed development examples, StyleMe builds a personal profile from those settings.

For the final development profile, the five confirmed Eye/Face settings were:

- 34 / 57
- 43 / 53
- 46 / 65
- 47 / 68
- 43 / 65

The profile median was:

- Eye Enlargement: **43**
- Face Slimming: **65**

The five examples did not show a consistent relationship between detected face geometry and preferred edit strength. StyleMe therefore used the median saved preference instead of forcing a geometry-based adaptation rule.

If the face or eye geometry is not reliable enough, the system skips the edit rather than guessing.

Other implemented functions include:

- before/after comparison
- exact reset to the original image
- original-resolution PNG export
- local Retouch Memory
- English, Simplified Chinese and Korean interface
- browser-based evaluation workflow

---

## Technical approach

StyleMe uses a narrow computer-vision approach.

MediaPipe Face Landmarker provides facial landmarks from the current portrait. StyleMe then uses its own local logic to:

1. read the detected face geometry
2. load the confirmed retouch preference
3. check whether the image is safe to edit
4. apply Eye Enlargement and Face Slimming
5. show the result for user review
6. export the final image if accepted

The editing path does not use a generative image model, RAG or an AI agent.

These approaches were not needed for this problem. The task only requires small, repeatable portrait adjustments. A generative model would add cost, latency and less predictable output. RAG would not help because there is no knowledge-retrieval problem, while an agent would add extra orchestration without improving the core edit.

MediaPipe runs locally in the browser, so there is no paid AI model call for each edited photo.

---

## Run locally

### Requirements

- Node.js 22.12 or later
- npm

### Install and run

```bash
npm ci
npm run dev
```

Open the local URL shown by Vite.

### Run tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Check the public build

```bash
node scripts/check-public-build.mjs
```

The final project build passed **101 tests**, and the production build and privacy/asset checks passed.

---

## Repository structure

```text
StyleMe-Portrait-Memory/
├── README.md
├── PRODUCT_DOCUMENTATION.md
├── data/
├── evals/
├── evaluation/
├── public/
├── scripts/
├── src/
├── tests/
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

### Main folders

**`src/`**  
Main application source code, including face detection, retouch processing, saved preferences, comparison, reset and export.

**`evaluation/`**  
Code for the browser-based Evaluation Lab. It creates anonymous A/B outputs, records correction scores, keeps skipped cases separate and reveals method identity only after scoring is complete.

**`evals/`**  
Evaluation documentation and final results.

It contains:

- `EVAL_README.md` — explanation of the final evaluation
- `evaluation_protocol.md` — scoring procedure defined before held-out scoring
- `results.csv` — finalized case-level results

**`data/`**  
Dataset documentation.

It contains:

- `DATA_README.md` — dataset source, split and usage
- `manifest.csv` — filenames and development/held-out split

**`tests/`**  
Tests for the main application logic and workflow.

**`public/`**  
Static assets used by the web application.

**`scripts/`**  
Build and public-asset checks.

For more detail on the product architecture and code logic, see [PRODUCT_DOCUMENTATION.md](PRODUCT_DOCUMENTATION.md).

---

## Data

The final dataset contains **15 portraits** from a graduation portrait series by photographer Quý Nguyễn on Pexels.

- **5 development portraits**
- **10 held-out evaluation portraits**

The five development images were used to establish the confirmed Retouch Memory.

The ten held-out images were kept separate until the rules, profile, acceptance criteria and evaluation procedure were frozen.

The public repository does not publish the portrait files themselves. The filenames, split and source information are recorded in the `data/` folder. The source images can be submitted separately with the course materials for academic review.

More details are available in:

[Data documentation](data/DATA_README.md)

---

## Evaluation

The main outcome metric was:

**manual corrections still needed after the automatic edit**

One correction unit means that one supported setting still needs manual adjustment after seeing the automatic result.

Each output was scored separately for:

- Eye Enlargement: 0 or 1 correction
- Face Slimming: 0 or 1 correction

Each output therefore received **0–2 correction units**.

The target defined before final evaluation was:

**at least 30% fewer average correction units than Fixed Preset**

### Fixed Preset

The Fixed Preset used the first confirmed development example:

- Eye Enlargement: **34**
- Face Slimming: **57**

These values were reused unchanged across the held-out portraits.

### StyleMe

StyleMe used the five-example Retouch Memory:

- Eye Enlargement median: **43**
- Face Slimming median: **65**

The development examples did not support a consistent geometry/preference relationship, so StyleMe used the median preference rather than forcing a geometry-dependent adaptation rule.

### Blind scoring

The Evaluation Lab presented Fixed Preset and StyleMe as anonymous **Output A** and **Output B**.

Their identities were hidden during scoring and revealed only after all scores were finalized.

Skipped cases were recorded separately and were never counted as successful zero-correction results.

---

## Final evaluation results

Ten held-out portraits were evaluated.

- **4/10** portraits produced valid paired outputs for scoring
- **6/10** portraits were safely skipped
- **0** processing failures

Across the four scored paired cases:

| Method | Total corrections | Mean corrections per scored image |
| --- | ---: | ---: |
| Fixed Preset | 7 | 1.75 |
| StyleMe | 3 | 0.75 |

The relative reduction was:

```text
(7 - 3) / 7 × 100 = 57.1%
```

StyleMe therefore exceeded the original **30% reduction target within the four evaluable paired cases**.

This does not mean that StyleMe reduced corrections by 57.1% across all ten portraits.

Six held-out portraits were skipped:

- 4 because a reliable single face was not detected
- 1 because the eye geometry was unreliable or the eyes were nearly closed
- 1 because the eyes were too small to adjust safely

The six skipped cases were excluded from the correction averages and were not counted as zero-correction successes.

Case-level results are available in:

[evals/results.csv](evals/results.csv)

---

## Interpretation

The evaluation suggests that the remembered preference reduced repeated manual corrections compared with one fixed preset on portraits the system could safely process.

However, the current prototype has limited coverage.

Only four of ten held-out portraits could be fairly scored. The main limitation was reliable face and eye geometry, especially when the subject was smaller in the image or the eyes were not suitable for editing.

The dataset is also small and comes from one person and one graduation-photo series. The result therefore does not show broad generalization to different people, poses, lighting conditions or camera distances.

The 57.1% reduction should also not be attributed to geometry-based adaptation. The development data did not support that rule, so StyleMe used the five-photo median preference.

The final result is therefore best interpreted as:

> On the four held-out portraits that could be safely processed, a remembered preference built from multiple confirmed examples required fewer manual corrections than one fixed preset.

---

## Privacy and limitations

Portrait processing is performed locally in the browser.

The editing workflow does not upload the selected portrait to an image-generation API. Confirmed numeric preferences and small geometry summaries are stored locally in the browser.

Raw portrait pixels and facial landmarks are not stored as part of the Retouch Memory.

Current limitations include:

- reliable face detection is required
- small faces may not be processed
- closed or unclear eyes may cause a safe skip
- pose, hair and nearby background can affect local deformation
- the current evaluation set is small
- the author is also the evaluator, so some subjective bias remains

The blind A/B evaluation reduces obvious method bias but does not remove evaluator subjectivity completely.

---

## Product documentation

Detailed product documentation is available here:

[PRODUCT_DOCUMENTATION.md](PRODUCT_DOCUMENTATION.md)

It includes:

- Persona
- Input
- Output
- Product architecture
- Main code logic
- External intelligence used
- Target metric
- Final metric reached
- Practical limitations

Detailed dataset and evaluation documentation are available in:

- [data/DATA_README.md](data/DATA_README.md)
- [evals/EVAL_README.md](evals/EVAL_README.md)
- [evals/evaluation_protocol.md](evals/evaluation_protocol.md)
- [evals/results.csv](evals/results.csv)
