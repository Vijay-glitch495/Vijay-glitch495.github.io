import {prepareRun, approveRun, executeRun, validateQueue} from './core.mjs';
import {el, downloadJson, readExample} from '../shared/ui.mjs';
const $=id=>document.getElementById(id);
let run=null, revision=0;
function status(message,error=false){$('demo-status').textContent=message;$('demo-status').classList.toggle('error',error);}
function showQueue(queue){
  const table=el('table',null,'demo-table'), head=el('thead'), tr=el('tr');
  for(const title of ['Request','Team','Status','Missing']){const th=el('th',title);th.scope='col';tr.append(th);}head.append(tr);table.append(head);
  const body=el('tbody');
  for(const row of queue){const tr=el('tr');tr.append(el('td',row.id),el('td',row.team));const td=el('td');td.append(el('span',row.status,`status-chip ${row.status}`));tr.append(td,el('td',row.missing.join(', ')||'—'));body.append(tr);}
  table.append(body);$('queue-table').replaceChildren(table);
}
function invalidate(){revision++;run=null;$('review-content').hidden=true;$('review-placeholder').hidden=false;$('output-panel').hidden=true;$('execute').disabled=true;status('Input changed. Prepare a new plan to review it.');}
$('queue-input').addEventListener('input',invalidate);$('plan-choice').addEventListener('change',invalidate);
$('prepare').addEventListener('click',async()=>{
  const current=++revision;
  try{
    const queue=validateQueue(JSON.parse($('queue-input').value));showQueue(queue);
    const choice=$('plan-choice').value;
    const plan={goal:'Review the administrative queue and prepare useful outputs.',tools:choice==='blocked'?['send_email']:choice==='summary'?['summarize_queue']:['summarize_queue','draft_followups']};
    const candidate=await prepareRun(queue,plan);if(current!==revision)return;run=candidate;
    $('plan-goal').textContent=run.plan.goal;$('tool-list').replaceChildren(...run.plan.tools.map(tool=>el('li',tool==='summarize_queue'?'Summarize queue status and missing information':'Prepare follow-up drafts (no messages sent)')));
    $('approve-check').checked=false;$('approve').disabled=false;$('execute').disabled=true;$('fingerprint').textContent=`Plan + input fingerprint: ${run.fingerprint.slice(0,20)}…`;
    $('review-placeholder').hidden=true;$('review-content').hidden=false;$('output-panel').hidden=true;status('Plan prepared. Review the input and actions, then record your approval.');
  }catch(error){run=null;$('review-content').hidden=true;$('review-placeholder').hidden=false;$('output-panel').hidden=true;status(error.message,true);}
});
$('approve').addEventListener('click',async()=>{
  try{
    if(!run)throw new Error('Prepare a plan first.');
    if(!$('approve-check').checked)throw new Error('Check the review confirmation before approving.');
    const current=revision,candidate=await approveRun(run,$('reviewer').value);if(current!==revision)return;run=candidate;
    $('approve').disabled=true;$('execute').disabled=false;status('Approval recorded. You can now run these two bounded tools, or the summary tool alone if selected.');
  }catch(error){status(error.message,true);}
});
$('execute').addEventListener('click',async()=>{
  $('execute').disabled=true;
  try{
    const current=revision,candidate=await executeRun(run);if(current!==revision)return;run=candidate;
    const nodes=[];
    if(run.outputs.summary){const box=el('div',null,'result-metrics');for(const [value,label] of [[run.outputs.summary.total,'Requests'],[run.outputs.summary.needingFollowup,'Need follow-up']]){const span=el('span',value);span.append(el('small',label));box.append(span);}nodes.push(box);}
    for(const draft of run.outputs.drafts||[]){const card=el('article',null,'draft-card');card.append(el('h3',`${draft.recordId} · ${draft.team} · Draft only`),el('p',draft.message));nodes.push(card);}
    if(run.outputs.drafts?.length===0)nodes.push(el('p','No incomplete active requests require a follow-up draft.'));
    $('outputs').replaceChildren(...nodes);$('audit-log').replaceChildren(...run.audit.map(item=>el('li',`${item.type.replaceAll('_',' ')}${item.tool?' · '+item.tool:''} · ${new Date(item.at).toLocaleTimeString()}`)));
    $('output-panel').hidden=false;status('Run completed. Inspect the outputs and execution history. No messages were sent.');
  }catch(error){status(error.message,true);}
});
$('download').addEventListener('click',()=>{if(run?.state==='completed')downloadJson(run,'careflow-run.json');});
try{const queue=await readExample(new URL('./example-queue.json',import.meta.url));$('queue-input').value=JSON.stringify(queue,null,2);showQueue(queue);$('prepare').disabled=false;status('Example ready. Prepare a plan to start.');}catch(error){status(error.message,true);}
