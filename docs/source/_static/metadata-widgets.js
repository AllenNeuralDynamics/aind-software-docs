(function() {
  'use strict';

  const baseUrl = 'https://aind-metadata-service/api/v2/';
  const retryDelays = [2000, 10000];
  const networkAdvice = 'Confirm that you are on the Allen Institute network (or VPN) and that your browser allows local network access for this site.';
  let projectNamesPromise;

  async function requestJson(endpoint, acceptedStatuses = [], onRetry = () => {}) {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const response = await fetch(baseUrl + endpoint);
        if (!response.ok && !acceptedStatuses.includes(response.status)) {
          const error = new Error('The metadata-service returned HTTP ' + response.status + '.');
          error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
          throw error;
        }
        if (response.status === 404 && acceptedStatuses.includes(404)) {
          return { data: null, status: response.status };
        }
        return { data: await response.json(), status: response.status };
      } catch (error) {
        if (error.retryable === false || attempt >= retryDelays.length) {
          throw error;
        }
        const delay = retryDelays[attempt];
        onRetry(delay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  function showResult(result, message, state = 'loading') {
    const colors = {
      loading: ['#e7f3ff', '#0066cc'],
      success: ['#d4edda', '#28a745'],
      warning: ['#fff3cd', '#ffc107'],
      error: ['#f8d7da', '#dc3545']
    };
    result.style.display = 'block';
    result.style.backgroundColor = colors[state][0];
    result.style.border = '1px solid ' + colors[state][1];
    result.textContent = message;
  }

  function showData(result, data, message, state) {
    showResult(result, message, state);
    const pre = document.createElement('pre');
    pre.style.marginTop = '10px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordWrap = 'break-word';
    pre.textContent = JSON.stringify(data, null, 2);
    result.appendChild(pre);
  }

  function retryMessage(result) {
    return delay => showResult(result, 'Request failed. Retrying in ' + delay / 1000 + ' seconds...');
  }

  function loadProjectNames() {
    if (!projectNamesPromise) {
      const widgets = [
        ['projectSelect', 'fundingResult'],
        ['projectSelectInvestigators', 'investigatorResult']
      ];
      projectNamesPromise = requestJson('project_names', [], delay => {
        widgets.forEach(([inputId, resultId]) => {
          const result = document.getElementById(resultId);
          if (result) retryMessage(result)(delay);
        });
      }).then(({ data }) => {
        if (!Array.isArray(data) || !data.every(project => typeof project === 'string')) {
          throw new Error('The metadata-service returned an invalid project list.');
        }
        return data;
      }).catch(error => {
        projectNamesPromise = undefined;
        throw error;
      });
    }
    return projectNamesPromise;
  }

  function initLookup(config) {
    const input = document.getElementById(config.inputId);
    const button = document.getElementById(config.buttonId);
    const result = document.getElementById(config.resultId);
    if (!input || !button || !result) return;
    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    let projectsReady = false;
    let busy = false;
    const originalButtonText = button.textContent;

    async function populateProjects() {
      busy = true;
      button.disabled = true;
      input.disabled = true;
      showResult(result, 'Loading projects...');
      try {
        const projects = await loadProjectNames();
        input.replaceChildren();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Select a project --';
        input.appendChild(placeholder);
        projects.forEach(project => {
          const option = document.createElement('option');
          option.value = project;
          option.textContent = project;
          input.appendChild(option);
        });
        projectsReady = true;
        input.disabled = false;
        button.textContent = originalButtonText;
        result.style.display = 'none';
      } catch (error) {
        button.textContent = 'Retry loading projects';
        showResult(result, 'Unable to load projects. ' + error.message + ' ' + networkAdvice, 'error');
      } finally {
        busy = false;
        button.disabled = false;
      }
    }

    button.addEventListener('click', async function() {
      if (busy) return;
      if (config.project && !projectsReady) {
        await populateProjects();
        return;
      }
      const value = input.value.trim();
      if (!value) {
        showResult(result, config.project ? 'Please select a project first.' : 'Please enter a subject ID.', 'warning');
        return;
      }
      if (config.integer && !/^\d+$/.test(value)) {
        showResult(result, 'Subject ID must be an integer (numbers only).', 'error');
        return;
      }
      busy = true;
      button.disabled = true;
      showResult(result, config.loading || 'Loading...');
      try {
        const response = await requestJson(config.endpoint + '/' + encodeURIComponent(value), config.acceptedStatuses || [], retryMessage(result));
        const invalid = response.status === 400;
        showData(result, response.data.data || response.data,
          invalid ? 'Warning: ' + config.endpoint + ' data failed schema validation:' : config.title,
          invalid ? 'warning' : 'success');
      } catch (error) {
        showResult(result, 'Unable to fetch metadata. ' + error.message + ' ' + networkAdvice, 'error');
      } finally {
        busy = false;
        button.disabled = false;
      }
    });
    if (config.project) {
      populateProjects();
    } else {
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          button.click();
        }
      });
    }
  }

  function initOrcid() {
    const form = document.getElementById('orcidLookupForm');
    if (!form) return;
    const input = document.getElementById('orcidNameInput');
    const result = document.getElementById('orcidLookupResult');
    const button = form.querySelector('button');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button.disabled) return;
      const name = input.value.trim();
      if (!name) {
        showResult(result, 'Please enter your name.', 'warning');
        return;
      }
      button.disabled = true;
      showResult(result, 'Checking the metadata-service...');
      try {
        const { data } = await requestJson('orcid/' + encodeURIComponent(name), [404], retryMessage(result));
        if (!data || !data.orcid) {
          showResult(result, 'No ORCiD match was found. A match requires your name plus either your Allen Institute email address or affiliation on your public ORCiD profile. Please ensure your Allen Institute name as it appears on your profile matches your public ORCiD profile, and add your Allen Institute email address and/or affiliation to your ORCiD record.', 'warning');
          return;
        }
        showResult(result, 'Found an ORCiD record: ', 'success');
        const link = document.createElement('a');
        link.href = 'https://orcid.org/' + encodeURIComponent(data.orcid);
        link.textContent = data.orcid;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        result.appendChild(link);
        result.appendChild(document.createTextNode('. Open the profile to confirm the displayed name is yours.'));
      } catch (error) {
        showResult(result, 'Unable to check the name. ' + error.message + ' ' + networkAdvice, 'error');
      } finally {
        button.disabled = false;
      }
    });
  }

  function initialize() {
    initOrcid();
    [
      { inputId: 'projectSelect', buttonId: 'submitBtn', resultId: 'fundingResult', endpoint: 'funding', title: 'Funding Information:', project: true },
      { inputId: 'projectSelectInvestigators', buttonId: 'submitBtnInvestigators', resultId: 'investigatorResult', endpoint: 'investigators', title: 'Investigator Information:', project: true },
      { inputId: 'subjectIdInputMetadata', buttonId: 'submitBtnSubject', resultId: 'subjectResult', endpoint: 'subject', title: 'Subject Information:', integer: true, acceptedStatuses: [400] },
      { inputId: 'subjectIdInput', buttonId: 'submitBtnProcedures', resultId: 'proceduresResult', endpoint: 'procedures', title: 'Procedures Information:', acceptedStatuses: [400], loading: 'Loading procedures... This may take 30 seconds or more, please wait...' }
    ].forEach(initLookup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();