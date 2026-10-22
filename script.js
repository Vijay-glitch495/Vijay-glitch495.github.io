'use strict';

document.body.classList.add('js');
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '+';
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});
window.matchMedia('(min-width: 961px)').addEventListener('change', () => setMenu(false));

const filterGroup = document.querySelector('.publication-filters');
const papers = [...document.querySelectorAll('.publication')];
if (filterGroup) filterGroup.hidden = false;
filterGroup?.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    let count = 0;
    papers.forEach(paper => {
      paper.hidden = selected !== 'all' && paper.dataset.type !== selected;
      if (!paper.hidden) count += 1;
    });
    filterGroup.querySelectorAll('button').forEach(control => {
      const active = control === button;
      control.classList.toggle('active', active);
      control.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('publication-status').textContent = `Showing ${count} ${selected === 'all' ? 'publications' : selected === 'preprint' ? 'preprint' : 'conference papers'}.`;
  });
});

const citations = {
  rag: `@misc{bommireddy2026trustworthy,
  title = {Building Trustworthy Graph-Agentic RAG for Social Good: Architectures, Failure Propagation, and Assurance by Construction},
  author = {Bommireddy, Vijay and Bommireddy, Raviteja},
  year = {2026},
  eprint = {2609.06391},
  archivePrefix = {arXiv},
  url = {https://arxiv.org/abs/2609.06391}
}`,
  traffic: `@inproceedings{reddy2022traffic,
  title = {Traffic Congestion Index Estimation for Road Using Fuzzy Logic},
  author = {Reddy, Bommireddy Vijay Kumar and Khan, Zoheib Tufail and Reddy, S. KeerthiNandan and Sheelam, Pranitha Reddy and RajaReddy, Syamala and Lenka, Sushant},
  booktitle = {2022 4th International Conference on Inventive Research in Computing Applications (ICIRCA)},
  year = {2022},
  pages = {1525--1528},
  doi = {10.1109/ICIRCA54612.2022.9985724}
}`,
  chikungunya: `@inproceedings{reddy2022chikungunya,
  title = {Data Science System of Predicting and Detecting the Chikungunya Virus using Ensemble Techniques},
  author = {Reddy, Bommireddy Vijay Kumar and Patel, Shail and Singh, Anayna and Singh, Nishant and Ranjit, Sasanapuri and Dantkale, Shreyas},
  booktitle = {2022 4th International Conference on Inventive Research in Computing Applications (ICIRCA)},
  year = {2022},
  pages = {1420--1423},
  doi = {10.1109/ICIRCA54612.2022.9985708}
}`,
  bankruptcy: `@inproceedings{kothuru2022bankruptcy,
  title = {Prediction of Bankruptcy of a company using machine learning techniques},
  author = {Kothuru, Vivek and Jha, Raman Kumar and Ranjit, Sasanapuri and Kumar Reddy, Bommireddy Vijay and Roy, Sagnik and Sudheer, Sachin},
  booktitle = {2022 3rd International Conference on Electronics and Sustainable Communication Systems (ICESC)},
  year = {2022},
  doi = {10.1109/ICESC54411.2022.9885619}
}`
};
const toast = document.getElementById('toast');
let toastTimer;
document.querySelectorAll('.citation-button').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const citation = citations[button.dataset.citation];
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(citation);
      toast.textContent = 'BibTeX citation copied';
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
    } catch {
      const dialog = document.getElementById('citation-dialog');
      const field = document.getElementById('citation-text');
      field.value = citation;
      dialog.showModal();
      field.focus();
      field.select();
    }
  });
});

// Preserve native POST/CAPTCHA behavior; give feedback before leaving the page.
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  const status = document.getElementById('form-status');
  const submit = contactForm.querySelector('[type="submit"]');
  const label = submit.querySelector('.submit-label');
  const fallback = document.getElementById('email-fallback');
  let recoveryTimer;
  const setStatus = message => { status.textContent = message; status.hidden = false; };
  contactForm.addEventListener('invalid', event => {
    const field = contactForm.querySelector('input:invalid, select:invalid, textarea:invalid') || event.target;
    const fieldLabel = contactForm.querySelector(`label[for="${field.id}"]`)?.textContent || 'This field';
    setStatus(`${fieldLabel}: ${field.validationMessage}`);
  }, true);
  contactForm.addEventListener('input', () => {
    const values = new FormData(contactForm);
    const topic = String(values.get('topic') || 'Portfolio inquiry');
    const body = `Name: ${values.get('name') || ''}\nReply email: ${values.get('email') || ''}\n\n${values.get('message') || ''}`;
    fallback.href = `mailto:vijaybommireddy1@gmail.com?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(body)}`;
  });
  contactForm.addEventListener('submit', () => {
    submit.disabled = true;
    label.textContent = 'Opening verification…';
    setStatus('Opening FormSubmit. Complete its verification step to submit your message. If the next page does not open, use the email link below.');
    recoveryTimer = setTimeout(() => {
      submit.disabled = false;
      label.textContent = 'Try again';
      setStatus('If verification did not open, use “Open your email app” below. Your message is included automatically. Delivery has not been confirmed on this page.');
    }, 15000);
  });
  window.addEventListener('pageshow', () => {
    clearTimeout(recoveryTimer);
    submit.disabled = false;
    label.textContent = 'Send message';
    status.hidden = true;
  });
}

// Compatibility for links shared before the portfolio became multi-page.
const legacyPages = { '#projects': 'projects.html', '#experience': 'experience.html', '#research': 'research.html', '#service': 'peer-review.html', '#contact': 'contact.html' };
function followLegacyLink() {
  if ((location.pathname === '/' || location.pathname.endsWith('/index.html')) && legacyPages[location.hash]) {
    location.replace(legacyPages[location.hash]);
  }
}
followLegacyLink();
window.addEventListener('hashchange', followLegacyLink);
