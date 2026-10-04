# Dataset

The author’s final dataset plan contains 15 portraits from Quý Nguyễn’s graduation portrait series on Pexels: five development images and ten held-out evaluation images. This replaces earlier proposed sources.

- Photographer: Quý Nguyễn
- Platform: Pexels
- Profile: https://www.pexels.com/@chupanhchandung/
- Representative source supplied by the author: https://www.pexels.com/photo/33431820/

The manifest records the agreed filenames and split. Individual image URLs were not supplied and are not invented. Retain source/license records with the separately submitted source files; this repository does not assert unverified license terms. The actual 15 files are not bundled or published here and were not inspected during this implementation pass.

Use `dev_01.jpg`–`dev_05.jpg` for implementation checks and the five confirmed teaching examples. Reserve `eval_01.jpg`–`eval_10.jpg` for final scoring only. Do not tune rules, criteria or remembered preferences using held-out outputs. Source images may be submitted separately for academic review. Campaign artwork and the built-in Studio sample are not this dataset.

The author reports that one initial small/angled full-body development candidate returned “No face detected.” It was rejected and replaced with the previously excluded clear portrait before final profile freeze. The final setup set still contains five usable images; the ten held-out images were unchanged. Detection was not weakened to force a result. This records the author’s development QA, not an independently repeated dataset test.
