# Acquire data

During data acquisition you are responsible for running version-controlled acquisition software and ensuring your data files for each modality are organized according to standardized conventions.

Metadata generated during acquisition captures **what data** should appear in the final NWB files after processing, as well as **what manipulations** were performed (both behavioral stimuli and any procedures).

## Data

### Data organization conventions

Raw data assets are required to be organized according to our [data organization conventions](../policies_practices/data_organization.md).

#### Per-modality file standards

See [aind-file-standards](https://github.com/allenneuralDynamics/aind-file-standards).

## Metadata

### Acquisition

Rigs are responsible for generating the [acquisition.json](https://aind-data-schema.readthedocs.io/en/latest/acquisition.html) as well as any optional files (e.g., quality_control.json), if your situation requires it. You can either generate these metadata files directly or use the extractor/mapper pattern to extract necessary metadata on the rig and then map it in the cloud to aind-data-schema.

#### Extractor / Mapper Pattern

If you can't generate your aind-data-schema formatted metadata on your rig, you can use what we call the “extractor/mapper” pattern. We refer to the code on the rig that extracts metadata from data files as the extractor. We prefer for you to maintain this code in [aind-metadata-extractor](https://github.com/AllenNeuralDynamics/aind-metadata-extractor/) but you can also maintain it yourself. The code that takes the extractor output and transforms it to aind-data-schema is called the mapper. Scientific computing will help develop the mapper as well as maintain it, you are responsible for your extractor. The key to the extractor/mapper pattern is the data contract that defines the extractor output. The data contract must be a pydantic model or JSON schema file and must live in the [aind_metadata_extractor.models](https://github.com/AllenNeuralDynamics/aind-metadata-extractor/tree/main/src/aind_metadata_extractor/models) module.

On your rig you should output files that match the name of the corresponding mapper that will be run. So if your mapper is called fip you should write a `fip.json` file that validates against the fip extractor schema. The [GatherMetadataJob](upload_data.md#gathermetadatajob) will automatically run your mapper.

#### Relationship between acquisition.json and instrument.json

The acquisition and instrument metadata files are tightly coupled. The [instrument.json](https://aind-data-schema.readthedocs.io/en/latest/instrument.html) describes the full set of devices in your instrument (each device has a `name` field). The [acquisition.json](https://aind-data-schema.readthedocs.io/en/latest/acquisition.html) describes what was active during a specific session.

**Device name matching requirement**: Every device name listed in `acquisition.json` must exist in either the instrument or procedures metadata:

- **DataStream.active_devices**: Each data stream lists the devices that were acquiring data. These names must match the `name` field of devices in `instrument.json` (or implanted devices in `procedures.json`).
- **StimulusEpoch.active_devices**: Similarly, stimulus epoch device names must match instrument or procedure device names.
- **Connections**: Any `source_device` or `target_device` in acquisition connections must reference devices defined in the instrument or procedures.
- **instrument_id**: The `acquisition.instrument_id` must match `instrument.instrument_id`.

Validation of this relationship occurs during the [GatherMetadataJob](upload_data.md#gathermetadatajob) when metadata is assembled for upload. See [Validation during upload](upload_data.md#validation-during-upload) for when validation runs, what happens when it fails, and how to fix issues.

#### Multiple independent rigs

Many setups now have multiple independent rigs running. You can generate separate instrument and acquisition files for each rig and the data-transfer-service will merge them together for you, as long as you follow these rules:

1. Please turn on the raise_if_invalid setting in the GatherMetadataJob job settings. It is very easy to test that the merge will work and a huge pain to fix if it fails.
2. Each file needs a suffix, for example instrument_behavior.json and instrument_ecephys.json. The suffix can be anything it just needs to match the pattern “<core-file>*.json”.
3. The files need to be compatible according to the merge rules. You need to look at the __add__ functions for each core file to see the exact rules. The most important thing is that unique fields in each file, like acquisition.subject_id or instrument.instrument_id need to match in the two files. We don't know how to merge conflicts so your job will be rejected.
4. In general two instruments (and their paired acquisitions) can be merged if and only if there are no shared devices between the two instruments. If there are shared devices, they should really be a single instrument.

## AIND Behavior Service

Some tasks are being run on a standardized platform using Bonsai and Harp for data acquisition. Please read the documentation about the [aind-behavior-services](https://allenneuraldynamics.github.io/Aind.Behavior.Services/index.html).

### Behavior service tasks

| Task | Repository |
|------|-----------|
| VrForaging | https://github.com/AllenNeuralDynamics/Aind.Behavior.VrForaging |
| IsoForce | https://github.com/AllenNeuralDynamics/Aind.Behavior.IsoForce |

