import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {auditClaims, searchSources, validateSources} from './core.mjs';
const sources=JSON.parse(await readFile(new URL('./example-sources.json', import.meta.url)));
const claims=JSON.parse(await readFile(new URL('./example-claims.json', import.meta.url)));
const one=(quote,sourceId='DEMO-OPS')=>[{id:'one',text:'A test assertion.',citations:[{sourceId,quote}]}];
test('audit distinguishes matching, altered, and absent citations',()=>{
  const report=auditClaims(sources,claims);
  assert.deepEqual(report.counts,{citation_checks_passed:1,needs_citation_repair:1,uncited:1});
  assert.ok(report.results.every(r=>r.semanticSupport==='not_evaluated'));
});
test('normalizes whitespace but preserves quotation case and words',()=>{
  assert.equal(auditClaims(sources,one('Administrative   requests\nmust include a category')).results[0].status,'citation_checks_passed');
  assert.equal(auditClaims(sources,one('administrative requests must include a category')).results[0].status,'needs_citation_repair');
  assert.equal(auditClaims(sources,one('Administrative requests need a category')).results[0].status,'needs_citation_repair');
});
test('unknown sources and empty quotes remain visible failures',()=>{
  assert.equal(auditClaims(sources,one('a quote','missing')).results[0].citations[0].check,'source_missing');
  assert.equal(auditClaims(sources,one('   ')).results[0].citations[0].check,'quote_missing');
});
test('duplicate citations do not count as additional evidence',()=>{
  const c=structuredClone(claims[0]);c.citations.push(structuredClone(c.citations[0]));
  assert.equal(auditClaims(sources,[c]).results[0].citations[1].check,'duplicate_citation');
});
test('citation mechanics never certify semantic support, even for a false statement',()=>{
  const c=structuredClone(claims[0]);c.text='This quotation proves an unrelated treatment is effective.';
  const report=auditClaims(sources,[c]);
  assert.equal(report.results[0].status,'citation_checks_passed');
  assert.equal(report.results[0].semanticSupport,'not_evaluated');
});
test('search returns source identity and only passages matching query terms',()=>{
  const hits=searchSources(sources,'category assigned team');
  assert.equal(hits[0].sourceId,'DEMO-OPS');
  assert.deepEqual(hits[0].matchedTerms,['category','assigned','team']);
  assert.equal(searchSources(sources,'xyzunfindable').length,0);
});
test('source IDs are exact, duplicate IDs are rejected',()=>{
  assert.throws(()=>validateSources([sources[0],sources[0]]),/Duplicate/);
  assert.equal(auditClaims(sources,one('Administrative requests','demo-ops')).results[0].citations[0].check,'source_missing');
});
test('untrusted URL schemes, missing provenance, and malformed claims are rejected',()=>{
  assert.throws(()=>validateSources([{...sources[0],url:'javascript:alert(1)'}]),/HTTP/);
  assert.throws(()=>validateSources([{...sources[0],origin:''}]),/provenance/);
  assert.throws(()=>auditClaims(sources,[{id:'x',text:'x',citations:'wrong'}]),/citations/);
});
test('cross-passage quotation remains valid against the original full source',()=>{
  const text='word '.repeat(300)+'end boundary '+ 'word '.repeat(300);
  const s=[{id:'long',title:'Long source',text,origin:'Test fixture',url:null}];
  assert.ok(searchSources(s,'boundary')[0].text.includes('boundary'));
  assert.equal(auditClaims(s,one('end boundary','long')).results[0].status,'citation_checks_passed');
});
