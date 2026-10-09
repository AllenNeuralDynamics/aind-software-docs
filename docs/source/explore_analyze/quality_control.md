# Quality control

All data assets generated at AIND should undergo automated (and sometimes manual) quality control before being used in analysis. To make this as efficient as possible we provide a standardized metadata schema for tracking quality control metrics as well as a convenient portal for reviewing QC metadata.

## Preparing QC metadata

Please see the documentation on [QualityControl](https://biodata-schema.readthedocs.io/en/latest/quality_control.html) for a comprehensive overview of QC.

The QC Portal relies on valid metadata, particularly the fields in `data_description.json`. Validate metadata before uploading an asset; invalid or missing fields can cause the portal to display it incorrectly.

### Generating QC metadata in Code Ocean capsules

When a pipeline generates a data asset, write `quality_control.json` to the top level of the `results/` folder alongside the other metadata files. Place reference figures in a subfolder.

1. Generate QC metrics and reference figures in the pipeline, and add the metrics to `QCEvaluation` objects. Put reference files in `results/`.
2. Set each `QCMetric.reference` to a path relative to `results/`. For example, `results/figures/my_figure.png` should be referenced as `figures/my_figure.png`.
3. If the input asset already has a `quality_control.json` file, load it with `QualityControl(**json.loads(your_file))` and append the new evaluations to `qc.evaluations`. Otherwise, create a new object with `QualityControl(evaluations)`.
4. Write the standard file to `results/` with `qc.write_standard_file()`.

See the instructions for [creating derived assets](https://docs.allenneuraldynamics.org/en/latest/data_analysis.html#creating-derived-assets). With this workflow, no additional permissions are required. QC metadata appears in the portal after the indexer has picked up the asset.

## Viewing QC in the Data Portal

![QC diagram](../diagrams/mid_level/QC.drawio.svg)

The data portal includes a QC page for every asset for exploring quality control metadata and reviewing metrics marked `PENDING`. Logged-in users can modify metric values, status, and notes. After a change, the **review** button is enabled. Reviewing and submitting saves the updates to DocDB with the reviewer's name and a timestamp.

### Preparing metrics for portal review

Metrics should have actionable `value` fields. A value can be numeric and evaluated against a rule, or describe a qualitative assessment supported by its reference. Common values include numbers, strings, booleans, and lists of numbers or strings. Almost all metrics should include a reference image, figure, or video. References can put numeric values in context and may be shared across metrics. The portal is a public-facing resource, so references should be suitable for its viewers.

The portal displays common value types as follows:

| Value | Display | Notes |
|-------|---------|-------|
| Number | Editable number field | |
| String | Editable text field | |
| Boolean | Checkbox | |
| Dictionary | Table | Values must have equal lengths. An `index` key (case-insensitive) supplies row labels. |
| `DropdownMetric` | Dropdown | Defined by [aind-qcportal-schema](https://github.com/AllenNeuralDynamics/aind-qcportal-schema). |
| `CheckboxMetric` | Checkboxes | Defined by [aind-qcportal-schema](https://github.com/AllenNeuralDynamics/aind-qcportal-schema). |
| `CurationMetric` | Custom view | See the curation guidance below. |

To organize your metrics, you should use the `QualityControl.default_grouping` and `QCMetric.tags`. Prefer tags that group more than one metric so each level adds useful organization. See the [QualityControl documentation](https://biodata-schema.readthedocs.io/en/latest/quality_control.html) for the metadata grouping model.

Use `CurationMetric` for repeated elements within a modality, such as neurons, ROIs, or channels. Its `value` should map each element's identifier to its properties. A reference for each element can help reviewers inspect it, and in most situations the `CurationMetric` should be set to pass. Custom curation displays may require a portal-specific view.

The `description` field is parsed as Markdown. Format links as `[text](url)` and use [MathJax](https://docs.mathjax.org/en/latest/) for equations.

### References

Supported references include vector files (SVG or PDF), images (PNG or JPG), interactive figures such as Altair plots, videos (MP4), embedded Neuroglancer, FigURL, or SortingView views, and Rerun files. Rerun filenames must include a version, for example `filename_vX.Y.Z.rrd`. Links to interactive views should use the exact URL that opens the intended view.

When possible, store reference files in the same data asset as `quality_control.json`. Use these options in order of preference:

1. A path relative to `quality_control.json`, such as `figures/my_figure.png`. Do not include a mount, asset name, or `s3://` prefix.
2. A Kachery Cloud hash, such as `sha1://uuid.png`. Include the file extension; the `label` field can be used to set the filename.
3. A URL to a publicly accessible file.
4. A path to a public S3 bucket.

Separate two reference strings with a semicolon (`;`) to display them in a swipe view, which is useful for overlay images. Reusing the same reference across metrics groups them together in a single metric group.
