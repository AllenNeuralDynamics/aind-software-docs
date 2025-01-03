# Processing

[Documentation for `processing.json`](https://aind-data-schema.readthedocs.io/en/latest/processing.html)

The data transfer service creates a `processing.json` file describing the data compression or other preprocessing steps that were applied to the data prior to upload.

If additional processing steps are applied to the original data asset, the user should append the new processing steps to the `processing.json` file. This needs to be done using python code that imports [`aind-data-schema`](https://github.com/allenNeuralDynamics/aind-data-schema).
