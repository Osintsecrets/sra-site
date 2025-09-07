import { SRAi18n } from './i18n.js';
import { mountLayout } from './layout.js';

function applyLanguage(i18n, code){
  const html = document.documentElement;
  const body = document.body;
  const lang = (code === 'he') ? 'he' : 'en';
  localStorage.setItem('language', lang);
  body.classList.toggle('hebrew-mode', lang==='he');
  body.classList.toggle('english-mode', lang!=='he');
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang==='he' ? 'rtl' : 'ltr');
  i18n.setLanguage(lang);
}

function wireLanguageToggles(i18n){
  document.addEventListener('click', (e)=>{
    const el = e.target.closest('#language-toggle');
    if(!el) return;
    const current = localStorage.getItem('language') || 'en';
    applyLanguage(i18n, current==='he' ? 'en' : 'he');
  });
}

async function mountSidebar(pageKey, i18n){
  if(pageKey === 'home') return; // no sidebar on home
  const host = document.querySelector('#sra-sidebar');
  if(!host) return;

  const res = await fetch('partials/sidebar.html');
  host.innerHTML = await res.text();

  // open/close (mobile)
  const aside = host.querySelector('.sra-sidebar');
  const openBtn = host.querySelector('#sra-sidebar-open');
  const closeBtn = host.querySelector('#sra-sidebar-close');
  openBtn?.addEventListener('click', ()=> aside.classList.add('open'));
  closeBtn?.addEventListener('click', ()=> aside.classList.remove('open'));
  aside?.addEventListener('click', (e)=>{ if(e.target === aside) aside.classList.remove('open'); });

  // active item
  const map = { home:'index.html', how:'how.html', deliverables:'what-you-get.html', packages:'packages.html', ethics:'ethics.html', about:'about.html', contact:'contact.html' };
  const path = map[pageKey];
  host.querySelectorAll('.sra-nav-item').forEach(a=>{
    if(a.getAttribute('href') === path) a.classList.add('active');
  });

  // translate labels now that DOM is in place
  i18n.translateDocument();
  document.body.classList.add('has-sidebar');
}

export async function sraInit(pageKey){
  await mountLayout(pageKey);

  const i18n = new SRAi18n({
    defaultLang: 'en',
    supported: ['en','he'],
    dictionaries: {
      en: 'assets/i18n/en.json',
      he: 'assets/i18n/he.json'
    }
  });
  await i18n.init();
  window.__sra_i18n = i18n;

  const saved = localStorage.getItem('language') || 'en';
  applyLanguage(i18n, saved);
  wireLanguageToggles(i18n);
  await mountSidebar(pageKey, i18n);

  // CTAs
  const LINKS = {
    intake: 'https://example.com/intake-consent',
    message: 'https://wa.me/XXXXXXXXXXX'
  };
  const setHref = (id, url) => { const el = document.getElementById(id); if (el) el.setAttribute('href', url); };
  setHref('ctaMessageHero', LINKS.message);
  setHref('ctaMessageBottom', LINKS.message);
  setHref('ctaStartHero', LINKS.intake);
  setHref('ctaStartQuick', LINKS.intake);
  setHref('ctaStartStandard', LINKS.intake);
  setHref('ctaStartDeep', LINKS.message);
  setHref('ctaStartBottom', LINKS.intake);
  setHref('ctaMessageAbout', LINKS.message);
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
