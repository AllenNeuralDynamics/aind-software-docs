# Data governance (policy)

Primary data are precious - especially manually generated data annotations and recordings of unique specimens. Such data must be treated carefully and respectfully. This document describes how primary data should be handled to: 

- Minimize unintended changes 
- Avoid unnecessary costs for storage and compute 
- Maintain agility 

Teams requiring exceptions to any of the policies below should make their requests via email to the AIND Leadership Team.

## Raw data must be compressed

Compression should be performed immediately after acquisition and prior to cloud upload. Compression algorithms should be as aggressive as possible - lossless at minimum, preferably lossy – without compromising downstream analysis. We will migrate to lossy compression when feature extraction and evaluation algorithms are stable. Teams must plan for dedicated time and resources to investigate the effects of lossy compression.  

## Code that can modify primary data must be reviewed and tested

This includes primary data on-premise and cloud storage as well as metadata in SLIMS or other databases. Reviewers must be familiar with the data and capable of reviewing the code. Testing must be done in a safe environment on example data.   

Best practice is to review scripts that can potentially modify data in a GitHub repository pull request that must be reviewed prior to use. See Scientific Computing’s [aind-data-migration-scripts](https://github.com/AllenNeuralDynamics/aind-data-migration-scripts) repository and the Code Review section here: Software Engineering Practices.docx. 

To test scripts, create folders in a separate location with a copy of the data you would like to update and run your script there. Good practices include: 

- dry runs that log intended changes without making changes 
- limited runs that only affect one test data asset before full runs 
- test runs that write to an alternative “scratch” location 

##     Users who modify primary data must only use write permissions when needed

Users who log into services that control primary data (e.g. VAST, AWS, SLIMS) should log in with read-only permissions unless write permissions are needed for the task at hand.  Systems must have accounts configured in such a way that this is possible (e.g. individual read-only accounts and a single write-enabled account). 

This includes acquisition workstations. Accounts that have permission to acquire and potentially change primary data should only be used for that purpose. At all other times read-only user accounts should be used. 

##     Derived results should not be written to the same folder as primary data

This minimizes the chances of accidentally overwriting primary data due to e.g. spelling mistakes. The only exception to this is when derived results are computed as part of the acquisition process (e.g. the ExaSPIM acquisition software also saves maximum intensity projections of tiles). 

##     On-premise systems should not be used for persistent, long-term data storage. 

AIND’s high-performance on-premise storage system (VAST) is sized to be a ~2-week transfer buffer that enables low-level computing (e.g. compression, format conversion) and rapid transfer to cloud storage systems. Any data stored in on-premise scratch space for more than two weeks is subject to requests for deletion at any time. 

The VAST system has two partitions: 

1. Stage (1600TB): an access-controlled buffer for raw data compression and upload. No individual user accounts will have write-access to this partition – only service accounts on acquisition workstations. The stage partition has daily snapshots that expire after 3 days. `\\allen\aind\stage` (windows) `/allen/aind/stage` (linux) 
2. Scratch (200TB): an uncontrolled space for all AIND team members to use. This share can be read and modified by any account. Data stored here is considered transient, not intended for public sharing, and subject to requests for deletion. Recommended scratch share organization is to have top level directories for each AIND group (ephys, ophys, etc), then subfolders for individual users. The scratch partition has daily snapshots that expire after 2 weeks. `\\allen\aind\scratch` (windows) `/allen/aind/stage` (linux) 

Open a ServiceNow ticket to restore data from a snapshot.

##     Raw data can only be uploaded to cloud using the Data Transfer Service. 

When manually uploading data to cloud buckets, it is easy to make mistakes that can affect others’ data. The data transfer service is designed to automatically organize data and metadata consistently and prevent accidentally overwriting data.  

Cloud storage is organized as follows: 

    aind-private-data: a read-only private S3 bucket organized by session 

    aind-open-data: a read-only public S3 bucket organized by session 

    aind-scratch-data: a private S3 bucket that is writable by all AIND staff  

Because it is easy to delete large amounts of data on accident, very few AIND users have the ability to modify or delete data in aind-open-data and aind-private-data. If errors are detected in data in those buckets, contact Scientific Computing. Mitigate errors by testing upload jobs on aind-scratch-data. 

aind-open-data and aind-private-data are organized according to [Data Organization Conventions](<data_organization>). These conventions enable us to have consistently organized data that can be shared rapidly and openly. The Data Transfer Service organizes data according to these conventions as it uploads data. 