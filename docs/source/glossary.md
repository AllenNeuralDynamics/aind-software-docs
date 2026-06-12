# Glossary

{.glossary}
scientist-derived data
: derived data created by a scientist directly, 
rather than as output of an established processing pipeline.
A typical example is an intermediate analysis result saved as input for downstream analysis.

{.glossary}
primary data
: the least processed permanent data asset from a given data acquisition - 
in most cases this is the raw data asset, but in some cases the raw data is deleted
and a minimally-processed (compression or format conversion only) derived data is preserved as primary data.
(In many cases "raw data" is used as a synonym for "primary data", 
even when the data is not strictly raw.)

{.glossary}
derived data
: data that is a result of processing or analysis applied to one or many data inputs

{.glossary}
non-registry data
: data that has been published by a source outside of AIND, 
which we are hosting a copy of in our registry/bucket for ease of access and reproducibility.

{.glossary}
released data
: data in a public s3 bucket (with complete metadata).
This is generally represented in Code Ocean as an external data asset in a public collection,
and is also accessible through the AWS open data registry.

{.glossary}
internal data asset
: a Code Ocean data asset stored internally in the Code Ocean cloud storage
(in a private s3 bucket optimized for fast access from computations, 
not intended for direct access). 
[CO docs](https://docs.codeocean.com/user-guide/data-assets-guide/types-of-data-assets#internal-data)

{.glossary}
external data asset
: a Code Ocean data asset linking to data on AWS s3 (public or private buckets) or other cloud storage.
[CO docs](https://docs.codeocean.com/user-guide/data-assets-guide/types-of-data-assets#external-data-a-remote-link)

{.glossary}
result data asset
: a Code Ocean data asset saved as the result of a Code Ocean computation.
Provenance information is automatically added, 
which can be used to generate more complete processing metadata.
[CO docs](https://docs.codeocean.com/user-guide/data-assets-guide/types-of-data-assets#results)

{.glossary}
combined data asset
: a Code Ocean data asset that links together multiple data assets.
Currently these are restricted to external data assets only for technical reasons.
[CO docs](https://docs.codeocean.com/user-guide/data-assets-guide/types-of-data-assets#combined-data)

