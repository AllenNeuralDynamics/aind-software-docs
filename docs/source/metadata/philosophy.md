# Data Organization

## Core principles

### Immutability

Derived data cannot affect input data. This is essential for reproducibility. All data, once produced, should be treated as “read only”. Derived processes cannot change input data. This means no appending information to input files, and no adding files to existing directories.

### Acquisition sessions first

The fundamental logical unit for primary data is the acquisition session (time).

There are many ways to logically group data. We group all data acquired at the same time. This is for two reasons:

First, it is helpful to logically group data that directly affect each other. The treadmill data stream is tightly coupled to the video capturing the body of the mouse, which naturally affects neural activity. Grouping these simultaneously collected data streams together helps users to understand the data they process and analyze.

Second, organizing by session (time) facilitates immutable rapid sharing. Were we to share data at the project or dataset level, our ability to share would be dependent on difficult decisions that depend on the project’s intended use of the data. For example, waiting to release data that all meet the quality control criteria defined by a particular project assumes that those criteria apply to all potential uses of the data.

### Flat structure

We avoid using hierarchies to encode metadata. Grouping data into hierarchies via directories - or implied hierarchies with complex ordered file naming conventions - is a common practice to facilitate search. However, any type of hierarchy dramatically impacts how data can be used. Grouping data by project makes it difficult to find data by modality. Grouping data by modality makes it difficult to find data by mouse.

A flat structure organized by time is unopinionated about what metadata will be most useful. We will instead rely on flexible database queries to facilitate data discovery along any dimension, rather than biasing in favor of one field or another.

### Processing is a session

Processing sessions are analogous to primary data acquisition sessions. Processed data files should therefore be logically grouped together, separate from primary data. Timestamping processed results allows us to flexibly reprocess without affecting primary data. The generic term we use to describe acquisition sessions and processing sessions is the data asset.

We could consider separate data assets for different processing pipeline steps (e.g. one asset for stitching transforms, one asset for fused results, one asset for segmented neurons, etc). However, at this point that seems like unnecessary complexity.

### Standard processing, flexible analysis

We define processing as basic feature extraction - spike sorting for electrophysiology, limb positions extracted from behavior videos, cell positions from light microscopy.

Analysis is taking processed features and using them to answer a scientific question. For physiology, the NWB file is a key marker between processing and analysis.

We separate data processing and analysis to facilitate flexible use of data. Whereas analytical use of processing features can vary widely, what features will be generally useful is often constrained and well-understood (though they are rarely easy to generate).

Processing results must be represented in community-standard formats (NWB-Zarr, OME-Zarr). Analysis results can also be captured in standard formats, when applicable, and internally consistent formats when standards don’t exist.