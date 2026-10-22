'use strict';

// Presentation only: these illustrated walkthroughs never execute project code.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = [...document.querySelectorAll('.motion-toggle')];
  const storageKey = 'vijay-portfolio-motion-paused';
  let chosenPause = false;
  try { chosenPause = localStorage.getItem(storageKey) === 'true'; } catch { /* Optional preference storage. */ }
  const isPaused = () => preference.matches || chosenPause;
  const applyMotion = () => {
    document.body.classList.toggle('motion-paused', isPaused());
    controls.forEach(button => {
      button.hidden = false;
      button.disabled = preference.matches;
      button.setAttribute('aria-pressed', String(isPaused()));
      button.textContent = preference.matches ? 'Reduced motion' : chosenPause ? 'Resume motion' : 'Pause motion';
      button.title = preference.matches ? 'Your device’s reduced-motion preference is enabled.' : 'Control decorative animations and illustrated walkthrough playback.';
    });
    document.dispatchEvent(new CustomEvent('portfolio-motion-change'));
  };
  controls.forEach(button => button.addEventListener('click', () => {
    chosenPause = !chosenPause;
    try { localStorage.setItem(storageKey, String(chosenPause)); } catch { /* Nothing is required to persist. */ }
    applyMotion();
  }));
  preference.addEventListener('change', applyMotion);
  applyMotion();

  // Decorative motion runs only on screen; the same global control stops it.
  const ambient = [...document.querySelectorAll('[data-ambient]')];
  if ('IntersectionObserver' in window) {
    const ambientObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-visible', entry.isIntersecting));
    }, { threshold: 0.15 });
    ambient.forEach(element => ambientObserver.observe(element));
  }
  const updateVisibility = () => document.body.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();

  // Content remains visible without JS, IntersectionObserver, or motion support.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!isPaused()) entry.target.classList.add('enter-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const stories = {
    careflow: [
      ['Start with the queue.', 'Inspect illustrative administrative requests and the details that are missing.'],
      ['A person approves the plan.', 'Only allowed tools can run, after explicit review of the proposed actions.'],
      ['Produce drafts you can inspect.', 'Generate summaries, follow-up drafts, and an execution log. No messages are sent.']
    ],
    evidence: [
      ['Bring the source text into view.', 'Search the supplied collection and keep each passage tied to its source.'],
      ['Check what was actually quoted.', 'Flag missing source IDs, absent citations, and quotations that do not match.'],
      ['Leave judgment with the reader.', 'Matching text is a mechanical check. A person still assesses whether it supports the claim.']
    ]
  };
  document.querySelectorAll('[data-walkthrough]').forEach(story => {
    const steps = stories[story.dataset.walkthrough];
    const projectName = story.dataset.walkthrough === 'careflow' ? 'CareFlow' : 'Evidence Ledger';
    if (!steps) return;
    const buttons = [...story.querySelectorAll('.walk-step')];
    const copy = story.querySelector('.walk-explanation');
    const play = story.querySelector('.walk-play');
    const playLabel = play.querySelector('.play-label');
    const playIcon = play.querySelector('.play-icon');
    let active = 0;
    let timer;
    let inView = false;
    let manuallyPaused = false;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
      story.classList.remove('is-playing');
      play.setAttribute('aria-pressed', 'false');
      play.setAttribute('aria-label', `Play ${projectName} walkthrough`);
      playLabel.textContent = 'Play walkthrough';
      playIcon.textContent = '▷';
      copy.setAttribute('aria-live', 'polite');
    };
    const show = (index, animate = true) => {
      active = index;
      story.dataset.activeStep = String(index);
      buttons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
        button.setAttribute('aria-pressed', String(i === index));
      });
      copy.querySelector('h3').textContent = steps[index][0];
      copy.querySelector('p').textContent = steps[index][1];
      if (animate && !isPaused()) {
        copy.classList.remove('copy-change');
        void copy.offsetWidth;
        copy.classList.add('copy-change');
      }
    };
    buttons.forEach((button, index) => {
      button.disabled = false;
      button.addEventListener('click', () => { manuallyPaused = true; stop(); show(index); });
    });
    play.hidden = false;
    const start = () => {
      if (timer || isPaused() || !inView || document.hidden || manuallyPaused) return;
      copy.setAttribute('aria-live', 'off');
      playLabel.textContent = 'Pause walkthrough';
      playIcon.textContent = 'Ⅱ';
      play.setAttribute('aria-pressed', 'true');
      play.setAttribute('aria-label', `Pause ${projectName} walkthrough`);
      story.classList.add('is-playing');
      timer = setInterval(() => {
        show((active + 1) % steps.length);
      }, 5000);
    };
    const syncPlayback = () => {
      if (isPaused() || !inView || document.hidden || manuallyPaused) stop();
      else start();
    };
    play.addEventListener('click', () => {
      if (timer) { manuallyPaused = true; stop(); return; }
      manuallyPaused = false;
      start();
    });
    // Keyboard readers can inspect the explanation without it changing underneath them.
    story.addEventListener('focusin', event => {
      if (event.target.matches(':focus-visible')) { manuallyPaused = true; stop(); }
    });
    const updateMotion = () => {
      play.disabled = isPaused();
      play.title = isPaused() ? 'Motion is paused. Select any step to read it.' : 'Automatically plays while visible. Pause at any time; this does not run the demo.';
      syncPlayback();
    };
    document.addEventListener('portfolio-motion-change', updateMotion);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', syncPlayback);
    if ('IntersectionObserver' in window) {
      const playbackObserver = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.25 });
      playbackObserver.observe(story.querySelector('.walkthrough'));
    } else {
      inView = true;
    }
    show(0, false);
    updateMotion();
  });

  // The full repository directory is server-rendered; JS adds discovery controls.
  const directory = document.querySelector('.project-directory');
  if (directory) {
    const search = directory.querySelector('#project-search');
    const filters = [...directory.querySelectorAll('.directory-filters button')];
    const rows = [...directory.querySelectorAll('.repository-row')];
    const status = directory.querySelector('#directory-status');
    let category = 'all';
    directory.querySelector('.directory-tools').hidden = false;
    const filter = () => {
      const query = search.value.trim().toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => {
        const matchesCategory = category === 'all' || row.dataset.category === category;
        row.hidden = !matchesCategory || !terms.every(term => row.dataset.search.includes(term));
        if (!row.hidden) count++;
      });
      status.textContent = `Showing ${count} of ${rows.length} repositories`;
      directory.querySelector('.directory-empty').hidden = count !== 0;
      filters.forEach(button => {
        const selected = button.dataset.category === category;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    };
    search.addEventListener('input', filter);
    filters.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.category;
      filter();
    }));
    filter();
  }
})();
