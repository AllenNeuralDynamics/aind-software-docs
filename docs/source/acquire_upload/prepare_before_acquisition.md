# Prepare metadata

Before running an acquisition, you are responsible for ensuring that your **project metadata**, **instrument**, and **procedures** are valid and accessible through the [metadata-service](https://aind-metadata-service/docs).

You are ready to generate data when:

- Your project metadata is accessible by project name
- Your `instrument.json` is ready to be copied to each data asset OR has been uploaded to the metadata-service
- Your `procedures.json` is ready to be copied to each data asset OR all your procedures were performed by NSB

## Project name

Your *project* and *subproject* (if applicable) as well as funding information and investigators need to be accurate.

You can find a list of project names and combined "<project_name> - <subproject_name>" names at this [metadata-service endpoint](https://aind-metadata-service/api/v2/project_names). These are the only allowable project names available at this time.

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

### Calibration objects

When collecting a *complete data asset* on an instrument using a "calibration object" instead of a subject, you should set `subject_id = "calibration"` in all metadata files. Please also use the [CalibrationObject](https://aind-data-schema.readthedocs.io/en/latest/components/subjects.html#calibrationobject) in the `Subject.subject_details` to track information about the physical object used during calibration.

Note that this is only for situations where you are acquiring a full data asset, for example when testing processing pipelines with fake calibration data. When calibrating individual devices you should include [Calibration](https://aind-data-schema.readthedocs.io/en/latest/components/measurements.html#calibration) metadata in your `instrument.json` or `acquisition.json` (depending on when the data was acquired).

## Instrument

[Instrument](https://aind-data-schema.readthedocs.io/en/latest/instrument.html) metadata should be prepared in advance and uploaded to the metadata-service.

Keep track of your `instrument_id` you will need to provide this value when you upload your data asset later.

### I want to write an instrument.json

### I'm ready to upload my instrument.json

[TODO]

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