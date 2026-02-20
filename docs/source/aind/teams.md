# Scientific Computing Teams

## Data Infrastructure

Data Infrastructure maintains the core services in AIND.

Some of the major core services:

**aind-data-transfer-service**

FastAPI service to run data compression and transfer jobs on the HPC

[link](http://aind-data-transfer-service/) | [readthedoc](https://aind-data-transfer-service.readthedocs.io/en/latest/) | [repo](https://github.com/AllenNeuralDynamics/aind-data-transfer-service)

**aind-metadata-service**

REST service to retrieve metadata from AIND databases

[link](http://aind-metadata-service/) | [readthedoc](http://aind-metadata-service/docs) | [repo](https://github.com/AllenNeuralDynamics/aind-metadata-service)

**aind-data-access-api**

Library to interface with AIND databases

[tutorial](https://codeocean.allenneuraldynamics.org/capsule/9613367/tree/v1) | [readthedoc](https://aind-data-access-api.readthedocs.io/en/latest/) | [repo](https://github.com/AllenNeuralDynamics/aind-data-access-api)

**aind-data-asset-indexer**

Index jobs for AIND metadata in AWS DocumentDB and S3

[readthedoc](https://aind-data-asset-indexer.readthedocs.io/en/latest/) | [repo](https://github.com/AllenNeuralDynamics/aind-data-asset-indexer)

## Data & Outreach

The Data & Outreach team maintains the data schema and associated downstream tools and is responsible for coordinating workshops and other outreach events.

**aind-data-schema**

Metadata schema for neuroscience

[readthedoc](https://aind-data-schema.readthedocs.io/en/latest/) | [repo](https://github.com/AllenNeuralDynamics/aind-data-schema) | [registries repo](https://github.com/AllenNeuralDynamics/aind-data-schema-models/)

**aind-metadata-mapper**

Repository to help gather and map metadata from different sources

[readthedoc](https://aind-metadata-mapper.readthedocs.io/en/latest/) | [repo](https://github.com/AllenNeuralDynamics/aind-metadata-mapper)

### Outreach

**SWDB Data Book**

Data book for the SWDB course

[SWDB data book](https://allenswdb.github.io/intro.html)

## Physiology & Behavior

The Physiology & Behavior team maintains the pipelines that process each modality of data asset that we acquire in AIND. Details can be found in [Process data](../acquire_upload/process_data.md).

## Image Processing

The Image Processing team develops and maintains pipelines for processing lightsheet microscopy data across multiple imaging platforms. For internal users see also this [overview doc](https://alleninstitute.sharepoint.com/:w:/s/NeuralDynamics/IQA4mzEcBLN3RLCbNiQuaXHfAdvWB-mPvTZGhF1yKQ4sm5I?e=zBTLXh).

**Smartspim**

[aind-smartspim-pipeline](https://github.com/AllenNeuralDynamics/aind-smartspim-pipeline)

**Exaspim**

[exaspim-flatfield-correction](https://github.com/AllenNeuralDynamics/exaspim-flatfield-correction) | [aind-exaspim-neuron-segmentation](https://github.com/AllenNeuralDynamics/aind-exaspim-neuron-segmentation) | [aind-exaspim-soma-detection](https://github.com/AllenNeuralDynamics/aind-exaspim-soma-detection) | [aind-exaspim-ccf-registration](https://github.com/AllenNeuralDynamics/aind-exaspim-ccf-registration) | [exaSPIM_register_swc_to_ccf](https://github.com/AllenNeuralDynamics/exaSPIM_register_swc_to_ccf)

**Z1 (HCR and Proteomics)**

[aind-z1-radial-correction](https://github.com/AllenNeuralDynamics/aind-z1-radial-correction) | [aind-z1-camera-alignment](https://github.com/AllenNeuralDynamics/aind-z1-camera-alignment) | [aind-z1-spot-detection](https://github.com/AllenNeuralDynamics/aind-z1-spot-detection) | [aind-hcr-r2r-registration](https://github.com/AllenNeuralDynamics/aind-hcr-r2r-registration) | [hcr-czitile-utils](https://github.com/AllenNeuralDynamics/hcr-czitile-utils) | [aind-hcr-data-transformation](https://github.com/AllenNeuralDynamics/aind-hcr-data-transformation) | [aind-proteomics-stitch](https://github.com/AllenNeuralDynamics/aind-proteomics-stitch)

**Proteomics**

[aind-proteomics-image-translator](https://github.com/AllenNeuralDynamics/aind-proteomics-image-translator)

**General Lightsheet**

[aind-lightsheet-mae](https://github.com/AllenNeuralDynamics/aind-lightsheet-mae)

## Resources for SWEs

For research software engineers, [Good Research Code](https://goodresearch.dev/) is a good primer.

[Data structure fundamentals](https://www.crackingthecodinginterview.com/)

