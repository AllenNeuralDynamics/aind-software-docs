# Data Staging

The local data center hosts a variety of services that stage and process data on
its way to the cloud:

`aind-data-transfer-service`
: FastAPI service that accepts and validates data upload requests, retrieves the
associated metadata, and dispatches compression and transfer jobs to the workflow
manager for execution on the HPC cluster.

`aind-airflow-service`
: Apache Airflow–based workflow manager that schedules, submits, and monitors the
data processing and upload jobs.

`slurm`
: HPC cluster for processing and upload tasks.

`aind-metadata-service`
: REST API that compiles and returns `aind-data-schema` metadata, aggregating and
mapping records from multiple upstream data providers.

`VAST`
: Shared storage.

Container registry
: Docker images used to run processing jobs.

![Local data center flow](mid_level/local_data_center_flow.drawio.svg)
