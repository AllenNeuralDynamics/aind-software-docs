# Data organization

This document describes how data and metadata should be organized before it is copied into cloud storage. It covers core concepts, file names, directory structures, and metadata conventions. 

These requirements will evolve over time and become stricter as we standardize our conventions and build tooling to make it easier to automatically generate the required information and validate conformance. 

Our organizational conventions are motivated by our Open Science Principles. Our data organization must facilitate full reproducibility, rapid sharing with our community, ease of discovery use, and flexibility to pivot with evolving scientific questions. 

Our organizational conventions are inspired by [BIDS](https://bids-specification.readthedocs.io/en/stable/). However, whereas BIDS is oriented around collections of data (datasets), we are applying similar ideas at a lower level to individual acquisition sessions. Our data platform will then be able to flexibly ingest and share any data without prior knowledge of what constitutes a “dataset”. 

## Core Principles

### Immutability

Derived data cannot affect input data. This is essential for reproducibility. All data, once produced, should be treated as “read only”. Derived processes cannot change input data. This means no appending information to input files, and no adding files to existing directories. 

### Acquisition sessions first

The fundamental logical unit for primary data is the acquisition session (time).  

There are many ways to logically group data. We group all data acquired at the same time. This is for two reasons. 

First, it is helpful to logically group data that directly affect each other. The treadmill data stream is tightly coupled to the video capturing the body of the mouse, which naturally affects neural activity. Grouping these simultaneously collected data streams together helps users to understand the data they process and analyze. 

Second, organizing by session (time) facilitates immutable rapid sharing. Were we to share data at the project or dataset level, our ability to share would be dependent on difficult decisions that depend on the project’s intended use of the data. For example, waiting to release data that all meet the quality control criteria defined by a particular project assumes that those criteria apply to all potential uses of the data.

### Flat structure

We avoid using hierarchies to encode metadata. Grouping data into hierarchies via directories – or implied hierarchies with complex ordered file naming conventions - is a common practice to facilitate search. However, any type of hierarchy dramatically impacts how data can be used. Grouping data by project makes it difficult to find data by modality. Grouping data by modality makes it difficult to find data by mouse.  

A flat structure organized by time is unopinionated about what metadata will be most useful. We will instead rely on flexible database queries to facilitate data discovery along any dimension, rather than biasing in favor of one field or another. 

### Processing is a session

Processing sessions are analogous to primary data acquisition sessions.  Processed data files should therefore be logically grouped together, separate from primary data. Timestamping processed results allows us to flexibly reprocess without affecting primary data. The generic term we use to describe acquisition sessions and processing sessions is the data asset.  

We could consider separate data assets for different processing pipeline steps (e.g. one asset for stitching transforms, one asset for fused results, one asset for segmented neurons, etc). However, at this point that seems like unnecessary complexity. 

### Standard processing, flexible analysis

We define processing as basic feature extraction – spike sorting for electrophysiology, limb positions extracted from behavior videos, cell positions from light microscopy.  

Analysis is taking processed features and using them to answer a scientific question. For physiology, the NWB file is a key marker between processing and analysis. 

We separate data processing and analysis to facilitate flexible use of data. Whereas analytical use of processing features can vary widely, what features will be generally useful is often constrained and well-understood (though they are rarely easy to generate).   

Processing results must be represented in community-standard formats (NWB-Zarr, OME-Zarr). Analysis results can also be captured in standard formats, when applicable, and internally consistent formats when standards don’t exist. 

[TODO: Missing image]

## Primary data conventions

All data acquired in a single acquisition session will be stored together. This group needs a name, but it must be as simple as possible. It is critical that this name be unique, but we should not use this name to encode essential metadata.  

All primary data assets have the following naming convention: 

“<subject-id>_<acquisition-start-datetime>” 

A few points: 

- <acquisition-datetime>: yyyymmddTtz, at start of acquisition,. 
- Acquisition datetime is essential for uniqueness.  
- Acquisition datetime is in the local time zone. 
- Time-zone is documented in metadata files 
- All tokens (e.g. <subject-id>) must not contain underscores or illegal filename characters. Subject ID is not strictly necessary – only the timestamp is essential. However, it is part of the current naming convention because it helps people visually browse for data.

Primary data assets are organized as follows: 

- <asset name, as above>  
  - data_description.json (administrative information, funders, licenses, projects, etc) 
  - subject.json (species, sex, DOB, unique identifier, genotype, etc) 
  - procedures.json (subject surgeries, tissue preparation, water restriction, training protocols, etc) 
  - instrument.json (static hardware components) 
  - acquisition.json (device settings that change acquisition-to-acquisition) 
  - <modality-1>  
    - <list of data files>  
  - <modality-2>  
    - <list of data files> 
  - <modality-n> 
    - <list of data files> 
  - derivatives (processed data generated during acquisition) 
    - <label> (e.g. MIP) 
      - <list of files> 
  - logs (log files generated by the instrument or rig) 
    - <list of files> 

Modality terms come from controlled vocabularies in aind-data-schema-models.

### Examples

Example for simultaneous electrophysiology with optotagging and FIP:

```
📦655568_2022-04-26_11-48-09
 ┣ 📜<metadata JSON files>
 ┣ 📂FIB
 ┃ ┣ 📜L415_2022-04-26T11_48_09.csv
 ┃ ┣ 📜L470_2022-04-26T11_48_09.csv
 ┃ ┣ 📜L560_2022-04-26T11_48_09.3024512-07_00
 ┃ ┣ 📜Raw2022-04-26T11_48_09.csv
 ┃ ┣ 📜TTL_2022-04-26T11_48_08.1780864-07_00
 ┃ ┣ 📜TTL_TS2022-04-26T11_48_08.csv
 ┃ ┗ 📜TimeStamp_2022-04-26T11_48_08.csv
 ┣ 📂ecephys
 ┃ ┣ 📜220426114809_655568.opto.csv
 ┃ ┗ 📂Record Node 104
 ┃ ┃ ┗ ...
 ┗ 📂behavior-videos
 ┃ ┣ 📜face_camera.mp4
 ┃ ┗ 📜body_camera.mp4
```

Example for exaSPIM data:

```
📦655568_2022-04-26_11-48-09
 ┣ 📜<metadata JSON files>
 ┣ 📂SPIM
 ┃ ┗ 📜SPIM.ome.zarr
 ┗ 📂derivatives
 ┃ ┗ 📂MIP
 ┃ ┃ ┗ 📜<list of e.g. tiff files>
```