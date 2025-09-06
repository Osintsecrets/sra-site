document.addEventListener('DOMContentLoaded', () => {
  // Support both desktop and mobile toggles
  const toggles = [document.getElementById('language-toggle'), document.getElementById('language-toggle-mobile')].filter(Boolean);
  const body = document.body;
  const html = document.documentElement;

  // User’s translation helper (data-en / data-he attributes)
  const updateLanguage = (lang) => {
    const elementsToTranslate = document.querySelectorAll('[data-en][data-he]');
    elementsToTranslate.forEach(element => {
      if (lang === 'hebrew') {
        element.textContent = element.getAttribute('data-he');
      } else {
        element.textContent = element.getAttribute('data-en');
      }
    });
  };

  // Apply lang to HTML dir/lang + optional JSON i18n if present
  const applyLangMeta = (lang) => {
    html.setAttribute('lang', lang === 'hebrew' ? 'he' : 'en');
    html.setAttribute('dir',  lang === 'hebrew' ? 'rtl' : 'ltr');
    // Keep any JSON i18n in sync if it exists
    if (window.__sra_i18n && typeof window.__sra_i18n.setLang === 'function') {
      window.__sra_i18n.setLang(lang === 'hebrew' ? 'he' : 'en');
    }
    // Mirror key used by any earlier loader
    localStorage.setItem('sra_lang', lang === 'hebrew' ? 'he' : 'en');
    // ARIA state
    toggles.forEach(t => t.setAttribute('aria-checked', lang === 'hebrew' ? 'true' : 'false'));
  };

  // Load saved preference
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage === 'hebrew') {
    body.classList.add('hebrew-mode');
    applyLangMeta('hebrew');
    updateLanguage('hebrew');
  } else {
    body.classList.add('english-mode');
    applyLangMeta('english');
    updateLanguage('english');
  }

  // Click listeners for both toggles
  toggles.forEach(toggleButton => {
    toggleButton.addEventListener('click', () => {
      const isHebrewMode = body.classList.toggle('hebrew-mode');
      body.classList.toggle('english-mode', !isHebrewMode);

      const currentLang = isHebrewMode ? 'hebrew' : 'english';
      localStorage.setItem('language', currentLang);
      applyLangMeta(currentLang);
      updateLanguage(currentLang);
    });
  });
});
