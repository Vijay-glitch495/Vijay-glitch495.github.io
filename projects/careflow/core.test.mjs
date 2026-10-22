import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareRun, approveRun, executeRun, validateQueue, validatePlan, proposeWithOllama} from './core.mjs';
const queue = JSON.parse(await readFile(new URL('./example-queue.json', import.meta.url)));
const plan = JSON.parse(await readFile(new URL('./example-plan.json', import.meta.url)));
test('unapproved run cannot execute', async () => { await assert.rejects(executeRun(await prepareRun(queue, plan)), /approval/); });
test('approved workflow produces exact queue totals and draft-only followups', async () => {
  const result = await executeRun(await approveRun(await prepareRun(queue, plan), 'Test reviewer'));
  assert.deepEqual(result.outputs.summary, {total:4,status:{waiting:2,ready:1,completed:1},needingFollowup:2});
  assert.deepEqual(result.outputs.drafts.map(d=>d.recordId), ['DEMO-001','DEMO-003']);
  assert.ok(result.outputs.drafts.every(d=>d.status==='draft_only'));
  assert.equal(result.audit.at(-1).externalMessagesSent, 0);
  await assert.rejects(executeRun(result), /approval/);
});
test('changed input invalidates an approved run', async () => {
  const run = await approveRun(await prepareRun(queue, plan), 'Reviewer'); run.queue[0].missing.push('changed');
  await assert.rejects(executeRun(run), /changed/);
});
test('changed plan invalidates an approved run', async () => {
  const run = await approveRun(await prepareRun(queue, plan), 'Reviewer'); run.plan.tools.pop();
  await assert.rejects(executeRun(run), /changed/);
});
test('clinical and arbitrary tools are rejected before approval', () => { for (const name of ['prescribe','send_email','__proto__','run_shell']) assert.throws(()=>validatePlan({goal:'test',tools:[name]}), /blocked/); });
test('duplicate tools and unknown plan fields are rejected', () => {
  assert.throws(()=>validatePlan({goal:'test',tools:['summarize_queue','summarize_queue']}), /Repeated/);
  assert.throws(()=>validatePlan({...plan,command:'rm -rf'}), /unexpected/);
});
test('duplicate IDs and malformed records are rejected', () => {
  assert.throws(()=>validateQueue([queue[0],queue[0]]), /Duplicate/);
  assert.throws(()=>validateQueue([{...queue[0],status:'urgent'}]), /status/);
  assert.throws(()=>validateQueue([{...queue[0],missing:'wrong'}]), /missing/);
});
test('preparing a run snapshots inputs instead of retaining mutable references', async () => {
  const q=structuredClone(queue), p=structuredClone(plan), run=await prepareRun(q,p);
  q[0].missing.push('later'); p.tools.pop();
  const result=await executeRun(await approveRun(run,'Reviewer'));
  assert.equal(result.outputs.drafts[0].message.includes('later'), false);
  assert.equal(run.state,'awaiting_approval');
});
test('local model receives aggregate counts only and output is validated', async () => {
  let request;
  const result=await proposeWithOllama(queue,'local-test',{fetchImpl:async(url,options)=>{request=JSON.parse(options.body);return {ok:true,json:async()=>({message:{content:JSON.stringify(plan)}})};}});
  assert.deepEqual(result,plan);
  assert.ok(!JSON.stringify(request).includes('DEMO-001'));
  assert.ok(!JSON.stringify(request).includes('assigned owner'));
});
test('model failure, unsupported tools, and nonlocal endpoints fail closed', async () => {
  await assert.rejects(proposeWithOllama(queue,'test',{baseUrl:'https://example.com'}), /local/);
  await assert.rejects(proposeWithOllama(queue,'test',{fetchImpl:async()=>({ok:false,status:503})}), /503/);
  await assert.rejects(proposeWithOllama(queue,'test',{fetchImpl:async()=>({ok:true,json:async()=>({message:{content:'{"goal":"bad","tools":["send_email"]}'}})})}), /blocked/);
});

// Reference checks cover UTF-8 and SHA-256 padding boundaries used by the HTTP preview fallback.
test('portable fingerprint matches Node crypto at padding boundaries and for Unicode', async () => {
  const {createHash}=await import('node:crypto');
  const {sha256Portable}=await import('./sha256.mjs');
  for(const value of ['', 'abc', 'évidence 🧪', ...[55,56,63,64,65,127,128,10000].map(n=>'x'.repeat(n))]) {
    assert.equal(sha256Portable(new TextEncoder().encode(value)),createHash('sha256').update(value).digest('hex'));
  }
});
