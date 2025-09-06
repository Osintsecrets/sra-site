import { mountLayout } from './layout.js';
import { SRAi18n } from './i18n.js';

export async function sraInit(activePage) {
  await mountLayout(activePage);

  // i18n
  const i18n = new SRAi18n({
    defaultLang: localStorage.getItem('sra_lang') || 'en',
    supported: ['en','he'],
    dictionaries: {
      en: 'assets/i18n/en.json',
      he: 'assets/i18n/he.json'
    }
  });
  await i18n.init();
  window.__sra_i18n = i18n;

  // Respect language chosen by the slider (if set before this script runs)
  try {
    const savedLanguage = localStorage.getItem('language'); // 'english' | 'hebrew'
    if (savedLanguage === 'hebrew' && window.__sra_i18n?.setLang) {
      window.__sra_i18n.setLang('he');
      document.documentElement.setAttribute('lang','he');
      document.documentElement.setAttribute('dir','rtl');
      document.body.classList.add('hebrew-mode');
      document.body.classList.remove('english-mode');
    }
  } catch (_) {}

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.documentElement.classList.remove('dark');
  }

  // language toggle switch
  const langToggles = document.querySelectorAll('.language-toggle');
  const updateLanguage = (lang) => {
    document.querySelectorAll('[data-en][data-he]').forEach(el => {
      el.textContent = lang === 'he' ? el.getAttribute('data-he') : el.getAttribute('data-en');
    });
  };
  const applyLang = (lang) => {
    const isHebrew = lang === 'he';
    document.body.classList.toggle('hebrew-mode', isHebrew);
    document.body.classList.toggle('english-mode', !isHebrew);
    updateLanguage(lang);
    localStorage.setItem('language', isHebrew ? 'hebrew' : 'english');
    i18n.setLang(lang);
  };
  applyLang(i18n.current);
  langToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = document.body.classList.contains('hebrew-mode') ? 'en' : 'he';
      applyLang(next);
    });
  });

  // CTAs
  const LINKS = {
    intake: 'https://example.com/intake-consent',
    message: 'https://wa.me/XXXXXXXXXXX'
  };
  const setHref = (id, url) => { const el = document.getElementById(id); if (el) el.setAttribute('href', url); };
  setHref('ctaMessageTop', LINKS.message);
  setHref('ctaMessageTopMobile', LINKS.message);
  setHref('ctaMessageHero', LINKS.message);
  setHref('ctaMessageBottom', LINKS.message);
  setHref('ctaStartHero', LINKS.intake);
  setHref('ctaStartQuick', LINKS.intake);
  setHref('ctaStartStandard', LINKS.intake);
  setHref('ctaStartDeep', LINKS.message);
  setHref('ctaStartBottom', LINKS.intake);
  setHref('ctaMessageAbout', LINKS.message);

  // ----- Mega Menu (desktop) -----
  const megaBtn = document.getElementById('megaBtn');
  const megaPanel = document.getElementById('megaPanel');
  let megaTimer;

  function openMega() {
    if (!megaPanel) return;
    megaPanel.classList.remove('hidden');
    megaPanel.setAttribute('data-open','true');
    megaBtn?.setAttribute('aria-expanded','true');
  }
  function closeMega() {
    if (!megaPanel) return;
    megaPanel.classList.add('hidden');
    megaPanel.removeAttribute('data-open');
    megaBtn?.setAttribute('aria-expanded','false');
  }
  function toggleMega() {
    if (!megaPanel) return;
    if (megaPanel.classList.contains('hidden')) openMega(); else closeMega();
  }

  // Click to open/close
  megaBtn?.addEventListener('click', (e)=>{ e.preventDefault(); toggleMega(); });

  // Hover open/close for pointer devices
  const headerEl = document.querySelector('header');
  if (headerEl && window.matchMedia('(pointer:fine)').matches) {
    headerEl.addEventListener('mouseenter', ()=>{ clearTimeout(megaTimer); openMega(); });
    headerEl.addEventListener('mouseleave', ()=>{ megaTimer = setTimeout(closeMega, 120); });
  }

  // Close on outside click / ESC
  document.addEventListener('click', (e)=>{
    if (!megaPanel || !megaBtn) return;
    const within = megaPanel.contains(e.target) || megaBtn.contains(e.target);
    if (!within) closeMega();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMega(); });

  // Wire "Message" link inside mega
  setHref('ctaMessageTopMega', LINKS.message);

  // ----- Mobile hamburger -----
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenuEl = document.getElementById('mobileMenu');
  hamburgerBtn?.addEventListener('click', ()=>{
    mobileMenuEl?.classList.toggle('hidden');
  });

  // Mobile theme toggle mirrors desktop
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', ()=>{
      const html = document.documentElement;
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
  }
}

export function initTabs() {
  const tabButtons = document.querySelectorAll('.sra-tab');
  const tabPanels = document.querySelectorAll('[data-tab-panel]');

  function activateTab(name) {
    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === name;
      btn.classList.toggle('sra-tab-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      if (!isActive) btn.classList.add('text-white/70');
      else btn.classList.remove('text-white/70');
    });
    tabPanels.forEach(p => {
      p.classList.toggle('hidden', p.dataset.tabPanel !== name);
    });
    const main = document.getElementById('main');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });
  document.querySelectorAll('[data-jump-tab]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(a.dataset.jumpTab);
    });
  });
}

export function initEstimator() {
  const byId = (id) => document.getElementById(id);
  const estFormIds = ['timeframe','postsPerWeek','taggedFreq','commentsPerPost','groupsEvents','albums'];
  const estEls = Object.fromEntries(estFormIds.map(i => [i, byId(i)]).filter(([,el]) => el));
  const out = {
    ppw: byId('ppwOut'),
    tag: byId('taggedOut'),
    cpp: byId('cppOut'),
    ge: byId('geOut'),
    alb: byId('albOut'),
    items: byId('estItems'),
    effort: byId('estEffort'),
    pack: byId('estPackage')
  };

  if (estEls.postsPerWeek && out.ppw) estEls.postsPerWeek.addEventListener('input', () => out.ppw.textContent = estEls.postsPerWeek.value);
  if (estEls.taggedFreq && out.tag) estEls.taggedFreq.addEventListener('input', () => out.tag.textContent = estEls.taggedFreq.value);
  if (estEls.commentsPerPost && out.cpp) estEls.commentsPerPost.addEventListener('input', () => out.cpp.textContent = estEls.commentsPerPost.value);
  if (estEls.groupsEvents && out.ge) estEls.groupsEvents.addEventListener('input', () => out.ge.textContent = estEls.groupsEvents.value);
  if (estEls.albums && out.alb) estEls.albums.addEventListener('input', () => out.alb.textContent = estEls.albums.value);

  function calcEstimate() {
    if (!estEls.timeframe) return;

    const months = parseInt(estEls.timeframe.value || '12', 10);
    const weeks = Math.max(1, Math.round((months * 4.345)));
    const ppw = parseInt((estEls.postsPerWeek?.value || '0'), 10);
    const tagged = parseInt((estEls.taggedFreq?.value || '0'), 10);
    const cpp = parseInt((estEls.commentsPerPost?.value || '0'), 10);
    const ge = parseInt((estEls.groupsEvents?.value || '0'), 10);
    const alb = parseInt((estEls.albums?.value || '0'), 10);

    const posts = ppw * weeks;
    const taggedItems = tagged * weeks;
    const commentSamples = Math.round(posts * Math.min(0.35, cpp / 100));
    const geItems = Math.round(ge * Math.min(12, months/2));
    const photosFromAlbums = alb * 8;

    const total = posts + taggedItems + commentSamples + geItems + photosFromAlbums;

    let effort = 'Light';
    if (total > 250) effort = 'Moderate';
    if (total > 700) effort = 'Heavy';
    if (total > 1500) effort = 'Very Heavy';

    let pkg = 'Quick Check';
    if (months >= 36 || total > 300) pkg = 'Standard Audit';
    if (months >= 120 || total > 900) pkg = 'Deep Dive';

    if (out.items) out.items.textContent = total.toLocaleString();
    if (out.effort) out.effort.textContent = effort;
    if (out.pack) out.pack.textContent = pkg;
  }

  ['input','change'].forEach(evt => {
    Object.values(estEls).forEach(el => el && el.addEventListener(evt, calcEstimate));
  });
  calcEstimate();
}
