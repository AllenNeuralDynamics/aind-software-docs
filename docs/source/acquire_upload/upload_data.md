# Upload data

Uploading data is done by using the [aind-data-transfer-service](http://aind-data-transfer-service/) ([docs](https://aind-data-transfer-service.readthedocs.io/en/latest/index.html)) which handles running containerized tasks for data copying, compression, metadata gathering, and final upload to S3 and Code Ocean.

## Job types and upload scripts

In general, most users should interact with the transfer service by requesting data upload via [watchdog](https://github.com/AllenNeuralDynamics/aind-watchdog-service) (contact SIPE for setup) or through the aind-data-transfer-service using the REST API and upload scripts. Users control what tasks are run on their data through job types and that parameters that they include in their upload scripts.

For example, this [upload script](https://github.com/AllenNeuralDynamics/aind-data-transfer-service/blob/d1f84020862c3de340020b6cb45bef0fd5105515/docs/examples/aind_data_schema_v2.py) demonstrates how to setup the upload parameters for a standard ecephys data asset using the `"default"` job_type. You can view [all available job_type options](https://aind-data-transfer-service.corp.alleninstitute.org/job_params). Please reach out to the Data & Infrastructure team in Scientific Computing to develop custom job types for your data assets.

## GatherMetadataJob

The [GatherMetadataJob](https://github.com/AllenNeuralDynamics/aind-metadata-mapper/tree/release-v1.0.0#usage) is the primary tool used to assemble and validate metadata during upload of data assets. The job handles construction of the `data_description`, `subject`, and `procedures` as well as merging and validating `instrument` and `acquisition` metadata. It also runs a full validation step on all available metadata files to ensure cross-compatibility.

The main settings you should be concerned with are:

- `instrument_settings.instrument_id`: this field triggers the job to pull an `instrument.json` file from the metadata-service (where you previously uploaded it).
- `data_description_settings.tags/group/restrictions/data_summary`: each of these fields is meta-metadata about your project and should be accurately filled out, if possible. Please see the [DataDescription](https://aind-data-schema.readthedocs.io/en/latest/data_description.html#datadescription) documentation for details about each field.

The settings for the GatherMetadataJob are typically set [inside of your upload script](https://github.com/AllenNeuralDynamics/aind-data-transfer-service/blob/d1f84020862c3de340020b6cb45bef0fd5105515/docs/examples/aind_data_schema_v2.py#L45-L50) or as part of the `job_type`.

### Validation during upload

The GatherMetadataJob validates the relationship between acquisition and instrument metadata when it assembles the full metadata object. This includes checking that:

- All `active_devices` in acquisition data streams and stimulus epochs exist in the instrument (or procedures, for implanted devices)
- All devices referenced in acquisition connections exist in the instrument or procedures
- The `acquisition.instrument_id` matches the `instrument.instrument_id`

**When validation runs**: Validation occurs during the metadata gathering step of the upload job. This runs as part of the aind-data-transfer-service workflow, typically when data is being prepared for transfer (whether from rig to VAST or VAST to S3, depending on your setup).

**If validation fails**:

- With `raise_if_invalid` enabled (strongly recommended): The GatherMetadataJob raises an exception. The upload job fails and no data is transferred. You will see the validation error in the job logs.
- With `raise_if_invalid` disabled: The job may continue and create metadata with a validation bypass, but errors are logged. This can result in a data asset with invalid metadata that may cause problems downstream.

**How to fix validation failures**:

1. **Active devices not found**: Ensure every device name in `acquisition.json` (in `data_streams[].active_devices` and `stimulus_epochs[].active_devices`) exactly matches a device `name` in `instrument.json`. Device names are case-sensitive. If you use implanted devices, those must be defined in `procedures.json`.
2. **instrument_id mismatch**: Set `acquisition.instrument_id` to match `instrument.instrument_id`. When merging multiple instruments, the acquisition should reference the merged instrument_id format (see [Merge rules](#merge-rules)).
3. **Connection device not found**: Ensure `source_device` and `target_device` in each connection match device names in the instrument or procedures.

You can test validation locally before upload using the `InstrumentAcquisitionCompatibility` class from `aind-data-schema`; see the [aind-data-schema validation docs](https://aind-data-schema.readthedocs.io/en/latest/validation.html) for details.

### Merge rules

### When can multiple files be merged?

When data is acquired simultaneously using two or more distinct instruments (e.g., a behavior instrument and a physiology instrument), multiple `instrument.json` and/or `acquisition.json` metadata files can be provided. The GatherMetadataJob will merge these files during upload via the `aind-data-transfer-service`.

#### File Naming Convention

Each file must follow the naming pattern `<metadata_type>*.json` where `*` is any string. We recommend using modalities to organize the individual files:
- `instrument_behavior.json` and `instrument_ecephys.json`
- `acquisition_behavior.json` and `acquisition_ecephys.json`

#### Contraints

1. **Unique fields must match**: Certain identifier fields that should be unique across the dataset (like `subject_id`) **must have identical values** in all files being merged. If these fields conflict, the merge will fail and your upload job will be rejected. An important exception is the `instrument_id` field. If two or more instrument JSON files are joined, the merged instrument JSON file will have an `instrument_id` that is the individual IDs joined with `_` in alphabetical order. Because `acquisition.instrument_id` must match the merged instrument, you must anticipate this format when generating acquisition metadata for multi-instrument sessions. For example, if you acquire across behavior instrument "FRG.10-A" and fiber photometry instrument "FIP-2", the merged instrument_id will be `FIP-2_FRG.10-A` (alphabetically sorted). Your acquisition files must use that value for `instrument_id`.

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
