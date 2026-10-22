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
    "logging_cfg": {}
}
```

| Field | Content |
|---|---|
| `package` | `log-schema` or `logging` |
| `logging_cfg` | With `logging`: arguments for `logging.basicConfig` (e.g. `level`, `format`). With `log-schema`: its configuration (empty for the defaults). |
| `pipeline_name`, `acquisition_name` | Optional, for `log-schema`. If `acquisition_name` is missing, steps read it from `data_description.json`. |

`main.nf` adds this section to the `--params` of every step, unless the step's own section already has a `logging` entry
(see `buildStepArgs` in [`main.nf`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/pipeline/main.nf)).
Changing the logging of the whole pipeline only takes changing the parameter file.
`log-schema` is pinned in `environment/package-versions.txt`, so it is installed in all images.

## In each step

**TODO**: can this be done by `log-schema` directly and return a `logger`?

Steps MUST set up logging from `params["logging"]` before anything else logs.
From [aind-ephys-preprocessing](https://github.com/AllenNeuralDynamics/aind-ephys-preprocessing):

```python
LOGGING = params.get("logging", None)

if LOGGING is None:
    logging.basicConfig(level="INFO", stream=sys.stdout, format="%(message)s")
elif LOGGING["package"] == "logging":
    logging.basicConfig(stream=sys.stdout, **LOGGING.get("logging_cfg", {}))
elif LOGGING["package"] == "log-schema":
    import log_schema

    acquisition_name = LOGGING.get("acquisition_name")
    if acquisition_name is None:
        data_description_json = next(data_folder.glob("**/data_description.json"), None)
        if data_description_json is not None:
            acquisition_name = json.loads(data_description_json.read_text())["name"]

    log_schema.setup_logging(
        config=LOGGING.get("logging_cfg") or None,
        model={
            "pipeline_name": LOGGING.get("pipeline_name", "AIND Ephys Pipeline"),
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
