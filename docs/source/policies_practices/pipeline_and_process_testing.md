# Pipeline and process testing

Pipelines MUST be tested end to end in CI, with the container images that will be released.
Processes (step repositories) SHOULD have their own tests.

## Pipeline tests

In [aind-ephys-pipeline](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline),
[`_nextflow-tests.yml`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/_nextflow-tests.yml)
runs on every PR to `dev` (with the `<version>-dev` images) and on every release PR to `main` (with the `<version>` images).
It runs a matrix of scenarios, each of which:

1. generates a small synthetic dataset (`tests/sample_dataset/create_test_*.py`), so tests don't depend on external data;
2. runs `pipeline/main.nf` with a CI configuration
   ([`.github/workflows/nextflow_test.config`](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/blob/main/.github/workflows/nextflow_test.config):
   `local` executor, Docker, small resources) and a parameter file for the scenario (`.github/workflows/params_test_*.json`);
3. checks the outputs with `tests/check_pipeline_results.py` (number of processed streams, successful sortings, NWB files, ...).

The scenarios cover the supported input formats, multi-shank probes, multi-segment recordings, and a custom parameter file.
One scenario runs with an invalid parameter file (`params_wrong.json`) and passes only if the pipeline fails,
to check that parameter validation stops the run.

Scenarios SHOULD be cheap enough to run on standard GitHub runners. Steps that need a GPU (e.g. Kilosort) are not run in CI.

## Process tests

Step repositories SHOULD have unit tests that run the step on its own, with a `--params` JSON string,
so that a change can be tested before its commit is pinned in `process_versions.env`.

## nf-test

[nf-test](https://www.nf-test.com/) is the test framework used by nf-core.
It tests single processes, sub-workflows or the whole pipeline, and compares outputs to stored snapshots.
aind-ephys-pipeline doesn't use it yet, but new pipelines SHOULD consider it, especially once processes are split into modules.

```groovy
nextflow_process {
    name "Test preprocessing"
    script "../main.nf"
    process "preprocessing"

    test("runs on a small recording") {
        when {
            process {
                """
                input[0] = 1
                input[1] = file("${projectDir}/tests/data/ecephys_session")
                input[2] = file("${projectDir}/tests/data/job_dispatch")
                """
            }
        }
        then {
            assert process.success
            assert snapshot(process.out.results).match()
        }
    }
}
```
