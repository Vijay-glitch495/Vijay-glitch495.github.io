# Vijay Bommireddy — personal website

Public portfolio: https://Vijay-glitch495.github.io/

A buildless, responsive GitHub Pages website presenting full-time business intelligence work, independent research, selected projects, and academic service.

## Files and deployment

- `index.html`: biography, professional outcomes, experience, publications, curated projects, conference and journal reviewing, and contact form.
- `thanks.html`: return page after a contact-form submission.
- `styles.css`: responsive presentation, keyboard focus styles, reduced-motion and print support.
- `script.js`: mobile navigation, publication filters, and BibTeX copy with a manual-copy fallback.
- `assets/`: portrait, exploratory project figure, résumé PDF, and favicon.
- `.nojekyll`: serve static files directly.

No build tool, package installation, or frontend API keys are needed. Publish `main` from the repository root in GitHub Pages settings. The site itself includes no analytics scripts. Contact submissions are handled by an external service as described below.

## Contact form: one-time owner activation required

The form uses a standard HTTPS POST to FormSubmit, addressed to `vijaybommireddy1@gmail.com`. This exact address was selected by the site owner. The `email` field supplies the visitor's reply address; `topic`, `organization`, and `message` provide request context.

1. Open the **published website** and submit one test request from the Contact section.
2. Complete FormSubmit's spam check.
3. In the owner's Gmail inbox (also check spam), open the FormSubmit activation email and confirm the destination address.
4. Submit a second test and verify that the request arrives and Reply targets the visitor's address.

Automated setup was blocked by the provider. Inbox delivery has **not yet been verified**, and deployment alone does not activate it. The mailto link remains available for direct contact. After activation, record the verification date here.

The provider's default CAPTCHA is retained, `_honey` is an empty honeypot, and `_next` points to the absolute `https://Vijay-glitch495.github.io/thanks.html` URL. The form uses native browser validation and navigation; it never shows a JavaScript success message without contacting the provider. This static site has no submission database or Gmail credentials.

Provider documentation: https://formsubmit.co/documentation

Provider privacy policy: https://formsubmit.co/privacy.pdf

If changing the recipient, update the form action, mailto links, thank-you page, and documentation, then activate and verify the new destination.

## Content maintenance

Edit the relevant section in `index.html`. When adding publications, update filter counts and BibTeX in `script.js`. Distinguish published papers, accepted work, and preprints. Keep conference service track-specific and journal reviews separate. Do not publish manuscript assignments, private correspondence, or review contents.

The portrait comes from the previous portfolio. Employment, education, and professional outcome figures follow the owner's résumé, which is published with permission at `assets/Vijay_Bommireddy_Resume.pdf`. Replace that file to update the download.

The VALID-Agent figure comes from the [project repository](https://github.com/Vijay-glitch495/VALID-Agent/blob/main/docs/valid_agent_real_dashboard.png). It is exploratory: the source README explains heuristic labels, reconstructed fields, and scoring assumptions. Equipment Health Monitoring uses synthetic data. Food Demand Analysis describes repository artifacts and verified CSV coverage, not a measured business improvement. Other engineering studies and coursework remain available through the GitHub profile with their source acknowledgments.

## Public research references

- https://arxiv.org/abs/2609.06391
- https://doi.org/10.1109/ICIRCA54612.2022.9985724
- https://doi.org/10.1109/ICIRCA54612.2022.9985708
- https://doi.org/10.1109/ICESC54411.2022.9885619
- https://openreview.net/profile?id=~Vijay_Bommireddy3
