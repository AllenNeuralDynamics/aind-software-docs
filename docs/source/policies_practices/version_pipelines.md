# Versioning pipelines

Users need to understand how to interact with computed results produced by data processing pipelines, and
if there are changes in pipeline results, it must be easy for users to detect, understand, and adapt to these changes.
This policy is intended to facilitate this by ensuring that pipelines are versioned in a consistent and informative way, 
and that version information is easily accessible to users and developers downstream.

## Policies

Core data processing pipelines MUST adopt semantic versioning, with version numbers `MAJOR.MINOR.PATCH` updated according to the following guidelines: 
- Major version changes indicate significant breaking changes to outputs, where the structure or interpretation of the data has changed.
Code relying on the outputs will require significant refactoring to accommodate the changes. Processed outputs may need to be preserved across multiple major versions for compatibility.
- Minor version changes indicate new features or minor breaking changes (including bugfixes) in the content of output data.
Code relying on the outputs may require minor refactoring, and previously processed data may need to be reprocessed.
- Patch version changes indicate non-breaking bug fixes or other code changes.
Data should not require reprocessing and downstream code should not need to be updated.

The pipeline's name, semantic version, and url MUST be stored in aind-data-schema [Processing](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/dev/src/aind_data_schema/core/processing.py#L970) metadata at the top level of the results - specifically the fields `Processing.pipelines.name`, `Processing.pipelines.code.version`, and `Processing.pipelines.code.url`.

The pipeline's name and semantic version MUST also be stored in the pipeline repository and easily accessible to pipeline code. 
We recommend environment variables `PIPELINE_VERSION`, `PIPELINE_NAME`, and `PIPELINE_URL`, 
populated from the pipeline's `nextflow.config` - see <project:#Implementation> below.
These environment variables can then be used to populate the appropriate fields in the `Processing` object.

To deploy a new release of a pipeline:

- Pipelines and component capsules MUST update their semantic version appropriately.
- Pipelines and component capsules MUST be synchronized with a linked public GitHub repository.
- Pipelines and component capsules MUST have a Code Ocean "internal release."
- Pipelines MUST update their `CHANGELOG` indicating what has changed in the release.

This process ensures production pipelines are not subject to accidental changes and versioning is always communicated consistently to users downstream. 

## Implementation

Developers can create a pipeline from this template: [`aind-pipeline-template`](https://github.com/AllenNeuralDynamics/aind-pipeline-template). 
Once created, the pipeline uses a [workflow](https://github.com/AllenNeuralDynamics/.github/blob/main/.github/docs/Release%20Tag%20and%20Publish%20Pipeline.md) that will, on every pull request into main, bump the version using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with the modifications below and generate a `CHANGELOG` based on the commit history.
Environment variables for `PIPELINE_VERSION`, `PIPELINE_NAME` and `PIPELINE_URL` are added to the `nextflow.config` file and available to each component capsule.

Methods from the [`aind-metadata-manager`](https://github.com/AllenNeuralDynamics/aind-metadata-manager) package can be used to enforce that all three pipeline fields are provided and create the appropriate entries in the `Processing` object. 
If a value is missing, the pipeline will fail with a clear error message rather than falling back to a placeholder default.

The developer is still responsible for ensuring that the `PIPELINE_VERSION`, `PIPELINE_NAME`, and `PIPELINE_URL` values, as well as the `CHANGELOG` are correct and up-to-date in the repository.


## Commit types and version increments

Standard semantic versioning alone does not fully capture the needs of data processing pipelines. 
Conventional commit types such as `fix` and `feat` can each be either breaking or non-breaking from the perspective of output data, 
and breaking changes can differ in kind: some change output content (a downstream process may produce wrong results), 
while others change output structure or processing fundamentals (a downstream process fails entirely).

The table below maps conventional commit types to the appropriate version increment.
Other commit types (docs/chore/ci) will not increment the version. 
This mapping is implemented in the release workflow of the `aind-pipeline-template` and can be customized if needed for specific pipelines.
The generated changelog contains commit messages organized by category,
and both minor breaking changes (!) and major breaking changes (BREAKING) called out in separate sections.

| Commit type | Description | Version increment |
|---|---|---|
| `refactor` | A code change that neither fixes a bug nor adds a feature | patch |
| `perf` | A code change that improves performance with output unchanged | patch |
| `fix` | A bug fix that resolves failures only | patch |
| `build` | Non-breaking changes to external dependencies | patch |
| `feat` | A new feature added to output without changing existing output | minor |
| `fix!`  | A bug fix that changes outputs to correct previous errors | minor |
| `build!` | Breaking changes to external dependencies (e.g. an algorithm slightly changes its output) | minor |
| `feat!` | A new feature that also changes outputs (e.g. renaming an existing output) | minor|
| `BREAKING` (in footer) | Fundamental change to the processing approach or output structure such that results before and after are not directly comparable | major |


## Code Ocean release versioning

When a capsule or pipeline is internally released in Code Ocean, Code Ocean creates an immutable copy of the pipeline and issues it a release version, 
recorded as `MAJOR.MINOR` with the minor version fixed at 0 and the major version incremented with each release. 
This version is unrelated to the semantic version of the pipeline, but it is a necessary parameter for those triggering pipelines via the API (e.g. the AIND data transfer service).
We intend to develop helper functions to map between these two versioning systems.

The example below illustrates a typical progression of the two versioning systems

| Code Ocean Version | GitHub Version | Git Commit |
|--------------------|----------------|------------|
| 18.0 | - | - |
| 19.0 | 0.1.0 | feat: add release.yml file for semantic versioning |
| 20.0 | 0.1.1 | fix: correct mislabeled metadata in processing |
| 21.0 | 0.2.0 | feat: add two new QC plots |

Assets processed before semantic versioning was adopted will only have a Code Ocean version in their metadata (e.g., `18.0`). Assets processed after adoption will have a semantic version (e.g., `0.1.0`).
Users and developers may need to account for both version formats in code or queries that deal with processed data from both before and after semantic versioning was adopted. 
For example, to find all assets processed with this pipeline before version `0.2.0`, the query would need to match:
- Semantic versions `< 0.2.0` (i.e., `0.1.0`, `0.1.1`)
- Code Ocean versions `<= 18.0` (distinguished by two vs three version elements)