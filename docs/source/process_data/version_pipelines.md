# Versioning pipelines

Users need to understand how to interact with computed results produced by data processing pipelines. If there are changes in the structure or interpretation of results because of a change to a processing pipeline, it must be easy for users to understand the nature of these changes and detect these changes reliably in code.

## Policies

Core data processing pipelines MUST adopt [semantic versioning](https://semver.org/). 
- Major version changes indicate that the structure or interpretation of the data has changed.

    - Update to `aind-data-schema` that renames or restructures the metadata.
    - Any default parameter changes.
    - Changes to the output file structure.

- Minor version changes indicate new, backwards compatible features were added to the pipeline.

    - Add a new parameter to the input arguments.
    - Add a new QC plot.

- Patch version changes indicate backwards compatible bug fixes.

    - Critical bug fixes that do not alter the data structure. 

The pipeline's name and semantic version MUST be stored in aind-data-schema [Processing](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/dev/src/aind_data_schema/core/processing.py#L970) metadata at the top level of the results.

The pipeline's name and semantic version MUST be stored in the pipeline repository and easily accessible to pipeline code. We recommend a `.env` file containing `PIPELINE_VERSION`, `PIPELINE_NAME`, and `PIPELINE_URL` variables. These environment variables can be pulled using standard tools such as `os` and added to the `aind-data-schema` `Processing` core object for proper documentation. Specifically, the following fields of the `Processing` object should be populated with these enironment variables:

`Processing.pipeline_version=os.getenv("PIPELINE_VERSION", "No version reported.")`
`Processing.pipeline_url=os.getenv("PIPELINE_URL", "No pipeline URL reported.")`

The pipeline repository and the repositories of all individual capsules MUST be public on GitHub.

To deploy a new release of a pipeline:

- Pipelines and component capsules MUST update their semantic version appropriately.
- Pipelines and component capsules MUST be synchronized with GitHub.
- Pipelines and component capsules used in production MUST have a Code Ocean "internal release."
- Pipelines MUST update their `CHANGELOG` indicating what has changed in the release.

This process ensures production pipelines are not subject to accidental changes and versioning is always communicated consistently to users downstream. 

## Code Ocean versioning

When a capsule or pipeline is internally released in Code Ocean, Code Ocean creates an immutable copy of the pipeline and issues it a release version. This version, which is published as an `int` value, is unrelated to the semantic version of the pipeline, but it is a necessary parameter for those triggering pipelines via the API (e.g. the AIND data transfer service).

## Implementation

Developers can create a pipeline from this template: [`aind-pipeline-template`](https://github.com/AllenNeuralDynamics/aind-pipeline-template). Once created, the pipeline uses a [workflow](https://github.com/AllenNeuralDynamics/.github/blob/main/.github/docs/Release%20Tag%20and%20Publish%20Pipeline.md) that will, on every pull request into main, bump the version using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The version and GitHub repository of the pipeline created with this template are added to the pipeline's environment variables as `PIPELINE_VERSION`, `PIPELINE_NAME` and `PIPELINE_URL` in the repostory's `nextflow.config` file. 

The developer is still responsible for ensuring that the `PIPELINE_VERSION`, `PIPELINE_NAME`, and `PIPELINE_URL` values, as well as the `CHANGELOG` are correct and up-to-date in the repository.

To address Git versions being out-of-sync with the Code Ocean version, a table is provided below that explains the relationship. Version numbers are only illustrative and meant to demonstrate that Code Ocean pipeline version always increases as an integer while semantic versions increase according to update level.

| Code Ocean Version | GitHub Version | Git Commit |
|--------------------|----------------|------------|
| 18.0 | - | - |
| 19.0 | 0.1.0 | feat: add release.yml file for semantic versioning |
| 20.0 | 0.1.1 | fix: correct mislabeled metadata in processing |
| 21.0 | 0.2.0 | feat: add two new QC plots |

Because some pipelines already have mature Code Ocean releases, there will be a mismatch between Code Ocean versions and the semantic versions reported in the `Processing` object. Assets processed before semantic versioning was adopted will only have a Code Ocean version in their metadata (e.g., `18.0`). Assets processed after adoption will have a semantic version (e.g., `0.1.0`).

When querying the metadata database for `Processing.pipeline_version`, users and developers must account for both version formats. For example, to find all assets processed with this pipeline before version `0.2.0`, the query would need to match:
- Semantic versions `< 0.2.0` (i.e., `0.1.0`, `0.1.1`)
- Code Ocean versions from before semantic versioning was adopted (i.e., `18.0`)

For pipelines that have adopted semantic versioning, users and developers will always be able to find a pipelines semantic version in the `nextflow.config`.
