import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../dist/citizen-demo.html', import.meta.url), 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.indexOf('</script>', scriptStart);
const script = scriptStart >= 0 && scriptEnd > scriptStart ? html.slice(scriptStart + 8, scriptEnd) : null;
assert.ok(script, 'embedded application script exists');
const cut = script.indexOf('function mountCitizenWorkspace');
assert.ok(cut > 0, 'pure analysis layer exists before UI mount');
const sandbox = {};
vm.runInNewContext(script.slice(0, cut) + '\n globalThis.__testApi={WORKFLOWS,analyzeCitizen,readInputs};', sandbox);
const { WORKFLOWS, analyzeCitizen, readInputs } = sandbox.__testApi;

const defaults = Object.fromEntries(Object.entries(WORKFLOWS).map(([kind, cfg]) => [
  kind,
  Object.fromEntries(cfg.fields.map(([key, , type, value]) => [key, type === 'choice' ? value : String(value)]))
]));

test('all nine workflows return a structured local report', () => {
  assert.equal(Object.keys(WORKFLOWS).length, 9);
  for (const [kind, input] of Object.entries(defaults)) {
    const report = analyzeCitizen(kind, input);
    assert.equal(report.workflow, kind);
    assert.equal(report.mode, 'offline deterministic');
    assert.equal(report.externalCalls, false);
    assert.ok(Array.isArray(report.metrics) && report.metrics.length > 0);
    assert.ok(Array.isArray(report.actions) && report.actions.length > 0);
  }
});

test('budget arithmetic is correct', () => {
  const r = analyzeCitizen('budget', {income:'55000',housing:'12000',food:'8500',bills:'4500',transport:'3500',other:'4000'});
  assert.equal(r.metrics[0].value, '₹32,500');
  assert.equal(r.metrics[1].value, '₹22,500');
  assert.equal(r.metrics[2].value, '₹97,500');
});

test('business break-even handles zero or negative contribution', () => {
  const r = analyzeCitizen('business', {price:'100',variable:'100',fixed:'1000',units:'100'});
  assert.equal(r.metrics[2].value, 'Not reachable');
  assert.ok(r.findings.some(x => x.level === 'attention'));
});

test('rejects malformed, out-of-range and non-integer values', () => {
  assert.throws(() => readInputs('budget', {income:'NaN',housing:'1',food:'1',bills:'1',transport:'1',other:'1'}));
  assert.throws(() => readInputs('budget', {income:'-1',housing:'1',food:'1',bills:'1',transport:'1',other:'1'}));
  assert.throws(() => readInputs('study', {topics:'2.5',days:'30',minutes:'60',minutesPerTopic:'90'}));
  assert.throws(() => readInputs('digital', {mfa:'maybe',updates:'yes',backups:'no',passwords:'yes',scams:'yes'}));
});

test('does not claim emergency or document eligibility is verified', () => {
  assert.equal(analyzeCitizen('documents', defaults.documents).metrics[2].value, 'Unverified');
  assert.match(analyzeCitizen('emergency', defaults.emergency).disclaimer, /not live hazard advice/i);
});

test('source clearly labels offline-only scope and has no dead AI portal link', () => {
  assert.match(html, /RC7/);
  assert.match(html, /AI chat is not included/);
  assert.equal(html.includes('href="/ai"'), false);
});
