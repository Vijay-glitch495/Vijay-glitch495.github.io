import {auditClaims,searchSources} from './core.mjs';
import {el,downloadJson,readExample} from '../shared/ui.mjs';
const $=id=>document.getElementById(id);
let report=null;
const labels={quote_found:'Quotation found',source_missing:'Source not found',quote_missing:'Quotation missing',quote_not_found:'Quotation does not match',duplicate_citation:'Duplicate citation',citation_checks_passed:'Citation checks passed',needs_citation_repair:'Citation needs repair',uncited:'No citations'};
function status(message,error=false){$('demo-status').textContent=message;$('demo-status').classList.toggle('error',error);}
function sources(){return JSON.parse($('source-input').value);}
function invalidate(){report=null;$('download').hidden=true;$('audit-results').replaceChildren();$('audit-placeholder').hidden=false;$('search-results').replaceChildren();status('Input changed. Run the checks again to update the report.');}
$('source-input').addEventListener('input',invalidate);$('claims-input').addEventListener('input',invalidate);
$('audit').addEventListener('click',()=>{
  try{
    report=auditClaims(sources(),JSON.parse($('claims-input').value));const nodes=[];
    const metrics=el('div',null,'result-metrics');for(const [value,label] of [[report.totalClaims,'Claims'],[report.counts.citation_checks_passed,'Citation checks passed'],[report.counts.needs_citation_repair+report.counts.uncited,'Need attention']]){const span=el('span',value);span.append(el('small',label));metrics.append(span);}nodes.push(metrics);
    for(const claim of report.results){const card=el('article',null,'claim-card');card.append(el('span',labels[claim.status],`status-chip ${claim.status}`),el('h3',claim.id),el('p',claim.text));
      for(const citation of claim.citations){const detail=el('div',null,'citation-detail');detail.append(el('strong',`${citation.sourceId} · ${labels[citation.check]}`),el('blockquote',citation.quote||'No quotation provided.'),el('small',citation.origin||'No matching source in the supplied collection.'));card.append(detail);}
      card.append(el('p','Semantic support: not evaluated.'));nodes.push(card);
    }
    $('audit-results').replaceChildren(...nodes);$('audit-placeholder').hidden=true;$('download').hidden=false;status('Citation checks complete. Review each claim and its context; matched quotations still need a human assessment of support.');
  }catch(error){report=null;$('download').hidden=true;$('audit-results').replaceChildren();$('audit-placeholder').hidden=false;status(error.message,true);}
});
$('search-form').addEventListener('submit',event=>{
  event.preventDefault();try{const hits=searchSources(sources(),$('query').value);const nodes=hits.map(hit=>{const card=el('article',null,'source-card');card.append(el('h3',hit.title),el('p',hit.text),el('small',`${hit.passageId} · Matched terms: ${hit.matchedTerms.join(', ')} · ${hit.origin}`));return card;});$('search-results').replaceChildren(...(nodes.length?nodes:[el('p','No matching passages. Try different terms.')]));status(`${hits.length} matching passage${hits.length===1?'':'s'} found.`);}catch(error){$('search-results').replaceChildren();status(error.message,true);}
});
$('download').addEventListener('click',()=>{if(report)downloadJson(report,'evidence-ledger-audit.json');});
try{const [s,c]=await Promise.all([readExample(new URL('./example-sources.json',import.meta.url)),readExample(new URL('./example-claims.json',import.meta.url))]);$('source-input').value=JSON.stringify(s,null,2);$('claims-input').value=JSON.stringify(c,null,2);$('audit').disabled=false;$('search').disabled=false;status('Example ready. Run the citation checks or search the source collection.');}catch(error){status(error.message,true);}
