# Adding metadata for scientist-derived data

In the process of running analysis on Code Ocean, users often end up saving derived data to track additional analysis inputs beyond the main experimental data assets - we call this {term}`scientist-derived data`.
This data is typically one of two types: outputs of a prior analysis step or {term}`non-AIND data` that have been imported for comparison or integration.


## Storage locations
For scientist-derived data that is relatively stable (won't be replace often),
store the data as an {term}`internal data asset`. 
This lets it be shared easily across capsules and users, 
and the immutability helps ensure reproducible results. 

If the data comes from early-stage analysis and requires significant iteration,
it makes sense to start by using the capsule filesystem instead[^1].
Be sure to organize your data in subfolders that will eventually become data assets.

[^1]: The `scratch` folder is generally preferred, but will not be available to a Reproducible Run; 
`data` or other directories use limited capsule storage space and must be explicitly added to the .gitignore file, but will be available to a Reproducible Run.

If you need to iterate often and also share across capsules,
external data assets using `aind-scratch-data` may be a solution - discuss with a SciComp team member.[^2]
[^2]: Mutable data assets will be supported by Code Ocean as a better solution in the future.

## Adding metadata

If scientist-derived data contributes to published results, 
it must be transferred to the open data bucket with complete metadata prior to publication
([publication standards](../policies_practices/publication_standards.md)).

This consists of the following steps:

- 1.  copy or create the data into a capsule folder
- 2.  add metadata files (more detail below)
- 3.  create a data asset from the Code Ocean UI or API
- 4.  file an issue to request transfer of the asset to aind-open-data.
  
Steps 1-3 can be scripted end-to-end within a Code Ocean capsule copied from the [metadata template capsule](https://codeocean.com/capsule/1234567/tree), 
or scripts to add metadata can be added to an existing analysis capsule based on the snippets below.


## Metadata for intermediate results

For {term}`derived data` originating from AIND processing or analysis, 
both data description and processing metadata are required.
This metadata is saved automatically by established processing pipelines, 
but must be added explicitly to scientist-derived data.

The best practice is to add the metadata whenever a data asset is saved, 
and we are working on tools to automate this for Code Ocean {term}`result data asset`s.
Until these tools are available, it is generally simplest to add this metadata after most iteration on the asset is complete: when sharing the asset with others, or prior to publication at the latest.

### Processing

Create Code objects for each component process:
```python
import aind_data_schema.core.processing as ps
code_details = ps.Code(
    name="Capsule or Pipeline name"
    url="https://github.com/abcd",
    version="1.0",
    # commit_hash="89abcdef0123456789abcdef0123456789abcdef01",
    parameters={"size": 7},
    input_data=[
        ps.DataAsset(name="data-asset-name"), 
        ps.DataAsset(url="data-asset-url"),
        ]
)
```
- name is optional except pipelines (pipeline components refer to it)
- a github url is preferred, but a release capsule url will also work
- specify either commit_hash or version (github or CO release)
- include parameters if they are passed to the code at runtime
(no need to if they are hard-coded)
- list all input data assets by name (preferred) or url

Then create a Processing object containing one or more DataProcess records:
```python
my_processing = ps.Processing(
    # pipelines=[pipeline_code_details]
    data_processes=[
        ps.DataProcess(
            stage=ps.ProcessStage.ANALYSIS,
            process_type=ps.ProcessName.ANALYSIS,
            name="my_custom_analysis",
            experimenters=["Analysis Owner"],
            start_date_time="2022-11-22T08:43",
            end_date_time="2022-11-22T08:53",
            output_path="path/to/outputs",
            code=code_details,
            # pipeline_name="Pipeline Name"
            notes="Explain any manual steps here, and any additional notes"
        ),
    ],
)
```
- `stage` is used to indicate processing or analysis
- `process_type` points to a defined list of well-known operations; 
use one of these if appropriate, otherwise ANALYSIS or OTHER
- `name` is duplicated from `process_type` if left blank, 
must be explicitly specified if process type is ANALYSIS or OTHER
- `experimenters` are those responsible for running the processing/analysis
- record exact start/end times if possible, otherwise a single approximate run date is fine
(ISO format string or datetime objects work; 
if timezone isn't specified, the timezone of the computer running the script is used)
- specify an output path (relative to /results)^[*] if multiple DataProcesses are writing to a single asset 
(no need to specify "/results" or "./")

### Data Description 

The data description for derived data records the origin and organizational context 
*of the data processing or analysis*, not the original experiment.

```python
from datetime import datetime
import aind_data_schema.core.data_description as ds

creation_time = datetime.now()
base_name = "primary-data-asset-name"
# base_name = "multi-input-analysis-name"
name = ds.build_data_name(base_name, creation_time)
my_dd = ds.DataDescription(
    name=name,
    source_data=["data-asset-name-1","data-asset-name-2"],
    creation_time=creation_time,
    institution=ds.Organization.AIND,
    data_level=ds.DataLevel.DERIVED,
    investigators=[ds.Person(name="Analysis Owner")],
    project_name="Analysis Project Name",
    modalities=[ds.Modality.MRI, ds.Modality.SPIM],
    license=ds.License.CC_BY_40,
    funding_source=[
        ds.Funding(funder=ds.Organization.NIMH, grant_number="RF1..."),
    ],
    data_summary="Analysis of data from... for ..."
)
```
- When there is a single primary data asset input, the name should be derived from that asset's name.
- For analysis that aggregates multiple inputs, the name should be descriptive of the combined result.

### Putting it all together

#### Single-input results
If the intermediate result is derived from a single AIND primary data asset, 
the rest of the experimental metadata should be "inherited" from that asset.
This base metadata can be loaded from the metadata database (preferred) or from json files within the asset.

```python
import aind_data_schema.core.data_description as ds
from aind_data_schema.core.metadata import Metadata
from aind_data_access_api.document_db import MetadataDbClient
docdb_api_client = MetadataDbClient(
    host="api.allenneuraldynamics.org",
    version="v2",
)
base_json = docdb_api_client.retrieve_docdb_records(
    filter_query=dict(name="full_asset_name"),
)
base_md = Metadata.model_validate(base_json)
new_md = base_md.model_copy(update=dict(
    data_description=my_dd,
    processing=base_md.processing + my_processing
))
output_path = "/results"
new_md.data_description.write_standard_file(output_path)
new_md.processing.write_standard_file(output_path)
new_md.procedures.write_standard_file(output_path)
new_md.instrument.write_standard_file(output_path)
new_md.acquisition.write_standard_file(output_path)
```

If the processing is part of the same project as the input data, 
the base metadata can also be inherited for the data description using the `DataDescription.from_data_description()` function, 
which updates the data level, name, and creation time.

```python
my_dd = ds.DataDescription.from_data_description(
    data_description=base_md.data_description,
    process_name=my_processing.name,
)
```

#### Aggregated results
For results that aggregate many inputs from the same subject, the subject and procedures metadata only should be inherited.

For aggregation across subjects, no metadata should be inherited. 
The new metadata will include the new data description and processing only.

```python
new_md = Metadata(
    data_description=new_dd,
    processing=my_processing,
    # subject=base_md.subject,
    # procedures=base_md.procedures,
)
output_path = "/results"
new_md.data_description.write_standard_file(output_path)
new_md.processing.write_standard_file(output_path)
# new_md.subject.write_standard_file(output_path)
# new_md.procedures.write_standard_file(output_path)
```

## Metadata for non-AIND data

When loading data from external sources for analysis, we typically want to make a stable copy as a data asset.[^3]
[^3]: Exceptions may be stable cloud-native repositories like DANDI where data can be queried and processed directly in the cloud.
To make this a publication-ready data asset, 
we need to add data description metadata documenting its source and other key details.

```python
from datetime import datetime
import aind_data_schema.core.data_description as ds

creation_time = datetime(2024,4,21)
name = ds.build_data_name("KimLab-DevCCF-v1", creation_time)
dd = ds.DataDescription(
        name=name,
        creation_time=creation_time,
        institution=ds.Organization.UPENN,
        data_level=ds.DataLevel.DERIVED,
        investigators=[ds.Person(name="Yongsoo Kim")],
        project_name="external data",
        modalities=[ds.Modality.MRI, ds.Modality.SPIM],
        license=ds.License.CC_BY_40,
        funding_source=[
            ds.Funding(funder=ds.Organization.NIMH, grant_number="RF1MH12460501"),
            ds.Funding(funder=ds.Organization.NINDS, grant_number="R01NS108407"),
            ds.Funding(funder=ds.Organization.NIMH, grant_number="R01MH116176"),
        ],
        data_summary="Downloaded from https://pennstateoffice365-my.sharepoint.com/:f:/g/personal/yuk17_psu_edu/EmCllFDonwtLvDD0xgWd7QYBuzVVvnSv4oKpUy7F9bx75Q?e=RxAmJa on 2025-03-01"
    )
```
- Typically all published external data will be *derived* not *raw* data.
- For `project_name`, use "external data" unless data collection is linked to a specific AIND project (for instance a shared grant)
- For `creation_time`, use the date the data was posted, or a related publication date if that is not available.
- Funding information should be included for sources documented in the manuscript or data repository.
- Document the specific data source in the `data_summary` (URL or API call) and the date accessed.