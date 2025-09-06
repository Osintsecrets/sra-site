/* Wire up menu, theme, and CTA links. Update the data- attributes below with your real URLs. */
const LINKS = {
  intake: document.body.dataset?.intakeUrl || 'https://example.com/intake-consent',
  message: document.body.dataset?.messageUrl || 'https://wa.me/XXXXXXXXXXX'
};

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Persist theme
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.documentElement.classList.remove('dark');
}

// CTAs (top + hero + bottom)
const setHref = (id, url) => {
  const el = document.getElementById(id);
  if (el) el.setAttribute('href', url);
};
setHref('ctaMessageTop', LINKS.message);
setHref('ctaMessageTopMobile', LINKS.message);
setHref('ctaMessageHero', LINKS.message);
setHref('ctaMessageBottom', LINKS.message);

setHref('ctaStartHero', LINKS.intake);
setHref('ctaStartQuick', LINKS.intake);
setHref('ctaStartStandard', LINKS.intake);
setHref('ctaStartDeep', LINKS.message); // deep-dive usually starts with a chat
setHref('ctaStartBottom', LINKS.intake);
