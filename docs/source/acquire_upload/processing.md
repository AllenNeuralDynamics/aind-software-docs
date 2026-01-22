# Processing pipelines

Scientific computing is currently re-organizing pipelines to be per-modality, rather than per-project.

## Pipeline requirements

### Data

See [Data organization/Derived data conventions](../philosophy/data_organization.md#derived-data-conventions) for file organization conventions in derived assets.

### Metadata

#### data_description.json

All processing pipelines that create derived assets should upgrade the [data_description](https://aind-data-schema.readthedocs.io/en/latest/data_description.html) to a derived data description (changing the name and data_level).

##### How to upgrade a data_description

Use the [`DataDescription.from_data_description()`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/e172cb06a63b722eaeaaf8933d0a17cbedf3feea/src/aind_data_schema/core/data_description.py#L334) function to create derived data_description objects. Pass the process name as a parameter, often just `"processed"`. If more source data assets were used than just the one being passed into the function then pass the optional `source_data` parameter as well with the names of those data assets.

```python
from pathlib import Path
from aind_data_schema.core.data_description import DataDescription

# Load the original data_description.json
original_data_description = DataDescription.model_validate_json(
    Path("data_description.json").read_text()
)

# Create a derived data_description with upgrade
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

Metadata `.json` files that are not modified should be copied to the derived asset unchanged.

## Per-modality physiology pipelines

| Modality | Modalities | Pipeline repository |
|---|---|---|
| Barcoded anatomy resolved by sequencing | `barseq` |  |
| Brightfield microscopy | `brightfield` |  |
| Confocal microscopy | `confocal` |  |
| Extracellular electrophysiology | `ecephys` | [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline) |
| Electron microscopy | `EM` |  |
| Electromyography | `EMG` |  |
| Fiber photometry | `fib` | [aind-fiber-photometry-harp-pipeline](https://github.com/AllenNeuralDynamics/aind-fiber-photometry-harp-pipeline) |
| Fluorescence micro-optical sectioning tomography | `fMOST` |  |
| Intracellular electrophysiology | `icephys` |  |
| Intrinsic signal imaging | `ISI` | [isi_segmentation](https://github.com/AllenNeuralDynamics/isi_segmentation) |
| Multiplexed analysis of projections by sequencing | `MAPseq` |  |
| Multiplexed error-robust fluorescence in situ hybridization | `merfish` |  |
| Magnetic resonance imaging | `MRI` |  |
| Planar optical physiology | `pophys` | [aind-pophys-pipeline](https://github.com/AllenNeuralDynamics/aind-pophys-pipeline) |
| Single cell RNA sequencing | `scRNAseq` |  |
| Random access projection microscopy | `slap2` |  |
| Selective plane illumination microscopy | `SPIM` |  |
| Serial two-photon tomography | `STPT` |  |

## Behavior pipelines

| Behavior | Modalities | Pipeline repository |
|---|---|---|
| Patch foraging behavior | `behavior`, `behavior-videos` | [aind-vr-foraging-pipeline](https://github.com/AllenNeuralDynamics/aind-vr-foraging-pipeline) |
| Camstim/Sync Behavior | `behavior`, `behavior-videos` | [aind-behavior-camstim-pipeline](https://github.com/AllenNeuralDynamics/aind-behavior-camstim-pipeline) |

## Per-project pipelines

| Project name | Modalities | Pipeline repository |
|---|---|---|
| Dynamic foraging | `behavior`, `behavior-videos`, `fib` | [aind-dynamic-foraging-pipeline](https://github.com/AllenNeuralDynamics/aind-dynamic-foraging-pipeline) |