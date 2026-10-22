# Processing pipeline standards

AIND processing pipelines are [Nextflow](https://www.nextflow.io/) pipelines maintained in public GitHub repositories.
They are built to meet four requirements: reproducibility, scalability, modularity and portability.
The standards in this section describe how pipelines are organized, versioned, parameterized, tested and logged to meet them.

## Design principles

**Reproducibility.** Small differences in software versions or parameters can lead to very different results.
All the code a pipeline runs can be traced to a specific commit in a GitHub repository,
and every process runs inside a versioned Docker or Singularity/Apptainer container,
so the same steps can be re-run identically, even if the hardware backend changes.
Each run records the code versions and parameters it used, and on Code Ocean the steps before and after the pipeline are tracked too.

**Scalability.** Each Nextflow process runs independently and communicates with the others through channels,
so independent units of data (e.g. probes, shanks, recording segments) are processed in parallel.
Nextflow also requests resources per process, so expensive instances (e.g. with GPUs) are only used by the steps that need them.

**Modularity.** Each step is a separate process, with its code in its own repository and a standard interface
(see [Pipeline processes](pipeline_processes.md)).
Algorithms can be swapped, and steps added or removed, without changing the rest of the workflow.

**Portability.** Nextflow separates the processing steps from the resources that run them,
so the same pipeline runs on a workstation, an HPC cluster or the cloud with only configuration changes.
The same pipeline repository MUST be deployable in these environments:

- **AIND, on Code Ocean**: the pipeline runs on AWS Batch, triggered from Code Ocean (e.g. by the data transfer service).
- **External users, on workstations**: the pipeline runs with the Nextflow `local` executor and Docker.
- **External users, on HPC clusters**: the pipeline runs with the Nextflow `slurm` executor (or another HPC executor) and Apptainer/Singularity.

Each deployment has its own Nextflow configuration file (see [Repository organization](repository_organization.md)),
while the workflow definition (`main.nf`), parameters and containers are shared.

```{toctree}
:maxdepth: 1

pipeline_repository_organization.md
pipeline_processes.md
pipeline_packaging_and_versioning.md
pipeline_parameters.md
pipeline_and_process_testing.md
pipeline_logging.md
```

## Nextflow version

Pipelines are written as plain DSL2 `main.nf` files and maintained in GitHub.
They are not edited in the Code Ocean visual pipeline builder, which can't represent them.

Pipelines MUST run on **Nextflow 25.10 or newer**. This is the minimum version for the
[nf-schema](https://nextflow-io.github.io/nf-schema/) plugin (`nf-schema@2.7.3`) used to validate parameters
(see [Pipeline parameterization](pipeline_parameters.md)), and the latest version available on Code Ocean (25.10.4).
Newer nf-schema releases (2.8.0 and later) require Nextflow 26.04, so they can't be used until Code Ocean supports it.

CI tests run with the latest stable Nextflow release, with `NXF_SYNTAX_PARSER=v1`,
until pipelines are migrated to the new strict syntax parser.

## Available ND platform pipelines

| Pipeline | Modality | Documentation | Reference |
|---|---|---|---|
| [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline) | Extracellular electrophysiology (spike sorting) | [aind-ephys-pipeline.readthedocs.io](https://aind-ephys-pipeline.readthedocs.io) | [Buccino et al., eLife](https://elifesciences.org/articles/110170v1) |
| [aind-smartspim-pipeline](https://github.com/AllenNeuralDynamics/aind-smartspim-pipeline) | SmartSPIM light-sheet microscopy | WIP | WIP 
| 
