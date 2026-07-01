# Quality control

All data assets generated at AIND should undergo automated (and sometimes manual) quality control before being used in analysis. To make this as efficient as possible we provide a standardized metadata schema for tracking quality control metrics as well as a convenient portal for reviewing QC metadata.

## Preparing QC metadata

Please see the documentation on [QualityControl](https://aind-data-schema.readthedocs.io/en/latest/quality_control.html) for a comprehensive overview of QC.

## QC Portal

```{raw} html
<link rel="stylesheet" href="../_static/diagrams-app/diagrams.css">
<div class="rf-diagram" data-diagram="mid_level/QC" style="height: 480px; border: 1px solid var(--color-background-border, #ccc); border-radius: 6px;"></div>
<script type="module" src="../_static/diagrams-app/diagrams.js"></script>
```

The QC Portal is a web app that allows users to explore the quality control metadata for data assets and, in edit mode, modify the value and state of metrics to annotate assets as passing or failing QC.

Please see the [QC Portal](https://github.com/AllenNeuralDynamics/aind-qc-portal?tab=readme-ov-file) documentation for more information.
