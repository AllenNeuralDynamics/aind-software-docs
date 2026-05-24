# Calibration and testing

## Device calibration

The metadata provides a generic class for storing [Calibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#calibration) metadata. In a generic calibration there is some set of known inputs and a paired set of measured output values.

Common calibrations include measuring power output (e.g. for lasers) with [PowerCalibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#powercalibration) and measuring volume outputs (e.g. for lick spouts controlled by a solenoid) with [VolumeCalibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#volumecalibration), but you can define any generic calibration using the base class.

Calibrations have an option to include fit parameters, if your calibration fit is not available in the [FitType](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#fittype) options please request that we add it by opening an [issue](https://github.com/AllenNeuralDynamics/aind-data-schema/issues).

## Testing

Use `subject_id="calibration"` to mark data assets as test assets. Note that test assets should be immediately (or as soon as feasible) marked as archived on Code Ocean. Archived assets are deleted when unused for 30 days.

If your job_type runs `aind-metadata-mapper>=1.3.0` you can provide details about your [CalibrationObject](https://aind-data-schema.readthedocs.io/en/latest/components/subjects.html#calibrationobject) directly in the upload settings. 

```{code-block} python
from aind_data_schema.components.subjects import CalibrationObject
from aind_data_schema_models.modalities import Modality
from aind_metadata_mapper.gather_metadata import GatherMetadataJob
from aind_metadata_mapper.models import JobSettings, DataDescriptionSettings, SubjectSettings

job_settings = JobSettings(
    output_dir="/path/to/output",
    subject_id="calibration",
    data_description_settings=DataDescriptionSettings(
        project_name="<project-name>",
        modalities=[Modality.ECEPHYS],
    ),
    subject_settings=SubjectSettings(
        calibration_object=CalibrationObject(
            description="Neuropixels dummy probe",
            empty=False,
        )
    ),
)

job = GatherMetadataJob(job_settings=job_settings)
job.run_job()
```

If you are on an older job_type or if you need to do a manual upload outside of the transfer service you need to construct your `subject.json` and `procedures.json` manually. The procedures should be empty.

```{code-block} python
from aind_data_schema.core.subject import Subject
from aind_data_schema.core.procedures import Procedures
from aind_data_schema.components.subjects import CalibrationObject
from aind_data_schema.components.devices import Device
from aind_data_schema_models.organizations import Organization

subject_id = "calibration"
 
subject = Subject(
    subject_id=subject_id,
    subject_details=CalibrationObject(
        empty=True,
        description="FIP calibration",
    ),
)

procedures = Procedures(subject_id=subject_id)
 
subject.write_standard_file()
procedures.write_standard_file()
```
