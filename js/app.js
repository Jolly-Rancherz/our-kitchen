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
  settings: { theme: 'auto', bigText: false, budgetMin: 350, budgetMax: 400, takeoutCost: 50, welcomed: false, anniversary: '' },
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
});
let state = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (raw && raw.v === 1) {
      const d = DEFAULT_STATE();
      const st = { ...d, ...raw, settings: { ...d.settings, ...raw.settings }, profile: { ...d.profile, ...raw.profile } };
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
  return INDEX.recipes.concat(custom);
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
  if (RECIPE_CACHE[id]) return RECIPE_CACHE[id];
  const s = summary(id); if (!s) return null;
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
function addGrocery(name, cat, key, from) {
  key = key || pantryKey(name);
  const existing = Object.values(state.grocery).find((g) => g.key === key && !g.checked);
  if (existing) { if (from && !(existing.from || '').includes(from)) existing.from = existing.from ? existing.from + ', ' + from : from; existing.at = now(); return false; }
  const id = uid();
  state.grocery[id] = { id, name, cat: cat || guessCat(name), key, from: from || '', checked: false, at: now() };
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
];
async function router() {
  const h = location.hash || '#/';
  if (lastRoute === '#/' ) ui.homeScroll = window.scrollY;
  closeSheet();
  for (const [rx, fn] of routes) {
    const m = h.match(rx);
    if (m) {
      const tab = h.startsWith('#/pantry') ? 'pantry' : h.startsWith('#/grocery') ? 'grocery' : h.startsWith('#/budget') ? 'budget' : h.startsWith('#/settings') ? '' : 'recipes';
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
  if (ui.q) {
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
    <div class="im">${r.image ? img(r.image, r.title) : placeholderArt(r)}</div>
    <div><div class="num">${esc(recipeLabel(r))}${r.custom ? ' · ours' : ''}</div>
      <div class="t">${esc(r.title)}</div>
      <div class="meta"><b>${r.price}</b><span>${r.total} min</span><span>~${money(r.cost)}</span>${fav ? `<svg class="heart" viewBox="0 0 24 24">${ICON.heart}</svg>` : ''}</div></div></a>`;
}
function miniCard(r) {
  return `<a class="mini-card" href="#/r/${r.id}"><div class="im">${r.image ? img(r.image, r.title) : placeholderArt(r)}</div>
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
    body = `<div class="sec"><div class="sec-title">${res.length} recipe${res.length === 1 ? '' : 's'}<button class="act" id="clearAll">Clear</button></div>
      ${res.length ? `<div class="rlist">${res.map(rcard).join('')}</div>` : `<div class="empty">Nothing matches yet — try fewer filters. More recipes are on the way.</div>`}</div>`;
  } else {
    const favs = Object.entries(state.favourites).sort((a, b) => b[1] - a[1]).map(([id]) => recipes.find((r) => r.id === id)).filter(Boolean);
    const recent = state.recent.map((id) => recipes.find((r) => r.id === id)).filter(Boolean).slice(0, 8);
    const cats = INDEX.categories.map((c) => ({ ...c, items: recipes.filter((r) => r.category === c.slug).sort((a, b) => a.num - b.num) }));
    const withRecipes = cats.filter((c) => c.items.length);
    const pk = recipes.find((r) => r.id === ui.pick);
    const lefts = Object.values(state.leftovers).sort((a, b) => (a.date < b.date ? -1 : 1));
    const nudge = cookAgainNudge(recipes);
    body = `
      ${pk ? `<div class="sec pick"><div class="pick-k">${esc(pickKicker(pk))}</div>
        <a class="pick-card" href="#/r/${pk.id}"><div class="im">${pk.image ? img(pk.image, pk.title) : placeholderArt(pk)}</div>
          <div class="pc-body"><div class="t">${esc(pk.title)}</div><div class="m">${pk.price} · ${pk.total} min · ~${money(pk.cost)}</div></div></a>
        <div class="pick-q">Sound good tonight?</div>
        <div class="btnrow"><button class="btn ghost" id="pickNo">${svg('thumbDown')}Not tonight</button><button class="btn gold" id="pickYes">${svg('thumbUp')}Let's make it</button></div></div>` : ''}
      <div class="quick"><button class="btn ghost" id="randBtn">${svg('dice')}Can't decide?</button><button class="btn ghost" id="canMake">${svg('pantry')}What can we make?</button></div>
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
        <a href="#/budget"><span>$</span>$350 month</a><a href="#/add"><span>+</span>Add a recipe</a><a href="#/us"><span>♥</span>Us</a><a href="#/settings"><span>⚙</span>Settings</a></div></div>`;
  }
  const fc = filterCount();
  render(`<div class="home-head">
      <div class="kicker">Recipes we love<span class="rule"></span></div>
      <div class="lead" style="margin-top:6px">${esc(greeting())}</div>
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
  $('#pickYes') && ($('#pickYes').onclick = (e) => { logPick(ui.pick, true); heartBurst(e.currentTarget); setTimeout(() => go('#/r/' + ui.pick), 350); });
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
  const amt = q == null ? '' : fmtQty(q, it.unit);
  const met = it.metric ? ` <span class="met">(${fmtQty(it.metric.qty * f, it.metric.unit)})</span>` : '';
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
  (r.badges || []).filter((b) => !/air fryer/i.test(b)).forEach((b) => pills.push(`<span class="pill">${esc(b)}</span>`));
  (tags.occasion || []).slice(0, 2).forEach((o) => pills.push(`<span class="pill">${esc(OCC[o] || o)}</span>`));
  if ((tags.leftovers || []).includes('freezer')) pills.push('<span class="pill">Freezer-friendly</span>');
  const cost = s.cost * f;
  const per = cost / sv;
  const cooked = cookedEntries(id);
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
  <div class="serves"><strong>${esc(sv === base && r.servingsNote ? r.servingsNote : sv + ' servings')}</strong><span class="muted">Est. ~${money(per, true)} a portion</span></div>

  <div class="wrap">
    ${(r.beforeYouStart || []).length ? `<div class="card before"><h3>BEFORE YOU START</h3><ul>${r.beforeYouStart.map((b) => `<li><span class="ic">${svg(b.icon)}</span><span>${esc(b.text)}</span></li>`).join('')}</ul></div>` : ''}

    <div class="sec"><div class="sec-title">Ingredients<button class="act" id="resetBtn">Reset ticks</button></div>
      <div class="portion"><div class="val" id="svVal">${sv}</div><input type="range" id="sv" min="1" max="10" step="1" value="${sv}" style="--p:${((sv - 1) / 9) * 100}%" aria-label="Servings"><div class="lbl">servings<br>${sv === base ? 'as written' : '× ' + (Math.round(f * 100) / 100)}</div></div>
      ${r.groups.map((g, gi) => `<div class="ing-group">${g.name ? `<div class="group-name">${esc(g.name)}</div>` : ''}<ul class="checklist">
        ${g.items.map((it, ii) => `<li data-i="${gi}-${ii}" class="${ck.i[gi + '-' + ii] ? 'done' : ''}"><span class="box">${CHECK}</span><span class="txt">${ingLine(it, f)}</span></li>`).join('')}</ul></div>`).join('')}
      <button class="btn ghost block" id="missingBtn" style="margin-top:12px">${svg('cart')}Add missing to grocery list</button>
    </div>

    <div class="sec"><div class="sec-title">Method</div>
      <button class="btn primary block" id="cookBtn">${svg('play')}Step-by-step cook mode</button>
      <ul class="checklist steps" style="margin-top:8px">${r.steps.map((st, si) => `<li data-s="${si}" class="${ck.s[si] ? 'done' : ''}"><span class="stepnum"><span>${si + 1}</span>${CHECK}</span><span class="txt"><strong>${esc(st.title)}.</strong> ${esc(st.text)}${st.timer ? `<span class="tm">${svg('timer', 'style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2"')}${st.timer} min</span>` : ''}</span></li>`).join('')}</ul>
      ${sv !== base ? `<p class="small muted" style="margin-top:6px">Steps are written for ${base} servings — ingredient amounts above are scaled for ${sv}.</p>` : ''}
    </div>

    ${r.doneness ? `<div class="sec card"><h3>DONENESS</h3><p style="font-size:.95rem">${esc(r.doneness)} Check with an instant-read thermometer in the thickest part.</p></div>` : ''}

    ${(r.fixIt || []).length ? `<div class="sec"><div class="sec-title">Fix it</div><div class="card fix" style="padding-top:2px;padding-bottom:2px">${r.fixIt.map((x) => `<details><summary>${esc(x.problem)}</summary><p>${esc(x.fix)}</p></details>`).join('')}</div></div>` : ''}

    <div class="sec row2">
      ${r.swap ? `<div class="mini"><h3>SWAP</h3><p>${esc(r.swap)}</p></div>` : ''}
      ${r.leftovers ? `<div class="mini navy"><h3>LEFTOVERS</h3><p>${esc(r.leftovers)}</p></div>` : ''}
      ${r.saleTip ? `<div class="mini wide" style="background:var(--tile3)"><h3>SALE TIP · NO FRILLS</h3><p>${esc(r.saleTip)}</p></div>` : ''}
    </div>
    ${r.source ? `<p class="small muted" style="margin-top:10px;font-style:italic">${esc(r.source)}</p>` : ''}

    <div class="sec money">
      <div class="top"><span>About ${money(cost)} total</span><span>~${money(per, true)} a portion</span></div>
      <p>A <strong>${priceTier(cost)}</strong> dinner. Your month is <strong>${money(budgetMin)}–${money(budgetMax)}</strong> — about 13 dinners at ~$27–30 average${s.price === '$' ? ', so this one leaves room for a $$$ night.' : s.price === '$$$' ? '; pair it with a $ meal like Mom\'s potato soup.' : '.'}</p>
      ${(r.cost.breakdown || []).length ? `<details><summary>Where the money goes (${sv} servings)</summary><table>${r.cost.breakdown.map(([n, v]) => `<tr><td>${esc(n)}</td><td>${money(v * f, true)}</td></tr>`).join('')}</table></details>` : ''}
      <div class="legend">$ under $20 · $$ $20–30 · $$$ over $30 · CAD, No Frills London ON estimates, Nov 2026</div>
    </div>

    <div class="sec"><div class="sec-title">Our notes</div>
      <div class="card ours">
        <div class="rate-row"><span class="small muted">Our rating</span><div class="rate" id="rate">${[1, 2, 3, 4, 5].map((n) => `<button data-r="${n}" class="${(state.ratings[id] || 0) >= n ? 'on' : ''}" aria-label="${n} of 5">${svg('heart')}</button>`).join('')}</div></div>
        <textarea id="noteTx" class="notes" placeholder="e.g. Extra cheddar next time. Faith likes it thicker.">${esc(state.notes[id] || '')}</textarea>
        <div class="small muted" style="margin:12px 0 6px">Photo memories</div>
        <div class="photos">${(state.photos[id] || []).map((ph) => `<button class="ph" data-ph="${ph.id}"><img src="${ph.data}" alt="Our photo from ${esc(ph.date)}"><span>${esc(shortDate(ph.date))}</span></button>`).join('')}
          <label class="ph add">${svg('plus')}<span>Add photo</span><input type="file" id="phIn" accept="image/*" hidden></label></div>
      </div></div>

    <div class="sec r-actions">
      <button class="btn gold block" id="cookedBtn">${svg('check')}Mark as cooked</button>
      <div class="btnrow"><button class="btn ghost" id="shareBtn">${svg('share')}Share</button><button class="btn ghost" id="hideBtn">${svg('eyeoff')}Hide meal</button></div>
      ${r.custom ? `<div class="btnrow"><a class="btn ghost" href="#/add/${id}">Edit recipe</a><button class="btn ghost" id="exportRecipe">Export file</button></div>` : ''}
      <p class="small muted" style="text-align:center;margin-top:4px">${cooked.length ? `Cooked ${cooked.length} time${cooked.length === 1 ? '' : 's'} · last ${esc(shortDate(cooked[0].date))}` : 'Not cooked yet — first time!'}</p>
    </div>
  </div>`);

  $('#favBtn').onclick = (e) => { toggleFav(id, e.currentTarget); e.currentTarget.classList.toggle('on', !!state.favourites[id]); };
  $$('.checklist li[data-i]').forEach((li) => (li.onclick = () => toggleCheck(id, 'i', li.dataset.i, li)));
  $$('.checklist li[data-s]').forEach((li) => (li.onclick = () => toggleCheck(id, 's', li.dataset.s, li)));
  $('#resetBtn').onclick = () => { delete state.checks[id]; save(); $$('.checklist li.done').forEach((li) => li.classList.remove('done')); toast('Ticks reset'); };
  const range = $('#sv');
  range.oninput = () => { $('#svVal').textContent = range.value; range.style.setProperty('--p', ((range.value - 1) / 9) * 100 + '%'); };
  range.onchange = () => { const n = +range.value; if (n === base) delete state.servings[id]; else state.servings[id] = n; save(); const y = scrollY; viewRecipe(id).then(() => scrollTo(0, y)); };
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
      save(); const y = scrollY; viewRecipe(id).then(() => scrollTo(0, y)); toast('Photo saved ♥');
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
    $('#phDel', b).onclick = () => confirmSheet('Delete this photo?', 'It will be removed from this phone.', 'Delete', () => { state.photos[id] = state.photos[id].filter((p) => p.id !== pid); save(); viewRecipe(id); }, true);
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
    if (seen[k]) return; seen[k] = 1;
    const l = levelOf(k);
    rows.push({ k, name: it.pantry.name, cat: it.pantry.cat, l, sel: !it.optional && (!l || l === 'low' || l === 'out') && !onList(k), on: onList(k), opt: it.optional });
  }));
  const lab = { lots: 'Have lots', have: 'Have it', low: 'Running low', out: 'Out' };
  openSheet(`<h2>Add missing to list</h2><p class="sub">Ticked items go on the grocery list. Anything marked "Have it" or "Have lots" in your pantry starts unticked.</p>
    <ul class="checklist" style="margin-top:10px">${rows.map((x, i) => `<li data-x="${i}" class="${x.sel ? 'done' : ''}"><span class="box">${CHECK}</span><span>${esc(x.name)} <span class="note small">${x.on ? '· already on list' : x.l ? '· ' + lab[x.l] : '· not tracked'}${x.opt ? ' · optional' : ''}</span></span></li>`).join('')}</ul>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="addSel">Add to grocery list</button></div>`, (b) => {
    $$('li', b).forEach((li) => (li.onclick = () => { const x = rows[li.dataset.x]; x.sel = !x.sel; li.classList.toggle('done', x.sel); }));
    $('#addSel', b).onclick = () => {
      let n = 0; rows.filter((x) => x.sel).forEach((x) => { if (addGrocery(x.name, x.cat, x.k, r.title)) n++; });
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
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Leftovers in the fridge</b><span>Track lunch portions (eat within 4 days)</span></span><input class="numin" id="cLeft" type="number" inputmode="numeric" min="0" max="10" value="${Math.max(0, (state.servings[s.id] || r.servings || 4) - 2)}"></label>
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Reset the ticks</b><span>Clear ingredient & step checkboxes for next time</span></span><span class="switch"><input type="checkbox" id="cReset" checked><i></i></span></label>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn gold" id="cSave">Add to ${esc(new Date().toLocaleDateString('en-CA', { month: 'long' }))}</button></div>`, (b) => {
    let mode = 'est';
    $$('.chip', b).forEach((c) => (c.onclick = () => { mode = c.dataset.m; $$('.chip', b).forEach((x) => x.classList.toggle('on', x === c)); $('#realF', b).hidden = mode !== 'real'; if (mode === 'real') $('#realAmt', b).focus(); }));
    $('#cSave', b).onclick = () => {
      let amount = e; const real = parseFloat($('#realAmt', b).value);
      if (mode === 'real') { if (!(real >= 0)) { toast('Enter the receipt amount'); return; } amount = Math.round(real * 100) / 100; }
      const id = uid(); const date = $('#cDate', b).value || todayISO();
      state.cooked[id] = { id, recipeId: s.id, title: r.title, date, amount, estimate: mode === 'est', by: state.profile.me, at: now() };
      if ($('#cReset', b).checked) delete state.checks[s.id];
      const lp = parseInt($('#cLeft', b).value, 10); if (lp > 0) { const lid = uid(); state.leftovers[lid] = { id: lid, recipeId: s.id, title: r.title, date, portions: lp }; }
      save(); closeSheet();
      const y = scrollY;
      if (location.hash === '#/r/' + s.id) viewRecipe(s.id).then(() => { scrollTo(0, y); const btn = $('#cookedBtn'); if (btn) heartBurst(btn); });
      const total = monthTotal(date.slice(0, 7));
      toast(`♥ Logged ${money(amount)} · ${monthName(date.slice(0, 7)).split(' ')[0]} is at ${money(total)}`, 'Budget', () => go('#/budget'));
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
function openCook(r, s, f) {
  const el = $('#cook'); let i = 0; let showIngs = false;
  lockScreen().then((ok) => { const a = $('.awake', el); if (a) a.textContent = ok ? 'Screen will stay awake while cooking' : 'Tip: turn off auto-lock while cooking'; });
  const fmt = (sec) => Math.floor(sec / 60) + ':' + pad2(sec % 60);
  const draw = () => {
    const st = r.steps[i];
    const last = i === r.steps.length - 1;
    el.innerHTML = `<div class="ctop"><button class="iconbtn" id="cClose" aria-label="Close">${svg('close')}</button><div class="cstep">STEP ${i + 1} OF ${r.steps.length}</div><button class="iconbtn" id="cIngs" aria-label="Ingredients">${svg('cart')}</button></div>
      <div class="prog">${r.steps.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="cbody">${showIngs ? `<div class="k">INGREDIENTS</div><div class="ings">${r.groups.map((g) => (g.name ? `<div class="k" style="margin-top:12px">${esc(g.name.toUpperCase())}</div>` : '') + g.items.map((it) => `<div>• ${ingLine(it, f, false)}</div>`).join('')).join('')}</div>`
        : `<div class="k">${esc(r.title.toUpperCase())}</div><h2>${esc(st.title)}</h2><p>${esc(st.text)}</p>
        ${st.timer ? `<button class="timer ${cookTimer && cookTimer.step === i ? 'run' : ''}" id="cTimer">${svg('timer')}<span id="cTimerTxt">${cookTimer && cookTimer.step === i ? fmt(cookTimer.left) : 'Start ' + st.timer + ' min timer'}</span></button>` : ''}`}
        ${cookTimer && cookTimer.step !== i ? `<p style="font-size:1rem;margin-top:18px;color:var(--gold-soft)">Timer from step ${cookTimer.step + 1}: <b id="cTimerOther">${fmt(cookTimer.left)}</b></p>` : ''}</div>
      <div class="cnav"><button class="btn" id="cPrev" ${i === 0 ? 'disabled style="opacity:.35"' : ''}>Back</button><button class="btn gold" id="cNext">${last ? 'Done ♥' : 'Next step'}</button></div>
      <div class="awake">${wakeLock ? 'Screen will stay awake while cooking' : ''}</div>`;
    $('#cClose', el).onclick = close;
    $('#cIngs', el).onclick = () => { showIngs = !showIngs; draw(); };
    $('#cPrev', el).onclick = () => { if (i > 0) { i--; showIngs = false; draw(); } };
    $('#cNext', el).onclick = () => {
      const ck = state.checks[s.id] || (state.checks[s.id] = { i: {}, s: {} }); ck.s[i] = 1; save();
      if (last) { close(); toast('Enjoy dinner ♥', 'Mark as cooked', () => $('#cookedBtn') && $('#cookedBtn').click()); } else { i++; showIngs = false; draw(); }
    };
    const tb = $('#cTimer', el);
    if (tb) tb.onclick = () => {
      if (cookTimer && cookTimer.step === i) { clearInterval(cookTimer.h); cookTimer = null; draw(); return; }
      if (cookTimer) clearInterval(cookTimer.h);
      cookTimer = { step: i, left: st.timer * 60, h: setInterval(() => {
        cookTimer.left--;
        const t1 = $('#cTimerTxt'); const t2 = $('#cTimerOther');
        if (t1 && cookTimer.step === i) t1.textContent = fmt(cookTimer.left); if (t2) t2.textContent = fmt(cookTimer.left);
        if (cookTimer.left <= 0) { clearInterval(cookTimer.h); const n = cookTimer.step + 1; cookTimer = null; beep(); toast(`Step ${n} timer done!`); if (!el.hidden) draw(); }
      }, 1000) };
      draw();
    };
  };
  let sx = null;
  el.ontouchstart = (e) => { sx = e.touches[0].clientX; };
  el.ontouchend = (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70) { if (dx < 0 && i < r.steps.length - 1) { i++; draw(); } else if (dx > 0 && i > 0) { i--; draw(); } } };
  function close() { el.hidden = true; if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } if (location.hash === '#/r/' + s.id) viewRecipe(s.id); }
  draw(); el.hidden = false;
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
        return `<div class="prow" data-k="${x.key}"><div class="nm">${esc(x.name)}<small>${used}</small>${['low', 'out'].includes(l) ? (onList(x.key) ? '<span class="addl onlist">✓ On list</span>' : `<button class="addl" data-add="${x.key}">+ Grocery list</button>`) : ''}</div>
          <div class="seg">${LEVELS.map(([lk, short, long]) => `<button data-l="${lk}" class="${l === lk ? 'on' : ''}" aria-label="${long}">${short}</button>`).join('')}</div></div>`;
      }).join('')}</div>`;
    }).join('') || '<div class="empty" style="margin-top:14px">Nothing here.</div>'}
    <div class="sec"><div class="sec-title">Add a pantry item</div>
      <div class="addrow"><input id="pNew" placeholder="e.g. Paper towel, ketchup…" enterkeyhint="done"><button class="btn primary" id="pAdd" aria-label="Add">${svg('plus')}</button></div></div>
  </div>`);
  $$('.chip[data-pf]').forEach((b) => (b.onclick = () => { ui.pantryFilter = b.dataset.pf; viewPantry(); }));
  $$('.prow').forEach((row) => {
    const x = cat[row.dataset.k];
    $$('.seg button', row).forEach((b) => (b.onclick = () => { setLevel(x.key, x.name, x.cat, b.dataset.l); const y = scrollY; viewPantry(); scrollTo(0, y); }));
  });
  $$('[data-add]').forEach((b) => (b.onclick = () => { const x = cat[b.dataset.add]; addGrocery(x.name, x.cat, x.key, 'Pantry'); save(); const y = scrollY; viewPantry(); scrollTo(0, y); toast(`${x.name} added to the list`); }));
  $('#addNeeds') && ($('#addNeeds').onclick = () => { needs.forEach((x) => addGrocery(x.name, x.cat, x.key, 'Pantry')); save(); viewPantry(); toast(`Added ${needs.length} to the grocery list`, 'View', () => go('#/grocery')); });
  const addP = () => { const v = $('#pNew').value.trim(); if (!v) return; const k = pantryKey(v); state.pantry[k] = { name: v, cat: guessCat(v), level: 'have', at: now() }; save(); viewPantry(); toast(`${v} added to pantry`); };
  $('#pAdd').onclick = addP; $('#pNew').onkeydown = (e) => { if (e.key === 'Enter') addP(); };
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
    <div class="addrow"><input id="gNew" placeholder="Add an item…" enterkeyhint="done" autocomplete="off"><button class="btn primary" id="gAdd" aria-label="Add">${svg('plus')}</button>
      <select id="gCat" aria-label="Aisle"><option value="">Aisle: auto</option>${PANTRY_CATS.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
    ${items.length ? PANTRY_CATS.map(([ck, cn]) => {
      const rows = items.filter((g) => (PCAT[g.cat] ? g.cat : 'other') === ck).sort((a, b) => a.checked - b.checked || a.name.localeCompare(b.name));
      if (!rows.length) return '';
      return `<div class="pgroup"><div class="gh">${esc(cn)}<span>${rows.filter((g) => !g.checked).length} left</span></div><ul class="checklist glist">${rows.map((g) => `<li data-g="${g.id}" class="${g.checked ? 'done' : ''}"><span class="box">${CHECK}</span><span class="txt">${esc(g.name)}${g.from ? `<span class="from">for ${esc(g.from)}</span>` : ''}</span><button class="del" data-del="${g.id}" aria-label="Remove">×</button></li>`).join('')}</ul></div>`;
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
    if (g.checked) { const p = state.pantry[g.key] || { name: g.name, cat: g.cat }; state.pantry[g.key] = { ...p, level: 'have', at: now() }; }
    save(); li.classList.toggle('done', g.checked);
    const y = scrollY; setTimeout(() => { viewGrocery(); scrollTo(0, y); }, 250);
  }));
  $$('[data-del]').forEach((b) => (b.onclick = () => { const g = state.grocery[b.dataset.del]; delete state.grocery[b.dataset.del]; save(); viewGrocery(); toast(`Removed ${g.name}`, 'Undo', () => { state.grocery[g.id] = g; save(); viewGrocery(); }); }));
  $('#gClear') && ($('#gClear').onclick = () => { const bak = { ...state.grocery }; Object.values(state.grocery).forEach((g) => { if (g.checked) delete state.grocery[g.id]; }); save(); viewGrocery(); toast('Cleared checked items', 'Undo', () => { state.grocery = bak; save(); viewGrocery(); }); });
  $('#gAll') && ($('#gAll').onclick = () => confirmSheet('Clear the whole list?', 'This removes every item, checked or not.', 'Clear all', () => { state.grocery = {}; save(); viewGrocery(); }, true));
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
  render(`<div class="wrap">
    <div class="kicker">Dinner money<span class="rule"></span></div>
    <div class="monthnav"><button id="mPrev" aria-label="Previous month">${svg('chevL')}</button><div class="m">${esc(monthName(key).toUpperCase())}</div><button id="mNext" aria-label="Next month" ${isNow ? 'disabled style="opacity:.3"' : ''}>${svg('chevR')}</button></div>
    <div class="bigtotal"><div class="lbl">SPENT ON DINNERS</div><div class="amt">${money(total, total % 1 !== 0)}<small>of ${money(lo)}–${money(hi)}</small></div>
      <div class="bar"><div class="fill ${total > hi ? 'over' : ''}" style="width:${pct(total)}%"></div><div class="band" style="left:${pct(lo)}%;width:${pct(hi) - pct(lo)}%"></div></div>
      <div class="barlbl"><span>$0</span><span>target ${money(lo)}–${money(hi)}</span></div>
      <p>${esc(msg)}</p></div>
    <div class="sec"><div class="sec-title">Cooked this month<button class="act" id="addOther">+ Add other</button></div>
      ${entries.length ? `<ul class="cooked">${entries.map((c) => `<li><div><div class="t">${esc(c.title)}</div><div class="d">${esc(shortDate(c.date))}${c.estimate ? '<span class="est">estimate</span>' : '<span class="est">receipt</span>'}${c.by ? ' · ' + esc(c.by) : ''}</div></div><button class="a" data-e="${c.id}">${money(c.amount, true)}</button></li>`).join('')}</ul>` : '<div class="empty">No dinners logged yet.</div>'}
    </div>
    <div class="sec"><div class="sec-title">Us, so far</div>
      <div class="statgrid"><div class="s"><b>${all.length}</b><span>Meals cooked</span></div><div class="s"><b>${entries.length}</b><span>This month</span></div>
        <div class="s"><b>${all.length ? money(avg, true) : '—'}</b><span>Avg per dinner</span></div><div class="s"><b>${money(saved)}</b><span>Saved vs takeout</span></div>
        <div class="s"><b>${all.filter((c) => c.by === 'Corey').length} · ${all.filter((c) => c.by === 'Faith').length}</b><span>Corey · Faith cooked</span></div><div class="s"><b>${Object.values(state.picks).filter((p) => p.ok).length}<span style="color:var(--gold-soft)">/${Object.values(state.picks).length}</span></b><span>Tonight's picks 👍</span></div>
        <div class="s wide" style="grid-column:1/-1;background:var(--tile2)"><b>${esc(mostName)}${most ? ` <span style="color:var(--gold-soft)">×${most[1]}</span>` : ''}</b><span>Most made</span></div></div>
      <p class="small muted" style="margin-top:8px">“Saved vs takeout” compares each dinner with a ${money(takeoutCost)} takeout order for two (change it in Settings).</p>
    </div></div>`);
  $('#mPrev').onclick = () => { const [y, m] = key.split('-').map(Number); ui.budgetMonth = monthKey(new Date(y, m - 2, 1)); viewBudget(); };
  $('#mNext').onclick = () => { if (isNow) return; const [y, m] = key.split('-').map(Number); ui.budgetMonth = monthKey(new Date(y, m, 1)); viewBudget(); };
  $$('[data-e]').forEach((b) => (b.onclick = () => editEntry(state.cooked[b.dataset.e])));
  $('#addOther').onclick = () => editEntry(null);
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
    </div>
    <div class="setgroup"><div class="sec-title">This phone</div>
      <div class="setrow"><span class="l"><b>Whose phone is this?</b><span>Used to note who cooked (and for sharing later)</span></span></div>
      <div class="segtext" style="grid-template-columns:1fr 1fr" id="meSeg">${['Corey', 'Faith'].map((n) => `<button data-me="${n}" class="${state.profile.me === n ? 'on' : ''}">${n}</button>`).join('')}</div>
      <div class="setrow"><span class="l"><b>Our anniversary</b><span>For the ♥ Us page</span></span><input class="numin" id="anniv" type="date" style="width:auto" value="${esc(st.anniversary || '')}"></div>
    </div>
    <div class="setgroup"><div class="sec-title">Budget</div>
      <div class="setrow"><span class="l"><b>Monthly target</b><span>Dinner spending range</span></span><span style="display:flex;gap:6px;align-items:center"><input class="numin" id="bLo" type="number" inputmode="numeric" value="${st.budgetMin}"> – <input class="numin" id="bHi" type="number" inputmode="numeric" value="${st.budgetMax}"></span></div>
      <div class="setrow"><span class="l"><b>Takeout for two</b><span>For the “saved vs takeout” stat</span></span><input class="numin" id="tko" type="number" inputmode="numeric" value="${st.takeoutCost}"></div>
    </div>
    <div class="setgroup"><div class="sec-title">Our own recipes</div>
      ${custom.length ? custom.map((r) => `<div class="setrow"><span class="l"><b>${esc(r.title)}</b><span>${esc(catOf(r.category).name)} ${pad2(r.num)}</span></span><a class="btn sm ghost" href="#/r/${r.id}">Open</a></div>`).join('') : '<p class="small muted">Recipes you add yourself show up here and in the book.</p>'}
      <a class="btn ghost block" href="#/add" style="margin-top:10px">${svg('plus')}Add a recipe</a>
    </div>
    <div class="setgroup"><div class="sec-title">Hidden meals</div>
      ${hidden.length ? hidden.map((r) => `<div class="setrow"><span class="l"><b>${esc(r.title)}</b><span>${esc(recipeLabel(r))}</span></span><button class="btn sm ghost" data-unhide="${r.id}">Unhide</button></div>`).join('') : '<p class="small muted">Nothing hidden. Use “Hide meal” on a recipe to tuck it away.</p>'}
    </div>
    <div class="setgroup"><div class="sec-title">Backup</div>
      <p class="small muted">Everything is saved on this phone. Export a backup now and then (or to move to a new phone).</p>
      <div class="btnrow" style="margin-top:10px"><button class="btn ghost" id="exp">${svg('share')}Export</button><label class="btn ghost" style="cursor:pointer">${svg('reset')}Restore<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
    </div>
    <div class="setgroup"><div class="sec-title">More</div>
      <div class="setrow"><span class="l"><b>Show the welcome screen</b></span><button class="btn sm ghost" id="showW">Show</button></div>
      <div class="setrow"><span class="l"><b>Reset everything</b><span>Favourites, pantry, list, budget, ticks — all of it</span></span><button class="btn sm danger" id="resetAll">Reset</button></div>
      <p class="small muted" style="margin-top:14px">Our Kitchen · Corey ♥ Faith · ${INDEX.recipes.length} recipes · works offline. Shared sync between our phones is planned for later.</p>
    </div></div>`);
  $$('#themeSeg button').forEach((b) => (b.onclick = () => { st.theme = b.dataset.t; save(); applyTheme(); viewSettings(); }));
  $('#bigT').onchange = (e) => { st.bigText = e.target.checked; save(); applyTheme(); };
  $$('#meSeg button').forEach((b) => (b.onclick = () => { state.profile.me = b.dataset.me; save(); viewSettings(); }));
  const num = (id, k) => ($(id).onchange = (e) => { const v = parseFloat(e.target.value); if (v > 0) { st[k] = v; save(); toast('Saved'); } });
  $('#anniv').onchange = (e) => { st.anniversary = e.target.value; save(); toast('Saved ♥'); };
  num('#bLo', 'budgetMin'); num('#bHi', 'budgetMax'); num('#tko', 'takeoutCost');
  $$('[data-unhide]').forEach((b) => (b.onclick = () => { delete state.hidden[b.dataset.unhide]; save(); viewSettings(); toast('Back in the book'); }));
  $('#exp').onclick = exportBackup;
  $('#imp').onchange = (e) => importBackup(e.target.files[0]);
  $('#showW').onclick = showWelcome;
  $('#resetAll').onclick = () => confirmSheet('Reset everything?', 'This wipes favourites, pantry levels, the grocery list, the budget log and your own recipes on this phone. Export a backup first if you might want it back.', 'Reset everything', () => {
    const keepTheme = state.settings.theme; state = DEFAULT_STATE(); state.settings.theme = keepTheme; state.settings.welcomed = true; save(); applyTheme(); go('#/'); toast('Fresh start');
  }, true);
}
function downloadFile(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(() => {}); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function exportBackup() { downloadFile(`our-kitchen-backup-${todayISO()}.json`, JSON.stringify({ app: 'our-kitchen', exportedAt: new Date().toISOString(), state }, null, 1)); }
function importBackup(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result); const s = data.state || data;
      if (!s || s.v !== 1 || typeof s.settings !== 'object') throw new Error('bad');
      confirmSheet('Restore this backup?', `From ${data.exportedAt ? new Date(data.exportedAt).toLocaleString('en-CA') : 'a backup file'}. It replaces what's on this phone now.`, 'Restore', () => {
        const d = DEFAULT_STATE(); state = { ...d, ...s, settings: { ...d.settings, ...s.settings } }; save(); applyTheme(); go('#/'); router(); toast('Backup restored ♥');
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
function viewAdd(editId) {
  const ed = editId ? state.custom[editId] : null;
  setTop({ title: ed ? 'EDIT RECIPE' : 'ADD A RECIPE', back: ed ? '#/r/' + editId : '#/' });
  const tags = (ed && ed.tags) || {};
  const ingText = ed ? ed.groups.map((g) => (g.name ? g.name + ':\n' : '') + g.items.map((it) => [it.qty != null ? fmtQty(it.qty, it.unit) : '', it.name + (it.note ? ', ' + it.note : '')].filter(Boolean).join(' ')).join('\n')).join('\n') : '';
  const stepText = ed ? ed.steps.map((s) => s.title + ': ' + s.text).join('\n') : '';
  const chipGroup = (g) => `<div class="field"><label>${g.label}</label><div class="chips">${g.opts.map((o) => `<button type="button" class="chip ${(tags[g.key] || []).includes(o[0]) ? 'on' : ''}" data-k="${g.key}" data-v="${o[0]}">${esc(o[1])}</button>`).join('')}</div></div>`;
  render(`<div class="wrap"><div class="kicker">Our own<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">${ed ? 'Edit recipe' : 'Add a recipe'}</h1>
    <p class="lead" style="margin-top:4px">It goes into the book with the next number in its category.</p>
    <div id="dislike"></div>
    <div class="field"><label>Name</label><input id="aT" value="${esc(ed ? ed.title : '')}" placeholder="e.g. Garlic Butter Steak Bites"></div>
    <div class="field"><label>Short description</label><input id="aS" value="${esc(ed ? ed.subtitle : '')}" placeholder="with cheesy mashed potatoes"></div>
    <div class="field"><label>Category</label><select id="aC">${INDEX.categories.map((c) => `<option value="${c.slug}" ${ed && ed.category === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
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
  $('#aDel') && ($('#aDel').onclick = () => confirmSheet('Delete this recipe?', ed.title, 'Delete', () => { delete state.custom[editId]; save(); go('#/'); }, true));
  $('#aSave').onclick = () => {
    const title = $('#aT').value.trim(); if (!title) { toast('Give it a name'); return; }
    const groups = parseIngredients($('#aI').value); const steps = parseSteps($('#aSt').value);
    if (!groups.length || !steps.length) { toast('Add at least one ingredient and one step'); return; }
    const doSave = () => {
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
  const all = Object.values(state.cooked);
  const favs = Object.keys(state.favourites).map(summary).filter(Boolean);
  const photos = Object.entries(state.photos).flatMap(([rid, ps]) => ps.map((p) => ({ ...p, rid }))).sort((x, y) => (x.date < y.date ? 1 : -1));
  const rated = Object.entries(state.ratings).filter(([, v]) => v).map(([rid, v]) => ({ r: summary(rid), v })).filter((x) => x.r).sort((x, y) => y.v - x.v);
  render(`<div class="wrap"><div class="kicker">Corey ♥ Faith<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Us</h1>
    <div class="sec">${together}</div>
    <div class="sec"><div class="statgrid"><div class="s"><b>${all.length}</b><span>Dinners together</span></div><div class="s"><b>${favs.length}</b><span>Favourites</span></div>
      <div class="s"><b>${photos.length}</b><span>Photo memories</span></div><div class="s"><b>${Object.values(state.picks).filter((p) => p.ok).length}</b><span>Picks we said yes to</span></div></div></div>
    <div class="sec"><div class="sec-title">Our favourites</div>${favs.length ? `<div class="hrow">${favs.map(miniCard).join('')}</div>` : '<div class="empty">Heart a recipe and it shows up here.</div>'}</div>
    ${rated.length ? `<div class="sec"><div class="sec-title">Top rated</div><ul class="cooked">${rated.map((x) => `<li><div><a class="t" href="#/r/${x.r.id}">${esc(x.r.title)}</a></div><span class="amt" style="color:var(--gold)">${'♥'.repeat(x.v)}</span></li>`).join('')}</ul></div>` : ''}
    <div class="sec"><div class="sec-title">Photo memories</div>${photos.length ? `<div class="photos">${photos.map((p) => `<a class="ph" href="#/r/${p.rid}"><img src="${p.data}" alt=""><span>${esc(shortDate(p.date))}</span></a>`).join('')}</div>` : '<div class="empty">Add a photo from any recipe page after you cook it.</div>'}</div>
  </div>`);
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
    $('#wGo', w).onclick = () => { state.profile.me = me; state.settings.welcomed = true; save(); w.hidden = true; router(); };
  };
  draw(); w.hidden = false;
}

// ---------------------------------------------------------------- boot
async function boot() {
  applyTheme();
  updateBadge();
  const t0 = performance.now();
  try { await loadIndex(); } catch (e) { render('<div class="wrap"><div class="empty">Could not load recipes. Check your connection and reopen the app.</div></div>'); }
  await router();
  if (!state.settings.welcomed) showWelcome();
  const wait = Math.max(0, 1200 - (performance.now() - t0));
  setTimeout(() => { $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 700); }, wait);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
}
window.OK_DEBUG = { get state() { return state; }, set state(v) { state = v; save(); } };
boot();
})();
