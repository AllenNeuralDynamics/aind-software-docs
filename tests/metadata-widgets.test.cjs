const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');

const script = readFileSync(new URL('../docs/source/_static/metadata-widgets.js', 'file://' + __filename), 'utf8');

class Element {
  constructor() {
    this.style = {};
    this.children = [];
    this.listeners = {};
    this.value = '';
    this.disabled = false;
    this.textContent = '';
  }

  set textContent(value) {
    this.text = value;
    this.children = [];
  }

  get textContent() {
    return this.text;
  }

  setAttribute() {}

  appendChild(child) {
    this.children.push(child);
  }

  replaceChildren() {
    this.children = [];
  }

  addEventListener(name, listener) {
    this.listeners[name] = listener;
  }

  click() {
    if (!this.disabled) return this.listeners.click({ preventDefault() {} });
  }
}

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function harness(responses) {
  const ids = [
    'orcidLookupForm', 'orcidNameInput', 'orcidLookupResult',
    'projectSelect', 'submitBtn', 'fundingResult',
    'projectSelectInvestigators', 'submitBtnInvestigators', 'investigatorResult',
    'subjectIdInputMetadata', 'submitBtnSubject', 'subjectResult',
    'subjectIdInput', 'submitBtnProcedures', 'proceduresResult'
  ];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  const orcidButton = new Element();
  elements.orcidLookupForm.querySelector = () => orcidButton;
  const requests = [];
  const delays = [];
  vm.runInNewContext(script, {
    document: {
      readyState: 'complete',
      getElementById: id => elements[id],
      createElement: () => new Element(),
      createTextNode: text => ({ textContent: text })
    },
    fetch: async url => {
      requests.push(url);
      const next = responses.shift();
      assert.ok(next, 'Unexpected fetch: ' + url);
      if (next instanceof Error) throw next;
      return next;
    },
    setTimeout: (callback, delay) => {
      delays.push(delay);
      queueMicrotask(callback);
    }
  });
  return { elements, requests, delays, orcidButton };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('both project dropdowns share a single request and retry sequence', async () => {
  const app = harness([new Error('network failure'), response({}, 503), response(['Project A'])]);
  await settle();
  assert.deepEqual(app.delays, [2000, 10000]);
  assert.equal(app.requests.length, 3);
  assert.ok(app.requests.every(url => url.endsWith('/project_names')));
  for (const inputId of ['projectSelect', 'projectSelectInvestigators']) {
    assert.equal(app.elements[inputId].children[1].value, 'Project A');
    assert.equal(app.elements[inputId].disabled, false);
  }
  assert.equal(app.elements.submitBtn.disabled, false);
  assert.equal(app.elements.submitBtnInvestigators.disabled, false);
});

test('give up after three attempts and allow a shared manual retry', async () => {
  const app = harness([new Error('offline'), new Error('offline'), new Error('offline'), response(['Recovered'])]);
  await settle();
  assert.equal(app.requests.length, 3);
  assert.match(app.elements.fundingResult.textContent, /Unable to load projects/);
  assert.match(app.elements.investigatorResult.textContent, /Unable to load projects/);
  assert.equal(app.elements.submitBtn.textContent, 'Retry loading projects');
  const fundingRetry = app.elements.submitBtn.click();
  const investigatorRetry = app.elements.submitBtnInvestigators.click();
  await Promise.all([fundingRetry, investigatorRetry]);
  assert.equal(app.requests.length, 4);
  assert.equal(app.elements.projectSelect.children[1].value, 'Recovered');
  assert.equal(app.elements.projectSelectInvestigators.children[1].value, 'Recovered');
});

test('lookup requests retry transient errors and render JSON as text', async () => {
  const payload = { note: '<img src=x onerror=alert(1)>' };
  const app = harness([response(['Project / A']), response({}, 502), response({ data: payload }), response([{ name: 'Investigator' }])]);
  await settle();
  app.elements.projectSelect.value = 'Project / A';
  await app.elements.submitBtn.click();
  assert.deepEqual(app.delays, [2000]);
  assert.ok(app.requests[1].endsWith('/funding/Project%20%2F%20A'));
  assert.equal(app.elements.fundingResult.children[0].textContent, JSON.stringify(payload, null, 2));
  app.elements.projectSelectInvestigators.value = 'Project / A';
  await app.elements.submitBtnInvestigators.click();
  assert.ok(app.requests.at(-1).includes('/investigators/'));
  assert.equal(app.elements.investigatorResult.textContent, 'Investigator Information:');
});

test('subject and procedures preserve HTTP 400 validation data without retrying', async () => {
  const app = harness([response(['Project A']), response({ data: { subject_id: '123' } }, 400), response({ data: { procedures: [] } }, 400)]);
  await settle();
  app.elements.subjectIdInputMetadata.value = 'abc';
  await app.elements.submitBtnSubject.click();
  assert.equal(app.requests.length, 1);
  assert.match(app.elements.subjectResult.textContent, /integer/);
  app.elements.subjectIdInputMetadata.value = '123';
  await app.elements.submitBtnSubject.click();
  assert.match(app.elements.subjectResult.textContent, /failed schema validation/);
  app.elements.subjectIdInput.value = '123';
  app.elements.subjectIdInput.listeners.keydown({ key: 'Enter', preventDefault() {} });
  await settle();
  assert.match(app.elements.proceduresResult.textContent, /failed schema validation/);
  assert.deepEqual(app.delays, []);
  assert.equal(app.requests.length, 3);
});

test('ORCID preserves no-match and profile links, retries failures, and re-enables submit', async () => {
  const app = harness([response(['Project A']), response(null, 404), new Error('offline'), response({ orcid: '0000-0001-0002-0003' })]);
  await settle();
  app.elements.orcidNameInput.value = 'Example Name';
  await app.elements.orcidLookupForm.listeners.submit({ preventDefault() {} });
  assert.match(app.elements.orcidLookupResult.textContent, /No ORCiD match/);
  assert.deepEqual(app.delays, []);
  await app.elements.orcidLookupForm.listeners.submit({ preventDefault() {} });
  assert.deepEqual(app.delays, [2000]);
  assert.equal(app.elements.orcidLookupResult.children[0].href, 'https://orcid.org/0000-0001-0002-0003');
  assert.equal(app.orcidButton.disabled, false);
});

test('non-transient HTTP failures do not retry and keep lookup usable', async () => {
  const app = harness([response(['Project A']), response({}, 403)]);
  await settle();
  app.elements.subjectIdInputMetadata.value = '123';
  await app.elements.submitBtnSubject.click();
  assert.deepEqual(app.delays, []);
  assert.match(app.elements.subjectResult.textContent, /HTTP 403/);
  assert.equal(app.elements.submitBtnSubject.disabled, false);
});

test('shared script is harmless on pages without widgets', () => {
  vm.runInNewContext(script, {
    document: { readyState: 'complete', getElementById: () => null },
    fetch: () => assert.fail('Unrelated pages must not fetch metadata')
  });
});