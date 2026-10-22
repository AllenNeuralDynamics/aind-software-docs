# Packaging and versioning

Pipelines MUST use semantic versioning (`MAJOR.MINOR.PATCH`), judged by their effect on outputs:

- **major**: the output structure or the processing approach changes, so results before and after are not directly comparable;
- **minor**: a new feature, or a change in the content of outputs (including bug fixes that change outputs);
- **patch**: no change to outputs (bug fixes for failures, refactoring, performance).

The version is stored in `pipeline/pipeline_version.txt` and bumped by hand on the `dev` branch.
Every version has hand-written release notes in `docs/source/releases/<version>.rst`.
CI enforces both, builds the container images, runs the tests and creates the release.
The workflows below are from [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/tree/main/.github/workflows).

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

On Code Ocean, the released pipeline is then synced and given an internal release.

## Container tag at runtime

`main.nf` picks the image tag from, in order: the `--container_tag` parameter, the `CONTAINER_TAG` environment variable,
and `pipeline_version.txt`. A released pipeline therefore uses its own images by default,
and CI uses `CONTAINER_TAG` to test the `-dev` images.


**TODO**: move common workflows for pr-to-dev/main/release to `AllenNeuralDynamics/.github/.github/workflows/`
