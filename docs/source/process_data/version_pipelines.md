# Verioning pipelines

## Introduction

We are introducing a custom versioning policy for Code Ocean (CO) built pipelines due to versioning limitations provided by CO. This will allow us to automatically pull pipeline version information using standard python tools available to all users and store the version information into the `Processing` object defined in [aind-data-schema](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/dev/src/aind_data_schema/core/processing.py#L970). 

## Code Ocean limitations

While CO provides a mechanism to officially release and version a CO pipeline XXX (provide link to documentation); CO does not provide pipeline users with runtime environment variables publishing current pipeline run versions. 

CO does provide a python SDK to access the CO API where version information can be found through a current runs `ComputationID`. 

Beacuse Neural Dynamics vows to build shareable tools not just for internal users, but for external users as well, this would require outside users to run their pipeline on the CO platform to get valid pipeline information. 

Additionally, while CO pipelines are linked to GitHub repositories, they are versioned through a CO versioning system which tracks changes and releases on a separate Git instance. This prevents developers from syncing the CO version system with the remote, versioning provided throughh GitHub.

## Versioning pipeline in Neural Dynamics

In order to omit the need for a custom API on a pay-for-service system; we have chosen to use the GitHub versioning system and have built automated tools for pipeline develpers to incorporate the version information into pipeline environment variables for easy access to pipeline versioning information.


## Pipeline github templates

Pipelines created from [`aind-pipeline-template`]()