# Repository organization

Pipeline repositories SHOULD follow the layout below, so that the CI workflows and helper scripts can be shared across pipelines.
The example is [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline).

```
aind-<modality>-pipeline/
├── pipeline/
│   ├── pipeline_version.txt
│   ├── main.nf
│   ├── nextflow.config            # Code Ocean / AWS Batch
│   ├── nextflow_local.config      # workstations
│   ├── nextflow_slurm.config      # HPC (+ slurm_submit.sh)
│   ├── process_versions.env
│   ├── default_params.json
│   └── default_params_schema.json
├── environment/
│   ├── Dockerfile_<image>         # one per image
│   ├── images.json
│   └── package-versions.txt
├── tests/
├── docs/
│   └── source/releases/<version>.rst
├── scripts/
├── .github/
│   ├── workflows/
│   └── scripts/
└── README.md
```

## `pipeline/`

| File | Content |
|---|---|
| `pipeline_version.txt` | The pipeline semantic version (e.g. `1.4.2`), on a single line. It is the only place the version is stored: `main.nf` reads it for metadata and to pick the container tag, and CI reads it to tag images and releases. |
| `main.nf` | The workflow definition, shared by all deployments. |
| `nextflow*.config` | One configuration per deployment: executor, resources per process, container engine, plugins (e.g. `nf-schema`). `nextflow.config` is the one Code Ocean uses. |
| `process_versions.env` | For each step, the repository URL (`<STEP>_REPO`) and the commit it is pinned to (`<STEP>_VERSION`). Users can override them with a `process_versions_custom.env` file, or for a single step with `--<step>_repo` / `--<step>_version` on the command line. |
| `default_params.json`, `default_params_schema.json` | Default parameters and their JSON Schema. See [Pipeline parameterization](pipeline_parameters.md). |

Commit SHAs (or tags) MUST be used in `process_versions.env`, so a pipeline version always runs the same code.

## `environment/`

| File | Content |
|---|---|
| `Dockerfile_<image>` | One Dockerfile per container image (e.g. a base image, plus images for steps with special dependencies, like GPU spike sorters). |
| `images.json` | Maps an image key to its Dockerfile and its GHCR image name. CI builds, promotes and tags every image listed here. |
| `package-versions.txt` | Pinned (`==`) versions of the Python packages installed in the images. The Dockerfiles install from it, CI installs from it to run checks against the same versions, and release notes are checked against it. |

```json
{
    "base": {"dockerfile": "Dockerfile_base", "image_name": "aind-ephys-pipeline-base"},
    "ks4":  {"dockerfile": "Dockerfile_kilosort4", "image_name": "aind-ephys-spikesort-kilosort4"}
}
```

## Other folders

- `tests/`: scripts that generate small synthetic datasets and check pipeline outputs. See [Pipeline and process testing](pipeline_and_process_testing.md).
- `docs/`: user documentation (Sphinx, published on Read the Docs), including the release notes of each version in `docs/source/releases/<version>.rst`.
- `scripts/`: user helpers, e.g. `pull_pipeline_images.sh` to pull and cache all images before running on an HPC cluster.
- `.github/workflows/`, `.github/scripts/`: CI. See [Packaging and versioning](pipeline_packaging_and_versioning.md).
- Optional: `params_app/`, a static web page generated from the parameter schema to edit and validate parameter files. **TODO:** the params_app should be shared across pipelines (with dropdown to individual ones!)
