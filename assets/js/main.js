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
setHref('ctaMessageEstimator', LINKS.message);
setHref('ctaStartEstimator', LINKS.intake);

// ----- Tabs (Summary / Details) -----
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
  // scroll to top of main on switch
  const main = document.getElementById('main');
  if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});
// Allow “jump” links to switch tabs
document.querySelectorAll('[data-jump-tab]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    activateTab(a.dataset.jumpTab);
  });
});

// ----- Scope Estimator -----
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

// Update tiny outputs for sliders
if (estEls.postsPerWeek && out.ppw) estEls.postsPerWeek.addEventListener('input', () => out.ppw.textContent = estEls.postsPerWeek.value);
if (estEls.taggedFreq && out.tag) estEls.taggedFreq.addEventListener('input', () => out.tag.textContent = estEls.taggedFreq.value);
if (estEls.commentsPerPost && out.cpp) estEls.commentsPerPost.addEventListener('input', () => out.cpp.textContent = estEls.commentsPerPost.value);
if (estEls.groupsEvents && out.ge) estEls.groupsEvents.addEventListener('input', () => out.ge.textContent = estEls.groupsEvents.value);
if (estEls.albums && out.alb) estEls.albums.addEventListener('input', () => out.alb.textContent = estEls.albums.value);

// Heuristic: items ≈ posts + (taggedFactor) + albumSamples + group/events touchpoints
function calcEstimate() {
  if (!estEls.timeframe) return;

  const months = parseInt(estEls.timeframe.value || '12', 10);
  const weeks = Math.max(1, Math.round((months * 4.345))); // rough weeks
  const ppw = parseInt((estEls.postsPerWeek?.value || '0'), 10);          // posts per week
  const tagged = parseInt((estEls.taggedFreq?.value || '0'), 10);         // tagged per week
  const cpp = parseInt((estEls.commentsPerPost?.value || '0'), 10);       // comments per post
  const ge = parseInt((estEls.groupsEvents?.value || '0'), 10);           // active groups/events
  const alb = parseInt((estEls.albums?.value || '0'), 10);                // albums

  // Base posts to consider
  const posts = ppw * weeks;

  // Tagged posts add review items
  const taggedItems = tagged * weeks;

  // Comments aren’t all reviewed; weight them lightly (sample)
  const commentSamples = Math.round(posts * Math.min(0.35, cpp / 100)); // up to 35% sample

  // Groups/events: lightweight scan touchpoints
  const geItems = Math.round(ge * Math.min(12, months/2)); // capped

  // Albums: sample some photos per album
  const photosFromAlbums = alb * 8; // sample per album

  const total = posts + taggedItems + commentSamples + geItems + photosFromAlbums;

  // Effort bands (manual)
  let effort = 'Light';
  if (total > 250) effort = 'Moderate';
  if (total > 700) effort = 'Heavy';
  if (total > 1500) effort = 'Very Heavy';

  // Suggested package
  let pkg = 'Quick Check';
  if (months >= 36 || total > 300) pkg = 'Standard Audit';
  if (months >= 120 || total > 900) pkg = 'Deep Dive';

  if (out.items) out.items.textContent = total.toLocaleString();
  if (out.effort) out.effort.textContent = effort;
  if (out.pack) out.pack.textContent = pkg;
}

// Wire estimator recalculation
['input','change'].forEach(evt => {
  Object.values(estEls).forEach(el => el && el.addEventListener(evt, calcEstimate));
});
calcEstimate();
