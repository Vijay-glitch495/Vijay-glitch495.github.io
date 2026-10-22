/** Citation mechanics for inspecting LLM output. This is not an entailment model. */
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
const normalized = value => value.normalize('NFC').replace(/\s+/gu, ' ').trim();
const tokens = value => [...new Set(value.toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+/gu) || [])];
function requiredText(value, name, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${name} must be nonempty text (maximum ${max} characters).`);
  return value.trim();
}
export function validateSources(sources) {
  if (!Array.isArray(sources) || !sources.length || sources.length > 500) throw new Error('Provide 1–500 sources.');
  const seen = new Set();
  return sources.map(source => {
    if (!isRecord(source)) throw new Error('Each source must be an object.');
    const id = requiredText(source.id, 'Source ID', 100);
    if (seen.has(id)) throw new Error(`Duplicate source ID: ${id}`);
    seen.add(id);
    let url = null;
    if (source.url != null && source.url !== '') {
      const parsed = new URL(source.url);
      if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Source URLs must use HTTP(S) without credentials.');
      url = parsed.href;
    }
    return {id, title: requiredText(source.title, 'Source title', 300), text: requiredText(source.text, 'Source text', 50000),
      origin: requiredText(source.origin, 'Source provenance', 1000), url};
  });
}
function splitPassages(source, maxChars = 1200) {
  // Paragraphs are packed at word boundaries; quotations are audited against the full source.
  const words = source.text.split(/\s+/u), parts = [];
  let current = '';
  for (const word of words) {
    if (current && current.length + word.length + 1 > maxChars) { parts.push(current); current = ''; }
    current += (current ? ' ' : '') + word;
  }
  if (current) parts.push(current);
  return parts.map((text, i) => ({sourceId: source.id, passageId: `${source.id}:${i+1}`, title: source.title, text, origin: source.origin, url: source.url}));
}
export function searchSources(sources, query, limit = 5) {
  const documents = validateSources(sources);
  const terms = tokens(requiredText(query, 'Query', 1000));
  if (!terms.length) return [];
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('Result limit must be an integer from 1 to 20.');
  const passages = documents.flatMap(source => splitPassages(source));
  const termSets = passages.map(p => new Set(tokens(p.text)));
  const weights = new Map(terms.map(term => [term, 1 + Math.log((passages.length + 1) / (1 + termSets.filter(set => set.has(term)).length))]));
  return passages.map((passage, i) => {
    const matchedTerms = terms.filter(term => termSets[i].has(term));
    const score = matchedTerms.reduce((sum, term) => sum + weights.get(term), 0);
    return {...passage, matchedTerms, score: Math.round(score * 10000) / 10000};
  }).filter(p => p.score > 0).sort((a,b) => b.score-a.score || a.passageId.localeCompare(b.passageId)).slice(0,limit);
}
export function auditClaims(sources, claims) {
  const documents = validateSources(sources), byId = new Map(documents.map(source => [source.id, source]));
  if (!Array.isArray(claims) || !claims.length || claims.length > 1000) throw new Error('Provide 1–1,000 claims.');
  const ids = new Set();
  const results = claims.map(claim => {
    if (!isRecord(claim)) throw new Error('Each claim must be an object.');
    const id = requiredText(claim.id, 'Claim ID', 100);
    if (ids.has(id)) throw new Error(`Duplicate claim ID: ${id}`);
    ids.add(id);
    const statement = requiredText(claim.text, 'Claim text', 10000);
    if (!Array.isArray(claim.citations) || claim.citations.length > 30) throw new Error(`Invalid citations for ${id}.`);
    const seen = new Set();
    const citations = claim.citations.map(citation => {
      if (!isRecord(citation)) throw new Error(`Invalid citation in ${id}.`);
      const sourceId = requiredText(citation.sourceId, 'Citation source ID', 100);
      const quote = typeof citation.quote === 'string' ? citation.quote : '';
      if (quote.length > 10000) throw new Error('Quotation exceeds 10,000 characters.');
      const signature = JSON.stringify([sourceId, normalized(quote)]), duplicate = seen.has(signature);
      seen.add(signature);
      const source = byId.get(sourceId);
      let check = 'quote_found';
      if (duplicate) check = 'duplicate_citation';
      else if (!source) check = 'source_missing';
      else if (!normalized(quote)) check = 'quote_missing';
      else if (!normalized(source.text).includes(normalized(quote))) check = 'quote_not_found';
      return {sourceId, quote, check, sourceTitle: source?.title || null, origin: source?.origin || null, sourceUrl: source?.url || null};
    });
    const status = !citations.length ? 'uncited' : citations.some(c => c.check !== 'quote_found') ? 'needs_citation_repair' : 'citation_checks_passed';
    return {id, text: statement, status, semanticSupport: 'not_evaluated', citations};
  });
  const counts = {citation_checks_passed: 0, needs_citation_repair: 0, uncited: 0};
  results.forEach(result => counts[result.status]++);
  return {version:'1.0.0', totalClaims: results.length, counts, results,
    limitation:'Exact quotation checks do not establish that a claim is supported, medically correct, current, or appropriate for a patient. Human source review is still required.'};
}
