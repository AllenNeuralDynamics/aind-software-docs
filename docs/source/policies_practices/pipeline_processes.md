# Pipeline processes

Each pipeline step (a Nextflow process) lives in its own GitHub repository, organized like a Code Ocean capsule:

```
aind-<modality>-<step>/
├── code/
│   ├── run              # entrypoint: `python -u run_capsule.py "$@"`
│   └── run_capsule.py
├── environment/         # environment definition (used when run as a Code Ocean capsule)
└── metadata/
```

Keeping each step in its own repository lets it be developed, tested and versioned on its own,
reused by several pipelines, and run as a standalone Code Ocean capsule.

## How the pipeline runs a step

The pipeline does not install anything from the step repositories. For each process, `main.nf`:

1. clones the step repository at a pinned commit (listed in `pipeline/process_versions.env`) into `capsule/code`;
2. stages the inputs into `capsule/data`;
3. runs `./run` inside the step's container;
4. collects the outputs from `capsule/results`.

Pinning commits in `process_versions.env` (see [Repository organization](pipeline_repository_organization.md)) means that
a pipeline version always runs the same code. To update a step, its new commit is pinned in a PR to the pipeline's `dev` branch.

Containers are built from the pipeline repository's `environment/` folder by CI and pushed to the GitHub Container Registry
(`ghcr.io/allenneuraldynamics/<image>:<version>`), so all deployments pull the same images.
Several steps can share an image; steps with special dependencies (e.g. a GPU spike sorter) get their own.
See [Packaging and versioning](pipeline_packaging_and_versioning.md).

## Step interface

Every step repository MUST read full parameters from the `params.json` file staged in the root folder.
The params file includes a step-specific section with the parameters for that step
plus the shared `logging` section (see [Logging](pipeline_logging.md)).

Steps MUST use the Code Ocean capsule folders, relative to `code/`: read inputs from `../data`,
write outputs to `../results`, and keep temporary files in `../scratch`.
The same code then runs unchanged in the pipeline, as a Code Ocean capsule and locally.
