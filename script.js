/* ==========================================================
   P. K PRACTICE — Home Page Logic (script.js)
   ========================================================== */
(() => {
  'use strict';

  const KEYS = { streak: 'pk_streak', theme: 'pk_theme' };
  const DATA_URL = 'data.json';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c === null || c === undefined) return;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  const state = { verbs: [], tab: 'list' };

  const dom = {
    html: document.documentElement,
    themeToggle: $('#themeToggle'),
    streak: $('#streak'),
    streakCount: $('#streakCount'),
    streakLabel: $('#streakLabel'),
    streakNote: $('#streakNote'),
    tabs: $('#tabs'),
    tabBtns: $$('.tab'),
    views: { 
      list: $('#listView'), 
      learn: $('#learnView'), 
      practice: $('#practiceView') 
    },
    search: $('#searchInput'),
    sort: $('#sortSelect'),
    searchMeta: $('#searchMeta'),
    grid: $('#verbGrid'),
    status: $('#status'),
    startLearnBtn: $('#startLearnBtn'),
    startBtn: $('#startBtn'),
    introHint: $('#introHint'),
  };

  /* ---------- Theme ---------- */
  function applyTheme(theme, persist) {
    dom.html.setAttribute('data-theme', theme);
    dom.themeToggle.checked = theme === 'dark';
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0a12' : '#ffffff');
    if (persist) { try { localStorage.setItem(KEYS.theme, theme); } catch {} }
  }

  function initTheme() {
    applyTheme(dom.html.getAttribute('data-theme') || 'light', false);
    dom.themeToggle.addEventListener('change', () => {
      applyTheme(dom.themeToggle.checked ? 'dark' : 'light', true);
    });
  }

  /* ---------- Streak ---------- */
  const pad = n => String(n).padStart(2, '0');
  const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = () => dateKey(new Date());
  const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d); };

  function loadStreak() {
    const raw = readJSON(KEYS.streak);
    if (raw && Number.isInteger(raw.count) && raw.count >= 0 && (typeof raw.last === 'string' || raw.last === null)) {
      return { count: raw.count, last: raw.last, best: Number.isInteger(raw.best) ? raw.best : raw.count };
    }
    return { count: 0, last: null, best: 0 };
  }

  function activeStreak(data = loadStreak()) {
    if (data.last === todayKey() || data.last === yesterdayKey()) return data.count;
    return 0;
  }

  function streakLevel(n) {
    if (n <= 0) return 0;
    if (n < 3) return 1;
    if (n < 7) return 2;
    if (n < 14) return 3;
    if (n < 30) return 4;
    return 5;
  }

  function renderStreak() {
    const data = loadStreak();
    const count = activeStreak(data);
    dom.streak.dataset.level = String(streakLevel(count));
    dom.streakCount.textContent = String(count);
    dom.streakLabel.textContent = count === 1 ? 'day streak' : 'days streak';
    if (count === 0) dom.streakNote.textContent = 'Practice today to start!';
    else if (data.last === todayKey()) dom.streakNote.textContent = 'Done for today ✓';
    else dom.streakNote.textContent = 'Practice today to keep it!';
  }

  /* ---------- Tabs ---------- */
  function switchTab(name) {
    state.tab = name;
    dom.tabs.dataset.active = name;
    dom.tabBtns.forEach(btn => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    Object.entries(dom.views).forEach(([key, view]) => {
      if (view) view.classList.toggle('active', key === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Data & List ---------- */
  const isValidVerb = v =>
    v && ['verb', 'bengaliMeaning', 'englishMeaning', 'example'].every(k => typeof v[k] === 'string' && v[k].trim());

  /* ---------- Skeleton loading ---------- */
  const SKELETON_COUNT = 6;

  function skeletonCard(i) {
    return el('article', { class: 'verb-card skeleton-card', 'aria-hidden': 'true', style: `--i:${i}` }, [
      el('div', { class: 'sk sk-title' }),
      el('div', { class: 'sk sk-bn' }),
      el('div', { class: 'sk sk-chip' }),
      el('div', { class: 'sk sk-example' }),
    ]);
  }

  function showSkeleton() {
    dom.status.replaceChildren();
    dom.searchMeta.replaceChildren(el('span', { class: 'sk sk-meta' }));
    dom.grid.setAttribute('aria-busy', 'true');
    dom.grid.replaceChildren(...Array.from({ length: SKELETON_COUNT }, (_, i) => skeletonCard(i)));
  }

  function showLoadError(err) {
    console.error('Failed to load verbs:', err);
    dom.grid.replaceChildren();
    dom.grid.removeAttribute('aria-busy');
    const retry = el('button', { class: 'btn btn-secondary', type: 'button', text: 'Try again' });
    retry.addEventListener('click', loadVerbs);
    dom.status.replaceChildren(
      el('p', { text: '⚠️ Could not load data.json.' }),
      el('p', { class: 'muted', text: 'Make sure the file is in the same folder and served over http(s).' }),
      retry
    );
    dom.searchMeta.textContent = '';
  }

  const CACHE_KEY = 'pk_verbs_cache';

  function readCache() {
    const c = readJSON(CACHE_KEY);
    return Array.isArray(c) ? c.filter(isValidVerb) : [];
  }

  function writeCache(list) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch {}
  }

  async function loadVerbs() {
    // আগে একবার লোড হয়ে থাকলে সেভ করা ডাটা সাথে সাথে দেখাবে, না হলে skeleton
    const cached = state.verbs.length ? [] : readCache();
    if (cached.length) {
      state.verbs = cached;
      dom.status.replaceChildren();
      filterVerbs();
      updateIntro();
    } else if (!state.verbs.length) {
      showSkeleton();
    }

    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const valid = (Array.isArray(json) ? json : []).filter(isValidVerb);
      if (!valid.length) throw new Error('data.json has no valid entries');

      // ক্যাশ থেকে দেখানো ডাটার সাথে একই হলে আবার render করার দরকার নেই
      const unchanged = cached.length && JSON.stringify(cached) === JSON.stringify(valid);
      state.verbs = valid;
      writeCache(valid);
      if (!unchanged) {
        dom.status.replaceChildren();
        filterVerbs();
      }
      updateIntro();
    } catch (err) {
      if (state.verbs.length) { console.warn('Background refresh failed:', err); return; }
      showLoadError(err);
    }
  }

  const norm = s => String(s).normalize('NFC').toLowerCase().trim();

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('আপনার ব্রাউজার অডিও সাপোর্ট করে না।');
    }
  }

  function renderVerbs(list) {
    dom.grid.replaceChildren();
    dom.grid.removeAttribute('aria-busy');
    list.forEach((v, i) => {
      const speakerBtn = el('button', {
        class: 'speaker-btn',
        type: 'button',
        'aria-label': `Listen to ${v.verb}`,
        title: 'উচ্চারণ শুনুন'
      }, ['🔊']);

      speakerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakText(v.verb);
      });

      const header = el('div', { class: 'verb-header' }, [
        el('h3', { class: 'verb-title', text: v.verb }),
        speakerBtn
      ]);

      const card = el('article', { class: 'verb-card', style: `--i:${Math.min(i, 12)}` }, [
        header,
        el('p', { class: 'verb-bn', lang: 'bn', text: v.bengaliMeaning }),
        el('span', { class: 'chip', text: v.englishMeaning }),
        el('p', { class: 'verb-example', text: `“${v.example}”` }),
      ]);
      dom.grid.append(card);
    });
  }

  function filterVerbs() {
    const q = norm(dom.search.value);
    const sortMode = dom.sort ? dom.sort.value : 'default';

    let list = !q
      ? state.verbs.slice()
      : state.verbs.filter(v =>
          norm(v.verb).includes(q) || norm(v.englishMeaning).includes(q) || norm(v.bengaliMeaning).includes(q));

    if (sortMode === 'az') {
      list.sort((a, b) => norm(a.verb).localeCompare(norm(b.verb)));
    } else if (sortMode === 'za') {
      list.sort((a, b) => norm(b.verb).localeCompare(norm(a.verb)));
    }

    renderVerbs(list);
    dom.searchMeta.textContent = q
      ? `Showing ${list.length} of ${state.verbs.length} phrasal verbs`
      : `${state.verbs.length} phrasal verbs`;
    if (!list.length) dom.status.replaceChildren(el('p', { text: `No results for “${dom.search.value.trim()}”.` }));
    else if (state.verbs.length) dom.status.replaceChildren();
  }

  function updateIntro() {
    const ok = state.verbs.length >= 4;
    dom.startBtn.disabled = !ok;
    dom.introHint.textContent = ok ? '' : 'Need at least 4 phrasal verbs in data.json to start a quiz.';
  }

  function init() {
    $('#year').textContent = new Date().getFullYear();
    initTheme();
    renderStreak();
    dom.tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    dom.search.addEventListener('input', filterVerbs);
    if (dom.sort) dom.sort.addEventListener('change', filterVerbs);
    
    // Start Now (Learn) বাটনে ক্লিক করলে learn.html এ নিয়ে যাবে
    if (dom.startLearnBtn) {
      dom.startLearnBtn.addEventListener('click', () => {
        window.location.href = 'learn.html';
      });
    }

    // Start Practice বাটনে ক্লিক করলে practice.html এ নিয়ে যাবে
    dom.startBtn.addEventListener('click', () => {
      window.location.href = 'practice.html';
    });

    document.addEventListener('visibilitychange', () => { if (!document.hidden) renderStreak(); });
    window.addEventListener('focus', () => renderStreak());

    loadVerbs();
  }

  init();
})();
