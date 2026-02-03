# Upload

[todo]

## GatherMetadataJob

[todo]

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
