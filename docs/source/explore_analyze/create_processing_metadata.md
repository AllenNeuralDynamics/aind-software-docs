# Adding metadata for user-created data

In the process of running analysis on Code Ocean, users often end up saving user-created data, additional analysis inputs beyond the main experimental data assets. 
This data is typically one of two types: outputs of a prior analysis step (*intermediate results*) or *external datasets* that have been imported for comparison or integration.


## storage locations
The best practice is to store this data as an internal data asset. 
This lets it be shared easily across capsules and users, and the immutability helps ensure reproducible results. 
If iteratively editing the data is an important part of your workflow, 
external data assets using the aind-scratch-data bucket may be a solution - discuss with a SciComp team member 
(mutable data assets will be supported by Code Ocean as a better solution in the future). 
In early stages of analysis it's typical to store user-created data directly in the capsule filesystem (`scratch` or `data`) - 
this is fine but should be moved to a data asset in the process of adding metadata!

## adding metadata

If user-created data contributes to results in a manuscript, it must be documented with processing metadata and transferred to the open data bucket.
This requires the following general steps, which can in most cases be scripted end-to-end within a Code Ocean capsule - we provide a template *here*.
You can also execute them in your analysis capsule (will require adding additional dependencies) or locally (but make sure to track the scripts you use).

-   copy or create the data into the `results` folder
-   add metadata files (more detail below)
-   create a data asset from the Code Ocean UI or API
-   file an issue to request transfer of the asset to aind-open-data.

## external datasets

When loading data from external sources for analysis, we typically want to make a stable copy as a data asset.
(Exceptions may be stable cloud-native repositories like DANDI where data can be queried and processed directly in the cloud.)
When publishing work based on this data, we need to add metadata documenting its source and other key details 
(a minimal subset of our full data schema). Typically this means creating data description metadata only.

```python
from datetime import datetime
import aind_data_schema.core.data_description as dds

creation_time = datetime(2024,4,21)
name = ds.build_data_name("KimLab-DevCCF-v1", dt)
dd = ds.DataDescription(
        name=name,
        creation_time=creation_time,
        institution=ds.Organization.UPENN,
        data_level=ds.DataLevel.DERIVED,
        investigators=[ds.Person(name="Yongsoo Kim")],
        project_name="DevCCF",
        modalities=[ds.Modality.MRI, ds.Modality.SPIM],
        license=ds.License.CC_BY_40,
        funding_source=[
            ds.Funding(funder=ds.Organization.NIMH, grant_number="RF1MH12460501"),
            ds.Funding(funder=ds.Organization.NINDS, grant_number="R01NS108407"),
            ds.Funding(funder=ds.Organization.NIMH, grant_number="R01MH116176"),
        ],
        data_summary="from https://pennstateoffice365-my.sharepoint.com/:f:/g/personal/yuk17_psu_edu/EmCllFDonwtLvDD0xgWd7QYBuzVVvnSv4oKpUy7F9bx75Q?e=RxAmJa"
    )
```
- Typically all published external data will be *derived* not *raw* data.
(Accommodating raw external data may require data schema adjustments.)
- For `project_name` a shortened version of a related manuscript can be used.
- Use the date the data was posted, or a related publication date if that is not available.
- Funding information should be included for sources documented in the manuscript or data repository.
- Document the specific data source in the `data_summary` (URL or API call)

## intermediate results

For *derived data*, the Processing metadata documents provenance including what the inputs were and what code was executed. 
For derived data that is an output of established processing pipelines, 
this metadata is saved automatically during processing.
When a user creates their own derived data as an intermediate result 
(either early-stage/pre-pipeline processing code or analysis that feeds in to downstream steps), 
this metadata needs to be filled in.

The best practice is to add the metadata whenever a data asset is saved, 
and we are working on tools to automating this for *result data asset*s created from Code Ocean reproducible runs. 
We also support filling in metadata after data asset creation 
since the need to preserve data permanently often isn't obvious when its created 
(re-creating the data with metadata may be preferred in some but not all cases).

### Processing

Create Code objects for each component process:
```python
import aind_data_schema.core.processing as ps
code_details = ps.Code(
    name="Capsule or Pipeline name"
    url="https://github.com/abcd",
    version="1.0",
    # commit_hash="",
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
            stage=ps.ProcessStage.PROCESSING,
            process_type=ps.ProcessName.OTHER,
            name="my_custom_processing",
            experimenters=["Firstname Lastname"],
            start_date_time="2022-11-22T08:43",
            end_date_time="2022-11-22T08:53",
            output_path=["path/to/outputs"],
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
- a descriptive name is required if process type is OTHER, optional otherwise
- record exact start/end times if possible, otherwise a single approximate run data is fine
(ISO format string or datetime objects work; 
if timezone isn't specified, the timezone of the computer running the script is used)
- specify one or more output paths (relative to /results) if multiple DataProcesses are writing to a single asset 
(no need to specify "/results" or "./")

### Data Description

If the intermediate result is derived from AIND data asset(s), the rest of the metadata can be "inherited" from them.
This base metadata can be loaded from the metadata database (preferred) or from json files within the asset.

```python
import aind_data_schema.core.data_description as dds
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
```

For results with a single primary input data asset, all metadata components should be inherited from that asset, updated and saved
```python
new_dd = dds.DataDescription.from_data_description(
    data_description=base_md.data_description,
    process_name=my_processing.name,
)
new_md = base_md.model_copy(update=dict(
    data_description=new_dd,
    processing=base_md.processing + my_processing
))
output_path = "/results"
new_md.data_description.write_standard_file(output_path)
new_md.processing.write_standard_file(output_path)
new_md.procedures.write_standard_file(output_path)
new_md.instrument.write_standard_file(output_path)
new_md.acquisition.write_standard_file(output_path)
```

For results that aggregate many inputs, pick a representative base asset to inherit some details from. 
Update the new data description with the list of source data and a descriptive name for the multi-input result,
and write only the new data description and processing.
```python
new_dd = dds.DataDescription.from_data_description(
    data_description=base_md.data_description,
    process_name=my_processing.name,
    source_data=["data-asset-name-1","data-asset-name-2"]
)
new_dd.name = dds.build_data_name("multi-input-result-name", new_dd.creation_time)
new_md = base_md.model_copy(update=dict(
    data_description=new_dd,
    processing=my_processing
))
output_path = "/results"
new_md.data_description.write_standard_file(output_path)
new_md.processing.write_standard_file(output_path)
```