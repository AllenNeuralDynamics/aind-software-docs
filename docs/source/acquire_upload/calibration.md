# Calibration and testing

## Device calibration

The metadata provides a generic class for storing [Calibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#calibration) metadata. In a generic calibration there is some set of known inputs and a paired set of measured output values.

Common calibrations include measuring power output (e.g. for lasers) with [PowerCalibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#powercalibration) and measuring volume outputs (e.g. for lick spouts controlled by a solenoid) with [VolumeCalibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#volumecalibration), but you can define any generic calibration using the base class.

Calibrations have an option to include fit parameters, if your calibration fit is not available in the [FitType](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#fittype) options please request that we add it by opening an [issue](https://github.com/AllenNeuralDynamics/aind-data-schema/issues).

## Instrument testing

When collecting a *test data asset* on an instrument using a "calibration object" instead of a subject or specimen, you should set `subject_id = "calibration"` in all metadata files. Please also use the [CalibrationObject](https://aind-data-schema.readthedocs.io/en/latest/components/subjects.html#calibrationobject) in the `Subject.subject_details` to track information about the physical object used during calibration.
