# Vijay Bommireddy — personal website

Public portfolio: https://Vijay-glitch495.github.io/

A buildless GitHub Pages portfolio focused on healthcare automation, agents, and LLMs, alongside full-time business intelligence work and independent research. The restrained ivory, ink, and burgundy design uses the owner’s supplied professional portrait.

## Files and deployment

- `index.html`: biography, professional outcomes, experience, publications, curated projects, conference and journal reviewing, and contact form.
- `thanks.html`: return page after a contact-form submission.
- `styles.css`: responsive presentation, keyboard focus styles, reduced-motion and print support.
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

Edit the relevant section in `index.html`. When adding publications, update filter counts and BibTeX in `script.js`. Distinguish published papers, accepted work, and preprints. Keep conference service track-specific. Per the owner’s correction, journal service is exactly **one completed review for JMIR Formative Research**; do not duplicate it under the publisher or another journal title. Do not publish manuscript assignments, private correspondence, or review contents.

The portrait was supplied by the owner on October 21, 2026; its original JPEG bytes are used without image editing. Employment, education, and professional outcome figures follow the owner's résumé, which is published with permission at `assets/Vijay_Bommireddy_Resume.pdf`. Replace that file to update the download.

The VALID-Agent figure comes from the [project repository](https://github.com/Vijay-glitch495/VALID-Agent/blob/main/docs/valid_agent_real_dashboard.png). It is exploratory: the source README explains heuristic labels, reconstructed fields, and scoring assumptions. Equipment Health Monitoring uses synthetic data. Food Demand Analysis describes repository artifacts and verified CSV coverage, not a measured business improvement. Other engineering studies and coursework remain available through the GitHub profile with their source acknowledgments.

## Public research references

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
