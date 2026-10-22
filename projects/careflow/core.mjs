/** CareFlow: a deliberately bounded administrative workflow prototype. */
import {sha256} from './sha256.mjs';
export const VERSION = '1.0.0';
export const ALLOWED_TOOLS = Object.freeze(['summarize_queue', 'draft_followups']);
export const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['goal', 'tools'],
  properties: {
    goal: {type: 'string', minLength: 1, maxLength: 500},
    tools: {type: 'array', minItems: 1, maxItems: 2, uniqueItems: true,
      items: {type: 'string', enum: ALLOWED_TOOLS}}
  }
};
const copy = value => JSON.parse(JSON.stringify(value));
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
function keysOnly(value, keys, label) {
  if (!isRecord(value) || Object.keys(value).some(key => !keys.includes(key))) throw new Error(`${label}: unexpected fields or invalid object.`);
}
function text(value, label, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${label}: expected nonempty text (maximum ${max} characters).`);
  return value.trim();
}
export function validateQueue(queue) {
  if (!Array.isArray(queue) || !queue.length || queue.length > 1000) throw new Error('Queue must contain 1–1,000 records.');
  const ids = new Set();
  return queue.map(row => {
    keysOnly(row, ['id', 'team', 'status', 'missing'], 'Queue record');
    const id = text(row.id, 'Record ID', 80);
    if (ids.has(id)) throw new Error(`Duplicate record ID: ${id}`);
    ids.add(id);
    if (!['waiting', 'ready', 'completed'].includes(row.status)) throw new Error(`Invalid status for ${id}.`);
    if (!Array.isArray(row.missing) || row.missing.length > 20) throw new Error(`Invalid missing-items list for ${id}.`);
    return {id, team: text(row.team, 'Team', 100), status: row.status,
      missing: [...new Set(row.missing.map(item => text(item, 'Missing item', 100)))]};
  });
}
export function validatePlan(plan) {
  keysOnly(plan, ['goal', 'tools'], 'Plan');
  const goal = text(plan.goal, 'Plan goal', 500);
  if (!Array.isArray(plan.tools) || !plan.tools.length || plan.tools.length > 2) throw new Error('Choose one or two tools.');
  if (new Set(plan.tools).size !== plan.tools.length) throw new Error('Repeated tools are not allowed.');
  for (const tool of plan.tools) if (!ALLOWED_TOOLS.includes(tool)) throw new Error(`Tool blocked: ${String(tool)}. Only administrative summaries and drafts are allowed.`);
  return {goal, tools: [...plan.tools]};
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
async function fingerprint(queue, plan) {
  const bytes = new TextEncoder().encode(canonical({version: VERSION, queue, plan}));
  return sha256(bytes);
}
function event(type, details = {}) { return {type, at: new Date().toISOString(), ...details}; }
export function summarizeQueue(queue) {
  const rows = validateQueue(queue);
  const counts = {waiting: 0, ready: 0, completed: 0};
  for (const row of rows) counts[row.status]++;
  return {total: rows.length, status: counts, needingFollowup: rows.filter(row => row.status !== 'completed' && row.missing.length).length};
}
export async function prepareRun(queue, plan) {
  const cleanQueue = validateQueue(queue), cleanPlan = validatePlan(plan);
  return {version: VERSION, state: 'awaiting_approval', queue: cleanQueue, plan: cleanPlan,
    fingerprint: await fingerprint(cleanQueue, cleanPlan), approval: null, outputs: null,
    audit: [event('plan_prepared', {tools: cleanPlan.tools})]};
}
async function verifyRun(run) {
  keysOnly(run, ['version', 'state', 'queue', 'plan', 'fingerprint', 'approval', 'outputs', 'audit'], 'Run');
  if (run.version !== VERSION || !Array.isArray(run.audit)) throw new Error('Unsupported or malformed run.');
  const queue = validateQueue(run.queue), plan = validatePlan(run.plan);
  if (await fingerprint(queue, plan) !== run.fingerprint) throw new Error('The plan or input changed. Prepare a new run and review it again.');
  return {queue, plan};
}
export async function approveRun(run, reviewer) {
  await verifyRun(run);
  if (run.state !== 'awaiting_approval') throw new Error('Only a pending run can be approved.');
  const approved = copy(run);
  approved.approval = {reviewer: text(reviewer, 'Reviewer', 100), fingerprint: run.fingerprint, at: new Date().toISOString()};
  approved.state = 'approved';
  approved.audit.push(event('human_approval_recorded', {reviewer: approved.approval.reviewer}));
  return approved;
}
export async function executeRun(run) {
  const {queue, plan} = await verifyRun(run);
  if (run.state !== 'approved' || !run.approval || run.approval.fingerprint !== run.fingerprint) throw new Error('Execution requires approval of this exact plan and input.');
  text(run.approval.reviewer, 'Reviewer', 100);
  const completed = copy(run), outputs = {};
  for (const tool of plan.tools) {
    if (tool === 'summarize_queue') outputs.summary = summarizeQueue(queue);
    if (tool === 'draft_followups') outputs.drafts = queue.filter(row => row.status !== 'completed' && row.missing.length).map(row => ({
      recordId: row.id, team: row.team, status: 'draft_only',
      message: `For administrative request ${row.id}, please review the following missing items: ${row.missing.join(', ')}. This draft requires a person to check it before any communication.`
    }));
    completed.audit.push(event('tool_completed', {tool}));
  }
  completed.outputs = outputs;
  completed.state = 'completed';
  completed.audit.push(event('run_completed', {externalMessagesSent: 0}));
  return completed;
}
/** Optional adapter; hosted demo never invokes a model or sends queue records. */
export async function proposeWithOllama(queue, model, {baseUrl = 'http://127.0.0.1:11434', fetchImpl = globalThis.fetch} = {}) {
  const url = new URL(baseUrl);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('The model adapter only accepts a local Ollama URL.');
  text(model, 'Model name', 150);
  const summary = summarizeQueue(queue);
  const response = await fetchImpl(new URL('/api/chat', url), {
    method: 'POST', headers: {'Content-Type': 'application/json'}, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({model, stream: false, format: PLAN_SCHEMA, options: {temperature: 0}, messages: [
      {role: 'system', content: 'Propose a bounded administrative workflow. Available tools: summarize_queue and draft_followups. Return only a JSON object with goal and tools. Do not make clinical decisions.'},
      {role: 'user', content: `Review this aggregate queue summary and propose useful allowed tools: ${JSON.stringify(summary)}`}
    ]})
  });
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}.`);
  const result = await response.json();
  let plan;
  try { plan = JSON.parse(result.message.content); } catch { throw new Error('Ollama did not return a parseable plan.'); }
  return validatePlan(plan);
}
