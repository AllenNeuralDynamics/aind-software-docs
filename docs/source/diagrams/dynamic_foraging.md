# Dynamic foraging diagrams

These diagrams outline the architecture of the Dynamic Foraging platform.

## Lab Management System

Dynamic Foraging relies on the lab management system for session and subject
planning. It also uses the system's water restriction tracking to support
behavior training.

![Dynamic Foraging lab management](dynamic_foraging/mid_level/lab_management_df.svg)

## Data Acquisition

![Dynamic Foraging acquisition architecture](dynamic_foraging/dynamic_foraging_architecture.svg)

## Data Storage and Processing

### Mid-level Processing Pipeline

Data from Dynamic Foraging is processed by two pipelines — a behavior pipeline
and a fiber pipeline. Each runs independently and produces a modality-specific
NWB file when it completes successfully.

![Dynamic Foraging processing pipeline](dynamic_foraging/mid_level/codeocean_pipeline_diagram_DF.svg)

#### Fiber Pipeline

![Dynamic Foraging fiber pipeline](dynamic_foraging/mid_level/codeocean_pipeline_diagram_DF_fiber.svg)

#### Behavior Pipeline

![Dynamic Foraging behavior pipeline](dynamic_foraging/mid_level/codeocean_pipeline_diagram_DF_behavior.svg)
