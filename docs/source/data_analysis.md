# Data Analysis in Code Ocean

## Querying DocDB for Data Assets

We've set up a package `aind-data-access-api` for easy access to DocDB. This is a public API, you don't need credentials to query your metadata.

Below is an example script showing how a typical project might query for a single data asset using the `data_description.project_name`, `subject.subject_id`, `session.session_type`, and `session.session_start_time` to find a specific data asset:

```
[todo]
```

For more details, dig into the [DocDB API documentation](https://aind-data-access-api.readthedocs.io/en/latest/)

## Running an Analysis

## Creating Derived Assets

After your analysis is complete, you need to package your data into a new data asset and ensure that it gets picked up by the indexer. There are a few steps to this:

1. Copy all metadata files from the input data asset to your `results/` folder
2. Upgrade the existing `data_description.json` to its derived format, using the [`DerivedDataDescription.from_data_description`](https://github.com/AllenNeuralDynamics/aind-data-schema/blob/c1ae7aa6052080fdf4b6de07cdad32210eea12b5/src/aind_data_schema/core/data_description.py#L196) function.
3. Name your asset using the [_derived data conventions_](https://aind-data-schema.readthedocs.io/en/latest/data_organization.html#derived-data-conventions).
4. Tag your asset with the `derived` tag.
5. Publish the data asset.

All of these steps can be automated with code, but you can also do them manually after running a capsule for testing.

### Test Assets

If you generate a test asset that you won't need, please **archive** the asset when you're done testing. Once archived, if the asset remains unused for a month it will be deleted.