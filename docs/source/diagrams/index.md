# Software and Systems Diagrams

This section contains diagrams illustrating the interactions between AIND software and systems, including core services, data storage, and compute resources. They are organized around the main stages of the data-flow pipeline — follow a stage to drill into its detailed diagrams. These pages are updated periodically as our software and systems evolve.

## General data flow

This diagram illustrates a bird's-eye view of the data-flow pipeline. Four main
components encompass how data are generated and move through the system:

1. [Lab Management System](lab_management.md)
2. [Data Acquisition](data_acquisition.md)
3. [Data Staging](data_staging.md)
4. [Data Storage and Processing](data_storage_processing.md)

![High-level data flow](high_level/general_data_flow.drawio.svg)

## Platform-specific

- [Dynamic foraging](dynamic_foraging.md)

[![Software Overview](../_static/aind-software-overview.png)](../_static/aind-software-overview.pdf)

```{toctree}
:maxdepth: 1
:hidden:

lab_management
data_acquisition
data_staging
data_storage_processing
dynamic_foraging
```
