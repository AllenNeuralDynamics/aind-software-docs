# Data Description

[Documentation for `data_description.json`](https://aind-data-schema.readthedocs.io/en/latest/data_description.html)

The aind data transfer service generates a `data_description.json` file for each data asset uploaded to the cloud based on the `project_name` provided by the user and information pulled from internal resources.

To ensure that the metadata fields are accurate and consistent across data assets, AIND users should use **modality** (type of collected data - e.g. mesoscale anatomy), **platforms** (standardized way of collecting data - e.g. Harp or Bonsai), and **institutions** described by the controlled vocabularies in [aind-data-schema-models](https://github.com/AllenNeuralDynamics/aind-data-schema-models). If a vocabulary item does not exist for your data type, contact Saskia de Vries or David Feng.

**Funding information** is pulled from the Funding Smartsheet maintained by Shelby Suckow or should be listed as "Allen Institute" for internally funded projects. 












