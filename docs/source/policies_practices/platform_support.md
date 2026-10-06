# Platforms

A ‘platform’ is an integrated ecosystem of standardized material preparation, data acquisition methods and robust data pipelines. Platforms are characterized by efficient, hardened hardware and software, standardized operational processes, mature data models, and quality control, including real-time dashboards. Platforms receive specific support from the data and software teams at AIND and are subject to specific requirements.

Pipelines are the automated per-modality processing performed after a platform uploads data. Pipelines have specific data and metadata requirements they must conform to.

All platforms and pipelines must follow the [Data organization conventions](data_organization.md) for file organization in raw and derived assets.

## Platform support

[Todo] This section will be filled out in more detail as platform operations are finalized across teams. Expect information on:

- Quality assurance
- Asset tracking dashboards

## Platform requirements

- Platform data assets should include valid aind-data-schema core files (minimum: data_description, subject, procedures, instrument, and acquisition).
- The `data_description.tags` field must include a unique string that *will not ever change* for each platform. We recommend using `platform:<platform-name>` to make it easy to find this string.

## Data flow pipeline

Platforms utilize the dataflow pipeline which is outlined in [this](diagrams/high_level/general_data_flow.drawio.svg) high-level diagram. This infrastructure prescribes tools and processes for users at each stage of the pipeline. For example, there are standard logging tools used throughout the whole pipeline to provide trivial queries that help understand how data are moving. There are services to facilitate data staging and upload at the end of every acquisition so that data are saved in the correct format with correct metadata, relieving the burden of users having to do this step manually. 

The majority of the shared infrastructure is hosted by SIPE and Scientific Computing; these teams can help platforms integrate into our shared infrastructure. If science projects are beginning to acquire data at a regular, scaled cadence, and/or projects are planning on developing more rigs for higher throughput data acquisition, we advise consulting these documents and teams to help users migrate into this infrastructure. Using these tools and services provides mechanisms for monitoring the success of data acquired, staged, uploaded, and processed throughout the dataflow pipeline.

### Logging

All stages of the dataflow pipeline need to utilize [`log-schema`](https://github.com/AllenNeuralDynamics/log-schema) to incorporate standard logging into applications. The logging schema provides `JSON` logs which can be queried to build telemetry portals in web servers such as Grafana.

Platforms instrument acquisition applications should log all events to the Loki Server maintained by SIPE. This is the same server [`aind-watchdog-service`](https://github.com/AllenNeuralDynamics/aind-watchdog-service) logs its logs to using the `log-schema` format.

All other services and processing libraries should be configured to log to `cloudwatch`. 

### Quality control

Platforms are required to generate and annotate (i.e. mark as passing or failing) quality control metrics that can be used to filter data assets. Only assets that pass the quality control metrics relevant to an analysis should be used. See the [quality control page](../explore_analyze/quality_control.md) for more details on metrics and the QC Portal.


## Processing pipeline development

Pipelines are a standardized series of processing steps that take raw data from a single modality and typically produce an NWB file as output. Pipelines are organized in a Nextflow pipeline with individual Code Ocean capsules performing internal steps. Platforms should use established pipelines for processing.

- Accept raw data from a single modality, organized according to [aind-file-standards](https://github.com/AllenNeuralDynamics/aind-file-standards) when applicable.
- Produce an NWB file as output
- Assess data quality and produce QC metrics and references

### Processing pipeline metadata

Please see the [aind-metadata-manager](https://github.com/AllenNeuralDynamics/aind-metadata-manager/), many of the requirements described here are possible through the manager using simple functions.

#### data_description.json

All processing pipelines that create derived assets should upgrade the [data_description](https://aind-data-schema.readthedocs.io/en/latest/data_description.html) to a derived data description (changing the name and data_level).

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

Processing pipelines need to track each [DataProcess](https://aind-data-schema.readthedocs.io/en/latest/processing.html#dataprocess) that was run to create the derived data asset.

If processing was performed as part of a nextflow pipeline, that should be tracked in the `Processing.pipelines` field using a [Code](https://aind-data-schema.readthedocs.io/en/latest/components/identifiers.html#code) object pointing to the github repository with the nextflow configuration. Use the `DataProcess.pipeline_name` field to indicate that processes were run as part of a pipeline.

#### Other metadata

Core metadata `.json` files that are not modified should be copied to the derived asset unchanged. If it's present, do not copy the `metadata.nd.json` file -- this file is synchronized by the indexer and should not be moved manually.
