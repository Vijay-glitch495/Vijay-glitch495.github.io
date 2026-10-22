# CareFlow

![Concept illustration for CareFlow](../../assets/project-art/careflow.webp)

*Concept artwork; not a product screenshot or experimental result.*

**A bounded administrative workflow prototype for exploring human oversight in healthcare automation.**

[Interactive demo](https://Vijay-glitch495.github.io/projects/careflow/) · [Portfolio](https://Vijay-glitch495.github.io/)

CareFlow turns a structured plan into inspectable outputs. It accepts an administrative queue, validates a small allowlist of tools, records explicit approval of the exact plan and input, then creates a queue summary and follow-up **drafts**. It never sends those drafts.

This is new prototype software created in October 2026. It is not a deployed healthcare system, an authenticated approval service, or a clinical decision tool. The examples are fictional administrative fixtures, not patient records or empirical evaluation data.

## What works

| Capability | Implementation |
| --- | --- |
| Input validation | Unique record IDs, bounded fields, explicit status values, and a missing-items list |
| Bounded plans | Only `summarize_queue` and `draft_followups`; unknown and repeated tools are rejected |
| Review before execution | Separate prepare, approve, and execute operations |
| Stale-input detection | SHA-256 fingerprint of normalized input, plan, and engine version |
| Inspectable outputs | Queue counts, draft messages, reviewer label, and execution-event history |
| Optional local LLM proposal | Ollama structured-output adapter using aggregate queue counts only |
| Browser demo | Same `core.mjs` as the CLI; runs without an API key or model |

## Run locally

Requires **Node.js 22 or later**. No packages need installation.

```bash
git clone https://github.com/Vijay-glitch495/Vijay-glitch495.github.io.git
cd Vijay-glitch495.github.io/projects/careflow
node --test core.test.mjs
node cli.mjs prepare example-queue.json example-plan.json pending.json
```

Inspect `pending.json`, including the queue and proposed tools, before approving:

```bash
node cli.mjs approve pending.json "Your name" approved.json
node cli.mjs execute approved.json result.json
```

Each output path must be new; the CLI refuses to overwrite an existing file. The result includes the complete input snapshot, outputs, and event history. Store real input and output locally outside public repositories.

The shipped example yields **4 requests**, **2 needing follow-up**, and **2 draft messages**. These are fixture outputs, not measured operational improvements.

## Optional local model

With Ollama running locally and a compatible model already installed:

```bash
node cli.mjs plan-local example-queue.json YOUR_INSTALLED_MODEL model-plan.json
node cli.mjs prepare example-queue.json model-plan.json model-pending.json
```

Review the generated plan, then use the same explicit approval and execution steps. The adapter sends only aggregate counts to `http://127.0.0.1:11434/api/chat`, requests a JSON schema, and validates the response again. Only localhost/loopback destinations are accepted by the adapter. Model output cannot expand the tool allowlist.

The adapter follows [Ollama's structured-output documentation](https://docs.ollama.com/capabilities/structured-outputs). Its request shape and failure handling were tested with a stub transport; **real-model inference has not been run or benchmarked**. Model quality, hardware requirements, and clinical appropriateness are not evaluated here.

## Architecture

`queue + plan → validation → pending run → explicit approval → bounded execution → outputs + events`

- `core.mjs`: shared validation, state transitions, tools, fingerprint, and optional model adapter.
- `sha256.mjs`: standard Web Crypto fingerprinting with a portable SHA-256 fallback for local HTTP previews, checked against Node crypto at padding boundaries and with Unicode.
- `cli.mjs`: file-based workflow; exclusive output writes.
- `demo.mjs` / `index.html`: interactive, browser-only demonstration.
- `core.test.mjs`: rejection, approval, stale-input, output, and adapter tests.
- `example-*.json`: clearly labeled fictional fixtures.
- `../shared/`: visual styles and browser helpers shared by the two portfolio demos. CLI/core do not depend on them.

## Limits and next work

The fingerprint detects changes relative to a saved plan; it is not a signature or tamper-proof audit. A person with file access can rewrite the run and approval. Reviewer names are not authenticated. Replaying a saved approved file can recompute the same local outputs; there is no distributed idempotency service. The program has no clinical rules, patient prioritization, EHR integration, email transport, production identity, or compliance certification.

Future deployment would require appropriate identity and access controls, durable state, authenticated approvals, threat modeling, data governance, task-specific evaluation, and operational review. No healthcare outcome or productivity gain is claimed for this prototype.

## License

New project code: [MIT](LICENSE). Example text is original illustrative fixture content.
