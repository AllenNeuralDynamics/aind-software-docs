# Process data

Scientific computing is currently re-organizing pipelines to be per-modality, rather than per-project.

Pipeline development requirements are documented in [Pipeline development](../policies_practices/platform_support.md#pipeline-development)
and the pipeline versioning policy is documented in [Versioning pipelines](../policies_practices/version_pipelines.md).

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
| Dynamic foraging (legacy combined behavior + fiber) | `behavior`, `behavior-videos`, `fib` | [github](https://github.com/AllenNeuralDynamics/aind-fiber-photometry-pipeline), [code ocean (release)](https://codeocean.allenneuraldynamics.org/capsule/1307799/tree) |

The Dynamic Foraging entry above is the **legacy** combined behavior + fiber photometry pipeline, for sessions acquired on the pre-HARP/FIP systems (v1 metadata schema) that are being phased out starting in the summer of 2026. Despite the `aind-fiber-photometry-pipeline` repo name, it processes both behavior and fiber. New fiber-only acquisition is processed by [aind-fiber-photometry-harp-pipeline](https://github.com/AllenNeuralDynamics/aind-fiber-photometry-harp-pipeline) (the Fiber photometry row above). The Code Ocean link points to the released pipeline, which automatically resolves to the latest released version