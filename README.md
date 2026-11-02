# Vijay Bommireddy — personal website

Public portfolio: https://Vijay-glitch495.github.io/

A buildless GitHub Pages portfolio focused on healthcare automation, agents, and LLMs, alongside full-time business intelligence work and independent research. The restrained ivory, ink, and burgundy design uses the owner’s supplied professional portrait.

## Files and deployment

- `index.html`: concise introduction, portrait, and selected project previews.
- `projects.html`: six selected projects in three sections: automation and evidence, research and retrieval, and applied analytics.
- `research.html`: publications, filters, citation export, interests, and research news.
- `experience.html`: professional outcomes, employment, education, and résumé download.
- `peer-review.html`: conference and journal service, with track-specific roles.
- `contact.html`: contact form, direct email fallback, and professional profile links.
- `sitemap.xml`: canonical public page URLs.
- `thanks.html`: return page after a contact-form submission.
- `styles.css`: responsive presentation, keyboard focus styles, and print support.
- `visuals.css` and `visuals.js`: illustrated project cards, automatically playing three-step walkthroughs, subtle entrance effects, and a persistent pause-motion control. The operating system’s reduced-motion setting is respected.
- `assets/project-art/`: optimized original concept artwork and generation prompts.
- `script.js`: mobile navigation, publication filters, BibTeX copy, contact validation feedback, submission progress, and a prefilled email fallback.
- `projects/careflow/`: runnable approval-gated administrative workflow prototype, CLI, browser demo, tests, and README.
- `projects/evidence-ledger/`: runnable citation-auditing and lexical-retrieval prototype, CLI, browser demo, tests, and README.
- `projects/shared/`: shared demo presentation and browser helpers.
- `assets/`: portrait, exploratory project figure, résumé PDF, and favicon.
- `.nojekyll`: serve static files directly.

No build tool, package installation, or frontend API keys are needed. Publish `main` from the repository root in GitHub Pages settings. The site itself includes no analytics scripts. Contact submissions are handled by an external service as described below.

## Contact form: one-time owner activation required

The form uses a standard HTTPS POST to FormSubmit, addressed to `vijaybommireddy1@gmail.com`. This exact address was selected by the site owner. The `email` field supplies the visitor's reply address; `name`, `topic`, and `message` provide request context.

1. In the owner’s Gmail inbox, open the FormSubmit email titled **Action Required: Activate FormSubmit on https://vijay-glitch495.github.io/** and click **Activate Form**. Activation messages were confirmed in the inbox on October 21, 2026.
2. Submit a new test from the published website and complete the provider’s verification step.
3. Confirm that the message arrives and that Reply targets the visitor’s email address.

Automated setup was blocked by the provider. Inbox delivery has **not yet been verified**, and deployment alone does not activate it. The mailto link remains available for direct contact. After activation, record the verification date here.

The provider's default CAPTCHA is retained, `_honey` is an empty honeypot, and `_next` points to the absolute `https://Vijay-glitch495.github.io/thanks.html` URL. The form uses native browser validation and POST navigation. It names missing/invalid fields, shows progress, prevents rapid repeat clicks during navigation, and restores the button on return or timeout. It does not claim delivery in JavaScript. The fallback email link carries the entered subject and message into the visitor’s email application. This static site has no submission database or Gmail credentials.

Provider documentation: https://formsubmit.co/documentation

Provider privacy policy: https://formsubmit.co/privacy.pdf

If changing the recipient, update the form action, mailto links, thank-you page, and documentation, then activate and verify the new destination.

## Content maintenance

Edit the relevant dedicated HTML page. Navigation and footer markup is included on every page so links work without JavaScript. Update those shared regions consistently when changing navigation. The homepage script redirects old `/#research`, `/#projects`, `/#experience`, `/#service`, and `/#contact` links to their new pages. Each page has a unique title, description, canonical URL, and active navigation state. When adding publications, update filter counts and BibTeX in `script.js`. Distinguish published papers, accepted work, and preprints. Keep conference service track-specific. Per the owner’s correction, journal service is exactly **one completed review for JMIR Formative Research**; do not duplicate it under the publisher or another journal title. Do not publish manuscript assignments, private correspondence, or review contents.

The portrait was supplied by the owner on October 21, 2026; its original JPEG bytes are used without image editing. Employment, education, and professional outcome figures follow the owner's résumé, which is published with permission at `assets/Vijay_Bommireddy_Resume.pdf`. Replace that file to update the download.

The VALID-Agent figure comes from the [project repository](https://github.com/Vijay-glitch495/VALID-Agent/blob/main/docs/valid_agent_real_dashboard.png). It is exploratory: the source README explains heuristic labels, reconstructed fields, and scoring assumptions. Equipment Health Monitoring uses synthetic data. Food Demand Analysis describes repository artifacts and verified CSV coverage, not a measured business improvement. The project page is intentionally capped at six: CareFlow, Evidence Ledger, VALID-Agent, Medical RAG Chatbot, Equipment Health Monitoring, and Food Demand Analysis. Earlier repository work is retained on GitHub; the website does not enumerate the full account. Keep tutorial lineage and source acknowledgments with the selected studies.

## Academic service and reusable bio

`BIO.md` contains a reusable professional biography. Use **ACM FAccT 2027 — Reviewer** as a standard conference-service entry and include it as academic service in the homepage bio and Experience page. The owner requested plain reviewer labels without a separate featured invitation card. The owner supplied the OpenReview acceptance confirmation on October 28, 2026, for profile `~Vijay_Bommireddy3`. This records an accepted reviewer invitation, not completed reviews. Do not add a review count, a Program Committee title, or manuscript details without further confirmation. The existing JMIR Formative Research record remains one completed review.

## Public research references

- https://orcid.org/0009-0002-7639-6702 (owner’s ORCID iD, verified from an ORCID notification on October 23, 2026; linked from the homepage, Research, Contact, and shared footers)

- https://arxiv.org/abs/2609.06391
- https://doi.org/10.1109/ICIRCA54612.2022.9985724
- https://doi.org/10.1109/ICIRCA54612.2022.9985708
- https://doi.org/10.1109/ICESC54411.2022.9885619
- https://openreview.net/profile?id=~Vijay_Bommireddy3

## Prototype verification

Run from the repository root:

```bash
node --test projects/careflow/core.test.mjs projects/evidence-ledger/core.test.mjs
```

The prototypes share their engines between browser demos and CLIs. Examples are fictional software fixtures. They are not patient data, clinical studies, or evidence of deployment. The optional Ollama adapter has transport-stub tests; no real-model performance is claimed. Each project README defines its scope, reproduction steps, and limits.

## Motion and project selection

Project walkthroughs start automatically when their explanations enter the viewport and loop at five-second intervals. Manual step selection or each walkthrough’s Pause button stops that walkthrough. Focusing its controls pauses automatic playback for reading; Play can explicitly resume it. Global Pause motion controls on the Projects page and in the footer persist across visits. Device reduced-motion settings always take priority. Background tabs and offscreen walkthroughs suspend their timers. Decorative image and workflow animations run only while visible and stop with the same controls. None of these presentation animations executes project code.

Each project has a distinct automatic motion treatment: documents passing an approval gate (CareFlow), a quotation highlight and citation link (Evidence Ledger), trajectory and revisit tracing (VALID-Agent), passage scanning and retrieval (Medical RAG), a sensor waveform and classifier (Equipment Health), and report bars with row selection (Food Demand). All illustrations are conceptual, not measured outcomes or actual product screenshots. The website lists exactly six selected projects; additional repositories remain accessible from the GitHub profile.

## DeepMath posters and November 2026 service update

The Research page includes a separate `#posters` section for two DeepMath 2026 conference poster acceptances, presented October 29–30 in Columbus, Ohio. Presentation status is based on the owner's November 1 confirmation; the owner clarified on November 2 that both are conference poster acceptances. Count them as two accepted conference posters, separate from full conference-paper publications and reviewing service. The supplied Hankel poster is published unchanged; the weight-sharing poster was newly prepared from the supplied manuscript. Both downloads are 48 × 36 inch PDFs. **The source manuscripts are not published.** Presenter attribution is used because the supplied manuscripts omit author names.

`assets/posters/` contains the two posters and optimized WebP previews. The new poster's proof, analytical illustration, accuracy table, and bounds follow the supplied text. The 77.5% and 7.7% figures use different baselines; 80 of 160 fits reached the iteration cap. No classification advantage is claimed. Rebuild the new poster with `python scripts/build_weight_sharing_poster.py` (ReportLab, Matplotlib, PyMuPDF, and Pillow). The weight-sharing poster uses a distinct ivory-and-plum editorial design, side-by-side schedule diagrams, a serif title, and an asymmetric layout. Its presenter block uses the existing portrait asset; it does not copy artwork from the Hankel poster. The script rebuilds both its PDF and WebP preview without requiring a manuscript upload.

IEEE ISCAS 2027 is listed as reviews completed, based on the owner's explicit confirmation. TRUSTMORE 2026 and ICACCM 2026 are listed as reviewer service without completion counts or committee titles. TRUSTMORE is a workshop at IEEE BigData; ICACCM is technically co-sponsored by IEEE UP Section. These additions are separate from the existing FAccT invitation and the single JMIR review. No review assignments or private correspondence are published.

Official venue references:
- https://2027.ieee-iscas.org/
- https://trustmoreai.github.io/workshop2026/
- https://bigdataieee.org/BigData2026/program/workshops/
- https://www.icaccm.in/
- https://deepmath-conference.com/

## NeurIPS workshop service and presentation wording

The peer-review page has a dedicated `#neurips-workshops` section with nine 2026 workshop reviewer roles: AI4DD, AI4GOOD, AI4Science, BrainBodyFM, DiffuLM, GlobalSouthAI, Interp4Discovery, Verify-Agents, and WiML. The names and year were read from the owner's `Venues _ OpenReview History.pdf`, captured October 17, 2026, which lists each under **Your Active Consoles** as **Reviewers**. The source establishes reviewer-console membership; no completed-review count is inferred. These are workshop roles, not NeurIPS main-conference reviewing. UserSim is excluded because the available email only acknowledges an application. Do not publish the source account-history PDF or private review assignments.

The DeepMath section heading is now **DeepMath 2026 — Accepted conference posters**. The public website uses plain reviewer labels and lists FAccT with the other conferences. The underlying invitation status is retained here for content accuracy without foregrounding it on the website.
