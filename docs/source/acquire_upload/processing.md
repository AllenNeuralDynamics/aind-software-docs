# Processing pipelines

Scientific computing is currently re-organizing pipelines to be per-modality, rather than per-project.

## Pipeline requirements

### Data

[todo]

### Metadata

All processing pipelines that create derived assets will upgrade the [data_description](https://aind-data-schema.readthedocs.io/en/latest/data_description.html) to a derived data description (changing the name and data_level). Processing also creates additional processing metadata as well as quality_control metadata.

Any files that are not modified should simply be copied to the derived asset unchanged.
How to upgrade a data_description

Use the [`DataDescription.from_data_description()`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/e172cb06a63b722eaeaaf8933d0a17cbedf3feea/src/aind_data_schema/core/data_description.py#L334) function to create derived data_description objects. Pass the process name as a parameter. If more source data assets were used than just the one being passed into the function then pass the optional source_data parameter as well with the names of those data assets.

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