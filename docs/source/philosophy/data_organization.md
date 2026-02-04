# Data organization (policy)

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

`<subject-id>_<acquisition-start-datetime>`

A few points: 

- Format `<acquisition-start-datetime>: yyyymmdd_HH-MM-SS`
- This should be the start of acquisition, in the local time zone.
- The local time-zone is documented in metadata files
- All tokens (e.g. `<subject-id>`) must not contain underscores or illegal filename characters. Subject ID is not strictly necessary – only the timestamp is essential. However, it is part of the current naming convention because it helps people visually browse for data.

Primary data assets are organized as follows: 

```
📦<asset name, as above>
 ┣ 📜data_description.json (administrative information, funders, licenses, projects, etc)
 ┣ 📜subject.json (species, sex, DOB, unique identifier, genotype, etc)
 ┣ 📜procedures.json (subject surgeries, tissue preparation, water restriction, training protocols, etc)
 ┣ 📜instrument.json (static hardware components)
 ┣ 📜acquisition.json (device settings that change acquisition-to-acquisition)
 ┣ 📂<modality-1>
 ┃ ┗ 📜<list of data files>
 ┣ 📂<modality-2>
 ┃ ┗ 📜<list of data files>
 ┣ 📂<modality-n>
 ┃ ┗ 📜<list of data files>
 ┣ 📂derivatives (processed data generated during acquisition)
 ┃ ┗ 📂<label> (e.g. MIP)
 ┃ ┃ ┗ 📜<list of files>
 ┗ 📂logs (log files generated by the instrument or rig)
 ┃ ┗ 📜<list of files>
```

Modality terms come from controlled vocabularies in aind-data-schema-models.

### Examples

Example for simultaneous electrophysiology with optotagging and FIP:

```
📦655568_2022-04-26_11-48-09
 ┣ 📜<metadata JSON files>
 ┣ 📂FIB
 ┃ ┣ 📜L415_2022-04-26_11-48-09.csv
 ┃ ┣ 📜L470_2022-04-26_11-48-09.csv
 ┃ ┣ 📜L560_2022-04-26_11-48-09.3024512
 ┃ ┣ 📜Raw2022-04-26_11-48-09.csv
 ┃ ┣ 📜TTL_2022-04-26_11-48-08.1780864
 ┃ ┣ 📜TTL_TS2022-04-26_11-48-08.csv
 ┃ ┗ 📜TimeStamp_2022-04-26_11-48-08.csv
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

## Derived data conventions

Anything computed in a single run should be logically grouped in a folder. The folder should be named: 

`<primary-asset-name>_<process-label>_<process-date>_<process-time>`

Examples: 

- ANM457202_2022-07-11_22-11-32_processed_2022-08-11_22-11-32 
- 595262_2022-02-21_15-18-07_processed_2022-08-11_22-11-32 

Processed outputs are usually the result of a multi-stage pipeline handling a single data modality. Utilize a modality-specific `<process-label>`. Other common process labels include: 

- “curation” - tags assigned to input data (e.g. merge/split/noise calls for ephys units) 
- ... 

Overlong names are difficult to read, so do not daisy-chain. The goal is to keep names as simple as possible while being readable, not to encode all metadata or the entire provenance chain. If various stages of processing are being performed manually over extended periods of time, anchor each derived asset on the primary data asset. 

Folder organization is as follows: 

```
📦<asset name, as above>
 ┣ 📜data_description.json
 ┣ 📜processing.json (describes the code, input parameters, outputs)
 ┣ 📜subject.json (copied from primary asset)
 ┣ 📜procedures.json (copied from primary asset)
 ┣ 📜instrument.json (copied from primary asset)
 ┣ 📜acquisition.json (copied from primary asset)
 ┣ 📂<process-label-1>
 ┃ ┗ 📜<list of files>
 ┣ 📂<process-label-2>
 ┃ ┗ 📜<list of files>
 ┗ 📂<process-label-n>
 ┃ ┗ 📜<list of files>
``` 

## File name guidelines

When naming files, we should: 

- use terms from vocabularies defined in aind-data-schema, e.g. 
  - modalities, institutions 
  - behavior video file names 
- use "yyyy-mm-dd" and "HH-MM-SS" in local time zone for dates and times 
- separate tokens with underscores, and do not include underscores in tokens, e.g. 
  - Do this: EFIP_655568_2022-04-26_11-48-09 
- Do not include illegal filename characters in tokens

## NWB file naming conventions

NWB files are saved out as `Zarr` files according to the standard defined in [aind-file-standards](https://github.com/AllenNeuralDynamics/aind-file-standards/blob/main/docs/file_formats/nwb.md). NWB files are saved as a processed output for each modality acquired during the acquisition session. Within the derived asset, NWB files should be named `<modality>.nwb.zarr` at the root level of the derived asset along with the core aind-data-schema metadata files.

When NWB files are combined together, post QC validation, they will be saved as a new derived data asset with merged, core aind-data-schema metadata files. The NWB file will will be saved at the root directory of the derived asset along with the metadata and will be named `<primary-session-name>.nwb.zarr`.

## AIND Implementation

### On-premise systems should not be used for persistent, long-term data storage. 

AIND’s high-performance on-premise storage system (VAST) is sized to be a ~2-week transfer buffer that enables low-level computing (e.g. compression, format conversion) and rapid transfer to cloud storage systems. Any data stored in on-premise scratch space for more than two weeks is subject to requests for deletion at any time. 

The VAST system has two partitions: 

1. Stage (1600TB): an access-controlled buffer for raw data compression and upload. No individual user accounts will have write-access to this partition – only service accounts on acquisition workstations. The stage partition has daily snapshots that expire after 3 days. `\\allen\aind\stage` (windows) `/allen/aind/stage` (linux) 
2. Scratch (200TB): an uncontrolled space for all AIND team members to use. This share can be read and modified by any account. Data stored here is considered transient, not intended for public sharing, and subject to requests for deletion. Recommended scratch share organization is to have top level directories for each AIND group (ephys, ophys, etc), then subfolders for individual users. The scratch partition has daily snapshots that expire after 2 weeks. `\\allen\aind\scratch` (windows) `/allen/aind/scratch` (linux) 

Open a ServiceNow ticket to restore data from a snapshot.

### Raw data can only be uploaded to cloud using the Data Transfer Service. 

When manually uploading data to cloud buckets, it is easy to make mistakes that can affect others’ data. The data transfer service is designed to automatically organize data and metadata consistently and prevent accidentally overwriting data.  

Cloud storage is organized as follows: 

    aind-private-data: a read-only private S3 bucket organized by session 

    aind-open-data: a read-only public S3 bucket organized by session 

    aind-scratch-data: a private S3 bucket that is writable by all AIND staff  

Because it is easy to delete large amounts of data on accident, very few AIND users have the ability to modify or delete data in aind-open-data and aind-private-data. If errors are detected in data in those buckets, contact Scientific Computing. Mitigate errors by testing upload jobs on aind-scratch-data. 

aind-open-data and aind-private-data are organized according to [Data Organization Conventions](<data_organization>). These conventions enable us to have consistently organized data that can be shared rapidly and openly. The Data Transfer Service organizes data according to these conventions as it uploads data. 

## Human-in-the-loop Processing Pipelines

During preliminary phases of processing pipeline development, it is common to defer downstream processing until upstream processing has been manually validated. This is particularly important for pipelines involving expensive processing steps that are sensitive to the quality of upstream results.  

Pipelines that involve human interventions can be treated as regular (if slow-moving) pipelines. As researchers inspect and validate individual processing steps, they construct a processed data asset incrementally, one subfolder at a time.  

Guidelines for constructing a processed data asset with a human in the loop: 

1. It is okay to overwrite the results of the current processing step in-place. 
2. Always document provenance via an intermediate processing.json within the process subfolder 
3. Do not revisit previous processing steps. If necessary, delete the asset and start a new one. 
4. Once complete, generate integrated top-level JSON metadata (processing.json, quality_control.json) 

## FAQ

**My data files already contain some of this metadata. Why store this in additional JSON files?** 

How acquisition formats represent metadata evolves over time and often does not capture everything we need to know to interpret data. These JSON files represent our ground truth viewpoint on what is essential to know about our data in a single location. 

Additionally, JSON files are trivially both human- and machine-readable. They are viewable on any system without additional software to be installed (a text editor is fine). They are easy to parse from code without any heavy dependencies (IGOR, H5PY, pynwb, etc).  

**What are "Institution" and "Group" doing in data_description.json?** 

In the future we may need to tag cloud resources based on the originating group, which may or may not be in AIND, in order to track usage and spending.

**Why are we replicating metadata that we are also tracking in PowerPlatform/LIMS/SLIMS/etc?** 

Database systems such as these are very important for reliable acquisition, however they are also barriers to external interpretability and reproducibility. They have complex schema with extraneous information that make them difficult to interpret. They have query languages (e.g. SQL) that require training to use properly. Information becomes distributed across different locations. They may have security policies that make them difficult to share with the public.  

Files, particularly in cloud storage, are reliable and more persistent. By storing metadata essential to interpreting an acquisition session alongside the acquisition in a human-and-machine-readable format, there will always be an interpretable record of what happened even if e.g. the database stops working. 

**What happened to the "experiment type" and "platform" asset labels?**

Formerly we used a short label called “experiment type” in asset names.This concept was confusing because it was difficult to distinguish from a “modality”. Then we switched to “platform” and introduced a controlled vocabulary, but people did not understand the term and so defaulted to a “primary modality,” which was not helpful. Most of our data contains multiple modalities. A recording session may contain trained behavior event data (e.g. lick times), behavior videos (e.g. face camera), neuropixels recordings, and fiber photometry recordings.  