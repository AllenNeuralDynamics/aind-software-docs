# Logging

Pipelines SHOULD log with [log-schema](https://github.com/AllenNeuralDynamics/log-schema), which writes structured logs
tagged with the pipeline, the acquisition and the process, so logs from every step of a run can be collected and searched together.
Steps MUST also support the standard Python `logging` module, for users who don't need structured logs.

## Configuration

Logging is configured once, in the top-level `logging` section of the pipeline parameters:

```json
"logging": {
    "package": "log-schema",
    "pipeline_name": "AIND Ephys Pipeline",
    "logging_cfg": {},
    "acquisition_name": "",
    "pipeline_name": ""
}
```

| Field | Content |
|---|---|
| `package` | `log-schema` or `logging` |
| `logging_cfg` | With `logging`: arguments for `logging.basicConfig` (e.g. `level`, `format`). With `log-schema`: its configuration (empty for the defaults). |
| `pipeline_name`, `acquisition_name` | Optional, for `log-schema`. If `acquisition_name` is missing, steps read it from `data_description.json`. |

`main.nf` adds the `pipeline_name` and `acquisition_name` to the `logging` section of the params
using something like:

```groovy
full_params.logging = full_params.logging ?: [:]
if (!full_params.logging.acquisition_name) {
    def acquisition_name = null
    try {
        def data_description = file("${params.ecephys_path}/data_description.json")
        if (data_description.exists()) {
            acquisition_name = new groovy.json.JsonSlurper().parseText(data_description.text).name
        }
    } catch (Exception e) {
        println "WARN: could not read data_description.json: ${e.message}"
    }
    if (!acquisition_name) {
        println "WARN: no name found in ${params.ecephys_path}/data_description.json, using 'undefined'"
        acquisition_name = 'undefined'
    }
    full_params.logging.acquisition_name = acquisition_name
}
if (!full_params.logging.pipeline_name) {
    full_params.logging.pipeline_name = 'AIND Ephys Pipeline'
}
```


Changing the logging of the whole pipeline only takes changing the parameter file.
`log-schema` is pinned in `environment/package-versions.txt`, so it is installed in all images.

## In each step

Steps MUST set up logging from `params["logging"]` before anything else logs.
From [aind-ephys-preprocessing](https://github.com/AllenNeuralDynamics/aind-ephys-preprocessing):

```python
logging_params = params.get("logging", None)

if logging_params is None:
    logging.basicConfig(level="INFO", stream=sys.stdout, format="%(message)s")
elif logging_params["package"] == "logging":
    logging.basicConfig(stream=sys.stdout, **logging_params.get("logging_cfg", {}))
elif logging_params["package"] == "log-schema":
    import log_schema

    acquisition_name = logging_params.get("acquisition_name", "unknown")
    pipeline_name = logging_params.get("pipeline_name", "AIND Ephys Pipeline")

    log_schema.setup_logging(
        config=logging_params.get("logging_cfg") or None,
        model={
            "pipeline_name": pipeline_name,
            "acquisition_name": acquisition_name,
            "process_name": "Preprocessing",
        },
    )

logging.info("Begin processing...", extra={"event_type": "stage_start"})
```

Steps SHOULD mark the start and end of their main stages with `extra={"event_type": ...}`, so they can be found in the structured logs.

## Nextflow logs

Nextflow configurations SHOULD write the Nextflow report, timeline, trace and DAG to `$RESULTS_PATH/nextflow/`,
and the Nextflow log with `-log $RESULTS_PATH/nextflow/nextflow.log`, so they are saved with the results.
