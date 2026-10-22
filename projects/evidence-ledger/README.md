# Evidence Ledger

**Source and quotation checks for inspecting generated answers.**

[Interactive demo](https://Vijay-glitch495.github.io/projects/evidence-ledger/) · [Portfolio](https://Vijay-glitch495.github.io/)

Evidence Ledger makes citation mechanics inspectable: search a supplied text collection, locate a cited source, compare an attributed quotation with that source, and export a claim-by-claim audit. It is intended as a small component to explore in healthcare RAG and LLM review workflows.

This is new prototype software created in October 2026. It is not a medical fact-checker, an entailment model, a systematic-review tool, or a clinically validated product. **A quotation can match even when the claim misinterprets it.** Semantic support is always labeled `not_evaluated`.

## What works

| Function | Output |
| --- | --- |
| Search | Ranked passages with source identity, provenance, matching terms, and a lexical score |
| Citation audit | `quote_found`, `source_missing`, `quote_missing`, `quote_not_found`, or `duplicate_citation` |
| Claim-level summary | `citation_checks_passed`, `needs_citation_repair`, or `uncited` |
| Export | Structured JSON retaining the claim text and inspected quotations |

The browser and command line import the same `core.mjs`. No model, API key, external network request, or third-party dependency is needed for core processing. The browser fetches only its own example files and code.

## Run locally

Requires **Node.js 22 or later**:

```bash
git clone https://github.com/Vijay-glitch495/Vijay-glitch495.github.io.git
cd Vijay-glitch495.github.io/projects/evidence-ledger
node --test core.test.mjs
node cli.mjs search example-sources.json "category assigned team"
node cli.mjs audit example-sources.json example-claims.json audit.json
```

Omit the final output path to print the JSON. If supplied, the output file must not already exist.

The shipped three-claim fixture produces one claim with passing citation checks, one needing citation repair, and one uncited claim. These deliberately constructed examples are **not research results, medical evidence, or benchmark accuracy**.

## Input contract

Sources are an array of objects with:

- `id`: unique exact identifier.
- `title`: descriptive source title.
- `text`: the actual text against which quotations will be checked.
- `origin`: provenance describing where the text came from.
- `url`: optional HTTP(S) URL, or `null`. The tool does not fetch or verify that URL.

Claims contain `id`, `text`, and `citations`. Each citation has `sourceId` and `quote`. Empty citation arrays are allowed and are reported as `uncited`. See the checked-in JSON files for complete examples. Demo source titles refer only to the fictional fixture text; they do not represent publications.

For real work, use source text you are authorized to process, preserve its provenance, and review extraction accuracy. A title or URL supplied by a caller is metadata, not proof of authenticity. Do not commit private source collections or exported audits into a public repository.

## How checks work

Quotation matching is case-sensitive after Unicode NFC and whitespace normalization. It checks the full source text, including quotations that cross a retrieval-passage boundary. Punctuation, altered words, and case differences are not silently repaired. Duplicate citations are flagged.

Search packs source text into roughly 1,200-character passages at word boundaries. It ranks matching query terms with collection-frequency weighting. This is simple lexical retrieval—not embeddings, medical terminology expansion, or semantic relevance assessment. Scores are ranking values, not confidence probabilities. It cannot guarantee recall of relevant evidence.

## Files and validation

- `core.mjs`: source validation, lexical retrieval, and citation checks.
- `cli.mjs`: JSON input and optional file export.
- `index.html` / `demo.mjs`: interactive browser demo.
- `core.test.mjs`: altered/absent/duplicate citations, provenance/URL validation, retrieval, and the boundary between quote matching and semantic support.
- `example-*.json`: original fictional fixture text.
- `../shared/`: styles and browser helpers; not required by CLI/core.

The tests include a deliberately unsupported statement with an authentic quotation. Citation checks pass while semantic support remains unevaluated. This is an explicit boundary of the tool, not evidence of clinical reliability.

## Limits

No automated assessment of clinical correctness, entailment, study quality, retractions, source recency, patient applicability, or conflicts of interest is provided. PDF extraction, source crawling, persistent storage, and LLM generation are outside this version. Human reviewers must inspect context and evidence quality.

## License

New project code: [MIT](LICENSE). Example text is original illustrative fixture content.
