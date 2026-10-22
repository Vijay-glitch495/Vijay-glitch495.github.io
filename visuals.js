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
      button.addEventListener('click', () => { stop(); show(index); });
    });
    play.hidden = false;
    play.addEventListener('click', () => {
      if (timer) { stop(); return; }
      if (isPaused()) return;
      show(0);
      copy.setAttribute('aria-live', 'off');
      playLabel.textContent = 'Pause walkthrough';
      playIcon.textContent = 'Ⅱ';
      play.setAttribute('aria-pressed', 'true');
      play.setAttribute('aria-label', `Pause ${projectName} walkthrough`);
      story.classList.add('is-playing');
      timer = setInterval(() => {
        if (active === steps.length - 1) { stop(); return; }
        show(active + 1);
      }, 3200);
    });
    const updateMotion = () => {
      if (isPaused()) stop();
      play.disabled = isPaused();
      play.title = isPaused() ? 'Motion is paused. Select any step to read it.' : 'Play a short illustrated explanation; this does not run the demo.';
    };
    document.addEventListener('portfolio-motion-change', updateMotion);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
    show(0, false);
    updateMotion();
  });
})();
