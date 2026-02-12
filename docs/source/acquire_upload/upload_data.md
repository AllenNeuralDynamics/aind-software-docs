# Upload data

Uploading data is done by using the [aind-data-transfer-service](http://aind-data-transfer-service/) ([docs](https://aind-data-transfer-service.readthedocs.io/en/latest/index.html)) which handles running containerized tasks for data copying, compression, metadata gathering, and final upload to S3 and Code Ocean.

## Job types and upload scripts

In general, most users should interact with the transfer service by requesting data upload via [watchdog](https://github.com/AllenNeuralDynamics/aind-watchdog-service) (contact SIPE for setup) or through the aind-data-transfer-service using the REST API and upload scripts. Users control what tasks are run on their data through job types and that parameters that they include in their upload scripts.

For example, this [upload script](https://github.com/AllenNeuralDynamics/aind-data-transfer-service/blob/d1f84020862c3de340020b6cb45bef0fd5105515/docs/examples/aind_data_schema_v2.py) demonstrates how to setup the upload parameters for a standard ecephys data asset using the `"default"` job_type. You can view [all available job_type options](https://aind-data-transfer-service.corp.alleninstitute.org/job_params). Please reach out to the Data & Infrastructure team in Scientific Computing to develop custom job types for your data assets.

(GatherMetadataJob)=
## GatherMetadataJob

The [GatherMetadataJob](https://github.com/AllenNeuralDynamics/aind-metadata-mapper/tree/release-v1.0.0#usage) is the primary tool used to assemble and validate metadata during upload of data assets. The job handles construction of the `data_description`, `subject`, and `procedures` as well as merging and validating `instrument` and `acquisition` metadata. It also runs a full validation step on all available metadata files to ensure cross-compatibility.

The main settings you should be concerned with are:

- `instrument_settings.instrument_id`: this field triggers the job to pull an `instrument.json` file from the metadata-service (where you previously uploaded it).
- `data_description_settings.tags/group/restrictions/data_summary`: each of these fields is meta-metadata about your project and should be accurately filled out, if possible. Please see the [DataDescription](https://aind-data-schema.readthedocs.io/en/latest/data_description.html#datadescription) documentation for details about each field.

The settings for the GatherMetadataJob are typically set [inside of your upload script](https://github.com/AllenNeuralDynamics/aind-data-transfer-service/blob/d1f84020862c3de340020b6cb45bef0fd5105515/docs/examples/aind_data_schema_v2.py#L45-L50) or as part of the `job_type`.

(metadata-merging-rules)=
### Merge rules

### When can multiple files be merged?

When data is acquired simultaneously using two or more distinct instruments (e.g., a behavior instrument and a physiology instrument), multiple `instrument.json` and/or `acquisition.json` metadata files can be provided. The GatherMetadataJob will merge these files during upload via the `aind-data-transfer-service`.

#### File Naming Convention

Each file must follow the naming pattern `<metadata_type>*.json` where `*` is any string. We recommend using modalities to organize the individual files:
- `instrument_behavior.json` and `instrument_ecephys.json`
- `acquisition_behavior.json` and `acquisition_ecephys.json`

#### Contraints

1. **Unique fields must match**: Certain identifier fields that should be unique across the dataset (like `subject_id`) **must have identical values** in all files being merged. If these fields conflict, the merge will fail and your upload job will be rejected. An important exception is the `instrument_id` field. If two or more instrument JSON files are joined, the merged instrument JSON file will have an `instrument_id` that is the string combination of the IDs of the unique instruments, 

2. **No shared devices, with the exception of a single shared clock**: In general, two instruments can be merged **if and only if there are no shared devices** between them. Devices are identified by their `name` field. If the same device name appears in both instrument files, they should really be defined as a single instrument, not two separate ones.

   **Exception for clock synchronization**: When synchronizing data acquisition across multiple instruments (e.g., recording behavior and physiology simultaneously), a shared clock device is permitted. For AIND instruments this must be a [HarpDevice](https://aind-data-schema.readthedocs.io/en/latest/components/devices.html#harpdevice) configured as a clock generator (`HarpDevice.is_clock_generator=True`).

3. **Enable validation**: It is **strongly recommended** to turn on the `raise_if_invalid` setting in the `GatherMetadataJob` job settings. This validates that the merge will succeed *before* upload, making it much easier to identify and fix problems compared to dealing with a raw data asset with broken metadata.

4. **Python merging**: You can test merging locally in Python using the `+` operator:

```python
from aind_data_schema.core.instrument import Instrument
from aind_data_schema.core.acquisition import Acquisition

# Merge instruments
instrument1 = Instrument.model_validate_json(json_string_1)
instrument2 = Instrument.model_validate_json(json_string_2)
merged_instrument = instrument1 + instrument2

# Merge acquisitions  
acquisition1 = Acquisition.model_validate_json(json_string_1)
acquisition2 = Acquisition.model_validate_json(json_string_2)
merged_acquisition = acquisition1 + acquisition2
```

#### Implementation details

The exact merge logic for each metadata type is defined in the `__add__` methods in the [aind-data-schema repository](https://github.com/AllenNeuralDynamics/aind-data-schema). See the following files:
- `src/aind_data_schema/core/instrument.py`
- `src/aind_data_schema/core/acquisition.py`
- `tests/test_composability_merge.py` (for test examples)
