# Dataset

The final StyleMe dataset contains **15 portraits** from one graduation portrait series by photographer Quý Nguyễn on Pexels.

- Photographer: Quý Nguyễn
- Platform: Pexels
- Photographer profile: https://www.pexels.com/@chupanhchandung/
- Representative source page: https://www.pexels.com/photo/33431820/

## Split

- `dev_01.jpg`–`dev_05.jpg`: 5 development portraits
- `eval_01.jpg`–`eval_10.jpg`: 10 held-out evaluation portraits

The five development portraits were used for implementation checks and the five confirmed teaching examples.

The ten held-out portraits were kept separate until the profile, evaluation criteria and skip policy were frozen. They were not used to tune the remembered settings or retouch rules.

One initial development candidate had a small, angled face and returned “No face detected.” I replaced it with a clearer portrait before the five-example profile was frozen. The ten held-out portraits were unchanged.

## Repository and submission

The public repository records the dataset source, filenames and split in this README and [manifest.csv](manifest.csv). The 15 source portraits are not published in the public repository.

For private academic review, the source portraits are packaged separately as:

`PE6201_StyleMe_Dataset_Li_Jiakun_G2606934H.zip`

The built-in Studio sample and website artwork are not part of the 15-image evaluation dataset.
