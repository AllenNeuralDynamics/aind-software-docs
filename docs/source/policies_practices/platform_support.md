# Platforms and pipelines

A ‘platform’ is an integrated ecosystem of standardized material preparation, data acquisition methods and robust data pipelines. Platforms are characterized by efficient, hardened hardware and software, standardized operational processes, mature data models, and quality control, including real-time dashboards. Platforms receive specific support from the data and software teams at AIND and are subject to specific requirements.

Pipelines are the automated per-modality processing performed after a platform uploads data. Pipelines have specific data and metadata requirements they must conform to. Pipelines are run and maintained as a part of platforms and can be run off-platform as well.

All platforms and pipelines must follow the [Data organization/Derived data conventions](data_organization.md#derived-data-conventions) for file organization conventions in raw and derived assets.

## Platform support

AIND data and software teams support performing quality assurance (prior to acquisition), tracking during acquisition and processing, and quality control after data assets are processed.

### Quality assurance

Prior to the completion of data acquisition there are often standard steps where scientists check either the subject, hardware, or specimen properties before moving on to the next step. We refer to these step as **quality assurance** to distinguish them from quality control (performed after acquisition).

More information about quality assurance will be added here after the transition to Power Platform / Dataverse, when we will start allowing quality assurance metrics to be captured and stored in the metadata prior to data acquisition.

### Asset tracking dashboards


[todo]

## Platform requirements

### Logging

Platforms should log all events to our Grafana Loki server. [instructions todo].

### Quality control

Platforms are required to generate and annotate (i.e. mark as passing or failing) quality control metrics that can be used to filter data assets. Only assets that pass the quality control metrics relevant to an analysis should be used. See the [quality control page](../explore_analyze/quality_control.md) for more details on metrics and the QC Portal.

## Pipeline development

This section describes requirements and conventions for developing processing pipelines in AIND.

### Pipeline metadata

Please see the [aind-metadata-manager](https://github.com/AllenNeuralDynamics/aind-metadata-manager/), many of the requirements described here are possible through the manager using simple functions.

#### data_description.json

All processing pipelines that create derived assets should upgrade the [data_description](https://aind-data-schema.readthedocs.io/en/latest/data_description.html) to a derived data description (changing the name and data_level).

##### How to upgrade a data_description

Use the [`DataDescription.from_data_description()`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/e172cb06a63b722eaeaaf8933d0a17cbedf3feea/src/aind_data_schema/core/data_description.py#L334) function to create derived data_description objects. Pass the process name as a parameter, often just `process_name="processed"`. If more source data assets were used than just the one being passed into the function then pass the optional `source_data` parameter as well with the names of those data assets.

```python
from pathlib import Path
from aind_data_schema.core.data_description import DataDescription

# Load the original data_description.json
original_data_description = DataDescription.model_validate_json(
    Path("data_description.json").read_text()
)

# Upgrade to the new derived data_description
derived_data_description = DataDescription.from_data_description(
    data_description=original_data_description,
    process_name="processed"
)

# Write the derived data_description to the results directory
derived_data_description.write_standard_file(output_directory="/results")
```

#### processing.json

Processing pipelines need to track each [DataProcess](https://aind-data-schema.readthedocs.io/en/latest/processing.html#dataprocess) that were run to create the derived data asset.

If processing was performed as part of a nextflow pipeline, that should be tracked in the `Processing.pipelines` field using a [Code](https://aind-data-schema.readthedocs.io/en/latest/components/identifiers.html#code) object pointing to the github repository with the nextflow configuration. Use the `DataProcess.pipeline_name` field to indicate that processes were run as part of a pipeline.

#### Other metadata

Core metadata `.json` files that are not modified should be copied to the derived asset unchanged. If it's present, do not copy the `metadata.nd.json` file -- this file is synchronized by the indexer and should not be moved manually.
