
(() => {
'use strict';

// ===== نمایش خطا روی صفحه (برای دیباگ بدون کنسول) =====
window.addEventListener('error', function(e) {
  try {
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#ff7675;color:#fff;padding:12px;font-size:13px;direction:rtl;z-index:9999;position:relative">خطا: ' +
      (e.message || 'ناشناخته') + ' — ' + (e.filename || '') + ':' + (e.lineno || '') +
      '</div>');
  } catch (_) {}
});
window.addEventListener('unhandledrejection', function(e) {
  try {
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#e17055;color:#fff;padding:12px;font-size:13px;direction:rtl;z-index:9999;position:relative">خطای Promise: ' +
      (e.reason && e.reason.message ? e.reason.message : String(e.reason)) +
      '</div>');
  } catch (_) {}
});

const CFG = window.VM_CONFIG || {};
const API_BASE = (CFG.API_BASE || '').replace(/\/$/, '');
const tg = window.Telegram?.WebApp || null;
if (tg) { try { tg.ready(); tg.expand(); tg.disableVerticalSwipes?.(); } catch (e) {} }

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fa = n => String(n ?? 0).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = t => { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); };

const initData = tg?.initData || '';
const user = tg?.initDataUnsafe?.user || null;
const uid = user?.id ? String(user.id) : '';
const name = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'بازیکن تلگرام';

async function api(action, data = {}) {
  if (!API_BASE) throw new Error('آدرس API در assets/config.js تنظیم نشده است.');
  if (!initData) throw new Error('این قابلیت فقط داخل Telegram Mini App و پس از احراز هویت قابل استفاده است.');
  const r = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, initData, ...data })
  });
  const j = await r.json().catch(() => ({ ok: false, error: 'پاسخ سرور JSON نیست' }));
  if (!r.ok || j.ok === false) throw new Error(j.message || j.error || 'خطای سرور');
  return j;
}

const page = document.body.dataset.page;
function nav() {
  const links = [['index.html','🏠','خانه'],['single.html','🧩','بازی'],['compete.html','⚔️','رقابت'],['leaderboard.html','🏆','رتبه‌ها'],['profile.html','👤','من']];
  return `<nav class="bottom-nav">${links.map(([u,i,t]) =>
    `<a class="${location.pathname.endsWith(u) ? 'active' : ''}" href="${u}"><span>${i}</span>${t}</a>`).join('')}</nav>`;
}
function shell(title, sub = '') {
  return `<header class="top"><a class="brand" href="index.html"><span class="brand-mark">و</span> وای میرزا</a><div class="top-actions"><a class="icon-btn" href="settings.html" aria-label="تنظیمات">⚙️</a></div></header><div class="page-head"><a class="back" href="index.html">‹</a><div><h1>${title}</h1><p>${sub}</p></div></div>`;
}
function footer() { return `<div class="toast" id="toast"></div>${nav()}`; }
function linkCard(url, emoji, title, desc) {
  return `<a class="tile" href="${url}"><span class="emoji">${emoji}</span><b>${title}</b><small>${desc}</small></a>`;
}
function set(el, html) { if (el) el.innerHTML = html; }
function onlineError(e) {
  toast(e.message);
  const box = $('#status');
  if (box) box.innerHTML = `<div class="warning">${esc(e.message)}<br>تا اتصال API واقعی برقرار نشود، اطلاعات ساختگی نمایش داده نمی‌شود.</div>`;
}
async function profile() { return api('profile'); }

// ===== صفحات =====
async function initHome() {
  const root = $('#app');
  root.innerHTML = `<header class="top"><div class="brand"><span class="brand-mark">و</span> وای میرزا</div><div class="top-actions"><a class="icon-btn" href="settings.html">⚙️</a></div></header>
  <section class="hero"><div class="eyebrow">بازی واژه‌سازی فارسی</div><h1>آماده‌ای کلمات رو پیدا کنی؟</h1><p>بازی کن، امتیاز واقعی جمع کن و با بازیکنان واقعی رقابت کن.</p><div class="stats"><div class="stat"><b id="homeCoins">—</b><span>سکه</span></div><div class="stat"><b id="homeScore">—</b><span>امتیاز</span></div><div class="stat"><b id="homeLevel">—</b><span>مرحله</span></div></div></section>
  <div class="section-title">بخش‌های بازی <span class="pill">آنلاین</span></div><div class="grid">
  ${linkCard('single.html','🧩','بازی تک‌نفره','مراحل و پیشرفت شما')}
  ${linkCard('compete.html','⚔️','مسابقه آنلاین','رقابت با بازیکنان واقعی')}
  ${linkCard('search.html','🔎','جست‌وجوی حریف','پیدا کردن بازیکن آنلاین')}
  ${linkCard('friends.html','👥','بازی با دوستان','ساخت اتاق و دعوت')}
  ${linkCard('leaderboard.html','🏆','جدول امتیازات','رتبه‌بندی واقعی')}
  ${linkCard('profile.html','👤','پروفایل','آمار و دستاوردها')}
  ${linkCard('shop.html','🪙','فروشگاه','خرید امن با پرداخت')}
  ${linkCard('membership.html','📣','عضویت کانال‌ها','شرایط ورود به بازی')}
  </div><div id="status" class="stack" style="margin-top:14px"></div>${footer()}`;
  try {
    const p = await profile();
    $('#homeCoins').textContent = fa(p.profile.coins);
    $('#homeScore').textContent = fa(p.profile.score);
    $('#homeLevel').textContent = fa(p.profile.level);
  } catch (e) { onlineError(e); }
}

async function initSingle() {
  $('#app').innerHTML = shell('بازی تک‌نفره','مرحله‌های بازشده و پیشرفت ذخیره‌شده') +
    `<div id="status"></div><div class="card stack"><div class="row spread"><b>مراحل</b><span id="progressText" class="pill">در حال دریافت…</span></div><div id="levels" class="grid"></div></div>${footer()}`;
  try {
    const d = await api('levels');
    $('#progressText').textContent = `${fa(d.completed||0)} مرحله کامل`;
    set($('#levels'), (d.levels||[]).map(l =>
      `<a class="tile" href="game.html?level=${encodeURIComponent(l.id)}"><span class="emoji">${l.completed?'✅':'🧩'}</span><b>مرحله ${fa(l.number)}</b><small>${l.completed?'تکمیل‌شده':'شروع مرحله'}</small></a>`
    ).join('') || '<div class="empty">هنوز مرحله‌ای در سرور تعریف نشده است. ابتدا بانک مراحل را در پنل مدیریت وارد کنید.</div>');
  } catch (e) { onlineError(e); }
}

async function initGame() {
  const level = new URLSearchParams(location.search).get('level') || '1';
  $('#app').innerHTML = shell('کلمه‌سازی', `مرحله ${fa(level)}`) +
    `<div id="status"></div><div class="card stack"><div class="row spread"><span class="muted">حروف مرحله</span><span id="foundCount" class="pill">۰ کلمه</span></div><div id="answer" class="answer">حروف را انتخاب کنید</div><div id="letters" class="letters"></div><div class="row"><button class="btn secondary" id="clear">پاک‌کردن</button><button class="btn secondary" id="shuffle">برهم‌زدن</button><button class="btn" id="submit">ثبت کلمه</button></div><div class="section-title">کلمات پیدا شده</div><div id="found" class="word-list"></div></div>${footer()}`;
  let data, selected = [], found = [];
  try { data = await api('level', { level_id: level }); } catch (e) { onlineError(e); return; }
  const draw = () => {
    set($('#answer'), selected.join('') || 'حروف را انتخاب کنید');
    set($('#letters'), data.letters.map((x,i) =>
      `<button class="letter" data-i="${i}" ${selected.filter(v=>v.i===i).length?'disabled':''}>${esc(x)}</button>`
    ).join(''));
    set($('#found'), found.map(w => `<div class="word">${esc(w)}</div>`).join('') || '<div class="muted">هنوز کلمه‌ای پیدا نشده</div>');
    $('#foundCount').textContent = fa(found.length) + ' کلمه';
  };
  $('#letters').addEventListener('click', e => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    const i = Number(b.dataset.i);
    if (selected.some(v => v.i === i)) return;
    selected.push({ i, v: data.letters[i] }); draw();
  });
  $('#clear').onclick = () => { selected = []; draw(); };
  $('#shuffle').onclick = () => { data.letters.sort(() => Math.random() - .5); selected = []; draw(); };
  $('#submit').onclick = async () => {
    const word = selected.map(x => x.v).join('');
    if (!word) return toast('ابتدا حروف را انتخاب کنید');
    try {
      const r = await api('submit_single', { level_id: level, word });
      if (r.accepted) { found = r.foundWords || [...found, word]; toast('آفرین! کلمه ثبت شد'); }
      else toast(r.message || 'این کلمه پذیرفته نشد');
      selected = []; draw();
    } catch (e) { onlineError(e); }
  };
  draw();
}

async function initCompete() {
  $('#app').innerHTML = shell('مسابقه آنلاین','فقط بازیکنان واقعی؛ شروع گروهی با ۴ نفر') +
    `<div class="stack"><div class="card stack"><span class="emoji">👥</span><b>مسابقه گروهی</b><p class="muted">با ۴ بازیکن واقعی وارد مسابقه می‌شوید.</p><button class="btn block" id="group">جست‌وجوی مسابقه گروهی</button></div><div class="card stack"><span class="emoji">🔗</span><b>بازی با دوستان</b><p class="muted">یک اتاق بسازید و دوستانتان را دعوت کنید.</p><a class="btn secondary block" href="friends.html">ساخت اتاق دوستانه</a></div><div class="card stack"><span class="emoji">⚔️</span><b>مسابقه سریع</b><p class="muted">به صف انتظار بازیکنان واقعی بپیوندید.</p><a class="btn secondary block" href="search.html">پیدا کردن حریف</a></div></div><div id="status"></div>${footer()}`;
  $('#group').onclick = async () => {
    try {
      const r = await api('matchmake', { mode: 'group', capacity: 4 });
      if (r.matched) location.href = 'room.html?id=' + encodeURIComponent(r.room.id);
      else { sessionStorage.setItem('vm_search_id', r.searchId || ''); location.href = 'search.html'; }
    } catch (e) { onlineError(e); }
  };
}

async function initSearch() {
  $('#app').innerHTML = shell('جست‌وجوی حریف','در حال پیدا کردن بازیکنان واقعی') +
    `<div class="card stack" style="text-align:center;padding:28px"><div style="font-size:42px">🔎</div><b id="searchTitle">آماده جست‌وجو</b><p class="muted" id="searchText">با شروع جست‌وجو، فقط کاربران آنلاین وارد صف می‌شوند.</p><div class="progress"><i id="searchBar"></i></div><div id="status"></div><button class="btn block" id="startSearch">شروع جست‌وجو</button><button class="btn danger block hidden" id="cancelSearch">لغو جست‌وجو</button></div>${footer()}`;
  let active = false, searchId = null, timer = null;
  const poll = async () => {
    if (!active) return;
    try {
      const r = await api('match_status', { search_id: searchId });
      $('#searchText').textContent = `${fa(r.waiting||0)} از ${fa(4)} بازیکن آماده‌اند`;
      $('#searchBar').style.width = Math.min(100, (r.waiting||0) * 25) + '%';
      if (r.matched) { active = false; clearInterval(timer); location.href = 'room.html?id=' + encodeURIComponent(r.room.id); }
    } catch (e) { active = false; clearInterval(timer); onlineError(e); }
  };
  $('#startSearch').onclick = async () => {
    try {
      const r = await api('matchmake', { mode: 'group', capacity: 4 });
      if (r.matched) { location.href = 'room.html?id=' + encodeURIComponent(r.room.id); return; }
      searchId = r.searchId; active = true;
      $('#startSearch').classList.add('hidden');
      $('#cancelSearch').classList.remove('hidden');
      $('#searchTitle').textContent = 'در حال جست‌وجو…';
      await poll();
      timer = setInterval(poll, 1000);
    } catch (e) { onlineError(e); }
  };
  $('#cancelSearch').onclick = async () => {
    active = false; clearInterval(timer);
    try { await api('match_cancel', { search_id: searchId }); } catch (e) {}
    $('#startSearch').classList.remove('hidden');
    $('#cancelSearch').classList.add('hidden');
    $('#searchTitle').textContent = 'جست‌وجو لغو شد';
    $('#searchText').textContent = 'هر زمان خواستید دوباره جست‌وجو را شروع کنید.';
  };
}

async function initFriends() {
  $('#app').innerHTML = shell('بازی با دوستان','اتاق واقعی بسازید و لینک دعوت را بفرستید') +
    `<div class="card stack"><label>نام اتاق</label><input class="field" id="roomName" maxlength="30" placeholder="مثلاً دوستان قدیمی"><button class="btn block" id="createRoom">ساخت اتاق</button><div id="status"></div></div><div class="section-title">اتاق‌های من</div><div id="rooms" class="list"><div class="empty">برای مشاهده اتاق‌ها به سرور متصل شوید.</div></div>${footer()}`;
  $('#createRoom').onclick = async () => {
    try {
      const r = await api('room_create', { name: $('#roomName').value.trim() });
      location.href = 'room.html?id=' + encodeURIComponent(r.room.id);
    } catch (e) { onlineError(e); }
  };
  try {
    const r = await api('my_rooms');
    set($('#rooms'), (r.rooms||[]).map(x =>
      `<a class="list-item" href="room.html?id=${encodeURIComponent(x.id)}"><span>${esc(x.name)}</span><span class="pill">${fa(x.players.length)}/۴</span></a>`
    ).join('') || '<div class="empty">هنوز اتاقی ندارید.</div>');
  } catch (e) { onlineError(e); }
}

async function initRoom() {
  const id = new URLSearchParams(location.search).get('id');
  $('#app').innerHTML = shell('اتاق مسابقه','وضعیت بازیکنان و شروع بازی') +
    `<div id="status"></div><div class="card stack"><div class="row spread"><b id="roomTitle">در حال بارگذاری…</b><button class="btn secondary" id="share">دعوت</button></div><div id="players" class="list"></div><p class="muted" id="roomState"></p><button class="btn block" id="ready">آماده‌ام</button><button class="btn danger block" id="leave">خروج از اتاق</button></div>${footer()}`;
  if (!id) { onlineError(new Error('شناسه اتاق موجود نیست')); return; }
  const load = async () => {
    const r = await api('room_get', { room_id: id });
    const room = r.room;
    $('#roomTitle').textContent = room.name || 'اتاق مسابقه';
    set($('#players'), room.players.map(p =>
      `<div class="list-item"><div class="player"><div class="avatar">${esc((p.name||'?').slice(0,1))}</div><div><b>${esc(p.name)}</b><div class="sub">${p.ready?'آماده':'در انتظار'}</div></div></div><span class="pill">${p.isHost?'میزبان':'بازیکن'}</span></div>`
    ).join(''));
    $('#roomState').textContent = room.status === 'playing' ? 'مسابقه شروع شده است.' : `برای شروع به ۴ بازیکن واقعی نیاز است (${fa(room.players.length)}/۴).`;
  };
  try { await load(); } catch (e) { onlineError(e); return; }
  $('#ready').onclick = async () => { try { await api('room_ready', { room_id: id }); await load(); } catch (e) { onlineError(e); } };
  $('#share').onclick = () => {
    const url = location.origin + location.pathname.replace('room.html','') + 'room.html?id=' + encodeURIComponent(id);
    if (tg?.switchInlineQuery) tg.switchInlineQuery(url);
    else navigator.clipboard?.writeText(url).then(() => toast('لینک دعوت کپی شد'));
  };
  $('#leave').onclick = async () => { try { await api('room_leave', { room_id: id }); location.href = 'friends.html'; } catch (e) { onlineError(e); } };
  const timer = setInterval(() => load().catch(()=>{}), 1000);
  window.addEventListener('pagehide', () => clearInterval(timer));
}

async function initProfile() {
  $('#app').innerHTML = shell('پروفایل بازیکن','آمار ذخیره‌شده روی سرور') +
    `<div id="status"></div><div class="card stack"><div class="player"><div class="avatar" id="avatar">؟</div><div><b id="playerName">—</b><div class="muted" id="playerId">شناسه تلگرام</div></div></div><div class="stats"><div class="stat"><b id="score">—</b><span>امتیاز</span></div><div class="stat"><b id="wins">—</b><span>برد</span></div><div class="stat"><b id="levels">—</b><span>مراحل</span></div></div><div class="row spread"><span class="muted">سطح بازیکن</span><b id="level">—</b></div></div>${footer()}`;
  try {
    const r = await profile(), p = r.profile;
    $('#avatar').textContent = (p.name || name).slice(0,1);
    $('#playerName').textContent = p.name || name;
    $('#playerId').textContent = 'شناسه: ' + (p.telegramId || uid);
    $('#score').textContent = fa(p.score);
    $('#wins').textContent = fa(p.wins);
    $('#levels').textContent = fa(p.completedLevels);
    $('#level').textContent = fa(p.level);
  } catch (e) { onlineError(e); }
}

async function initLeaderboard() {
  $('#app').innerHTML = shell('جدول امتیازات','رتبه‌بندی بر اساس داده بازیکنان واقعی') +
    `<div class="row" style="margin-bottom:12px"><button class="btn secondary tab" data-period="week">هفته</button><button class="btn secondary tab" data-period="month">ماه</button><button class="btn secondary tab" data-period="all">همه‌وقت</button></div><div id="status"></div><div id="ranks" class="list"><div class="empty">در حال دریافت رتبه‌بندی…</div></div>${footer()}`;
  const load = async (period = 'week') => {
    try {
      const r = await api('leaderboard', { period });
      set($('#ranks'), (r.players||[]).map((p,i) =>
        `<div class="list-item"><div class="player"><div class="avatar">${fa(i+1)}</div><div><b>${esc(p.name)}</b><div class="sub">${esc(p.username||'بازیکن')}</div></div></div><b>${fa(p.score)} امتیاز</b></div>`
      ).join('') || '<div class="empty">هنوز امتیازی ثبت نشده است؛ بازیکنان واقعی پس از انجام بازی در این فهرست نمایش داده می‌شوند.</div>');
    } catch (e) { onlineError(e); }
  };
  $$('.tab').forEach(b => b.onclick = () => load(b.dataset.period));
  load();
}

async function initShop() {
  $('#app').innerHTML = shell('فروشگاه','خرید سکه فقط از مسیر پرداخت معتبر') +
    `<div class="warning">سکه‌ها در مرورگر قابل خرید یا افزایش نیستند. پرداخت باید از Telegram Stars و تأیید موفق پرداخت در سمت سرور انجام شود.</div><div id="status"></div><div class="list" id="packs"></div>${footer()}`;
  try {
    const r = await api('shop_catalog');
    set($('#packs'), r.packs.map(p =>
      `<div class="list-item"><div><b>${fa(p.coins)} سکه</b><div class="sub">${fa(p.stars)} ستاره تلگرام</div></div><button class="btn" data-buy="${esc(p.id)}">خرید</button></div>`
    ).join(''));
    $$('[data-buy]').forEach(b => b.onclick = async () => {
      try {
        const x = await api('shop_invoice', { pack_id: b.dataset.buy });
        if (!tg?.openInvoice) throw new Error('پرداخت فقط داخل Telegram قابل انجام است.');
        tg.openInvoice(x.invoiceUrl);
      } catch (e) { onlineError(e); }
    });
  } catch (e) { onlineError(e); }
}

function initSettings() {
  $('#app').innerHTML = shell('تنظیمات','تنظیمات نمایشی روی همین دستگاه') +
    `<div class="card stack"><div class="row spread"><b>پوسته روشن</b><input type="checkbox" id="theme"></div><div class="row spread"><b>صدای بازی</b><input type="checkbox" id="sound" checked></div><p class="muted">این تنظیمات نمایشی هستند و روی امتیاز یا داده حساب اثر ندارند.</p></div>${footer()}`;
  const t = $('#theme'), s = $('#sound');
  t.checked = localStorage.getItem('vm_theme') === 'light';
  document.body.classList.toggle('light', t.checked);
  t.onchange = () => { localStorage.setItem('vm_theme', t.checked?'light':'dark'); document.body.classList.toggle('light', t.checked); };
  s.checked = localStorage.getItem('vm_sound') !== 'off';
  s.onchange = () => localStorage.setItem('vm_sound', s.checked?'on':'off');
}

async function initMembership() {
  $('#app').innerHTML = shell('عضویت اجباری','شرایط ورود به مسابقات') +
    `<div id="status"></div><div id="channels" class="list"></div><button class="btn block" id="verify">بررسی عضویت من</button>${footer()}`;
  try {
    const r = await api('membership_list');
    set($('#channels'), r.channels.map(c =>
      `<a class="list-item" href="${esc(c.url)}" target="_blank" rel="noopener"><b>${esc(c.title)}</b><span class="pill">ورود به کانال</span></a>`
    ).join('') || '<div class="empty">در حال حاضر کانال اجباری تنظیم نشده است.</div>');
  } catch (e) { onlineError(e); }
  $('#verify').onclick = async () => {
    try {
      const r = await api('membership_check');
      toast(r.joined ? 'عضویت شما تأیید شد' : 'ابتدا عضو کانال‌های اعلام‌شده شوید');
    } catch (e) { onlineError(e); }
  };
}

const routes = {
  index: initHome, single: initSingle, game: initGame, compete: initCompete,
  search: initSearch, friends: initFriends, room: initRoom, profile: initProfile,
  leaderboard: initLeaderboard, shop: initShop, settings: initSettings, membership: initMembership
};
(routes[page] || initHome)();
})();
