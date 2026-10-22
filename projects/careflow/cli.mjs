#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
import {prepareRun, approveRun, executeRun, proposeWithOllama} from './core.mjs';
const [command, ...args] = process.argv.slice(2);
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const write = async (path, data) => writeFile(path, JSON.stringify(data, null, 2) + '\n', {flag: 'wx'});
try {
  if (command === 'prepare' && args.length === 3) await write(args[2], await prepareRun(await read(args[0]), await read(args[1])));
  else if (command === 'approve' && args.length === 3) await write(args[2], await approveRun(await read(args[0]), args[1]));
  else if (command === 'execute' && args.length === 2) await write(args[1], await executeRun(await read(args[0])));
  else if (command === 'plan-local' && args.length === 3) await write(args[2], await proposeWithOllama(await read(args[0]), args[1]));
  else throw new Error('Usage:\n  node cli.mjs prepare QUEUE.json PLAN.json RUN.json\n  node cli.mjs approve RUN.json "Reviewer name" APPROVED.json\n  node cli.mjs execute APPROVED.json RESULT.json\n  node cli.mjs plan-local QUEUE.json INSTALLED_OLLAMA_MODEL PLAN.json');
  console.log('Saved. Existing output files are never overwritten.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
