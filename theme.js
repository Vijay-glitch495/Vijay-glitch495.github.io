/* Apply the saved preference before paint; bind controls after markup is ready. */
(() => {
  'use strict';
  const key = 'vijay-portfolio-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'dark' || saved === 'light') preference = saved;
  } catch { /* Theme switching still works when storage is unavailable. */ }
  function apply(theme) {
    root.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(button => {
      const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.title = label;
      button.hidden = false;
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101820' : '#faf9f6');
  }
  function resolvedTheme() { return preference || (system.matches ? 'dark' : 'light'); }
  apply(resolvedTheme());
  function bind() {
    apply(resolvedTheme());
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(preference);
      try { localStorage.setItem(key, preference); } catch { /* Session-only fallback. */ }
    }));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  system.addEventListener('change', () => { if (!preference) apply(resolvedTheme()); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : null;
    apply(resolvedTheme());
  });
})();
