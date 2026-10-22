#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
import {auditClaims, searchSources} from './core.mjs';
const [command, sourcePath, arg, outPath, ...extra] = process.argv.slice(2);
try {
  if (!sourcePath || !arg || extra.length || !['search','audit'].includes(command)) throw new Error('Usage:\n  node cli.mjs search SOURCES.json "query" [OUTPUT.json]\n  node cli.mjs audit SOURCES.json CLAIMS.json [OUTPUT.json]');
  const sources = JSON.parse(await readFile(sourcePath, 'utf8'));
  const result = command === 'search' ? searchSources(sources, arg) : auditClaims(sources, JSON.parse(await readFile(arg,'utf8')));
  const output = JSON.stringify(result, null, 2)+'\n';
  if (outPath) { await writeFile(outPath, output, {flag:'wx'}); console.log('Saved audit; existing files are never overwritten.'); }
  else process.stdout.write(output);
} catch (error) { console.error(error.message); process.exitCode = 1; }
