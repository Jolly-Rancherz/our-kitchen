/* Our Kitchen — Corey ♥ Faith
   Vanilla JS single-page app. All data lives in one state object in localStorage
   (key "ourkitchen.v1"), structured so shared sync could be added later:
   every collection is keyed by id and carries updatedAt timestamps. */
(() => {
'use strict';

// ---------------------------------------------------------------- constants
const STORE_KEY = 'ourkitchen.v1';
const BANNED = [[/mushroom/i, 'mushrooms'], [/mustard/i, 'mustard'], [/\bolives?\b(?!\s+oil)/i, 'olives']];
const PANTRY_CATS = [
  ['meat', 'Meat & Seafood'], ['produce', 'Vegetables & Fresh'], ['dairy', 'Dairy, Eggs & Cheese'],
  ['grains', 'Pasta, Rice & Grains'], ['sauces', 'Sauces & Condiments'], ['spices', 'Spices & Seasonings'],
  ['baking', 'Baking & Pantry Staples'], ['frozen', 'Frozen'], ['other', 'Other'],
];
const PCAT = Object.fromEntries(PANTRY_CATS);
const LEVELS = [['lots', 'Lots', 'Have lots'], ['have', 'Have', 'Have it'], ['low', 'Low', 'Running low'], ['out', 'Out', 'Out']];
const FILTERS = [
  { key: 'price', label: 'Price', opts: [['$', '$', 'under $20'], ['$$', '$$', '$20–30'], ['$$$', '$$$', 'over $30']] },
  { key: 'time', label: 'Time', opts: [['under-30', 'Under 30 min'], ['30-45', '30–45 min'], ['up-to-60', 'Up to 1 hour']] },
  { key: 'method', label: 'Cooking method', opts: [['air-fryer', 'Air Fryer'], ['oven-bake', 'Oven Bake'], ['one-pan', 'One Pan / One Pot'], ['stovetop', 'Stovetop']] },
  { key: 'base', label: 'Base', opts: [['rice', 'Rice'], ['pasta', 'Pasta'], ['noodles', 'Noodles'], ['potatoes', 'Potatoes'], ['bread-wraps', 'Bread & Wraps']] },
  { key: 'occasion', label: 'Occasion', opts: [['weeknight', 'Weeknight Easy'], ['date-night', 'Date Night'], ['takeout-night', 'Takeout Night'], ['comfort-night', 'Comfort Night']] },
  { key: 'leftovers', label: 'Leftovers', opts: [['lunch', 'Great for Lunch'], ['freezer', 'Freezer-Friendly']] },
];
const TAGLABEL = {};
FILTERS.forEach((g) => g.opts.forEach((o) => { TAGLABEL[g.key + ':' + o[0]] = o[1]; }));

// ---------------------------------------------------------------- icons
const ICON = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  heart: '<path d="M12 20.5s-7.5-4.9-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.3-7.5 10.2-7.5 10.2z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 5v14l11-7z"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/>',
  share: '<path d="M12 15V3M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.2"/><circle cx="17" cy="20.5" r="1.2"/>',
  pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20M9 6.5c0-1 .8-1.5 1.5-2M13 6.5c0-1 .8-1.5 1.5-2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 8.5 4.5 9.5 6-.5.8-1.6 2.2-3.1 3.5M6.4 7.4C4.6 8.6 3.2 10.4 2.5 12c1 1.5 4.5 6 9.5 6 1.6 0 3-.4 4.3-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  chevR: '<path d="M9 5l7 7-7 7"/>',
  chevL: '<path d="M15 5l-7 7 7 7"/>',
  // before-you-start icons
  thaw: '<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5L4.9 17.5"/><path d="M9.5 3.5L12 5.5l2.5-2M9.5 20.5l2.5-2 2.5 2"/>',
  oven: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/><rect x="7" y="12" width="10" height="5"/>',
  airfryer: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M5 11h14M9 15h6M12 6.5h.01"/>',
  rice: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M7 8c1-2 3-3 5-3s4 1 5 3"/>',
  knife: '<path d="M4 20L16 8c2-2 4-2 4 0v1L8 21z"/><path d="M14 10l2 2"/>',
  cheese: '<path d="M3 17l9-11 9 6v5z"/><path d="M3 17h18M8 13.5h.01M14 14h.01M16 11.5h.01"/>',
  cup: '<path d="M5 8h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>',
};
ICON.thumbUp = '<path d="M7 11v9H4v-9zM7 11l4-7c1.5 0 2.5 1 2.2 2.6L12.6 10H19a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7"/>';
ICON.thumbDown = '<path d="M17 13V4h3v9zM17 13l-4 7c-1.5 0-2.5-1-2.2-2.6l.6-3.4H5a2 2 0 0 1-2-2.3l1.2-6A2 2 0 0 1 6.2 4H17"/>';
ICON.dice = '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>';
ICON.pantry = '<rect x="6" y="7" width="12" height="14" rx="2"/><path d="M8 3h8v4H8zM6 12h12"/>';
const svg = (name, extra = '') => `<svg viewBox="0 0 24 24" ${extra}>${ICON[name] || ICON.pot}</svg>`;
const CHECK = `<svg viewBox="0 0 24 24">${ICON.check}</svg>`;

// ---------------------------------------------------------------- helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = (s) => String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9) + now().toString(36).slice(-4);
const money = (n, dec) => '$' + (dec || (n % 1 && n < 100) ? Number(n).toFixed(2) : Math.round(n));
const pad2 = (n) => String(n).padStart(2, '0');
const monthKey = (d = new Date()) => d.getFullYear() + '-' + pad2(d.getMonth() + 1);
const todayISO = () => { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const monthName = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }); };
const shortDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }); };
const priceTier = (t) => (t < 20 ? '$' : t <= 30 ? '$$' : '$$$');
const timeBucket = (m) => (m <= 30 ? 'under-30' : m <= 45 ? '30-45' : 'up-to-60');
const bannedIn = (text) => BANNED.filter(([rx]) => rx.test(text)).map(([, w]) => w);

// fractions for kitchen units
const FR = [[0, ''], [0.125, '⅛'], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾'], [1, '']];
function fraction(q) {
  let whole = Math.floor(q); const rest = q - whole;
  let best = FR[0], d = 9;
  for (const f of FR) { const dd = Math.abs(rest - f[0]); if (dd < d) { d = dd; best = f; } }
  if (best[0] === 1) { whole += 1; best = FR[0]; }
  if (!whole && !best[1]) return '⅛';
  return (whole ? whole : '') + best[1];
}
const PLURAL = { cup: 'cups', clove: 'cloves', crown: 'crowns', slice: 'slices', can: 'cans', head: 'heads', bunch: 'bunches', package: 'packages' };
function fmtQty(q, unit) {
  if (q == null) return '';
  let txt;
  if (['cup', 'tbsp', 'tsp', 'lb'].includes(unit)) txt = fraction(q);
  else if (unit === 'g' || unit === 'ml') txt = String(q >= 100 ? Math.round(q / 10) * 10 : Math.max(5, Math.round(q / 5) * 5));
  else if (unit === 'kg' || unit === 'L') txt = String(Math.round(q * 20) / 20).replace(/\.?0+$/, '');
  else txt = fraction(Math.max(0.5, Math.round(q * 2) / 2));
  const u = unit ? (q > 1 && PLURAL[unit] ? PLURAL[unit] : unit) : '';
  return (txt + (u ? ' ' + u : '')).trim();
}

// ---------------------------------------------------------------- state
const DEFAULT_STATE = () => ({
  v: 1,
  createdAt: now(), updatedAt: now(),
  device: uid(),
  profile: { me: null, names: ['Corey', 'Faith'] },
  settings: { theme: 'auto', bigText: false, budgetMin: 350, budgetMax: 400, takeoutCost: 50, welcomed: false, anniversary: '',
    // update 2 (added fields only)
    units: 'both', temp: 'both', snow: true, hearts: true, haptics: true, autoRestock: true, lastBackup: null, backupSnooze: null, cook: {} },
  favourites: { 'comfort-soups-01': now() },      // recipeId -> ts (Mom's soup pre-hearted)
  recent: [],          // [recipeId]
  hidden: {},          // recipeId -> ts
  checks: {},          // recipeId -> { i: {key:1}, s: {idx:1}, at }
  servings: {},        // recipeId -> n
  pantry: {},          // pantryKey -> { name, cat, level, at }
  grocery: {},         // itemId -> { id, name, cat, key, from, checked, at }
  cooked: {},          // entryId -> { id, recipeId, title, date, amount, estimate, by, at }
  custom: {},          // recipeId -> recipe object (add-your-own)
  ratings: {},         // recipeId -> 1..5
  notes: {},           // recipeId -> text
  photos: {},          // recipeId -> [{ id, data, date }]
  leftovers: {},       // id -> { id, recipeId, title, date, portions }
  picks: {},           // id -> { id, recipeId, ok, date, by }
  seededSoup: 1,
  // update 2 (added collections only — nothing above changes shape)
  seenWhatsNew: null,  // id of the last "What's new" card dismissed
  loveNotes: {},       // recipeId -> { text, by, at, date }
  stories: {},         // recipeId -> text (family recipe story)
  freezer: {},         // id -> { id, name, portions, date, at }
  wish: {},            // id -> { id, text, by, date, at }
  prices: {},          // pantryKey -> { price, at, date, src, name } (learned from receipts)
  turn: null,          // 'Corey' | 'Faith' — whose turn to pick
  guests: {},          // recipeId -> people (guest mode)
  edits: {},           // recipeId -> edited copy of a built-in recipe
  versions: {},        // recipeId -> { prev, at } (the version before the last edit)
  milestones: {},      // key -> date reached
  recapSeen: {},       // monthKey -> ts (monthly recap card dismissed)
});
let state = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (raw && raw.v === 1) {
      const d = DEFAULT_STATE();
      const st = { ...d, ...raw, settings: { ...d.settings, ...raw.settings }, profile: { ...d.profile, ...raw.profile } };
      ['loveNotes', 'stories', 'freezer', 'wish', 'prices', 'guests', 'edits', 'versions', 'milestones', 'recapSeen'].forEach((k) => { if (!st[k] || typeof st[k] !== 'object') st[k] = {}; });
      if (!st.seededSoup) { st.favourites = { ...st.favourites, 'comfort-soups-01': st.favourites['comfort-soups-01'] || now() }; st.seededSoup = 1; }
      return st;
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_STATE();
}
let saveTimer;
function save() {
  state.updatedAt = now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { toast('Storage is full — export a backup'); }
  }, 120);
  updateBadge();
}
window.addEventListener('pagehide', () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {} });

// ---------------------------------------------------------------- data
let INDEX = { categories: [], recipes: [] };
const RECIPE_CACHE = {};
async function loadIndex() {
  const res = await fetch('recipes/index.json', { cache: 'no-cache' });
  INDEX = await res.json();
}
function allRecipes() {
  const custom = Object.values(state.custom).map(customSummary);
  return INDEX.recipes.map((r) => (state.edits[r.id] ? { ...r, title: state.edits[r.id].title || r.title, subtitle: state.edits[r.id].subtitle != null ? state.edits[r.id].subtitle : r.subtitle } : r)).concat(custom);
}
function visibleRecipes() { return allRecipes().filter((r) => !state.hidden[r.id]); }
function catOf(slugName) { return INDEX.categories.find((c) => c.slug === slugName) || { slug: slugName, name: slugName, colour: '#806098' }; }
function summary(id) { return allRecipes().find((r) => r.id === id); }
function customSummary(r) {
  const names = []; const pantry = [];
  r.groups.forEach((g) => g.items.forEach((it) => { names.push(it.name); if (it.pantry && !pantry.find((p) => p.name === it.pantry.name)) pantry.push(it.pantry); }));
  return {
    id: r.id, custom: true, category: r.category, num: r.num, title: r.title, subtitle: r.subtitle || '', image: r.image || null,
    prep: r.prep, cook: r.cook, total: r.prep + r.cook, servings: r.servings, cost: r.cost.total, price: priceTier(r.cost.total),
    tags: { ...(r.tags || {}), price: [priceTier(r.cost.total)], time: [timeBucket(r.prep + r.cook)] }, ingredients: names, pantry,
  };
}
async function getRecipe(id) {
  if (state.custom[id]) return state.custom[id];
  const base = await getBaseRecipe(id);
  if (base && state.edits[id]) return { ...base, ...state.edits[id], id, category: base.category, num: base.num, edited: true };
  return base;
}
async function getBaseRecipe(id) {
  if (RECIPE_CACHE[id]) return RECIPE_CACHE[id];
  const s = INDEX.recipes.find((r) => r.id === id); if (!s) return null;
  const r = await (await fetch(s.file)).json();
  RECIPE_CACHE[id] = { ...r, id, category: s.category, num: s.num };
  return RECIPE_CACHE[id];
}
const recipeLabel = (s) => catOf(s.category).name + ' ' + pad2(s.num);
function pantryKey(name) { return slug(name); }
function pantryCatalog() {
  // every ingredient across all recipes, plus anything added by hand
  const map = {};
  visibleRecipes().forEach((r) => r.pantry.forEach((p) => {
    const k = pantryKey(p.name);
    if (!map[k]) map[k] = { key: k, name: p.name, cat: p.cat || 'other', recipes: [] };
    map[k].recipes.push(r.id);
  }));
  Object.entries(state.pantry).forEach(([k, v]) => { if (!map[k] && v.name) map[k] = { key: k, name: v.name, cat: v.cat || 'other', recipes: [] }; });
  return map;
}
const levelOf = (key) => (state.pantry[key] && state.pantry[key].level) || null;
function setLevel(key, name, cat, level) {
  const cur = state.pantry[key] || { name, cat };
  state.pantry[key] = { ...cur, name, cat, level: cur.level === level ? null : level, at: now() };
  save();
}
function onList(key) { return Object.values(state.grocery).some((g) => g.key === key && !g.checked); }
function addGrocery(name, cat, key, from, amts) {
  key = key || pantryKey(name);
  const existing = Object.values(state.grocery).find((g) => g.key === key && !g.checked);
  if (existing) {
    if (from && !(existing.from || '').includes(from)) existing.from = existing.from ? existing.from + ', ' + from : from;
    if (amts && amts.length) existing.amounts = (existing.amounts || []).concat(amts);
    existing.at = now(); return false;
  }
  const id = uid();
  state.grocery[id] = { id, name, cat: cat || guessCat(name), key, from: from || '', checked: false, at: now() };
  if (amts && amts.length) state.grocery[id].amounts = amts;
  return true;
}
function guessCat(name) {
  const n = name.toLowerCase();
  const cat = pantryCatalog()[pantryKey(name)];
  if (cat) return cat.cat;
  const rules = [
    ['meat', /chicken|beef|pork|steak|bacon|turkey|shrimp|salmon|fish|sausage|ham|ground/],
    ['produce', /onion|garlic|potato|carrot|broccoli|lettuce|tomato|lemon|lime|apple|banana|celery|corn|spinach|cucumber|avocado|fruit|veg/],
    ['dairy', /milk|cream|cheese|butter|yogurt|egg|parmesan|cheddar|mozzarella/],
    ['grains', /rice|pasta|noodle|spaghetti|fettuccine|penne|bread|tortilla|wrap|bun|flour|oats/],
    ['sauces', /sauce|ketchup|mayo|vinegar|honey|syrup|dressing|salsa|soy/],
    ['spices', /salt|pepper|powder|paprika|seasoning|cumin|oregano|thyme|basil|cinnamon|spice/],
    ['frozen', /frozen|ice cream/],
    ['baking', /oil|sugar|cornstarch|baking|broth|stock|can|beans/],
  ];
  for (const [c, rx] of rules) if (rx.test(n)) return c;
  return 'other';
}

// ---------------------------------------------------------------- UI utils
let toastTimer;
function toast(msg, action, fn) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (action ? ` <button type="button">${esc(action)}</button>` : '');
  if (action) $('button', t).onclick = () => { fn(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2600);
}
function openSheet(html, mount) {
  const w = $('#sheetWrap');
  $('#sheetBody').innerHTML = html;
  w.hidden = false;
  $('.sheet', w).scrollTop = 0;
  if (mount) mount($('#sheetBody'));
}
function closeSheet() { $('#sheetWrap').hidden = true; $('#sheetBody').innerHTML = ''; }
$('#sheetWrap').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
function confirmSheet(title, text, okLabel, fn, danger) {
  openSheet(`<h2>${esc(title)}</h2><p class="sub">${esc(text)}</p>
    <div class="btnrow" style="margin-top:18px"><button class="btn" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="okBtn">${esc(okLabel)}</button></div>`,
  (b) => { $('#okBtn', b).onclick = () => { closeSheet(); fn(); }; });
}
function heartBurst(el) {
  const r = el.getBoundingClientRect();
  const b = document.createElement('div'); b.className = 'burst';
  b.style.left = r.left + r.width / 2 + 'px'; b.style.top = r.top + r.height / 2 + 'px';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2; const i2 = document.createElement('i');
    i2.style.setProperty('--x', Math.cos(a) * 30 + 'px'); i2.style.setProperty('--y', Math.sin(a) * 30 + 'px');
    b.appendChild(i2);
  }
  document.body.appendChild(b); setTimeout(() => b.remove(), 800);
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
}
function toggleFav(id, el) {
  if (state.favourites[id]) { delete state.favourites[id]; toast('Removed from favourites'); }
  else { state.favourites[id] = now(); if (el) heartBurst(el); toast('Saved to favourites ♥'); }
  save();
}
function setTop({ title = 'OUR KITCHEN', back = null, right = '' } = {}) {
  $('#tbTitle').innerHTML = title;
  $('#tbLeft').innerHTML = back ? `<button class="iconbtn" id="backBtn" aria-label="Back">${svg('back')}</button>` : '';
  if (back) $('#backBtn').onclick = () => (history.length > 1 && lastRoute ? history.back() : go(back));
  $('#tbRight').innerHTML = right + `<a class="iconbtn" href="#/settings" aria-label="Settings">${svg('gear')}</a>`;
}
function go(hash) { location.hash = hash; }
function updateBadge() {
  const n = Object.values(state.grocery).filter((g) => !g.checked).length;
  const b = $('#groceryBadge'); if (b) b.textContent = n ? String(n) : '';
}
function img(src, alt = '') { return src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : ''; }
function placeholderArt(r) {
  const c = catOf(r.category);
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${c.colour}"><svg viewBox="0 0 24 24" style="width:40%;height:40%;fill:none;stroke:#F5E6CE;stroke-width:1.2">${ICON.pot}</svg></div>`;
}

// ---------------------------------------------------------------- theme
const mq = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const t = state.settings.theme;
  const dark = t === 'dark' || (t === 'auto' && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.classList.toggle('big', !!state.settings.bigText);
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = dark ? '#060F26' : '#082048';
}
mq.addEventListener ? mq.addEventListener('change', applyTheme) : mq.addListener(applyTheme);

// ---------------------------------------------------------------- router
let lastRoute = null;
const ui = { q: '', filters: {}, budgetMonth: monthKey(), pantryFilter: 'all', homeScroll: 0 };
const routes = [
  [/^#?\/?$/, viewHome],
  [/^#\/c\/([\w-]+)$/, viewCategory],
  [/^#\/r\/([\w-]+)$/, viewRecipe],
  [/^#\/pantry$/, viewPantry],
  [/^#\/grocery$/, viewGrocery],
  [/^#\/budget$/, viewBudget],
  [/^#\/settings$/, viewSettings],
  [/^#\/add(?:\/([\w-]+))?$/, viewAdd],
  [/^#\/guide$/, viewGuide],
  [/^#\/us$/, viewUs],
  [/^#\/story$/, viewStory],
  [/^#\/freezer$/, viewFreezer],
  [/^#\/wish$/, viewWish],
  [/^#\/scan$/, () => { go('#/grocery'); setTimeout(openScan, 300); }],
  [/^#\/ideas$/, () => { go('#/'); setTimeout(() => openIdeas(), 300); }],
];
async function router() {
  const h = location.hash || '#/';
  if (lastRoute === '#/' ) ui.homeScroll = window.scrollY;
  closeSheet();
  for (const [rx, fn] of routes) {
    const m = h.match(rx);
    if (m) {
      const tab = h.startsWith('#/pantry') || h.startsWith('#/freezer') ? 'pantry' : h.startsWith('#/grocery') ? 'grocery' : h.startsWith('#/budget') ? 'budget' : h.startsWith('#/settings') ? '' : 'recipes';
      $$('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
      await fn(...m.slice(1));
      window.scrollTo(0, h === '#/' ? ui.homeScroll : 0);
      lastRoute = h;
      return;
    }
  }
  go('#/');
}
window.addEventListener('hashchange', router);
function render(html) { $('#view').innerHTML = html; }

// ---------------------------------------------------------------- views: home
function matchesFilters(r) {
  for (const [k, set] of Object.entries(ui.filters)) {
    if (!set.length) continue;
    const vals = (r.tags && r.tags[k]) || [];
    if (!set.some((v) => vals.includes(v))) return false;
  }
  if (ui.q && /[+,]/.test(ui.q)) {
    const terms = ui.q.toLowerCase().split(/\s*[+,]\s*/).filter(Boolean);
    const ings = [...(r.ingredients || []), ...(r.pantry || []).map((p) => p.name)].join(' | ').toLowerCase();
    if (!terms.every((t) => t.split(/\s+/).every((w) => ings.includes(w.replace(/s$/, ''))))) return false;
  } else if (ui.q) {
    const q = ui.q.toLowerCase();
    const hay = [r.title, r.subtitle, catOf(r.category).name, ...(r.ingredients || []),
      ...Object.entries(r.tags || {}).flatMap(([k, vs]) => vs.map((v) => TAGLABEL[k + ':' + v] || v))].join(' ').toLowerCase();
    if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
  }
  return true;
}
const filterCount = () => Object.values(ui.filters).reduce((a, s) => a + s.length, 0);
function rcard(r) {
  const fav = state.favourites[r.id];
  return `<a class="rcard" href="#/r/${r.id}">
    <div class="im">${r.image ? img(thumb(r.image), r.title) : placeholderArt(r)}</div>
    <div><div class="num">${esc(recipeLabel(r))}${r.custom ? ' · ours' : ''}</div>
      <div class="t">${esc(r.title)}</div>
      <div class="meta"><b>${r.price}</b><span>${r.total} min</span><span>~${money(r.cost)}</span>${fav ? `<svg class="heart" viewBox="0 0 24 24">${ICON.heart}</svg>` : ''}</div></div></a>`;
}
function miniCard(r) {
  return `<a class="mini-card" href="#/r/${r.id}"><div class="im">${r.image ? img(thumb(r.image), r.title) : placeholderArt(r)}</div>
    <div class="t">${esc(r.title)}</div><div class="m">${r.price} · ${r.total} min</div></a>`;
}
function greeting() {
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return part + ', Corey & Faith';
}
function daysSince(iso) { const [y, m, d] = iso.split('-').map(Number); return Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(y, m - 1, d)) / 864e5); }
function seasonalPick(recipes) {
  if (!recipes.length) return null;
  const mo = new Date().getMonth();
  const cold = mo >= 9 || mo <= 2;
  const pool = recipes.filter((r) => cold ? (r.category === 'comfort-soups' || (r.tags.occasion || []).includes('comfort-night')) : (r.tags.time || []).includes('under-30'));
  const list = pool.length ? pool : recipes;
  const day = Math.floor(Date.now() / 864e5);
  return list[day % list.length].id;
}
function pickKicker(r) {
  const mo = new Date().getMonth();
  if ((mo >= 9 || mo <= 2) && r.category === 'comfort-soups') return "Tonight's pick · soup season";
  if (state.favourites[r.id]) return "Tonight's pick · a favourite";
  return "Tonight's pick";
}
function logPick(id, ok) { const pid = uid(); state.picks[pid] = { id: pid, recipeId: id, ok, date: todayISO(), by: state.profile.me }; save(); }
function cookAgainNudge(recipes) {
  let best = null;
  recipes.forEach((r) => {
    const c = cookedEntries(r.id); if (!c.length) return;
    const d = daysSince(c[0].date);
    if (d >= 21 && (state.favourites[r.id] || (state.ratings[r.id] || 0) >= 4) && (!best || d > best.days)) best = { r, days: d };
  });
  return best;
}
function openRandom(recipes) {
  const pool = recipes.slice();
  let cur = null;
  const draw = (b) => {
    if (!pool.length) { b.innerHTML = '<h2>Can\'t decide?</h2><div class="empty">No recipes to pick from yet.</div>'; return; }
    const prev = cur;
    const opts = pool.length > 1 ? pool.filter((r) => r !== prev) : pool;
    cur = opts[Math.floor(Math.random() * opts.length)];
    b.innerHTML = `<h2>Can't decide?</h2><p class="sub">Here's tonight's idea${pool.length === 1 ? ' — the only one in the book so far, so it\'s an easy pick' : ''}.</p>
      <a class="pick-card" href="#/r/${cur.id}" style="margin-top:12px"><div class="im">${cur.image ? img(cur.image, cur.title) : placeholderArt(cur)}</div>
        <div class="pc-body"><div class="t">${esc(cur.title)}</div><div class="m">${cur.price} · ${cur.total} min · ~${money(cur.cost)}</div></div></a>
      <div class="foot"><button class="btn" id="rAgain" ${pool.length < 2 ? 'disabled style="opacity:.4"' : ''}>Spin again</button><a class="btn gold" href="#/r/${cur.id}" id="rGo">Let's make it</a></div>`;
    $('#rAgain', b).onclick = () => draw(b);
    $('#rGo', b).onclick = () => logPick(cur.id, true);
  };
  openSheet('', draw);
}
function openCanMake() {
  const have = (k) => ['lots', 'have', 'low'].includes(levelOf(k));
  const rows = visibleRecipes().map((r) => {
    const req = r.pantry.filter((p) => !/^(salt|black pepper|water)$/i.test(p.name));
    const got = req.filter((p) => have(pantryKey(p.name)));
    return { r, n: req.length, got: got.length, miss: req.filter((p) => !have(pantryKey(p.name))).map((p) => p.name) };
  }).sort((a, b) => b.got / b.n - a.got / a.n);
  const tracked = Object.values(state.pantry).some((p) => p.level);
  openSheet(`<h2>What can we make?</h2><p class="sub">${tracked ? 'Based on what\'s marked in Our Pantry (salt & pepper assumed).' : 'Mark what you have in the Pantry tab and this gets smart. For now, here\'s what each recipe needs.'}</p>
    <div class="canmake">${rows.map((x) => `<a href="#/r/${x.r.id}" class="cm"><div class="cm-top"><b>${esc(x.r.title)}</b><span>${x.got}/${x.n}</span></div>
      <div class="cm-bar"><i style="width:${x.n ? (x.got / x.n) * 100 : 0}%"></i></div>
      <div class="small muted">${x.miss.length ? 'Need: ' + esc(x.miss.slice(0, 6).join(', ')) + (x.miss.length > 6 ? ` +${x.miss.length - 6} more` : '') : 'You have everything ♥'}</div></a>`).join('')}</div>
    <div class="foot"><button class="btn" data-close>Close</button><a class="btn primary" href="#/pantry">Open pantry</a></div>`);
}
function viewHome() {
  setTop({ title: 'OUR KITCHEN' });
  const recipes = visibleRecipes();
  ui.pick = ui.pick && recipes.find((r) => r.id === ui.pick) ? ui.pick : seasonalPick(recipes);
  const searching = ui.q || filterCount();
  let body = '';
  if (searching) {
    const res = recipes.filter(matchesFilters);
    body = `<div class="sec"><div class="sec-title">${res.length} recipe${res.length === 1 ? '' : 's'}<button class="act" id="clearAll">Clear</button></div>${/[+,]/.test(ui.q) ? `<p class="small muted" style="margin:-4px 0 10px">Recipes that use ${esc(ui.q.split(/\s*[+,]\s*/).filter(Boolean).join(' + '))}</p>` : ''}
      ${res.length ? `<div class="rlist">${res.map(rcard).join('')}</div>` : `<div class="empty">Nothing matches yet — try fewer filters. More recipes are on the way.</div>`}</div>`;
  } else {
    const favs = Object.entries(state.favourites).sort((a, b) => b[1] - a[1]).map(([id]) => recipes.find((r) => r.id === id)).filter(Boolean);
    const recent = state.recent.map((id) => recipes.find((r) => r.id === id)).filter(Boolean).slice(0, 8);
    const cats = INDEX.categories.map((c) => ({ ...c, items: recipes.filter((r) => r.category === c.slug).sort((a, b) => a.num - b.num) }));
    const withRecipes = cats.filter((c) => c.items.length);
    const pk = recipes.find((r) => r.id === ui.pick);
    const lefts = Object.values(state.leftovers).sort((a, b) => (a.date < b.date ? -1 : 1));
    const nudge = cookAgainNudge(recipes);
    const lastMonth = monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
    const rc = new Date().getDate() <= 10 && !state.recapSeen[lastMonth] ? monthRecap(lastMonth) : null;
    const uu = useItUp(recipes);
    const turn = whoseTurn();
    body = `
      ${whatsNewCard()}${backupCard()}
      ${rc ? recapCard(rc, true) : ''}
      ${pk ? `<div class="sec pick"><div class="pick-k">${esc(pickKicker(pk))}</div>
        <a class="pick-card" href="#/r/${pk.id}"><div class="im">${pk.image ? img(pk.image, pk.title) : placeholderArt(pk)}</div>
          <div class="pc-body"><div class="t">${esc(pk.title)}</div><div class="m">${pk.price} · ${pk.total} min · ~${money(pk.cost)}</div></div></a>
        <div class="pick-q"><span>${esc(turn)}'s pick tonight — sound good?</span><button class="turnbtn" id="turnBtn" aria-label="Switch whose turn">${svg('swap')}</button></div>
        <div class="btnrow"><button class="btn ghost" id="pickNo">${svg('thumbDown')}Not tonight</button><button class="btn gold" id="pickYes">${svg('thumbUp')}Let's make it</button></div></div>` : ''}
      <div class="quick"><button class="btn ghost" id="randBtn">${svg('dice')}Can't decide?</button><button class="btn ghost" id="canMake">${svg('pantry')}What can we make?</button><button class="btn ghost wide" id="ideasBtn">${svg('star')}More ideas<small>mood · use it up · weather · wish list</small></button></div>
      ${uu.soon.length && uu.picks.length ? `<a class="nudge use" href="#/r/${uu.picks[0].r.id}"><span>${svg('clock')}</span><span><b>Use it up:</b> ${esc(uu.soon[0].p.name)} ${uu.soon[0].d === 0 ? 'is due today' : uu.soon[0].d === 1 ? 'is due tomorrow' : `is due in ${uu.soon[0].d} days`} — try ${esc(uu.picks[0].r.title)}.</span></a>` : ''}
      ${lefts.length ? `<div class="sec"><div class="sec-title">In the fridge</div><ul class="cooked">${lefts.map((l) => { const d = daysSince(l.date); const left = 4 - d; return `<li><div><div class="t">${esc(l.title)}</div><div class="d">${l.portions} portion${l.portions === 1 ? '' : 's'} · ${left > 1 ? `eat within ${left} days` : left === 1 ? 'eat by tomorrow' : left === 0 ? '<b style="color:var(--gold-deep)">eat today</b>' : '<b style="color:#A0303A">past 4 days — toss it</b>'}</div></div><button class="btn sm ghost" data-ate="${l.id}">Ate one</button></li>`; }).join('')}</ul></div>` : ''}
      ${nudge ? `<a class="nudge" href="#/r/${nudge.r.id}"><span>${svg('reset')}</span><span>It's been <b>${nudge.days} days</b> since ${esc(nudge.r.title)}. Cook it again?</span></a>` : ''}
      <div class="sec"><div class="sec-title">Favourites</div>
        ${favs.length ? `<div class="hrow">${favs.map(miniCard).join('')}</div>` : `<div class="empty">Tap the ♡ on a recipe and it'll live here.</div>`}</div>
      ${recent.length ? `<div class="sec"><div class="sec-title">Recently viewed</div><div class="hrow">${recent.map(miniCard).join('')}</div></div>` : ''}
      <div class="sec"><div class="sec-title">Categories</div>
        <div class="cats">${withRecipes.map((c, i) => `<a class="cat-tile r${(i % 4) + 1}" href="#/c/${c.slug}" style="background:${c.colour}">${img(c.tile, '')}
          <div class="lbl"><b>${esc(c.name)}</b><span>${c.items.length} recipe${c.items.length === 1 ? '' : 's'}</span></div></a>`).join('')}</div></div>
      <div class="sec"><div class="sec-title">Contents</div>
        ${withRecipes.map((c) => `<div class="toc-sec"><div class="sh"><span class="sq" style="background:${c.colour}"></span>${esc(c.name)}</div>
          ${c.items.map((r) => `<a href="#/r/${r.id}"><em>${pad2(r.num)}</em><span>${esc(r.title)}</span><i>${r.price}</i></a>`).join('')}</div>`).join('')}
        <p class="small muted" style="margin-top:10px">${recipes.length} of 101 recipes so far — more are added in small batches.</p>
      </div>
      <div class="sec guides"><h3>GUIDES</h3><div class="gl">
        <a href="#/guide"><span>°</span>Safe temps</a><a href="#/guide"><span>❄</span>Thawing</a>
        <a href="#/budget"><span>$</span>$350 month</a><a href="#/add"><span>+</span>Add a recipe</a><a href="#/us"><span>♥</span>Us</a><a href="#/story"><span>❦</span>Our story</a>
        <a href="#/freezer"><span>❄</span>Freezer</a><a href="#/wish"><span>✧</span>Wish list</a><a href="#/scan"><span>▤</span>Scan receipt</a><a href="#/settings"><span>⚙</span>Settings</a></div></div>`;
  }
  const fc = filterCount();
  render(`<div class="home-head">
      <div class="kicker">Recipes we love<span class="rule"></span></div>
      <div class="lead" style="margin-top:6px">${esc(greeting())}</div>
      ${wxFresh() ? `<div class="wx" id="wxLine">London · ${wxTemp(wxFresh().t)} · ${esc(wxWords(wxFresh().code))} — ${esc(wxMood(wxFresh()).line)}</div>` : ''}
      <div class="searchrow"><label class="search">${svg('search')}<input id="q" type="search" placeholder="Search recipes or ingredients" value="${esc(ui.q)}" autocomplete="off" enterkeyhint="search">${ui.q ? '<button class="clear" id="qClear" aria-label="Clear">×</button>' : ''}</label>
        <button class="filterbtn ${fc ? 'on' : ''}" id="filterBtn" aria-label="Filters">${svg('filter')}${fc ? `<b>${fc}</b>` : ''}</button></div>
      ${fc ? `<div class="activefilters">${Object.entries(ui.filters).flatMap(([k, s]) => s.map((v) => `<button data-k="${k}" data-v="${esc(v)}">${esc(TAGLABEL[k + ':' + v])}</button>`)).join('')}</div>` : ''}
    </div><div class="wrap" style="padding-top:0">${body}</div>`);
  const q = $('#q');
  q.addEventListener('input', () => {
    ui.q = q.value.trim();
    const pos = q.selectionStart; viewHome(); const q2 = $('#q'); q2.focus(); try { q2.setSelectionRange(pos, pos); } catch (e) {}
  });
  $('#qClear') && ($('#qClear').onclick = (e) => { e.preventDefault(); ui.q = ''; viewHome(); });
  $('#filterBtn').onclick = openFilters;
  $('#clearAll') && ($('#clearAll').onclick = () => { ui.q = ''; ui.filters = {}; viewHome(); });
  $('#pickYes') && ($('#pickYes').onclick = (e) => { const t = whoseTurn(); const pid = uid(); state.picks[pid] = { id: pid, recipeId: ui.pick, ok: true, date: todayISO(), by: t }; state.turn = other(t); save(); heartBurst(e.currentTarget); setTimeout(() => go('#/r/' + ui.pick), 350); });
  $('#turnBtn') && ($('#turnBtn').onclick = () => { state.turn = other(whoseTurn()); save(); const y = scrollY; viewHome(); scrollTo(0, y); });
  $('#ideasBtn') && ($('#ideasBtn').onclick = () => openIdeas());
  $('#wnX') && ($('#wnX').onclick = $('#wnOk').onclick = () => { state.seenWhatsNew = WHATSNEW_ID; save(); const y = scrollY; viewHome(); scrollTo(0, y); });
  $('#wnMore') && ($('#wnMore').onclick = () => { openWhatsNew(); });
  $('#bkNow') && ($('#bkNow').onclick = () => { exportBackup(); const y = scrollY; viewHome(); scrollTo(0, y); });
  $('#bkLater') && ($('#bkLater').onclick = () => { state.settings.backupSnooze = now() + DAYS(7); save(); const y = scrollY; viewHome(); scrollTo(0, y); toast("I'll remind you next week"); });
  $('#recapX') && ($('#recapX').onclick = () => { state.recapSeen[lastMonthKey()] = now(); save(); const y = scrollY; viewHome(); scrollTo(0, y); });
  $('#pickNo') && ($('#pickNo').onclick = () => {
    logPick(ui.pick, false);
    const others = recipes.filter((r) => r.id !== ui.pick);
    if (!others.length) { toast("It's the only recipe in the book so far — more are coming soon ♥"); return; }
    ui.pick = others[Math.floor(Math.random() * others.length)].id; viewHome();
  });
  $('#randBtn') && ($('#randBtn').onclick = () => openRandom(recipes));
  $('#canMake') && ($('#canMake').onclick = openCanMake);
  $$('[data-ate]').forEach((b) => (b.onclick = () => { const l = state.leftovers[b.dataset.ate]; l.portions--; if (l.portions <= 0) delete state.leftovers[l.id]; save(); viewHome(); toast(l.portions > 0 ? 'Enjoy lunch ♥' : 'All gone — nice!'); }));
  $$('.activefilters button').forEach((b) => (b.onclick = () => { ui.filters[b.dataset.k] = ui.filters[b.dataset.k].filter((v) => v !== b.dataset.v); viewHome(); }));
}
function lastMonthKey() { return monthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)); }
function openFilters() {
  const draft = JSON.parse(JSON.stringify(ui.filters));
  const draw = (b) => {
    const count = visibleRecipes().filter((r) => { const save = ui.filters; ui.filters = draft; const ok = matchesFilters(r); ui.filters = save; return ok; }).length;
    b.innerHTML = `<h2>Filters</h2><p class="sub">Pick any — within a group it's "either", across groups it's "and". Only filters that match a recipe are shown; more appear as recipes are added.</p>
      ${FILTERS.map((g) => ({ ...g, opts: g.opts.filter((o) => (draft[g.key] || []).includes(o[0]) || visibleRecipes().some((r) => ((r.tags || {})[g.key] || []).includes(o[0]))) })).filter((g) => g.opts.length).map((g) => `<div class="fgroup"><h4>${g.label}</h4><div class="chips">${g.opts.map((o) => `<button class="chip ${(draft[g.key] || []).includes(o[0]) ? 'on' : ''}" data-k="${g.key}" data-v="${esc(o[0])}">${esc(o[1])}${o[2] ? ` <small>${esc(o[2])}</small>` : ''}</button>`).join('')}</div></div>`).join('')}
      <div class="foot"><button class="btn" id="fClear">Clear</button><button class="btn primary" id="fApply">Show ${count} recipe${count === 1 ? '' : 's'}</button></div>`;
    $$('.chip', b).forEach((c) => (c.onclick = () => {
      const s = draft[c.dataset.k] || (draft[c.dataset.k] = []);
      const i = s.indexOf(c.dataset.v); i >= 0 ? s.splice(i, 1) : s.push(c.dataset.v);
      const top = $('.sheet').scrollTop; draw(b); $('.sheet').scrollTop = top;
    }));
    $('#fClear', b).onclick = () => { Object.keys(draft).forEach((k) => delete draft[k]); draw(b); };
    $('#fApply', b).onclick = () => { ui.filters = draft; closeSheet(); viewHome(); };
  };
  openSheet('', draw);
}

// ---------------------------------------------------------------- views: category
function viewCategory(slugName) {
  const c = catOf(slugName);
  setTop({ title: esc(c.name.toUpperCase()), back: '#/' });
  const items = visibleRecipes().filter((r) => r.category === slugName).sort((a, b) => a.num - b.num);
  render(`<div class="wrap"><div class="kicker"><span class="sw" style="background:${c.colour}"></span>Category<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">${esc(c.name)}</h1>
    <p class="lead" style="margin-top:4px">${items.length} recipe${items.length === 1 ? '' : 's'} so far</p>
    <div class="rlist" style="margin-top:16px">${items.map(rcard).join('') || '<div class="empty">No recipes here yet.</div>'}</div></div>`);
}

// ---------------------------------------------------------------- views: recipe
const OCC = { 'date-night': 'Date Night', 'takeout-night': 'Takeout Night', 'comfort-night': 'Comfort Night', weeknight: 'Weeknight Easy' };
function ingLine(it, f, withHave = true) {
  const q = it.qty == null ? null : it.qty * f;
  const units = state.settings.units || 'both';
  const amt = q == null ? '' : amtText(it, f);
  const met = it.metric && units !== 'us' ? ` <span class="met">(${units === 'metric' ? fmtQty(q, it.unit) : fmtQty(it.metric.qty * f, it.metric.unit)})</span>` : '';
  let have = '';
  if (withHave && it.pantry) {
    const l = levelOf(pantryKey(it.pantry.name));
    if (l === 'out') have = '<span class="have out">Out</span>'; else if (l === 'low') have = '<span class="have low">Low</span>';
  }
  return `${amt ? `<span class="amt">${esc(amt)}</span>${met} ` : ''}${esc(it.name)}${it.note ? `<span class="note">, ${esc(it.note)}</span>` : ''}${it.optional ? '<span class="opt">optional</span>' : ''}${have}`;
}
function cookedEntries(id) { return Object.values(state.cooked).filter((c) => c.recipeId === id).sort((a, b) => (a.date < b.date ? 1 : -1)); }

async function viewRecipe(id) {
  const s = summary(id);
  const r = s && (await getRecipe(id));
  if (!r) { render('<div class="wrap"><div class="empty">That recipe could not be found.</div></div>'); setTop({ back: '#/' }); return; }
  state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 12); save();
  const c = catOf(s.category);
  const base = r.servings || 4;
  const sv = state.servings[id] || base;
  const f = sv / base;
  const ck = state.checks[id] || { i: {}, s: {} };
  const fav = !!state.favourites[id];
  setTop({ title: esc(c.name.toUpperCase()) + ' <span class="h">·</span> ' + pad2(s.num), back: '#/',
    right: `<button class="iconbtn fav ${fav ? 'on' : ''}" id="favBtn" aria-label="Favourite">${svg('heart')}</button>` });
  const tags = r.tags || {};
  const pills = [`<span class="pill gold">${s.price}</span>`];
  (tags.method || []).slice(0, 1).forEach((m) => pills.push(`<span class="pill navy">${esc(TAGLABEL['method:' + m] || m)}</span>`));
  if (r.family) pills.push(`<span class="pill fam">${svg('heart')}Family recipe</span>`);
  (r.badges || []).filter((b) => !/air fryer/i.test(b)).forEach((b) => pills.push(`<span class="pill">${esc(b)}</span>`));
  (tags.occasion || []).slice(0, 2).forEach((o) => pills.push(`<span class="pill">${esc(OCC[o] || o)}</span>`));
  if ((tags.leftovers || []).includes('freezer')) pills.push('<span class="pill">Freezer-friendly</span>');
  const adj = adjustedCost(r);
  const cost = (r.edited || r.custom ? r.cost.total : adj.total) * f;
  const per = cost / sv;
  const cooked = cookedEntries(id);
  const guests = state.guests[id];
  const love = state.loveNotes[id];
  const story = state.stories[id] != null ? state.stories[id] : r.story;
  const subBtn = (it) => { const k = it.pantry ? pantryKey(it.pantry.name) : null; return k && SUBS[k] ? `<button class="subbtn" data-sub="1" aria-label="Swap ideas for ${esc(it.name)}">${svg('swap')}</button>` : ''; };
  const lastReact = cooked.find((c) => c.reactions && Object.keys(c.reactions).length);
  const units = state.settings.units || 'both';
  const { budgetMin, budgetMax } = state.settings;

  render(`
  <div class="r-head">
    <div class="kicker"><span class="sw" style="background:${c.colour}"></span>${esc(c.name)} ${pad2(s.num)}<span class="rule"></span></div>
    <h1 class="h1">${esc(r.title)}</h1>
    ${r.subtitle ? `<p class="lead">${esc(r.subtitle)}</p>` : ''}
    <div class="pills">${pills.join('')}</div>
  </div>
  <div class="hero"><div class="tile">${r.image ? img(r.image, r.imageAlt || r.title) : placeholderArt(s)}</div><i class="acc a1"></i><i class="acc a2"></i><i class="acc a3"></i></div>
  <div class="stats"><div class="stat"><b>${r.prep} min</b><span>Prep</span></div><div class="stat plum"><b>${r.cook} min</b><span>Cook</span></div><div class="stat peri"><b>${r.prep + r.cook} min</b><span>Total</span></div></div>
  <div class="serves"><strong>${guests ? `Guest mode · ${guests} people` : esc(sv === base && r.servingsNote ? r.servingsNote : sv + ' servings')}</strong><span class="muted">Est. ~${money(per, true)} a portion</span></div>
  <div class="plan"><button class="chip" id="startBy">${svg('clock')}Start cooking by…</button><button class="chip ${guests ? 'on' : ''}" id="guestBtn">${svg('users')}${guests ? guests + ' people' : 'Guests'}</button></div>

  <div class="wrap">
    ${love ? `<button class="lovenote" id="loveShow"><span class="lk">${svg('heart')}A NOTE${love.by ? ' FROM ' + esc(love.by.toUpperCase()) : ''}</span><span class="lt">${esc(love.text)}</span></button>` : ''}
    ${r.family ? `<div class="card famcard"><h3>THE STORY</h3><p>${esc(story || 'Tap to add the story behind this one.')}</p><button class="linkbtn" id="storyEdit">Edit the story</button></div>` : ''}
    ${(r.beforeYouStart || []).length || (r.gear || []).length ? `<div class="card before"><h3>BEFORE YOU START</h3><ul>${(r.beforeYouStart || []).map((b) => `<li><span class="ic">${svg(b.icon)}</span><span>${tx(b.text)}</span></li>`).join('')}</ul>
      ${(r.gear || []).length ? `<details class="gear"><summary>Gear you'll need (${r.gear.length})</summary><ul>${r.gear.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></details>` : ''}</div>` : ''}

    <div class="sec"><div class="sec-title">Ingredients<button class="act" id="resetBtn">Reset ticks</button><button class="act unitbtn" id="unitBtn" aria-label="Units">${units === 'metric' ? 'grams' : units === 'us' ? 'cups' : 'cups + g'}</button></div>
      <div class="portion"><div class="val" id="svVal">${sv}</div><input type="range" id="sv" min="1" max="10" step="1" value="${sv}" style="--p:${((sv - 1) / 9) * 100}%" aria-label="Servings"><div class="lbl">servings<br>${sv === base ? 'as written' : '× ' + (Math.round(f * 100) / 100)}</div></div>
      ${r.groups.map((g, gi) => `<div class="ing-group">${g.name ? `<div class="group-name">${esc(g.name)}</div>` : ''}<ul class="checklist">
        ${g.items.map((it, ii) => `<li data-i="${gi}-${ii}" class="${ck.i[gi + '-' + ii] ? 'done' : ''} ${subBtn(it) ? 'hassub' : ''}"><span class="box">${CHECK}</span><span class="txt">${ingLine(it, f)}</span>${subBtn(it)}</li>`).join('')}</ul></div>`).join('')}
      <button class="btn ghost block" id="missingBtn" style="margin-top:12px">${svg('cart')}Add to grocery list</button>
    </div>

    <div class="sec"><div class="sec-title">Method</div>
      <button class="btn primary block" id="cookBtn">${svg('play')}Step-by-step cook mode</button>
      <ul class="checklist steps" style="margin-top:8px">${r.steps.map((st, si) => `<li data-s="${si}" class="${ck.s[si] ? 'done' : ''}"><span class="stepnum"><span>${si + 1}</span>${CHECK}</span><span class="txt"><strong>${esc(st.title)}.</strong> ${tx(st.text)}${usesHTML(stepUses(r, st, f))}${st.timer ? `<span class="tm">${svg('timer', 'style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2"')}${st.timer} min</span>` : ''}</span></li>`).join('')}</ul>
      ${sv !== base ? `<p class="small muted" style="margin-top:6px">Amounts in the list and in each step are scaled for ${sv} servings; pan sizes and times in the steps are written for ${base}.</p>` : ''}
    </div>

    ${r.doneness ? `<div class="sec card"><h3>DONENESS</h3><p style="font-size:.95rem">${tx(r.doneness)} Check with an instant-read thermometer in the thickest part.</p></div>` : ''}

    ${(r.fixIt || []).length ? `<div class="sec"><div class="sec-title">Fix it</div><div class="card fix" style="padding-top:2px;padding-bottom:2px">${r.fixIt.map((x) => `<details><summary>${esc(x.problem)}</summary><p>${tx(x.fix)}</p></details>`).join('')}</div></div>` : ''}

    ${(r.prepAhead || []).length || r.reheat ? `<div class="sec"><div class="sec-title">Good to know</div><div class="card fix" style="padding-top:2px;padding-bottom:2px">
      ${(r.prepAhead || []).length ? `<details><summary>Make ahead</summary><ul class="tips">${r.prepAhead.map((t) => `<li>${tx(t)}</li>`).join('')}</ul></details>` : ''}
      ${r.reheat ? `<details><summary>Reheating leftovers</summary><p>${tx(r.reheat)}</p></details>` : ''}</div></div>` : ''}

    <div class="sec row2">
      ${r.swap ? `<div class="mini"><h3>SWAP</h3><p>${tx(r.swap)}</p></div>` : ''}
      ${r.leftovers ? `<div class="mini navy"><h3>LEFTOVERS</h3><p>${tx(r.leftovers)}</p></div>` : ''}
      ${r.saleTip ? `<div class="mini wide" style="background:var(--tile3)"><h3>SALE TIP · NO FRILLS</h3><p>${esc(r.saleTip)}</p></div>` : ''}
    </div>
    ${r.source ? `<p class="small muted" style="margin-top:10px;font-style:italic">${esc(r.source)}</p>` : ''}

    <div class="sec money">
      <div class="top"><span>About ${money(cost)} total</span><span>~${money(per, true)} a portion</span></div>
      <p>A <strong>${priceTier(cost)}</strong> dinner. Your month is <strong>${money(budgetMin)}–${money(budgetMax)}</strong> — about 13 dinners at ~$27–30 average${s.price === '$' ? ', so this one leaves room for a $$$ night.' : s.price === '$$$' ? '; pair it with a $ meal like Mom\'s potato soup.' : '.'}</p>
      ${(r.cost.breakdown || []).length ? `<details><summary>Where the money goes (${sv} servings)</summary><table>${(r.edited || r.custom ? r.cost.breakdown.map((l) => [l[0], l[1], l[2], false]) : adj.lines).map(([n, v, k, mine]) => `<tr><td>${esc(n)}${mine ? ' <span class="mine">your price</span>' : ''}</td><td>${money(v * f, true)}</td></tr>`).join('')}</table></details>` : ''}
      ${adj.mine && !r.edited && !r.custom ? `<div class="legend">Updated with ${adj.mine} price${adj.mine === 1 ? '' : 's'} from your receipts.</div>` : ''}
      <div class="legend">$ under $20 · $$ $20–30 · $$$ over $30 · CAD, No Frills London ON estimates, Nov 2026</div>
    </div>

    <div class="sec"><div class="sec-title">Our notes</div>
      <div class="card ours">
        <div class="rate-row"><span class="small muted">Our rating</span><div class="rate" id="rate">${[1, 2, 3, 4, 5].map((n) => `<button data-r="${n}" class="${(state.ratings[id] || 0) >= n ? 'on' : ''}" aria-label="${n} of 5">${svg('heart')}</button>`).join('')}</div></div>
        <textarea id="noteTx" class="notes" placeholder="e.g. Extra cheddar next time. Faith likes it thicker.">${esc(state.notes[id] || '')}</textarea>
        <button class="linkbtn lovebtn" id="loveBtn">${svg('heart')}${love ? 'Edit the love note' : 'Leave a love note'}</button>
        <div class="small muted" style="margin:12px 0 6px">Photo memories</div>
        <div class="photos">${(state.photos[id] || []).map((ph) => `<button class="ph" data-ph="${ph.id}"><img src="${ph.data}" alt="Our photo from ${esc(ph.date)}"><span>${esc(shortDate(ph.date))}</span></button>`).join('')}
          <label class="ph add">${svg('plus')}<span>Add photo</span><input type="file" id="phIn" accept="image/*" hidden></label></div>
      </div></div>

    <div class="sec r-actions">
      <button class="btn gold block" id="cookedBtn">${svg('check')}Mark as cooked</button>
      <div class="btnrow"><button class="btn ghost" id="shareBtn">${svg('share')}Share</button><button class="btn ghost" id="hideBtn">${svg('eyeoff')}Hide meal</button></div>
      <div class="btnrow"><button class="btn ghost" id="printBtn">${svg('print')}Print</button><a class="btn ghost" href="#/add/${id}">Edit recipe</a></div>
      ${r.custom ? `<div class="btnrow" style="grid-template-columns:1fr"><button class="btn ghost" id="exportRecipe">Export file</button></div>` : ''}
      ${state.versions[id] ? `<p class="small muted" style="text-align:center">${r.edited || r.custom ? 'Edited recipe' : 'Original recipe'} · <button class="linkbtn" id="verBtn">Switch to the ${state.versions[id].prev.base ? 'original' : 'other'} version</button></p>` : ''}
      <p class="small muted" style="text-align:center;margin-top:4px">${cooked.length ? `Cooked ${cooked.length} time${cooked.length === 1 ? '' : 's'} · last ${esc(shortDate(cooked[0].date))}${cooked[0].by ? ' by ' + esc(cooked[0].by === 'Both' ? 'both of you' : cooked[0].by) : ''}` : 'Not cooked yet — first time!'}</p>
      ${lastReact ? `<p class="small muted" style="text-align:center;margin-top:-4px">Last time: ${esc(reactLine(lastReact))}</p>` : ''}
    </div>
  </div>`);

  $('#favBtn').onclick = (e) => { toggleFav(id, e.currentTarget); e.currentTarget.classList.toggle('on', !!state.favourites[id]); };
  $$('.checklist li[data-i]').forEach((li) => (li.onclick = (e) => {
    if (e.target.closest('.subbtn')) { const [gi, ii] = li.dataset.i.split('-').map(Number); openSub(r.groups[gi].items[ii]); return; }
    toggleCheck(id, 'i', li.dataset.i, li);
  }));
  $$('.checklist li[data-s]').forEach((li) => (li.onclick = () => toggleCheck(id, 's', li.dataset.s, li)));
  $('#resetBtn').onclick = () => withUndo('Ticks reset', () => { delete state.checks[id]; }, () => $$('.checklist li.done').forEach((li) => li.classList.remove('done')));
  $('#unitBtn').onclick = () => { const order = ['both', 'us', 'metric']; state.settings.units = order[(order.indexOf(state.settings.units || 'both') + 1) % 3]; save(); const y = scrollY; viewRecipe(id).then(() => scrollTo(0, y)); toast(state.settings.units === 'metric' ? 'Showing grams first' : state.settings.units === 'us' ? 'Showing cups & spoons only' : 'Showing cups with grams'); };
  $('#startBy').onclick = () => openStartBy(r);
  $('#guestBtn').onclick = () => openGuests(r, id);
  $('#loveBtn').onclick = () => openLoveNote(id, r);
  $('#loveShow') && ($('#loveShow').onclick = () => openLoveNote(id, r));
  $('#storyEdit') && ($('#storyEdit').onclick = () => openStory(id, r));
  $('#printBtn').onclick = printRecipe;
  $('#verBtn') && ($('#verBtn').onclick = () => swapVersion(id));
  const range = $('#sv');
  range.oninput = () => { $('#svVal').textContent = range.value; range.style.setProperty('--p', ((range.value - 1) / 9) * 100 + '%'); };
  range.onchange = () => { const n = +range.value; delete state.guests[id]; if (n === base) delete state.servings[id]; else state.servings[id] = n; save(); const y = scrollY; viewRecipe(id).then(() => scrollTo(0, y)); };
  $('#missingBtn').onclick = () => openMissing(r, s, f);
  $('#cookBtn').onclick = () => openCook(r, s, f);
  $('#cookedBtn').onclick = () => openCooked(r, s, cost);
  $('#hideBtn').onclick = () => { state.hidden[id] = now(); save(); go('#/'); toast('Hidden from your lists', 'Undo', () => { delete state.hidden[id]; save(); router(); }); };
  $('#shareBtn').onclick = () => openShare(r, s, f, sv);
  $$('#rate button').forEach((b) => (b.onclick = () => { const n = +b.dataset.r; state.ratings[id] = state.ratings[id] === n ? 0 : n; save(); $$('#rate button').forEach((x) => x.classList.toggle('on', +x.dataset.r <= state.ratings[id])); if (state.ratings[id]) heartBurst(b); }));
  let nt; $('#noteTx').oninput = (e) => { clearTimeout(nt); nt = setTimeout(() => { const v = e.target.value.trim(); if (v) state.notes[id] = v; else delete state.notes[id]; save(); }, 400); };
  $('#phIn').onchange = (e) => addPhoto(id, e.target.files[0]);
  $$('[data-ph]').forEach((b) => (b.onclick = () => viewPhoto(id, b.dataset.ph)));
  $('#exportRecipe') && ($('#exportRecipe').onclick = () => exportRecipeFile(r));
}
function toggleCheck(id, kind, key, li) {
  const ck = state.checks[id] || (state.checks[id] = { i: {}, s: {} });
  if (ck[kind][key]) delete ck[kind][key]; else ck[kind][key] = 1;
  ck.at = now(); save();
  li.classList.toggle('done', !!ck[kind][key]);
}
function addPhoto(id, file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const max = 900; const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      const list = state.photos[id] || (state.photos[id] = []);
      if (list.length >= 12) { toast('12 photos max per recipe — remove one first'); return; }
      list.push({ id: uid(), data: c.toDataURL('image/jpeg', 0.72), date: todayISO() });
      save(); const y = scrollY; viewRecipe(id).then(() => scrollTo(0, y)); toast('Photo saved ♥'); checkMilestones();
    };
    im.onerror = () => toast("Couldn't read that photo");
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}
function viewPhoto(id, pid) {
  const ph = (state.photos[id] || []).find((p) => p.id === pid); if (!ph) return;
  openSheet(`<img src="${ph.data}" alt="" style="width:100%;display:block;margin-top:6px"><p class="sub" style="margin-top:8px">${esc(shortDate(ph.date))}</p>
    <div class="foot"><button class="btn danger" id="phDel">Delete</button><button class="btn primary" data-close>Done</button></div>`, (b) => {
    $('#phDel', b).onclick = () => { closeSheet(); withUndo('Photo deleted', () => { state.photos[id] = state.photos[id].filter((p) => p.id !== pid); }, () => viewRecipe(id)); };
  });
}
function openShare(r, s, f, sv) {
  openSheet(`<h2>Share recipe</h2><p class="sub">Send ${esc(r.title)} to someone.</p>
    <div class="btnrow" style="margin-top:16px"><button class="btn ghost" id="shTxt">Share as text</button><button class="btn primary" id="shImg">Share as image</button></div>`, (b) => {
    $('#shTxt', b).onclick = () => { closeSheet(); shareRecipe(r, f, sv); };
    $('#shImg', b).onclick = () => { closeSheet(); shareImage(r, s, f, sv); };
  });
}
function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
async function shareImage(r, s, f, sv) {
  toast('Making the card…');
  try { await Promise.all([document.fonts.load('700 40px Cinzel'), document.fonts.load('italic 40px "Instrument Serif"'), document.fonts.load('400 30px Outfit')]); } catch (e) {}
  const W = 1080, H = 1920; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const navy = '#082048', cream = '#F5E6CE', gold = '#C4963E', plum = '#381848', ink = '#12102E';
  g.fillStyle = cream; g.fillRect(0, 0, W, H);
  g.fillStyle = navy; g.fillRect(0, 0, W, 150);
  g.fillStyle = cream; g.font = '700 54px Cinzel'; g.textAlign = 'center'; g.fillText('OUR KITCHEN', W / 2, 92);
  g.fillStyle = gold; g.font = 'italic 34px "Instrument Serif"'; g.fillText('Corey ♥ Faith', W / 2, 134);
  const photo = r.image ? await loadImg(r.image) : null;
  let y = 190;
  if (photo) { const ph = 560, pw = W - 160; const sc = Math.max(pw / photo.width, ph / photo.height); const sw = pw / sc, sh = ph / sc;
    g.fillStyle = '#5070A8'; g.save(); g.translate(W - 110, y + ph - 30); g.rotate(0.15); g.fillRect(0, 0, 50, 50); g.restore();
    g.drawImage(photo, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, 80, y, pw, ph); y += ph + 70; }
  g.textAlign = 'left'; g.fillStyle = ink; g.font = '700 58px Cinzel';
  const wrap = (txt, x, yy, maxW, lh, max = 99) => { const words = txt.split(' '); let line = ''; let n = 0; for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); yy += lh; line = w; if (++n >= max) return yy; } else line = t; } if (line) { g.fillText(line, x, yy); yy += lh; } return yy; };
  y = wrap(r.title.toUpperCase(), 80, y, W - 160, 68);
  g.fillStyle = plum; g.font = 'italic 40px "Instrument Serif"'; y = wrap(r.subtitle || '', 80, y + 6, W - 160, 46, 2);
  g.fillStyle = gold; g.font = '600 32px Outfit'; g.fillText(`${s.price}  ·  ${r.prep + r.cook} MIN  ·  ${sv} SERVINGS`, 80, y + 20); y += 80;
  g.fillStyle = navy; g.fillRect(80, y, W - 160, 3); y += 54;
  g.fillStyle = ink; g.font = '400 30px Outfit';
  const items = r.groups.flatMap((gr) => gr.items).map((it) => ingLine({ ...it, note: null, optional: false }, f, false).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') + (it.optional ? ' (optional)' : ''));
  const lh = Math.min(46, Math.floor((H - 200 - y) / Math.max(1, items.length)));
  items.forEach((t, i) => { const yy = y + i * lh; g.fillStyle = gold; g.fillRect(80, yy - 13, 11, 11); g.fillStyle = ink; let txt = t; while (g.measureText(txt).width > W - 200 && txt.length > 4) txt = txt.slice(0, -2); if (txt !== t) txt = txt.trim() + '…'; g.fillText(txt, 106, yy); });
  g.fillStyle = plum; g.font = 'italic 34px "Instrument Serif"'; g.fillText(`${r.steps.length} easy steps — full method in Our Kitchen`, 80, Math.min(H - 130, y + items.length * lh + 30));
  g.fillStyle = navy; g.fillRect(0, H - 90, W, 90); g.fillStyle = cream; g.font = 'italic 34px "Instrument Serif"'; g.textAlign = 'center'; g.fillText('from Our Kitchen ♥  recipes we love', W / 2, H - 34);
  const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
  const file = new File([blob], slug(r.title) + '.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: r.title }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function shareRecipe(r, f, sv) {
  const text = `${r.title}${r.subtitle ? ' — ' + r.subtitle : ''}\n${sv} servings · ${r.prep + r.cook} min\n\nINGREDIENTS\n` +
    r.groups.map((g) => (g.name ? g.name.toUpperCase() + '\n' : '') + g.items.map((it) => '• ' + ingLine(it, f, false).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')).join('\n')).join('\n\n') +
    '\n\nMETHOD\n' + r.steps.map((s, i) => `${i + 1}. ${s.title}. ${s.text}`).join('\n') + '\n\n— from Our Kitchen ♥';
  if (navigator.share) navigator.share({ title: r.title, text }).catch(() => {});
  else navigator.clipboard && navigator.clipboard.writeText(text).then(() => toast('Recipe copied to clipboard'));
}

function openMissing(r, s, f) {
  const seen = {}; const rows = [];
  r.groups.forEach((g) => g.items.forEach((it) => {
    if (!it.pantry) return;
    const k = pantryKey(it.pantry.name);
    const amt = it.qty != null ? { q: Math.round(it.qty * f * 1000) / 1000, u: it.unit || null, from: r.title } : null;
    if (seen[k]) { if (amt) seen[k].amts.push(amt); return; }
    const l = levelOf(k);
    const row = { k, name: it.pantry.name, cat: it.pantry.cat, l, sel: !it.optional && (!l || l === 'low' || l === 'out') && !onList(k), on: onList(k), opt: it.optional, amts: amt ? [amt] : [] };
    seen[k] = row; rows.push(row);
  }));
  const lab = { lots: 'Have lots', have: 'Have it', low: 'Running low', out: 'Out' };
  openSheet(`<h2>Add to grocery list</h2><p class="sub">Only what's missing is ticked — anything marked "Have it" or "Have lots" in the pantry starts unticked. Amounts merge with what's already on the list${state.guests[s.id] ? ` · scaled for ${state.guests[s.id]} people` : ''}.</p>
    <ul class="checklist" style="margin-top:10px">${rows.map((x, i) => `<li data-x="${i}" class="${x.sel ? 'done' : ''}"><span class="box">${CHECK}</span><span>${esc(x.name)}${x.amts.length ? ` <span class="amt small">${esc(sumAmounts(x.amts))}</span>` : ''} <span class="note small">${x.on ? '· already on list' : x.l ? '· ' + lab[x.l] : '· not tracked'}${x.opt ? ' · optional' : ''}</span></span></li>`).join('')}</ul>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="addSel">Add to grocery list</button></div>`, (b) => {
    $$('li', b).forEach((li) => (li.onclick = () => { const x = rows[li.dataset.x]; x.sel = !x.sel; li.classList.toggle('done', x.sel); }));
    $('#addSel', b).onclick = () => {
      let n = 0; rows.filter((x) => x.sel).forEach((x) => { if (addGrocery(x.name, x.cat, x.k, r.title, x.amts)) n++; });
      save(); closeSheet(); toast(n ? `Added ${n} item${n === 1 ? '' : 's'} to the list` : 'Nothing new to add', n ? 'View' : null, () => go('#/grocery'));
    };
  });
}

function openCooked(r, s, est) {
  const e = Math.round(est);
  openSheet(`<h2>Mark as cooked</h2><p class="sub">${esc(r.title)} goes into this month's dinner total.</p>
    <div class="chips" style="margin-top:14px"><button class="chip on" data-m="est">Use estimate · ${money(e)}</button><button class="chip" data-m="real">Enter receipt amount</button></div>
    <div class="field" id="realF" hidden><label>Actual amount (CAD)</label><input id="realAmt" type="number" inputmode="decimal" step="0.01" min="0" placeholder="${e}"></div>
    <div class="field"><label>Date</label><input id="cDate" type="date" value="${todayISO()}"></div>
    <div class="field"><label>Who cooked?</label><div class="segtext" id="cWho" style="grid-template-columns:repeat(3,1fr)">${['Corey', 'Faith', 'Both'].map((n) => `<button type="button" data-who="${n}" class="${(state.profile.me || 'Both') === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <details class="reactbox"><summary>How was it? <span class="muted small">(optional)</span></summary>${reactPicker({})}</details>
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Leftovers in the fridge</b><span>Track lunch portions (eat within 4 days)</span></span><input class="numin" id="cLeft" type="number" inputmode="numeric" min="0" max="10" value="${Math.max(0, (state.servings[s.id] || r.servings || 4) - 2)}"></label>
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Reset the ticks</b><span>Clear ingredient & step checkboxes for next time</span></span><span class="switch"><input type="checkbox" id="cReset" checked><i></i></span></label>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn gold" id="cSave">Add to ${esc(new Date().toLocaleDateString('en-CA', { month: 'long' }))}</button></div>`, (b) => {
    let mode = 'est'; let who = state.profile.me || 'Both'; const reacts = {};
    bindReact(b, reacts);
    $$('#cWho button', b).forEach((x) => (x.onclick = () => { who = x.dataset.who; $$('#cWho button', b).forEach((y) => y.classList.toggle('on', y === x)); }));
    $$('.chip', b).forEach((c) => (c.onclick = () => { mode = c.dataset.m; $$('.chip', b).forEach((x) => x.classList.toggle('on', x === c)); $('#realF', b).hidden = mode !== 'real'; if (mode === 'real') $('#realAmt', b).focus(); }));
    $('#cSave', b).onclick = () => {
      let amount = e; const real = parseFloat($('#realAmt', b).value);
      if (mode === 'real') { if (!(real >= 0)) { toast('Enter the receipt amount'); return; } amount = Math.round(real * 100) / 100; }
      const id = uid(); const date = $('#cDate', b).value || todayISO();
      state.cooked[id] = { id, recipeId: s.id, title: r.title, date, amount, estimate: mode === 'est', by: who, at: now() };
      const rx = Object.fromEntries(Object.entries(reacts).filter(([, v]) => v)); if (Object.keys(rx).length) state.cooked[id].reactions = rx;
      if ($('#cReset', b).checked) delete state.checks[s.id];
      const lp = parseInt($('#cLeft', b).value, 10); if (lp > 0) { const lid = uid(); state.leftovers[lid] = { id: lid, recipeId: s.id, title: r.title, date, portions: lp }; }
      save(); closeSheet();
      const y = scrollY;
      if (location.hash === '#/r/' + s.id) viewRecipe(s.id).then(() => { scrollTo(0, y); const btn = $('#cookedBtn'); if (btn) heartBurst(btn); });
      const total = monthTotal(date.slice(0, 7));
      toast(`♥ Logged ${money(amount)} · ${monthName(date.slice(0, 7)).split(' ')[0]} is at ${money(total)}`, 'Budget', () => go('#/budget'));
      checkMilestones();
    };
  });
}
function monthTotal(key) { return Object.values(state.cooked).filter((c) => c.date.startsWith(key)).reduce((a, c) => a + Number(c.amount || 0), 0); }

// ---------------------------------------------------------------- cook mode
let wakeLock = null; let cookTimer = null;
async function lockScreen() {
  try { if ('wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); return true; } } catch (e) {}
  return false;
}
document.addEventListener('visibilitychange', () => { if (!$('#cook').hidden && document.visibilityState === 'visible') lockScreen(); });
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach((t) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.2, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3); });
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
// ---------------------------------------------------------------- views: pantry
function viewPantry() {
  setTop({ title: 'PANTRY' });
  const cat = pantryCatalog();
  const items = Object.values(cat);
  const counts = { lots: 0, have: 0, low: 0, out: 0, none: 0 };
  items.forEach((x) => { counts[levelOf(x.key) || 'none']++; });
  const pf = ui.pantryFilter;
  const shown = items.filter((x) => pf === 'all' || (pf === 'need' ? ['low', 'out'].includes(levelOf(x.key)) : pf === 'unset' ? !levelOf(x.key) : true));
  const needs = items.filter((x) => ['low', 'out'].includes(levelOf(x.key)) && !onList(x.key));
  render(`<div class="wrap">
    <div class="kicker">What we have<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">Pantry</h1>
    <p class="lead" style="margin-top:4px">Every ingredient in our recipes — no cupboard digging.</p>
    <div class="pantrylinks"><a class="chip" href="#/freezer">${svg('snow')}Freezer${Object.keys(state.freezer).length ? ' · ' + Object.values(state.freezer).reduce((a, x) => a + x.portions, 0) : ''}</a><button class="chip" id="scanP">${svg('camera')}Scan receipt</button>${(() => { const n = Object.values(state.pantry).filter((p) => { const d = useByDays(p); return d != null && d <= 2; }).length; return n ? `<span class="ub warn">${n} to use soon</span>` : ''; })()}</div>
    <div class="legend4"><div><b>${counts.lots}</b>Have lots</div><div><b>${counts.have}</b>Have it</div><div><b>${counts.low}</b>Running low</div><div><b>${counts.out}</b>Out</div></div>
    <div class="chips" style="margin-top:12px">
      <button class="chip ${pf === 'all' ? 'on' : ''}" data-pf="all">All ${items.length}</button>
      <button class="chip ${pf === 'need' ? 'on' : ''}" data-pf="need">Low & out ${counts.low + counts.out}</button>
      <button class="chip ${pf === 'unset' ? 'on' : ''}" data-pf="unset">Not set ${counts.none}</button></div>
    ${needs.length ? `<button class="btn plum block" id="addNeeds" style="margin-top:12px">${svg('cart')}Add ${needs.length} low & out to grocery list</button>` : ''}
    ${PANTRY_CATS.map(([ck, cn]) => {
      const rows = shown.filter((x) => x.cat === ck).sort((a, b) => a.name.localeCompare(b.name));
      if (!rows.length) return '';
      return `<div class="pgroup"><div class="gh">${esc(cn)}<span>${rows.length}</span></div>${rows.map((x) => {
        const l = levelOf(x.key);
        const used = x.recipes.length ? x.recipes.length + ' recipe' + (x.recipes.length === 1 ? '' : 's') : 'added by you';
        return `<div class="prow" data-k="${x.key}"><div class="nm"><button class="nmbtn" data-pk="${x.key}">${esc(x.name)}</button><small>${used}</small>${useByTag(state.pantry[x.key])}${['low', 'out'].includes(l) ? (onList(x.key) ? '<span class="addl onlist">✓ On list</span>' : `<button class="addl" data-add="${x.key}">+ Grocery list</button>`) : ''}</div>
          <div class="seg">${LEVELS.map(([lk, short, long]) => `<button data-l="${lk}" class="${l === lk ? 'on' : ''}" aria-label="${long}">${short}</button>`).join('')}</div></div>`;
      }).join('')}</div>`;
    }).join('') || '<div class="empty" style="margin-top:14px">Nothing here.</div>'}
    <div class="sec"><div class="sec-title">Add a pantry item</div>
      <div class="addrow"><input id="pNew" placeholder="e.g. Paper towel, ketchup…" enterkeyhint="done"><button class="btn primary" id="pAdd" aria-label="Add">${svg('plus')}</button></div></div>
  </div>`);
  $$('.chip[data-pf]').forEach((b) => (b.onclick = () => { ui.pantryFilter = b.dataset.pf; viewPantry(); }));
  $$('.prow').forEach((row) => {
    const x = cat[row.dataset.k];
    $$('.seg button', row).forEach((b) => (b.onclick = () => {
      setLevel(x.key, x.name, x.cat, b.dataset.l);
      const y = scrollY; let added = false;
      if (levelOf(x.key) === 'out' && state.settings.autoRestock !== false && !onList(x.key)) { addGrocery(x.name, x.cat, x.key, 'Restock'); save(); added = true; }
      viewPantry(); scrollTo(0, y);
      if (added) toast(`${x.name} is out — added to the grocery list`, 'Undo', () => { Object.values(state.grocery).forEach((g) => { if (g.key === x.key && !g.checked && g.from === 'Restock') delete state.grocery[g.id]; }); save(); const y2 = scrollY; viewPantry(); scrollTo(0, y2); });
    }));
    $('.nmbtn', row).onclick = () => openPantryItem(x);
  });
  $$('[data-add]').forEach((b) => (b.onclick = () => { const x = cat[b.dataset.add]; addGrocery(x.name, x.cat, x.key, 'Pantry'); save(); const y = scrollY; viewPantry(); scrollTo(0, y); toast(`${x.name} added to the list`); }));
  $('#addNeeds') && ($('#addNeeds').onclick = () => { needs.forEach((x) => addGrocery(x.name, x.cat, x.key, 'Pantry')); save(); viewPantry(); toast(`Added ${needs.length} to the grocery list`, 'View', () => go('#/grocery')); });
  const addP = () => { const v = $('#pNew').value.trim(); if (!v) return; const k = pantryKey(v); state.pantry[k] = { name: v, cat: guessCat(v), level: 'have', at: now() }; save(); viewPantry(); toast(`${v} added to pantry`); };
  $('#pAdd').onclick = addP; $('#pNew').onkeydown = (e) => { if (e.key === 'Enter') addP(); };
  $('#scanP').onclick = openScan;
}

// ---------------------------------------------------------------- views: grocery
function viewGrocery() {
  setTop({ title: 'GROCERY LIST' });
  const items = Object.values(state.grocery);
  const left = items.filter((g) => !g.checked).length;
  const done = items.length - left;
  render(`<div class="wrap">
    <div class="kicker">No Frills run<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">Grocery List</h1>
    <p class="lead" style="margin-top:4px">${left ? `${left} thing${left === 1 ? '' : 's'} to grab` : items.length ? 'All done — nice.' : 'Empty for now.'}</p>
    ${(() => { const t = tripEstimate(); return t.n && t.priced ? `<div class="trip"><span>Estimated trip</span><b>~${money(t.total)}</b><small>${t.priced === t.n ? 'all' : t.priced + ' of ' + t.n} items priced · typical No Frills packs${Object.keys(state.prices).length ? ' + your receipts' : ''}</small></div>` : ''; })()}
    <button class="btn ghost block" id="scanG" style="margin-top:10px">${svg('camera')}Scan a receipt</button>
    <div class="addrow"><input id="gNew" placeholder="Add an item…" enterkeyhint="done" autocomplete="off"><button class="btn primary" id="gAdd" aria-label="Add">${svg('plus')}</button>
      <select id="gCat" aria-label="Aisle"><option value="">Aisle: auto</option>${PANTRY_CATS.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
    ${items.length ? PANTRY_CATS.map(([ck, cn]) => {
      const rows = items.filter((g) => (PCAT[g.cat] ? g.cat : 'other') === ck).sort((a, b) => a.checked - b.checked || a.name.localeCompare(b.name));
      if (!rows.length) return '';
      return `<div class="pgroup"><div class="gh">${esc(cn)}<span>${rows.filter((g) => !g.checked).length} left</span></div><ul class="checklist glist">${rows.map((g) => `<li data-g="${g.id}" class="${g.checked ? 'done' : ''}"><span class="box">${CHECK}</span><span class="txt">${esc(g.name)}${g.amounts && g.amounts.length ? ` <span class="gamt">${esc(sumAmounts(g.amounts))}</span>` : ''}${g.from ? `<span class="from">for ${esc(g.from)}</span>` : ''}</span><button class="del" data-del="${g.id}" aria-label="Remove">×</button></li>`).join('')}</ul></div>`;
    }).join('') : `<div class="empty" style="margin-top:16px">Add things here, or tap “Add missing to grocery list” on a recipe, or “+ Grocery list” on anything running low in the Pantry.</div>`}
    ${items.length ? `<div class="gsummary"><span>${done} checked</span><span style="display:flex;gap:8px"><button class="btn sm ghost" id="gClear" ${done ? '' : 'disabled style="opacity:.4"'}>Clear checked</button><button class="btn sm ghost" id="gAll">Clear all</button></span></div>
    <p class="small muted" style="margin-top:10px">Checking something off marks it “Have it” in the Pantry.</p>` : ''}
  </div>`);
  const add = () => {
    const v = $('#gNew').value.trim(); if (!v) return;
    const c = $('#gCat').value || guessCat(v);
    addGrocery(v, c, pantryKey(v), ''); save(); viewGrocery(); $('#gNew').focus();
  };
  $('#gAdd').onclick = add; $('#gNew').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  $$('li[data-g]').forEach((li) => (li.onclick = (e) => {
    if (e.target.closest('.del')) return;
    const g = state.grocery[li.dataset.g]; g.checked = !g.checked; g.at = now();
    if (g.checked) { g.checkedAt = now(); g.checkedBy = state.profile.me || null; } else { delete g.checkedAt; delete g.checkedBy; }
    if (g.checked) { const p = state.pantry[g.key] || { name: g.name, cat: g.cat }; state.pantry[g.key] = { ...p, level: 'have', at: now() }; }
    save(); li.classList.toggle('done', g.checked);
    const y = scrollY; setTimeout(() => { viewGrocery(); scrollTo(0, y); }, 250);
  }));
  $$('[data-del]').forEach((b) => (b.onclick = () => { const g = state.grocery[b.dataset.del]; delete state.grocery[b.dataset.del]; save(); viewGrocery(); toast(`Removed ${g.name}`, 'Undo', () => { state.grocery[g.id] = g; save(); viewGrocery(); }); }));
  $('#gClear') && ($('#gClear').onclick = () => { const bak = { ...state.grocery }; Object.values(state.grocery).forEach((g) => { if (g.checked) delete state.grocery[g.id]; }); save(); viewGrocery(); toast('Cleared checked items', 'Undo', () => { state.grocery = bak; save(); viewGrocery(); }); });
  $('#gAll') && ($('#gAll').onclick = () => confirmSheet('Clear the whole list?', 'This removes every item, checked or not.', 'Clear all', () => withUndo('List cleared', () => { state.grocery = {}; }, viewGrocery), true));
  $('#scanG').onclick = openScan;
}

// ---------------------------------------------------------------- views: budget
function viewBudget() {
  setTop({ title: 'BUDGET' });
  const key = ui.budgetMonth;
  const { budgetMin: lo, budgetMax: hi, takeoutCost } = state.settings;
  const entries = Object.values(state.cooked).filter((c) => c.date.startsWith(key)).sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = entries.reduce((a, c) => a + Number(c.amount || 0), 0);
  const scale = Math.max(hi * 1.15, total * 1.05);
  const pct = (v) => Math.min(100, (v / scale) * 100);
  const all = Object.values(state.cooked);
  const byRecipe = {}; all.forEach((c) => { byRecipe[c.recipeId] = (byRecipe[c.recipeId] || 0) + 1; });
  const most = Object.entries(byRecipe).sort((a, b) => b[1] - a[1])[0];
  const mostName = most ? (summary(most[0]) || {}).title || all.find((c) => c.recipeId === most[0]).title : '—';
  const avg = all.length ? all.reduce((a, c) => a + Number(c.amount || 0), 0) / all.length : 0;
  const saved = all.reduce((a, c) => a + Math.max(0, takeoutCost - Number(c.amount || 0)), 0);
  const isNow = key === monthKey();
  const d = new Date(); const daysLeft = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate();
  let msg;
  if (!entries.length) msg = isNow ? `Nothing logged yet this month. Tap “Mark as cooked” on a recipe and it lands here.` : 'No dinners logged this month.';
  else if (total < lo) msg = `${money(lo - total)} left before ${money(lo)}${isNow ? ` with ${daysLeft} day${daysLeft === 1 ? '' : 's'} to go` : ''}. Average so far ${money(total / entries.length)} a dinner.`;
  else if (total <= hi) msg = `Inside your ${money(lo)}–${money(hi)} range. ${money(hi - total)} of wiggle room left.`;
  else msg = `${money(total - hi)} over ${money(hi)}. A couple of $ nights (like Mom's potato soup) will balance it out.`;
  let pace = '';
  if (isNow && entries.length && d.getDate() >= 3) {
    const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const proj = (total / d.getDate()) * dim;
    pace = proj < lo * 0.9 ? `On pace for about ${money(proj)} this month — comfortably under. Room for a $$$ date night.`
      : proj <= hi ? `On pace for about ${money(proj)} this month — right on track.`
      : `On pace for about ${money(proj)} — roughly ${money(proj - hi)} over. A few $ dinners this week will pull it back.`;
  }
  render(`<div class="wrap">
    <div class="kicker">Dinner money<span class="rule"></span></div>
    <div class="monthnav"><button id="mPrev" aria-label="Previous month">${svg('chevL')}</button><div class="m">${esc(monthName(key).toUpperCase())}</div><button id="mNext" aria-label="Next month" ${isNow ? 'disabled style="opacity:.3"' : ''}>${svg('chevR')}</button></div>
    <div class="bigtotal"><div class="lbl">SPENT ON DINNERS</div><div class="amt">${money(total, total % 1 !== 0)}<small>of ${money(lo)}–${money(hi)}</small></div>
      <div class="bar"><div class="fill ${total > hi ? 'over' : ''}" style="width:${pct(total)}%"></div><div class="band" style="left:${pct(lo)}%;width:${pct(hi) - pct(lo)}%"></div></div>
      <div class="barlbl"><span>$0</span><span>target ${money(lo)}–${money(hi)}</span></div>
      <p>${esc(msg)}</p>${pace ? `<p class="pace">${esc(pace)}</p>` : ''}</div>
    <div class="sec"><div class="sec-title">Cooked this month<button class="act" id="addOther">+ Add other</button><button class="act" id="scanB">Scan receipt</button></div>
      ${entries.length ? `<ul class="cooked">${entries.map((c) => `<li><div><div class="t">${esc(c.title)}</div><div class="d">${esc(shortDate(c.date))}${c.receipt ? '<span class="est">grocery receipt</span>' : c.estimate ? '<span class="est">estimate</span>' : '<span class="est">receipt</span>'}${c.by ? ' · ' + esc(c.by === 'Both' ? 'both' : c.by) : ''}</div></div><button class="a" data-e="${c.id}">${money(c.amount, true)}</button></li>`).join('')}</ul>` : '<div class="empty">No dinners logged yet.</div>'}
    </div>
    <div class="sec"><div class="sec-title">Us, so far</div>
      <div class="statgrid"><div class="s"><b>${all.length}</b><span>Meals cooked</span></div><div class="s"><b>${entries.length}</b><span>This month</span></div>
        <div class="s"><b>${all.length ? money(avg, true) : '—'}</b><span>Avg per dinner</span></div><div class="s"><b>${money(saved)}</b><span>Saved vs takeout</span></div>
        <div class="s"><b>${all.filter((c) => c.by === 'Corey' || c.by === 'Both').length} · ${all.filter((c) => c.by === 'Faith' || c.by === 'Both').length}</b><span>Corey · Faith cooked</span></div><div class="s"><b>${Object.values(state.picks).filter((p) => p.ok).length}<span style="color:var(--gold-soft)">/${Object.values(state.picks).length}</span></b><span>Tonight's picks 👍</span></div>
        <div class="s wide" style="grid-column:1/-1;background:var(--tile2)"><b>${esc(mostName)}${most ? ` <span style="color:var(--gold-soft)">×${most[1]}</span>` : ''}</b><span>Most made</span></div></div>
      <p class="small muted" style="margin-top:8px">“Saved vs takeout” compares each dinner with a ${money(takeoutCost)} takeout order for two (change it in Settings).</p>
    </div></div>`);
  $('#mPrev').onclick = () => { const [y, m] = key.split('-').map(Number); ui.budgetMonth = monthKey(new Date(y, m - 2, 1)); viewBudget(); };
  $('#mNext').onclick = () => { if (isNow) return; const [y, m] = key.split('-').map(Number); ui.budgetMonth = monthKey(new Date(y, m, 1)); viewBudget(); };
  $$('[data-e]').forEach((b) => (b.onclick = () => editEntry(state.cooked[b.dataset.e])));
  $('#addOther').onclick = () => editEntry(null);
  $('#scanB').onclick = openScan;
}
function editEntry(c) {
  const isNew = !c;
  c = c || { id: uid(), recipeId: 'other', title: '', date: todayISO(), amount: '', estimate: false };
  openSheet(`<h2>${isNew ? 'Add a dinner' : 'Edit amount'}</h2><p class="sub">${isNew ? 'Something not in the book? Log it here.' : esc(c.title)}</p>
    ${isNew ? `<div class="field"><label>What was it?</label><input id="eT" placeholder="e.g. Pizza night"></div>` : ''}
    <div class="field"><label>Amount (CAD)</label><input id="eA" type="number" inputmode="decimal" step="0.01" min="0" value="${esc(c.amount)}"></div>
    <div class="field"><label>Date</label><input id="eD" type="date" value="${esc(c.date)}"></div>
    <div class="foot" style="grid-template-columns:${isNew ? 'auto 1fr' : 'auto auto 1fr'}"><button class="btn" data-close>Cancel</button>${isNew ? '' : '<button class="btn danger" id="eDel">Delete</button>'}<button class="btn primary" id="eSave">Save</button></div>`, (b) => {
    $('#eSave', b).onclick = () => {
      const a = parseFloat($('#eA', b).value); if (!(a >= 0)) { toast('Enter an amount'); return; }
      const t = isNew ? $('#eT', b).value.trim() || 'Other dinner' : c.title;
      state.cooked[c.id] = { ...c, title: t, amount: Math.round(a * 100) / 100, estimate: false, date: $('#eD', b).value || c.date, at: now() };
      save(); closeSheet(); viewBudget();
    };
    $('#eDel', b) && ($('#eDel', b).onclick = () => { const bak = state.cooked[c.id]; delete state.cooked[c.id]; save(); closeSheet(); viewBudget(); toast('Entry deleted', 'Undo', () => { state.cooked[bak.id] = bak; save(); viewBudget(); }); });
  });
}

// ---------------------------------------------------------------- views: settings
function viewSettings() {
  setTop({ title: 'SETTINGS', back: '#/' });
  const st = state.settings;
  const hidden = Object.keys(state.hidden).map(summary).filter(Boolean);
  const custom = Object.values(state.custom);
  render(`<div class="wrap">
    <div class="kicker">Make it ours<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">Settings</h1>
    <div class="setgroup"><div class="sec-title">Appearance</div>
      <div class="segtext" id="themeSeg">${[['light', 'Light', 'cream paper'], ['dark', 'Dark', 'navy & plum'], ['auto', 'Auto', 'match iPhone']].map(([k, l, s]) => `<button data-t="${k}" class="${st.theme === k ? 'on' : ''}">${l}<small>${s}</small></button>`).join('')}</div>
      <label class="setrow"><span class="l"><b>Bigger text</b><span>Easier to read from across the counter</span></span><span class="switch"><input type="checkbox" id="bigT" ${st.bigText ? 'checked' : ''}><i></i></span></label>
      <label class="setrow"><span class="l"><b>Winter snowflakes</b><span>Gentle snow from November to February</span></span><span class="switch"><input type="checkbox" id="snowT" ${st.snow !== false ? 'checked' : ''}><i></i></span></label>
      <label class="setrow"><span class="l"><b>Anniversary hearts</b><span>A few hearts around your anniversary</span></span><span class="switch"><input type="checkbox" id="heartT" ${st.hearts !== false ? 'checked' : ''}><i></i></span></label>
      <label class="setrow"><span class="l"><b>Little taps</b><span>Tiny vibrations on buttons (Android only — iPhone doesn't allow it)</span></span><span class="switch"><input type="checkbox" id="hapT" ${st.haptics !== false ? 'checked' : ''}><i></i></span></label>
    </div>
    <div class="setgroup"><div class="sec-title">Measurements</div>
      <div class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Ingredient amounts</b></span></div>
      <div class="segtext" id="unitSeg">${[['both', 'Both', 'cups + grams'], ['us', 'Cups', 'spoons & cups'], ['metric', 'Grams', 'metric first']].map(([k, l, t]) => `<button data-u="${k}" class="${(st.units || 'both') === k ? 'on' : ''}">${l}<small>${t}</small></button>`).join('')}</div>
      <div class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Temperatures</b></span></div>
      <div class="segtext" id="tempSeg">${[['both', 'Both', '°C (°F)'], ['C', '°C', 'Celsius'], ['F', '°F', 'Fahrenheit']].map(([k, l, t]) => `<button data-tp="${k}" class="${(st.temp || 'both') === k ? 'on' : ''}">${l}<small>${t}</small></button>`).join('')}</div>
    </div>
    <div class="setgroup"><div class="sec-title">This phone</div>
      <div class="setrow"><span class="l"><b>Whose phone is this?</b><span>Used to note who cooked (and for sharing later)</span></span></div>
      <div class="segtext" style="grid-template-columns:1fr 1fr" id="meSeg">${['Corey', 'Faith'].map((n) => `<button data-me="${n}" class="${state.profile.me === n ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="setrow"><span class="l"><b>Our anniversary</b><span>For the ♥ Us page</span></span><input class="numin" id="anniv" type="date" style="width:auto" value="${esc(st.anniversary || '')}"></div>
    </div>
    <div class="setgroup"><div class="sec-title">Budget</div>
      <div class="setrow"><span class="l"><b>Monthly target</b><span>Dinner spending range</span></span><span style="display:flex;gap:6px;align-items:center"><input class="numin" id="bLo" type="number" inputmode="numeric" value="${st.budgetMin}"> – <input class="numin" id="bHi" type="number" inputmode="numeric" value="${st.budgetMax}"></span></div>
      <div class="setrow"><span class="l"><b>Takeout for two</b><span>For the “saved vs takeout” stat</span></span><input class="numin" id="tko" type="number" inputmode="numeric" value="${st.takeoutCost}"></div>
      <label class="setrow"><span class="l"><b>Restock staples</b><span>Marking something “Out” in the Pantry adds it to the grocery list</span></span><span class="switch"><input type="checkbox" id="rsT" ${st.autoRestock !== false ? 'checked' : ''}><i></i></span></label>
      ${Object.keys(state.prices).length ? `<div class="setrow"><span class="l"><b>Prices from receipts</b><span>${Object.keys(state.prices).length} remembered — used for cost estimates</span></span><button class="btn sm ghost" id="clrPrices">Forget</button></div>` : ''}
    </div>
    <div class="setgroup"><div class="sec-title">Our own recipes</div>
      ${custom.length ? custom.map((r) => `<div class="setrow"><span class="l"><b>${esc(r.title)}</b><span>${esc(catOf(r.category).name)} ${pad2(r.num)}</span></span><a class="btn sm ghost" href="#/r/${r.id}">Open</a></div>`).join('') : '<p class="small muted">Recipes you add yourself show up here and in the book.</p>'}
      <a class="btn ghost block" href="#/add" style="margin-top:10px">${svg('plus')}Add a recipe</a>
    </div>
    <div class="setgroup"><div class="sec-title">Hidden meals</div>
      ${hidden.length ? hidden.map((r) => `<div class="setrow"><span class="l"><b>${esc(r.title)}</b><span>${esc(recipeLabel(r))}</span></span><button class="btn sm ghost" data-unhide="${r.id}">Unhide</button></div>`).join('') : '<p class="small muted">Nothing hidden. Use “Hide meal” on a recipe to tuck it away.</p>'}
    </div>
    <div class="setgroup"><div class="sec-title">Backup</div>
      <p class="small muted">Everything is saved on this phone. Export a backup now and then (or to move to a new phone).${st.lastBackup ? ` Last backup: ${esc(new Date(st.lastBackup).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }))}.` : ''} A reminder shows on the home screen once a month.</p>
      <div class="btnrow" style="margin-top:10px"><button class="btn ghost" id="exp">${svg('share')}Export</button><label class="btn ghost" style="cursor:pointer">${svg('reset')}Restore<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
    </div>
    <div class="setgroup"><div class="sec-title">More</div>
      <div class="setrow"><span class="l"><b>What's new</b><span>The latest update, in one place</span></span><button class="btn sm ghost" id="showWN">Show</button></div>
      <div class="setrow"><span class="l"><b>Show the welcome screen</b></span><button class="btn sm ghost" id="showW">Show</button></div>
      <div class="setrow"><span class="l"><b>Reset everything</b><span>Favourites, pantry, list, budget, ticks — all of it</span></span><button class="btn sm danger" id="resetAll">Reset</button></div>
      <p class="small muted" style="margin-top:14px">Our Kitchen · Corey ♥ Faith · ${INDEX.recipes.length} recipes · works offline. Shared sync between our phones is planned for later.</p>
    </div></div>`);
  $$('#themeSeg button').forEach((b) => (b.onclick = () => { st.theme = b.dataset.t; save(); applyTheme(); viewSettings(); }));
  $('#bigT').onchange = (e) => { st.bigText = e.target.checked; save(); applyTheme(); };
  $('#snowT').onchange = (e) => { st.snow = e.target.checked; save(); applySeason(); };
  $('#heartT').onchange = (e) => { st.hearts = e.target.checked; save(); applySeason(); };
  $('#hapT').onchange = (e) => { st.haptics = e.target.checked; save(); buzz(15); };
  $('#rsT').onchange = (e) => { st.autoRestock = e.target.checked; save(); };
  $$('#unitSeg button').forEach((b) => (b.onclick = () => { st.units = b.dataset.u; save(); viewSettings(); }));
  $$('#tempSeg button').forEach((b) => (b.onclick = () => { st.temp = b.dataset.tp; save(); viewSettings(); }));
  $('#clrPrices') && ($('#clrPrices').onclick = () => withUndo('Receipt prices forgotten', () => { state.prices = {}; }, viewSettings));
  $('#showWN').onclick = openWhatsNew;
  $$('#meSeg button').forEach((b) => (b.onclick = () => { state.profile.me = b.dataset.me; save(); viewSettings(); }));
  const num = (id, k) => ($(id).onchange = (e) => { const v = parseFloat(e.target.value); if (v > 0) { st[k] = v; save(); toast('Saved'); } });
  $('#anniv').onchange = (e) => { st.anniversary = e.target.value; save(); applySeason(); toast('Saved ♥'); };
  num('#bLo', 'budgetMin'); num('#bHi', 'budgetMax'); num('#tko', 'takeoutCost');
  $$('[data-unhide]').forEach((b) => (b.onclick = () => { delete state.hidden[b.dataset.unhide]; save(); viewSettings(); toast('Back in the book'); }));
  $('#exp').onclick = exportBackup;
  $('#imp').onchange = (e) => importBackup(e.target.files[0]);
  $('#showW').onclick = showWelcome;
  $('#resetAll').onclick = () => confirmSheet('Reset everything?', 'This wipes favourites, pantry levels, the grocery list, the budget log and your own recipes on this phone. Export a backup first if you might want it back.', 'Reset everything', () => {
    const snap = JSON.stringify(state);
    const keepTheme = state.settings.theme; state = DEFAULT_STATE(); state.settings.theme = keepTheme; state.settings.welcomed = true; state.seenWhatsNew = WHATSNEW_ID; save(); applyTheme(); go('#/');
    setTimeout(() => toast('Fresh start', 'Undo', () => { state = JSON.parse(snap); save(); applyTheme(); router(); toast('Everything is back ♥'); }), 300);
  }, true);
}
function downloadFile(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportBackup() { state.settings.lastBackup = now(); state.settings.backupSnooze = null; save(); downloadFile(`our-kitchen-backup-${todayISO()}.json`, JSON.stringify({ app: 'our-kitchen', exportedAt: new Date().toISOString(), state }, null, 1)); }
function importBackup(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result); const s = data.state || data;
      if (!s || s.v !== 1 || typeof s.settings !== 'object') throw new Error('bad');
      confirmSheet('Restore this backup?', `From ${data.exportedAt ? new Date(data.exportedAt).toLocaleString('en-CA') : 'a backup file'}. It replaces what's on this phone now.`, 'Restore', () => {
        const d = DEFAULT_STATE(); const snap = JSON.stringify(state); state = { ...d, ...s, settings: { ...d.settings, ...s.settings }, profile: { ...d.profile, ...(s.profile || {}) } }; save(); applyTheme(); go('#/'); router(); toast('Backup restored ♥', 'Undo', () => { state = JSON.parse(snap); save(); applyTheme(); router(); });
      });
    } catch (e) { toast("That file doesn't look like an Our Kitchen backup"); }
  };
  rd.readAsText(file);
}

// ---------------------------------------------------------------- views: add your own recipe
const FRAC = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };
const UNITS = { cup: 'cup', cups: 'cup', c: 'cup', tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp', tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp', g: 'g', grams: 'g', kg: 'kg', ml: 'ml', l: 'L', lb: 'lb', lbs: 'lb', clove: 'clove', cloves: 'clove', can: 'can', cans: 'can', slice: 'slice', slices: 'slice' };
function parseQty(s) {
  s = s.trim(); let t = 0;
  for (const part of s.split(/\s+/)) {
    if (FRAC[part]) t += FRAC[part];
    else if (/^\d+\/\d+$/.test(part)) { const [a, b] = part.split('/').map(Number); t += a / b; }
    else if (/^\d+(?:[.,]\d+)?[½¼¾⅓⅔⅛]?$/.test(part)) { const m = part.match(/^(\d+(?:[.,]\d+)?)([½¼¾⅓⅔⅛]?)$/); t += parseFloat(m[1].replace(',', '.')) + (FRAC[m[2]] || 0); }
    else return null;
  }
  return t;
}
function parseIngredients(text) {
  const groups = []; let cur = { name: '', items: [] };
  text.split('\n').map((l) => l.trim()).filter(Boolean).forEach((line) => {
    if (/^#+\s*|:$/.test(line) && !/^\d/.test(line)) { if (cur.items.length || cur.name) groups.push(cur); cur = { name: line.replace(/^#+\s*|:$/g, ''), items: [] }; return; }
    const m = line.replace(/^[-•*]\s*/, '').match(/^((?:\d+(?:[.,]\d+)?[½¼¾⅓⅔⅛]?|\d+\/\d+|[½¼¾⅓⅔⅛])(?:\s+(?:\d+\/\d+|[½¼¾⅓⅔⅛]))?)\s*([a-zA-Z]+\.?)?\s+(.*)$/);
    let it;
    if (m) {
      const q = parseQty(m[1]); const u = m[2] && UNITS[m[2].toLowerCase().replace('.', '')];
      const name = u ? m[3] : ((m[2] || '') + ' ' + m[3]).trim();
      const [n, ...note] = name.split(',');
      it = { qty: q, unit: u || null, name: n.trim(), ...(note.length ? { note: note.join(',').trim() } : {}) };
    } else { const [n, ...note] = line.replace(/^[-•*]\s*/, '').split(','); it = { qty: null, unit: null, name: n.trim(), ...(note.length ? { note: note.join(',').trim() } : {}) }; }
    if (!/^water$/i.test(it.name)) { const pn = it.name.replace(/^(minced|chopped|diced|sliced|fresh|large|small|medium)\s+/i, ''); it.pantry = { name: pn.charAt(0).toUpperCase() + pn.slice(1), cat: guessCat(pn) }; }
    cur.items.push(it);
  });
  if (cur.items.length) groups.push(cur);
  return groups;
}
function parseSteps(text) {
  return text.split('\n').map((l) => l.trim().replace(/^\d+[.)]\s*/, '')).filter(Boolean).map((l) => {
    const m = l.match(/^([^.:]{3,40})[:.]\s+(.*)$/);
    return m ? { title: m[1], text: m[2] } : { title: l.split(' ').slice(0, 3).join(' '), text: l };
  });
}
async function viewAdd(editId) {
  const builtin = editId && !state.custom[editId] && INDEX.recipes.find((x) => x.id === editId) ? await getRecipe(editId) : null;
  const ed = editId ? state.custom[editId] || builtin : null;
  setTop({ title: ed ? 'EDIT RECIPE' : 'ADD A RECIPE', back: ed ? '#/r/' + editId : '#/' });
  const tags = (ed && ed.tags) || {};
  const ingText = ed ? ed.groups.map((g) => (g.name ? g.name + ':\n' : '') + g.items.map((it) => [it.qty != null ? fmtQty(it.qty, it.unit) : '', it.name + (it.note ? ', ' + it.note : '')].filter(Boolean).join(' ')).join('\n')).join('\n') : '';
  const stepText = ed ? ed.steps.map((s) => s.title + ': ' + s.text).join('\n') : '';
  const chipGroup = (g) => `<div class="field"><label>${g.label}</label><div class="chips">${g.opts.map((o) => `<button type="button" class="chip ${(tags[g.key] || []).includes(o[0]) ? 'on' : ''}" data-k="${g.key}" data-v="${o[0]}">${esc(o[1])}</button>`).join('')}</div></div>`;
  render(`<div class="wrap"><div class="kicker">Our own<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">${ed ? 'Edit recipe' : 'Add a recipe'}</h1>
    <p class="lead" style="margin-top:4px">${builtin ? 'Changes are saved on this phone. The version before your edit is kept, so you can switch back from the recipe page.' : ed ? 'The version before this edit is kept — switch back any time from the recipe page.' : 'It goes into the book with the next number in its category.'}</p>
    <div id="dislike"></div>
    <div class="field"><label>Name</label><input id="aT" value="${esc(ed ? ed.title : '')}" placeholder="e.g. Garlic Butter Steak Bites"></div>
    <div class="field"><label>Short description</label><input id="aS" value="${esc(ed ? ed.subtitle : '')}" placeholder="with cheesy mashed potatoes"></div>
    <div class="field" ${builtin ? 'hidden' : ''}><label>Category</label><select id="aC">${INDEX.categories.map((c) => `<option value="${c.slug}" ${ed && ed.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div class="grid3"><div class="field"><label>Prep min</label><input id="aP" type="number" inputmode="numeric" value="${ed ? ed.prep : 15}"></div><div class="field"><label>Cook min</label><input id="aK" type="number" inputmode="numeric" value="${ed ? ed.cook : 30}"></div><div class="field"><label>Servings</label><input id="aV" type="number" inputmode="numeric" value="${ed ? ed.servings : 4}"></div></div>
    <div class="field"><label>Estimated total cost ($)</label><input id="aM" type="number" inputmode="decimal" value="${ed ? ed.cost.total : ''}" placeholder="e.g. 22"></div>
    ${FILTERS.filter((g) => !['price', 'time'].includes(g.key)).map(chipGroup).join('')}
    <div class="field"><label>Ingredients — one per line</label><textarea id="aI" placeholder="Sauce:\n2 tbsp butter\n4 cloves garlic, minced\n1 cup cream">${esc(ingText)}</textarea></div>
    <div class="field"><label>Steps — one per line</label><textarea id="aSt" placeholder="Sear the steak: Pat dry, season, and…">${esc(stepText)}</textarea></div>
    <div class="field"><label>Tips / leftovers (optional)</label><input id="aL" value="${esc(ed ? ed.leftovers || '' : '')}"></div>
    <div class="btnrow" style="margin-top:16px">${ed ? '<button class="btn danger" id="aDel">Delete</button>' : '<a class="btn" href="#/">Cancel</a>'}<button class="btn primary" id="aSave">Save recipe</button></div>
  </div>`);
  const t = JSON.parse(JSON.stringify(tags));
  $$('.chip[data-k]').forEach((c) => (c.onclick = () => { const s = t[c.dataset.k] || (t[c.dataset.k] = []); const i = s.indexOf(c.dataset.v); i >= 0 ? s.splice(i, 1) : s.push(c.dataset.v); c.classList.toggle('on'); }));
  const check = () => {
    const all = ['#aT', '#aS', '#aI', '#aSt', '#aL'].map((s) => $(s).value).join(' ');
    const hits = bannedIn(all);
    $('#dislike').innerHTML = hits.length ? `<div class="warn"><b>Heads up:</b> this has ${hits.join(' & ')} — that's on the no-thanks list (mushrooms, mustard, olives). Leave it out or swap it?</div>` : '';
    return hits;
  };
  ['#aT', '#aS', '#aI', '#aSt', '#aL'].forEach((s) => $(s).addEventListener('input', check));
  if (builtin && $('#aDel')) $('#aDel').outerHTML = `<a class="btn" href="#/r/${editId}">Cancel</a>`;
  $('#aDel') && ($('#aDel').onclick = () => confirmSheet('Delete this recipe?', ed.title, 'Delete', () => { go('#/'); withUndo('Recipe deleted', () => { delete state.custom[editId]; }); }, true));
  $('#aSave').onclick = () => {
    const title = $('#aT').value.trim(); if (!title) { toast('Give it a name'); return; }
    const groups = parseIngredients($('#aI').value); const steps = parseSteps($('#aSt').value);
    if (!groups.length || !steps.length) { toast('Add at least one ingredient and one step'); return; }
    const doSave = () => {
      if (builtin) {
        const prev = state.edits[editId] || { base: true };
        const sameIng = $('#aI').value === ingText; const sameSteps = $('#aSt').value === stepText;
        const total = parseFloat($('#aM').value) || 0;
        state.edits[editId] = { title, subtitle: $('#aS').value.trim(), servings: +$('#aV').value || 4, prep: +$('#aP').value || 0, cook: +$('#aK').value || 0,
          servingsNote: (+$('#aV').value || 4) === builtin.servings ? builtin.servingsNote : (+$('#aV').value || 4) + ' servings',
          cost: { total, breakdown: total === builtin.cost.total ? builtin.cost.breakdown : [] }, tags: t,
          groups: sameIng ? builtin.groups : groups, steps: sameSteps ? builtin.steps : steps.map((st, i) => (builtin.steps[i] && builtin.steps[i].timer && !st.timer ? st : st)),
          leftovers: $('#aL').value.trim() || null, at: now() };
        if (!sameIng) state.edits[editId].steps = state.edits[editId].steps.map((st) => { const c = { ...st }; delete c.uses; return c; });
        state.versions[editId] = { prev, at: now() };
        save(); go('#/r/' + editId); toast('Recipe updated ♥ — the old version is kept');
        return;
      }
      if (ed) state.versions[ed.id] = { prev: JSON.parse(JSON.stringify(ed)), at: now() };
      const category = $('#aC').value;
      let num = ed && ed.category === category ? ed.num : Math.max(0, ...allRecipes().filter((r) => r.category === category).map((r) => r.num)) + 1;
      const id = ed && ed.category === category ? ed.id : `own-${category}-${pad2(num)}-${uid().slice(0, 4)}`;
      if (ed && id !== ed.id) delete state.custom[ed.id];
      state.custom[id] = { id, custom: true, category, num, title, subtitle: $('#aS').value.trim(), image: null,
        servings: +$('#aV').value || 4, servingsNote: (+$('#aV').value || 4) + ' servings', prep: +$('#aP').value || 0, cook: +$('#aK').value || 0,
        cost: { total: parseFloat($('#aM').value) || 0, breakdown: [] }, tags: t, badges: [], groups, steps,
        leftovers: $('#aL').value.trim() || null, at: now() };
      save(); go('#/r/' + id); toast('Saved to the book ♥');
    };
    const hits = check();
    if (hits.length) confirmSheet(`It has ${hits.join(' & ')}`, 'That one is on the no-thanks list. Save it anyway?', 'Save anyway', doSave); else doSave();
  };
}
function exportRecipeFile(r) {
  const { id, custom, category, num, at, ...file } = r;
  downloadFile(`${pad2(num)}-${slug(r.title)}.json`, JSON.stringify(file, null, 2));
  toast(`Put it in recipes/${category}/ and run tools/build_index.py`);
}

// ---------------------------------------------------------------- views: guide
function viewGuide() {
  setTop({ title: 'KITCHEN GUIDE', back: '#/' });
  const temps = [['Chicken & turkey (any cut)', '74°C', '165°F'], ['Ground beef, pork, sausage', '71°C', '160°F'], ['Ground chicken / turkey', '74°C', '165°F'], ['Pork chops & roasts', '71°C', '160°F'], ['Steak — medium-rare', '63°C', '145°F'], ['Steak — medium', '71°C', '160°F'], ['Fish & seafood', '70°C', '158°F'], ['Reheated leftovers', '74°C', '165°F']];
  render(`<div class="wrap"><div class="kicker">Kitchen basics<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Guide</h1>
    <div class="sec"><div class="sec-title">Safe internal temps</div><div class="card" style="padding:4px 14px">${temps.map(([a, c, f]) => `<div class="setrow"><span class="l"><b style="font-weight:500">${a}</b></span><span><b class="amt">${c}</b> <span class="muted small">${f}</span></span></div>`).join('')}</div>
      <p class="small muted" style="margin-top:6px">Health Canada guidelines. Measure in the thickest part, away from bone.</p></div>
    <div class="sec"><div class="sec-title">Thawing</div><div class="card"><ul style="list-style:none;display:flex;flex-direction:column;gap:8px;font-size:.95rem;line-height:1.35">
      <li><b>Fridge (best):</b> about 24 h per 1–2 kg. Chicken pieces usually thaw overnight.</li>
      <li><b>Cold water (faster):</b> sealed bag in cold water, change it every 30 min — about 1 h per 500 g.</li>
      <li><b>Microwave:</b> defrost setting, then cook right away.</li>
      <li><b>Never</b> on the counter.</li></ul></div></div>
    <div class="sec"><div class="sec-title">Leftovers</div><div class="card"><p style="font-size:.95rem;line-height:1.35">Fridge within 2 hours, eat within 3–4 days. Freeze in flat bags for up to 2–3 months. Reheat until steaming hot (74°C).</p></div></div>
    <div class="sec money"><div class="top"><span>THE $350 MONTH</span><span>~13 dinners</span></div><p>About 3 dinners a week at ~$27–30 average. Mix <strong>$</strong> (under $20), <strong>$$</strong> ($20–30) and the odd <strong>$$$</strong> (over $30) date night.</p></div>
  </div>`);
}

// ---------------------------------------------------------------- views: us (anniversary)
function viewUs() {
  setTop({ title: 'US', back: '#/' });
  const a = state.settings.anniversary;
  let together = '';
  if (a) {
    const [y, m, d] = a.split('-').map(Number); const start = new Date(y, m - 1, d); const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.floor((today - start) / 864e5);
    let next = new Date(today.getFullYear(), m - 1, d); if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
    const to = Math.round((next - today) / 864e5); const yrs = next.getFullYear() - y;
    together = `<div class="bigtotal"><div class="lbl">TOGETHER</div><div class="amt">${days.toLocaleString('en-CA')}<small>days</small></div>
      <p>${to === 0 ? `Happy ${yrs}-year anniversary! ♥ Make it a Date Night.` : `${to} day${to === 1 ? '' : 's'} until your ${yrs}-year anniversary.`}</p></div>`;
  } else together = `<div class="card"><p>Add your anniversary in <a href="#/settings" class="linkbtn">Settings</a> and this page will count the days together.</p></div>`;
  const all = realDinners();
  const favs = Object.keys(state.favourites).map(summary).filter(Boolean);
  const photos = Object.entries(state.photos).flatMap(([rid, ps]) => ps.map((p) => ({ ...p, rid }))).sort((x, y) => (x.date < y.date ? 1 : -1));
  const rated = Object.entries(state.ratings).filter(([, v]) => v).map(([rid, v]) => ({ r: summary(rid), v })).filter((x) => x.r).sort((x, y) => y.v - x.v);
  render(`<div class="wrap"><div class="kicker">Corey ♥ Faith<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Us</h1>
    <div class="sec">${together}</div>
    <div class="sec"><div class="statgrid"><div class="s"><b>${all.length}</b><span>Dinners together</span></div><div class="s"><b>${favs.length}</b><span>Favourites</span></div>
      <div class="s"><b>${photos.length}</b><span>Photo memories</span></div><div class="s"><b>${Object.values(state.picks).filter((p) => p.ok).length}</b><span>Picks we said yes to</span></div></div></div>
    <a class="nudge" href="#/story" style="margin-top:16px"><span>${svg('book')}</span><span style="flex:1"><b>Our story</b> — every dinner we've made, with photos, dates and monthly recaps.</span><span>${svg('chevR')}</span></a>
    <div class="sec"><div class="sec-title">Milestones</div><div class="miles">${MILESTONES.map(([k, label]) => `<div class="mile ${state.milestones[k] ? 'on' : ''}"><span>${state.milestones[k] ? '♥' : '·'}</span><b>${esc(label)}</b>${state.milestones[k] ? `<small>${esc(shortDate(state.milestones[k]))}</small>` : ''}</div>`).join('')}</div></div>
    <div class="sec"><div class="sec-title">Our favourites</div>${favs.length ? `<div class="hrow">${favs.map(miniCard).join('')}</div>` : '<div class="empty">Heart a recipe and it shows up here.</div>'}</div>
    ${rated.length ? `<div class="sec"><div class="sec-title">Top rated</div><ul class="cooked">${rated.map((x) => `<li><div><a class="t" href="#/r/${x.r.id}">${esc(x.r.title)}</a></div><span class="amt" style="color:var(--gold)">${'♥'.repeat(x.v)}</span></li>`).join('')}</ul></div>` : ''}
    <div class="sec"><div class="sec-title">Photo memories</div>${photos.length ? `<div class="photos">${photos.map((p) => `<a class="ph" href="#/r/${p.rid}"><img src="${p.data}" alt=""><span>${esc(shortDate(p.date))}</span></a>`).join('')}</div>` : '<div class="empty">Add a photo from any recipe page after you cook it.</div>'}</div>
  </div>`);
}

// ================================================================ update 2 (Nov 2026)
const WHATSNEW_ID = 'u2-2026-11';
ICON.mic = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>';
ICON.speaker = '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>';
ICON.candle = '<path d="M9 10h6v11H9zM12 10V7.5"/><path d="M12 2.8c1.3 1.5 1.6 2.6.8 3.8-.4.5-1.2.5-1.6 0-.8-1.2-.5-2.3.8-3.8z"/>';
ICON.print = '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M7 14h10v7H7z"/>';
ICON.swap = '<path d="M7 7h12l-3-3M17 17H5l3 3"/>';
ICON.clock = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
ICON.users = '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.8 14.6c2.3.1 4 1.5 4.6 4"/>';
ICON.camera = '<path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.6"/>';
ICON.snow = '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>';
ICON.book = '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>';
ICON.star = '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>';

// ---------------------------------------------------------------- small helpers
const DAYS = (n) => n * 864e5;
const isoPlus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
function buzz(p = 8) { if (state.settings.haptics === false) return; try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn,.chip,.checklist li,.seg button,.segtext button,.iconbtn,#tabbar a,.rate button,.mood button')) buzz(); }, true);
function withUndo(msg, fn, after) {
  const snap = JSON.stringify(state);
  fn(); save(); if (after) after();
  toast(msg, 'Undo', () => { state = JSON.parse(snap); save(); applyTheme(); router(); toast('Undone'); });
}
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const other = (n) => (n === 'Corey' ? 'Faith' : 'Corey');
const thumb = (src) => (src && /^assets\/img\/(?!cover).+\.webp$/.test(src) ? src.replace(/\.webp$/, '-sm.webp') : src);

// °C / °F display
function tempText(s) {
  const t = state.settings.temp;
  if (s == null) return '';
  s = String(s);
  if (!t || t === 'both') return s;
  const pick = (c, f) => (t === 'C' ? c + '°C' : f + '°F');
  return s
    .replace(/(-?\d+)\s*°C\s*\((-?\d+)\s*°F\)/g, (m, c, f) => pick(c, f))
    .replace(/(-?\d+)\s*°F\s*\((-?\d+)\s*°C\)/g, (m, f, c) => pick(c, f))
    .replace(/(-?\d+)\s*°C\s*\/\s*(-?\d+)\s*°F/g, (m, c, f) => pick(c, f));
}
const tx = (s) => esc(tempText(s));

// amount text for an ingredient (respects the cups/grams toggle)
function amtText(it, f) {
  if (it.qty == null) return '';
  const u = state.settings.units;
  if (u === 'metric' && it.metric) return fmtQty(it.metric.qty * f, it.metric.unit);
  return fmtQty(it.qty * f, it.unit);
}
// "uses" line for a step: ["0-1", "2-0=1 tbsp"]
function stepUses(r, st, f) {
  if (!st.uses || !st.uses.length) return [];
  return st.uses.map((ref) => {
    const [ij, part] = ref.split('=');
    const [gi, ii] = ij.split('-').map(Number);
    const it = r.groups[gi] && r.groups[gi].items[ii];
    if (!it) return null;
    if (part) {
      const m = part.trim().match(/^([\d.\/½¼¾⅓⅔⅛ ]+)\s*([a-zA-Z]+)?/);
      const q = m ? parseQty(m[1]) : null;
      const unit = m && m[2] ? (UNITS[m[2].toLowerCase()] || m[2]) : it.unit;
      if (q != null) {
        if (state.settings.units === 'metric' && it.metric && unit === it.unit && it.qty) return fmtQty(it.metric.qty * (q / it.qty) * f, it.metric.unit) + ' ' + it.name;
        return fmtQty(q * f, unit) + ' ' + it.name;
      }
      return part + ' ' + it.name;
    }
    const a = amtText(it, f);
    return (a ? a + ' ' : '') + it.name;
  }).filter(Boolean);
}
const usesHTML = (list) => (list.length ? `<span class="uses">${list.map((u) => `<i>${esc(u)}</i>`).join('')}</span>` : '');

// ---------------------------------------------------------------- substitutes (#22)
const SUBS = {
  butter: 'Same amount of salted or unsalted margarine. For searing you can use ¾ as much oil — but keep butter for sauces and mash.',
  '35-whipping-cream': 'Half-and-half (10%) with 1 tbsp flour whisked in per cup, or evaporated milk. Keep it at a gentle simmer.',
  'half-and-half-10': 'Half whole milk + half 35% cream, or whole milk with 1 tbsp melted butter per cup.',
  milk: '2% or whole both work. For a richer sauce use half milk, half cream.',
  'evaporated-milk': 'Same amount of half-and-half or whole milk.',
  'cheddar-shredded': 'Marble, Colby or Monterey Jack. Shred it from a block for the smoothest melt.',
  'mozzarella-shredded': 'Provolone, Monterey Jack, or a pizza-cheese blend.',
  'parmesan-grated': 'Grana Padano or Romano (Romano is saltier — go easy on the salt).',
  'sour-cream': 'Plain Greek yogurt — stir it in off the heat.',
  'chicken-broth': 'Bouillon cube or powder + water (1 cube per 2 cups), or vegetable broth. Low-sodium lets you control salt.',
  'chicken-breasts-boneless': 'Boneless thighs — juicier; cook to 74°C (165°F), usually 2–3 min longer.',
  'chicken-thighs-boneless': 'Chicken breast cut into chunks — cook a minute or two less so it stays juicy.',
  'ground-beef-lean': 'Ground turkey or chicken — add 1 tbsp oil and an extra pinch of salt; cook to 74°C (165°F).',
  'sirloin-steak': 'Strip loin, ribeye, or "fast-fry" sirloin steaks cut into cubes.',
  'salmon-fillets': 'Steelhead trout or arctic char — same timing.',
  'russet-potatoes': 'Yukon Gold — creamier and holds its shape a little more.',
  'yukon-gold-potatoes': 'Russets — fluffier; add an extra knob of butter.',
  'baby-potatoes': 'Yukon or red potatoes cut into 2–3 cm chunks.',
  'jasmine-rice': 'Basmati or long-grain white rice (same water).',
  'all-purpose-flour': 'For thickening: cornstarch — half as much, mixed with a little cold water, stirred in at the end.',
  cornstarch: 'All-purpose flour — use twice as much.',
  'panko-breadcrumbs': 'Regular dry breadcrumbs, or crushed cornflakes or Ritz crackers.',
  honey: 'Maple syrup or brown sugar, same amount.',
  'soy-sauce': 'Low-sodium soy sauce or tamari.',
  'oyster-sauce': 'Hoisin (a bit sweeter), or an extra ½ tbsp soy sauce + a pinch of sugar.',
  'apple-cider-vinegar': 'Rice vinegar, white vinegar, or lemon juice.',
  'lemon-juice': 'Lime juice or a splash of apple cider vinegar.',
  garlic: 'Jarred minced garlic (½ tsp per clove) or ⅛ tsp garlic powder per clove.',
  'garlic-powder': '1 small clove of fresh garlic, minced, per ¼ tsp.',
  'onion-powder': '2 tbsp finely minced onion per ½ tsp, cooked with the other onions.',
  'yellow-onions': 'Sweet onion, or 1 tsp onion powder per small onion (flavour without the texture).',
  broccoli: 'Frozen broccoli florets (add 2–3 minutes) or green beans.',
  'green-beans': 'Frozen green beans or broccoli.',
  carrots: 'Pre-shredded carrots from the bag.',
  fettuccine: 'Linguine, penne or spaghetti.',
  spaghetti: 'Linguine, or penne. Angel hair cooks faster.',
  'elbow-macaroni': 'Cavatappi, small shells or penne.',
  'marinara-sauce': 'Crushed tomatoes + ½ tsp Italian seasoning, ½ tsp garlic powder, a pinch of sugar and salt.',
  bacon: 'Turkey bacon or diced ham.',
  'hard-taco-shells': 'Small soft flour tortillas, warmed in a dry pan.',
  'flour-tortillas-small': 'Hard taco shells.',
  'italian-seasoning-dried': '¼ tsp each dried oregano and dried basil per ½ tsp.',
  'dried-thyme': 'Italian seasoning, same amount.',
  'dried-oregano': 'Italian seasoning, same amount.',
  paprika: 'Keep it sweet paprika (not smoked or hot) — or simply leave it out.',
  'chili-powder-mild': 'For even milder tacos: 1 tsp cumin + 1 tsp sweet paprika per tbsp.',
  'ground-cumin': 'Leave it out and add ½ tsp extra mild chili powder.',
  'ground-nutmeg': 'Leave it out — it is just a whisper of warmth.',
  'sesame-oil': 'Leave it out, or a little melted butter (different, still tasty).',
  'canola-vegetable-oil': 'Any neutral oil — sunflower, avocado or light olive oil.',
  'olive-oil': 'Canola or vegetable oil.',
  'frozen-peas-and-carrots': 'Any frozen mixed vegetables, or diced fresh carrot + peas.',
  eggs: 'For breading: thin mayo with a splash of milk. In fried rice you can leave them out.',
  'tomato-paste': '2 tbsp ketchup per 1 tbsp paste.',
  'iceberg-lettuce': 'Romaine or shredded cabbage.',
  tomatoes: 'Halved cherry tomatoes.',
  'salsa-mild': 'Diced tomatoes with a pinch of salt and garlic powder.',
  'crusty-bread': 'Garlic toast or soft buns.',
};

// ---------------------------------------------------------------- price memory (#26)
let PRICES = {};
async function loadPrices() { try { PRICES = (await (await fetch('recipes/prices.json')).json()).prices || {}; } catch (e) { PRICES = {}; } }
function priceOf(key) {
  const m = state.prices[key];
  if (m && m.price > 0) return { price: m.price, mine: true, at: m.at };
  const d = PRICES[key];
  return d ? { price: d.price, pack: d.pack } : null;
}
function adjustedCost(r) {
  const lines = (r.cost && r.cost.breakdown) || [];
  let delta = 0; let mine = 0;
  const out = lines.map(([n, v, key]) => {
    if (key && state.prices[key] && PRICES[key] && PRICES[key].price) {
      const k = state.prices[key].price / PRICES[key].price;
      const nv = Math.round(v * k * 100) / 100; delta += nv - v; mine++;
      return [n, nv, key, true];
    }
    return [n, v, key, false];
  });
  return { lines: out, total: Math.max(0, (r.cost ? r.cost.total : 0) + delta), mine };
}

// ---------------------------------------------------------------- grocery amounts (#7)
const VOL = { tsp: 1, tbsp: 3, cup: 48 }; const WT = { g: 1, kg: 1000, lb: 453.6 }; const LIQ = { ml: 1, L: 1000 };
function sumAmounts(amts) {
  if (!amts || !amts.length) return '';
  let vol = 0, wt = 0, liq = 0, wtLb = true; const rest = {};
  amts.forEach((a) => {
    if (a.q == null) return;
    if (VOL[a.u]) vol += a.q * VOL[a.u];
    else if (WT[a.u]) { wt += a.q * WT[a.u]; if (a.u !== 'lb') wtLb = false; }
    else if (LIQ[a.u]) liq += a.q * LIQ[a.u];
    else { const u = a.u || ''; rest[u] = (rest[u] || 0) + a.q; }
  });
  const parts = [];
  if (wt) parts.push(wtLb ? fmtQty(wt / 453.6, 'lb') : wt >= 1000 ? fmtQty(wt / 1000, 'kg') : fmtQty(wt, 'g'));
  if (vol) parts.push(vol >= 12 ? fmtQty(vol / 48, 'cup') : vol >= 3 ? fmtQty(vol / 3, 'tbsp') : fmtQty(vol, 'tsp'));
  if (liq) parts.push(liq >= 1000 ? fmtQty(liq / 1000, 'L') : fmtQty(liq, 'ml'));
  Object.entries(rest).forEach(([u, q]) => parts.push(fmtQty(q, u || null)));
  return parts.join(' + ');
}
function tripEstimate() {
  const left = Object.values(state.grocery).filter((g) => !g.checked);
  let total = 0, priced = 0;
  left.forEach((g) => { const p = priceOf(g.key); if (p) { total += p.price; priced++; } });
  return { total, priced, n: left.length };
}

// ---------------------------------------------------------------- weather (#13)
const WX_KEY = 'ourkitchen.weather';
let WX = null;
try { WX = JSON.parse(localStorage.getItem(WX_KEY)); } catch (e) { WX = null; }
function wxWords(code) {
  if (code == null) return '';
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code <= 48) return 'foggy';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'showers';
  if (code <= 86) return 'snow showers';
  return 'stormy';
}
async function loadWeather() {
  if (WX && now() - WX.at < 36e5) return;
  if (navigator.onLine === false) return;
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 5000);
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.98&longitude=-81.25&current=temperature_2m,weather_code&timezone=America%2FToronto', { signal: ctl.signal, cache: 'no-store' });
    clearTimeout(tm);
    if (!res.ok) return;
    const j = await res.json();
    if (!j.current) return;
    WX = { at: now(), t: Math.round(j.current.temperature_2m), code: j.current.weather_code };
    localStorage.setItem(WX_KEY, JSON.stringify(WX));
    if ((location.hash || '#/') === '#/' && !$('#wxLine') && $('#sheetWrap').hidden) { const y = scrollY; viewHome(); scrollTo(0, y); }
  } catch (e) { /* offline or blocked: skip silently */ }
}
function wxFresh() { return WX && now() - WX.at < 6 * 36e5 ? WX : null; }
function wxTemp(t) { return state.settings.temp === 'F' ? Math.round(t * 9 / 5 + 32) + '°F' : t + '°C'; }
function wxMood(w) {
  const words = wxWords(w.code);
  if (w.t <= 5 || /snow|rain|drizzle|showers|storm/.test(words)) return { kind: 'cozy', line: w.t <= 0 ? 'soup weather' : 'cozy-dinner weather' };
  if (w.t >= 22) return { kind: 'quick', line: 'too warm for the oven — keep it quick' };
  return { kind: 'any', line: 'a good night for a favourite' };
}
function weatherPicks(recipes) {
  const w = wxFresh(); if (!w) return [];
  const m = wxMood(w);
  if (m.kind === 'cozy') return moodPicks(recipes, 'cozy');
  if (m.kind === 'quick') return moodPicks(recipes, 'quick');
  const favs = recipes.filter((r) => state.favourites[r.id]);
  return (favs.length ? favs : recipes).slice(0, 3);
}

// ---------------------------------------------------------------- picks (#10, #11, #12, #31)
function dayShuffle(list, salt = 0) {
  const seed = Math.floor(now() / 864e5) + salt;
  return list.map((r, i) => ({ r, k: Math.sin(seed * 9301 + i * 49297) })).sort((a, b) => a.k - b.k).map((x) => x.r);
}
function moodPicks(recipes, mood) {
  const T = (r, k, v) => ((r.tags || {})[k] || []).includes(v);
  let pool;
  if (mood === 'cozy') pool = recipes.filter((r) => r.category === 'comfort-soups' || T(r, 'occasion', 'comfort-night') || T(r, 'base', 'pasta') || T(r, 'base', 'potatoes'));
  else if (mood === 'quick') pool = recipes.slice().sort((a, b) => a.total - b.total);
  else if (mood === 'fancy') pool = recipes.filter((r) => T(r, 'occasion', 'date-night') || r.price === '$$$');
  else pool = recipes.slice().sort((a, b) => a.cost - b.cost);
  if (!pool.length) pool = recipes.slice();
  if (mood === 'quick' || mood === 'cheap') return pool.slice(0, 3);
  return dayShuffle(pool, mood.length).slice(0, 3);
}
function useByDays(p) { return p && p.useBy ? -daysSince(p.useBy) : null; }
function useItUp(recipes) {
  const soon = Object.entries(state.pantry).filter(([, p]) => { const d = useByDays(p); return d != null && d >= 0 && d <= 3; }).map(([k, p]) => ({ k, p, d: useByDays(p) })).sort((a, b) => a.d - b.d);
  const low = Object.entries(state.pantry).filter(([, p]) => p.level === 'low').map(([k, p]) => ({ k, p, d: null }));
  const items = soon.concat(low.filter((l) => !soon.find((s) => s.k === l.k)));
  if (!items.length) return { items: [], picks: [], soon };
  const keys = new Set(items.map((x) => x.k));
  const soonKeys = new Set(soon.map((x) => x.k));
  const picks = recipes.map((r) => ({ r, uses: r.pantry.filter((p) => keys.has(pantryKey(p.name))).map((p) => p.name), soonN: r.pantry.filter((p) => soonKeys.has(pantryKey(p.name))).length }))
    .filter((x) => x.uses.length).sort((a, b) => b.soonN - a.soonN || b.uses.length - a.uses.length).slice(0, 3);
  return { items, picks, soon };
}
function longTimeFavs(recipes) {
  return recipes.filter((r) => state.favourites[r.id]).map((r) => { const c = cookedEntries(r.id); return { r, days: c.length ? daysSince(c[0].date) : null }; })
    .filter((x) => x.days == null || x.days >= 14).sort((a, b) => (b.days == null ? 9999 : b.days) - (a.days == null ? 9999 : a.days));
}
function whoseTurn() {
  if (state.turn === 'Corey' || state.turn === 'Faith') return state.turn;
  return state.profile.me || 'Corey';
}
function pickCards(list) { return list.length ? `<div class="rlist">${list.map(rcard).join('')}</div>` : '<div class="empty">Nothing to suggest yet.</div>'; }
const withTag = (html, tag) => html.replace(/<\/a>$/, `<span class="usetag">${esc(tag)}</span></a>`);
function openIdeas(tab) {
  const recipes = visibleRecipes();
  let cur = tab || 'mood'; let mood = ui.mood || 'cozy';
  const draw = (b) => {
    const w = wxFresh(); const u = useItUp(recipes); const lt = longTimeFavs(recipes);
    const tabs = [['mood', 'Mood'], ['use', 'Use it up'], ['while', 'A while'], ...(w ? [['wx', 'Weather']] : []), ['wish', 'Wish list']];
    let body = '';
    if (cur === 'mood') body = `<div class="mood">${[['cozy', 'Cozy'], ['quick', 'Quick'], ['fancy', 'Fancy'], ['cheap', 'Cheap']].map(([k, l]) => `<button data-mood="${k}" class="${mood === k ? 'on' : ''}">${l}</button>`).join('')}</div>${pickCards(moodPicks(recipes, mood))}`;
    else if (cur === 'use') body = u.items.length ? `<p class="sub">${esc(u.items.slice(0, 5).map((x) => x.p.name + (x.d != null ? (x.d === 0 ? ' (today)' : ` (${x.d} day${x.d === 1 ? '' : 's'})`) : ' (low)')).join(' · '))}</p>${u.picks.length ? `<div class="rlist">${u.picks.map((x) => withTag(rcard(x.r), 'uses ' + x.uses.slice(0, 2).join(', '))).join('')}</div>` : '<div class="empty">None of our recipes use those — maybe a wish-list idea?</div>'}`
      : '<div class="empty">Add use-by dates in the Pantry (tap an item\'s name) or mark things “Low”, and this suggests meals that use them up.</div>';
    else if (cur === 'while') body = lt.length ? `<div class="rlist">${lt.slice(0, 5).map((x) => withTag(rcard(x.r), x.days == null ? 'not cooked yet' : x.days + ' days ago')).join('')}</div>` : '<div class="empty">Favourites you haven\'t made in two weeks or more show up here.</div>';
    else if (cur === 'wx' && w) body = `<p class="sub">London, ON · ${wxTemp(w.t)} · ${esc(wxWords(w.code))} — ${esc(wxMood(w).line)}.</p>${pickCards(weatherPicks(recipes))}`;
    else if (cur === 'wish') body = wishHTML();
    b.innerHTML = `<h2>Ideas</h2><div class="chips tabs">${tabs.map(([k, l]) => `<button class="chip ${cur === k ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><div class="ideas">${body}</div>
      <div class="foot"><button class="btn" data-close>Close</button></div>`;
    $$('[data-tab]', b).forEach((c) => (c.onclick = () => { cur = c.dataset.tab; draw(b); }));
    $$('[data-mood]', b).forEach((c) => (c.onclick = () => { mood = ui.mood = c.dataset.mood; draw(b); }));
    if (cur === 'wish') bindWish(b, () => draw(b));
  };
  openSheet('', draw);
}

// ---------------------------------------------------------------- wish list (#48)
function wishHTML() {
  const list = Object.values(state.wish).sort((a, b) => b.at - a.at);
  return `<div class="addrow" style="margin-top:4px"><input id="wNew" placeholder="e.g. Butter chicken, lasagna…" enterkeyhint="done"><button class="btn primary" id="wAdd" aria-label="Add">${svg('plus')}</button></div>
    ${list.length ? `<ul class="cooked">${list.map((w) => `<li><div><div class="t">${esc(w.text)}</div><div class="d">${w.by ? esc(w.by) + ' · ' : ''}${esc(shortDate(w.date))}</div></div><button class="del" data-wdel="${w.id}" aria-label="Remove">×</button></li>`).join('')}</ul>` : '<div class="empty">Meals we want in the book later — they can become real recipes in the next batch.</div>'}`;
}
function bindWish(root, redraw) {
  const add = () => { const v = $('#wNew', root).value.trim(); if (!v) return; const id = uid(); state.wish[id] = { id, text: v, by: state.profile.me, date: todayISO(), at: now() }; save(); redraw(); toast('Added to the wish list ♥'); };
  $('#wAdd', root).onclick = add; $('#wNew', root).onkeydown = (e) => { if (e.key === 'Enter') add(); };
  $$('[data-wdel]', root).forEach((b) => (b.onclick = () => withUndo('Removed from the wish list', () => { delete state.wish[b.dataset.wdel]; }, redraw)));
}
function viewWish() {
  setTop({ title: 'WISH LIST', back: '#/' });
  render(`<div class="wrap"><div class="kicker">Someday soon<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Wish list</h1>
    <p class="lead" style="margin-top:4px">Meals we want to add to the book.</p><div class="sec" id="wishBox">${wishHTML()}</div></div>`);
  bindWish($('#wishBox'), viewWish);
}

// ---------------------------------------------------------------- freezer (#37)
function viewFreezer() {
  setTop({ title: 'FREEZER', back: '#/pantry' });
  const list = Object.values(state.freezer).sort((a, b) => (a.date < b.date ? -1 : 1));
  const lefts = Object.values(state.leftovers);
  render(`<div class="wrap"><div class="kicker">Cold storage<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Freezer</h1>
    <p class="lead" style="margin-top:4px">What's frozen and how long it's been in there.</p>
    <div class="sec"><div class="addrow fz"><input id="fzNew" placeholder="e.g. Taco beef, chicken breasts…" enterkeyhint="done"><input id="fzN" class="numin" type="number" inputmode="numeric" min="1" value="2" aria-label="Portions"><button class="btn primary" id="fzAdd" aria-label="Add">${svg('plus')}</button></div>
      <p class="small muted" style="margin-top:6px">Name · portions</p></div>
    ${list.length ? `<ul class="cooked" style="margin-top:12px">${list.map((x) => { const d = daysSince(x.date); const warn = d > 90; return `<li><div><div class="t">${esc(x.name)}</div><div class="d">${x.portions} portion${x.portions === 1 ? '' : 's'} · frozen ${esc(shortDate(x.date))}${warn ? ' · <b style="color:var(--gold-deep)">over 3 months — use soon</b>' : ''}</div></div><span style="display:flex;gap:6px;align-items:center"><button class="btn sm ghost" data-fzuse="${x.id}">Used one</button><button class="del" data-fzdel="${x.id}" aria-label="Remove">×</button></span></li>`; }).join('')}</ul>` : '<div class="empty" style="margin-top:12px">Nothing in the freezer list yet. Soups, taco beef and breaded cutlets freeze well for 2–3 months.</div>'}
    ${lefts.length ? `<div class="sec"><div class="sec-title">Move from the fridge</div><ul class="cooked">${lefts.map((l) => `<li><div><div class="t">${esc(l.title)}</div><div class="d">${l.portions} portion${l.portions === 1 ? '' : 's'} in the fridge</div></div><button class="btn sm ghost" data-fzmove="${l.id}">${svg('snow')}Freeze</button></li>`).join('')}</ul></div>` : ''}
  </div>`);
  const add = () => { const v = $('#fzNew').value.trim(); if (!v) return; const id = uid(); state.freezer[id] = { id, name: v, portions: Math.max(1, parseInt($('#fzN').value, 10) || 1), date: todayISO(), at: now() }; save(); viewFreezer(); toast('Added to the freezer'); };
  $('#fzAdd').onclick = add; $('#fzNew').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  $$('[data-fzuse]').forEach((b) => (b.onclick = () => withUndo('Enjoy ♥', () => { const x = state.freezer[b.dataset.fzuse]; x.portions--; if (x.portions <= 0) delete state.freezer[x.id]; }, viewFreezer)));
  $$('[data-fzdel]').forEach((b) => (b.onclick = () => withUndo('Removed from the freezer', () => { delete state.freezer[b.dataset.fzdel]; }, viewFreezer)));
  $$('[data-fzmove]').forEach((b) => (b.onclick = () => withUndo('Moved to the freezer', () => { const l = state.leftovers[b.dataset.fzmove]; const id = uid(); state.freezer[id] = { id, name: l.title, recipeId: l.recipeId, portions: l.portions, date: todayISO(), at: now() }; delete state.leftovers[l.id]; }, viewFreezer)));
}

// ---------------------------------------------------------------- pantry item sheet (#36)
function openPantryItem(x) {
  const p = state.pantry[x.key] || {};
  openSheet(`<h2>${esc(x.name)}</h2><p class="sub">${esc(PCAT[x.cat] || 'Other')}${p.level ? ' · ' + esc((LEVELS.find((l) => l[0] === p.level) || [])[2] || '') : ''}</p>
    <div class="field"><label>Use by</label><input id="ubD" type="date" value="${esc(p.useBy || '')}"></div>
    <div class="chips" style="margin-top:8px">${[[2, 'In 2 days'], [4, '4 days'], [7, '1 week'], [14, '2 weeks']].map(([n, l]) => `<button class="chip" data-ub="${n}">${l}</button>`).join('')}</div>
    ${SUBS[x.key] ? `<div class="card subcard" style="margin-top:14px"><h3>SWAP IDEA</h3><p>${tx(SUBS[x.key])}</p></div>` : ''}
    <div class="foot" style="grid-template-columns:auto auto 1fr"><button class="btn" id="ubClear">Clear</button><button class="btn" id="ubFreeze">${svg('snow')}Freezer</button><button class="btn primary" id="ubSave">Save</button></div>
    ${!x.recipes.length ? '<button class="btn danger block" id="pDel" style="margin-top:10px">Remove from pantry</button>' : ''}`, (b) => {
    $$('[data-ub]', b).forEach((c) => (c.onclick = () => { $('#ubD', b).value = isoPlus(+c.dataset.ub); }));
    const set = (v) => { const cur = state.pantry[x.key] || { name: x.name, cat: x.cat, level: null }; if (v) state.pantry[x.key] = { ...cur, useBy: v, at: now() }; else { const c2 = { ...cur }; delete c2.useBy; state.pantry[x.key] = c2; } save(); closeSheet(); const y = scrollY; viewPantry(); scrollTo(0, y); };
    $('#ubSave', b).onclick = () => set($('#ubD', b).value);
    $('#ubClear', b).onclick = () => set('');
    $('#ubFreeze', b).onclick = () => { const id = uid(); state.freezer[id] = { id, name: x.name, portions: 1, date: todayISO(), at: now() }; save(); closeSheet(); toast(`${x.name} added to the freezer`, 'Open', () => go('#/freezer')); };
    $('#pDel', b) && ($('#pDel', b).onclick = () => { closeSheet(); withUndo(`${x.name} removed`, () => { delete state.pantry[x.key]; }, viewPantry); });
  });
}
function useByTag(p) {
  const d = useByDays(p); if (d == null) return '';
  if (d < 0) return '<span class="ub bad">past use-by</span>';
  if (d <= 2) return `<span class="ub warn">use ${d === 0 ? 'today' : d === 1 ? 'by tomorrow' : 'in 2 days'}</span>`;
  return `<span class="ub">use by ${esc(shortDate(p.useBy).replace(/^\w+, /, ''))}</span>`;
}

// ---------------------------------------------------------------- story, recap, milestones (#14, #15, #16)
const realDinners = () => Object.values(state.cooked).filter((c) => c.recipeId !== 'receipt');
function monthRecap(key) {
  const es = realDinners().filter((c) => c.date.startsWith(key));
  if (!es.length) return null;
  const spent = Object.values(state.cooked).filter((c) => c.date.startsWith(key)).reduce((a, c) => a + Number(c.amount || 0), 0);
  const by = {}; es.forEach((c) => { by[c.recipeId] = (by[c.recipeId] || 0) + 1; });
  const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  const topName = (summary(top[0]) || {}).title || (es.find((c) => c.recipeId === top[0]) || {}).title;
  const earlier = new Set(realDinners().filter((c) => c.date < key).map((c) => c.recipeId));
  const fresh = new Set(es.filter((c) => !earlier.has(c.recipeId) && c.recipeId !== 'other').map((c) => c.recipeId)).size;
  const cnt = (n) => es.filter((c) => c.by === n || c.by === 'Both').length;
  const photos = Object.values(state.photos).flat().filter((p) => p.date.startsWith(key)).length;
  return { key, n: es.length, spent, topName, topN: top[1], fresh, corey: cnt('Corey'), faith: cnt('Faith'), photos, saved: es.reduce((a, c) => a + Math.max(0, state.settings.takeoutCost - Number(c.amount || 0)), 0) };
}
function recapCard(rc, dismiss) {
  return `<div class="recap"><div class="rk">${esc(monthName(rc.key).toUpperCase())} · RECAP${dismiss ? '<button class="x" id="recapX" aria-label="Dismiss">×</button>' : ''}</div>
    <div class="rgrid"><div><b>${rc.n}</b><span>dinners</span></div><div><b>${money(rc.spent)}</b><span>spent</span></div><div><b>${money(rc.saved)}</b><span>saved vs takeout</span></div></div>
    <p>Most made: <b>${esc(rc.topName)}</b>${rc.topN > 1 ? ` ×${rc.topN}` : ''}.${rc.fresh ? ` ${rc.fresh} new recipe${rc.fresh === 1 ? '' : 's'} tried.` : ''}${rc.corey || rc.faith ? ` Corey cooked ${rc.corey}, Faith ${rc.faith}.` : ''}${rc.photos ? ` ${rc.photos} photo${rc.photos === 1 ? '' : 's'}.` : ''}</p></div>`;
}
const MILESTONES = [
  ['d1', 'First dinner logged', (x) => x.n >= 1], ['d10', '10 dinners together', (x) => x.n >= 10], ['d25', '25 dinners together', (x) => x.n >= 25],
  ['d50', '50 dinners together', (x) => x.n >= 50], ['d100', '100 dinners together', (x) => x.n >= 100],
  ['r5', '5 different recipes tried', (x) => x.distinct >= 5], ['rall', 'Cooked every recipe in the book', (x) => x.allBook],
  ['p1', 'First photo memory', (x) => x.photos >= 1], ['p10', '10 photo memories', (x) => x.photos >= 10],
  ['c10', 'Corey cooked 10 dinners', (x) => x.corey >= 10], ['f10', 'Faith cooked 10 dinners', (x) => x.faith >= 10],
  ['b10', '10 dinners cooked together', (x) => x.both >= 10], ['bud', 'A whole month inside the budget', (x) => x.budgetMonth],
];
function milestoneFacts() {
  const all = realDinners();
  const ids = new Set(all.map((c) => c.recipeId).filter((id) => id !== 'other'));
  const months = {}; Object.values(state.cooked).forEach((c) => { const k = c.date.slice(0, 7); months[k] = (months[k] || 0) + Number(c.amount || 0); });
  const cnt = (n) => all.filter((c) => c.by === n || c.by === 'Both').length;
  return {
    n: all.length, distinct: ids.size, allBook: INDEX.recipes.length > 0 && INDEX.recipes.every((r) => ids.has(r.id)),
    photos: Object.values(state.photos).flat().length, corey: cnt('Corey'), faith: cnt('Faith'), both: all.filter((c) => c.by === 'Both').length,
    budgetMonth: Object.entries(months).some(([k, v]) => k < monthKey() && v > 0 && v <= state.settings.budgetMax && all.filter((c) => c.date.startsWith(k)).length >= 8),
  };
}
function checkMilestones(silent) {
  const f = milestoneFacts(); const fresh = [];
  MILESTONES.forEach(([k, label, test]) => { if (!state.milestones[k] && test(f)) { state.milestones[k] = todayISO(); fresh.push(label); } });
  if (fresh.length) { save(); if (!silent) setTimeout(() => toast('Milestone ♥ ' + fresh[fresh.length - 1]), 2800); }
}
const REACT = [['love', 'Loved it'], ['like', 'Good'], ['meh', 'Meh']];
const reactWord = (r) => ({ love: 'loved it', like: 'liked it', meh: 'thought it was meh' }[r] || '');
function reactLine(c) { return Object.entries(c.reactions || {}).filter(([, v]) => v).map(([n, v]) => `${n} ${reactWord(v)}`).join(' · '); }
function viewStory() {
  setTop({ title: 'OUR STORY', back: '#/us' });
  const all = realDinners().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.at - a.at));
  const months = []; all.forEach((c) => { const k = c.date.slice(0, 7); let m = months.find((x) => x.k === k); if (!m) months.push(m = { k, items: [] }); m.items.push(c); });
  const photoFor = (c) => (state.photos[c.recipeId] || []).filter((p) => p.date === c.date);
  render(`<div class="wrap"><div class="kicker">Corey ♥ Faith<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Our story</h1>
    <p class="lead" style="margin-top:4px">Every dinner we've made together, newest first.</p>
    ${months.length ? months.map((m) => { const rc = monthRecap(m.k); return `<div class="sec"><div class="sec-title">${esc(monthName(m.k))}</div>${rc && m.k !== monthKey() ? recapCard(rc) : ''}
      <ul class="timeline">${m.items.map((c) => { const ph = photoFor(c); return `<li><span class="dot"></span><div class="tl-body"><div class="tl-d">${esc(shortDate(c.date))}${c.by ? ' · ' + esc(c.by === 'Both' ? 'cooked together' : c.by + ' cooked') : ''}</div>
        <div class="tl-t">${c.recipeId !== 'other' && summary(c.recipeId) ? `<a href="#/r/${c.recipeId}">${esc(c.title)}</a>` : esc(c.title)}</div>
        ${reactLine(c) ? `<button class="tl-r" data-react="${c.id}">${esc(reactLine(c))}</button>` : `<button class="linkbtn" data-react="${c.id}">How was it?</button>`}
        ${ph.length ? `<div class="tl-ph">${ph.slice(0, 3).map((p) => `<img src="${p.data}" alt="" loading="lazy">`).join('')}</div>` : ''}</div></li>`; }).join('')}</ul></div>`; }).join('')
      : '<div class="empty" style="margin-top:16px">Tap “Mark as cooked” after dinner and it becomes part of our story — with photos and dates.</div>'}
  </div>`);
  $$('[data-react]').forEach((b) => (b.onclick = () => openReact(state.cooked[b.dataset.react], viewStory)));
}
function reactPicker(cur) {
  return ['Corey', 'Faith'].map((n) => `<div class="setrow" style="border:0;padding:6px 0"><span class="l"><b>${n}</b></span><div class="seg react" data-who="${n}">${REACT.map(([k, l]) => `<button type="button" data-rv="${k}" class="${cur[n] === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>`).join('');
}
function bindReact(b, cur) {
  $$('.react', b).forEach((seg) => $$('button', seg).forEach((btn) => (btn.onclick = () => { const n = seg.dataset.who; cur[n] = cur[n] === btn.dataset.rv ? null : btn.dataset.rv; $$('button', seg).forEach((x) => x.classList.toggle('on', x.dataset.rv === cur[n])); })));
}
function openReact(c, after) {
  const cur = { ...(c.reactions || {}) };
  openSheet(`<h2>How was it?</h2><p class="sub">${esc(c.title)} · ${esc(shortDate(c.date))}</p>${reactPicker(cur)}
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="rxSave">Save</button></div>`, (b) => {
    bindReact(b, cur);
    $('#rxSave', b).onclick = () => { const clean = Object.fromEntries(Object.entries(cur).filter(([, v]) => v)); state.cooked[c.id] = { ...c, reactions: clean }; save(); closeSheet(); if (after) after(); };
  });
}

// ---------------------------------------------------------------- seasonal layer (#21)
function nearAnniversary() {
  const a = state.settings.anniversary; if (!a) return false;
  const [, m, d] = a.split('-').map(Number); const t = new Date(); t.setHours(0, 0, 0, 0);
  return [-1, 0, 1].some((yo) => Math.abs((new Date(t.getFullYear() + yo, m - 1, d) - t) / 864e5) <= 3);
}
function applySeason() {
  let layer = $('#season');
  const mo = new Date().getMonth();
  const hearts = nearAnniversary() && state.settings.hearts !== false;
  const snow = (mo >= 10 || mo <= 1) && state.settings.snow !== false;
  const kind = hearts ? 'hearts' : snow ? 'snow' : '';
  if (!kind || reducedMotion()) { if (layer) layer.remove(); return; }
  if (layer && layer.dataset.kind === kind) return;
  if (layer) layer.remove();
  layer = document.createElement('div'); layer.id = 'season'; layer.dataset.kind = kind; layer.setAttribute('aria-hidden', 'true');
  const n = kind === 'hearts' ? 10 : 16;
  for (let i = 0; i < n; i++) {
    const e = document.createElement('i');
    const size = kind === 'hearts' ? 9 + Math.random() * 5 : 3 + Math.random() * 3.5;
    e.style.cssText = `left:${(i / n) * 100 + Math.random() * (100 / n)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;animation-duration:${(14 + Math.random() * 12).toFixed(1)}s,${(4 + Math.random() * 3).toFixed(1)}s;animation-delay:${(-Math.random() * 26).toFixed(1)}s,${(-Math.random() * 4).toFixed(1)}s;opacity:${(0.35 + Math.random() * 0.35).toFixed(2)}`;
    if (kind === 'hearts') e.innerHTML = `<svg viewBox="0 0 24 24">${ICON.heart}</svg>`;
    layer.appendChild(e);
  }
  document.body.appendChild(layer);
}
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applySeason); } catch (e) {}

// ---------------------------------------------------------------- what's new (#34) + backup reminder (#45)
const WHATSNEW = [
  ['Cooking', 'Amounts right inside each step · “Start cooking by” · hands-free mode (voice where the phone allows it, big tap zones everywhere) · read-aloud · cook two dishes at once with all timers together · candle-lit cook mode on Date Night recipes'],
  ['Grocery', 'Add a recipe (only what the pantry is missing) · duplicates merge and amounts add up · estimated trip total · scan a receipt to stock the pantry, tick the list, log the total and learn real prices · staples marked Out go back on the list'],
  ['Ideas', 'Mood picker (Cozy, Quick, Fancy, Cheap) · Use it up · Haven\'t made in a while · London weather picks · whose turn to pick · search by ingredient like “chicken + rice” · a wish list'],
  ['Us', 'Our story timeline · monthly recap · milestones · who cooked it · reactions · love notes on recipes · Mom\'s soup family story'],
  ['Kitchen', 'Swap ideas per ingredient · reheat & make-ahead tips · gear list · cups/grams and °C/°F · guest mode for 4–6 · pantry use-by dates · freezer list · print a recipe · recipe versions you can switch back to · undo · snow until February'],
];
function whatsNewCard() {
  if (state.seenWhatsNew === WHATSNEW_ID) return '';
  return `<div class="wn"><div class="wn-k">NEW IN OUR KITCHEN<button class="x" id="wnX" aria-label="Dismiss">×</button></div>
    <p>A big update for both of us — cooking help, smarter grocery runs, our story and more. Everything you saved is still here.</p>
    <div class="btnrow" style="margin-top:10px"><button class="btn sm ghost" id="wnMore">See what's new</button><button class="btn sm gold" id="wnOk">Got it ♥</button></div></div>`;
}
function openWhatsNew() {
  openSheet(`<h2>What's new</h2><p class="sub">November 2026 update · everything you had saved stays exactly as it was.</p>
    <div class="wnlist">${WHATSNEW.map(([h, t]) => `<div><h4>${esc(h)}</h4><p>${esc(t)}</p></div>`).join('')}</div>
    <div class="foot"><button class="btn primary" data-close>Lovely</button></div>`);
  if (state.seenWhatsNew !== WHATSNEW_ID) { state.seenWhatsNew = WHATSNEW_ID; save(); }
}
function backupDue() {
  const st = state.settings; const t = now();
  const hasData = Object.keys(state.cooked).length + Object.keys(state.notes).length + Object.keys(state.photos).length + Object.keys(state.pantry).length > 0;
  if (!hasData || (st.backupSnooze && st.backupSnooze > t)) return false;
  return t - (st.lastBackup || state.createdAt || t) > DAYS(30);
}
function backupCard() {
  if (!backupDue()) return '';
  return `<div class="nudge bk"><span>${svg('share')}</span><span style="flex:1">Monthly backup — save a copy of our recipes, photos and budget.</span><button class="btn sm gold" id="bkNow">Back up</button><button class="x" id="bkLater" aria-label="Remind me later">×</button></div>`;
}

// ---------------------------------------------------------------- recipe extras: start-by, guests, love note, story, swaps, print, versions
function fmtTime(d) { return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }).replace(/\s?a\.m\./, ' am').replace(/\s?p\.m\./, ' pm'); }
function openStartBy(r) {
  const total = r.prep + r.cook; const buffer = 5;
  const def = ui.eatAt || '18:30';
  openSheet(`<h2>Start cooking by</h2><p class="sub">When do you want to eat? ${esc(r.title)} takes about ${total} min, plus ${buffer} min to plate up.</p>
    <div class="field"><label>We want to eat at</label><input id="eatAt" type="time" value="${def}"></div>
    <div class="startby" id="sbOut"></div>
    ${r.thaw ? `<p class="small muted" style="margin-top:8px">${tx(r.thaw)}</p>` : ''}
    <div class="foot"><button class="btn primary" data-close>Done</button></div>`, (b) => {
    const calc = () => {
      const v = $('#eatAt', b).value || def; ui.eatAt = v; const [h, m] = v.split(':').map(Number);
      const eat = new Date(); eat.setHours(h, m, 0, 0); const start = new Date(eat - (total + buffer) * 6e4);
      const n = new Date(); const late = start < n && eat > n;
      $('#sbOut', b).innerHTML = `<div class="lbl">START BY</div><div class="amt">${esc(fmtTime(start))}</div><p>${late ? 'That\'s already passed — start now and you\'ll eat around ' + esc(fmtTime(new Date(n.getTime() + (total + buffer) * 6e4))) + '.' : `Prep ${r.prep} min · cook ${r.cook} min · eat at ${esc(fmtTime(eat))}.`}</p>`;
    };
    $('#eatAt', b).oninput = calc; calc();
  });
}
function openGuests(r, id) {
  const base = r.servings || 4; const cur = state.guests[id] || 0;
  openSheet(`<h2>Having people over?</h2><p class="sub">Scales the ingredients, the cost and anything you add to the grocery list. Everyone gets a full plate, plus one extra portion for seconds.</p>
    <div class="segtext" style="grid-template-columns:repeat(3,1fr);margin-top:14px">${[4, 5, 6].map((n) => `<button data-gn="${n}" class="${cur === n ? 'on' : ''}">${n}<small>people</small></button>`).join('')}</div>
    <div class="foot">${cur ? '<button class="btn" id="gOff">Back to just us</button>' : '<button class="btn" data-close>Cancel</button>'}</div>`, (b) => {
    $$('[data-gn]', b).forEach((x) => (x.onclick = () => { const n = +x.dataset.gn; state.guests[id] = n; state.servings[id] = n + 1; save(); closeSheet(); viewRecipe(id); toast(`Guest mode · ${n} people`); }));
    $('#gOff', b) && ($('#gOff', b).onclick = () => { delete state.guests[id]; delete state.servings[id]; save(); closeSheet(); viewRecipe(id); toast(`Back to ${base} servings`); });
  });
}
function openLoveNote(id, r) {
  const cur = state.loveNotes[id];
  openSheet(`<h2>Love note</h2><p class="sub">Leave a little note on ${esc(r.title)} — it shows at the top of the recipe.</p>
    <textarea id="lnTx" class="notes" maxlength="280" placeholder="e.g. Our first snow day dinner ♥">${esc(cur ? cur.text : '')}</textarea>
    <div class="foot" style="grid-template-columns:${cur ? 'auto auto 1fr' : 'auto 1fr'}"><button class="btn" data-close>Cancel</button>${cur ? '<button class="btn danger" id="lnDel">Remove</button>' : ''}<button class="btn gold" id="lnSave">Save ♥</button></div>`, (b) => {
    $('#lnSave', b).onclick = () => { const v = $('#lnTx', b).value.trim(); if (!v) { toast('Write a little something'); return; } state.loveNotes[id] = { text: v, by: state.profile.me, at: now(), date: todayISO() }; save(); closeSheet(); viewRecipe(id); };
    $('#lnDel', b) && ($('#lnDel', b).onclick = () => { closeSheet(); withUndo('Love note removed', () => { delete state.loveNotes[id]; }, () => viewRecipe(id)); });
  });
}
function openStory(id, r) {
  const cur = state.stories[id] != null ? state.stories[id] : (r.story || '');
  openSheet(`<h2>The story</h2><p class="sub">The story behind ${esc(r.title)}, in your own words.</p>
    <textarea id="stTx" class="notes" style="min-height:160px">${esc(cur)}</textarea>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="stSave">Save</button></div>`, (b) => {
    $('#stSave', b).onclick = () => { state.stories[id] = $('#stTx', b).value.trim(); save(); closeSheet(); viewRecipe(id); toast('Story saved ♥'); };
  });
}
function openSub(it) {
  const k = it.pantry ? pantryKey(it.pantry.name) : pantryKey(it.name);
  openSheet(`<h2>Swap for ${esc(it.name)}</h2><p class="sub">If you're out, or want to change it up:</p>
    <div class="card subcard" style="margin-top:12px"><p>${tx(SUBS[k] || 'No swap saved for this one.')}</p></div>
    <div class="foot"><button class="btn primary" data-close>Got it</button></div>`);
}
function printRecipe() {
  $$('#view details').forEach((d) => { d.dataset.wasOpen = d.open ? '1' : '0'; d.open = true; });
  document.body.classList.add('printing');
  setTimeout(() => { try { window.print(); } catch (e) {} }, 60);
}
window.addEventListener('beforeprint', () => { $$('#view details').forEach((d) => { if (d.dataset.wasOpen == null || !document.body.classList.contains('printing')) d.dataset.wasOpen = d.open ? '1' : '0'; d.open = true; }); });
window.addEventListener('afterprint', () => { document.body.classList.remove('printing'); $$('#view details').forEach((d) => { if (d.dataset.wasOpen === '0') d.open = false; }); });
function swapVersion(id) {
  const v = state.versions[id]; if (!v) return;
  if (state.custom[id]) { const cur = state.custom[id]; state.custom[id] = v.prev; state.versions[id] = { prev: cur, at: now() }; }
  else { const cur = state.edits[id] || { base: true }; if (v.prev.base) delete state.edits[id]; else state.edits[id] = v.prev; state.versions[id] = { prev: cur, at: now() }; }
  save(); viewRecipe(id); toast('Switched recipe version', 'Undo', () => swapVersion(id));
}

// ---------------------------------------------------------------- receipt scan (on-device OCR)
let ocrWorker = null;
function loadScript(src) { return new Promise((res, rej) => { if (window.Tesseract) { res(); return; } const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
async function getOCR(progress) {
  if (ocrWorker) return ocrWorker;
  await loadScript('vendor/tesseract/tesseract.min.js');
  const abs = (p) => new URL(p, location.href).href;
  ocrWorker = await window.Tesseract.createWorker('eng', 1, {
    workerPath: abs('vendor/tesseract/worker.min.js'), corePath: abs('vendor/tesseract/'), langPath: abs('vendor/tesseract/lang'),
    workerBlobURL: false, gzip: true, logger: (m) => { if (progress) progress(m); },
  });
  return ocrWorker;
}
function prepImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const im = new Image();
    im.onload = () => {
      const max = 1800; const k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      const g = c.getContext('2d'); g.drawImage(im, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height); const p = d.data;
      for (let i = 0; i < p.length; i += 4) { let v = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]; v = v > 170 ? 255 : v < 85 ? 0 : (v - 85) * 3; p[i] = p[i + 1] = p[i + 2] = v; }
      g.putImageData(d, 0, 0); URL.revokeObjectURL(url); res(c);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    im.src = url;
  });
}
const ABBR = { chkn: 'chicken', chk: 'chicken', chick: 'chicken', brst: 'breasts', brsts: 'breasts', breast: 'breasts', bnls: 'boneless', thgh: 'thighs', thigh: 'thighs', thi: 'thighs', grd: 'ground', grnd: 'ground', bf: 'beef', ched: 'cheddar', chdr: 'cheddar', chedr: 'cheddar', shrd: 'shredded', mozz: 'mozzarella', mozza: 'mozzarella', parm: 'parmesan', parmsn: 'parmesan', crm: 'cream', whp: 'whipping', whip: 'whipping', btr: 'butter', buttr: 'butter', pot: 'potatoes', pots: 'potatoes', potato: 'potatoes', russ: 'russet', ykn: 'yukon', yuk: 'yukon', brocc: 'broccoli', brcl: 'broccoli', broc: 'broccoli', onion: 'onions', onio: 'onions', ylw: 'yellow', grlc: 'garlic', tom: 'tomatoes', toms: 'tomatoes', tomato: 'tomatoes', lett: 'lettuce', iceb: 'iceberg', mlk: 'milk', egg: 'eggs', slmn: 'salmon', sal: 'salmon', strl: 'sirloin', sirl: 'sirloin', stk: 'steak', bcn: 'bacon', bacn: 'bacon', spag: 'spaghetti', spagh: 'spaghetti', fett: 'fettuccine', fettuc: 'fettuccine', mac: 'macaroni', macar: 'macaroni', elb: 'elbow', marin: 'marinara', tort: 'tortillas', tortilla: 'tortillas', flr: 'flour', hny: 'honey', brth: 'broth', evap: 'evaporated', bns: 'beans', crrt: 'carrots', carr: 'carrots', carrot: 'carrots', pnko: 'panko', rce: 'rice', jasm: 'jasmine', jsmn: 'jasmine', hlf: 'half', crnstrch: 'cornstarch', vin: 'vinegar', oys: 'oyster', sesm: 'sesame' };
const RSTOP = new Set(['pc', 'nn', 'no', 'name', 'sel', 'ss', 'the', 'and', 'or', 'kg', 'lb', 'lbs', 'ml', 'ea', 'pk', 'pkg', 'lg', 'sm', 'med', 'org', 'fs', 'blue', 'menu', 'compliments', 'brand', 'hst', 'mrj', 'gp', 'sale', 'reg', 'each', 'value', 'pack', 'family']);
const PSTOP = new Set(['and', 'or', 'the', 'boneless', 'small', 'mild', 'dried', 'grated', 'lean', '10', '35', 'all', 'purpose', 'vegetable', 'skinless', 'fillets', 'shredded', 'frozen']);
function rTokens(s) { return String(s).toLowerCase().replace(/[^a-z ]+/g, ' ').split(/\s+/).filter((t) => t.length >= 2 && !RSTOP.has(t)).map((t) => ABBR[t] || t); }
function matchReceiptName(name, catalog) {
  const toks = rTokens(name); if (!toks.length) return null;
  let best = null;
  catalog.forEach((c) => {
    const words = slug(c.name).split('-').filter((w) => w && !PSTOP.has(w));
    if (!words.length) return;
    let hit = 0; let strong = false;
    words.forEach((w) => { if (toks.some((t) => t === w || (t.length >= 3 && w.length >= 3 && (w.startsWith(t) || t.startsWith(w))))) { hit++; if (w.length >= 4) strong = true; } });
    const score = hit / words.length + (hit && toks.some((t) => t.length >= 3 && words[0].startsWith(t)) ? 0.2 : 0) - (words.length > hit ? 0.05 * (words.length - hit) : 0);
    if (strong && hit && score >= 0.5 && (!best || score > best.score)) best = { key: c.key, score };
  });
  return best ? best.key : null;
}
const SKIPLINE = /sub\s*-?total|\btax\b|hst|gst|pst|change|cash|visa|debit|master|amex|balance|tender|points|optimum|sav(ed|ings?)|approved|card|auth|\bref\b|store|\btel\b|thank|welcome|cashier|lane|trans|receipt|interac|member|reward|coupon|discount|deposit|eco fee|items? sold|\bqty\b/i;
function parseReceipt(text) {
  const lines = text.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const items = []; let total = null; let pending = null;
  const priceRx = /^(.*?)\s*\$?\s*(\d{1,4}[.,]\d{2})\s*-?\s*[A-Z*]{0,3}$/;
  lines.forEach((l) => {
    const m = l.match(priceRx);
    if (/\btotal\b/i.test(l) && !/sub/i.test(l)) { if (m) total = parseFloat(m[2].replace(',', '.')); pending = null; return; }
    if (SKIPLINE.test(l)) { pending = null; return; }
    if (!m) { if (/[a-z]{3,}/i.test(l) && !/\d+[.,]\d{2}/.test(l)) pending = l; return; }
    let name = m[1].trim(); const price = parseFloat(m[2].replace(',', '.'));
    const weighed = /\d+[.,]\d+\s*(kg|lb)|@/i.test(name) && !/[a-z]{4,}/i.test(name.replace(/kg|lb/gi, ''));
    if ((weighed || !/[a-z]{3,}/i.test(name)) && pending) name = pending;
    pending = null;
    name = name.replace(/^\d{5,}\s*/, '').replace(/\s+\d+[.,]\d+\s*(kg|lb).*$/i, '').replace(/[^\w &'%/-]/g, '').trim();
    if (!/[a-z]{2,}/i.test(name) || price <= 0 || price > 300) return;
    items.push({ name, price });
  });
  if (total == null && items.length) total = Math.round(items.reduce((a, x) => a + x.price, 0) * 100) / 100;
  return { items, total };
}
function openScan() {
  openSheet(`<h2>Scan a receipt</h2><p class="sub">Snap or pick a photo of a grocery receipt. It's read right here on the phone — nothing is uploaded — and you check the matches before anything changes.</p>
    <label class="btn primary block" style="margin-top:14px;cursor:pointer">${svg('camera')}Take or choose a photo<input type="file" id="rcIn" accept="image/*" hidden></label>
    <p class="small muted" style="margin-top:10px">The first scan downloads the reader (about 6 MB, once). After that it works offline. Flat, bright photos read best.</p>
    <div id="rcProg" class="rcprog" hidden><div class="lbl" id="rcMsg">Reading…</div><div class="cm-bar"><i id="rcBar" style="width:5%"></i></div></div>
    <div class="foot"><button class="btn" data-close>Cancel</button></div>`, (b) => {
    $('#rcIn', b).onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      $('#rcProg', b).hidden = false;
      const msg = (t, p) => { const m = $('#rcMsg'); const bar = $('#rcBar'); if (m) m.textContent = t; if (bar && p != null) bar.style.width = Math.max(5, Math.round(p * 100)) + '%'; };
      try {
        msg('Getting the photo ready…', 0.05);
        const canvas = await prepImage(file);
        const w = await getOCR((m) => { if (m.status === 'recognizing text') msg('Reading the receipt…', 0.3 + (m.progress || 0) * 0.7); else msg(String(m.status || 'Loading').replace(/^./, (c) => c.toUpperCase()) + '…', (m.progress || 0) * 0.3); });
        const { data } = await w.recognize(canvas);
        ui.lastOCR = data.text || '';
        const parsed = parseReceipt(ui.lastOCR);
        if (!parsed.items.length) { msg("Couldn't find any items — try a flatter, brighter photo.", 1); return; }
        openReceiptReview(parsed);
      } catch (err) { ocrWorker = null; msg("The reader couldn't load. Open the app once with internet so it can download, then try again.", 1); }
    };
  });
}
function openReceiptReview(parsed) {
  const catMap = pantryCatalog();
  Object.values(state.grocery).forEach((g) => { if (!catMap[g.key]) catMap[g.key] = { key: g.key, name: g.name, cat: g.cat, recipes: [] }; });
  const catalog = Object.values(catMap).sort((a, b) => a.name.localeCompare(b.name));
  const rows = parsed.items.map((it) => ({ ...it, key: matchReceiptName(it.name, catalog), on: true }));
  const opts = (sel) => `<option value="">— not in our pantry —</option>${catalog.map((c) => `<option value="${esc(c.key)}" ${c.key === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}`;
  openSheet(`<h2>Check the receipt</h2><p class="sub">Fix anything the reader got wrong. Untick lines to skip them. ${rows.filter((r) => r.key).length} of ${rows.length} matched.</p>
    <div class="rclist">${rows.map((r, i) => `<div class="rcrow ${r.on ? '' : 'off'}"><label class="rcck"><input type="checkbox" ${r.on ? 'checked' : ''} data-on="${i}" aria-label="Include"></label>
      <div class="rcmain"><input class="rcname" data-name="${i}" value="${esc(r.name)}" aria-label="Item"><select data-key="${i}" aria-label="Matches">${opts(r.key)}</select></div>
      <input class="numin rcprice" data-price="${i}" type="number" inputmode="decimal" step="0.01" value="${r.price.toFixed(2)}" aria-label="Price"></div>`).join('')}</div>
    <div class="setrow"><span class="l"><b>Receipt total</b><span>From the TOTAL line</span></span><input class="numin" id="rcTotal" type="number" inputmode="decimal" step="0.01" style="width:96px" value="${parsed.total != null ? parsed.total.toFixed(2) : ''}"></div>
    <label class="setrow"><span class="l"><b>Add the total to the budget</b><span>As “Grocery receipt” today</span></span><span class="switch"><input type="checkbox" id="rcBud" checked><i></i></span></label>
    <p class="small muted" style="margin-top:8px">Saving marks matched items “Have lots” in the Pantry, ticks them off the grocery list and remembers the prices for cost estimates.</p>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn gold" id="rcSave">Save receipt</button></div>`, (b) => {
    $$('[data-on]', b).forEach((x) => (x.onchange = () => { rows[x.dataset.on].on = x.checked; x.closest('.rcrow').classList.toggle('off', !x.checked); }));
    $$('[data-key]', b).forEach((x) => (x.onchange = () => { rows[x.dataset.key].key = x.value || null; }));
    $$('[data-name]', b).forEach((x) => (x.oninput = () => { rows[x.dataset.name].name = x.value; }));
    $$('[data-price]', b).forEach((x) => (x.oninput = () => { rows[x.dataset.price].price = parseFloat(x.value) || 0; }));
    $('#rcSave', b).onclick = () => {
      const snap = JSON.stringify(state);
      let stocked = 0, ticked = 0, priced = 0;
      rows.filter((r) => r.on && r.key).forEach((r) => {
        const c = catMap[r.key];
        state.pantry[r.key] = { ...(state.pantry[r.key] || { name: c.name, cat: c.cat }), level: 'lots', at: now() }; stocked++;
        Object.values(state.grocery).forEach((g) => { if (g.key === r.key && !g.checked) { g.checked = true; g.at = now(); g.checkedAt = now(); g.checkedBy = state.profile.me; ticked++; } });
        if (r.price > 0) { state.prices[r.key] = { price: Math.round(r.price * 100) / 100, at: now(), date: todayISO(), src: 'receipt', name: r.name }; priced++; }
      });
      const tot = parseFloat($('#rcTotal', b).value);
      if ($('#rcBud', b).checked && tot > 0) { const id = uid(); state.cooked[id] = { id, recipeId: 'receipt', title: 'Grocery receipt', date: todayISO(), amount: Math.round(tot * 100) / 100, estimate: false, by: state.profile.me, at: now(), receipt: true, lines: rows.filter((r) => r.on).length }; }
      save(); closeSheet(); router();
      toast(`Saved · ${stocked} stocked · ${ticked} ticked off · ${priced} prices`, 'Undo', () => { state = JSON.parse(snap); save(); router(); });
    };
  });
}

// ---------------------------------------------------------------- cook mode (#3, #4, #5, #30)
const cookTimers = []; let timerTick = null; let cookSession = null;
const fmtSec = (sec) => Math.floor(sec / 60) + ':' + pad2(sec % 60);
function ensureTick() {
  if (timerTick) return;
  timerTick = setInterval(() => {
    let changed = false;
    for (let k = cookTimers.length - 1; k >= 0; k--) {
      const t = cookTimers[k]; t.left = Math.max(0, Math.round((t.end - now()) / 1000));
      if (t.left <= 0) { cookTimers.splice(k, 1); changed = true; beep(); toast(`${t.dish} · step ${t.step + 1} timer done!`); speak(`Timer done. ${t.dish}, step ${t.step + 1}.`); }
    }
    $$('[data-tleft]').forEach((el) => { const t = cookTimers.find((x) => x.id === el.dataset.tleft); if (t) el.textContent = fmtSec(t.left); });
    if (changed && cookSession && !$('#cook').hidden) cookSession.redraw();
    if (!cookTimers.length) { clearInterval(timerTick); timerTick = null; }
  }, 1000);
}
function speak(text) {
  if (!('speechSynthesis' in window) || !(cookSession && cookSession.read)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-CA'; u.rate = 0.98; speechSynthesis.speak(u); } catch (e) {}
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function openCook(r, s, f) {
  const el = $('#cook');
  if (cookSession && cookSession.s0 && cookSession.s0.id === s.id && !el.hidden) return;
  const prefs = state.settings.cook || {};
  const isDate = (rr) => ((rr.tags || {}).occasion || []).includes('date-night');
  const sess = cookSession = { s0: s, dishes: [{ r, s, f, i: 0 }], cur: 0, showIngs: false, read: false, hands: false, rec: null, candle: isDate(r) && prefs.candle !== false };
  document.body.classList.add('cooking');
  lockScreen().then((ok) => { const a = $('.awake', el); if (a) a.textContent = ok ? 'Screen will stay awake while cooking' : 'Tip: turn off auto-lock while cooking'; });
  const D = () => sess.dishes[sess.cur];
  const short = (t) => (t.length > 20 ? t.split(' ').slice(0, 3).join(' ') : t);
  const stepSpeech = () => { const d = D(); const st = d.r.steps[d.i]; const u = stepUses(d.r, st, d.f); return `Step ${d.i + 1}. ${st.title}. ${tempText(st.text).replace(/°C/g, ' degrees Celsius').replace(/°F/g, ' degrees Fahrenheit')}${u.length ? ' You need: ' + u.join(', ') + '.' : ''}`; };
  const pending = () => sess.dishes.findIndex((x, k) => k !== sess.cur && !x.done);
  const move = (dir) => {
    const d = D();
    if (dir > 0) {
      const ck = state.checks[d.s.id] || (state.checks[d.s.id] = { i: {}, s: {} }); ck.s[d.i] = 1; ck.at = now(); save();
      if (d.i === d.r.steps.length - 1) {
        d.done = true;
        const nxt = pending();
        if (nxt >= 0) { sess.cur = nxt; sess.showIngs = false; buzz(12); draw(); speak(stepSpeech()); return; }
        close(); toast('Enjoy dinner ♥', 'Mark as cooked', () => $('#cookedBtn') && $('#cookedBtn').click()); return;
      }
      d.i++;
    } else { if (d.i === 0) return; d.i--; }
    sess.showIngs = false; buzz(12); draw(); speak(stepSpeech());
  };
  const startRec = () => {
    if (!SR) return false;
    try {
      const rec = new SR(); rec.lang = 'en-CA'; rec.continuous = true; rec.interimResults = false;
      rec.onresult = (e) => {
        const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if (/\b(next|forward|continue)\b/.test(t)) move(1);
        else if (/\b(back|previous)\b/.test(t)) move(-1);
        else if (/\b(repeat|again|read)\b/.test(t)) { const was = sess.read; sess.read = true; speak(stepSpeech()); sess.read = was; }
      };
      rec.onerror = (e) => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { sess.rec = null; toast('Mic not allowed — big tap zones are on instead'); draw(); } };
      rec.onend = () => { if (sess.hands && sess.rec === rec && !el.hidden) { try { rec.start(); } catch (e) {} } };
      rec.start(); sess.rec = rec; return true;
    } catch (e) { sess.rec = null; return false; }
  };
  const stopRec = () => { const r0 = sess.rec; sess.rec = null; if (r0) { try { r0.stop(); } catch (e) {} } };
  function draw() {
    const d = D(); const rr = d.r; const st = rr.steps[d.i]; const last = d.i === rr.steps.length - 1;
    const uses = stepUses(rr, st, d.f);
    const myT = cookTimers.find((t) => t.rid === d.s.id && t.step === d.i);
    const others = cookTimers.filter((t) => t !== myT);
    const more = last && pending() >= 0;
    el.classList.toggle('candle', !!sess.candle && isDate(rr)); el.classList.toggle('hands', !!sess.hands);
    el.innerHTML = `<div class="ctop"><button class="iconbtn" id="cClose" aria-label="Close">${svg('close')}</button><div class="cstep">STEP ${d.i + 1} OF ${rr.steps.length}</div>
        <div class="ctools">${'speechSynthesis' in window ? `<button class="iconbtn ${sess.read ? 'on' : ''}" id="cRead" aria-label="Read aloud" aria-pressed="${sess.read}">${svg('speaker')}</button>` : ''}<button class="iconbtn ${sess.hands ? 'on' : ''}" id="cHands" aria-label="Hands-free" aria-pressed="${sess.hands}">${svg('mic')}</button>${isDate(rr) ? `<button class="iconbtn ${sess.candle ? 'on' : ''}" id="cCandle" aria-label="Candle light" aria-pressed="${sess.candle}">${svg('candle')}</button>` : ''}<button class="iconbtn ${sess.showIngs ? 'on' : ''}" id="cIngs" aria-label="Ingredients">${svg('cart')}</button></div></div>
      ${sess.dishes.length > 1 ? `<div class="dishes">${sess.dishes.map((x, k) => `<button data-dish="${k}" class="${k === sess.cur ? 'on' : ''}">${esc(short(x.r.title))}<small>${x.done ? 'done ✓' : 'step ' + (x.i + 1) + '/' + x.r.steps.length}</small></button>`).join('')}</div>` : ''}
      <div class="prog">${rr.steps.map((_, k) => `<i class="${k <= d.i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="cbody" id="cBody">${sess.showIngs ? `<div class="k">INGREDIENTS · ${esc(rr.title.toUpperCase())}</div><div class="ings">${rr.groups.map((g) => (g.name ? `<div class="k" style="margin-top:12px">${esc(g.name.toUpperCase())}</div>` : '') + g.items.map((it) => `<div>• ${ingLine(it, d.f, false)}</div>`).join('')).join('')}</div>`
        : `<div class="k">${esc(rr.title.toUpperCase())}</div><h2>${esc(st.title)}</h2>${uses.length ? `<div class="cuses">${uses.map((u) => `<span>${esc(u)}</span>`).join('')}</div>` : ''}<p>${tx(st.text)}</p>
        ${st.timer ? `<button class="timer ${myT ? 'run' : ''}" id="cTimer">${svg('timer')}<span id="cTimerTxt" ${myT ? `data-tleft="${myT.id}"` : ''}>${myT ? fmtSec(myT.left) : 'Start ' + st.timer + ' min timer'}</span></button>` : ''}`}
        ${sess.hands ? `<p class="handshint">${sess.rec ? 'Listening — say “next”, “back” or “repeat”. ' : ''}Tap anywhere on the right for next, the left for back.</p>` : ''}</div>
      ${others.length ? `<div class="ttray">${others.map((t) => `<button data-tgo="${t.id}"><b data-tleft="${t.id}">${fmtSec(t.left)}</b><span>${esc(short(t.dish))} · step ${t.step + 1}</span></button>`).join('')}</div>` : ''}
      <div class="cnav"><button class="btn" id="cPrev" ${d.i === 0 ? 'disabled style="opacity:.35"' : ''}>Back</button><button class="btn gold" id="cNext">${last ? (more ? 'Next dish' : 'Done ♥') : 'Next step'}</button></div>
      <div class="cfoot">${sess.dishes.length < 2 ? '<button class="linkbtn" id="cAdd">+ Cook a second dish</button>' : ''}<span class="awake">${wakeLock ? 'Screen will stay awake while cooking' : ''}</span></div>`;
    $('#cClose', el).onclick = close;
    $('#cIngs', el).onclick = () => { sess.showIngs = !sess.showIngs; draw(); };
    $('#cPrev', el).onclick = () => move(-1);
    $('#cNext', el).onclick = () => move(1);
    if ($('#cRead', el)) $('#cRead', el).onclick = () => { sess.read = !sess.read; if (sess.read) speak(stepSpeech()); else { try { speechSynthesis.cancel(); } catch (e) {} } draw(); };
    $('#cHands', el).onclick = () => {
      sess.hands = !sess.hands;
      if (sess.hands) { const ok = startRec(); toast(ok ? 'Hands-free on — say “next” or “back”, or tap the sides' : 'Voice isn\'t available here — big tap zones are on'); }
      else stopRec();
      draw();
    };
    if ($('#cCandle', el)) $('#cCandle', el).onclick = () => { sess.candle = !sess.candle; state.settings.cook = { ...(state.settings.cook || {}), candle: sess.candle }; save(); draw(); };
    $$('[data-dish]', el).forEach((b) => (b.onclick = () => { sess.cur = +b.dataset.dish; sess.showIngs = false; draw(); }));
    $$('[data-tgo]', el).forEach((b) => (b.onclick = () => { const t = cookTimers.find((x) => x.id === b.dataset.tgo); if (!t) return; const k = sess.dishes.findIndex((x) => x.s.id === t.rid); if (k >= 0) { sess.cur = k; sess.dishes[k].i = t.step; sess.dishes[k].done = false; sess.showIngs = false; draw(); } }));
    if ($('#cAdd', el)) $('#cAdd', el).onclick = pickSecond;
    const tb = $('#cTimer', el);
    if (tb) tb.onclick = () => {
      if (myT) { cookTimers.splice(cookTimers.indexOf(myT), 1); draw(); return; }
      cookTimers.push({ id: uid(), rid: d.s.id, dish: rr.title, step: d.i, left: st.timer * 60, end: now() + st.timer * 6e4 }); ensureTick(); draw();
    };
    const body = $('#cBody', el);
    if (sess.hands) body.onclick = (e) => { if (e.target.closest('button,a,input')) return; move(e.clientX / window.innerWidth < 0.38 ? -1 : 1); };
  }
  sess.redraw = draw;
  function pickSecond() {
    const list = visibleRecipes().filter((x) => x.id !== s.id);
    openSheet(`<h2>Cook a second dish</h2><p class="sub">Switch between both recipes here — all the timers keep running together.</p>
      <div class="rlist" style="margin-top:10px">${list.map((x) => `<button class="rcard pick2" data-p2="${x.id}"><div class="im">${x.image ? img(thumb(x.image), x.title) : placeholderArt(x)}</div><div><div class="num">${esc(recipeLabel(x))}</div><div class="t">${esc(x.title)}</div><div class="meta"><b>${x.price}</b><span>${x.total} min</span></div></div></button>`).join('')}</div>
      <div class="foot"><button class="btn" data-close>Cancel</button></div>`, (b) => {
      $$('[data-p2]', b).forEach((btn) => (btn.onclick = async () => {
        const s2 = summary(btn.dataset.p2); const r2 = s2 && (await getRecipe(s2.id)); if (!r2) return;
        const f2 = (state.servings[s2.id] || r2.servings || 4) / (r2.servings || 4);
        sess.dishes.push({ r: r2, s: s2, f: f2, i: 0 }); sess.cur = 1; sess.showIngs = false; closeSheet(); draw(); toast(`Cooking ${short(r2.title)} too`);
      }));
    });
  }
  let sx = null;
  el.ontouchstart = (e) => { sx = e.touches[0].clientX; };
  el.ontouchend = (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70) move(dx < 0 ? 1 : -1); };
  function close() {
    el.hidden = true; stopRec(); sess.hands = false; try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    document.body.classList.remove('cooking'); el.classList.remove('candle', 'hands');
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    cookSession = null;
    if (cookTimers.length) toast(`${cookTimers.length} timer${cookTimers.length === 1 ? '' : 's'} still running — they'll beep when done`);
    if (location.hash === '#/r/' + s.id) viewRecipe(s.id);
  }
  draw(); el.hidden = false;
}

// ---------------------------------------------------------------- welcome + splash
function showWelcome() {
  const w = $('#welcome');
  let me = state.profile.me;
  const draw = () => {
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    w.innerHTML = `<img class="cover" src="assets/img/cover.webp" alt="Our Kitchen — Corey and Faith — recipes we love">
      <div class="panel"><h2>WELCOME HOME</h2>
        <p>Our recipes, pantry, grocery list and dinner budget — all in one place, and it works offline.</p>
        <p style="margin-top:10px;font-weight:600;color:#12102E">Whose phone is this?</p>
        <div class="who">${['Corey', 'Faith'].map((n) => `<button class="btn ${me === n ? 'on' : ''}" data-me="${n}">${n}</button>`).join('')}</div>
        <button class="btn block go" id="wGo">Let's cook ♥</button>
        ${standalone ? '' : '<p style="font-size:.78rem;margin-top:10px;color:#5A4C6C">Tip: in Safari tap Share → “Add to Home Screen” to install it like an app.</p>'}</div>`;
    $$('[data-me]', w).forEach((b) => (b.onclick = () => { me = b.dataset.me; draw(); }));
    $('#wGo', w).onclick = () => { const fresh = !state.settings.welcomed && !Object.keys(state.cooked).length && !Object.keys(state.notes).length; state.profile.me = me; state.settings.welcomed = true; if (fresh) state.seenWhatsNew = WHATSNEW_ID; save(); w.hidden = true; router(); };
  };
  draw(); w.hidden = false;
}

// ---------------------------------------------------------------- boot
async function boot() {
  applyTheme();
  updateBadge();
  const t0 = performance.now();
  applySeason();
  try { await Promise.all([loadIndex(), loadPrices()]); } catch (e) { render('<div class="wrap"><div class="empty">Could not load recipes. Check your connection and reopen the app.</div></div>'); }
  checkMilestones(true);
  await router();
  if (!state.settings.welcomed) showWelcome();
  setTimeout(loadWeather, 1500);
  const wait = Math.max(0, 800 - (performance.now() - t0));
  setTimeout(() => { $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 700); }, wait);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
}
window.OK_DEBUG = { get state() { return state; }, set state(v) { state = v; save(); } };
boot();
})();
