# Data governance (policy)

Primary data are precious - especially manually generated data annotations and recordings of unique specimens. Such data must be treated with care and respect. This document describes how primary data should be handled to: 

- Minimize unintended changes 
- Avoid unnecessary costs for storage and compute 
- Maintain agility 

Teams requiring exceptions to any of the policies below should make their requests via email to the AIND Leadership Team.

## Raw data must be compressed

Compression should be performed immediately after acquisition and prior to cloud upload. Compression algorithms should be as aggressive as possible:

- lossless at minimum, preferably lossy
- without compromising downstream analysis


We will migrate to lossy compression when feature extraction and evaluation algorithms are stable. Teams must plan for dedicated time and resources to investigate the effects of lossy compression.  

## Code that can modify primary data must be reviewed and tested

This includes primary data on-premise and cloud storage as well as metadata in Sharepoint, Smartsheet, Power Platform, or other databases. Reviewers must be familiar with the data and capable of reviewing the code. Testing must be done in a safe environment on example data.   

Best practice is to review scripts that can potentially modify data in a GitHub repository pull request that must be reviewed prior to use. See Scientific Computing’s [aind-data-migration-scripts](https://github.com/AllenNeuralDynamics/aind-data-migration-scripts) repository and the Code Review section here: Software Engineering Practices.docx. 

To test scripts, create folders in a separate location with a copy of the data you would like to update and run your script there. Good practices include:

- dry runs that log intended changes without making changes
- limited runs that only affect one test data asset before full runs
- test runs that write to an alternative "scratch" location


## Users who modify primary data must only use write permissions when needed

Users who log into services that control primary data (e.g. VAST, AWS, Power Platform) should log in with read-only permissions unless write permissions are needed for the task at hand.  Systems must have accounts configured in such a way that this is possible (e.g. individual read-only accounts and a single write-enabled account). 

This includes acquisition workstations. Accounts that have permission to acquire and potentially change primary data should only be used for that purpose. At all other times read-only user accounts should be used. 

##     Derived results should not be written to the same folder as primary data

This minimizes the chances of accidentally overwriting primary data due to e.g. spelling mistakes. The only exception to this is when derived results are computed as part of the acquisition process (e.g. the ExaSPIM acquisition software also saves maximum intensity projections of tiles). 
