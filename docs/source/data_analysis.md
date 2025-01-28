# Data Analysis in Code Ocean

## Querying DocDB for Data Assets

We've set up a package `aind-data-access-api` for easy access to DocDB. This is a public API, you don't need credentials to query your metadata.

Below is an example Python script showing how a typical project might query for data assets using the `data_description.project_name`, `subject.subject_id`, and `session.session_type`:

```
from aind_data_access_api.document_db import MetadataDbClient

API_GATEWAY_HOST = "api.allenneuraldynamics.org"
DATABASE = "metadata_index"
COLLECTION = "data_assets"

docdb_api_client = MetadataDbClient(
   host=API_GATEWAY_HOST,
   database=DATABASE,
   collection=COLLECTION,
)

filter = {
    "data_description.project_name": "Behavior Platform",
    "subject.subject_id": "744899",
    "session.session_type": "Uncoupled Baiting",
}
response = docdb_api_client.retrieve_docdb_records(
   filter_query=filter,
)
print(response)
```

For more details, dig into the [DocDB API documentation](https://aind-data-access-api.readthedocs.io/en/latest/)

## Running an Analysis

More details on the *analysis architecture* will come soon.

## Creating Derived Assets

After your analysis is complete, you need to package your data into a new data asset and ensure that it gets picked up by the indexer. There are a few steps to this:

1. Copy all metadata files from the input data asset to your `results/` folder
2. Upgrade the existing `data_description.json` to its derived format, using the [`DerivedDataDescription.from_data_description`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/c1ae7aa6052080fdf4b6de07cdad32210eea12b5/src/aind_data_schema/core/data_description.py#L196) function. Make sure to pass the `process_name` field.

```
import json
from aind_data_schema.core.data_description import DataDescription, DerivedDataDescription

dd = DataDescription.model_validate_json(json.load("data_description.json"))
dd_derived = DerivedDataDescription.from_data_description(dd, process_name="your-process")
```

3. Use the new `data_description.name` field as your data asset name
4. Tag your data asset with the `derived` tag.
5. Publish the data asset.

All of these steps can be automated with code, but you can also do them manually after running a capsule for testing.

### Test Assets

If you generate a test asset that you won't need, please **archive** the asset when you're done testing. Once archived, if the asset remains unused for a month it will be deleted.