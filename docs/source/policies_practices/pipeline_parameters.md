# Pipeline parameterization

All parameters of a pipeline MUST be in one JSON file, described by a JSON Schema, and validated before any processing starts.

## Parameter file

`pipeline/default_params.json` has a few top-level fields and one section per step:

```json
{
    "pipeline_version": "1.4.1",
    "logging": {"package": "logging", "logging_cfg": {"level": "INFO"}},
    "job_dispatch": {"split_segments": true, "input": "aind"},
    "preprocessing": {"filter_type": "highpass", "denoising_strategy": "cmr"},
    "spikesorting": {"sorter": "kilosort4", "kilosort4": {}}
}
```

Users pass their own file with `--params_file my_params.json`; if they don't, the defaults are used.
`main.nf` passes each step its own section as a JSON string (`./run --params '<json>'`),
together with the shared `logging` section (see [Logging](pipeline_logging.md)).
In aind-ephys-pipeline, the older `--<step>_args "--flag value"` command-line arguments are still accepted and merged into the step's section.

## Schema

`pipeline/default_params_schema.json` is the reference for all parameters. It SHOULD:

- give a `description` and a `default` for every parameter;
- use `"additionalProperties": false`, so misspelled or removed parameters are errors instead of being silently ignored;
- restrict `pipeline_version` to the versions the file is compatible with (e.g. `"pattern": "^1\\.4\\.[1-9]+$"`).

Tools can be generated from the schema, like the parameter editor and validator in
[`params_app/`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/tree/main/params_app).

## Validation

At runtime, `main.nf` validates the parameter file with the `validate()` function of the
[nf-schema](https://nextflow-io.github.io/nf-schema/) plugin, before any process is created.
An invalid file stops the pipeline before any step (or container) runs, and the errors list the location of each invalid parameter:

```groovy
include { validate } from 'plugin/nf-schema'

def errors = validate(json_params, "${projectDir}/default_params_schema.json", exitOnError: false)
if (errors) {
    error "Invalid parameters in ${params_file}:\n" + errors.collect { "  * ${it}" }.join('\n')
}
```

`validate()` checks the content of the parameter file, so nested sections are validated in full,
and command-line parameters that are not in the file (e.g. `--container_tag`) are not affected.
nf-schema requires the schema to use JSON Schema draft 2020-12 (`"$schema": "https://json-schema.org/draft/2020-12/schema"`)
and must be declared in every Nextflow configuration (`plugins { id 'nf-schema@2.7.3' }`, which requires Nextflow 25.10 or newer).

In CI, [`validate_params.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/validate_params.yml)
runs on every PR and push to `dev` and `main`:

- `default_params.json` is validated against the schema (with `jsonschema`, by `.github/scripts/validate_params.py`);
- parameters that are passed through to external libraries are checked against the versions of those libraries pinned in `environment/`.
  In aind-ephys-pipeline, [`tests/check_sorter_params.py`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/tests/check_sorter_params.py)
  compares the sorter parameters to SpikeInterface's defaults, and
  [`tests/check_postprocessing_params.py`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/tests/check_postprocessing_params.py)
  checks extension and metric parameters.
  Parameters unknown to the library are errors; new parameters in the library are warnings.

The library checks catch upstream API changes when a dependency is upgraded.
They matter because some libraries ignore or catch wrong parameters (e.g. SpikeInterface fills failed metrics with NaN),
so the error would otherwise only show up in the outputs.
