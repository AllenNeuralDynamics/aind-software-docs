# Prepare metadata

Before running an acquisition, you are responsible for ensuring that your **project metadata**, **instrument**, and **procedures** are valid and accessible through the [metadata-service](http://aind-metadata-service/docs).

You are ready to generate data when:

- Your project metadata is accessible by project name
- Your `instrument.json` is ready to be copied to each data asset OR has been uploaded to the metadata-service
- Your `procedures.json` is ready to be copied to each data asset OR all your procedures were performed by NSB

## Project name

Your *project* and *subproject* (if applicable) as well as funding information and investigators need to be accurate.

You can find a list of project names and combined "<project_name> - <subproject_name>" names at this [metadata-service endpoint](http://aind-metadata-service/api/v2/project_names). These are the only allowable project names available at this time.

If you need a new project name, it needs to be added to the [project metadata smartsheet](https://app.smartsheet.com/b/login?dlp=%2Fsheets%2FR4GfCrXvHPJ5MjhjRvjgGRMJQxvwQg92wgcX5GP1).

### Funding

The funding endpoint will be used during data upload to populate your data description with funding information. Please check that your funding information is accurate in advance:

```{raw} html
<div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <label for="projectSelect" style="font-weight: bold; display: block; margin-bottom: 10px;">Select a project fetch funding information from the metadata-service:</label>
  <select id="projectSelect" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
    <option value="">-- Loading projects... --</option>
  </select>
  <button id="submitBtn" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Get Funding Info</button>
  <div id="fundingResult" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
</div>

<script type="text/javascript">
(function() {
  const select = document.getElementById('projectSelect');
  const submitBtn = document.getElementById('submitBtn');
  const resultDiv = document.getElementById('fundingResult');

  // Try to fetch project names - will fail if not on VPN
  fetch('http://aind-metadata-service/api/v2/project_names')
    .then(response => {
      if (!response.ok) throw new Error('Service not accessible');
      return response.json();
    })
    .then(data => {
      select.innerHTML = '<option value="">-- Select a project --</option>';
      data.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        select.appendChild(option);
      });
    })
    .catch(error => {
      select.innerHTML = '<option value="">Service unavailable</option>';
      select.disabled = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please access the docs on the Allen Institute network to preview metadata</strong>';
      console.error('Metadata service not accessible:', error);
    });

  // Handle submit button click
  document.getElementById('submitBtn').addEventListener('click', function() {
    const projectName = document.getElementById('projectSelect').value;
    const resultDiv = document.getElementById('fundingResult');
    
    if (!projectName) {
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please select a project first.</strong>';
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = '#e7f3ff';
    resultDiv.style.border = '1px solid #0066cc';
    resultDiv.innerHTML = '<strong>Loading...</strong>';

    fetch('http://aind-metadata-service/api/v2/funding/' + encodeURIComponent(projectName))
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(response => {
        const data = response.data || response;
        resultDiv.style.backgroundColor = '#d4edda';
        resultDiv.style.border = '1px solid #28a745';
        resultDiv.innerHTML = '<strong>Funding Information:</strong><pre style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">' + 
                              JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(error => {
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.border = '1px solid #dc3545';
        resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
        console.error('Error fetching funding info:', error);
      });
  });
})();
</script>
```

### Investigators

The investigators endpoint will be used during data upload to populate your data description with investigator information. Please check that your investigator information is accurate in advance:

```{raw} html
<div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <label for="projectSelectInvestigators" style="font-weight: bold; display: block; margin-bottom: 10px;">Select a project to fetch investigator information from the metadata-service:</label>
  <select id="projectSelectInvestigators" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
    <option value="">-- Loading projects... --</option>
  </select>
  <button id="submitBtnInvestigators" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Get Investigator Info</button>
  <div id="investigatorResult" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
</div>

<script type="text/javascript">
(function() {
  const select = document.getElementById('projectSelectInvestigators');
  const submitBtn = document.getElementById('submitBtnInvestigators');
  const resultDiv = document.getElementById('investigatorResult');

  // Try to fetch project names - will fail if not on VPN
  fetch('http://aind-metadata-service/api/v2/project_names')
    .then(response => {
      if (!response.ok) throw new Error('Service not accessible');
      return response.json();
    })
    .then(data => {
      select.innerHTML = '<option value="">-- Select a project --</option>';
      data.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        select.appendChild(option);
      });
    })
    .catch(error => {
      select.innerHTML = '<option value="">Service unavailable</option>';
      select.disabled = true;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please access the docs on the Allen Institute network to preview metadata</strong>';
      console.error('Metadata service not accessible:', error);
    });

  // Handle submit button click
  document.getElementById('submitBtnInvestigators').addEventListener('click', function() {
    const projectName = document.getElementById('projectSelectInvestigators').value;
    const resultDiv = document.getElementById('investigatorResult');
    
    if (!projectName) {
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please select a project first.</strong>';
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = '#e7f3ff';
    resultDiv.style.border = '1px solid #0066cc';
    resultDiv.innerHTML = '<strong>Loading...</strong>';

    fetch('http://aind-metadata-service/api/v2/investigators/' + encodeURIComponent(projectName))
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(response => {
        const data = response.data || response;
        resultDiv.style.backgroundColor = '#d4edda';
        resultDiv.style.border = '1px solid #28a745';
        resultDiv.innerHTML = '<strong>Investigator Information:</strong><pre style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">' + 
                              JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(error => {
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.border = '1px solid #dc3545';
        resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
        console.error('Error fetching investigator info:', error);
      });
  });
})();
</script>
```

## Instrument

[Instrument](https://aind-data-schema.readthedocs.io/en/latest/instrument.html) metadata should be prepared in advance. The resulting `instrument.json` file should describe the full collection of devices present in the physical instrument used to collect data. 

### ID

The `instrument_id` for AIND should be the SIPE ID for a rig. If an instrument is not tracked by SIPE, any string will be accepted.

### Other details

Multiple `instrument.json` files can be provided when two separate instruments are used simultaneously to acquire a data asset. See [metadata merging rules](upload.md#metadata-merging-rules) for information about how metadata files are merged during data upload.

Users have two options for providing instrument metadata files:

1) Files can be provided at upload time in the data folder. In this case, it is up to users to ensure that the instrument file(s) are in the data folder when upload is triggered. Users are free to set this up however they choose. Two patterns than have been used are:

      * A static instrument metadata file is saved somewhere on the data acquisition machine and is copied into the data folder prior to upload

      * A script is run that dynamically generates an instrument metadata file before upload. 

2) A static version of the instrument metadata is uploaded to a database in advance. See details below. In this case, users must specify the `instrument_id` as part of the job parameters in the `gather_preliminary_metadata` job type settings as follows

   ```
   {
      "skip_task": false,
      "job_settings": {
         "instrument_settings": {
            "instrument_id": INSTRUMENT_ID # a string containing a valid instrument ID
         }
      },
      ...
   }
   ```
   
   The data transfer service will then pull the instrument metadata from the database during upload. 

Note that it is possible to combine these methods. For example, a user could pass the instrument JSON for the behavior instrument in the data directory (named something like `instrument_behavior.json`) and also specify a physiology rig by instrument ID in the `gather_preliminary_metadata` job type settings. The two instrument files would be merged by the data transfer service.

### Maintenance responsibility

While it is ultimately the responsibility of the scientist collecting data to ensure that all metadata is correct, it is the responsibility of the person who modifies an instrument to update instrument metadata to reflect the changes they made.

### How to

The following sections describe use cases for saving, fetching, editing and creating instrument metadata files

#### I want to write an instrument.json

Instrument JSON files should be created by a Python script using models from the [`aind-data-schema`](https://github.com/AllenNeuralDynamics/aind-data-schema) library to ensure the output file is valid according to the schema (as opposed to directly writing JSON). There are multiple examples of Python scripts for generating instrument JSON files in the [data schema examples folder](https://github.com/AllenNeuralDynamics/aind-data-schema/tree/dev/examples)

#### I need to edit an existing instrument JSON file

In some cases, you may need to update an existing instrument JSON file due to hardware changes (e.g., replacing a camera or probe with the same model but different serial number). While we generally recommend generating and updating instrument files using Python scripts, simple field updates can be made by directly editing the JSON file. However, you must validate the file after editing to ensure it still conforms to the schema.

To validate an instrument JSON file:

```python
from aind_data_schema.core.instrument import Instrument

with open('instrument.json', 'r') as f:
    instrument = Instrument.model_validate_json(f.read())
print("Validation successful!")
```

If validation fails, Pydantic will provide an error message indicating what needs to be fixed.

Assuming the instrument validates, you can follow instructions above for ensuring that the new instrument is included with future data acquisitions.

#### I'm ready to upload my instrument JSON file to the database

If you want to follow the second option above (i.e. storing your instrument metadata file in scicomp managed database for automatic fetching during data upload), you can follow these steps to post your instrument json file to the database:

1) Generate and validate your instrument JSON file locally. 
2) Post to the database as follows

note that users must currently have the "release-v1.0.0" branch of the metadata mapper installed. Follow these steps to do so:
```bash
git checkout https://github.com/AllenNeuralDynamics/aind-metadata-mapper.git
cd aind-metadata-mapper
git checkout release-v1.0.0
conda create -n instrument_uploader # or whatever you want your env to be called
conda activate instrument_uploader
pip install -e .
```

Then run the following in python

```python
from aind_metadata_mapper import utils
from aind_data_schema.core.instrument import Instrument

# Load the JSON as an Instrument object
with open(instrument_path, 'r') as f:
    instrument_object = Instrument.model_validate_json(f.read())

# save the instrument to the database. 
utils.save_instrument(instrument_object)
```

Note that future fetches of the instrument will be done using the instrument_id in the JSON. Make sure this is correct!

Also note that only the most recent saved instrument will be pulled automatically by the data transfer service. If you make a mistake when posting an instrument, you can simply post again and this latter instrument will be fetched automatically. 

#### I want to get an instrument from the database

If you want to fetch an instrument JSON file from the database, you can do the following:

```python
from aind_metadata_mapper import utils

# fetch the instrument, where `INSTRUMENT_ID` is a string containing the instrument ID
instrument_data = utils.get_instrument(INSTRUMENT_ID)

# Optionally save to disk, where OUTPUT_PATH is a string defining a valid filepath
with open(OUTPUT_PATH, 'w') as f:
    json.dump(instrument_data, f, indent=2)
```

Note that this will fetch the most recent instrument matching the specified ID. There is currently no functionality for pulling older versions of instrument JSON files from the database, though they are maintained. If you need access to an older version of an instrument metadata file from the database, please reach out to someone in Scientific Computing for assistance.

## Procedures

[Procedures](https://aind-data-schema.readthedocs.io/en/latest/procedures.html) metadata should be prepared in advance and uploaded to the metadata-service.

Our goal with procedures metadata is to capture the date, time, and parameters of a published [Protocol](https://www.protocols.io/workspaces/allen-institute-for-neural-dynamics/publications) on our protocols.io page. You only need to track the extent to which your procedure varies from the standard protocol.

### Custom procedures

Custom [Procedures](https://aind-data-schema.readthedocs.io/en/latest/procedures.html) require you to generate a `procedures.json` file manually. Note that the `data-transfer-service` will **NOT** merge your procedures with any stored in NSB, you must pull the NSB procedures and manually merge them ahead of time.

### NSB procedures

Standardized procedures that are performed by NSB (link?) are uploaded and accessible through the metadata-service. You can see the available procedures for a mouse by passing its subject_id here:

```{raw} html
<div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <label for="subjectIdInput" style="font-weight: bold; display: block; margin-bottom: 10px;">Enter a subject ID to fetch procedures from the metadata-service:</label>
  <input type="text" id="subjectIdInput" placeholder="e.g., 804670" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <button id="submitBtnProcedures" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Get Procedures</button>
  <div id="proceduresResult" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
</div>

<script type="text/javascript">
(function() {
  const subjectInput = document.getElementById('subjectIdInput');
  const submitBtn = document.getElementById('submitBtnProcedures');
  const resultDiv = document.getElementById('proceduresResult');

  // Try to fetch project names to check if service is accessible
  fetch('http://aind-metadata-service/api/v2/project_names')
    .then(response => {
      if (!response.ok) throw new Error('Service not accessible');
      return response.json();
    })
    .then(data => {
      // Service is accessible, widget is ready
    })
    .catch(error => {
      subjectInput.disabled = true;
      subjectInput.placeholder = 'Service unavailable';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please access the docs on the Allen Institute network to preview metadata</strong>';
      console.error('Metadata service not accessible:', error);
    });

  // Handle submit button click
  document.getElementById('submitBtnProcedures').addEventListener('click', function() {
    const subjectId = document.getElementById('subjectIdInput').value.trim();
    const resultDiv = document.getElementById('proceduresResult');
    
    if (!subjectId) {
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please enter a subject ID.</strong>';
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = '#e7f3ff';
    resultDiv.style.border = '1px solid #0066cc';
    resultDiv.innerHTML = '<strong>Loading procedures...</strong><br><em>This may take 30 seconds or more, please wait...</em>';

    fetch('http://aind-metadata-service/api/v2/procedures/' + encodeURIComponent(subjectId))
      .then(response => {
        if (!response.ok) {
          throw new Error('HTTP error! status: ' + response.status);
        }
        return response.json();
      })
      .then(response => {
        const data = response.data || response;
        resultDiv.style.backgroundColor = '#d4edda';
        resultDiv.style.border = '1px solid #28a745';
        resultDiv.innerHTML = '<strong>Procedures Information:</strong><pre style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">' + 
                              JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(error => {
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.border = '1px solid #dc3545';
        resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
        console.error('Error fetching procedures:', error);
      });
  });
  
  // Allow Enter key to submit
  document.getElementById('subjectIdInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('submitBtnProcedures').click();
    }
  });
})();
</script>
```