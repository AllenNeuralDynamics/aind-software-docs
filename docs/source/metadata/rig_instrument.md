# Rig / Instrument

The `rig.json` or `instrument.json` describe the collection of hardware and software used to collect a data asset.  

The rig/instrument file encapsulates several devices (hardware/software components) and assemblies (collections of devices that serve a common function, such as a camera and lens). These files should describe the static state of the rig and can be used for multiple data assets. For most users, the rig file only changes when a device is replaced or updated. 


## Naming Conventions   

`rig_id`:  use the following naming convention - room number_rig description_date modified (e.g. an ephys rig in room 123 that was updated Feb 13, 2024 should have the rig_id "123_EPHYS1_202402313") 

`name`: each listed device should have a short, descriptive name to link the specific device to calibration information, DAQ device channels, and session settings. descriptive names such as "Red_laser" or "Laser_1" are preferred over serial numbers such as "LAS-442552O193".  

`manufacturer`: refer to `organizations.py` in [aind-data-schema-models](https://github.com/AllenNeuralDynamics/aind-data-schema-models/tree/main) for a master list of device manufacturers. to add a new manufacturer or manufacturer/device type combination to the list, please open a Github issue to the repo. Include 1) the full name of the Manufacturer, 2) a common acronym or abbreviation to use, and 3) if possible, the RORID for the company found at ror.org. 









