# Find data

Each raw asset uploaded from a platform at AIND produces a group of derived assets, one per modality. You can find these assets easily by performing a query on our metadata database using your project name and other fields unique to your project. **All analyses at AIND should begin with a query that returns a group of data assets, filtered by passing quality control**.

Some fields that are commonly used to filter assets:

- `data_description.project_name`
- `data_description.data_level`
- `data_description.modalities.abbreviation`
- `subject.subject_id`
- `acquisition.acquisition_start_time`
- `quality_control.status` and `quality_control.metrics.status_history`

## Query DocDB

DocDB queries are dictionaries (key-value pairs) that return a set of data assets. Analysis pipelines are required to use a query as the first step in gathering data for analysis **and** to filter assets according to passing quality control criteria. We recommend using the MCP server to gain familiarity with the patterns used for creating queries. 

### AI (MCP Server)

The [`aind-metadata-mcp`](https://github.com/allenNeuralDynamics/aind-metadata-mcp) (for V1 metadata) and [`aind-data-mcp`](https://github.com/allenNeuralDynamics/aind-data-mcp) (for V2 metadata) make it easy to generate queries for your data assets without knowing the exact structure of the metadata. Install the MCP server by following the instructions for that package or by using the pre-built environment in Code Ocean (`code-server python extensions pack`). You can then ask an AI agent that has access to the MCP server tools to run test queries and write a Python script for your query. The resulting script will use a mixture of the cache query system or full access, depending on what fields you need access to.

### Fast queries through the cache

Metadata queries to the database can be very slow. The [`zombie-squirrel`](https://github.com/AllenNeuralDynamics/zombie-squirrel/) package exposes a cache of some fields in the V2 metadata making them available with much lower latency. The metadata cache is updated at midnight, do not use it if you need immediate access to assets.

For example, here is a query to find the latest derived assets with behavior NWB files from the VR foraging project:

```python
from zombie_squirrel import asset_basics, raw_to_derived, qc

asset_metadata = asset_basics()

# Query #1: VR foraging latest derived behavior assets
raw_assets = asset_metadata[
    (asset_metadata["project_name"] == "Cognitive flexibility in patch foraging") &
    (asset_metadata["data_level"] == "raw")
]
# Modalities is a comma-separated list, filter for "behavior"
raw_assets = raw_assets[raw_assets["modalities"].str.contains("behavior")]
# Get latest derived versions of these behavior raw assets
derived_asset_names = raw_to_derived(raw_assets["name"].tolist(), latest=True)
```

And then a second level to filter by passing QC for a few metrics:

```python
# Query #2: Same restrictions but passing QC
qc_metric_names = ["Running Velocity", "General Performance"]
derived_assets = asset_metadata[asset_metadata["name"].isin(derived_asset_names)]
passing_qc_asset_names = []
for subject_id, subject_assets in derived_assets.groupby("subject_id"):
    qc_df = qc(subject_id=subject_id)
    if qc_df.empty or "status" not in qc_df.columns:
        continue
    for _, row in subject_assets.iterrows():
        passing = qc_df[
            (qc_df["asset_name"] == row["name"]) &
            (qc_df["name"].isin(qc_metric_names)) &
            (qc_df["modality"] == "behavior") &
            (qc_df["status"] == "Pass")
        ]
        if passing["name"].nunique() == len(qc_metric_names):
            passing_qc_asset_names.append(row["name"])
```

### Full access to all metadata fields through the database 

The `aind-data-access-api` package is used to read metadata records from DocDB. There is one record in DocDB for each data asset. There are two kinds of DocDB queries: filter queries are a flat dictionary which look for records that match certain field:value pairs, while aggregation pipelines can perform multiple steps. Use the `version="v1"` or `version="v2"` parameter to control whether you are accessing the V1 or V2 metadata; reach out to scientific computing if you aren't sure which metadata you should be using.

A simple example to get all derived assets with behavior NWB files from the VR foraging project:

```python
from aind_data_access_api.document_db import MetadataDbClient

client = MetadataDbClient(
    host="api.allenneuraldynamics.org",
    version="v1",
)

query = {
    "data_description.project_name": "Cognitive flexibility in patch foraging",
    "data_description.data_level": "derived",
    "data_description.modalitities.abbreviation": "behavior",
}
records = client.retrieve_docdb_records(
    filter_query=query
)
```

More details about DocDB queries can be found in the [aind-data-access-api#querying-metadata documentation](https://aind-data-access-api.readthedocs.io/en/latest/ExamplesDocDBRestApi.html#querying-metadata)

## Dashboards

We are expanding the number of platform and project dashboards based on V2 metadata over time. We currently host:

- [data portal](https://data.allenneuraldynamics.org/assets) is a tool for finding and exploring data assets. Currently, you can search all assets that have V2 metadata and easily click links to go to the Code Ocean data asset, metadata, and QC report.
- [smartspim dashboard](https://data.allenneuraldynamics-test.org/smartspim)
