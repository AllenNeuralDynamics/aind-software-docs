# Prepare metadata

Before running an acquisition, you are responsible for ensuring that your **project metadata**, **instrument**, and **procedures** are valid and accessible through the [metadata-service](https://aind-metadata-service/docs).

You are ready to generate data when:

- Your project metadata is accessible by project name
- Your `instrument.json` is ready to be copied to each data asset OR has been uploaded to the metadata-service
- Your `procedures.json` is ready to be copied to each data asset OR all your procedures were performed by NSB

## Project name

Your *project* and *subproject* (if applicable) needs to be accurate. The full project name `<project_name> - <subproject_name>` is tied directly with the funding and investigator metadata. The list of project names can be viewed at the [metadata-service project_names/ endpoint](https://aind-metadata-service/api/v2/project_names). Projects that do not have metadata in the metadata-service must upload their own `data_description.json` -- reach out to Scientific Computing for help.

If you need a new project name, please request that it be added with the [project name and funding intake form](https://app.smartsheet.com/b/form/9f366857582b4db98d1fe41ef724a613).

### Funding

The funding endpoint will be used during data upload to populate your data description with funding information. You can check that your `project_name` is linked to the correct funding through this tool. Note that changes must be made through the intake form, you cannot modify these fields manually.

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
  fetch('https://aind-metadata-service/api/v2/project_names')
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

    fetch('https://aind-metadata-service/api/v2/funding/' + encodeURIComponent(projectName))
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

The investigators endpoint will be used during data upload to populate your data description with investigator information. You can check that your `project_name` is linked to the correct list of investigators through this tool. Note that changes must be made through the intake form, you cannot modify these fields manually.

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
  fetch('https://aind-metadata-service/api/v2/project_names')
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

    fetch('https://aind-metadata-service/api/v2/investigators/' + encodeURIComponent(projectName))
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

## Subject

Subject metadata is populated by lab animal services (LAS) without your involvement. You can fetch subject metadata from the metadata-service to verify that the subject information is accurate:

```{raw} html
<div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
  <label for="subjectIdInputMetadata" style="font-weight: bold; display: block; margin-bottom: 10px;">Enter a subject ID to fetch subject metadata from the metadata-service:</label>
  <input type="text" id="subjectIdInputMetadata" placeholder="e.g., 804670" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
  <button id="submitBtnSubject" style="padding: 8px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Get Subject Info</button>
  <div id="subjectResult" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
</div>

<script type="text/javascript">
(function() {
  const subjectInput = document.getElementById('subjectIdInputMetadata');
  const submitBtn = document.getElementById('submitBtnSubject');
  const resultDiv = document.getElementById('subjectResult');

  // Try to fetch project names to check if service is accessible
  fetch('https://aind-metadata-service/api/v2/project_names')
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
  document.getElementById('submitBtnSubject').addEventListener('click', function() {
    const subjectId = document.getElementById('subjectIdInputMetadata').value.trim();
    const resultDiv = document.getElementById('subjectResult');
    
    if (!subjectId) {
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#fff3cd';
      resultDiv.style.border = '1px solid #ffc107';
      resultDiv.innerHTML = '<strong>Please enter a subject ID.</strong>';
      return;
    }

    // Validate that subject ID is an integer
    if (!/^\d+$/.test(subjectId)) {
      resultDiv.style.display = 'block';
      resultDiv.style.backgroundColor = '#f8d7da';
      resultDiv.style.border = '1px solid #dc3545';
      resultDiv.innerHTML = '<strong>Error:</strong> Subject ID must be an integer (numbers only).';
      return;
    }

    resultDiv.style.display = 'block';
    resultDiv.style.backgroundColor = '#e7f3ff';
    resultDiv.style.border = '1px solid #0066cc';
    resultDiv.innerHTML = '<strong>Loading subject information...</strong>';

    fetch('https://aind-metadata-service/api/v2/subject/' + encodeURIComponent(subjectId))
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
        resultDiv.innerHTML = '<strong>Subject Information:</strong><pre style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">' + 
                              JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(error => {
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.border = '1px solid #dc3545';
        resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
        console.error('Error fetching subject info:', error);
      });
  });
  
  // Allow Enter key to submit
  document.getElementById('subjectIdInputMetadata').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      document.getElementById('submitBtnSubject').click();
    }
  });
})();
</script>
```

## Instrument

[Instrument](https://aind-data-schema.readthedocs.io/en/latest/instrument.html) metadata should be prepared in advance of data acquisition.

### ID

The `instrument_id` for AIND should be the SIPE ID for an instrument. If an instrument is not tracked by SIPE, any string will be accepted.

### Other details

#### Multiple instruments

Multiple `instrument.json` files can be provided when multiple separate instruments are used simultaneously to acquire a data asset. The combined instrument metadata stored with the associated data asset will have an `instrument_id` that is the combined names of the individual instruments, joined with the `'_'` character. See [metadata merging rules](upload_data.md#merge-rules) for information about how metadata files are merged during data upload.

#### Upload options

Users have two options for providing instrument metadata files:

1) Files can be provided at upload time in the data folder. In this case, it is up to users to ensure that the instrument file(s) are in the data folder when upload is triggered. Users are free to set this up however they choose. Two patterns that have been used are:

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

Note that it is possible to combine these methods. For example, a user could pass the instrument JSON for the behavior instrument in the data directory (named something like `instrument_behavior.json`) and also specify a physiology rig by instrument ID in the `gather_preliminary_metadata` job type settings. The two instrument files would be merged by the data transfer service. See [metadata merging rules](upload_data.md#merge-rules).

Also note that we require all devices in the database to have a unique `instrument_id`. 

### Maintenance responsibility

While it is ultimately the responsibility of the scientist collecting data to ensure that all metadata is correct, it is the responsibility of the person who modifies an instrument to update instrument metadata to reflect the changes they made.

### How to

The following sections describe use cases for saving, fetching, editing and creating instrument metadata files

#### I want to write an instrument.json

Instrument JSON files should be created by a Python script using models from the [`aind-data-schema`](https://github.com/AllenNeuralDynamics/aind-data-schema) library to ensure the output file is valid according to the schema (as opposed to directly writing JSON). There are multiple examples of Python scripts for generating instrument JSON files in the [data schema examples folder](https://github.com/AllenNeuralDynamics/aind-data-schema/tree/dev/examples)

We recommend that basic maintenance changes, e.g. replacing a device with an identical one but with a different serial number, be done by modifying the Python script and updating the `Instrument.modification_date`.

#### I'm ready to upload my instrument JSON file to the database

If you want to store your Instrument metadata file in the Scientific Computing managed database (only 2.0 schema instrument files are supported), you can follow these steps to post your instrument json file to the database:

Note that you must currently have the `release-v1.0.0` branch of `aind-metadata-mapper` installed:
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

The "modification_date" field will be automatically updated to the current date when the instrument file is uploaded. There is currently a check on uniqueness by date, so uploading more than one instrument.json per day (for example, if you make a mistake and try to upload a second time) will result in an error. If you do need to upload a second time in day, you'll need to overwrite the previous instrument by passing the `replace=True` arguement to the `utils.save_instrument()` function.

#### I want to get an instrument from the database

During data upload you can automatically have your `instrument.json` fetched by the GatherMetadataJob. If you need to see the file you uploaded locally, you can fetch the most recent `instrument.json` sorted by `Instrument.modification_date`. 

```python
from aind_metadata_mapper import utils

# fetch the instrument, where `INSTRUMENT_ID` is a string containing the instrument ID
instrument_data = utils.get_instrument(INSTRUMENT_ID)
```

If you need access to an older version of an instrument metadata file from the database, please reach out to someone in Scientific Computing for assistance.

## Procedures

[Procedures](https://aind-data-schema.readthedocs.io/en/latest/procedures.html) metadata should be prepared in advance. Our goal with procedures metadata is to capture the date, time, and critical parameters of a published [Protocol](https://www.protocols.io/workspaces/allen-institute-for-neural-dynamics/publications) on our protocols.io page.

Currently, only NSB procedures are automatically attached to data assets during upload while custom procedures require a `procedures.json` file to be uploaded with each data asset. With the roll out of Power Platform / Dataverse, all procedures will need to be uploaded to the metadata-service as they are performed.

### Custom procedures

Custom [Procedures](https://aind-data-schema.readthedocs.io/en/latest/procedures.html) require you to generate a `procedures.json` file manually. Note that the `data-transfer-service` will **NOT** merge your procedures with any stored in NSB, you must pull the NSB procedures and manually merge them ahead of time, please reach out to Scientific Computing for help with this process.

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
  fetch('https://aind-metadata-service/api/v2/project_names')
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

    fetch('https://aind-metadata-service/api/v2/procedures/' + encodeURIComponent(subjectId))
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