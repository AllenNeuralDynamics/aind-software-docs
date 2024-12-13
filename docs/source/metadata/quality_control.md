# Quality Control

Generating the `quality_control.json` file allows you to take advantage of the [QC Portal](https://qc.allenneuraldynamics.org/qc_portal_app), a SCICOMP maintained tool for querying and annotating data quality during processing and analysis.

The `quality_control.json` file should be generated or appended to at three times in a data asset's life: (1: Raw) immediately after data acquisition, (2: Processing) during processing when quality control metrics are computed, and (3: Analysis) during data analysis if further quality control is needed, for example for multi-asset quality metrics.

Detailed documentation for the QC metadata is found in the [aind-data-schema QC docs](https://aind-data-schema.readthedocs.io/en/latest/quality_control.html), while a walkthrough for AIND users can be found in the [QC portal docs](https://github.com/AllenNeuralDynamics/aind-qc-portal?tab=readme-ov-file#qc-portal)
