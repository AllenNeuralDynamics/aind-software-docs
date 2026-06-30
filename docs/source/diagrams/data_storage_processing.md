# Data Storage and Processing

## Code Ocean pipeline

Raw data lands in S3 as a single data asset that carries its `aind-data-schema`
metadata, with all of a session's modalities associated with one object.
Processing pipelines are modality-specific — each pipeline processes a single
modality. A pipeline outputs an NWB file along with `aind-data-schema` metadata,
including processing metrics and quality control artifacts and metrics. Once the
outputs have been QC'd, they can be combined into a final NWB file with its
associated metadata.

Each pipeline wraps modality- and platform-specific libraries that handle the
underlying data processing, quality control, and NWB packaging.

![Code Ocean pipeline diagram](mid_level/codeocean_pipeline_diagram.svg)



## Quality control

Each pipeline produces quality control artifacts and metrics alongside its
processed outputs, captured in the asset's `aind-data-schema` metadata. These are
surfaced through the [QC portal](https://github.com/AllenNeuralDynamics/aind-qc-portal),
a web application for viewing and annotating quality control metadata for AIND
data assets. The portal pulls QC metadata from the document database and displays
the corresponding reference figures from the Code Ocean data assets.

Reviewers use the portal to evaluate metrics marked `PENDING`, supporting AIND's
two-step quality control process: first assessing whether an asset's data is
suitable for analysis, then evaluating individual components (such as neurons)
within the asset for usability.

![QC diagram](mid_level/QC.drawio.svg)

