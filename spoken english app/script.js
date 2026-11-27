'use strict';

/* ===== Helpers ===== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const L = localStorage;
const cfg = k => L.getItem(k) || '';
const day = d => new Date(d).toLocaleDateString('sv-SE');
const today = () => day(Date.now());
const yest = () => day(Date.now() - 864e5);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const shuf = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const norm = t => t.toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
const clean = w => norm(w)[0] || '';

const LV = ['Beginner', 'Elementary', 'Intermediate'];
const UNIQUE_PER_LEVEL = 5;          // প্রতি লেভেলে ৫টি ইউনিক বাক্য
const LEVEL_SIZE = UNIQUE_PER_LEVEL * 3; // ৫টি বাক্য × ৩ ধাপ = ১৫ টার্ন
const BN_SPEED = 1;                  // Bengali voice speed: 1 = normal, 0.8 = slower, 1.2 = faster

const LEVELS = [
  { num: 1, title: 'Everyday basics', topic: 'Self-Introduction', level: 'Beginner' },
  { num: 2, title: 'Talking with friends', topic: 'Talking to Friends', level: 'Beginner' },
  { num: 3, title: 'Asking questions', topic: 'Asking Questions', level: 'Beginner' },
  { num: 4, title: 'Shopping and prices', topic: 'Shopping', level: 'Beginner' },
  { num: 5, title: 'Daily conversations', topic: null, level: 'Elementary' },
  { num: 6, title: 'Confident speaking', topic: null, level: 'Intermediate' }
];

const TEST = [
  { en: 'My name is Rahim.', bn: 'আমার নাম রহিম।' },
  { en: 'I like to drink tea every morning.', bn: 'আমি প্রতিদিন সকালে চা খেতে পছন্দ করি।' },
  { en: 'Could you tell me where the market is?', bn: 'আপনি কি আমাকে বলতে পারেন বাজারটা কোথায়?' },
  { en: 'I have been learning English for six months.', bn: 'আমি ছয় মাস ধরে ইংরেজি শিখছি।' },
  { en: 'Although it was raining, we decided to go outside.', bn: 'বৃষ্টি হচ্ছিল, তবুও আমরা বাইরে যাওয়ার সিদ্ধান্ত নিলাম।' }
];

const SVG = {
  lock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  speak: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  topic: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
  retry: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  eye: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>'
};

/* ===== State ===== */
let sb = null, P = null, Q = [], i = 0;
let mode = 'level', activeLevelNum = 1, activeTopic = null;
let rec = null, gen = false, testRes = [], round = { ok: 0 };
let passedCurrent = false;
let autoNextTimer = null;
let autoMic = L.getItem('auto_mic') !== '0', micBlocked = false, manualStop = false, tries = 0, idleTries = 0;
let speakToken = 0, bnAudio = null, speakRef = null;
let actx = null, bnSrc = null;
const bnCache = new Map();
let currentTipWord = null, currentNwObj = null;

const wordCache = JSON.parse(L.getItem('wc') || '{}');
let savedWords = JSON.parse(L.getItem('saved_words') || '[]');
let seenIds = new Set(JSON.parse(L.getItem('seen_ids') || '[]'));

function markSeen(id) {
  if (!id) return;
  seenIds.add(id);
  L.setItem('seen_ids', JSON.stringify([...seenIds]));
}

function getUnlockedLevel() {
  const localLv = parseInt(L.getItem('unlocked_level') || '1', 10);
  const dbLv = P ? (P.round_count || 0) + 1 : 1;
  return Math.max(1, localLv, dbLv);
}
function setUnlockedLevel(n) { L.setItem('unlocked_level', String(n)); }

/* ===== Progressive 3-Stage Queue Builder ===== */
function buildProgressiveQueue(sentences) {
  const base = sentences.slice(0, UNIQUE_PER_LEVEL);
  const stage0 = base.map(s => ({ ...s, _stage: 0 })); // ধাপ ১: পুরো বাক্য দেখাবে
  const stage1 = base.map(s => ({ ...s, _stage: 1 })); // ধাপ ২: মাঝের ১-২টি শব্দ লুকানো
  const stage2 = base.map(s => ({ ...s, _stage: 2 })); // ধাপ ৩: সব লুকানো, শুধু বাংলা দেখে বলা
  return [...stage0, ...stage1, ...stage2];
}

function getMiddleHidden(s) {
  const given = (s.hidden || []).map(h => clean(h)).filter(Boolean);
  if (given.length) return given;
  const words = s.en.split(' ').map(clean).filter(w => w.length >= 4);
  if (words.length >= 2) return [words[Math.floor(words.length / 3)], words[Math.floor((words.length * 2) / 3)]];
  return words.slice(0, 1);
}

/* ===== Saved Words (LocalStorage) ===== */
function isSaved(word) {
  const k = clean(word);
  return savedWords.some(x => clean(x.w) === k);
}
function toggleSaveWord(obj) {
  const k = clean(obj.w);
  if (!k) return false;
  if (isSaved(k)) {
    savedWords = savedWords.filter(x => clean(x.w) !== k);
    L.setItem('saved_words', JSON.stringify(savedWords));
    toast('Removed from saved words');
    return false;
  } else {
    savedWords.unshift({ w: obj.w, bn: obj.bn || '', pr: obj.pr || '', ex: obj.ex || '' });
    L.setItem('saved_words', JSON.stringify(savedWords));
    toast('Saved to vocabulary');
    return true;
  }
}

/* ===== UI Helpers ===== */
function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { e.hidden = true; }, 3000);
}

function setStatus(main, sub, cls = '') {
  const m = $('#statusMain'), s = $('#statusSub');
  m.textContent = main;
  m.className = 'p-status-main ' + cls;
  s.textContent = sub || '';
}

function updateUI() {
  const unlocked = getUnlockedLevel();
  const currentDef = getLevelDef(unlocked);
  $('#currentLevelLabel').textContent = `Level ${unlocked} · ${currentDef.title}`;
  if (P) {
    $('#sScore').textContent = P.score;
    $('#sStreak').textContent = P.streak;
    $('#dailyBar').style.width = Math.min(P.today_count, LEVEL_SIZE) / LEVEL_SIZE * 100 + '%';
    $('#dailyTxt').textContent = `${P.today_count} / ${LEVEL_SIZE}`;
    $('#pLevel').textContent = P.level || 'Beginner';
    $('#pScore').textContent = P.score;
    $('#pAcc').textContent = P.recent_acc + '%';
  }
  $('#pUnlocked').textContent = unlocked;
  renderLevelMap();
}

function getLevelDef(num) {
  if (num <= LEVELS.length) return LEVELS[num - 1];
  return {
    num,
    title: `Fluency stage ${num - LEVELS.length}`,
    topic: null,
    level: 'Intermediate'
  };
}

function renderLevelMap() {
  const unlocked = getUnlockedLevel();
  const totalToShow = Math.max(LEVELS.length, unlocked + 2);
  let html = '';

  for (let num = 1; num <= totalToShow; num++) {
    const lv = getLevelDef(num);
    const isDone = lv.num < unlocked;
    const isActive = lv.num === unlocked;
    const cls = isDone ? 'done' : isActive ? 'active' : 'locked';
    const sub = isDone ? 'Completed · 3-step mastery' : isActive ? 'Ready · 5 sentences × 3 steps' : 'Complete previous level to unlock';
    const icon = isDone ? SVG.check : isActive ? SVG.play : SVG.lock;

    html += `
      <button class="level-card ${cls}" data-level="${lv.num}">
        <span class="level-num num">${String(lv.num).padStart(2, '0')}</span>
        <div class="level-info">
          <strong>Level ${lv.num} · ${esc(lv.title)}</strong>
          <span>${sub}</span>
        </div>
        <span class="level-status">${icon}</span>
      </button>
    `;
  }
  $('#levelList').innerHTML = html;
}

function renderDots() {
  $('#pDots').innerHTML = Q.map((_, idx) => {
    const cls = idx < i ? 'done' : idx === i ? 'active' : '';
    return `<span class="p-dot ${cls}"></span>`;
  }).join('');
}

function showTab(t) {
  $$('.tab').forEach(e => { e.hidden = e.id !== t; });
  $$('#bottomNav button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  if (t === 'topics') loadTopics();
  if (t === 'vocab') { loadMistakes(); renderSavedWords(); }
}

function openSettings() {
  $('#kG').value = cfg('gk');
  $('#kU').value = cfg('su');
  $('#kA').value = cfg('sk');
  $('#settings').showModal();
}

/* ===== Clear Bengali & Optional English TTS ===== */
function stopSpeech() {
  speakToken++;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (bnAudio) { try { bnAudio.pause(); } catch (e) {} bnAudio = null; }
  if (bnSrc) { try { bnSrc.stop(); } catch (e) {} bnSrc = null; }
}

const wait = ms => new Promise(r => setTimeout(r, ms));

function loadVoices() {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res([]);
    const v = speechSynthesis.getVoices();
    if (v.length) return res(v);
    const t = setTimeout(() => res(speechSynthesis.getVoices()), 1500);
    speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); res(speechSynthesis.getVoices()); }, { once: true });
  });
}

function utter(text, lang, voice, rate) {
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : lang;
    u.rate = rate;
    let fin = false;
    const end = ok => { if (!fin) { fin = true; clearTimeout(guard); res(ok); } };
    const guard = setTimeout(() => end(false), Math.max(5000, text.length * 180));
    u.onend = () => end(true);
    u.onerror = e => end(e.error === 'canceled' || e.error === 'interrupted');
    speakRef = u;
    speechSynthesis.speak(u);
  });
}

function playUrl(url) {
  return new Promise(res => {
    const a = new Audio(url);
    bnAudio = a;
    a.onended = () => res(true);
    a.onerror = () => res(false);
    a.play().catch(() => res(false));
    setTimeout(() => { if (a.paused && !a.ended) res(false); }, 5000);
  });
}

function bnChunks(t) {
  const parts = t.match(/[^।.?!,]+[।.?!,]?/g) || [t];
  const out = []; let cur = '';
  parts.forEach(p => { if ((cur + p).length > 180) { if (cur) out.push(cur); cur = p; } else cur += p; });
  if (cur.trim()) out.push(cur);
  return out.map(x => x.trim()).filter(Boolean);
}

function getCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!actx) actx = new AC();
  if (actx.state === 'suspended') actx.resume().catch(() => {});
  return actx;
}

async function geminiBn(text) {
  if (bnCache.has(text)) return bnCache.get(text);
  let err = 'no audio returned';
  for (const m of ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview']) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 12000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cfg('gk')}`, {
        method: 'POST', signal: ac.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: text }] }],
          generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
        })
      });
      const j = await r.json();
      const part = ((j.candidates || [])[0]?.content?.parts || []).find(p => p.inlineData);
      if (part) { bnCache.set(text, part.inlineData.data); return part.inlineData.data; }
      err = (j.error && j.error.message) || err;
    } catch (e) {
      err = e.name === 'AbortError' ? 'timed out' : e.message;
    } finally { clearTimeout(t); }
  }
  throw new Error(String(err).slice(0, 90));
}

async function playPcm(b64) {
  const ctx = getCtx();
  if (!ctx) return false;
  if (ctx.state !== 'running') { try { await Promise.race([ctx.resume(), wait(800)]); } catch (e) {} }
  if (ctx.state !== 'running') return false;
  const bin = atob(b64), n = bin.length >> 1;
  const buf = ctx.createBuffer(1, n, 24000), ch = buf.getChannelData(0);
  for (let k = 0; k < n; k++) {
    let v = bin.charCodeAt(2 * k) | (bin.charCodeAt(2 * k + 1) << 8);
    if (v > 32767) v -= 65536;
    ch[k] = v / 32768;
  }
  return new Promise(res => {
    const src = ctx.createBufferSource();
    src.buffer = buf; src.playbackRate.value = BN_SPEED; src.connect(ctx.destination);
    bnSrc = src; src.onended = () => res(true);
    try { src.start(); } catch (e) { res(false); }
  });
}

async function speakBn(text) {
  if (!text) return false;
  stopSpeech();
  const my = speakToken;
  const why = [];

  if (cfg('gk')) {
    try {
      const d = await geminiBn(text);
      if (my !== speakToken) return false;
      if (await playPcm(d)) return my === speakToken;
      why.push('audio blocked, tap the screen once');
    } catch (e) { why.push('Gemini: ' + e.message); }
    if (my !== speakToken) return false;
  } else why.push('no Gemini key in Settings');

  const voices = await loadVoices();
  if (my !== speakToken) return false;
  const lg = v => (v.lang || '').toLowerCase().replace('_', '-');
  const voice = voices.find(v => lg(v) === 'bn-in') || voices.find(v => lg(v) === 'bn-bd') || voices.find(v => lg(v).startsWith('bn'));
  if (voice) {
    if (await utter(text, 'bn-IN', voice, BN_SPEED)) return my === speakToken;
    why.push('device voice silent');
  } else why.push('no Bengali voice on this device');
  if (my !== speakToken) return false;

  let ok = true;
  for (const c of bnChunks(text)) {
    if (my !== speakToken) return false;
    ok = await playUrl('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=bn&q=' + encodeURIComponent(c));
    if (!ok) break;
  }
  if (ok) return my === speakToken;
  why.push('online voice blocked');
  toast('Bengali voice failed: ' + why.join(', '));
  return my === speakToken;
}

function speakEn(text, rate = 1) {
  if (!('speechSynthesis' in window) || !text) return;
  stopSpeech();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    speechSynthesis.speak(u);
  }, 60);
}

/* ===== Speech Recognition ===== */
function startListening(auto = false) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return setStatus('Not supported', 'Please use Google Chrome', 'bad');
  if (rec) return;
  if (auto && micBlocked) return;
  if (!auto) micBlocked = false;
  manualStop = false;

  clearTimeout(autoNextTimer);
  stopSpeech();

  rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = true;
  let txt = '';

  rec.onstart = () => {
    $('#mic').classList.remove('retry');
    $('#mic').classList.add('live');
    $('#micIcon').innerHTML = SVG.mic;
    $('#micLbl').textContent = 'Listening';
    $('#bStop').disabled = false;
    setStatus('Listening...', 'Speak the English sentence clearly');
  };

  rec.onresult = e => {
    txt = [...e.results].map(r => r[0].transcript).join(' ');
    $('#you').textContent = 'You: ' + txt;
    $('#you').hidden = false;
  };

  rec.onerror = e => {
    if (/not-allowed|service-not-allowed/.test(e.error)) micBlocked = true;
    setStatus('Mic error', e.error === 'no-speech' ? 'No speech detected, try again' : micBlocked ? 'Allow the microphone, then tap Start' : e.error, 'bad');
  };

  rec.onend = () => {
    rec = null;
    $('#mic').classList.remove('live');
    $('#bStop').disabled = true;
    if (txt) {
      checkSpeech(txt);
    } else if (!passedCurrent) {
      $('#micLbl').textContent = 'Start';
      setStatus('Ready', 'Tap Start to speak');
      const cur = Q[i];
      if (autoMic && !micBlocked && !manualStop && idleTries < 2 && !$('#practiceView').hidden) {
        idleTries++;
        setTimeout(() => { if (Q[i] === cur && !rec && !passedCurrent) startListening(true); }, 500);
      }
    }
  };

  rec.start();
}

function stopListening() {
  manualStop = true;
  if (rec) rec.stop();
}

/* ===== Supabase Profile ===== */
async function loadProfile() {
  let { data, error } = await sb.from('user_profile').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) {
    ({ data, error } = await sb.from('user_profile').insert({ id: 1, level: 'Beginner' }).select().single());
    if (error) throw error;
  }
  P = data;
  if (!P.level) P.level = 'Beginner';
  if (P.today_date !== today()) { P.today_count = 0; P.today_date = today(); }
  if (P.last_active && P.last_active !== today() && P.last_active !== yest()) P.streak = 0;
  updateUI();
}

function saveP() {
  if (!P || !sb) return;
  const { id, ...rest } = P;
  return sb.from('user_profile').update(rest).eq('id', 1).then(({ error }) => error && console.warn(error));
}

function award() {
  P.score++;
  P.today_count++;
  P.today_date = today();
  round.ok++;
  if (P.last_active !== today()) {
    P.streak = (P.last_active === yest() ? P.streak : 0) + 1;
    P.last_active = today();
  }
  $('#pSessionScore').textContent = '+' + round.ok;
  updateUI();
  saveP();
}

const addMistake = s => s.id && sb.from('mistakes').upsert({ sentence_id: s.id }, { onConflict: 'sentence_id', ignoreDuplicates: true });

/* ===== Practice Flow ===== */
function openPracticeView() {
  $('#practiceView').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePracticeView() {
  clearTimeout(autoNextTimer);
  stopSpeech();
  stopListening();
  $('#tip').hidden = true;
  $('#practiceView').hidden = true;
  document.body.style.overflow = '';
  updateUI();
}

async function startLevel(lvlNum) {
  if (!sb) return openSettings();
  const unlocked = getUnlockedLevel();
  if (lvlNum > unlocked) return toast(`Complete Level ${unlocked} first`);

  activeLevelNum = lvlNum;
  mode = 'level';
  const def = getLevelDef(lvlNum);

  openPracticeView();
  $('#pTitle').textContent = `Level ${lvlNum} · ${def.title}`;
  $('#pSessionScore').textContent = '+0';
  $('#pSkel').hidden = false;
  $('#pCard').hidden = true;

  try {
    let { data, error } = await sb.from('sentences').select('*').limit(300);
    if (error) throw error;
    if (!data || !data.length) { closePracticeView(); return toast('No sentences found'); }

    let unseen = data.filter(s => !seenIds.has(s.id));

    if (unseen.length < UNIQUE_PER_LEVEL && cfg('gk')) {
      toast('Creating new sentences for this level...');
      await genBackground();
      const res = await sb.from('sentences').select('*').limit(300);
      if (res.data) {
        data = res.data;
        unseen = data.filter(s => !seenIds.has(s.id));
      }
    }

    const seen = data.filter(s => seenIds.has(s.id));
    let primary = def.topic ? unseen.filter(s => s.topic === def.topic) : unseen.filter(s => s.level === def.level);
    let otherUnseen = unseen.filter(s => !primary.includes(s));
    const picked = [...shuf(primary), ...shuf(otherUnseen), ...shuf(seen)].slice(0, UNIQUE_PER_LEVEL);

    Q = buildProgressiveQueue(picked);
    i = 0; round = { ok: 0 };
    renderQuestion();
  } catch (e) {
    closePracticeView();
    toast(e.message || 'Failed to load');
  }
}

async function startTopicPractice(topicName) {
  if (!sb) return openSettings();
  activeTopic = topicName; mode = 'topic';
  openPracticeView();
  $('#pTitle').textContent = topicName;
  $('#pSessionScore').textContent = '+0';
  $('#pSkel').hidden = false; $('#pCard').hidden = true;

  const { data, error } = await sb.from('sentences').select('*').eq('topic', topicName).limit(100);
  if (error) { closePracticeView(); return toast(error.message); }
  if (!data.length) { closePracticeView(); return toast('No sentences in this topic'); }
  Q = buildProgressiveQueue(shuf(data));
  i = 0; round = { ok: 0 };
  renderQuestion();
}

async function startMistakePractice() {
  if (!sb) return openSettings();
  mode = 'mistake';
  openPracticeView();
  $('#pTitle').textContent = 'Mistake revision';
  $('#pSessionScore').textContent = '+0';
  $('#pSkel').hidden = false; $('#pCard').hidden = true;

  const { data, error } = await sb.from('mistakes').select('sentences(*)');
  if (error) { closePracticeView(); return toast(error.message); }
  const rows = shuf(data.map(r => r.sentences).filter(Boolean));
  if (!rows.length) { closePracticeView(); return toast('No mistakes to revise'); }
  Q = buildProgressiveQueue(rows);
  i = 0; round = { ok: 0 };
  renderQuestion();
}

function startTest() {
  mode = 'test'; testRes = [];
  Q = TEST.map(t => ({ ...t, hidden: [], words: [], _stage: 0 }));
  i = 0; round = { ok: 0 };
  openPracticeView();
  $('#pTitle').textContent = 'Level assessment';
  $('#pSessionScore').textContent = 'Test';
  renderQuestion();
}

function renderQuestion() {
  clearTimeout(autoNextTimer);
  const s = Q[i];
  const stage = s._stage ?? 0; // 0 = full, 1 = blanks, 2 = all hidden
  passedCurrent = false;
  tries = 0; idleTries = 0;

  $('#pSkel').hidden = true;
  $('#pCard').hidden = false;
  $('#pCard').className = 'p-card';
  $('#tip').hidden = true;
  $('#you').hidden = true;
  $('#you').textContent = '';

  $('#bNext').disabled = true;
  $('#bStop').disabled = true;
  $('#mic').className = 'circle-btn lg';
  $('#micIcon').innerHTML = SVG.mic;
  $('#micLbl').textContent = 'Start';

  renderDots();

  if (mode === 'test') {
    setStatus('Ready', 'Tap Start to speak');
  } else if (stage === 0) {
    setStatus('Step 1 of 3 · Read & Speak', 'Read the full English sentence clearly');
  } else if (stage === 1) {
    setStatus('Step 2 of 3 · Fill the Blanks', 'Speak the full sentence including missing words');
  } else {
    setStatus('Step 3 of 3 · Full Recall', 'Translate from Bengali and speak in English');
  }

  const wordsArr = Array.isArray(s.words) ? s.words : [];
  const hidLower = stage === 1 ? getMiddleHidden(s) : [];
  const spotlight = wordsArr.find(x => hidLower.includes(clean(x.w))) || wordsArr[0];

  if (spotlight && mode !== 'test' && stage < 2) {
    currentNwObj = { w: spotlight.w, bn: spotlight.bn, pr: spotlight.pr, ex: s.en };
    $('#nwWord').textContent = spotlight.w;
    $('#nwPron').textContent = spotlight.pr ? `(${spotlight.pr})` : '';
    $('#nwBn').textContent = `= ${spotlight.bn}`;
    $('#bNwSave').classList.toggle('saved', isSaved(spotlight.w));
    $('#newWordBox').hidden = false;
    $('#newWordBox').classList.remove('open');
    $('#bNwEye').innerHTML = SVG.eye;
    $('#bNwEye').setAttribute('aria-label', 'Show word');
  } else {
    currentNwObj = null;
    $('#newWordBox').hidden = true;
  }

  // Render English Sentence based on stage (0 = full, 1 = partial blanks, 2 = all blanks)
  const en = $('#en');
  en.innerHTML = '';
  s.en.split(' ').forEach(w => {
    const k = clean(w);
    const sp = document.createElement('span');
    const hideThis = (stage === 2 && k.length > 0) || (stage === 1 && hidLower.includes(k));
    if (hideThis) {
      sp.className = 'blank';
      sp.dataset.k = k;
      sp.dataset.p = w.replace(/^[A-Za-z']+/, '');
      sp.textContent = '_'.repeat(Math.min(k.length, 6)) + sp.dataset.p;
    } else {
      sp.className = 'w';
      sp.textContent = w;
      sp.onclick = e => { e.stopPropagation(); showWordTip(sp, w); };
    }
    en.append(sp, ' ');
  });

  $('#bn').textContent = s.bn;

  speakBn(s.bn).then(done => {
    if (cfg('gk') && Q[i] === s && Q[i + 1]) geminiBn(Q[i + 1].bn).catch(() => {});
    if (!done || !autoMic) return;
    setTimeout(() => { if (Q[i] === s && !rec && !passedCurrent && !$('#practiceView').hidden && !$('#done').open) startListening(true); }, 250);
  });
}

function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, x) => [x]);
  for (let y = 1; y <= b.length; y++) d[0][y] = y;
  for (let x = 1; x <= a.length; x++) for (let y = 1; y <= b.length; y++)
    d[x][y] = Math.min(d[x - 1][y] + 1, d[x][y - 1] + 1, d[x - 1][y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const same = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && lev(a, b) <= 1);

function checkSpeech(txt) {
  const s = Q[i];
  const stage = s._stage ?? 0;
  const sw = norm(txt);
  const hid = stage === 1 ? getMiddleHidden(s) : [];
  let ok = 0, pos = 0, missedHidden = false;

  const spans = s.en.split(' ').map(w => {
    const sp = document.createElement('span');
    const k = clean(w);
    let j = -1;
    for (let x = pos; x < Math.min(sw.length, pos + 4); x++) if (same(sw[x], k)) { j = x; break; }
    const hit = j >= 0;
    if (hit) pos = j + 1; else if (hid.includes(k)) missedHidden = true;
    ok += hit ? 1 : 0;
    sp.className = 'w ' + (hit ? 'good' : 'bad');
    sp.textContent = w;
    sp.onclick = e => { e.stopPropagation(); showWordTip(sp, w); };
    return sp;
  });

  $('#en').replaceChildren(...spans.flatMap(x => [x, ' ']));
  const acc = ok / spans.length;

  if (mode === 'test') {
    testRes.push(acc);
    passedCurrent = true;
    $('#pCard').classList.add('card-ok');
    setStatus('Recorded', 'Moving to next...', 'ok');
    $('#bNext').disabled = false;
    autoNextTimer = setTimeout(advance, 1100);
    return;
  }

  if (acc >= 0.8 && !missedHidden) {
    passedCurrent = true;
    $('#pCard').className = 'p-card card-ok';
    const last = i === Q.length - 1;
    setStatus(last ? 'Level complete ✓' : 'GOOD', last ? 'Great work!' : 'Moving to next sentence...', 'ok');
    if (tries === 0) round.first = (round.first || 0) + 1;
    const dot = $$('.p-dot')[i]; if (dot) dot.className = 'p-dot done';
    award();
    if (stage === 2) markSeen(s.id); // ৩য় ধাপ শেষ হলেই বাক্যটি শেখা হয়ে গেছে হিসেবে মার্ক হবে
    $('#bNext').disabled = false;
    if (mode === 'mistake' && stage === 2 && s.id) {
      sb.from('mistakes').delete().eq('sentence_id', s.id).then(() => {});
    }
    autoNextTimer = setTimeout(advance, 1200);
  } else {
    $('#pCard').className = 'p-card card-bad';
    setStatus('TRY AGAIN', 'Tap Try Again and speak clearly', 'bad');
    $('#mic').classList.add('retry');
    $('#micIcon').innerHTML = SVG.retry;
    $('#micLbl').textContent = 'Try Again';
    addMistake(s);
    tries++;
    if (tries >= 3) {
      $('#bNext').disabled = false;
      setStatus('TRY AGAIN', 'Or tap Next to skip this one', 'bad');
    } else if (autoMic) {
      autoNextTimer = setTimeout(() => { if (Q[i] === s && !rec && !passedCurrent) startListening(true); }, 1600);
    }
  }
}

function advance() {
  clearTimeout(autoNextTimer);
  stopSpeech();
  i++;
  if (i >= Q.length) {
    return mode === 'test' ? finishTest() : finishRound();
  }
  renderQuestion();
}

async function finishTest() {
  const passed = testRes.filter(a => a >= 0.7).length;
  P.level = passed >= 4 ? 'Intermediate' : passed >= 2 ? 'Elementary' : 'Beginner';
  await saveP();
  closePracticeView();
  toast('Assessment complete. Level: ' + P.level);
}

function finishRound() {
  const acc = (round.first || 0) / Q.length;
  const pct = Math.round(acc * 100);
  P.recent_acc = pct;

  let title = 'Session complete';
  let msg = `You got ${round.first || 0} of ${Q.length} right on the first try (${pct}%).`;

  if (mode === 'level') {
    const currentUnlocked = getUnlockedLevel();
    if (activeLevelNum === currentUnlocked) {
      const nextLv = currentUnlocked + 1;
      setUnlockedLevel(nextLv);
      P.round_count = Math.max(P.round_count || 0, activeLevelNum);
      title = `Level ${activeLevelNum} complete`;
      msg += ` Level ${nextLv} is now unlocked.`;
    }
  }

  if (acc >= 0.9 && P.level !== 'Intermediate') {
    P.level = LV[LV.indexOf(P.level) + 1] || 'Intermediate';
  }

  saveP();
  updateUI();

  $('#doneTitle').textContent = title;
  $('#doneTxt').textContent = msg;
  $('#doneNext').hidden = mode !== 'level';
  $('#done').showModal();

  genBackground();
}

/* ===== Tap-to-Meaning + Example Sentences Popover ===== */
function ensureTipExBox() {
  let box = $('#tipEx');
  if (!box) {
    box = document.createElement('div');
    box.id = 'tipEx';
    box.style.cssText = 'margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,128,128,0.22);font-size:12.5px;line-height:1.45;';
    $('#tip').appendChild(box);
  }
  return box;
}

function renderTipExamples(box, exList) {
  if (!Array.isArray(exList) || !exList.length) {
    box.innerHTML = '';
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = `<div style="font-size:11px;opacity:.65;margin-bottom:4px;font-weight:600;">Examples (tap to listen):</div>` +
    exList.slice(0, 2).map(x => `
      <div class="tip-ex-item" data-ex-en="${esc(x.en)}" style="margin-bottom:6px;cursor:pointer;">
        <div style="font-weight:500;">• ${esc(x.en)}</div>
        <div style="opacity:.78;font-size:12px;">${esc(x.bn || '')}</div>
      </div>
    `).join('');
  box.querySelectorAll('.tip-ex-item').forEach(item => {
    item.onclick = e => { e.stopPropagation(); speakEn(item.dataset.exEn, 0.95); };
  });
}

async function showWordTip(el, rawWord) {
  const s = Q[i];
  const k = clean(rawWord);
  if (!k) return;

  const tip = $('#tip');
  const exBox = ensureTipExBox();
  const rect = el.getBoundingClientRect();
  let cached = wordCache[k];
  let m = cached || (s.words || []).find(x => clean(x.w) === k);

  currentTipWord = { w: k, bn: m ? m.bn : '', pr: m ? m.pr : '', ex: s.en };

  $('#tipWord').textContent = k;
  $('#tipPron').textContent = m && m.pr ? m.pr : '';
  $('#tipBn').textContent = m && m.bn ? m.bn : (cfg('gk') ? 'Loading meaning...' : 'Add Gemini key in Settings for auto meanings');

  const saved = isSaved(k);
  $('#bTipSave').classList.toggle('saved', saved);
  $('#tipSaveTxt').textContent = saved ? 'Saved' : 'Save';

  if (cached && Array.isArray(cached.ex) && cached.ex.length) {
    renderTipExamples(exBox, cached.ex);
  } else if (cfg('gk')) {
    exBox.hidden = false;
    exBox.innerHTML = '<div style="font-size:12px;opacity:.65;">Loading usage examples...</div>';
  } else {
    exBox.hidden = true;
  }

  tip.hidden = false;
  const left = Math.max(12, Math.min(rect.left, window.innerWidth - 270));
  const top = rect.bottom + 180 > window.innerHeight ? Math.max(12, rect.top - 175) : rect.bottom + 8;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';

  if ((!cached || !Array.isArray(cached.ex) || !cached.ex.length) && cfg('gk')) {
    try {
      const res = await gem(`Give the Bengali meaning, Bengali-script pronunciation, and 2 short practical daily-use example sentences (with natural Bengali meaning) for the English word "${k}". Return JSON only: {"bn":"","pr":"","ex":[{"en":"","bn":""},{"en":"","bn":""}]}`);
      wordCache[k] = {
        bn: res.bn || (m && m.bn) || '',
        pr: res.pr || (m && m.pr) || '',
        ex: Array.isArray(res.ex) ? res.ex : []
      };
      L.setItem('wc', JSON.stringify(wordCache));
      if (currentTipWord && currentTipWord.w === k) {
        currentTipWord.bn = wordCache[k].bn;
        currentTipWord.pr = wordCache[k].pr;
        $('#tipPron').textContent = wordCache[k].pr || '';
        $('#tipBn').textContent = wordCache[k].bn || 'Meaning not found';
        renderTipExamples(exBox, wordCache[k].ex);
      }
    } catch (e) {
      if (!m) $('#tipBn').textContent = 'Could not fetch meaning';
      exBox.hidden = true;
    }
  }
}

/* ===== Background Gemini Generator (Auto-Fallback) ===== */
async function gem(p) {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
  ];
  let lastErr = 'Gemini থেকে কোনো উত্তর আসেনি';

  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${cfg('gk')}`;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: p }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.8 }
          })
        });
        const j = await r.json();

        if (!j.error) {
          const txt = j.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!txt) throw new Error('Empty response');
          return JSON.parse(txt.replace(/```json|```/g, '').trim());
        }

        lastErr = `${m}: ${j.error.message}`;
        if (r.status === 503 || /high demand|overloaded|temporarily/i.test(j.error.message)) {
          await wait(1200);
          continue;
        }
        break;
      } catch (e) {
        lastErr = `${m}: ${e.message}`;
      }
    }
  }
  throw new Error(lastErr);
}

async function genBackground() {
  if (!cfg('gk') || gen || !sb) return;
  gen = true;
  try {
    const [{ data: m }, { data: existing }] = await Promise.all([
      sb.from('mistakes').select('sentences(en,topic)').limit(10),
      sb.from('sentences').select('en').order('id', { ascending: false }).limit(50)
    ]);

    const weak = (m || []).map(r => r.sentences).filter(Boolean);
    const avoidList = (existing || []).map(r => r.en);
    const avoidSet = new Set(avoidList.map(x => x.trim().toLowerCase()));

    const curLevel = (P && P.level) || 'Beginner';
    const recentAcc = (P && P.recent_acc) || 0;

    let difficultyGuide = 'Target a Bengali Class 11 student who already speaks basic English and wants to build strong daily communication skills. Keep most sentences 7 to 12 words (maximum 15 words). Focus on practical sentence structures, 1-2 useful everyday vocabulary words per sentence, and natural basic clauses (using connectors like because, when, if, that, who, although). Avoid overly academic or bookish words.';
    if (recentAcc >= 85) {
      difficultyGuide = 'The learner is doing well! Keep sentences 9 to 14 words (max 15 words). Include natural everyday clauses (although, unless, whenever, which, so that) and useful intermediate vocabulary for real-life conversations, without sounding too formal or bookish.';
    } else if (recentAcc < 60) {
      difficultyGuide = 'Keep sentences clear and comfortable to speak (6 to 9 words). Focus on practical daily-use sentence structures and simple clauses (because, when, if).';
    }

    const res = await gem(`You are a friendly Spoken English coach for a Bengali Class 11 student who knows basic English and wants to improve communication skills, vocabulary, and grammar/sentence structure.
Last round accuracy: ${recentAcc}%.
DIFFICULTY & STYLE RULE: ${difficultyGuide}
Recently missed sentences to practice subtly: ${JSON.stringify(weak)}.
STRICT RULE: Do NOT repeat or closely paraphrase any of these existing sentences: ${JSON.stringify(avoidList)}.
Create 15 NEW, natural, practical daily-use spoken English sentences. Use ONLY English and Bengali, never Hindi.
Return ONLY a JSON array of 15 items. Each item: {"en":"sentence","bn":"natural Bengali meaning","hidden":["1-2 useful words from en, lowercase, no punctuation"],"topic":"Self-Introduction|Talking to Friends|Asking Questions|Shopping|Daily Conversations","level":"${curLevel}","words":[{"w":"useful new word from en, lowercase","bn":"Bengali meaning","pr":"Bengali-script pronunciation"}]}`);

    const arr = Array.isArray(res) ? res : (Array.isArray(res?.sentences) ? res.sentences : []);
    const rows = arr
      .filter(x => x && x.en && x.bn && !avoidSet.has(String(x.en).trim().toLowerCase()))
      .slice(0, 15)
      .map(x => ({
        en: String(x.en).trim(),
        bn: String(x.bn).trim(),
        hidden: Array.isArray(x.hidden) ? x.hidden.map(h => String(h).toLowerCase()) : [],
        topic: x.topic || 'Daily Conversations',
        level: LV.includes(x.level) ? x.level : curLevel,
        words: Array.isArray(x.words) ? x.words : []
      }));

    if (!rows.length) throw new Error('No valid new sentences returned');

    let { error } = await sb.from('sentences').upsert(rows, { onConflict: 'en', ignoreDuplicates: true });
    if (error && /unique|constraint|conflict/i.test(error.message)) {
      const ins = await sb.from('sentences').insert(rows);
      error = ins.error;
    }
    if (error) throw new Error('Supabase: ' + error.message);

    toast(`${rows.length} new sentences added`);
  } catch (e) {
    console.warn('Background generation failed', e);
    toast('Error: ' + (e.message || 'Check Gemini key'));
  } finally {
    gen = false;
  }
}

/* ===== Topics, Mistakes & Saved Words ===== */
async function loadTopics() {
  if (!sb) return openSettings();
  const el = $('#topicList');
  el.innerHTML = '<div class="sk"></div><div class="sk"></div>';
  const { data, error } = await sb.from('sentences').select('topic');
  if (error) return toast(error.message);
  const counts = {};
  data.forEach(r => { const t = r.topic || 'Daily Life'; counts[t] = (counts[t] || 0) + 1; });
  el.innerHTML = Object.entries(counts).map(([t, n]) => `
    <button class="topic-card" data-t="${esc(t)}">
      <span class="topic-icon">${SVG.topic}</span>
      <strong>${esc(t)}</strong>
      <small class="num">${n} sentences</small>
    </button>
  `).join('');
}

async function loadMistakes() {
  if (!sb) return;
  const el = $('#mistList');
  const { data, error } = await sb.from('mistakes').select('sentences(id,en,bn)').order('created_at', { ascending: false });
  if (error) return toast(error.message);
  const rows = data.map(r => r.sentences).filter(Boolean);
  $('#mistCount').textContent = `${rows.length} sentences to revise`;
  $('#bRevise').hidden = !rows.length;
  el.innerHTML = rows.length
    ? rows.map(s => `
        <div class="item-card">
          <div><strong>${esc(s.en)}</strong><p>${esc(s.bn)}</p></div>
          <button class="icon-btn sm" data-speak-en="${esc(s.en)}" aria-label="Listen">${SVG.speak}</button>
        </div>
      `).join('')
    : '<div class="empty-state">No mistakes recorded yet.</div>';
}

function renderSavedWords() {
  $('#savedCount').textContent = `${savedWords.length} saved words`;
  const el = $('#savedList');
  el.innerHTML = savedWords.length
    ? savedWords.map(item => `
        <div class="item-card">
          <div>
            <strong>${esc(item.w)} ${item.pr ? `<span class="muted-meta">(${esc(item.pr)})</span>` : ''}</strong>
            <p>${esc(item.bn || 'Saved word')}</p>
          </div>
          <div class="item-actions">
            <button class="icon-btn sm" data-speak-en="${esc(item.w)}" aria-label="Listen">${SVG.speak}</button>
            <button class="icon-btn sm" data-del-word="${esc(item.w)}" aria-label="Remove">${SVG.trash}</button>
          </div>
        </div>
      `).join('')
    : '<div class="empty-state">Tap any English word during practice to save it here.</div>';
}

/* ===== Event Listeners ===== */
$$('#bottomNav button').forEach(b => { b.onclick = () => showTab(b.dataset.tab); });
$('#bStartMain').onclick = () => startLevel(getUnlockedLevel());
$('#levelList').onclick = e => { const c = e.target.closest('.level-card'); if (c) startLevel(parseInt(c.dataset.level, 10)); };
$('#topicList').onclick = e => { const c = e.target.closest('.topic-card'); if (c) startTopicPractice(c.dataset.t); };

$('#segMistakes').onclick = () => {
  $('#segMistakes').classList.add('active'); $('#segSaved').classList.remove('active');
  $('#mistakePanel').hidden = false; $('#savedPanel').hidden = true;
};
$('#segSaved').onclick = () => {
  $('#segSaved').classList.add('active'); $('#segMistakes').classList.remove('active');
  $('#savedPanel').hidden = false; $('#mistakePanel').hidden = true;
  renderSavedWords();
};

$('#bRevise').onclick = startMistakePractice;
$('#vocab').onclick = e => {
  const spk = e.target.closest('[data-speak-en]'); if (spk) speakEn(spk.dataset.speakEn, 1);
  const del = e.target.closest('[data-del-word]');
  if (del) { toggleSaveWord({ w: del.dataset.delWord }); renderSavedWords(); }
};

$('#bClosePractice').onclick = closePracticeView;
$('#bSpeakBn').onclick = () => Q[i] && speakBn(Q[i].bn);
$('#bSpeakEn').onclick = () => Q[i] && speakEn(Q[i].en, 1);
$('#bSlowEn').onclick = () => Q[i] && speakEn(Q[i].en, 0.7);

$('#bNwSpeak').onclick = () => currentNwObj && speakEn(currentNwObj.w, 0.9);
$('#bNwSave').onclick = () => {
  if (!currentNwObj) return;
  const nowSaved = toggleSaveWord(currentNwObj);
  $('#bNwSave').classList.toggle('saved', nowSaved);
};

$('#bTipSpeak').onclick = e => { e.stopPropagation(); if (currentTipWord) speakEn(currentTipWord.w, 0.9); };
$('#bTipSave').onclick = e => {
  e.stopPropagation();
  if (!currentTipWord) return;
  const nowSaved = toggleSaveWord(currentTipWord);
  $('#bTipSave').classList.toggle('saved', nowSaved);
  $('#tipSaveTxt').textContent = nowSaved ? 'Saved' : 'Save';
};

$('#bHint').onclick = () => {
  const s = Q[i]; if (!s) return;
  $$('.blank').forEach(b => {
    const k = b.dataset.k;
    b.textContent = k[0] + '_'.repeat(Math.max(0, Math.min(k.length - 1, 5))) + b.dataset.p;
  });
  const clue = (s.words || []).filter(x => (s.hidden || []).includes(clean(x.w))).map(x => x.bn).join(', ');
  setStatus('Hint', clue || 'First letters revealed');
};

$('#mic').onclick = () => startListening();
$('#bStop').onclick = stopListening;
$('#bNext').onclick = () => { if (passedCurrent || tries >= 3) advance(); };

$('#bRetake').onclick = () => sb ? startTest() : openSettings();
$('#bSet').onclick = openSettings;
$('#closeCfg').onclick = () => $('#settings').close();
$('#saveCfg').onclick = () => {
  L.setItem('gk', $('#kG').value.trim());
  L.setItem('su', $('#kU').value.trim());
  L.setItem('sk', $('#kA').value.trim());
  location.reload();
};

$('#doneHome').onclick = () => { $('#done').close(); closePracticeView(); };
$('#doneNext').onclick = () => { $('#done').close(); startLevel(getUnlockedLevel()); };

document.addEventListener('click', e => {
  if (!e.target.closest('.w') && !e.target.closest('#tip')) $('#tip').hidden = true;
});

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

$('#bNwEye').onclick = () => {
  const o = $('#newWordBox').classList.toggle('open');
  $('#bNwEye').innerHTML = o ? SVG.eyeOff : SVG.eye;
  $('#bNwEye').setAttribute('aria-label', o ? 'Hide word' : 'Show word');
};
function paintAutoMic() {
  $('#bAutoMic').classList.toggle('on', autoMic);
  $('#bAutoMic').setAttribute('aria-pressed', String(autoMic));
}
$('#bAutoMic').onclick = () => { autoMic = !autoMic; L.setItem('auto_mic', autoMic ? '1' : '0'); paintAutoMic(); toast(autoMic ? 'Auto mic on' : 'Auto mic off'); };
paintAutoMic();

document.addEventListener('click', () => { getCtx(); }, true);
document.addEventListener('click', () => { try { speechSynthesis.speak(new SpeechSynthesisUtterance('')); } catch (e) {} }, { once: true });

/* ===== Boot ===== */
async function boot() {
  showTab('home');
  updateUI();
  if (!cfg('su') || !cfg('sk')) {
    toast('Add Supabase URL and key in Settings');
    return openSettings();
  }
  try {
    sb = supabase.createClient(cfg('su'), cfg('sk'));
    await loadProfile();
  } catch (e) {
    toast('Supabase connection error: ' + (e.message || e));
  }
}

boot();
