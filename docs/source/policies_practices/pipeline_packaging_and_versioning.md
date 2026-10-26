# Packaging and versioning

Users need to understand how to interact with the results a pipeline produces, and when results change
they need to be able to detect, understand and adapt to the change. Pipelines are therefore versioned
consistently, and the version is recorded in the outputs.

Pipelines MUST use semantic versioning (`MAJOR.MINOR.PATCH`), judged by their effect on outputs:

- **major**: the output structure or the processing approach changes, so results before and after are not
  directly comparable. Downstream code will need significant refactoring, and outputs may need to be preserved
  across major versions for compatibility.
- **minor**: a new feature, or a change in the content of outputs (including bug fixes that change outputs).
  Downstream code may need minor refactoring, and previously processed data may need to be reprocessed.
- **patch**: no change to outputs (bug fixes for failures, refactoring, performance). Data should not need
  reprocessing and downstream code should not need to change.

The version is stored in `pipeline/pipeline_version.txt` and bumped by hand on the `dev` branch.
Every version has hand-written release notes in `docs/source/releases/<version>.rst`.
CI enforces both, builds the container images, runs the tests and creates the release.
The workflows below are from [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/tree/main/.github/workflows).

**TODO**: two release mechanics are currently documented and need to be reconciled. aind-ephys-pipeline bumps
`pipeline_version.txt` by hand and has CI enforce it (described on this page); the
[`aind-pipeline-template`](https://github.com/AllenNeuralDynamics/aind-pipeline-template) workflow instead derives the
bump automatically from [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and generates the
`CHANGELOG` (described under [Commit types and version increments](#commit-types-and-version-increments) below).
One of the two should become the standard.

## Version metadata

The pipeline's name, semantic version and URL MUST be recorded in the aind-data-schema
[Processing](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/dev/src/aind_data_schema/core/processing.py#L970)
metadata at the top level of the results - the fields `Processing.pipelines.name`,
`Processing.pipelines.code.version` and `Processing.pipelines.code.url`.

The name and version MUST also be stored in the pipeline repository and be reachable from pipeline code.
We recommend the environment variables `PIPELINE_VERSION`, `PIPELINE_NAME` and `PIPELINE_URL`, populated from the
pipeline's `nextflow.config` and available to every process, which can then populate the `Processing` object.

Methods from [`aind-metadata-manager`](https://github.com/AllenNeuralDynamics/aind-metadata-manager) enforce that all
three fields are provided and create the entries in the `Processing` object. If a value is missing the pipeline fails
with a clear error rather than falling back to a placeholder default. The developer remains responsible for the values
and the release notes being correct and up to date in the repository.

## Commit types and version increments

Semantic versioning alone does not fully capture the needs of data processing pipelines. Conventional commit types such
as `fix` and `feat` can each be breaking or non-breaking from the perspective of the output data, and breaking changes
differ in kind: some change output content (a downstream process produces wrong results), while others change output
structure or processing fundamentals (a downstream process fails entirely).

The table below maps conventional commit types to the appropriate version increment. Other commit types
(`docs`/`chore`/`ci`) do not increment the version. This mapping is implemented in the release workflow of
[`aind-pipeline-template`](https://github.com/AllenNeuralDynamics/aind-pipeline-template) and can be customized per
pipeline. The generated changelog groups commit messages by category, with minor breaking changes (`!`) and major
breaking changes (`BREAKING`) called out in separate sections.

| Commit type | Description | Version increment |
|---|---|---|
| `refactor` | A code change that neither fixes a bug nor adds a feature | patch |
| `perf` | A code change that improves performance with output unchanged | patch |
| `fix` | A bug fix that resolves failures only | patch |
| `build` | Non-breaking changes to external dependencies | patch |
| `feat` | A new feature added to output without changing existing output | minor |
| `fix!` | A bug fix that changes outputs to correct previous errors | minor |
| `build!` | Breaking changes to external dependencies (e.g. an algorithm slightly changes its output) | minor |
| `feat!` | A new feature that also changes outputs (e.g. renaming an existing output) | minor |
| `BREAKING` (in footer) | Fundamental change to the processing approach or output structure such that results before and after are not directly comparable | major |

## Branches

Feature branches are merged into `dev`. Releases are PRs from `dev` into `main`; PRs into `main` from any other branch fail CI.
Both `dev` and `main` require the `ci-ok` status check, a job that only passes when all the other jobs of the workflow passed.

## Container images

Images are built from `environment/` and pushed to GHCR, one per entry of `environment/images.json`, with these tags:

| Tag | Created by | Points to |
|---|---|---|
| `<version>-dev` | PRs and pushes to `dev` | the images of the upcoming version, rebuilt as `dev` changes |
| `<version>` | PR from `dev` to `main` | a copy of `<version>-dev`, not rebuilt |
| `latest` | push to `main` | the latest release |

Each image carries an `org.aind.env-hash` label: a hash of its Dockerfile and of `package-versions.txt`
(computed by [`.github/scripts/image_info.sh`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/scripts/image_info.sh)).
An image is only rebuilt when the hash of the tag in GHCR doesn't match the current `environment/`,
so PRs that don't touch `environment/` don't rebuild anything.

## PR to `dev`

[`pr-dev.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/pr-dev.yml) runs on PRs into `dev` and on pushes to `dev`:

1. **Version check**: `pipeline_version.txt` must be greater than the latest release tag, so the first PR after a release must bump the version.
2. **Build images**: build and push `<version>-dev` for the images whose `env-hash` changed.
3. **Cache images**: pull the images once and save them to the GitHub Actions cache, so test jobs don't each pull from GHCR.
4. **Nextflow tests**: run the pipeline on test data with the `<version>-dev` images (see [Pipeline and process testing](pipeline_and_process_testing.md)).

PRs from forks fail, because they can't push to GHCR: contributors push their branch to the main repository.

[`changelog.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/changelog.yml)
also checks that the PR updates `docs/source/releases/<version>.rst`, unless the PR has the `skip-changelog` label.

## PR from `dev` to `main`

[`pr-main.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/pr-main.yml):

1. **Release checks**: the PR comes from `dev`, the version is ahead of the latest release, and the release notes are final:
   listed in the releases index, dated, without `WIP`/`TBD`/`TODO` markers, and with package versions matching `environment/`.
2. **Promote images**: copy `<version>-dev` to `<version>` (with `skopeo copy`, no rebuild).
   This fails if the `-dev` image wasn't built from the current `environment/`, so the released images are the ones that were tested on `dev`.
3. **Cache images** and **Nextflow tests**, on the `<version>` images.

## Push to `main`

[`release.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/release.yml),
if the `<version>` tag doesn't exist yet:

1. tags the `<version>` images as `latest`;
2. creates the `<version>` git tag and a GitHub release, with the release notes converted to Markdown.

On Code Ocean, the released pipeline is then synced and given an internal release. To deploy a new release:

- the pipeline and its component capsules MUST update their semantic version appropriately;
- the pipeline and its component capsules MUST be synchronized with a linked public GitHub repository;
- the pipeline and its component capsules MUST have a Code Ocean "internal release";
- the pipeline MUST update its release notes indicating what changed.

This keeps production pipelines from changing by accident and keeps versioning communicated consistently to users downstream.

## Container tag at runtime

`main.nf` picks the image tag from, in order: the `--container_tag` parameter, the `CONTAINER_TAG` environment variable,
and `pipeline_version.txt`. A released pipeline therefore uses its own images by default,
and CI uses `CONTAINER_TAG` to test the `-dev` images.

## Code Ocean release versioning

When a capsule or pipeline is internally released in Code Ocean, Code Ocean creates an immutable copy and issues it a
release version, recorded as `MAJOR.MINOR` with the minor version fixed at 0 and the major version incremented on each
release. This version is unrelated to the pipeline's semantic version, but it is a necessary parameter for anyone
triggering the pipeline via the API (e.g. the AIND data transfer service). We intend to develop helper functions to map
between the two versioning systems.

A typical progression of the two:

| Code Ocean version | GitHub version | Git commit |
|---|---|---|
| 18.0 | - | - |
| 19.0 | 0.1.0 | feat: add release.yml file for semantic versioning |
| 20.0 | 0.1.1 | fix: correct mislabeled metadata in processing |
| 21.0 | 0.2.0 | feat: add two new QC plots |

Assets processed before semantic versioning was adopted only have a Code Ocean version in their metadata (e.g. `18.0`);
assets processed after adoption have a semantic version (e.g. `0.1.0`). Code or queries that span both eras need to
account for both formats. For example, to find all assets processed with this pipeline before version `0.2.0`, the query
must match semantic versions `< 0.2.0` (i.e. `0.1.0`, `0.1.1`) and Code Ocean versions `<= 18.0`
(distinguished by two vs. three version elements).

**TODO**: move common workflows for pr-to-dev/main/release to `AllenNeuralDynamics/.github/.github/workflows/`

