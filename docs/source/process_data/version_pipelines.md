# Versioning pipelines

## Introduction

We are introducing a custom versioning policy for Code Ocean (CO) built pipelines due to versioning limitations provided by CO. This will allow us to automatically pull pipeline version information using standard Python tools available to all users in order to store the version information into the `Processing` object defined in [`aind-data-schema`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/dev/src/aind_data_schema/core/processing.py#L970).

## Code Ocean limitations

While CO provides a mechanism to officially release and version a CO pipeline through their custom API, CO does not provide pipeline version information through environment variables that can be queried at runtime. Instead, CO provides a Python SDK to access the CO API where version information can be found through a current run's `ComputationID`. This creates a dependency on the CO ecosystem, requiring users to have CO accounts to retrieve version information programmatically.

Additionally, while CO pipelines are linked to GitHub repositories, they are versioned through a CO versioning system which tracks changes and releases on a separate Git instance. This prevents developers from syncing the CO version system with the remote versioning provided through GitHub.

## Versioning pipelines in Neural Dynamics

Because Neural Dynamics is committed to building shareable tools not just for internal users but for external users as well, we needed a versioning approach that doesn't require outside users to run their pipelines on the CO platform to get valid pipeline information.

To remove the dependency on a third-party API on a paid platform, we have chosen to version our pipelines using GitHub's release system. We have built automated tools for pipeline developers to incorporate the version information into pipeline environment variables for easy access to pipeline versioning information.

## How it works

Developers can create a pipeline from this template: [`aind-pipeline-template`](https://github.com/AllenNeuralDynamics/aind-pipeline-template). Once created, the pipeline uses a [workflow](https://github.com/AllenNeuralDynamics/.github/blob/main/.github/docs/Release%20Tag%20and%20Publish%20Pipeline.md) that will, on every pull request into main, bump the version using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). The version and GitHub repository of the pipeline created with this template are added to the pipeline's environment variables as `GITHUB_VERSION` and `GITHUB_URL`.

These environment variables can be pulled using standard tools such as `os` and added to the `aind-data-schema` `Processing` core object for proper documentation.

## For internal developers

While the GitHub-based versioning provides portable version information, internal developers must also follow CO's release process.

It is still required practice to release your pipelines through the CO versioning system. CO release pipelines use a special hash that locks a pipeline to a released version which is immutable. When a developer sets up a job type through [`aind-data-transfer-service`](http://aind-data-transfer-service/) to trigger a pipeline for a production system, the released version should always be run to ensure that users' data is processing on a locked version of the pipeline. If you do not do this, you run the risk of running data on a mutable pipeline environment.