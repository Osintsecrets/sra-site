export class SRAi18n {
  constructor({ defaultLang = 'en', supported = ['en'], dictionaries = {} } = {}) {
    this.defaultLang = defaultLang;
    this.supported = supported;
    this.dictionaries = dictionaries;
    this.current = localStorage.getItem('language') || defaultLang;
    if (!this.supported.includes(this.current)) this.current = defaultLang;
    this.dict = {};
  }

  async init() {
    await this.load(this.current);
    this.apply();
  }

  async load(lang) {
    const url = this.dictionaries[lang];
    const res = await fetch(url, { cache: 'no-cache' });
    this.dict = await res.json();
  }

  setLanguage(lang) {
    if (!this.supported.includes(lang)) return;
    if (lang === this.current) return;
    this.current = lang;
    localStorage.setItem('language', lang);
    this.load(lang).then(() => this.apply());
  }

  // Backward compatibility
  setLang(lang) {
    this.setLanguage(lang);
  }

  apply() {
    // lang + dir
    const html = document.documentElement;
    html.setAttribute('lang', this.current);
    html.setAttribute('dir', this.current === 'he' ? 'rtl' : 'ltr');

    // Replace text for [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.get(key);
      if (val) {
        // Preserve nested <span> bold etc. only if element doesn’t have child data-i18n
        el.textContent = val;
      }
    });
  }

  get(path) {
    return path.split('.').reduce((o, k) => (o && k in o ? o[k] : null), this.dict);
  }
}
