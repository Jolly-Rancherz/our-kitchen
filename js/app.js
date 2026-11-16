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
const PLURAL = { cup: 'cups', clove: 'cloves', crown: 'crowns', slice: 'slices', can: 'cans', head: 'heads', bunch: 'bunches', package: 'packages', jar: 'jars', strip: 'strips' };
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
    units: 'both', temp: 'both', snow: true, hearts: true, haptics: true, autoRestock: true, lastBackup: null, backupSnooze: null, cook: {},
    // update 3 (added fields only)
    sounds: false, chime: 'classic', shake: false, playlist: '', dinnerAt: '18:30', seasonal: true },
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
  // update 3 (added collections only — nothing above changes shape)
  favBy: {},           // recipeId -> { Corey: ts, Faith: ts } (who loves it)
  tonight: null,       // { date, recipeId, by, eatAt, at }
  nicknames: {},       // recipeId -> our name for it
  signature: null,     // recipeId of our signature dish
  dateNight: null,     // { date, time, recipeId, note, by, at }
  dessertJar: {},      // id -> { id, text, by, date, at, made }
  tasteTests: {},      // id -> { id, recipeId, date, guesses: {Corey, Faith}, result, at }
  dishes: {},          // id -> { id, date, who, at } (coin flips)
  flashSeen: {},       // date -> ts
  annivSeen: {},       // year -> ts
  groceryDate: null,   // { on, start, split: { itemId: name } }
  acura: { favs: {}, baked: {}, notes: {}, ratings: {}, profile: {}, given: {} }, // dog treats — kept apart from our pantry & budget
});
let state = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (raw && raw.v === 1) {
      const d = DEFAULT_STATE();
      const st = { ...d, ...raw, settings: { ...d.settings, ...raw.settings }, profile: { ...d.profile, ...raw.profile } };
      ['loveNotes', 'stories', 'freezer', 'wish', 'prices', 'guests', 'edits', 'versions', 'milestones', 'recapSeen', 'favBy', 'nicknames', 'dessertJar', 'tasteTests', 'dishes', 'flashSeen', 'annivSeen'].forEach((k) => { if (!st[k] || typeof st[k] !== 'object') st[k] = {}; });
      if (!st.acura || typeof st.acura !== 'object') st.acura = d.acura;
      ['favs', 'baked', 'notes', 'ratings', 'profile', 'given'].forEach((k) => { if (!st.acura[k] || typeof st.acura[k] !== 'object') st.acura[k] = {}; });
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
  if (action) { $('button', t).onclick = () => { lastUndo = null; fn(); t.classList.remove('show'); }; if (action === 'Undo') lastUndo = { fn, at: now() }; }
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 5000 : 2600);
}
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
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = document.body && document.body.classList.contains('acura') ? (dark ? '#170D08' : '#4A2A1A') : dark ? '#060F26' : '#082048';
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
  [/^#\/year(?:\/(\d{4}))?$/, viewYear],
  [/^#\/acura$/, viewAcura],
  [/^#\/acura\/t\/([\w-]+)$/, viewTreat],
  [/^#\/acura\/safety$/, viewAcuraSafety],
  [/^#\/scan$/, () => { go('#/grocery'); setTimeout(openScan, 300); }],
  [/^#\/ideas$/, () => { go('#/'); setTimeout(() => openIdeas(), 300); }],
];
window.addEventListener('hashchange', router);

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
  if (s && !RECIPE_CACHE[id] && !state.custom[id]) render(skeletonRecipe(s));
  const r = s && (await getRecipe(id));
  if (location.hash !== '#/r/' + id) return;
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
  if (state.signature === id) pills.unshift('<span class="pill sig">★ Signature</span>');
  if (isCoupleFav(id)) pills.unshift(`<span class="pill cfav">${svg('heart')}Our favourite</span>`);
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
  const planned = !!(tonightPlan() && tonightPlan().recipeId === id); const first = cooked[cooked.length - 1]; const hs = heartsScore(id); const lw = favWho(id); const pend = pendingTaste(id);
  const { budgetMin, budgetMax } = state.settings;

  render(`
  <div class="r-head">
    <div class="kicker"><span class="sw" style="background:${c.colour}"></span>${esc(c.name)} ${pad2(s.num)}<span class="rule"></span></div>
    <h1 class="h1">${esc(r.title)}</h1>
    ${r.subtitle ? `<p class="lead">${esc(r.subtitle)}</p>` : ''}${nickLine(id)}
    <div class="pills">${pills.join('')}</div>
  </div>
  <div class="hero"><div class="tile">${r.image ? img(r.image, r.imageAlt || r.title) : placeholderArt(s)}</div><i class="acc a1"></i><i class="acc a2"></i><i class="acc a3"></i></div>
  <div class="stats"><div class="stat"><b>${r.prep} min</b><span>Prep</span></div><div class="stat plum"><b>${r.cook} min</b><span>Cook</span></div><div class="stat peri"><b>${r.prep + r.cook} min</b><span>Total</span></div></div>
  <div class="serves"><strong>${guests ? `Guest mode · ${guests} people` : esc(sv === base && r.servingsNote ? r.servingsNote : sv + ' servings')}</strong><span class="muted">Est. ~${money(per, true)} a portion</span></div>
  <div class="plan"><button class="chip" id="startBy">${svg('clock')}Start cooking by…</button><button class="chip ${guests ? 'on' : ''}" id="guestBtn">${svg('users')}${guests ? guests + ' people' : 'Guests'}</button>${!cooked.length || pend ? `<button class="chip ${pend ? 'on' : ''}" id="tasteChip">${svg('thumbUp')}${pend ? 'Taste test on' : 'Taste test'}</button>` : ''}</div>

  <div class="wrap">
    ${haveCard(r)}
    ${love ? `<button class="lovenote" id="loveShow"><span class="lk">${svg('heart')}A NOTE${love.by ? ' FROM ' + esc(love.by.toUpperCase()) : ''}</span><span class="lt">${esc(love.text)}</span></button>` : ''}
    ${r.family ? `<div class="card famcard"><h3>THE STORY</h3><p>${esc(story || 'Tap to add the story behind this one.')}</p><button class="linkbtn" id="storyEdit">Edit the story</button></div>` : ''}
    ${(r.beforeYouStart || []).length || (r.gear || []).length ? `<div class="card before"><h3>BEFORE YOU START</h3><ul>${(r.beforeYouStart || []).map((b) => `<li><span class="ic">${svg(b.icon)}</span><span>${tx(b.text)}</span></li>`).join('')}</ul>
      ${(r.gear || []).length ? `<details class="gear"><summary>Gear you'll need (${r.gear.length})</summary><ul>${r.gear.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></details>` : ''}</div>` : ''}

    <div class="sec"><div class="sec-title">Ingredients<button class="act" id="resetBtn">Reset ticks</button><button class="act unitbtn" id="unitBtn" aria-label="Units">${units === 'metric' ? 'grams' : units === 'us' ? 'cups' : 'cups + g'}</button></div>
      <div class="portion"><div class="val" id="svVal">${sv}</div><input type="range" id="sv" min="1" max="10" step="1" value="${sv}" style="--p:${((sv - 1) / 9) * 100}%" aria-label="Servings"><div class="lbl">servings<br>${sv === base ? 'as written' : '× ' + (Math.round(f * 100) / 100)}</div></div>
      ${r.groups.map((g, gi) => `<div class="ing-group">${g.name ? `<div class="group-name">${esc(g.name)}</div>` : ''}<ul class="checklist">
        ${g.items.map((it, ii) => `<li data-i="${gi}-${ii}" class="${ck.i[gi + '-' + ii] ? 'done' : ''} ${subBtn(it) || outBtn(it) ? 'hasbtn' : ''}"><span class="box">${CHECK}</span><span class="txt">${ingLine(it, f)}</span>${subBtn(it) || outBtn(it) ? `<span class="ibtns">${subBtn(it)}${outBtn(it)}</span>` : ''}</li>`).join('')}</ul></div>`).join('')}
      <button class="btn ghost block" id="missingBtn" style="margin-top:12px">${svg('cart')}Add to grocery list</button>
    </div>

    <div class="sec"><div class="sec-title">Method</div>
      <button class="btn primary block" id="cookBtn">${svg('play')}Step-by-step cook mode</button>
      <ul class="checklist steps" style="margin-top:8px">${r.steps.map((st, si) => `<li data-s="${si}" class="${ck.s[si] ? 'done' : ''}"><span class="stepnum"><span>${si + 1}</span>${CHECK}</span><span class="txt"><strong>${esc(st.title)}.</strong> ${tx(st.text)}${useChips(r, st, id, f)}${st.timer ? `<span class="tm">${svg('timer', 'style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2"')}${st.timer} min</span>` : ''}</span></li>`).join('')}</ul>
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
        <div class="rate-row"><span class="small muted">Who loves it</span><div class="loves">${['Corey', 'Faith'].map((n) => `<button data-love="${n}" class="${lw[n] ? 'on' : ''}" aria-label="${n} loves it" aria-pressed="${!!lw[n]}">${hat(n, 20)}<span>${n}</span></button>`).join('')}</div></div>
        ${hs ? `<div class="rate-row together"><span class="small muted">Rated together</span><span class="tscore"><b>${r1(hs.score)}</b>${svg('heart')}<small>${hs.corey != null ? 'Corey ' + r1(hs.corey) : ''}${hs.corey != null && hs.faith != null ? ' · ' : ''}${hs.faith != null ? 'Faith ' + r1(hs.faith) : ''}</small></span></div>` : ''}
        <textarea id="noteTx" class="notes" placeholder="e.g. Extra cheddar next time. Faith likes it thicker.">${esc(state.notes[id] || '')}</textarea>
        <button class="linkbtn lovebtn" id="loveBtn">${svg('heart')}${love ? 'Edit the love note' : 'Leave a love note'}</button>
        <div class="small muted" style="margin:12px 0 6px">Photo memories</div>
        <div class="photos">${(state.photos[id] || []).map((ph) => `<button class="ph" data-ph="${ph.id}"><img src="${ph.data}" alt="Our photo from ${esc(ph.date)}">${stampHTML(ph, true)}<span>${esc(shortDate(ph.date))}</span></button>`).join('')}
          <label class="ph add">${svg('plus')}<span>Add photo</span><input type="file" id="phIn" accept="image/*" hidden></label></div>
      </div></div>

    <div class="sec r-actions">
      <button class="btn gold block" id="cookedBtn">${svg('check')}Mark as cooked</button>
      <div class="btnrow"><button class="btn ghost" id="cravBtn">${svg('heart')}Cook for me?</button><button class="btn ghost ${planned ? 'on' : ''}" id="tonightBtn">${svg('clock')}${planned ? 'Tonight ✓' : 'Plan tonight'}</button></div>
      <div class="btnrow"><button class="btn ghost" id="shareBtn">${svg('share')}Share</button><button class="btn ghost" id="moreBtn">${svg('more')}More…</button></div>
      ${state.versions[id] ? `<p class="small muted" style="text-align:center">${r.edited || r.custom ? 'Edited recipe' : 'Original recipe'} · <button class="linkbtn" id="verBtn">Switch to the ${state.versions[id].prev.base ? 'original' : 'other'} version</button></p>` : ''}
      <p class="small muted cookline">${cooked.length ? `${hat(cooked[0].by, 15)}Cooked ${cooked.length} time${cooked.length === 1 ? '' : 's'} · last ${esc(shortDate(cooked[0].date))}${cooked[0].by ? ' by ' + esc(cooked[0].by === 'Both' ? 'both of you' : cooked[0].by) : ''}` : 'Not cooked yet — first time!'}</p>
      ${first ? `<p class="memory">${svg('heart')}First made ${first.by === 'Corey' || first.by === 'Faith' ? 'by ' + esc(first.by) : 'together'} · ${esc(longDate(first.date))}</p>` : ''}
      ${lastReact ? `<p class="small muted" style="text-align:center;margin-top:-4px">Last time: ${esc(reactLine(lastReact))}</p>` : ''}
    </div>
  </div>`);

  $('#favBtn').onclick = (e) => { toggleFav(id, e.currentTarget); e.currentTarget.classList.toggle('on', !!state.favourites[id]); };
  $$('.checklist li[data-i]').forEach((li) => (li.onclick = (e) => {
    if (e.target.closest('.outbtn')) { const [gi, ii] = li.dataset.i.split('-').map(Number); weAreOut(r.groups[gi].items[ii], r, f, e.target.closest('.outbtn')); return; }
    if (e.target.closest('.subbtn')) { const [gi, ii] = li.dataset.i.split('-').map(Number); openSub(r.groups[gi].items[ii]); return; }
    toggleCheck(id, 'i', li.dataset.i, li);
  }));
  $$('.checklist li[data-s]').forEach((li) => (li.onclick = (e) => { if (e.target.closest('.use')) return; toggleCheck(id, 's', li.dataset.s, li); }));
  $('#resetBtn').onclick = () => withUndo('Ticks reset', () => { delete state.checks[id]; }, () => $$('.checklist li.done').forEach((li) => li.classList.remove('done')));
  $('#unitBtn').onclick = () => { const order = ['both', 'us', 'metric']; state.settings.units = order[(order.indexOf(state.settings.units || 'both') + 1) % 3]; save(); viewRecipe(id); toast(state.settings.units === 'metric' ? 'Showing grams first' : state.settings.units === 'us' ? 'Showing cups & spoons only' : 'Showing cups with grams'); };
  $('#startBy').onclick = () => openStartBy(r);
  $('#guestBtn').onclick = () => openGuests(r, id);
  $('#loveBtn').onclick = () => openLoveNote(id, r);
  $('#loveShow') && ($('#loveShow').onclick = () => openLoveNote(id, r));
  $('#storyEdit') && ($('#storyEdit').onclick = () => openStory(id, r));
  $('#verBtn') && ($('#verBtn').onclick = () => swapVersion(id));
  const range = $('#sv');
  range.oninput = () => { $('#svVal').textContent = range.value; range.style.setProperty('--p', ((range.value - 1) / 9) * 100 + '%'); };
  range.onchange = () => { const n = +range.value; delete state.guests[id]; if (n === base) delete state.servings[id]; else state.servings[id] = n; save(); viewRecipe(id); };
  $('#missingBtn').onclick = () => openMissing(r, s, f);
  $('#cookBtn').onclick = () => openCook(r, s, f);
  $('#cookedBtn').onclick = () => openCooked(r, s, cost);
  $('#shareBtn').onclick = () => openShare(r, s, f, sv);
  $$('#rate button').forEach((b) => (b.onclick = () => { const n = +b.dataset.r; state.ratings[id] = state.ratings[id] === n ? 0 : n; save(); $$('#rate button').forEach((x) => x.classList.toggle('on', +x.dataset.r <= state.ratings[id])); if (state.ratings[id]) heartBurst(b); }));
  let nt; $('#noteTx').oninput = (e) => { clearTimeout(nt); nt = setTimeout(() => { const v = e.target.value.trim(); if (v) state.notes[id] = v; else delete state.notes[id]; save(); }, 400); };
  $('#phIn').onchange = (e) => addPhoto(id, e.target.files[0]);
  $$('[data-ph]').forEach((b) => (b.onclick = () => viewPhoto(id, b.dataset.ph)));
  bindRecipeExtras(r, s, id, f, cost);
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
      save(); viewRecipe(id); toast('Photo saved ♥'); checkMilestones();
    };
    im.onerror = () => toast("Couldn't read that photo");
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
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
  openSheet(`<h2>Mark as cooked</h2><p class="sub" id="cSub">${esc(r.title)} goes into this month's dinner total.</p>
    <div class="rcnote" id="rcNote" hidden><b>Counted in your receipts</b><span>You've scanned a grocery receipt this month, so this dinner is logged without adding its cost again.</span>
      <label class="setrow" style="border:0;padding:8px 0 0"><span class="l"><b>Add the cost anyway</b><span>Only if these groceries weren't on a scanned receipt</span></span><span class="switch"><input type="checkbox" id="cAdd"><i></i></span></label></div>
    <div id="costBox"><div class="chips" style="margin-top:14px"><button class="chip on" data-m="est">Use estimate · ${money(e)}</button><button class="chip" data-m="real">Enter receipt amount</button></div>
    <div class="field" id="realF" hidden><label>Actual amount (CAD)</label><input id="realAmt" type="number" inputmode="decimal" step="0.01" min="0" placeholder="${e}"></div></div>
    <div class="field"><label>Date</label><input id="cDate" type="date" value="${todayISO()}"></div>
    <div class="field"><label>Who cooked?</label><div class="segtext" id="cWho" style="grid-template-columns:repeat(3,1fr)">${['Corey', 'Faith', 'Both'].map((n) => `<button type="button" data-who="${n}" class="${(state.profile.me || 'Both') === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="field"><label>Rate it together <span class="muted small">(optional)</span></label>${heartsPicker({})}</div>
    ${pendingTaste(s.id) ? `<div class="field"><label>Taste test — was it a hit?</label><div class="segtext" id="cTT" style="grid-template-columns:1fr 1fr"><button type="button" data-tt="hit">Hit</button><button type="button" data-tt="miss">Miss</button></div></div>` : ''}
    <details class="reactbox"><summary>Quick reactions <span class="muted small">(optional)</span></summary>${reactPicker({})}</details>
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Leftovers in the fridge</b><span>Track lunch portions (eat within 4 days)</span></span><input class="numin" id="cLeft" type="number" inputmode="numeric" min="0" max="10" value="${Math.max(0, (state.servings[s.id] || r.servings || 4) - 2)}"></label>
    <label class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Reset the ticks</b><span>Clear ingredient & step checkboxes for next time</span></span><span class="switch"><input type="checkbox" id="cReset" checked><i></i></span></label>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn gold" id="cSave">Add to ${esc(new Date().toLocaleDateString('en-CA', { month: 'long' }))}</button></div>`, (b) => {
    let mode = 'est'; let who = state.profile.me || 'Both'; const reacts = {};
    bindReact(b, reacts);
    const hearts = {}; bindHearts(b, hearts); let ttRes = null;
    $$('#cTT button', b).forEach((x) => (x.onclick = () => { ttRes = x.dataset.tt; $$('#cTT button', b).forEach((y) => y.classList.toggle('on', y === x)); }));
    let inRc = false;
    const syncRc = () => { inRc = monthHasReceipt(($('#cDate', b).value || todayISO()).slice(0, 7)); $('#rcNote', b).hidden = !inRc; $('#costBox', b).hidden = inRc && !$('#cAdd', b).checked; $('#cSub', b).textContent = inRc && !$('#cAdd', b).checked ? `${r.title} goes into your story and stats.` : `${r.title} goes into this month's dinner total.`; };
    $('#cDate', b).onchange = syncRc; $('#cAdd', b).onchange = syncRc; syncRc();
    $$('#cWho button', b).forEach((x) => (x.onclick = () => { who = x.dataset.who; $$('#cWho button', b).forEach((y) => y.classList.toggle('on', y === x)); }));
    $$('.chip', b).forEach((c) => (c.onclick = () => { mode = c.dataset.m; $$('.chip', b).forEach((x) => x.classList.toggle('on', x === c)); $('#realF', b).hidden = mode !== 'real'; if (mode === 'real') $('#realAmt', b).focus(); }));
    $('#cSave', b).onclick = () => {
      let amount = e; const real = parseFloat($('#realAmt', b).value);
      if (mode === 'real') { if (!(real >= 0)) { toast('Enter the receipt amount'); return; } amount = Math.round(real * 100) / 100; }
      const id = uid(); const date = $('#cDate', b).value || todayISO();
      const firstTime = !cookedEntries(s.id).length;
      const skip = monthHasReceipt(date.slice(0, 7)) && !$('#cAdd', b).checked;
      state.cooked[id] = skip ? { id, recipeId: s.id, title: r.title, date, amount: 0, estimate: false, inReceipts: true, est: e, by: who, at: now() }
        : { id, recipeId: s.id, title: r.title, date, amount, estimate: mode === 'est', by: who, at: now() };
      const rx = Object.fromEntries(Object.entries(reacts).filter(([, v]) => v)); if (Object.keys(rx).length) state.cooked[id].reactions = rx;
      const hz = Object.fromEntries(Object.entries(hearts).filter(([, v]) => v)); if (Object.keys(hz).length) state.cooked[id].hearts = hz;
      const pt = pendingTaste(s.id); let note = null;
      if (pt && ttRes) { pt.result = ttRes; pt.resolvedAt = now(); const right = ['Corey', 'Faith'].filter((n) => pt.guesses[n] === ttRes); note = right.length === 2 ? 'Taste test: you both called it ♥' : right.length ? `Taste test: ${right[0]} called it! +1` : 'Taste test: nobody saw that coming 😄'; }
      if ($('#cReset', b).checked) delete state.checks[s.id];
      const lp = parseInt($('#cLeft', b).value, 10); if (lp > 0) { const lid = uid(); state.leftovers[lid] = { id: lid, recipeId: s.id, title: r.title, date, portions: lp }; }
      save(); closeSheet();
      if (location.hash === '#/r/' + s.id) viewRecipe(s.id).then(() => { const btn = $('#cookedBtn'); if (btn) heartBurst(btn); });
      const total = monthTotal(date.slice(0, 7));
      toast(skip ? '♥ Logged · counted in your receipts' : `♥ Logged ${money(amount)} · ${monthName(date.slice(0, 7)).split(' ')[0]} is at ${money(total)}`, 'Budget', () => go('#/budget'));
      checkMilestones();
      afterCooked(s.id, firstTime, note);
    };
  });
}
function monthHasReceipt(key) { return Object.values(state.cooked).some((c) => c.receipt && String(c.date || '').startsWith(key)); }
const mealCost = (c) => (c.inReceipts ? Number(c.est || 0) : Number(c.amount || 0)); // stats only; spending uses amount
function monthTotal(key) { return Object.values(state.cooked).filter((c) => c.date.startsWith(key)).reduce((a, c) => a + Number(c.amount || 0), 0); }

// ---------------------------------------------------------------- cook mode
let wakeLock = null; let cookTimer = null;
async function lockScreen() {
  try { if ('wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); return true; } } catch (e) {}
  return false;
}
document.addEventListener('visibilitychange', () => { if (!$('#cook').hidden && document.visibilityState === 'visible') lockScreen(); });
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
      let added = false;
      if (levelOf(x.key) === 'out' && state.settings.autoRestock !== false && !onList(x.key)) { addGrocery(x.name, x.cat, x.key, 'Restock'); save(); added = true; }
      viewPantry();
      if (added) toast(`${x.name} is out — added to the grocery list`, 'Undo', () => { Object.values(state.grocery).forEach((g) => { if (g.key === x.key && !g.checked && g.from === 'Restock') delete state.grocery[g.id]; }); save(); viewPantry(); });
    }));
    $('.nmbtn', row).onclick = () => openPantryItem(x);
  });
  $$('[data-add]').forEach((b) => (b.onclick = () => { const x = cat[b.dataset.add]; addGrocery(x.name, x.cat, x.key, 'Pantry'); save(); viewPantry(); toast(`${x.name} added to the list`); }));
  $('#addNeeds') && ($('#addNeeds').onclick = () => { needs.forEach((x) => addGrocery(x.name, x.cat, x.key, 'Pantry')); save(); viewPantry(); toast(`Added ${needs.length} to the grocery list`, 'View', () => go('#/grocery')); });
  const addP = () => { const v = $('#pNew').value.trim(); if (!v) return; const k = pantryKey(v); state.pantry[k] = { name: v, cat: guessCat(v), level: 'have', at: now() }; save(); viewPantry(); toast(`${v} added to pantry`); };
  $('#pAdd').onclick = addP; $('#pNew').onkeydown = (e) => { if (e.key === 'Enter') addP(); };
  $('#scanP').onclick = openScan;
}

// ---------------------------------------------------------------- views: grocery

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
  const avg = all.length ? all.reduce((a, c) => a + mealCost(c), 0) / all.length : 0;
  const saved = all.reduce((a, c) => a + Math.max(0, takeoutCost - mealCost(c)), 0);
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
      ${entries.length ? `<ul class="cooked">${entries.map((c) => `<li><div><div class="t">${esc(c.title)}</div><div class="d">${esc(shortDate(c.date))}${c.receipt ? '<span class="est">grocery receipt</span>' : c.inReceipts ? '<span class="est">counted in receipts</span>' : c.estimate ? '<span class="est">estimate</span>' : '<span class="est">receipt</span>'}${c.by ? ' · ' + esc(c.by === 'Both' ? 'both' : c.by) : ''}</div></div><button class="a" data-e="${c.id}">${c.inReceipts ? '—' : money(c.amount, true)}</button></li>`).join('')}</ul>` : '<div class="empty">No dinners logged yet.</div>'}
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
      if (c.inReceipts && a > 0) delete state.cooked[c.id].inReceipts;
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
      
    </div>
    ${settingsExtrasHTML()}
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
      <p class="small muted fitinfo">Screen ${FIT.w || ''}×${FIT.screen || ''} · view ${FIT.view || ''} · safe areas ${Math.round(FIT.sat || 0)}/${Math.round(FIT.sab || 0)} · ${FIT.sa ? 'home-screen app' : 'browser'}${FIT.strip ? ` · bottom strip ${FIT.strip}` : ''}</p>
    </div></div>`);
  $$('#themeSeg button').forEach((b) => (b.onclick = () => { st.theme = b.dataset.t; save(); applyTheme(); viewSettings(); }));
  $('#bigT').onchange = (e) => { st.bigText = e.target.checked; save(); applyTheme(); };
  $('#snowT').onchange = (e) => { st.snow = e.target.checked; save(); applySeason(); };
  $('#heartT').onchange = (e) => { st.hearts = e.target.checked; save(); applySeason(); };
  $('#rsT').onchange = (e) => { st.autoRestock = e.target.checked; save(); };
  $$('#unitSeg button').forEach((b) => (b.onclick = () => { st.units = b.dataset.u; save(); viewSettings(); }));
  $$('#tempSeg button').forEach((b) => (b.onclick = () => { st.temp = b.dataset.tp; save(); viewSettings(); }));
  $('#clrPrices') && ($('#clrPrices').onclick = () => withUndo('Receipt prices forgotten', () => { state.prices = {}; }, viewSettings));
  $('#showWN').onclick = openWhatsNew;
  bindSettingsExtras();
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

// ================================================================ update 2 (Nov 2026)
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
function buzz() {} // update 4: tap feedback removed (the saved haptics setting is left untouched, just unused)
function withUndo(msg, fn, after) {
  const snap = JSON.stringify(state);
  fn(); save(); if (after) after();
  toast(msg, 'Undo', () => { state = JSON.parse(snap); save(); applyTheme(); router(); toast('Undone'); });
}
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const other = (n) => (n === 'Corey' ? 'Faith' : 'Corey');
const thumb = (src) => (src && /^assets\/(img|acura)\/(?!cover).+\.webp$/.test(src) ? src.replace(/\.webp$/, '-sm.webp') : src);

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
    if ((location.hash || '#/') === '#/' && !$('#wxLine') && $('#sheetWrap').hidden && document.activeElement !== $('#q')) { viewHome(); }
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
  const bodyHTML = () => {
    const w = wxFresh(); const u = useItUp(recipes); const lt = longTimeFavs(recipes);
    const tabs = [['mood', 'Mood'], ['use', 'Use it up'], ['while', 'A while'], ...(w ? [['wx', 'Weather']] : []), ['wish', 'Wish list']];
    let body = '';
    if (cur === 'mood') body = `<div class="mood">${[['cozy', 'Cozy'], ['quick', 'Quick'], ['fancy', 'Fancy'], ['cheap', 'Cheap']].map(([k, l]) => `<button data-mood="${k}" class="${mood === k ? 'on' : ''}">${l}</button>`).join('')}</div>${pickCards(moodPicks(recipes, mood))}`;
    else if (cur === 'use') body = u.items.length ? `<p class="sub">${esc(u.items.slice(0, 5).map((x) => x.p.name + (x.d != null ? (x.d === 0 ? ' (today)' : ` (${x.d} day${x.d === 1 ? '' : 's'})`) : ' (low)')).join(' · '))}</p>${u.picks.length ? `<div class="rlist">${u.picks.map((x) => withTag(rcard(x.r), 'uses ' + x.uses.slice(0, 2).join(', '))).join('')}</div>` : '<div class="empty">None of our recipes use those — maybe a wish-list idea?</div>'}`
      : '<div class="empty">Add use-by dates in the Pantry (tap an item\'s name) or mark things “Low”, and this suggests meals that use them up.</div>';
    else if (cur === 'while') body = lt.length ? `<div class="rlist">${lt.slice(0, 5).map((x) => withTag(rcard(x.r), x.days == null ? 'not cooked yet' : x.days + ' days ago')).join('')}</div>` : '<div class="empty">Favourites you haven\'t made in two weeks or more show up here.</div>';
    else if (cur === 'wx' && w) body = `<p class="sub">London, ON · ${wxTemp(w.t)} · ${esc(wxWords(w.code))} — ${esc(wxMood(w).line)}.</p>${pickCards(weatherPicks(recipes))}`;
    else if (cur === 'wish') body = wishHTML();
    return { tabs, body };
  };
  // update 6: switching tabs / moods only swaps the .ideas panel (the sheet, its tab chips and footer stay put) and the
  // sheet keeps one height for every tab (.ideas-sheet), so it no longer jumps or redraws when you switch.
  const fill = (b) => {
    const box = $('.ideas', b); box.innerHTML = bodyHTML().body; markLoaded(box);
    $$('[data-tab]', b).forEach((c) => c.classList.toggle('on', c.dataset.tab === cur));
    $$('[data-mood]', box).forEach((c) => (c.onclick = () => { mood = ui.mood = c.dataset.mood; fill(b); }));
    if (cur === 'wish') bindWish(box, () => fill(b));
  };
  const draw = (b) => {
    const { tabs } = bodyHTML();
    b.innerHTML = `<h2>Ideas</h2><div class="chips tabs">${tabs.map(([k, l]) => `<button class="chip ${cur === k ? 'on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div><div class="ideas"></div>
      <div class="foot"><button class="btn" data-close>Close</button></div>`;
    $$('[data-tab]', b).forEach((c) => (c.onclick = () => { if (cur === c.dataset.tab) return; cur = c.dataset.tab; fill(b); }));
    fill(b);
  };
  openSheet('', (b) => { $('.sheet').classList.add('ideas-sheet'); draw(b); });
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
    const set = (v) => { const cur = state.pantry[x.key] || { name: x.name, cat: x.cat, level: null }; if (v) state.pantry[x.key] = { ...cur, useBy: v, at: now() }; else { const c2 = { ...cur }; delete c2.useBy; state.pantry[x.key] = c2; } save(); closeSheet(); viewPantry(); };
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
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applySeason); } catch (e) {}

// ---------------------------------------------------------------- what's new (#34) + backup reminder (#45)
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
      if (t.left <= 0) { cookTimers.splice(k, 1); changed = true; beep(); toast(t.label ? `Time to ${t.label.replace(/^Start/, 'start')}!` : `${t.dish} · step ${t.step + 1} timer done!`); speak(t.label ? `Time to ${t.label}.` : `Timer done. ${t.dish}, step ${t.step + 1}.`); }
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
    // same step redrawn (read aloud, timer, ingredients, candle...): keep the step text where it was scrolled to
    const pos = `${d.s.id}:${d.i}`, cb0 = $('.cbody', el), keepY = cb0 && el.dataset.pos === pos ? cb0.scrollTop : 0; el.dataset.pos = pos;
    el.innerHTML = `<div class="ctop"><button class="iconbtn" id="cClose" aria-label="Close">${svg('close')}</button><div class="cstep">STEP ${d.i + 1} OF ${rr.steps.length}</div>
        <div class="ctools">${'speechSynthesis' in window ? `<button class="iconbtn ${sess.read ? 'on' : ''}" id="cRead" aria-label="Read aloud" aria-pressed="${sess.read}">${svg('speaker')}</button>` : ''}<button class="iconbtn ${sess.hands ? 'on' : ''}" id="cHands" aria-label="Hands-free" aria-pressed="${sess.hands}">${svg('mic')}</button>${isDate(rr) ? `<button class="iconbtn ${sess.candle ? 'on' : ''}" id="cCandle" aria-label="Candle light" aria-pressed="${sess.candle}">${svg('candle')}</button>` : ''}<button class="iconbtn" id="cMusic" aria-label="Kitchen playlist">${svg('music')}</button><button class="iconbtn ${sess.showIngs ? 'on' : ''}" id="cIngs" aria-label="Ingredients">${svg('cart')}</button></div></div>
      ${sess.dishes.length > 1 ? `<div class="dishes">${sess.dishes.map((x, k) => `<button data-dish="${k}" class="${k === sess.cur ? 'on' : ''}">${esc(short(x.r.title))}<small>${x.done ? 'done ✓' : 'step ' + (x.i + 1) + '/' + x.r.steps.length}</small></button>`).join('')}</div>` : ''}
      ${alignHTML(sess)}
      <div class="prog">${rr.steps.map((_, k) => `<i class="${k <= d.i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="cbody" id="cBody">${sess.showIngs ? `<div class="k">INGREDIENTS · ${esc(rr.title.toUpperCase())}</div><div class="ings">${rr.groups.map((g) => (g.name ? `<div class="k" style="margin-top:12px">${esc(g.name.toUpperCase())}</div>` : '') + g.items.map((it) => `<div>• ${ingLine(it, d.f, false)}</div>`).join('')).join('')}</div>`
        : `<div class="k">${esc(rr.title.toUpperCase())}</div><h2>${esc(st.title)}</h2>${uses.length ? `<div class="cuses">${(st.uses || []).map((ref) => { const t = stepUses(rr, { uses: [ref] }, d.f)[0]; return t ? `<button class="use ${ui.used && ui.used[d.s.id] && ui.used[d.s.id][ref] ? 'on' : ''}" data-use="${esc(ref)}">${esc(t)}</button>` : ''; }).join('')}</div>` : ''}<p>${tx(st.text)}</p>
        ${st.timer ? `<button class="timer ${myT ? 'run' : ''}" id="cTimer">${svg('timer')}<span id="cTimerTxt" ${myT ? `data-tleft="${myT.id}"` : ''}>${myT ? fmtSec(myT.left) : 'Start ' + st.timer + ' min timer'}</span></button>` : ''}`}
        ${sess.hands ? `<p class="handshint">${sess.rec ? 'Listening — say “next”, “back” or “repeat”. ' : ''}Tap anywhere on the right for next, the left for back.</p>` : ''}</div>
      ${others.length ? `<div class="ttray">${others.map((t) => `<button data-tgo="${t.id}"><b data-tleft="${t.id}">${fmtSec(t.left)}</b><span>${t.label ? esc(short(t.label)) : esc(short(t.dish)) + ' · step ' + (t.step + 1)}</span></button>`).join('')}</div>` : ''}
      <div class="cnav"><button class="btn" id="cPrev" ${d.i === 0 ? 'disabled style="opacity:.35"' : ''}>Back</button><button class="btn gold" id="cNext">${last ? (more ? 'Next dish' : 'Done ♥') : 'Next step'}</button></div>
      <div class="cfoot">${sess.dishes.length < 2 ? '<button class="linkbtn" id="cAdd">+ Cook a second dish</button>' : ''}<span class="awake">${wakeLock ? 'Screen will stay awake while cooking' : ''}</span></div>`;
    if (keepY && $('.cbody', el)) $('.cbody', el).scrollTop = keepY;
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
    $('#cMusic', el).onclick = openPlaylist;
    if ($('#cAlign', el)) $('#cAlign', el).onclick = () => { startAlign(sess); draw(); };
    $$('.use', el).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); useIngredient(d.r, d.s.id, b.dataset.use, b); }));
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

// ================================================================ update 3 (Nov 2026) — quality of life, us, Acura
ICON.paw = '<ellipse cx="12" cy="15.6" rx="4.4" ry="3.7"/><ellipse cx="6.3" cy="10.2" rx="1.8" ry="2.4" transform="rotate(-22 6.3 10.2)"/><ellipse cx="9.7" cy="6.5" rx="1.8" ry="2.5"/><ellipse cx="14.3" cy="6.5" rx="1.8" ry="2.5"/><ellipse cx="17.7" cy="10.2" rx="1.8" ry="2.4" transform="rotate(22 17.7 10.2)"/>';
ICON.bone = '<path d="M6.5 9.2a2.3 2.3 0 1 0-2.9 2.8 2.3 2.3 0 1 0 2.9 2.8h11a2.3 2.3 0 1 0 2.9-2.8 2.3 2.3 0 1 0-2.9-2.8z"/>';
ICON.hat = '<path d="M7 14.5c-2.3-.4-4-2.3-4-4.6a4.6 4.6 0 0 1 5.3-4.6A4.7 4.7 0 0 1 12 3.5a4.7 4.7 0 0 1 3.7 1.8A4.6 4.6 0 0 1 21 9.9c0 2.3-1.7 4.2-4 4.6V20H7z"/><path d="M7 17h10"/>';
ICON.flame = '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.4 2.4-5.3 3.6-8 .4 1.7 1.3 2.8 2.4 3.4.2-2.6 1.5-5.1 3.4-6.8-.2 2.6.9 4.4 2.2 6.1 1.1 1.4 1.4 3 1.4 4.6C18.5 18.1 15.9 21 12 21z"/>';
ICON.music = '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>';
ICON.coin = '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.5"/>';
ICON.jar = '<path d="M8 3.5h8M7 6.5h10M7.5 6.5c-1.6 1.2-2.5 2.8-2.5 5V18a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-6.5c0-2.2-.9-3.8-2.5-5"/><path d="M12 11.6c-.7-1.2-2.8-1-2.8.7 0 1.5 2.8 3.1 2.8 3.1s2.8-1.6 2.8-3.1c0-1.7-2.1-1.9-2.8-.7z"/>';
ICON.calendar = '<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>';
ICON.medal = '<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 3.5l2.2 6M15.5 3.5l-2.2 6M12 12.2l.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z"/>';
ICON.more = '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>';
ICON.pumpkin = '<path d="M12 7c-1.2-.9-3.6-1.2-5.4.2C4.2 9 4 13.6 5.6 16.4 7 19 9.6 19.6 12 18.6c2.4 1 5 .4 6.4-2.2 1.6-2.8 1.4-7.4-1-9.2C15.6 5.8 13.2 6.1 12 7z"/><path d="M12 7c.2-1.4.9-2.6 2.2-3.3M12 7c-1.4 2.6-1.4 8.6 0 11.6"/>';
ICON.dice2 = ICON.dice;
ICON.edit = '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>';
ICON.bowl = '<path d="M3.5 11.5h17l-1.6 6.2a2 2 0 0 1-1.9 1.5H7a2 2 0 0 1-1.9-1.5z"/><path d="M8 11.5c0-2 1.8-3.4 4-3.4s4 1.4 4 3.4"/>';

// ---------------------------------------------------------------- scroll container helpers (#4: fixed app shell)
const vY = () => { const v = $('#view'); return v ? v.scrollTop : 0; };
function vTo(y) { const v = $('#view'); if (v) v.scrollTop = y || 0; }

// ---------------------------------------------------------------- sheets (#1): locked background, inner scroll, drag to dismiss
let sheetCloseT = null, sheetOpenT = null;
const SHEET_IN = 'transform .36s cubic-bezier(.32,.72,0,1)', SHEET_OUT = 'transform .24s cubic-bezier(.4,0,.9,.6)';
function openSheet(html, mount) {
  const w = $('#sheetWrap'); const sh = $('.sheet', w); const scrim = $('.sheet-scrim', w);
  const fresh = w.hidden; clearTimeout(sheetCloseT); sheetCloseT = null; w.classList.remove('closing');
  sh.classList.remove('ideas-sheet'); $('#sheetBody').innerHTML = html;
  document.body.classList.add('sheet-open');
  sh.scrollTop = 0;
  if (mount) mount($('#sheetBody'));
  markLoaded(sh);
  if (fresh && !reducedMotion()) {
    // start fully below the screen, then glide up on the compositor (transform + opacity only, no layout)
    sh.style.transition = 'none'; sh.style.transform = 'translate3d(0,100%,0)'; scrim.style.transition = 'none'; scrim.style.opacity = '0';
    w.hidden = false; void sh.offsetHeight;
    sh.style.transition = SHEET_IN; sh.style.transform = 'translate3d(0,0,0)'; scrim.style.transition = 'opacity .3s ease'; scrim.style.opacity = '1';
    clearTimeout(sheetOpenT); sheetOpenT = setTimeout(() => { if (!w.classList.contains('closing') && !w.hidden) { sh.style.transition = ''; sh.style.transform = ''; scrim.style.transition = ''; scrim.style.opacity = ''; } }, 400);
  } else {
    w.hidden = false;
    if (!fresh && sh.style.transform && !reducedMotion()) { sh.style.transition = SHEET_IN; sh.style.transform = ''; scrim.style.transition = 'opacity .3s ease'; scrim.style.opacity = ''; }
    else { sh.style.transition = ''; sh.style.transform = ''; scrim.style.transition = ''; scrim.style.opacity = ''; }
  }
}
function finishCloseSheet() {
  const w = $('#sheetWrap'); const sh = $('.sheet', w); const scrim = $('.sheet-scrim', w);
  clearTimeout(sheetCloseT); clearTimeout(sheetOpenT); sheetCloseT = null;
  const was = !w.hidden;
  w.hidden = true; w.classList.remove('closing'); sh.classList.remove('ideas-sheet'); $('#sheetBody').innerHTML = '';
  sh.style.transform = ''; sh.style.transition = ''; scrim.style.opacity = ''; scrim.style.transition = '';
  document.body.classList.remove('sheet-open');
  if (was) setTimeout(maybeApplyUpdate, 450);
}
function closeSheet(instant) {
  const w = $('#sheetWrap'); if (w.hidden) return;
  if (instant === true || reducedMotion()) { finishCloseSheet(); return; }
  if (w.classList.contains('closing')) return;
  const sh = $('.sheet', w); const scrim = $('.sheet-scrim', w);
  w.classList.add('closing'); clearTimeout(sheetOpenT);
  sh.style.transition = SHEET_OUT; sh.style.transform = 'translate3d(0,100%,0)'; scrim.style.transition = 'opacity .24s ease'; scrim.style.opacity = '0';
  sheetCloseT = setTimeout(finishCloseSheet, 250);
}
function slideSheetAway() { closeSheet(); }
(function sheetGestures() {
  const w = $('#sheetWrap'); const sh = $('.sheet', w); const scrim = $('.sheet-scrim', w);
  let y0 = null, t0 = 0, dy = 0, drag = false, fromGrip = false;
  // the scrim never scrolls anything behind it
  scrim.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  sh.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || $('#sheetWrap').classList.contains('closing')) { y0 = null; return; }
    clearTimeout(sheetOpenT); sh.style.transition = ''; scrim.style.transition = '';
    y0 = e.touches[0].clientY; t0 = now(); dy = 0; drag = false;
    const r = sh.getBoundingClientRect();
    fromGrip = !!e.target.closest('.sheet-grip') || y0 - r.top < 34;
  }, { passive: true });
  sh.addEventListener('touchmove', (e) => {
    if (y0 == null) return;
    dy = e.touches[0].clientY - y0;
    const atTop = sh.scrollTop <= 0;
    if (!drag && dy > 6 && (fromGrip || atTop) && !e.target.closest('input[type=range],.hrow,.wheel')) drag = true;
    if (drag) {
      e.preventDefault();
      const d = Math.max(0, dy);
      sh.style.transition = 'none'; sh.style.transform = `translateY(${d}px)`;
      scrim.style.opacity = String(Math.max(0.15, 1 - d / 420));
    } else if (atTop && dy > 0) {
      e.preventDefault(); // no rubber-band pull of the page behind
    } else if (sh.scrollHeight <= sh.clientHeight + 1) {
      e.preventDefault(); // nothing to scroll inside: don't let it chain to the page
    }
  }, { passive: false });
  sh.addEventListener('touchend', () => {
    if (y0 == null) return;
    const v = dy / Math.max(1, now() - t0); y0 = null;
    if (!drag) return; drag = false;
    if (dy > 120 || (dy > 40 && v > 0.55)) { const sc = $('.sheet-scrim', w); sh.style.transition = SHEET_OUT; sc.style.transition = 'opacity .24s ease'; closeSheet(); }
    else { sh.style.transition = 'transform .26s cubic-bezier(.32,.72,0,1)'; sh.style.transform = ''; scrim.style.transition = 'opacity .26s ease'; scrim.style.opacity = ''; }
  }, { passive: true });
})();

// ---------------------------------------------------------------- auto-update (#2)
let swReg = null; let updatePending = false;
const hadController = !!('serviceWorker' in navigator && navigator.serviceWorker.controller);
function safeToReload() {
  const ae = document.activeElement;
  return $('#cook').hidden && $('#sheetWrap').hidden && $('#welcome').hidden && !cookTimers.length
    && !(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) && !document.body.classList.contains('printing');
}
function maybeApplyUpdate() {
  if (!updatePending || !safeToReload()) return;
  updatePending = false;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  try { sessionStorage.setItem('ok-updated', '1'); sessionStorage.setItem('ok-scroll', JSON.stringify({ h: location.hash, y: vY() })); } catch (e) {}
  location.reload();
}
function initSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then((reg) => {
    swReg = reg; reg.update().catch(() => {});
    setInterval(() => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); }, 20 * 60e3);
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadController) return; updatePending = true; maybeApplyUpdate(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { if (swReg) swReg.update().catch(() => {}); maybeApplyUpdate(); }
    else if (updatePending) maybeApplyUpdate(); // reload quietly while the app is in the background
  });
}

// ---------------------------------------------------------------- screen fit: iPhone home-screen app geometry
// iOS 26+ with black-translucent: the page is drawn from the top of the screen but the viewport is sized as if it
// started below the status bar, so it ends one status-bar height short of the bottom (the 'strip'). We detect the
// strip and size the app shell so the tab bar ends where the home-indicator zone starts; the css block
// "iPhone home-screen fit" explains the rest. Normal geometry (browser, fixed iOS versions) is left alone.
const FIT = {};
function fitScreen() {
  const r = document.documentElement;
  const vv = window.visualViewport; if (vv && vv.height < window.innerHeight - 90) return; // keyboard up: keep last fit
  let pr = $('#fitProbe'); if (!pr) { pr = document.createElement('div'); pr.id = 'fitProbe'; pr.setAttribute('aria-hidden', 'true'); document.body.appendChild(pr); }
  const cs = getComputedStyle(pr); const sat = parseFloat(cs.paddingTop) || 0, sab = parseFloat(cs.paddingBottom) || 0;
  const sa = !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));
  const portrait = window.innerHeight >= window.innerWidth;
  const sh = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
  const gap = Math.round(sh - window.innerHeight);
  const strip = sa && portrait && sat >= 20 && Math.abs(gap - sat) <= 3 ? gap : 0;
  // one fixed layout, no switch (an old 'ourkitchen.fit' key from update 5 is simply ignored, never deleted).
  // The shell never grows into the strip: iOS draws and hit-tests nothing below the viewport there (see app.css).
  r.classList.toggle('sa', sa); r.classList.toggle('strip', strip > 0);
  Object.assign(FIT, { sa, screen: sh, view: window.innerHeight, w: window.innerWidth, sat, sab, gap, strip });
}
fitScreen();
window.addEventListener('resize', () => setTimeout(fitScreen, 60));
window.addEventListener('orientationchange', () => setTimeout(fitScreen, 300));
window.addEventListener('pageshow', fitScreen); window.addEventListener('load', fitScreen);
document.fonts && document.fonts.ready && document.fonts.ready.then(fitScreen);

// ---------------------------------------------------------------- keyboard never covers inputs (#8)
if (window.visualViewport) {
  const vv = window.visualViewport;
  const onvv = () => { const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); document.documentElement.style.setProperty('--kb', kb + 'px'); document.body.classList.toggle('kb', kb > 90); };
  vv.addEventListener('resize', onvv); vv.addEventListener('scroll', onvv);
}
document.addEventListener('focusin', (e) => {
  const t = e.target;
  if (!t.matches || !t.matches('input:not([type=checkbox]):not([type=range]):not([type=file]):not([type=radio]),textarea,select')) return;
  setTimeout(() => { try { t.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (x) {} }, 330);
});

// ---------------------------------------------------------------- swipe from the left edge to go back (#6)
(function edgeBack() {
  let sx = null, sy = 0, on = false; const ind = $('#edge');
  const canBack = () => TAB_ROOTS[location.hash || '#/'] === undefined && $('#sheetWrap').hidden && $('#cook').hidden && $('#welcome').hidden;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return; const t = e.touches[0];
    if (t.clientX > 24 || !canBack()) { sx = null; return; }
    sx = t.clientX; sy = t.clientY; on = false;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (sx == null) return; const t = e.touches[0]; const dx = t.clientX - sx; const dy = t.clientY - sy;
    if (!on) { if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { sx = null; return; } if (dx > 12) on = true; }
    if (on) { e.preventDefault(); const p = Math.min(1, dx / 110); ind.style.opacity = String(p); ind.classList.toggle('go', dx > 90); $('#view').style.transform = `translateX(${Math.min(dx * 0.3, 36)}px)`; }
  }, { passive: false });
  document.addEventListener('touchend', (e) => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    ind.style.opacity = '0'; ind.classList.remove('go'); $('#view').style.transform = '';
    if (on && dx > 90) { const b = $('#backBtn'); if (b) b.click(); else history.back(); }
    on = false;
  }, { passive: true });
})();

// ---------------------------------------------------------------- pull to refresh on Home (#11)
(function pullToRefresh() {
  const v = $('#view'); const ind = $('#ptr'); let y0 = null, d = 0, on = false, busy = false;
  v.addEventListener('touchstart', (e) => { if (busy || (location.hash || '#/') !== '#/' || v.scrollTop > 0 || !$('#sheetWrap').hidden || e.touches.length !== 1) { y0 = null; return; } y0 = e.touches[0].clientY; d = 0; on = false; }, { passive: true });
  v.addEventListener('touchmove', (e) => {
    if (y0 == null) return; d = e.touches[0].clientY - y0;
    if (d <= 0 || v.scrollTop > 0) { if (on) { ind.style.transform = ''; v.style.transform = ''; } on = false; return; }
    if (d > 8) { on = true; e.preventDefault(); const p = Math.min(d * 0.45, 84); ind.style.transform = `translateY(${p}px)`; ind.classList.toggle('ready', p >= 62); v.style.transform = `translateY(${p * 0.55}px)`; }
  }, { passive: false });
  v.addEventListener('touchend', async () => {
    if (y0 == null) return; y0 = null; const ready = ind.classList.contains('ready');
    v.style.transition = 'transform .25s ease'; v.style.transform = ''; setTimeout(() => { v.style.transition = ''; }, 260);
    if (!on) return; on = false;
    if (!ready) { ind.style.transform = ''; return; }
    busy = true; ind.classList.add('spin'); ind.style.transform = 'translateY(54px)';
    await refreshAll();
    ind.classList.remove('spin', 'ready'); ind.style.transform = ''; busy = false;
  }, { passive: true });
})();
async function refreshAll() {
  const t = now();
  try { if (swReg) swReg.update().catch(() => {}); WX = null; await Promise.all([loadIndex(), loadPrices(), loadWeather()]); } catch (e) {}
  await new Promise((r) => setTimeout(r, Math.max(0, 600 - (now() - t))));
  if ((location.hash || '#/') === '#/') { ui.pick = null; viewHome(); }
  toast(navigator.onLine === false ? "You're offline — showing what's saved" : 'All fresh ♥');
}

// ---------------------------------------------------------------- long-press a recipe card (#12)
(function longPress() {
  let t = null, sx = 0, sy = 0, fired = false;
  const cardOf = (el) => el && el.closest && el.closest('a[href^="#/r/"]:not(.btn)');
  document.addEventListener('touchstart', (e) => {
    const c = cardOf(e.target); if (!c || c.closest('#sheetWrap,#cook')) return;
    fired = false; const p = e.touches[0]; sx = p.clientX; sy = p.clientY; clearTimeout(t);
    t = setTimeout(() => { t = null; fired = true; buzz(15); tapSound(); openCardMenu(c.getAttribute('href').slice(4)); }, 480);
  }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (!t) return; const p = e.touches[0]; if (Math.abs(p.clientX - sx) > 9 || Math.abs(p.clientY - sy) > 9) { clearTimeout(t); t = null; } }, { passive: true });
  // after a long-press opens the menu, swallow the synthetic click so it can't land on the new sheet's scrim
  document.addEventListener('touchend', (e) => { clearTimeout(t); t = null; if (fired) { fired = false; if (e.cancelable) e.preventDefault(); } }, { passive: false });
  document.addEventListener('click', (e) => { if (fired && cardOf(e.target)) { e.preventDefault(); e.stopPropagation(); fired = false; } }, true);
  document.addEventListener('contextmenu', (e) => { const c = cardOf(e.target); if (c && !c.closest('#sheetWrap,#cook')) { e.preventDefault(); openCardMenu(c.getAttribute('href').slice(4)); } });
})();
function openCardMenu(id) {
  const s = summary(id); if (!s) return;
  const fav = !!state.favourites[id]; const planned = tonightPlan() && tonightPlan().recipeId === id;
  openSheet(`<div class="cmhead">${s.image ? `<div class="im">${img(thumb(s.image), '')}</div>` : ''}<div><div class="num">${esc(recipeLabel(s))}</div><b>${esc(s.title)}</b>${nickLine(id)}</div></div>
    <div class="menu">
      <button data-a="fav">${svg('heart')}<span>${fav ? 'Remove from favourites' : 'Add to favourites'}</span></button>
      <button data-a="list">${svg('cart')}<span>Add to grocery list</span></button>
      <button data-a="plan">${svg('clock')}<span>${planned ? "It's tonight's plan ✓" : 'Plan it for tonight'}</span></button>
      <button data-a="hide">${svg('eyeoff')}<span>Hide meal</span></button>
      <a href="#/r/${id}">${svg('chevR')}<span>Open recipe</span></a></div>`, (b) => {
    $$('[data-a]', b).forEach((x) => (x.onclick = async () => {
      const a = x.dataset.a;
      if (a === 'fav') { closeSheet(); toggleFav(id); router(); }
      else if (a === 'list') { const r = await getRecipe(id); if (!r) return; const f = (state.servings[id] || r.servings || 4) / (r.servings || 4); openMissing(r, s, f); }
      else if (a === 'plan') { closeSheet(); setTonight(id); }
      else if (a === 'hide') { closeSheet(); state.hidden[id] = now(); save(); router(); toast('Hidden from your lists', 'Undo', () => { delete state.hidden[id]; save(); router(); }); }
    }));
  });
}

// ---------------------------------------------------------------- screen transitions (#15) + shimmer placeholders (#16)
function animateView(dir) {
  const v = $('#view'); v.classList.remove('vin-fwd', 'vin-back', 'vin-tab');
  if (reducedMotion()) return;
  void v.offsetWidth; v.classList.add('vin-' + dir);
  // drop the class once the enter animation is done so later partial updates never animate
  clearTimeout(animateView.t); animateView.t = setTimeout(() => v.classList.remove('vin-fwd', 'vin-back', 'vin-tab'), 420);
}
const LOADED = new Set();
document.addEventListener('load', (e) => { const t = e.target; if (t && t.tagName === 'IMG') { t.classList.add('ld'); LOADED.add(t.getAttribute('src')); } }, true);
document.addEventListener('error', (e) => { const t = e.target; if (t && t.tagName === 'IMG') t.classList.add('ld'); }, true);
function markLoaded(root) { $$('img', root).forEach((i) => { if ((i.complete && i.naturalWidth) || LOADED.has(i.getAttribute('src'))) { i.classList.add('ld'); i.loading = 'eager'; } }); }
function skeletonRecipe(s) {
  return `<div class="skel" aria-busy="true"><div class="r-head"><div class="sk sk-k"></div><div class="sk sk-h"></div><div class="sk sk-h2"></div></div>
    <div class="hero"><div class="tile">${s && s.image ? img(s.image, '') : ''}</div></div>
    <div class="stats"><div class="sk sk-b"></div><div class="sk sk-b"></div><div class="sk sk-b"></div></div>
    <div class="wrap">${'<div class="sk sk-line"></div>'.repeat(7)}</div></div>`;
}

// ---------------------------------------------------------------- sounds (#21, #42)
let AUD = null;
function actx() { try { if (!AUD) AUD = new (window.AudioContext || window.webkitAudioContext)(); if (AUD.state === 'suspended') AUD.resume(); } catch (e) { AUD = null; } return AUD; }
function tone(freq, start, dur, vol = 0.16, type = 'sine') {
  const c = actx(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain(); o.type = type; o.frequency.value = freq; o.connect(g); g.connect(c.destination);
  const t = c.currentTime + start; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.05);
}
const CHIMES = {
  classic: ['Classic beep', () => [0, 0.35, 0.7].forEach((t) => tone(880, t, 0.3, 0.2))],
  bell: ['Soft bell', () => [[1046.5, 0], [1318.5, 0.2], [1568, 0.4]].forEach(([f, t]) => tone(f, t, 1.5, 0.14))],
  marimba: ['Marimba', () => [[523.25, 0], [659.25, 0.14], [783.99, 0.28], [1046.5, 0.42]].forEach(([f, t]) => tone(f, t, 0.55, 0.2, 'triangle'))],
  ding: ['Kitchen ding', () => { tone(1567.98, 0, 1.9, 0.16); tone(3135.96, 0, 0.8, 0.04); }],
  harp: ['Gentle harp', () => [392, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => tone(f, i * 0.11, 1.3, 0.11, 'triangle'))],
};
function playChime(k) { try { (CHIMES[k] || CHIMES.classic)[1](); } catch (e) {} }
function beep() {
  const k = state.settings.chime || 'classic';
  playChime(k); setTimeout(() => playChime(k), 2300);
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function tapSound() { if (state.settings.sounds) tone(1900, 0, 0.045, 0.045); }
document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn,.chip,.iconbtn,#tabbar a,.seg button,.segtext button,.checklist li,.bone')) { actx(); tapSound(); } }, true);

// ---------------------------------------------------------------- undo memory + shake to undo (#29)
let lastUndo = null;
let shakeOn = false; let shakeTimes = [];
function onMotion(e) {
  const a = e.acceleration; const g = e.accelerationIncludingGravity;
  let mag = 0;
  if (a && a.x != null) mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
  else if (g && g.x != null) mag = Math.abs(Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z) - 9.81);
  if (mag < 13) return;
  const t = now(); shakeTimes = shakeTimes.filter((x) => t - x < 900); shakeTimes.push(t);
  if (shakeTimes.length >= 3) { shakeTimes = []; shakeUndo(); }
}
function shakeUndo() {
  if (!lastUndo || now() - lastUndo.at > 20000) return;
  const f = lastUndo.fn; lastUndo = null; $('#toast').classList.remove('show'); f(); setTimeout(() => toast('Undone ↶ (shake)'), 50);
}
function enableShake(fromTap) {
  if (typeof DeviceMotionEvent === 'undefined') return Promise.resolve(false);
  const on = () => { if (!shakeOn) { window.addEventListener('devicemotion', onMotion); shakeOn = true; } return true; };
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    if (!fromTap) return Promise.resolve(false);
    return DeviceMotionEvent.requestPermission().then((p) => (p === 'granted' ? on() : false)).catch(() => false);
  }
  return Promise.resolve(on());
}

// ---------------------------------------------------------------- confetti (#22)
function confetti() {
  if (reducedMotion()) return;
  const w = document.createElement('div'); w.className = 'confetti'; w.setAttribute('aria-hidden', 'true');
  const cols = ['#C4963E', '#5070A8', '#806098', '#381848', '#D4B56A', '#F5E6CE', '#082048'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${46 + Math.random() * 8}%;background:${cols[i % cols.length]};--dx:${((Math.random() * 2 - 1) * 170).toFixed(0)}px;--dy:${(-(180 + Math.random() * 260)).toFixed(0)}px;--r:${(Math.random() * 900 - 450).toFixed(0)}deg;animation-delay:${(Math.random() * 0.15).toFixed(2)}s;width:${(5 + Math.random() * 5).toFixed(1)}px;height:${(7 + Math.random() * 7).toFixed(1)}px`;
    w.appendChild(p);
  }
  document.body.appendChild(w); setTimeout(() => w.remove(), 2400);
}

// ---------------------------------------------------------------- chef hats (#43), dates
function hat(who, size = 16) {
  if (!who) return '';
  const one = (n) => `<svg class="hat ${n === 'Faith' ? 'f' : 'c'}" viewBox="0 0 24 24" width="${size}" height="${size}" role="img" aria-label="${n}"><title>${n}</title>${ICON.hat}</svg>`;
  return `<span class="hats">${who === 'Both' ? one('Corey') + one('Faith') : one(who)}</span>`;
}
const isoOf = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const dateOf = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const addDaysISO = (iso, n) => { const d = dateOf(iso); d.setDate(d.getDate() + n); return isoOf(d); };
function dayWord(iso, future) {
  const n = daysSince(iso);
  if (n === 0) return 'today';
  if (n === 1) return 'yesterday';
  if (n === -1) return 'tomorrow';
  if (Math.abs(n) < 7) return dateOf(iso).toLocaleDateString('en-CA', { weekday: 'long' });
  return dateOf(iso).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}
const longDate = (iso) => dateOf(iso).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// ---------------------------------------------------------------- sorting (#41)
const SORTS = [['book', 'Book order'], ['quick', 'Quickest'], ['cheap', 'Cheapest'], ['most', 'Most cooked']];
function cookCounts() { const m = {}; realDinners().forEach((c) => { m[c.recipeId] = (m[c.recipeId] || 0) + 1; }); return m; }
function sortRecipes(list) {
  const s = ui.sort || 'book'; const l = list.slice();
  if (s === 'quick') l.sort((a, b) => a.total - b.total || a.cost - b.cost);
  else if (s === 'cheap') l.sort((a, b) => a.cost - b.cost || a.total - b.total);
  else if (s === 'most') { const m = cookCounts(); l.sort((a, b) => (m[b.id] || 0) - (m[a.id] || 0) || a.title.localeCompare(b.title)); }
  return l;
}
function sortChips() { return `<div class="sortrow" role="group" aria-label="Sort">${SORTS.map(([k, n]) => `<button class="${(ui.sort || 'book') === k ? 'on' : ''}" data-sort="${k}">${n}</button>`).join('')}</div>`; }
function bindSort(redraw) { $$('[data-sort]').forEach((b) => (b.onclick = () => { ui.sort = b.dataset.sort; redraw(); })); }
function viewCategory(slugName) {
  const c = catOf(slugName);
  setTop({ title: esc(c.name.toUpperCase()), back: '#/' });
  const items = sortRecipes(visibleRecipes().filter((r) => r.category === slugName).sort((a, b) => a.num - b.num));
  render(`<div class="wrap"><div class="kicker"><span class="sw" style="background:${c.colour}"></span>Category<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">${esc(c.name)}</h1>
    <p class="lead" style="margin-top:4px">${items.length} recipe${items.length === 1 ? '' : 's'} so far</p>
    ${items.length > 1 ? sortChips() : ''}
    <div class="rlist" style="margin-top:14px">${items.map(rcard).join('') || '<div class="empty">No recipes here yet.</div>'}</div></div>`);
  bindSort(() => viewCategory(slugName));
}

// ---------------------------------------------------------------- tonight's plan (#31)
function tonightPlan() { const t = state.tonight; return t && t.date === todayISO() && summary(t.recipeId) && !state.hidden[t.recipeId] ? t : null; }
function eatTime(t) { const [h, m] = ((t && t.eatAt) || state.settings.dinnerAt || '18:30').split(':').map(Number); const d = new Date(); d.setHours(h, m || 0, 0, 0); return d; }
function startTime(s, t) { return new Date(eatTime(t) - ((s.total || 30) + 5) * 6e4); }
function setTonight(id, quiet) {
  const prev = state.tonight;
  state.tonight = { date: todayISO(), recipeId: id, by: state.profile.me || null, eatAt: (prev && prev.date === todayISO() && prev.eatAt) || state.settings.dinnerAt || '18:30', at: now() };
  save();
  if (!quiet) toast(`Tonight: ${summary(id).title} ♥`, 'Undo', () => { state.tonight = prev || null; save(); router(); });
  if ((location.hash || '#/') === '#/') { viewHome(); }
}
function openEatAt() {
  const t = tonightPlan(); const s = t && summary(t.recipeId); if (!s) return;
  const v = t.eatAt || state.settings.dinnerAt || '18:30';
  openSheet(`<h2>When do we eat?</h2><p class="sub">${esc(s.title)} takes about ${s.total} minutes — we'll tell you when to start.</p>
    <div class="field"><label>Dinner time</label><input id="eatIn" type="time" value="${v}"></div>
    <div class="chips" style="margin-top:4px">${['17:30', '18:00', '18:30', '19:00', '19:30'].map((x) => `<button class="chip ${x === v ? 'on' : ''}" data-eat="${x}">${fmtTime(eatTime({ eatAt: x }))}</button>`).join('')}</div>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="eatOk">Save</button></div>`, (b) => {
    $$('[data-eat]', b).forEach((c) => (c.onclick = () => { $('#eatIn', b).value = c.dataset.eat; $$('[data-eat]', b).forEach((x) => x.classList.toggle('on', x === c)); }));
    $('#eatOk', b).onclick = () => { state.tonight.eatAt = $('#eatIn', b).value || v; save(); closeSheet(); viewHome(); };
  });
}
function tonightCard(t) {
  const s = summary(t.recipeId); const st = startTime(s, t); const eat = eatTime(t);
  const done = realDinners().some((c) => c.recipeId === t.recipeId && c.date === todayISO());
  const mins = Math.round((st - now()) / 6e4);
  const when = done ? 'Dinner\'s done — well cooked, you two ♥' : mins > 90 ? `Start cooking by <b>${fmtTime(st)}</b> · eat at ${fmtTime(eat)}` : mins > 0 ? `Start in <b>${mins} min</b> (${fmtTime(st)}) · eat at ${fmtTime(eat)}` : mins > -30 ? `<b>Time to start cooking</b> · eat at ${fmtTime(eat)}` : `Running late? Eat around ${fmtTime(new Date(now() + (s.total + 5) * 6e4))}`;
  return `<div class="sec pick tonight"><div class="pick-k">Tonight's plan${t.by ? ` · ${esc(t.by)}'s pick` : ''}</div>
    <a class="pick-card" href="#/r/${s.id}"><div class="im">${s.image ? img(s.image, s.title) : placeholderArt(s)}</div>
      <div class="pc-body"><div class="t">${esc(s.title)}</div><div class="m">${when}</div></div></a>
    ${done ? `<div class="btnrow"><button class="btn ghost" id="tnDish">${svg('coin')}Who's on dishes?</button><button class="btn ghost" id="tnClear">Clear plan</button></div>`
      : `<div class="btnrow"><button class="btn ghost" id="tnTime">${svg('clock')}${fmtTime(eat)}</button><button class="btn gold" id="tnCook">${svg('play')}Start cooking</button></div>
      <button class="linkbtn" id="tnChange" style="display:block;margin:6px auto 0">Change tonight's plan</button>`}</div>`;
}

// ---------------------------------------------------------------- spin the wheel (#18)
function spinPool() {
  const no = new Set(); const wk = isoPlus(-7);
  Object.values(state.picks).forEach((p) => { if (!p.ok && p.date >= wk) no.add(p.recipeId); });
  Object.entries(state.ratings).forEach(([id, v]) => { if (v && v <= 2) no.add(id); });
  realDinners().forEach((c) => { const meh = Object.values(c.reactions || {}).filter((v) => v === 'meh').length; const h = Object.values(c.hearts || {}).filter(Boolean); if (meh >= 2 || (h.length && h.reduce((a, x) => a + x, 0) / h.length <= 2)) no.add(c.recipeId); });
  const filt = !!(ui.q || filterCount());
  const all = visibleRecipes().filter((r) => !filt || matchesFilters(r));
  const pool = all.filter((r) => !no.has(r.id));
  return { pool: pool.length ? pool : all, skipped: all.length - pool.length, filt };
}
function wheelSVG(segs) {
  const R = 140, C = 150, n = segs.length;
  const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  const cols = ['var(--tile1)', 'var(--tile2)', 'var(--tile3)', 'var(--tile4)'];
  const body = n === 1 ? `<circle cx="${C}" cy="${C}" r="${R}" fill="var(--tile1)"/>` : segs.map((s, i) => {
    const a0 = (i * 360) / n, a1 = ((i + 1) * 360) / n; const [x0, y0] = pt(a0, R); const [x1, y1] = pt(a1, R);
    return `<path d="M${C} ${C}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${cols[i % 4]}" stroke="var(--gold)" stroke-width="1.2"/>`;
  }).join('');
  const labels = segs.map((s, i) => { const c = ((i + 0.5) * 360) / n; let t = s.title; if (t.length > 17) t = t.slice(0, 16).trim() + '…'; return `<text transform="rotate(${(c - 90).toFixed(1)} ${C} ${C})" x="${C + 26}" y="${C}" class="wl">${esc(t)}</text>`; }).join('');
  return `<svg viewBox="0 0 300 300" class="wheel-svg"><g id="wheelG">${body}${labels}<circle cx="${C}" cy="${C}" r="20" fill="var(--bg)" stroke="var(--gold)" stroke-width="2"/></g><circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="var(--gold)" stroke-width="3"/></svg>`;
}
function openRandom() {
  const { pool, skipped, filt } = spinPool();
  let segs = shuffle(pool).slice(0, Math.min(8, pool.length)); let rot = 0; let busy = false; let cur = null;
  const draw = (b) => {
    if (!pool.length) { b.innerHTML = '<h2>Spin the wheel</h2><div class="empty" style="margin-top:12px">No recipes to spin — try clearing the filters.</div>'; return; }
    b.innerHTML = `<h2>Spin the wheel</h2><p class="sub">${segs.length} of ${pool.length} dinner${pool.length === 1 ? '' : 's'}${filt ? ' matching your search' : ''}${skipped ? ` · skipping ${skipped} you passed on or didn't love` : ''}.</p>
      <div class="wheel"><i class="wptr"></i><div class="wrot" id="wRot" style="transform:rotate(${rot}deg)">${wheelSVG(segs)}</div></div>
      <div id="wRes" class="wres">${cur ? resHTML() : '<p class="small muted" style="text-align:center">Tap spin — no take-backs (well, maybe one).</p>'}</div>
      <div class="foot"><button class="btn" data-close>Close</button><button class="btn gold" id="wSpin">${cur ? 'Spin again' : 'Spin!'}</button></div>`;
    $('#wSpin', b).onclick = () => spin(b);
    bindRes(b);
  };
  const resHTML = () => `<a class="pick-card mini" href="#/r/${cur.id}"><div class="im">${cur.image ? img(thumb(cur.image), cur.title) : placeholderArt(cur)}</div><div class="pc-body"><div class="t">${esc(cur.title)}</div><div class="m">${cur.price} · ${cur.total} min · ~${money(cur.cost)}</div></div></a>
    <div class="btnrow" style="margin-top:8px"><a class="btn ghost" href="#/r/${cur.id}" id="wOpen">Open recipe</a><button class="btn primary" id="wPlan">Plan tonight ♥</button></div>`;
  const bindRes = (b) => {
    if (!cur) return;
    $('#wPlan', b).onclick = () => { logPick(cur.id, true); closeSheet(); setTonight(cur.id); };
    $('#wOpen', b).onclick = () => logPick(cur.id, true);
  };
  const spin = (b) => {
    if (busy) return; busy = true; actx();
    // fresh dinners on the wheel: redraw at the angle it stopped at (no snap back to 0)
    if (cur && segs.length > 1 && pool.length > segs.length) { segs = shuffle(pool).slice(0, 8); rot = ((rot % 360) + 360) % 360; draw(b); }
    const n = segs.length; const k = Math.floor(Math.random() * n); const c = ((k + 0.5) * 360) / n + (Math.random() - 0.5) * (300 / n) * 0.6;
    const target = rot + 360 * 5 + ((((360 - c) - (rot % 360)) % 360) + 360) % 360;
    rot = target; const w = $('#wRot', b);
    const dur = reducedMotion() ? 0 : 3600;
    // update 6: a redrawn wheel had no painted start angle yet, so the browser skipped straight to the end (2nd spin
    // 'jumped'). Commit the start angle with no transition, force a style flush, then animate from there.
    w.style.transition = 'none'; void w.getBoundingClientRect();
    w.style.transition = dur ? `transform ${dur}ms cubic-bezier(.17,.67,.21,1)` : 'none'; w.style.transform = `rotate(${rot}deg)`;
    $('#wSpin', b).disabled = true;
    let ticks = 0; const tk = dur && state.settings.sounds ? setInterval(() => { if (++ticks > 25) clearInterval(tk); tone(1400, 0, 0.03, 0.04); }, 120) : null;
    setTimeout(() => { if (tk) clearInterval(tk); busy = false; cur = segs[k]; buzz(20); playChime('marimba'); const res = $('#wRes', b); if (!res) return; res.innerHTML = resHTML(); bindRes(b); const sb = $('#wSpin', b); sb.disabled = false; sb.textContent = 'Spin again'; }, dur + 80);
  };
  openSheet('', draw);
}

// ---------------------------------------------------------------- home helpers: recently cooked, recipe of the week, leftovers, flashback, anniversary, date night
function recentlyCooked(recipes) {
  const seen = new Set(); const out = [];
  realDinners().slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.at || 0) - (a.at || 0))).forEach((c) => {
    if (out.length >= 3 || seen.has(c.recipeId)) return; const r = recipes.find((x) => x.id === c.recipeId); if (!r) return; seen.add(c.recipeId); out.push({ r, c });
  });
  return out;
}
function weekNo(d = new Date()) { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() * 53 + Math.ceil(((t - y0) / 864e5 + 1) / 7); }
function recipeOfWeek(recipes) {
  const done = new Set(realDinners().map((c) => c.recipeId));
  const untried = recipes.filter((r) => !done.has(r.id) && !r.custom).sort((a, b) => (a.id < b.id ? -1 : 1));
  return untried.length ? untried[weekNo() % untried.length] : null;
}
function leftoverLine(l) {
  const d = daysSince(l.date); const by = addDaysISO(l.date, 4); const left = 4 - d;
  const from = d === 0 ? 'from today' : d === 1 ? 'from yesterday' : 'from ' + dateOf(l.date).toLocaleDateString('en-CA', { weekday: 'long' });
  const eat = left > 1 ? `eat by ${dayWord(by)}` : left === 1 ? 'eat by tomorrow' : left === 0 ? '<b class="warnc">eat today</b>' : '<b class="badc">past 4 days — toss it</b>';
  return `${esc(l.title)} ${from} — ${eat}`;
}
function flashback() {
  const t = new Date(); const hits = [];
  for (let k = -3; k <= 3; k++) { const iso = isoOf(new Date(t.getFullYear() - 1, t.getMonth(), t.getDate() + k)); realDinners().forEach((c) => { if (c.date === iso) hits.push(c); }); }
  if (!hits.length) return null;
  const withPh = hits.map((c) => ({ c, ph: (state.photos[c.recipeId] || []).find((p) => p.date === c.date) })).sort((a, b) => !!b.ph - !!a.ph);
  return withPh[0];
}
function flashCard(fb, dismiss) {
  const c = fb.c; const s = summary(c.recipeId);
  return `<div class="flash"><div class="fk">ONE YEAR AGO${dismiss ? '<button class="x" id="flashX" aria-label="Dismiss">×</button>' : ''}</div>
    <a class="fbody" href="${s ? '#/r/' + s.id : '#/story'}">${fb.ph ? `<img src="${fb.ph.data}" alt="">` : s && s.image ? img(thumb(s.image), '') : ''}
      <div><b>${esc(c.title)}</b><span>${esc(dateOf(c.date).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}${c.by ? ' · ' + (c.by === 'Both' ? 'made together' : 'made by ' + esc(c.by)) : ''}</span><em>Make it again for old times' sake?</em></div></a></div>`;
}
function annivSoon() {
  const a = state.settings.anniversary; if (!a) return null;
  const [y, m, d] = a.split('-').map(Number); const t = new Date(); t.setHours(0, 0, 0, 0);
  let next = new Date(t.getFullYear(), m - 1, d); if (next < t) next = new Date(t.getFullYear() + 1, m - 1, d);
  const days = Math.round((next - t) / 864e5); if (days < 1 || days > 6) return null;
  const firsts = realDinners().slice().sort((p, q) => (p.date < q.date ? -1 : 1));
  const sug = (state.signature && summary(state.signature)) || (firsts[0] && summary(firsts[0].recipeId)) || visibleRecipes().find((r) => ((r.tags || {}).occasion || []).includes('date-night'));
  return { days, yrs: next.getFullYear() - y, key: String(next.getFullYear()), sug, sigWhy: state.signature && sug && sug.id === state.signature ? 'your signature dish' : firsts[0] && sug && sug.id === firsts[0].recipeId ? 'the first dinner you logged together' : 'a Date Night favourite' };
}
function dateNightInfo() {
  const dn = state.dateNight; if (!dn || !dn.date) return null;
  const days = -daysSince(dn.date); if (days < 0) return null;
  return { ...dn, days, s: dn.recipeId ? summary(dn.recipeId) : null };
}
function dnWords(dn) { return dn.days === 0 ? 'Date night is tonight' : dn.days === 1 ? 'Date night is tomorrow' : `Date night in ${dn.days} days`; }
function isOctober() { return new Date().getMonth() === 9; }

// ---------------------------------------------------------------- views: home (decluttered)
// update 6: typing in search no longer redraws the whole home screen (which recreated the input, refocused it and
// re-inserted every image: keyboard stutter + flashing). Keystrokes are debounced and only #homeBody is swapped;
// recipe cards already on screen are reused as-is (same markup = same node, image stays loaded).
const HOME_CARDS = new Map();
function swapHomeBody(html) {
  const w = $('#homeBody'); const t = document.createElement('template'); t.innerHTML = html; const fresh = [];
  t.content.querySelectorAll('a.rcard[href]').forEach((n) => { const key = n.getAttribute('href'); const src = n.outerHTML; const c = HOME_CARDS.get(key); if (c && c.src === src) n.replaceWith(c.node); else fresh.push([key, src, n]); });
  w.replaceChildren(t.content); fresh.forEach(([key, src, node]) => HOME_CARDS.set(key, { src, node })); markLoaded(w);
}
function viewHome(partial) {
  partial = partial === true && !!$('#homeBody') && !!$('#q');
  if (!partial) { setTop({ title: 'OUR KITCHEN' }); HOME_CARDS.clear(); }
  const recipes = visibleRecipes();
  ui.pick = ui.pick && recipes.find((r) => r.id === ui.pick) ? ui.pick : seasonalPick(recipes);
  const searching = ui.q || filterCount();
  let body = '';
  if (searching) {
    const res = sortRecipes(recipes.filter(matchesFilters));
    body = `<div class="sec"><div class="sec-title">${res.length} recipe${res.length === 1 ? '' : 's'}<button class="act" id="clearAll">Clear</button></div>${/[+,]/.test(ui.q) ? `<p class="small muted" style="margin:-4px 0 10px">Recipes that use ${esc(ui.q.split(/\s*[+,]\s*/).filter(Boolean).join(' + '))}</p>` : ''}
      ${res.length > 1 ? sortChips() : ''}
      ${res.length ? `<div class="rlist" style="margin-top:12px">${res.map(rcard).join('')}</div>` : `<div class="empty">Nothing matches yet — try fewer filters. More recipes are on the way.</div>`}
      ${res.length > 1 ? '<button class="btn ghost block" id="spinRes" style="margin-top:14px">' + svg('dice') + 'Spin the wheel on these</button>' : ''}</div>`;
  } else {
    const favs = Object.entries(state.favourites).sort((a, b) => b[1] - a[1]).map(([id]) => recipes.find((r) => r.id === id)).filter(Boolean);
    const recent = state.recent.map((id) => recipes.find((r) => r.id === id)).filter(Boolean).slice(0, 8);
    const cats = INDEX.categories.map((c) => ({ ...c, items: recipes.filter((r) => r.category === c.slug).sort((a, b) => a.num - b.num) }));
    const withRecipes = cats.filter((c) => c.items.length);
    const pk = recipes.find((r) => r.id === ui.pick);
    const plan = tonightPlan();
    const lefts = Object.values(state.leftovers).sort((a, b) => (a.date < b.date ? -1 : 1));
    const nudge = cookAgainNudge(recipes);
    const lastMonth = lastMonthKey();
    const rc = new Date().getDate() <= 10 && !state.recapSeen[lastMonth] ? monthRecap(lastMonth) : null;
    const uu = useItUp(recipes);
    const turn = whoseTurn();
    const rcook = recentlyCooked(recipes);
    const row = recipeOfWeek(recipes);
    const fb = !state.flashSeen[todayISO()] ? flashback() : null;
    const an = annivSoon(); const showAn = an && !state.annivSeen[an.key];
    const ny = yearInReviewDue();
    body = `
      ${whatsNewCard()}${backupCard()}
      ${showAn ? `<div class="annv"><div class="fk">${an.days === 1 ? 'TOMORROW' : `IN ${an.days} DAYS`} · ${an.yrs}-YEAR ANNIVERSARY<button class="x" id="anX" aria-label="Dismiss">×</button></div><p>${an.sug ? `How about <b>${esc(an.sug.title)}</b> — ${esc(an.sigWhy)}?` : 'Plan something special to cook together.'}</p>${an.sug ? `<div class="btnrow" style="margin-top:10px"><a class="btn sm ghost" href="#/r/${an.sug.id}">Open recipe</a><button class="btn sm gold" id="anPlan">Plan date night</button></div>` : ''}</div>` : ''}
      ${rc ? recapCard(rc, true) : ''}
      ${ny ? `<a class="nudge yr" href="#/year/${ny}"><span>${svg('star')}</span><span style="flex:1"><b>Our ${ny} in review</b> — every dinner, favourite and first, in one place.</span><span>${svg('chevR')}</span></a>` : ''}
      ${plan ? tonightCard(plan) : pk ? `<div class="sec pick"><div class="pick-k">${esc(pickKicker(pk))}</div>
        <a class="pick-card" href="#/r/${pk.id}"><div class="im">${pk.image ? img(pk.image, pk.title) : placeholderArt(pk)}</div>
          <div class="pc-body"><div class="t">${esc(pk.title)}</div><div class="m">${pk.price} · ${pk.total} min · ~${money(pk.cost)} · start by ${fmtTime(startTime(pk, null))}</div></div></a>
        <div class="pick-q"><span>${esc(turn)}'s pick tonight — sound good?</span><button class="turnbtn" id="turnBtn" aria-label="Switch whose turn">${svg('swap')}</button></div>
        <div class="btnrow"><button class="btn ghost" id="pickNo">${svg('thumbDown')}Not tonight</button><button class="btn gold" id="pickYes">${svg('thumbUp')}Let's make it</button></div></div>` : ''}
      <div class="quick"><button class="btn ghost" id="randBtn">${svg('dice')}Spin the wheel</button><button class="btn ghost" id="canMake">${svg('pantry')}What can we make?</button><button class="btn ghost wide" id="ideasBtn">${svg('star')}More ideas<small>mood · use it up · weather · wish list</small></button></div>
      ${uu.soon.length && uu.picks.length ? `<a class="nudge use" href="#/r/${uu.picks[0].r.id}"><span>${svg('clock')}</span><span><b>Use it up:</b> ${esc(uu.soon[0].p.name)} ${uu.soon[0].d === 0 ? 'is due today' : uu.soon[0].d === 1 ? 'is due tomorrow' : `is due in ${uu.soon[0].d} days`} — try ${esc(uu.picks[0].r.title)}.</span></a>` : ''}
      ${lefts.length ? `<div class="sec"><div class="sec-title">In the fridge</div><ul class="cooked fridge">${lefts.map((l) => `<li><div><div class="t">${leftoverLine(l)}</div><div class="d">${l.portions} portion${l.portions === 1 ? '' : 's'} left</div></div><button class="btn sm ghost" data-ate="${l.id}">Ate one</button></li>`).join('')}</ul></div>` : ''}
      ${fb ? flashCard(fb, true) : ''}
      ${nudge ? `<a class="nudge" href="#/r/${nudge.r.id}"><span>${svg('reset')}</span><span>It's been <b>${nudge.days} days</b> since ${esc(nudge.r.title)}. Cook it again?</span></a>` : ''}
      <div class="sec"><div class="sec-title">Favourites${favs.length > 4 ? `<span class="act">${favs.length}</span>` : ''}</div>
        ${favs.length ? `<div class="favtiles">${favs.slice(0, 4).map((r) => `<a class="favtile" href="#/r/${r.id}">${r.image ? img(r.image, r.title) : placeholderArt(r)}<span class="ft">${esc(r.title)}</span>${isCoupleFav(r.id) ? `<i class="gh" title="Both of you love this">${svg('heart')}</i>` : ''}${state.signature === r.id ? '<i class="sg">★</i>' : ''}</a>`).join('')}</div>
          ${favs.length > 4 ? `<div class="hrow" style="margin-top:10px">${favs.slice(4).map(miniCard).join('')}</div>` : ''}` : `<div class="empty">Tap the ♡ on a recipe and it'll live here.</div>`}</div>
      ${rcook.length ? `<div class="sec"><div class="sec-title">Recently cooked</div><div class="rcook">${rcook.map(({ r, c }) => `<div class="rc"><a href="#/r/${r.id}" class="rc-a"><div class="im">${r.image ? img(thumb(r.image), '') : placeholderArt(r)}</div><div class="rc-t"><b>${esc(r.title)}</b><small>${hat(c.by, 14)}${esc(dayWord(c.date))}</small></div></a><button class="btn sm ghost" data-again="${r.id}" aria-label="Cook ${esc(r.title)} again">${svg('play')}Again</button></div>`).join('')}</div></div>` : ''}
      ${row ? `<div class="sec"><div class="sec-title">Recipe of the week</div><a class="wkcard" href="#/r/${row.id}"><div class="im">${row.image ? img(thumb(row.image), '') : placeholderArt(row)}</div><div><small>Something new to try</small><b>${esc(row.title)}</b><span>${row.price} · ${row.total} min · ~${money(row.cost)}</span></div></a></div>` : ''}
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
        <a href="#/budget"><span>$</span>$350 month</a><a href="#/add"><span>+</span>Add a recipe</a><a href="#/story"><span>❦</span>Our story</a>
        <a href="#/freezer"><span>❄</span>Freezer</a><a href="#/wish"><span>✧</span>Wish list</a><a href="#/scan"><span>▤</span>Scan receipt</a><a href="#/settings"><span>⚙</span>Settings</a></div></div>`;
  }
  const fc = filterCount();
  const dn = dateNightInfo();
  const pump = isOctober() && state.settings.seasonal !== false;
  if (partial) swapHomeBody(body); else render(`<div class="home-head">
      <div class="kicker">${pump ? `<svg class="pump" viewBox="0 0 24 24" aria-hidden="true">${ICON.pumpkin}</svg>` : ''}Recipes we love<span class="rule"></span></div>
      <div class="lead" style="margin-top:6px">${esc(greeting())}</div>
      ${dn && dn.days <= 14 ? `<a class="dnline" href="#/us">${svg('heart')}<span>${esc(dnWords(dn))}${dn.s ? ' — ' + esc(dn.s.title) : ''}</span></a>` : ''}
      ${wxFresh() ? `<div class="wx" id="wxLine">London · ${wxTemp(wxFresh().t)} · ${esc(wxWords(wxFresh().code))} — ${esc(wxMood(wxFresh()).line)}</div>` : ''}
      <div class="searchrow"><label class="search">${svg('search')}<input id="q" type="search" placeholder="Search recipes or ingredients" value="${esc(ui.q)}" autocomplete="off" enterkeyhint="search"><button class="clear" id="qClear" aria-label="Clear search" ${ui.q ? '' : 'hidden'}>×</button></label>
        <button class="filterbtn ${fc ? 'on' : ''}" id="filterBtn" aria-label="Filters">${svg('filter')}${fc ? `<b>${fc}</b>` : ''}</button></div>
      ${fc ? `<div class="activefilters">${Object.entries(ui.filters).flatMap(([k, s]) => s.map((v) => `<button data-k="${k}" data-v="${esc(v)}">${esc(TAGLABEL[k + ':' + v])}</button>`)).join('')}</div>` : ''}
    </div><div class="wrap" id="homeBody" style="padding-top:0">${body}</div>`);
  const q = $('#q'); const qc = $('#qClear');
  // the input is never replaced while typing, so it keeps focus, caret and the keyboard; results follow ~120ms later
  q.oninput = () => {
    qc.hidden = !q.value; clearTimeout(viewHome.qT);
    viewHome.qT = setTimeout(() => { const v = q.value.trim(); if (v === ui.q) return; ui.q = v; viewHome(true); }, 120);
  };
  qc.onpointerdown = (e) => e.preventDefault(); // keep the keyboard steady
  qc.onclick = (e) => { e.preventDefault(); clearTimeout(viewHome.qT); ui.q = ''; q.value = ''; qc.hidden = true; viewHome(true); };
  $('#filterBtn').onclick = openFilters;
  const redraw = () => viewHome();
  $('#clearAll') && ($('#clearAll').onclick = () => { ui.q = ''; ui.filters = {}; viewHome(); });
  bindSort(viewHome);
  $('#spinRes') && ($('#spinRes').onclick = openRandom);
  $('#pickYes') && ($('#pickYes').onclick = (e) => { const t = whoseTurn(); const pid = uid(); state.picks[pid] = { id: pid, recipeId: ui.pick, ok: true, date: todayISO(), by: t }; state.turn = other(t); heartBurst(e.currentTarget); setTonight(ui.pick, true); state.tonight.by = t; save(); redraw(); toast(`Tonight: ${summary(ui.pick).title} ♥`); });
  $('#turnBtn') && ($('#turnBtn').onclick = () => { state.turn = other(whoseTurn()); save(); redraw(); });
  $('#ideasBtn') && ($('#ideasBtn').onclick = () => openIdeas());
  $('#wnX') && ($('#wnX').onclick = $('#wnOk').onclick = () => { state.seenWhatsNew = WHATSNEW_ID; save(); redraw(); });
  $('#wnMore') && ($('#wnMore').onclick = () => { openWhatsNew(); });
  $('#bkNow') && ($('#bkNow').onclick = () => { exportBackup(); redraw(); });
  $('#bkLater') && ($('#bkLater').onclick = () => { state.settings.backupSnooze = now() + DAYS(7); save(); redraw(); toast("I'll remind you next week"); });
  $('#recapX') && ($('#recapX').onclick = () => { state.recapSeen[lastMonthKey()] = now(); save(); redraw(); });
  $('#flashX') && ($('#flashX').onclick = (e) => { e.preventDefault(); state.flashSeen[todayISO()] = now(); save(); redraw(); });
  $('#anX') && ($('#anX').onclick = () => { const a = annivSoon(); if (a) state.annivSeen[a.key] = now(); save(); redraw(); });
  $('#anPlan') && ($('#anPlan').onclick = () => { const a = annivSoon(); if (!a) return; const [, m, d] = state.settings.anniversary.split('-').map(Number); openDateNight({ date: isoOf(new Date(+a.key, m - 1, d)), recipeId: a.sug && a.sug.id }); });
  $('#pickNo') && ($('#pickNo').onclick = () => {
    logPick(ui.pick, false);
    const others = recipes.filter((r) => r.id !== ui.pick);
    if (!others.length) { toast("It's the only recipe in the book so far — more are coming soon ♥"); return; }
    ui.pick = others[Math.floor(Math.random() * others.length)].id; redraw();
  });
  $('#tnCook') && ($('#tnCook').onclick = () => { ui.autoCook = tonightPlan().recipeId; go('#/r/' + ui.autoCook); });
  $('#tnTime') && ($('#tnTime').onclick = openEatAt);
  $('#tnChange') && ($('#tnChange').onclick = () => { const prev = state.tonight; state.tonight = null; save(); redraw(); toast('Plan cleared — pick another', 'Undo', () => { state.tonight = prev; save(); redraw(); }); });
  $('#tnClear') && ($('#tnClear').onclick = () => { state.tonight = null; save(); redraw(); });
  $('#tnDish') && ($('#tnDish').onclick = openCoinFlip);
  $('#randBtn') && ($('#randBtn').onclick = openRandom);
  $('#canMake') && ($('#canMake').onclick = openCanMake);
  $$('[data-again]').forEach((b) => (b.onclick = () => { ui.autoCook = b.dataset.again; go('#/r/' + b.dataset.again); }));
  $$('[data-ate]').forEach((b) => (b.onclick = () => { const l = state.leftovers[b.dataset.ate]; const bak = { ...l }; l.portions--; if (l.portions <= 0) delete state.leftovers[l.id]; save(); redraw(); toast(l.portions > 0 ? 'Enjoy lunch ♥' : 'All gone — nice!', 'Undo', () => { state.leftovers[bak.id] = bak; save(); redraw(); }); }));
  $$('.activefilters button').forEach((b) => (b.onclick = () => { ui.filters[b.dataset.k] = ui.filters[b.dataset.k].filter((v) => v !== b.dataset.v); viewHome(); }));
}

// ---------------------------------------------------------------- seasonal layer: snow Nov–Feb, Valentine's hearts, anniversary hearts (#30)
function isValentine() { const t = new Date(); return t.getMonth() === 1 && t.getDate() >= 7 && t.getDate() <= 15; }
function applySeason() {
  let layer = $('#season');
  const mo = new Date().getMonth();
  const hearts = (nearAnniversary() && state.settings.hearts !== false) || (isValentine() && state.settings.seasonal !== false);
  const snow = (mo >= 10 || mo <= 1) && state.settings.snow !== false;
  const kind = hearts ? 'hearts' : snow ? 'snow' : '';
  document.body.classList.toggle('valentine', isValentine() && state.settings.seasonal !== false);
  document.body.classList.toggle('october', mo === 9 && state.settings.seasonal !== false);
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

// ---------------------------------------------------------------- favourites by who (#46), nicknames (#58), signature (#55)
function favWho(id) { return state.favBy[id] || {}; }
function isCoupleFav(id) { const w = favWho(id); return !!(w.Corey && w.Faith); }
function toggleFav(id, el) {
  const me = state.profile.me;
  if (state.favourites[id]) {
    delete state.favourites[id];
    if (state.favBy[id]) { if (me) delete state.favBy[id][me]; if (!me || !Object.keys(state.favBy[id]).length) delete state.favBy[id]; }
    toast('Removed from favourites');
  } else {
    state.favourites[id] = now();
    if (me) state.favBy[id] = { ...(state.favBy[id] || {}), [me]: now() };
    if (el) heartBurst(el);
    toast(isCoupleFav(id) ? 'A favourite for both of you ♥♥' : 'Saved to favourites ♥');
  }
  save(); checkMilestones();
}
function toggleLove(id, who) {
  const w = { ...(state.favBy[id] || {}) };
  if (w[who]) delete w[who]; else w[who] = now();
  if (Object.keys(w).length) { state.favBy[id] = w; if (!state.favourites[id]) state.favourites[id] = now(); }
  else { delete state.favBy[id]; delete state.favourites[id]; }
  save(); checkMilestones();
}
function nickLine(id) { const n = state.nicknames[id]; return n ? `<p class="nick">aka “${esc(n)}”</p>` : ''; }
function openNickname(id, r) {
  openSheet(`<h2>Our name for it</h2><p class="sub">A nickname shows under the real name — “${esc(r.title)}” stays searchable.</p>
    <div class="field"><label>Nickname</label><input id="nkIn" maxlength="40" value="${esc(state.nicknames[id] || '')}" placeholder="e.g. Sunday Night Special" autocomplete="off"></div>
    <div class="foot"><button class="btn" id="nkDel">${state.nicknames[id] ? 'Remove' : 'Cancel'}</button><button class="btn primary" id="nkOk">Save</button></div>`, (b) => {
    $('#nkOk', b).onclick = () => { const v = $('#nkIn', b).value.trim(); if (v) state.nicknames[id] = v; else delete state.nicknames[id]; save(); closeSheet(); rerenderRecipe(id); };
    $('#nkDel', b).onclick = () => { delete state.nicknames[id]; save(); closeSheet(); rerenderRecipe(id); };
  });
}
function setSignature(id) {
  const prev = state.signature;
  state.signature = prev === id ? null : id; save(); checkMilestones();
  toast(state.signature ? 'Our signature dish ★' : 'Signature dish cleared', 'Undo', () => { state.signature = prev; save(); router(); });
}
function rerenderRecipe(id) { return viewRecipe(id); } // render() keeps the scroll position

// ---------------------------------------------------------------- recipe page extras: have-check (#32), we're out (#38), tap-to-use (#33)
const PANTRY_SKIP = /^(salt|black pepper|water|kosher salt)$/i;
function pantryNeeds(r) {
  const seen = {}; const out = [];
  r.groups.forEach((g) => g.items.forEach((it) => { if (!it.pantry || it.optional || PANTRY_SKIP.test(it.pantry.name)) return; const k = pantryKey(it.pantry.name); if (seen[k]) return; seen[k] = 1; out.push({ k, name: it.pantry.name, l: levelOf(k) }); }));
  return out;
}
function haveCard(r) {
  if (!Object.values(state.pantry).some((p) => p.level)) return '';
  const need = pantryNeeds(r); if (!need.length) return '';
  const miss = need.filter((x) => !x.l || x.l === 'out'); const low = need.filter((x) => x.l === 'low');
  const have = need.length - miss.length;
  return `<div class="havecard ${miss.length ? '' : 'ok'}"><div class="hv-n"><b>${have}</b><span>of ${need.length}</span></div>
    <div class="hv-t"><b>${miss.length ? `Missing ${miss.length}` : 'You have everything ♥'}</b><span>${miss.length ? esc(miss.slice(0, 5).map((x) => x.name).join(', ')) + (miss.length > 5 ? ` +${miss.length - 5}` : '') : low.length ? 'Running low: ' + esc(low.map((x) => x.name).join(', ')) : 'Based on Our Pantry'}</span></div>
    ${miss.length ? `<button class="btn sm plum" id="haveAdd">${svg('cart')}Add</button>` : ''}</div>`;
}
const outBtn = (it) => (it.pantry && !PANTRY_SKIP.test(it.pantry.name) ? `<button class="outbtn ${levelOf(pantryKey(it.pantry.name)) === 'out' ? 'on' : ''}" data-out="1" aria-label="We're out of ${esc(it.name)}" title="We're out">${svg('cart')}</button>` : '');
function weAreOut(it, r, f, btn) {
  const k = pantryKey(it.pantry.name); const prevP = state.pantry[k] ? { ...state.pantry[k] } : null; const prevG = JSON.stringify(state.grocery);
  state.pantry[k] = { ...(state.pantry[k] || { name: it.pantry.name, cat: it.pantry.cat }), name: it.pantry.name, cat: it.pantry.cat || 'other', level: 'out', at: now() };
  const amt = it.qty != null ? [{ q: Math.round(it.qty * f * 1000) / 1000, u: it.unit || null, from: r.title }] : null;
  const added = addGrocery(it.pantry.name, it.pantry.cat, k, r.title, amt); save();
  if (btn) { btn.classList.add('on'); const li = btn.closest('li'); const tx = li && $('.txt', li); if (tx && !$('.have', tx)) tx.insertAdjacentHTML('beforeend', '<span class="have out">Out</span>'); }
  toast(added ? `${it.pantry.name} → grocery list` : `${it.pantry.name} is already on the list`, 'Undo', () => { if (prevP) state.pantry[k] = prevP; else delete state.pantry[k]; state.grocery = JSON.parse(prevG); save(); rerenderRecipe(r.id); });
}
function useChips(r, st, id, f) {
  if (!st.uses || !st.uses.length) return '';
  const used = (ui.used && ui.used[id]) || {};
  return `<span class="uses">${st.uses.map((ref) => { const t = stepUses(r, { uses: [ref] }, f)[0]; return t ? `<button class="use ${used[ref] ? 'on' : ''}" data-use="${esc(ref)}" aria-label="Mark ${esc(t)} as used">${esc(t)}</button>` : ''; }).join('')}</span>`;
}
const LEVEL_DOWN = { lots: 'have', have: 'low', low: 'out' };
function useIngredient(r, id, ref, btn) {
  ui.used = ui.used || {}; const used = ui.used[id] || (ui.used[id] = {});
  const [gi, ii] = ref.split('=')[0].split('-').map(Number); const it = r.groups[gi] && r.groups[gi].items[ii]; if (!it) return;
  if (used[ref]) { // un-mark: just the chip, pantry changes are undone with the toast
    delete used[ref]; $$(`[data-use="${CSS.escape(ref)}"]`).forEach((b) => b.classList.remove('on')); return;
  }
  used[ref] = 1; $$(`[data-use="${CSS.escape(ref)}"]`).forEach((b) => b.classList.add('on')); buzz(10);
  if (!it.pantry || PANTRY_SKIP.test(it.pantry.name)) return;
  const k = pantryKey(it.pantry.name); const cur = levelOf(k);
  if (!cur || cur === 'out') { if (!cur) toast(`Used ✓ — track ${it.pantry.name} in the Pantry to count it down`); return; }
  const prev = { ...state.pantry[k] }; const nx = LEVEL_DOWN[cur]; const gSnap = JSON.stringify(state.grocery);
  state.pantry[k] = { ...prev, level: nx, at: now() };
  let added = false;
  if (nx === 'out' && state.settings.autoRestock !== false) added = addGrocery(it.pantry.name, it.pantry.cat, k, r.title);
  save();
  const lab = { have: 'have some left', low: 'running low', out: 'out' };
  toast(`${it.pantry.name}: ${lab[nx]}${added ? ' · on the list' : ''}`, 'Undo', () => { state.pantry[k] = prev; state.grocery = JSON.parse(gSnap); delete used[ref]; save(); $$(`[data-use="${CSS.escape(ref)}"]`).forEach((b) => b.classList.remove('on')); });
}

// ---------------------------------------------------------------- cook for me (#44)
function cookForMe(r, id) {
  const me = state.profile.me; const you = me ? other(me) : null;
  const lines = [
    `${me ? me + ' is' : "I'm"} craving ${r.title} 🥺 Cook for me tonight? ♥`,
    `Pretty please? ${r.title} would make my whole day ♥`,
    `Hungry heart alert: ${r.title}. Cook it with me? I'll do the dishes 🧽♥`,
    `${you ? you + ', ' : ''}I've been thinking about ${r.title} all day… ♥`,
  ];
  const text = lines[Math.floor(Math.random() * lines.length)];
  const url = location.origin + location.pathname + '#/r/' + id;
  if (navigator.share) navigator.share({ title: 'Cook for me? ♥', text, url }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(() => toast(`Copied — paste it to ${you || 'your love'} ♥`)).catch(() => toast(text));
  else toast(text);
}

// ---------------------------------------------------------------- "More…" sheet on a recipe (keeps the page uncluttered)
function openRecipeMore(r, s, id) {
  const sig = state.signature === id; const pend = pendingTaste(id);
  openSheet(`<div class="cmhead">${s.image ? `<div class="im">${img(thumb(s.image), '')}</div>` : ''}<div><div class="num">${esc(recipeLabel(s))}</div><b>${esc(r.title)}</b>${nickLine(id)}</div></div>
    <div class="menu">
      <button data-a="nick">${svg('edit')}<span>${state.nicknames[id] ? 'Change our nickname' : 'Give it our nickname'}</span></button>
      <button data-a="sig">${svg('star')}<span>${sig ? 'Remove as signature dish' : 'Make it our signature dish'}</span></button>
      <button data-a="taste">${svg('thumbUp')}<span>${pend ? 'Taste test is on — reveal' : 'Taste test: guess hit or miss'}</span></button>
      <button data-a="date">${svg('heart')}<span>Plan a date night with it</span></button>
      <button data-a="print">${svg('print')}<span>Print</span></button>
      <a href="#/add/${id}">${svg('edit')}<span>Edit recipe</span></a>
      ${r.custom ? `<button data-a="export">${svg('share')}<span>Export file</span></button>` : ''}
      <button data-a="hide">${svg('eyeoff')}<span>Hide meal</span></button></div>`, (b) => {
    $$('[data-a]', b).forEach((x) => (x.onclick = () => {
      const a = x.dataset.a;
      if (a === 'nick') openNickname(id, r);
      else if (a === 'sig') { closeSheet(); setSignature(id); rerenderRecipe(id); }
      else if (a === 'taste') openTasteTest(id);
      else if (a === 'date') openDateNight({ recipeId: id });
      else if (a === 'print') { closeSheet(); setTimeout(printRecipe, 300); }
      else if (a === 'export') { closeSheet(); exportRecipeFile(r); }
      else if (a === 'hide') { closeSheet(); state.hidden[id] = now(); save(); go('#/'); toast('Hidden from your lists', 'Undo', () => { delete state.hidden[id]; save(); router(); }); }
    }));
  });
}

// ---------------------------------------------------------------- rate it together (#23)
function heartsScore(id) {
  const es = cookedEntries(id).filter((c) => c.hearts && (c.hearts.Corey || c.hearts.Faith));
  if (!es.length) return null;
  const sum = { Corey: [], Faith: [] }; es.forEach((c) => ['Corey', 'Faith'].forEach((n) => { if (c.hearts[n]) sum[n].push(c.hearts[n]); }));
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const c = avg(sum.Corey), f = avg(sum.Faith); const both = [c, f].filter((x) => x != null);
  return { corey: c, faith: f, score: both.reduce((x, y) => x + y, 0) / both.length, n: es.length };
}
const r1 = (x) => (Math.round(x * 10) / 10).toString();
function heartsPicker(cur) {
  return `<div class="hearts2">${['Corey', 'Faith'].map((n) => `<div class="hp" data-hp="${n}">${hat(n, 18)}<b>${n}</b><div class="rate">${[1, 2, 3, 4, 5].map((v) => `<button type="button" data-hv="${v}" class="${(cur[n] || 0) >= v ? 'on' : ''}" aria-label="${n}: ${v} of 5">${svg('heart')}</button>`).join('')}</div></div>`).join('')}</div>`;
}
function bindHearts(b, cur) {
  $$('[data-hp]', b).forEach((row) => $$('[data-hv]', row).forEach((x) => (x.onclick = () => { const n = row.dataset.hp; const v = +x.dataset.hv; cur[n] = cur[n] === v ? 0 : v; $$('[data-hv]', row).forEach((y) => y.classList.toggle('on', +y.dataset.hv <= cur[n])); })));
}

// ---------------------------------------------------------------- after cooking: confetti (#22), photo nudge (#36), sweet notes (#47)
const SWEET = [
  'Best sous-chef ever. ♥', 'That smelled like home.', 'Another dinner, another memory.', 'Cooked with love — you can taste it.',
  'Table for two, perfectly set.', 'Kitchen dance break earned. ♥', 'Proud of us, chef.', 'Good food, better company.',
];
function afterCooked(id, first) {
  if (first) { confetti(); playChime('marimba'); }
  const hasPhotoToday = (state.photos[id] || []).some((p) => p.date === todayISO());
  setTimeout(() => {
    if (first) toast('First time making it — a new memory ♥');
    else if (!hasPhotoToday && Math.random() < 0.5 && location.hash === '#/r/' + id) photoNudge(id);
    else if (Math.random() < 0.6) toast(SWEET[Math.floor(Math.random() * SWEET.length)]);
  }, 2900);
  if (first && !hasPhotoToday) setTimeout(() => { if (location.hash === '#/r/' + id && $('#sheetWrap').hidden) photoNudge(id); }, 6200);
}
function photoNudge(id) {
  const t = $('#toast');
  t.innerHTML = `Snap a photo for your story? <label class="tlink">Add photo<input type="file" accept="image/*" hidden></label>`;
  $('input', t).onchange = (e) => { t.classList.remove('show'); addPhoto(id, e.target.files[0]); };
  t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 6500);
}

// ---------------------------------------------------------------- photo viewer with love stamps (#54)
const STAMPS = [['heart', 'Love', '♥'], ['star', 'Star', '★'], ['kiss', "Chef's kiss", '']];
function stampHTML(ph, small) {
  const s = ph.stamps || []; if (!s.length) return '';
  return `<span class="stamps ${small ? 'sm' : ''}">${s.map((k) => `<i class="st st-${k}">${k === 'kiss' ? '<em>CHEF’S<br>KISS</em>' : k === 'star' ? '★' : '♥'}</i>`).join('')}</span>`;
}
function viewPhoto(id, pid) {
  const ph = (state.photos[id] || []).find((p) => p.id === pid); if (!ph) return;
  const draw = (b) => {
    b.innerHTML = `<div class="phview"><img src="${ph.data}" alt="">${stampHTML(ph)}</div><p class="sub" style="margin-top:8px">${esc(shortDate(ph.date))}</p>
      <div class="small muted" style="margin-top:12px">Love stamps</div>
      <div class="stamprow">${STAMPS.map(([k, n]) => `<button class="${(ph.stamps || []).includes(k) ? 'on' : ''}" data-st="${k}"><i class="st st-${k}">${k === 'kiss' ? '<em>CHEF’S<br>KISS</em>' : k === 'star' ? '★' : '♥'}</i><span>${n}</span></button>`).join('')}</div>
      <div class="foot"><button class="btn danger" id="phDel">Delete</button><button class="btn primary" data-close>Done</button></div>`;
    $$('[data-st]', b).forEach((x) => (x.onclick = () => { const k = x.dataset.st; const s = ph.stamps || []; ph.stamps = s.includes(k) ? s.filter((y) => y !== k) : s.concat(k); if (!ph.stamps.length) delete ph.stamps; save(); buzz(10);
      // in place: the photo itself is never re-inserted (no flicker), only the stamp overlay and this button change
      x.classList.toggle('on', (ph.stamps || []).includes(k)); const pv = $('.phview', b); const old = $('.stamps', pv); if (old) old.remove(); pv.insertAdjacentHTML('beforeend', stampHTML(ph));
      if (location.hash === '#/r/' + id) rerenderRecipe(id); }));
    $('#phDel', b).onclick = () => { closeSheet(); withUndo('Photo deleted', () => { state.photos[id] = state.photos[id].filter((p) => p.id !== pid); }, () => router()); };
  };
  openSheet('', draw);
}

// ---------------------------------------------------------------- bindings for the extras on the recipe page
function bindRecipeExtras(r, s, id, f, cost) {
  $('#haveAdd') && ($('#haveAdd').onclick = () => openMissing(r, s, f));
  $('#moreBtn').onclick = () => openRecipeMore(r, s, id);
  $('#cravBtn').onclick = () => cookForMe(r, id);
  $('#tonightBtn').onclick = () => { const t = tonightPlan(); if (t && t.recipeId === id) { state.tonight = null; save(); toast('Removed from tonight'); } else setTonight(id); rerenderRecipe(id); };
  $('#tasteChip') && ($('#tasteChip').onclick = () => openTasteTest(id));
  $$('[data-love]').forEach((b) => (b.onclick = () => { toggleLove(id, b.dataset.love); const on = !!favWho(id)[b.dataset.love]; b.classList.toggle('on', on); if (on) heartBurst(b); $('#favBtn').classList.toggle('on', !!state.favourites[id]); if (isCoupleFav(id) && on) toast('A favourite for both of you ♥♥'); }));
  $$('button.use').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); useIngredient(r, id, b.dataset.use, b); }));
  if (ui.autoCook === id) { ui.autoCook = null; setTimeout(() => openCook(r, s, f), 120); }
}

// ---------------------------------------------------------------- grocery in No Frills aisle order (#13), swipe rows (#28), date mode (#57)
const AISLES = [['produce', 'Produce'], ['bakery', 'Bakery'], ['meat', 'Meat & Seafood'], ['dairy', 'Dairy & Eggs'], ['pantry', 'Pantry & Dry Goods'], ['canned', 'Canned'], ['spices', 'Spices'], ['frozen', 'Frozen'], ['other', 'Other']];
const AISLE_NAME = Object.fromEntries(AISLES);
function aisleOf(g) {
  if (g.aisle && AISLE_NAME[g.aisle]) return g.aisle;
  const n = (g.name || '').toLowerCase(); const c = g.cat || 'other';
  if (/frozen|ice cream/.test(n) || c === 'frozen') return 'frozen';
  if (c === 'meat') return 'meat';
  if (/\b(bread|buns?|rolls?|tortillas?|wraps?|bagels?|pitas?|naan|hoagie|baguette|croissants?|english muffins?)\b/.test(n)) return 'bakery';
  if (c === 'dairy' || /\b(eggs?|milk|cream|cheese|butter|yogu?rt|ricotta|provolone|mozzarella|cheddar|parmesan)\b/.test(n)) return 'dairy';
  if (c === 'produce') return 'produce';
  if (/canned|\bcans?\b|tomato paste|crushed tomato|diced tomato|tomato sauce|passata|\bbeans\b|chickpeas|broth|stock|coconut milk|pumpkin pur/.test(n)) return 'canned';
  if (c === 'spices' || /\bsalt\b|black pepper|peppercorn|powder|paprika|seasoning|cumin|oregano|thyme|cinnamon|nutmeg|bay lea|ground ginger|sesame seeds|chili powder|spice/.test(n)) return 'spices';
  if (['grains', 'sauces', 'baking'].includes(c)) return 'pantry';
  if (/rice|pasta|noodle|spaghetti|flour|sugar|oil|vinegar|sauce|honey|oats|peanut butter|cornstarch|baking/.test(n)) return 'pantry';
  return 'other';
}
function grocRow(g, gd) {
  const who = gd && gd.split && gd.split[g.id];
  return `<li data-g="${g.id}" class="swr ${g.checked ? 'done' : ''}"><div class="swb"><span>${svg('check')}${g.checked ? 'Untick' : 'Got it'}</span><span>Delete${svg('close')}</span></div>
    <div class="swf"><span class="box">${CHECK}</span><span class="txt">${esc(g.name)}${g.amounts && g.amounts.length ? ` <span class="gamt">${esc(sumAmounts(g.amounts))}</span>` : ''}${g.from ? `<span class="from">for ${esc(g.from)}</span>` : ''}</span>
    ${gd ? `<button class="whobtn ${who ? 'on' : ''}" data-who="${g.id}" aria-label="Who grabs ${esc(g.name)}">${who ? hat(who, 18) : '<span class="nobody">who?</span>'}</button>` : `<button class="del" data-del="${g.id}" aria-label="Remove ${esc(g.name)}">×</button>`}</div></li>`;
}
function dateModeCard(items) {
  const gd = state.groceryDate; const mins = Math.max(0, Math.round((now() - gd.start) / 6e4));
  const got = items.filter((g) => g.checked && (g.checkedAt || 0) >= gd.start);
  let spent = 0, priced = 0; got.forEach((g) => { const p = priceOf(g.key); if (p) { spent += p.price; priced++; } });
  const left = items.filter((g) => !g.checked); const t = tripEstimate();
  const cnt = (n) => left.filter((g) => gd.split[g.id] === n).length;
  return `<div class="gdate"><div class="gd-k">${svg('heart')}GROCERY DATE · ${mins} MIN<button class="x" id="gdEnd" aria-label="Finish">Done</button></div>
    <div class="gd-row"><div><b>~${money(spent)}</b><span>in the cart${got.length ? ` · ${got.length} item${got.length === 1 ? '' : 's'}` : ''}</span></div><div><b>~${money(t.total)}</b><span>still to grab</span></div></div>
    <div class="gd-split"><span>${hat('Corey', 16)}Corey ${cnt('Corey')}</span><span>${hat('Faith', 16)}Faith ${cnt('Faith')}</span><button class="btn sm ghost" id="gdSplit">Split by aisle</button></div>
    <div class="segtext gd-view" style="grid-template-columns:repeat(3,1fr)">${['All', 'Corey', 'Faith'].map((n) => `<button data-gv="${n}" class="${(ui.gview || 'All') === n ? 'on' : ''}">${n === 'All' ? 'Everything' : n + "'s list"}</button>`).join('')}</div></div>`;
}
function viewGrocery() {
  setTop({ title: 'GROCERY LIST' });
  const items = Object.values(state.grocery);
  const left = items.filter((g) => !g.checked).length;
  const done = items.length - left;
  const gd = state.groceryDate && state.groceryDate.on ? state.groceryDate : null;
  if (gd && !gd.split) gd.split = {};
  const gv = gd ? ui.gview || 'All' : 'All';
  const shown = items.filter((g) => gv === 'All' || gd.split[g.id] === gv);
  render(`<div class="wrap">
    <div class="kicker">No Frills run<span class="rule"></span></div>
    <h1 class="h1" style="margin-top:6px">Grocery List</h1>
    <p class="lead" style="margin-top:4px">${left ? `${left} thing${left === 1 ? '' : 's'} to grab` : items.length ? 'All done — nice.' : 'Empty for now.'}</p>
    ${gd ? dateModeCard(items) : (() => { const t = tripEstimate(); return t.n && t.priced ? `<div class="trip"><span>Estimated trip</span><b>~${money(t.total)}</b><small>${t.priced === t.n ? 'all' : t.priced + ' of ' + t.n} items priced · typical No Frills packs${Object.keys(state.prices).length ? ' + your receipts' : ''}</small></div>` : ''; })()}
    <div class="btnrow" style="margin-top:10px">${gd ? '' : `<button class="btn ghost" id="gdStart" ${left ? '' : 'disabled style="opacity:.4"'}>${svg('heart')}Shop together</button>`}<button class="btn ghost" id="scanG" ${gd ? 'style="grid-column:1/-1"' : ''}>${svg('camera')}Scan receipt</button></div>
    <div class="addrow"><input id="gNew" placeholder="Add an item…" enterkeyhint="done" autocomplete="off"><button class="btn primary" id="gAdd" aria-label="Add">${svg('plus')}</button>
      <select id="gCat" aria-label="Aisle"><option value="">Aisle: auto</option>${AISLES.map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('')}</select></div>
    ${items.length ? `<p class="small muted swhint">Swipe right to tick · left to delete${gd ? ' · tap the hat to say who grabs it' : ''}</p>` : ''}
    ${items.length ? AISLES.map(([ak, an]) => {
      const rows = shown.filter((g) => aisleOf(g) === ak).sort((a, b) => a.checked - b.checked || a.name.localeCompare(b.name));
      if (!rows.length) return '';
      return `<div class="pgroup"><div class="gh">${esc(an)}<span>${rows.filter((g) => !g.checked).length} left</span></div><ul class="checklist glist">${rows.map((g) => grocRow(g, gd)).join('')}</ul></div>`;
    }).join('') || '<div class="empty" style="margin-top:14px">Nothing on this list yet — tap a hat on “Everything” to split it.</div>' : `<div class="empty" style="margin-top:16px">Add things here, or tap “Add to grocery list” on a recipe, or “+ Grocery list” on anything running low in the Pantry.</div>`}
    ${items.length ? `<div class="gsummary"><span>${done} checked</span><span style="display:flex;gap:8px"><button class="btn sm ghost" id="gClear" ${done ? '' : 'disabled style="opacity:.4"'}>Clear checked</button><button class="btn sm ghost" id="gAll">Clear all</button></span></div>
    <p class="small muted" style="margin-top:10px">Checking something off marks it “Have it” in the Pantry. Sorted in No Frills aisle order.</p>` : ''}
  </div>`);
  const redraw = () => viewGrocery();
  const add = () => {
    const v = $('#gNew').value.trim(); if (!v) return;
    const a = $('#gCat').value;
    addGrocery(v, guessCat(v), pantryKey(v), '');
    if (a) { const g = Object.values(state.grocery).find((x) => x.key === pantryKey(v) && !x.checked); if (g) g.aisle = a; }
    save(); redraw(); $('#gNew').focus();
  };
  $('#gAdd').onclick = add; $('#gNew').onkeydown = (e) => { if (e.key === 'Enter') add(); };
  const tick = (id, li) => {
    const g = state.grocery[id]; if (!g) return; g.checked = !g.checked; g.at = now();
    if (g.checked) { g.checkedAt = now(); g.checkedBy = state.profile.me || null; } else { delete g.checkedAt; delete g.checkedBy; }
    if (g.checked && !g.dog) { const p = state.pantry[g.key] || { name: g.name, cat: g.cat }; state.pantry[g.key] = { ...p, level: 'have', at: now() }; }
    save(); if (li) li.classList.toggle('done', g.checked);
    setTimeout(redraw, 260);
  };
  const del = (id) => { const g = state.grocery[id]; if (!g) return; delete state.grocery[id]; if (gd) delete gd.split[id]; save(); redraw(); toast(`Removed ${g.name}`, 'Undo', () => { state.grocery[g.id] = g; save(); redraw(); }); };
  $$('li[data-g]').forEach((li) => {
    li.onclick = (e) => { if (li.dataset.sw || e.target.closest('.del,.whobtn')) return; tick(li.dataset.g, li); };
    swipeRow(li, (dir) => { if (dir > 0) tick(li.dataset.g, li); else del(li.dataset.g); });
  });
  $$('[data-del]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); del(b.dataset.del); }));
  $$('[data-who]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const id = b.dataset.who; const cur = gd.split[id]; const nx = !cur ? 'Corey' : cur === 'Corey' ? 'Faith' : null; if (nx) gd.split[id] = nx; else delete gd.split[id]; save(); redraw(); }));
  $('#gClear') && ($('#gClear').onclick = () => { const bak = { ...state.grocery }; Object.values(state.grocery).forEach((g) => { if (g.checked) delete state.grocery[g.id]; }); save(); redraw(); toast('Cleared checked items', 'Undo', () => { state.grocery = bak; save(); redraw(); }); });
  $('#gAll') && ($('#gAll').onclick = () => confirmSheet('Clear the whole list?', 'This removes every item, checked or not.', 'Clear all', () => withUndo('List cleared', () => { state.grocery = {}; }, viewGrocery), true));
  $('#scanG').onclick = openScan;
  $('#gdStart') && ($('#gdStart').onclick = () => { state.groceryDate = { on: true, start: now(), split: {} }; ui.gview = 'All'; save(); redraw(); toast('Grocery date ♥ — have fun, you two'); });
  $('#gdSplit') && ($('#gdSplit').onclick = () => {
    const lefts = items.filter((g) => !g.checked); const by = {}; lefts.forEach((g) => { const a = aisleOf(g); (by[a] = by[a] || []).push(g); });
    const tally = { Corey: 0, Faith: 0 };
    AISLES.forEach(([a]) => { const gs = by[a]; if (!gs) return; const who = tally.Corey <= tally.Faith ? 'Corey' : 'Faith'; gs.forEach((g) => { gd.split[g.id] = who; }); tally[who] += gs.length; });
    save(); redraw(); toast(`Split by aisle · Corey ${tally.Corey}, Faith ${tally.Faith}`);
  });
  $$('[data-gv]').forEach((b) => (b.onclick = () => { ui.gview = b.dataset.gv; redraw(); }));
  $('#gdEnd') && ($('#gdEnd').onclick = () => {
    const got = Object.values(state.grocery).filter((g) => g.checked && (g.checkedAt || 0) >= gd.start);
    let spent = 0; got.forEach((g) => { const p = priceOf(g.key); if (p) spent += p.price; });
    const mins = Math.max(1, Math.round((now() - gd.start) / 6e4)); const prev = state.groceryDate;
    state.groceryDate = { ...prev, on: false, end: now() }; save(); redraw();
    toast(`Grocery date done ♥ ${got.length} items · ~${money(spent)} · ${mins} min`, 'Undo', () => { state.groceryDate = prev; save(); redraw(); });
  });
}
function swipeRow(li, done) {
  const f = $('.swf', li); if (!f) return;
  let sx = null, sy = 0, dx = 0, on = false;
  li.addEventListener('touchstart', (e) => { if (e.touches.length !== 1) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; on = false; if (sx < 26) sx = null; }, { passive: true });
  li.addEventListener('touchmove', (e) => {
    if (sx == null) return; const t = e.touches[0]; dx = t.clientX - sx; const dy = t.clientY - sy;
    if (!on) { if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { sx = null; return; } if (Math.abs(dx) > 12) { on = true; li.dataset.sw = '1'; } }
    if (on) { e.preventDefault(); f.style.transition = 'none'; f.style.transform = `translateX(${dx}px)`; li.classList.toggle('swr-l', dx < 0); li.classList.toggle('swr-go', Math.abs(dx) > 90); }
  }, { passive: false });
  li.addEventListener('touchend', () => {
    if (sx == null) return; sx = null;
    if (!on) return;
    const go = Math.abs(dx) > 90; f.style.transition = 'transform .2s ease';
    if (go && dx < 0) { f.style.transform = 'translateX(-110%)'; buzz(15); setTimeout(() => done(-1), 180); }
    else { f.style.transform = ''; if (go) { buzz(12); done(1); } }
    setTimeout(() => { delete li.dataset.sw; li.classList.remove('swr-l', 'swr-go'); }, 260);
  }, { passive: true });
}

// ---------------------------------------------------------------- streak (#19)
function weekStart(iso) { const d = dateOf(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoOf(d); }
function streakInfo() {
  const counts = {}; realDinners().forEach((c) => { const k = weekStart(c.date); counts[k] = (counts[k] || 0) + 1; });
  const wk = weekStart(todayISO()); const thisWeek = counts[wk] || 0;
  let cur = thisWeek >= 3 ? wk : addDaysISO(wk, -7); let streak = 0;
  while ((counts[cur] || 0) >= 3) { streak++; cur = addDaysISO(cur, -7); }
  let best = 0, run = 0; const weeks = Object.keys(counts).sort();
  if (weeks.length) { let w = weeks[0]; while (w <= wk) { if ((counts[w] || 0) >= 3) { run++; best = Math.max(best, run); } else run = 0; w = addDaysISO(w, 7); } }
  return { streak, thisWeek, best, toGo: Math.max(0, 3 - thisWeek) };
}
function streakHTML(si) {
  return `<div class="streak ${si.streak ? 'on' : ''}"><svg viewBox="0 0 24 24" class="flame" aria-hidden="true">${ICON.flame}</svg>
    <div><b>${si.streak ? `${si.streak}-week streak` : 'Start a streak'}</b><span>${si.toGo ? `${si.thisWeek} of 3 dinners this week — ${si.toGo} more to ${si.streak ? 'keep it going' : 'light the flame'}` : '3+ dinners this week ✓'}${si.best > si.streak ? ` · best ${si.best}` : ''}</span></div></div>`;
}

// ---------------------------------------------------------------- badges (#20) — extends the milestones (keys are add-only)
const MILESTONES = [
  ['d1', 'First dinner logged', (x) => x.n >= 1, 'pot'], ['d10', '10 dinners together', (x) => x.n >= 10, 'pot'], ['d25', '25 dinners together', (x) => x.n >= 25, 'pot'],
  ['d50', '50 dinners together', (x) => x.n >= 50, 'pot'], ['d100', '100 dinners together', (x) => x.n >= 100, 'pot'],
  ['r5', '5 different recipes tried', (x) => x.distinct >= 5, 'book'], ['rall', 'Cooked every recipe in the book', (x) => x.allBook, 'book'],
  ['p1', 'First photo memory', (x) => x.photos >= 1, 'camera'], ['p10', '10 photo memories', (x) => x.photos >= 10, 'camera'],
  ['c10', 'Corey cooked 10 dinners', (x) => x.corey >= 10, 'hat'], ['f10', 'Faith cooked 10 dinners', (x) => x.faith >= 10, 'hat'],
  ['b10', '10 dinners cooked together', (x) => x.both >= 10, 'users'], ['bud', 'A whole month inside the budget', (x) => x.budgetMonth, 'medal'],
  // update 3
  ['cats', 'Tried every category', (x) => x.allCats, 'star'], ['w3', '3-week cooking streak', (x) => x.bestStreak >= 3, 'flame'], ['w8', '8-week cooking streak', (x) => x.bestStreak >= 8, 'flame'],
  ['dn1', 'First date night in', (x) => x.dateNights >= 1, 'candle'], ['tt1', 'First taste test', (x) => x.taste >= 1, 'thumbUp'], ['cf3', '3 favourites you both love', (x) => x.coupleFavs >= 3, 'heart'],
  ['sig', 'Picked a signature dish', (x) => x.sig, 'star'], ['jar', 'Made a wish from the dessert jar', (x) => x.jarMade >= 1, 'jar'], ['ac1', "Acura's first batch of treats", (x) => x.acura >= 1, 'paw'],
];
function milestoneFacts() {
  const all = realDinners();
  const ids = new Set(all.map((c) => c.recipeId).filter((id) => id !== 'other'));
  const months = {}; Object.values(state.cooked).forEach((c) => { const k = c.date.slice(0, 7); months[k] = (months[k] || 0) + Number(c.amount || 0); });
  const cnt = (n) => all.filter((c) => c.by === n || c.by === 'Both').length;
  const cats = INDEX.categories.filter((c) => INDEX.recipes.some((r) => r.category === c.slug));
  return {
    n: all.length, distinct: ids.size, allBook: INDEX.recipes.length > 0 && INDEX.recipes.every((r) => ids.has(r.id)),
    photos: Object.values(state.photos).flat().length, corey: cnt('Corey'), faith: cnt('Faith'), both: all.filter((c) => c.by === 'Both').length,
    budgetMonth: Object.entries(months).some(([k, v]) => k < monthKey() && v > 0 && v <= state.settings.budgetMax && all.filter((c) => c.date.startsWith(k)).length >= 8),
    allCats: cats.length > 0 && cats.every((c) => all.some((d) => { const s = summary(d.recipeId); return s && s.category === c.slug; })),
    bestStreak: streakInfo().best,
    dateNights: all.filter((c) => { const s = summary(c.recipeId); return (s && ((s.tags || {}).occasion || []).includes('date-night')) || (state.dateNight && state.dateNight.date === c.date); }).length,
    taste: Object.values(state.tasteTests).filter((t) => t.result).length,
    coupleFavs: Object.keys(state.favBy).filter(isCoupleFav).length, sig: !!state.signature,
    jarMade: Object.values(state.dessertJar).filter((d) => d.made).length,
    acura: Object.keys((state.acura && state.acura.baked) || {}).length,
  };
}
function badgeGrid() {
  // earned first (oldest first), then the locked ones; only the first 9 show until "Show all" (uncluttered)
  const got = MILESTONES.filter(([k]) => state.milestones[k]).length;
  const list = MILESTONES.filter(([k]) => state.milestones[k]).sort((a, b) => String(state.milestones[a[0]]).localeCompare(String(state.milestones[b[0]]))).concat(MILESTONES.filter(([k]) => !state.milestones[k]));
  const one = ([k, label, , ic]) => { const on = state.milestones[k]; return `<div class="bdg ${on ? 'on' : ''}" title="${esc(label)}"><span class="bm"><svg viewBox="0 0 24 24">${ICON[ic] || ICON.star}</svg></span><b>${esc(label)}</b>${on ? `<small>${esc(shortDate(on))}</small>` : ''}</div>`; };
  const first = list.slice(0, 9), rest = list.slice(9);
  return `<div class="sec"><div class="sec-title">Badges<span class="act">${got} of ${MILESTONES.length}</span></div><div class="badges">${first.map(one).join('')}</div>${rest.length ? `<details class="bmore"><summary>Show all ${MILESTONES.length} badges</summary><div class="badges">${rest.map(one).join('')}</div></details>` : ''}</div>`;
}

// ---------------------------------------------------------------- coin flip: who's on dishes (#52)
function openCoinFlip() {
  let flipping = false;
  const tally = () => { const m = monthKey(); const t = { Corey: 0, Faith: 0 }; Object.values(state.dishes).forEach((d) => { if (d.date.startsWith(m)) t[d.who]++; }); return t; };
  const draw = (b, res) => {
    const t = tally();
    b.innerHTML = `<h2>Who's on dishes?</h2><p class="sub">Gold hat for Corey, lavender for Faith. The coin has spoken — no appeals.</p>
      <div class="coinwrap"><div class="coin ${res ? 'show-' + res.toLowerCase() : ''}" id="coin"><div class="cf c">${hat('Corey', 54)}<b>COREY</b></div><div class="cf f">${hat('Faith', 54)}<b>FAITH</b></div></div></div>
      <p class="coinres" id="coinRes">${res ? `<b>${res}</b> is on dishes tonight ♥` : '&nbsp;'}</p>
      <p class="small muted" style="text-align:center">This month · Corey ${t.Corey} · Faith ${t.Faith}</p>
      <div class="foot"><button class="btn" data-close>Close</button><button class="btn gold" id="flip">${res ? 'Best of three?' : 'Flip the coin'}</button></div>`;
    $('#flip', b).onclick = () => {
      if (flipping) return; flipping = true; actx();
      const who = Math.random() < 0.5 ? 'Corey' : 'Faith'; const c = $('#coin', b);
      c.className = 'coin'; void c.offsetWidth; c.classList.add(reducedMotion() ? 'show-' + who.toLowerCase() : 'flip-' + who.toLowerCase());
      if (state.settings.sounds) tone(2400, 0, 0.05, 0.05);
      setTimeout(() => { flipping = false; const id = uid(); state.dishes[id] = { id, date: todayISO(), who, at: now() }; save(); buzz(20); playChime('ding'); draw(b, who); }, reducedMotion() ? 50 : 1700);
    };
  };
  openSheet('', (b) => draw(b, null));
}

// ---------------------------------------------------------------- taste test (#53)
function pendingTaste(rid) { return Object.values(state.tasteTests).find((t) => t.recipeId === rid && !t.result) || null; }
function tasteScore() { const s = { Corey: 0, Faith: 0, n: 0 }; Object.values(state.tasteTests).forEach((t) => { if (!t.result) return; s.n++; ['Corey', 'Faith'].forEach((n) => { if (t.guesses[n] && t.guesses[n] === t.result) s[n]++; }); }); return s; }
function openTasteTest(rid) {
  const s = summary(rid); if (!s) return;
  const pend = pendingTaste(rid);
  if (pend) {
    openSheet(`<h2>Taste test · the verdict</h2><p class="sub">${esc(s.title)} — Corey guessed <b>${esc(pend.guesses.Corey || '—')}</b>, Faith guessed <b>${esc(pend.guesses.Faith || '—')}</b>. So… was it a hit?</p>
      <div class="btnrow" style="margin-top:16px"><button class="btn ghost" data-res="miss">${svg('thumbDown')}Miss</button><button class="btn gold" data-res="hit">${svg('thumbUp')}Hit!</button></div>
      <div class="foot"><button class="btn" id="ttCancel">Cancel the test</button><button class="btn" data-close>Later</button></div>`, (b) => {
      $$('[data-res]', b).forEach((x) => (x.onclick = () => { resolveTaste(pend, x.dataset.res); closeSheet(); }));
      $('#ttCancel', b).onclick = () => { delete state.tasteTests[pend.id]; save(); closeSheet(); router(); };
    });
    return;
  }
  const g = {};
  openSheet(`<h2>Taste test</h2><p class="sub">Before you cook ${esc(s.title)}: will it be a hit or a miss? Each make a guess — we'll keep score.</p>
    ${['Corey', 'Faith'].map((n) => `<div class="field"><label>${hat(n, 16)} ${n} says</label><div class="segtext" data-g="${n}" style="grid-template-columns:1fr 1fr"><button data-v="hit">Hit</button><button data-v="miss">Miss</button></div></div>`).join('')}
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="ttGo">Lock in our guesses</button></div>`, (b) => {
    $$('[data-g]', b).forEach((row) => $$('button', row).forEach((x) => (x.onclick = () => { g[row.dataset.g] = x.dataset.v; $$('button', row).forEach((y) => y.classList.toggle('on', y === x)); })));
    $('#ttGo', b).onclick = () => { if (!g.Corey && !g.Faith) { toast('Make a guess first'); return; } const id = uid(); state.tasteTests[id] = { id, recipeId: rid, date: todayISO(), guesses: { ...g }, result: null, at: now() }; save(); closeSheet(); toast('Guesses locked 🔒 — reveal after you taste it'); router(); };
  });
}
function resolveTaste(t, res) {
  t.result = res; t.resolvedAt = now(); save();
  const right = ['Corey', 'Faith'].filter((n) => t.guesses[n] === res);
  toast(right.length === 2 ? 'You both called it ♥' : right.length ? `${right[0]} called it! +1` : 'Neither of you saw that coming 😄');
  checkMilestones(); router();
}

// ---------------------------------------------------------------- dessert wish jar (#50)
function openDessertJar() {
  const draw = (b, pulled) => {
    const sh = $('.sheet'); const y = sh ? sh.scrollTop : 0; queueMicrotask(() => { if (sh && y) sh.scrollTop = y; });
    const items = Object.values(state.dessertJar).sort((x, y) => (x.made ? 1 : 0) - (y.made ? 1 : 0) || y.at - x.at);
    const open = items.filter((d) => !d.made);
    b.innerHTML = `<h2>Dessert wish jar</h2><p class="sub">Drop in sweet ideas. When you want a treat, pull one out at random.</p>
      <div class="addrow" style="grid-template-columns:1fr 46px"><input id="djIn" placeholder="e.g. Molten chocolate cake" maxlength="60" autocomplete="off" enterkeyhint="done"><button class="btn primary" id="djAdd" aria-label="Add">${svg('plus')}</button></div>
      ${pulled ? `<div class="jarpull"><small>FROM THE JAR</small><b>${esc(pulled.text)}</b><span>${pulled.by ? 'wished by ' + esc(pulled.by) : ''}</span><button class="btn sm gold" id="djMade">We made it ♥</button></div>` : ''}
      <ul class="cooked jarlist">${items.map((d) => `<li class="${d.made ? 'made' : ''}"><div><div class="t">${esc(d.text)}</div><div class="d">${d.made ? 'made ' + esc(shortDate(d.made)) : d.by ? 'from ' + esc(d.by) : ''}</div></div><button class="del" data-dj="${d.id}" aria-label="Remove">×</button></li>`).join('') || '<li><div class="d">The jar is empty — add the first wish.</div></li>'}</ul>
      <div class="foot"><button class="btn" data-close>Close</button><button class="btn gold" id="djPull" ${open.length ? '' : 'disabled style="opacity:.4"'}>${svg('jar')}Pull one out</button></div>`;
    const add = () => { const v = $('#djIn', b).value.trim(); if (!v) return; const id = uid(); state.dessertJar[id] = { id, text: v, by: state.profile.me || null, date: todayISO(), at: now() }; save(); draw(b); $('#djIn', b).focus(); };
    $('#djAdd', b).onclick = add; $('#djIn', b).onkeydown = (e) => { if (e.key === 'Enter') add(); };
    $('#djPull', b).onclick = () => { const o = Object.values(state.dessertJar).filter((d) => !d.made); if (!o.length) return; buzz(15); playChime('harp'); draw(b, o[Math.floor(Math.random() * o.length)]); };
    $('#djMade', b) && ($('#djMade', b).onclick = () => { state.dessertJar[pulled.id].made = todayISO(); save(); checkMilestones(); draw(b); toast('Sweet ♥'); });
    $$('[data-dj]', b).forEach((x) => (x.onclick = () => { const d = state.dessertJar[x.dataset.dj]; delete state.dessertJar[x.dataset.dj]; save(); draw(b); toast('Removed', 'Undo', () => { state.dessertJar[d.id] = d; save(); if (!$('#sheetWrap').hidden) draw(b); }); }));
  };
  openSheet('', (b) => draw(b));
}

// ---------------------------------------------------------------- kitchen playlist (#49)
function openPlaylist() {
  const mine = state.settings.playlist;
  const links = [
    ['Spotify · cooking playlists', 'https://open.spotify.com/search/cooking%20dinner%20playlist/playlists'],
    ['Spotify · cozy jazz for dinner', 'https://open.spotify.com/search/dinner%20jazz/playlists'],
    ['Apple Music · cooking playlists', 'https://music.apple.com/ca/search?term=cooking%20playlist'],
    ['Apple Music · dinner for two', 'https://music.apple.com/ca/search?term=romantic%20dinner'],
  ];
  openSheet(`<h2>Kitchen playlist</h2><p class="sub">Music while you cook — opens in Spotify or Apple Music.</p>
    <div class="menu">${mine ? `<a href="${esc(mine)}" target="_blank" rel="noopener">${svg('heart')}<span><b>Our playlist</b></span></a>` : ''}${links.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${svg('music')}<span>${esc(n)}</span></a>`).join('')}</div>
    <div class="field"><label>Our own playlist link</label><input id="plIn" type="url" inputmode="url" placeholder="Paste a Spotify or Apple Music link" value="${esc(mine || '')}" autocomplete="off"></div>
    <div class="foot"><button class="btn" data-close>Close</button><button class="btn primary" id="plSave">Save link</button></div>`, (b) => {
    $('#plSave', b).onclick = () => { const v = $('#plIn', b).value.trim(); if (v && !/^https?:\/\//i.test(v)) { toast('Paste a full link starting with https://'); return; } state.settings.playlist = v; save(); closeSheet(); toast(v ? 'Saved our playlist ♥' : 'Playlist link removed'); };
  });
}

// ---------------------------------------------------------------- date night planner + countdown (#51)
function openDateNight(pre = {}) {
  const dn = state.dateNight && -daysSince(state.dateNight.date) >= 0 ? state.dateNight : null;
  const cur = { date: pre.date || (dn && dn.date) || isoPlus(((6 - new Date().getDay()) + 7) % 7 || 7), time: (dn && dn.time) || '19:00', recipeId: pre.recipeId || (dn && dn.recipeId) || '', note: (dn && dn.note) || '' };
  const list = visibleRecipes().slice().sort((a, b) => (((b.tags || {}).occasion || []).includes('date-night') - ((a.tags || {}).occasion || []).includes('date-night')) || a.title.localeCompare(b.title));
  openSheet(`<h2>Date night in</h2><p class="sub">Pick the night and the dinner — Home will count down to it.</p>
    <div class="btnrow" style="margin-top:6px"><div class="field"><label>Date</label><input id="dnD" type="date" value="${cur.date}" min="${todayISO()}"></div><div class="field"><label>Time</label><input id="dnT" type="time" value="${cur.time}"></div></div>
    <div class="field"><label>What we're cooking</label><select id="dnR"><option value="">Decide later</option>${list.map((r) => `<option value="${r.id}" ${r.id === cur.recipeId ? 'selected' : ''}>${esc(r.title)}${((r.tags || {}).occasion || []).includes('date-night') ? ' ♥' : ''}</option>`).join('')}</select></div>
    <div class="field"><label>A little note (optional)</label><input id="dnN" maxlength="80" value="${esc(cur.note)}" placeholder="e.g. candles + our song" autocomplete="off"></div>
    <div class="foot"><button class="btn" id="dnDel">${dn ? 'Cancel date' : 'Close'}</button><button class="btn gold" id="dnOk">Save date night</button></div>`, (b) => {
    $('#dnOk', b).onclick = () => { const d = $('#dnD', b).value; if (!d) { toast('Pick a date'); return; } state.dateNight = { date: d, time: $('#dnT', b).value || '19:00', recipeId: $('#dnR', b).value || null, note: $('#dnN', b).value.trim(), by: state.profile.me || null, at: now() }; save(); closeSheet(); toast('Date night saved ♥'); router(); };
    $('#dnDel', b).onclick = () => { if (dn) { const prev = state.dateNight; state.dateNight = null; save(); closeSheet(); router(); toast('Date night cancelled', 'Undo', () => { state.dateNight = prev; save(); router(); }); } else closeSheet(); };
  });
}
function dateNightCard() {
  const dn = dateNightInfo();
  if (!dn) return `<button class="tooltile wide" id="dnPlan">${svg('candle')}<span><b>Plan a date night in</b><small>Pick a night and a dinner — we'll count down</small></span></button>`;
  const when = dateOf(dn.date).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  return `<div class="dncard"><div class="dn-n"><b>${dn.days === 0 ? '♥' : dn.days}</b><span>${dn.days === 0 ? 'tonight' : dn.days === 1 ? 'day to go' : 'days to go'}</span></div>
    <div class="dn-t"><small>DATE NIGHT IN</small><b>${esc(when)}${dn.time ? ' · ' + fmtTime(eatTime({ eatAt: dn.time })) : ''}</b><span>${dn.s ? esc(dn.s.title) : 'Dinner to be decided'}${dn.note ? ' · ' + esc(dn.note) : ''}</span></div>
    <div class="dn-a">${dn.s ? `<a class="btn sm gold" href="#/r/${dn.s.id}">Recipe</a>` : ''}<button class="btn sm ghost" id="dnPlan">Edit</button></div></div>`;
}

// ---------------------------------------------------------------- signature dish (#55)
function openPickSignature() {
  const favs = Object.keys(state.favourites).map(summary).filter(Boolean);
  const cookedIds = [...new Set(realDinners().map((c) => c.recipeId))].map(summary).filter(Boolean).filter((r) => !state.favourites[r.id]);
  const list = favs.concat(cookedIds);
  openSheet(`<h2>Our signature dish</h2><p class="sub">The one you'd make to impress — it gets a special spot and a gold badge.</p>
    <div class="rlist" style="margin-top:10px">${list.map((x) => `<button class="rcard pick2" data-sig="${x.id}"><div class="im">${x.image ? img(thumb(x.image), x.title) : placeholderArt(x)}</div><div><div class="num">${esc(recipeLabel(x))}${state.signature === x.id ? ' · ★ current' : ''}</div><div class="t">${esc(x.title)}</div></div></button>`).join('') || '<div class="empty">Favourite or cook a few recipes first.</div>'}</div>
    <div class="foot"><button class="btn" data-close>Cancel</button>${state.signature ? '<button class="btn" id="sigClear">Clear</button>' : ''}</div>`, (b) => {
    $$('[data-sig]', b).forEach((x) => (x.onclick = () => { closeSheet(); state.signature = x.dataset.sig; save(); checkMilestones(); router(); toast('Our signature dish ★'); }));
    $('#sigClear', b) && ($('#sigClear', b).onclick = () => { closeSheet(); setSignature(state.signature); router(); });
  });
}

// ---------------------------------------------------------------- year in review (#59)
function yearInReviewDue() {
  const t = new Date(); const y = t.getMonth() === 11 ? t.getFullYear() : t.getMonth() === 0 && t.getDate() <= 15 ? t.getFullYear() - 1 : null;
  return y && realDinners().some((c) => c.date.startsWith(String(y))) ? y : null;
}
function yearStats(y) {
  const ys = String(y); const es = realDinners().filter((c) => c.date.startsWith(ys)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const by = {}; es.forEach((c) => { by[c.recipeId] = (by[c.recipeId] || 0) + 1; });
  const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, n]) => ({ s: summary(id), title: (summary(id) || {}).title || (es.find((c) => c.recipeId === id) || {}).title, n }));
  const earlier = new Set(realDinners().filter((c) => c.date < ys).map((c) => c.recipeId));
  const fresh = new Set(es.filter((c) => !earlier.has(c.recipeId) && c.recipeId !== 'other').map((c) => c.recipeId)).size;
  const spent = Object.values(state.cooked).filter((c) => c.date.startsWith(ys)).reduce((a, c) => a + Number(c.amount || 0), 0);
  const saved = es.reduce((a, c) => a + Math.max(0, state.settings.takeoutCost - mealCost(c)), 0);
  const months = {}; es.forEach((c) => { const k = c.date.slice(0, 7); months[k] = (months[k] || 0) + 1; });
  const bestM = Object.entries(months).sort((a, b) => b[1] - a[1])[0];
  const photos = Object.entries(state.photos).flatMap(([rid, ps]) => ps.filter((p) => p.date.startsWith(ys)).map((p) => ({ ...p, rid })));
  const cnt = (n) => es.filter((c) => c.by === n || c.by === 'Both').length;
  const badges = MILESTONES.filter(([k]) => (state.milestones[k] || '').startsWith(ys)).map(([, l]) => l);
  const hearts = es.filter((c) => c.hearts).map((c) => ({ c, v: ((c.hearts.Corey || 0) + (c.hearts.Faith || 0)) / ((c.hearts.Corey ? 1 : 0) + (c.hearts.Faith ? 1 : 0) || 1) })).sort((a, b) => b.v - a.v)[0];
  return { y, n: es.length, distinct: Object.keys(by).length, top, fresh, spent, saved, bestM, photos, corey: cnt('Corey'), faith: cnt('Faith'), both: es.filter((c) => c.by === 'Both').length, first: es[0], badges, loved: hearts, dishes: Object.values(state.dishes).filter((d) => d.date.startsWith(ys)).length };
}
function viewYear(yy) {
  const y = +yy || yearInReviewDue() || new Date().getFullYear();
  setTop({ title: 'YEAR IN REVIEW', back: '#/us' });
  const s = yearStats(y);
  render(`<div class="wrap yir"><div class="kicker">Corey ♥ Faith<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Our ${y}</h1>
    <p class="lead" style="margin-top:4px">${s.n ? `A year of cooking together, one dinner at a time.` : 'No dinners logged this year yet.'}</p>
    ${s.n ? `<div class="sec"><div class="statgrid"><div class="s"><b>${s.n}</b><span>Dinners</span></div><div class="s"><b>${s.distinct}</b><span>Different recipes</span></div><div class="s"><b>${money(s.saved)}</b><span>Saved vs takeout</span></div><div class="s"><b>${s.fresh}</b><span>First-time recipes</span></div></div></div>
    <div class="sec"><div class="sec-title">Most made</div><ol class="yrtop">${s.top.map((t, i) => `<li><span class="yn">${i + 1}</span>${t.s && t.s.image ? img(thumb(t.s.image), '') : '<i></i>'}<div><b>${esc(t.title)}</b><small>${t.n} time${t.n === 1 ? '' : 's'}</small></div></li>`).join('')}</ol></div>
    <div class="sec card yrfacts"><ul class="tips">
      ${s.first ? `<li>First dinner of the year: <b>${esc(s.first.title)}</b> on ${esc(shortDate(s.first.date))}.</li>` : ''}
      ${s.bestM ? `<li>Busiest kitchen month: <b>${esc(monthName(s.bestM[0]).split(' ')[0])}</b> with ${s.bestM[1]} dinners.</li>` : ''}
      ${s.corey || s.faith ? `<li>Corey cooked ${s.corey}, Faith cooked ${s.faith}${s.both ? ` — ${s.both} together` : ''}.</li>` : ''}
      ${s.loved ? `<li>Highest hearts: <b>${esc(s.loved.c.title)}</b> (${r1(s.loved.v)} ♥).</li>` : ''}
      <li>Spent about <b>${money(s.spent)}</b> on dinners at home.</li>
      ${s.dishes ? `<li>The coin decided dishes duty ${s.dishes} time${s.dishes === 1 ? '' : 's'}.</li>` : ''}
      ${s.badges.length ? `<li>Badges earned: ${esc(s.badges.join(' · '))}.</li>` : ''}</ul></div>
    ${s.photos.length ? `<div class="sec"><div class="sec-title">Photo memories</div><div class="photos">${s.photos.slice(0, 12).map((p) => `<a class="ph" href="#/r/${p.rid}"><img src="${p.data}" alt="">${stampHTML(p, true)}<span>${esc(shortDate(p.date))}</span></a>`).join('')}</div></div>` : ''}
    <p class="lead" style="text-align:center;margin-top:26px">Here's to another year in our kitchen ♥</p>` : ''}</div>`);
}

// ---------------------------------------------------------------- views: Us — the couple hub (one place for everything "us")
function viewUs() {
  setTop({ title: 'US' });
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
  const favs = Object.keys(state.favourites).map(summary).filter(Boolean).sort((x, y) => isCoupleFav(y.id) - isCoupleFav(x.id));
  const photos = Object.entries(state.photos).flatMap(([rid, ps]) => ps.map((p) => ({ ...p, rid }))).sort((x, y) => (x.date < y.date ? 1 : -1));
  const si = streakInfo(); const ts = tasteScore(); const pend = Object.values(state.tasteTests).filter((t) => !t.result && summary(t.recipeId));
  const sig = state.signature && summary(state.signature);
  const sigN = sig ? all.filter((c) => c.recipeId === sig.id).length : 0;
  const fb = flashback(); const ny = yearInReviewDue();
  const rc = monthRecap(monthKey());
  const jarN = Object.values(state.dessertJar).filter((d) => !d.made).length;
  const dishT = (() => { const m = monthKey(); const t = { Corey: 0, Faith: 0 }; Object.values(state.dishes).forEach((d) => { if (d.date.startsWith(m)) t[d.who]++; }); return t; })();
  const hatsCount = { Corey: all.filter((c) => c.by === 'Corey' || c.by === 'Both').length, Faith: all.filter((c) => c.by === 'Faith' || c.by === 'Both').length };
  render(`<div class="wrap"><div class="kicker">Corey ♥ Faith<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Us</h1>
    <div class="sec">${together}</div>
    <div class="sec">${streakHTML(si)}</div>
    <div class="sec"><div class="statgrid"><div class="s"><b>${all.length}</b><span>Dinners together</span></div><div class="s"><b>${favs.length}</b><span>Favourites</span></div>
      <div class="s"><b>${photos.length}</b><span>Photo memories</span></div><div class="s hatstat"><b>${hat('Corey', 16)}${hatsCount.Corey}<i></i>${hat('Faith', 16)}${hatsCount.Faith}</b><span>Who's cooked</span></div></div></div>
    <div class="sec">${dateNightCard()}</div>
    ${sig ? `<div class="sec"><div class="sec-title">Our signature dish</div><a class="sigcard" href="#/r/${sig.id}">${sig.image ? img(sig.image, sig.title) : placeholderArt(sig)}<div class="sg-b"><span class="sg-badge">★ SIGNATURE</span><b>${esc(sig.title)}</b><small>${sigN ? `Made ${sigN} time${sigN === 1 ? '' : 's'}` : 'Not made yet'}${state.nicknames[sig.id] ? ' · aka “' + esc(state.nicknames[sig.id]) + '”' : ''}</small></div></a><button class="linkbtn" id="sigPick">Change</button></div>` : ''}
    ${fb ? `<div class="sec">${flashCard(fb, false)}</div>` : ''}
    ${ny ? `<a class="nudge yr" href="#/year/${ny}"><span>${svg('star')}</span><span style="flex:1"><b>Our ${ny} in review</b> — dinners, favourites and firsts.</span><span>${svg('chevR')}</span></a>` : ''}
    ${rc ? `<div class="sec">${recapCard(rc, false)}</div>` : ''}
    <div class="sec"><div class="sec-title">Just for us</div><div class="tools">
      <button class="tooltile" id="tFlip">${svg('coin')}<span><b>Who's on dishes?</b><small>${dishT.Corey + dishT.Faith ? `Corey ${dishT.Corey} · Faith ${dishT.Faith}` : 'Flip a coin'}</small></span></button>
      <button class="tooltile" id="tTaste">${svg('thumbUp')}<span><b>Taste test</b><small>${ts.n ? `Corey ${ts.Corey} · Faith ${ts.Faith}` : 'Guess hit or miss'}</small></span></button>
      <button class="tooltile" id="tJar">${svg('jar')}<span><b>Dessert jar</b><small>${jarN ? `${jarN} wish${jarN === 1 ? '' : 'es'} inside` : 'Add a sweet wish'}</small></span></button>
      <button class="tooltile" id="tMusic">${svg('music')}<span><b>Kitchen playlist</b><small>${state.settings.playlist ? 'Our playlist ♥' : 'Spotify · Apple Music'}</small></span></button>
      ${sig ? '' : `<button class="tooltile" id="sigPick2">${svg('star')}<span><b>Signature dish</b><small>Pick the one you're proudest of</small></span></button>`}
      <a class="tooltile" href="#/story">${svg('book')}<span><b>Our story</b><small>Every dinner, with photos</small></span></a>
    </div>${pend.length ? `<div class="pendtt">${pend.map((t) => `<button data-tt="${t.recipeId}">${svg('thumbUp')}<span>Taste test waiting: <b>${esc(summary(t.recipeId).title)}</b> — reveal</span></button>`).join('')}</div>` : ''}</div>
    ${badgeGrid()}
    <div class="sec"><div class="sec-title">Our favourites</div>${favs.length ? `<div class="hrow">${favs.map((r) => `<a class="mini-card" href="#/r/${r.id}"><div class="im">${r.image ? img(thumb(r.image), r.title) : placeholderArt(r)}${isCoupleFav(r.id) ? `<i class="gh">${svg('heart')}</i>` : ''}</div><div class="t">${esc(r.title)}</div><div class="m">${isCoupleFav(r.id) ? 'Both of you ♥' : (() => { const w = Object.keys(favWho(r.id)); return w.length ? esc(w[0]) + '’s favourite' : r.price + ' · ' + r.total + ' min'; })()}</div></a>`).join('')}</div><p class="small muted" style="margin-top:6px">Gold heart = you both love it. Tap the hats under “Who loves it” on a recipe.</p>` : '<div class="empty">Heart a recipe and it shows up here.</div>'}</div>
    <div class="sec"><div class="sec-title">Photo memories</div>${photos.length ? `<div class="photos">${photos.map((p) => `<a class="ph" href="#/r/${p.rid}"><img src="${p.data}" alt="">${stampHTML(p, true)}<span>${esc(shortDate(p.date))}</span></a>`).join('')}</div>` : '<div class="empty">Add a photo from any recipe page after you cook it.</div>'}</div>
  </div>`);
  $('#tFlip').onclick = openCoinFlip;
  $('#tTaste').onclick = () => { const p = Object.values(state.tasteTests).find((t) => !t.result && summary(t.recipeId)); if (p) openTasteTest(p.recipeId); else openTastePick(); };
  $('#tJar').onclick = openDessertJar;
  $('#tMusic').onclick = openPlaylist;
  $$('#dnPlan').forEach((b) => (b.onclick = () => openDateNight()));
  $('#sigPick') && ($('#sigPick').onclick = openPickSignature);
  $('#sigPick2') && ($('#sigPick2').onclick = openPickSignature);
  $$('[data-tt]').forEach((b) => (b.onclick = () => openTasteTest(b.dataset.tt)));
}
function openTastePick() {
  const done = new Set(realDinners().map((c) => c.recipeId));
  const list = visibleRecipes().filter((r) => !done.has(r.id));
  const ts = tasteScore();
  openSheet(`<h2>Taste test</h2><p class="sub">Pick a recipe you haven't made yet. You each guess hit or miss, cook it, then reveal. ${ts.n ? `Score so far: Corey ${ts.Corey}, Faith ${ts.Faith} (${ts.n} test${ts.n === 1 ? '' : 's'}).` : ''}</p>
    <div class="rlist" style="margin-top:10px">${list.map((x) => `<button class="rcard pick2" data-tp="${x.id}"><div class="im">${x.image ? img(thumb(x.image), x.title) : placeholderArt(x)}</div><div><div class="num">${esc(recipeLabel(x))}</div><div class="t">${esc(x.title)}</div><div class="meta"><b>${x.price}</b><span>${x.total} min</span></div></div></button>`).join('') || '<div class="empty">You have made every recipe — nice! New ones are added in batches.</div>'}</div>
    <div class="foot"><button class="btn" data-close>Close</button></div>`, (b) => {
    $$('[data-tp]', b).forEach((x) => (x.onclick = () => openTasteTest(x.dataset.tp)));
  });
}

// ================================================================ Acura's Kitchen — homemade dog treats (separate data: state.acura)
let ACURA = null;
async function loadAcura() { if (!ACURA) { try { ACURA = await (await fetch('recipes/acura/treats.json')).json(); } catch (e) { ACURA = null; } } return ACURA; }
const AC = () => state.acura || (state.acura = { favs: {}, baked: {}, notes: {}, ratings: {}, profile: {}, given: {} });
const PAW = (cls = '') => `<svg viewBox="0 0 24 24" class="paw ${cls}" aria-hidden="true">${ICON.paw}</svg>`;
const BONE = (cls = '') => `<svg viewBox="0 0 24 24" class="bonei ${cls}" aria-hidden="true">${ICON.bone}</svg>`;
function acPattern() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const c1 = dark ? '#5E3B28' : '#CBA376', c2 = dark ? '#4E3121' : '#D8B88E';
  const bone = (x, y, r, c) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(1.1) translate(-12 -12)" fill="${c}" d="M6.5 9.2a2.3 2.3 0 1 0-2.9 2.8 2.3 2.3 0 1 0 2.9 2.8h11a2.3 2.3 0 1 0 2.9-2.8 2.3 2.3 0 1 0-2.9-2.8z"/>`;
  const paw = (x, y, r, c) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(.8) translate(-12 -12)" fill="${c}"><ellipse cx="12" cy="15.6" rx="4.4" ry="3.7"/><ellipse cx="6.3" cy="10.2" rx="1.8" ry="2.4"/><ellipse cx="9.7" cy="6.5" rx="1.8" ry="2.5"/><ellipse cx="14.3" cy="6.5" rx="1.8" ry="2.5"/><ellipse cx="17.7" cy="10.2" rx="1.8" ry="2.4"/></g>`;
  const svgT = `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="84" viewBox="0 0 132 84">${bone(22, 18, -28, c1)}${paw(70, 16, 18, c2)}${bone(110, 30, 34, c2)}${paw(36, 60, -20, c2)}${bone(88, 66, -12, c1)}${paw(124, 74, 30, c1)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svgT)}")`;
}
function bowlArt() {
  return `<svg viewBox="0 0 132 78" class="bowl" aria-hidden="true">
    <g class="kib"><circle cx="46" cy="33" r="4"/><circle cx="57" cy="30" r="4"/><circle cx="68" cy="31" r="4"/><circle cx="79" cy="30" r="4"/><circle cx="88" cy="34" r="4"/><circle cx="52" cy="35" r="3.6"/><circle cx="74" cy="35" r="3.6"/></g>
    <path class="bn" transform="translate(66 21) rotate(-14) scale(2.1) translate(-12 -12)" d="M6.5 9.2a2.3 2.3 0 1 0-2.9 2.8 2.3 2.3 0 1 0 2.9 2.8h11a2.3 2.3 0 1 0 2.9-2.8 2.3 2.3 0 1 0-2.9-2.8z"/>
    <rect class="rim" x="20" y="36" width="92" height="8" rx="4"/>
    <path class="bw" d="M24 44h84l-9 26a4 4 0 0 1-3.8 2.7H36.8A4 4 0 0 1 33 70z"/>
    <text x="66" y="63" text-anchor="middle" class="bt">ACURA</text></svg>`;
}
function treatKcal(t) { const m = String(t.kcal || '').match(/(\d+)/); return m ? +m[1] : null; }
function dogKg() { const p = AC().profile || {}; const w = parseFloat(p.weight); if (!(w > 0)) return null; const kg = p.unit === 'lb' ? w * 0.4536 : w; return kg >= 0.5 && kg <= 100 ? kg : null; } // ignore typos like 2210 kg
function treatBudget() { const kg = dogKg(); if (!kg) return null; const rer = 70 * Math.pow(kg, 0.75); return { kg, daily: Math.round(rer * 1.6), treats: Math.round(rer * 1.6 * 0.1) }; }
function freshBatches(D) {
  return Object.values(AC().baked).map((b) => ({ b, t: D.treats.find((x) => x.id === b.treatId) })).filter((x) => x.t)
    .map((x) => ({ ...x, until: addDaysISO(x.b.date, x.t.keepDays || 7), left: (x.t.keepDays || 7) - daysSince(x.b.date) }))
    .filter((x) => x.left >= 0 && !x.b.gone).sort((a, b) => a.left - b.left);
}
const AC_CHIPS = [['all', 'All treats'], ['Crunchy', 'Crunchy'], ['soft', 'Soft & chewy'], ['No bake', 'No bake'], ['Training treat', 'Training'], ['favs', 'Favourites']];
function acMatch(t, k) { if (k === 'all') return true; if (k === 'favs') return !!AC().favs[t.id]; if (k === 'soft') return t.tags.some((x) => /soft|chewy/i.test(x)); if (k === 'Training treat') return t.tags.some((x) => /training|high value/i.test(x)); return t.tags.includes(k); }
function pupBirthday() {
  const b = (AC().profile || {}).birthday; if (!b) return null;
  const [, m, d] = b.split('-').map(Number); const t = new Date(); t.setHours(0, 0, 0, 0);
  let next = new Date(t.getFullYear(), m - 1, d); if (next < t) next = new Date(t.getFullYear() + 1, m - 1, d);
  const days = Math.round((next - t) / 864e5); const age = next.getFullYear() - +b.slice(0, 4);
  return { days, age };
}

function ajCount(given, tb) {
  return `<div><b>${given}</b><span>${tb ? `treat${given === 1 ? '' : 's'} today · budget ~${tb.treats} kcal` : `treat${given === 1 ? '' : 's'} today`}</span></div><button class="btn sm ghost" id="acMinus" ${given ? '' : 'disabled'} aria-label="One less">−</button><button class="btn sm gold" id="acPlus">${PAW('sm')}Treat given</button>`;
}
function acListHTML(D, list, k) {
  const a = AC();
  return list.map((t) => { const n = Object.values(a.baked).filter((b) => b.treatId === t.id).length; const kc = treatKcal(t); return `<a class="ac-card" href="#/acura/t/${t.id}"><div class="im">${img(thumb(t.image), t.title)}${a.favs[t.id] ? `<i class="pf">${PAW()}</i>` : ''}</div>
        <div class="ac-b"><b>${esc(t.title)}</b><span class="sub">${esc(t.subtitle)}</span><span class="meta">${t.prep + (t.cook || 0)} min${t.chill ? ' + freeze' : ''} · ${esc(t.makes)}${kc ? ` · ~${kc} kcal` : ''}</span>
        <span class="tagrow">${t.tags.slice(0, 2).map((x) => `<i>${esc(x)}</i>`).join('')}${n ? `<i class="bk">${PAW('sm')}baked ×${n}</i>` : ''}</span></div></a>`; }).join('') || `<div class="empty">No treats here yet${k === 'favs' ? ' — tap the paw on a treat to save it' : ''}.</div>`;
}
async function viewAcura() {
  setTop({ title: 'ACURA’S KITCHEN', right: `<button class="iconbtn" id="acProf" aria-label="Acura's profile">${svg('paw')}</button>` });
  const D = await loadAcura();
  if (!D) { render('<div class="wrap"><div class="empty">Couldn’t load Acura’s treats — check your connection and try again.</div></div>'); return; }
  const a = AC(); const k = ui.acChip || 'all';
  const list = D.treats.filter((t) => acMatch(t, k));
  const fresh = freshBatches(D); const tb = treatBudget(); const today = todayISO(); const given = (a.given || {})[today] || 0;
  const bd = pupBirthday();
  const bakedN = Object.keys(a.baked).length;
  render(`<div class="ac">
    <div class="ac-head"><div class="ac-band" style="background-image:${acPattern()}"></div>
      <div class="ac-plaque">${bowlArt()}<div class="ac-k">${PAW('sm')}Homemade · vet-safe${PAW('sm')}</div><h1 class="ac-h">Acura’s Kitchen</h1><p class="lead">Pawfect treats, made with love for our good pup</p></div></div>
    <div class="ac-words" style="background-image:${acPattern()}" aria-hidden="true"><span class="bone w1">Acura</span><span class="bone w2">Good pup</span><span class="bone w3">Treat time</span></div>
    <div class="wrap" style="padding-top:6px">
      ${bd && bd.days <= 14 ? `<div class="ac-bday">${PAW()}<span>${bd.days === 0 ? `Happy birthday, Acura! ${bd.age > 0 ? bd.age + ' today' : ''} ♥ Bake something special.` : `Acura’s birthday is in ${bd.days} day${bd.days === 1 ? '' : 's'} — Pupsicles party?`}</span></div>` : ''}
      <div class="ac-jar"><div class="aj-k">${BONE('sm')}TREAT JAR</div>
        ${fresh.length ? `<ul>${fresh.map((x) => `<li><a href="#/acura/t/${x.t.id}"><b>${esc(x.t.title)}</b><span>baked ${esc(dayWord(x.b.date))} · ${x.left === 0 ? '<em class="warnc">use today</em>' : x.left === 1 ? 'good until tomorrow' : 'good until ' + esc(dayWord(x.until))}</span></a><button class="linkbtn" data-gone="${x.b.id}">All gone</button></li>`).join('')}</ul>` : `<p>The jar is empty — treat time? Pick a recipe below.</p>`}
        <div class="aj-count">${ajCount(given, tb)}</div>
        ${a.profile && a.profile.allergies ? `<p class="ac-allergy">${PAW('sm')}Vet note: ${esc(a.profile.allergies)}</p>` : ''}
        ${tb ? '' : `<button class="linkbtn" id="acProf2">Add Acura’s weight for a daily treat guide</button>`}</div>
      <div class="bonechips">${AC_CHIPS.map(([v, n]) => `<button class="bone ${k === v ? 'on' : ''}" data-ac="${v}">${v === 'favs' ? PAW('sm') : ''}${esc(n)}</button>`).join('')}</div>
      <div class="ac-list">${acListHTML(D, list, k)}</div>
      <div class="bonediv">${BONE()}</div>
      <a class="ac-safe" href="#/acura/safety"><div class="as-k">${svg('eyeoff')}NEVER FEED ACURA</div><p>${D.safety.never.slice(0, 6).map((n) => esc(n[0].split(' (')[0])).join(' · ')} <b>+${D.safety.never.length - 6} more</b></p><span class="as-go">Full safety guide &amp; treat calculator ${svg('chevR')}</span></a>
      <div class="sec"><div class="sec-title">${PAW('sm')}Good-pup snacks from our fridge</div><div class="snackchips">${D.safety.safeSnacks.map((x) => `<span>${esc(x)}</span>`).join('')}</div><p class="small muted" style="margin-top:8px">Plain, unseasoned, bite-sized — and still part of the 10% treat budget.</p></div>
      <p class="ac-foot">${PAW('sm')} Treats stay under 10% of Acura’s daily calories · ask your vet about allergies ${PAW('sm')}</p>
      ${bakedN ? `<p class="small muted" style="text-align:center;margin-top:4px">${bakedN} batch${bakedN === 1 ? '' : 'es'} baked for Acura so far</p>` : ''}
    </div></div>`);
  const redraw = () => viewAcura();
  $$('[data-ac]').forEach((b) => (b.onclick = () => { if (ui.acChip === b.dataset.ac || (!ui.acChip && b.dataset.ac === 'all')) return; ui.acChip = b.dataset.ac; $$('[data-ac]').forEach((x) => x.classList.toggle('on', x === b)); const l = $('.ac-list'); l.innerHTML = acListHTML(D, D.treats.filter((t) => acMatch(t, ui.acChip)), ui.acChip); markLoaded(l); }));
  const bindCount = () => {
    const g0 = () => (a.given || (a.given = {}));
    const upd = () => { const c = $('.aj-count'); if (!c) return; c.innerHTML = ajCount(g0()[today] || 0, treatBudget()); bindCount(); };
    $('#acPlus').onclick = () => { const g = g0(); Object.keys(g).forEach((d) => { if (d < isoPlus(-30)) delete g[d]; }); g[today] = (g[today] || 0) + 1; save(); upd(); toast('Good pup! ♥'); };
    $('#acMinus').onclick = () => { const g = g0(); if (g[today]) { g[today]--; if (!g[today]) delete g[today]; save(); upd(); } };
  };
  bindCount();
  $('#acProf').onclick = openAcuraProfile; $('#acProf2') && ($('#acProf2').onclick = openAcuraProfile);
  $$('[data-gone]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); const bt = a.baked[b.dataset.gone]; bt.gone = todayISO(); save(); redraw(); toast('Jar cleared — time for a new batch?', 'Undo', () => { delete bt.gone; save(); redraw(); }); }));
}

async function viewTreat(id) {
  const D = await loadAcura(); const t = D && D.treats.find((x) => x.id === id);
  if (!t) { setTop({ title: 'ACURA’S KITCHEN', back: '#/acura' }); render('<div class="wrap"><div class="empty">That treat could not be found.</div></div>'); return; }
  const a = AC(); const fav = !!a.favs[id]; const sid = 'acura-' + id; const ck = state.checks[sid] || { i: {}, s: {} };
  setTop({ title: 'ACURA’S KITCHEN', back: '#/acura', right: `<button class="iconbtn fav pawfav ${fav ? 'on' : ''}" id="acFav" aria-label="Save to Acura's favourites">${svg('paw')}</button>` });
  const batches = Object.values(a.baked).filter((b) => b.treatId === id).sort((x, y) => (x.date < y.date ? 1 : -1));
  const kc = treatKcal(t); const tb = treatBudget();
  const fr = batches[0] && !batches[0].gone ? (t.keepDays || 7) - daysSince(batches[0].date) : -1;
  render(`<div class="ac">
  <div class="r-head"><div class="kicker">${PAW('sm')}Treat time<span class="rule"></span></div><h1 class="h1">${esc(t.title)}</h1><p class="lead">${esc(t.subtitle)}</p>
    <div class="bonechips static">${t.tags.map((x) => `<span class="bone sm">${esc(x)}</span>`).join('')}</div></div>
  <div class="hero"><div class="tile">${img(t.image, t.title)}</div><i class="acc a1"></i><i class="acc a2"></i><i class="acc a3"></i></div>
  <div class="stats"><div class="stat"><b>${t.prep} min</b><span>Prep</span></div><div class="stat plum"><b>${t.cook ? t.cook + ' min' : '—'}</b><span>${t.chill ? 'Bake' : 'Bake'}</span></div><div class="stat peri"><b>${t.chill ? Math.round(t.chill / 60) + ' h' : (t.prep + (t.cook || 0)) + ' min'}</b><span>${t.chill ? 'Freeze' : 'Total'}</span></div></div>
  <div class="serves"><strong>Makes ${esc(t.makes)}</strong><span class="muted">${esc(t.kcal || '')}</span></div>
  <div class="wrap">
    <div class="ac-dogsafe">${PAW()}<div><b>Why it’s dog-safe</b><p>${esc(t.dogSafe)}</p></div></div>
    ${tb && kc ? `<p class="small muted ac-budget">For Acura (${r1(tb.kg)} kg): about <b>${Math.max(1, Math.floor(tb.treats / kc))} a day</b> stays inside the 10% treat budget (~${tb.treats} kcal).</p>` : ''}
    <div class="sec"><div class="sec-title">${PAW('sm')}What you need<button class="act" id="acReset">Reset</button></div>
      ${t.groups.map((g, gi) => `<div class="ing-group">${g.name ? `<div class="group-name">${esc(g.name)}</div>` : ''}<ul class="checklist pawlist">${g.items.map((it, ii) => `<li data-i="${gi}-${ii}" class="${ck.i[gi + '-' + ii] ? 'done' : ''}"><span class="box">${PAW()}</span><span class="txt">${ingLine(it, 1, false)}${it.warn ? `<span class="acwarn">${svg('eyeoff')}${esc(it.warn)}</span>` : ''}</span></li>`).join('')}</ul></div>`).join('')}
      <button class="btn ghost block" id="acList" style="margin-top:12px">${svg('cart')}Add to grocery list</button></div>
    <div class="sec"><div class="sec-title">${PAW('sm')}How to make it</div>
      <button class="btn primary block" id="acCook">${svg('play')}Step-by-step bake mode</button>
      <ul class="checklist steps pawsteps" style="margin-top:8px">${t.steps.map((st, si) => `<li data-s="${si}" class="${ck.s[si] ? 'done' : ''}"><span class="stepnum paw-n">${PAW()}<span>${si + 1}</span></span><span class="txt"><strong>${esc(st.title)}.</strong> ${tx(st.text)}${st.timer ? `<span class="tm">${svg('timer', 'style="width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2"')}${st.timer >= 120 ? Math.round(st.timer / 60) + ' h' : st.timer + ' min'}</span>` : ''}</span></li>`).join('')}</ul></div>
    <div class="sec row2"><div class="mini"><h3>STORAGE</h3><p>${esc(t.storage)}</p></div><div class="mini navy"><h3>GOOD PUP TIPS</h3><p>${t.tips.map(esc).join(' ')}</p></div></div>
    <div class="sec"><div class="sec-title">${PAW('sm')}Acura’s review</div><div class="card ours">
      <div class="rate-row"><span class="small muted">Tail wags</span><div class="rate pawrate" id="acRate">${[1, 2, 3, 4, 5].map((n) => `<button data-r="${n}" class="${(a.ratings[id] || 0) >= n ? 'on' : ''}" aria-label="${n} of 5">${svg('paw')}</button>`).join('')}</div></div>
      <textarea id="acNote" class="notes" placeholder="e.g. Acura loved these — cut them smaller next time.">${esc(a.notes[id] || '')}</textarea>
      ${batches.length ? `<p class="small muted" style="margin-top:8px">Baked ${batches.length} time${batches.length === 1 ? '' : 's'} · last ${esc(shortDate(batches[0].date))}${fr >= 0 ? ` · ${fr === 0 ? 'use today' : `fresh for ${fr} more day${fr === 1 ? '' : 's'}`}` : ''}</p>` : ''}</div></div>
    <div class="sec r-actions"><button class="btn gold block" id="cookedBtn">${PAW('sm')}We baked a batch</button>
      <p class="small muted" style="text-align:center;margin-top:6px">Adds it to the treat jar with a “good until” date. Not counted in the dinner budget.</p></div>
    <p class="small muted" style="margin-top:10px;font-style:italic">${esc(t.source)}</p>
    <div class="bonediv">${BONE()}</div>
  </div></div>`);
  const s = { id: sid, title: t.title };
  const r = { ...t, id: sid, servings: 1, tags: {}, steps: t.steps.map((x) => ({ ...x })) };
  $('#acFav').onclick = (e) => { if (a.favs[id]) { delete a.favs[id]; toast('Removed from Acura’s favourites'); } else { a.favs[id] = now(); heartBurst(e.currentTarget); toast('Pawfect — saved ♥'); } save(); e.currentTarget.classList.toggle('on', !!a.favs[id]); };
  $$('.checklist li[data-i]').forEach((li) => (li.onclick = () => toggleCheck(sid, 'i', li.dataset.i, li)));
  $$('.checklist li[data-s]').forEach((li) => (li.onclick = () => toggleCheck(sid, 's', li.dataset.s, li)));
  $('#acReset').onclick = () => withUndo('Ticks reset', () => { delete state.checks[sid]; }, () => $$('.checklist li.done').forEach((li) => li.classList.remove('done')));
  $('#acCook').onclick = () => openCook(r, s, 1);
  $('#acList').onclick = () => {
    let n = 0; t.groups.forEach((g) => g.items.forEach((it) => { if (/^water$/i.test(it.name)) return; const amt = it.qty != null ? [{ q: it.qty, u: it.unit || null, from: 'Acura' }] : null; if (addGrocery(it.name, guessCat(it.name), 'dog-' + pantryKey(it.name), 'Acura’s ' + t.title, amt)) n++; }));
    Object.values(state.grocery).forEach((g) => { if (g.key && g.key.startsWith('dog-')) g.dog = true; });
    save(); toast(n ? `Added ${n} item${n === 1 ? '' : 's'} for Acura` : 'Already on the list', n ? 'View' : null, () => go('#/grocery'));
  };
  $$('#acRate button').forEach((b) => (b.onclick = () => { const n = +b.dataset.r; a.ratings[id] = a.ratings[id] === n ? 0 : n; if (!a.ratings[id]) delete a.ratings[id]; save(); $$('#acRate button').forEach((x) => x.classList.toggle('on', +x.dataset.r <= (a.ratings[id] || 0))); if (a.ratings[id]) heartBurst(b); }));
  let nt; $('#acNote').oninput = (e) => { clearTimeout(nt); nt = setTimeout(() => { const v = e.target.value.trim(); if (v) a.notes[id] = v; else delete a.notes[id]; save(); }, 400); };
  $('#cookedBtn').onclick = (e) => {
    const first = !Object.keys(a.baked).length; const bid = uid();
    a.baked[bid] = { id: bid, treatId: id, date: todayISO(), by: state.profile.me || null, at: now() };
    delete state.checks[sid]; save(); checkMilestones();
    if (first) confetti(); heartBurst(e.currentTarget);
    toast(first ? "Acura's first batch! Good pup ♥" : `Treat jar topped up — good until ${dayWord(addDaysISO(todayISO(), t.keepDays || 7))}`, 'Undo', () => { delete a.baked[bid]; save(); router(); });
    setTimeout(() => viewTreat(id), 400);
  };
}

async function viewAcuraSafety() {
  setTop({ title: 'ACURA’S KITCHEN', back: '#/acura' });
  const D = await loadAcura(); if (!D) { render('<div class="wrap"><div class="empty">Couldn’t load the safety guide.</div></div>'); return; }
  const tb = treatBudget(); const p = AC().profile || {};
  render(`<div class="ac"><div class="wrap"><div class="kicker">${PAW('sm')}Keep Acura safe<span class="rule"></span></div><h1 class="h1" style="margin-top:6px">Safety guide</h1>
    <p class="lead" style="margin-top:4px">What never goes in the bowl, and how much is a good-pup amount.</p>
    <div class="ac-emerg">${svg('eyeoff')}<p>${esc(D.safety.emergency)}</p></div>
    <div class="sec"><div class="sec-title">Never feed</div><ul class="neverlist">${D.safety.never.map(([n, w]) => `<li><b>${esc(n)}</b><span>${esc(w)}</span></li>`).join('')}</ul></div>
    <div class="sec"><div class="sec-title">${PAW('sm')}Treat rules</div><ul class="pawbul">${D.safety.rules.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="sec"><div class="sec-title">${PAW('sm')}Daily treat calculator</div><div class="card calc">
      <div class="btnrow"><div class="field" style="margin:0"><label>Acura’s weight</label><input id="cW" type="number" inputmode="decimal" min="0.5" max="100" step="0.1" value="${esc(p.weight || '')}" placeholder="e.g. 12"></div>
      <div class="field" style="margin:0"><label>Units</label><div class="segtext" id="cU" style="grid-template-columns:1fr 1fr"><button data-u="kg" class="${p.unit !== 'lb' ? 'on' : ''}">kg</button><button data-u="lb" class="${p.unit === 'lb' ? 'on' : ''}">lb</button></div></div></div>
      <div id="cOut" class="calcout">${tb ? calcOut(tb, D) : '<p class="small muted">Enter a weight to see a daily treat guide.</p>'}</div>
      <p class="small muted" style="margin-top:8px">Estimate for a typical adult, spayed/neutered dog (RER × 1.6). Puppies, seniors, very active or overweight dogs differ — ask your vet.</p></div></div>
    <p class="small muted" style="margin-top:14px;font-style:italic">Sources: ${esc(D.safety.source)}</p></div></div>`);
  const upd = () => { const w = $('#cW').value; const a = AC(); a.profile = { ...(a.profile || {}), weight: w }; save(); const t2 = treatBudget(); $('#cOut').innerHTML = t2 ? calcOut(t2, D) : `<p class="small muted">${w ? 'That weight looks off — try between 0.5 and 100 kg (1–220 lb).' : 'Enter a weight to see a daily treat guide.'}</p>`; };
  $('#cW').oninput = upd;
  $$('#cU button').forEach((b) => (b.onclick = () => { const a = AC(); a.profile = { ...(a.profile || {}), unit: b.dataset.u }; $$('#cU button').forEach((x) => x.classList.toggle('on', x === b)); upd(); }));
}
function calcOut(tb, D) {
  return `<div class="co-top"><div><b>~${tb.daily}</b><span>kcal a day total</span></div><div><b>~${tb.treats}</b><span>kcal of treats</span></div></div>
    <ul class="co-list">${D.treats.map((t) => { const k = treatKcal(t); return k ? `<li><span>${esc(t.title)}</span><b>${Math.max(1, Math.floor(tb.treats / k))} a day</b></li>` : ''; }).join('')}</ul>`;
}
function openAcuraProfile() {
  const p = AC().profile || {};
  openSheet(`<h2>${PAW('sm')} Acura’s profile</h2><p class="sub">Used for the treat calculator and a birthday reminder. Stays on this phone.</p>
    <div class="btnrow"><div class="field"><label>Weight</label><input id="apW" type="number" inputmode="decimal" min="0.5" max="100" step="0.1" value="${esc(p.weight || '')}" placeholder="e.g. 12"></div>
    <div class="field"><label>Units</label><div class="segtext" id="apU" style="grid-template-columns:1fr 1fr"><button data-u="kg" class="${p.unit !== 'lb' ? 'on' : ''}">kg</button><button data-u="lb" class="${p.unit === 'lb' ? 'on' : ''}">lb</button></div></div></div>
    <div class="field"><label>Birthday or gotcha day (optional)</label><input id="apB" type="date" value="${esc(p.birthday || '')}"></div>
    <div class="field"><label>Allergies or vet notes (optional)</label><input id="apA" maxlength="80" value="${esc(p.allergies || '')}" placeholder="e.g. no chicken — itchy skin" autocomplete="off"></div>
    <div class="foot"><button class="btn" data-close>Cancel</button><button class="btn primary" id="apOk">Save</button></div>`, (b) => {
    let unit = p.unit || 'kg';
    $$('#apU button', b).forEach((x) => (x.onclick = () => { unit = x.dataset.u; $$('#apU button', b).forEach((y) => y.classList.toggle('on', y === x)); }));
    $('#apOk', b).onclick = () => { const a = AC(); a.profile = { ...(a.profile || {}), weight: $('#apW', b).value, unit, birthday: $('#apB', b).value || '', allergies: $('#apA', b).value.trim() }; save(); closeSheet(); toast('Saved — good pup ♥'); router(); };
  });
}

// ---------------------------------------------------------------- router: tabs, direction-aware transitions, per-tab scroll memory (#5, #15)
const TAB_ROOTS = { '#/': 'recipes', '#/pantry': 'pantry', '#/grocery': 'grocery', '#/budget': 'budget', '#/us': 'us', '#/acura': 'acura' };
function tabOf(h) {
  if (/^#\/(pantry|freezer)/.test(h)) return 'pantry';
  if (h.startsWith('#/grocery')) return 'grocery';
  if (h.startsWith('#/budget')) return 'budget';
  if (/^#\/(us|story|year)/.test(h)) return 'us';
  if (h.startsWith('#/acura')) return 'acura';
  if (h.startsWith('#/settings')) return '';
  return 'recipes';
}
const scrollMem = {}; const navStack = []; let routing = 0;
async function router() {
  const h = location.hash || '#/';
  const turn = ++routing;
  if (lastRoute != null) scrollMem[lastRoute] = vY();
  closeSheet();
  const tabNew = tabOf(h); const tabOld = lastRoute == null ? null : tabOf(lastRoute);
  let dir = 'fwd';
  if (lastRoute == null || lastRoute === h) dir = 'none';
  else if (TAB_ROOTS[h] !== undefined && tabNew !== tabOld) { dir = 'tab'; navStack.length = 0; }
  else if (navStack.length && navStack[navStack.length - 1] === h) { navStack.pop(); dir = 'back'; }
  else { navStack.push(lastRoute); if (navStack.length > 40) navStack.shift(); }
  for (const [rx, fn] of routes) {
    const m = h.match(rx);
    if (!m) continue;
    $$('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tabNew));
    if (document.body.classList.contains('acura') !== (tabNew === 'acura')) { document.body.classList.toggle('acura', tabNew === 'acura'); applyTheme(); }
    await fn(...m.slice(1));
    if (turn !== routing) return;
    let y = dir === 'back' || dir === 'tab' || dir === 'none' ? scrollMem[h] || 0 : 0;
    try { const sv = JSON.parse(sessionStorage.getItem('ok-scroll') || 'null'); if (sv && sv.h === h) { y = sv.y; } sessionStorage.removeItem('ok-scroll'); } catch (e) {}
    vTo(y);
    markLoaded($('#view'));
    if (dir !== 'none') animateView(dir);
    lastRoute = h;
    setTimeout(maybeApplyUpdate, 700);
    return;
  }
  go('#/');
}
// update 6: an in-place redraw (tapping a toggle, tick, stepper...) must not replay the screen-enter animation or move the
// scroll position: the old vin-* class stayed on #view, so every redraw slid/faded the whole page in again (the 'shake').
// The router adds the enter animation back after a real navigation (animateView runs after the view renders).
// Scroll anchor: when a tap redraws the screen, the control you tapped stays exactly where your finger was, even if
// something above it appeared or disappeared (a banner, the "add low & out" button, a longer title...).
let tapAnchor = null;
function anchorKey(el) {
  const parts = [];
  for (let e = el, i = 0; e && e.id !== 'view' && i < 4; e = e.parentElement, i++) {
    if (e.id) { parts.unshift('#' + CSS.escape(e.id)); break; }
    const attrs = [...e.attributes].filter((a) => a.name.startsWith('data-')).map((a) => `[${a.name}="${CSS.escape(a.value)}"]`).join('');
    if (attrs) parts.unshift(e.tagName.toLowerCase() + attrs);
  }
  return parts.length ? parts.join(' ') : null;
}
document.addEventListener('click', (e) => {
  const v = $('#view'); const el = e.target.closest && e.target.closest('button,label,li,.chip,[data-k],[data-l]');
  if (!el || !v.contains(el)) { tapAnchor = null; return; }
  const key = anchorKey(el); tapAnchor = key ? { key, top: el.getBoundingClientRect().top, at: performance.now() } : null;
}, true);
function render(html) {
  const v = $('#view'); const y = v.scrollTop; v.classList.remove('vin-fwd', 'vin-back', 'vin-tab'); v.innerHTML = html; if (y) v.scrollTop = y; markLoaded(v);
  const a = tapAnchor; tapAnchor = null;
  if (a && performance.now() - a.at < 1500) { const all = v.querySelectorAll(a.key); if (all.length === 1) { const d = all[0].getBoundingClientRect().top - a.top; if (Math.abs(d) > 1) v.scrollTop += d; } }
}
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('#tabbar a'); if (!a) return;
  if (a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); const v = $('#view'); try { v.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (x) { v.scrollTop = 0; } }
});

// ---------------------------------------------------------------- monthly recap, extended (#39)
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
  const hs = es.filter((c) => c.hearts && (c.hearts.Corey || c.hearts.Faith)).map((c) => { const v = [c.hearts.Corey, c.hearts.Faith].filter(Boolean); return { c, v: v.reduce((a, x) => a + x, 0) / v.length }; }).sort((a, b) => b.v - a.v)[0];
  const weeks = {}; es.forEach((c) => { const w = weekStart(c.date); weeks[w] = (weeks[w] || 0) + 1; });
  const dish = Object.values(state.dishes).filter((d) => d.date.startsWith(key));
  return { key, n: es.length, spent, topName, topN: top[1], fresh, corey: cnt('Corey'), faith: cnt('Faith'), photos, saved: es.reduce((a, c) => a + Math.max(0, state.settings.takeoutCost - mealCost(c)), 0),
    loved: hs ? { title: hs.c.title, v: hs.v } : null, goodWeeks: Object.values(weeks).filter((n) => n >= 3).length, dishes: { Corey: dish.filter((d) => d.who === 'Corey').length, Faith: dish.filter((d) => d.who === 'Faith').length } };
}
function recapCard(rc, dismiss) {
  return `<div class="recap"><div class="rk">${esc(monthName(rc.key).toUpperCase())} · ${rc.key === monthKey() ? 'SO FAR' : 'RECAP'}${dismiss ? '<button class="x" id="recapX" aria-label="Dismiss">×</button>' : ''}</div>
    <div class="rgrid"><div><b>${rc.n}</b><span>dinners</span></div><div><b>${money(rc.spent)}</b><span>spent</span></div><div><b>${money(rc.saved)}</b><span>saved vs takeout</span></div></div>
    <p>Most made: <b>${esc(rc.topName)}</b>${rc.topN > 1 ? ` ×${rc.topN}` : ''}.${rc.fresh ? ` ${rc.fresh} new recipe${rc.fresh === 1 ? '' : 's'} tried.` : ''}${rc.corey || rc.faith ? ` Corey cooked ${rc.corey}, Faith ${rc.faith}.` : ''}${rc.photos ? ` ${rc.photos} photo${rc.photos === 1 ? '' : 's'}.` : ''}${rc.loved ? ` Highest hearts: <b>${esc(rc.loved.title)}</b> (${r1(rc.loved.v)} ♥).` : ''}${rc.goodWeeks ? ` ${rc.goodWeeks} week${rc.goodWeeks === 1 ? '' : 's'} with 3+ dinners.` : ''}${rc.dishes.Corey + rc.dishes.Faith ? ` Dishes: Corey ${rc.dishes.Corey}, Faith ${rc.dishes.Faith}.` : ''}</p></div>`;
}

// ---------------------------------------------------------------- what's new (update 3)
const WHATSNEW_ID = 'u3-2026-11';
const WHATSNEW = [
  ['Smoother', 'Sheets slide down to close and the page behind stays put · no accidental zoom or bounce · swipe from the left edge to go back · pull down on Home to refresh · each tab remembers where you were · long-press a recipe for quick actions · updates install by themselves'],
  ['Home', "Tonight's plan with a start-cooking time · spin the wheel · your top 4 favourites as photo tiles · recently cooked · recipe of the week · leftover reminders · sort by quickest, cheapest or most cooked"],
  ['Cooking', 'Tap an ingredient in a step to count it down in the pantry · a “we’re out” button on every ingredient · missing-ingredient check · two dishes timed to finish together · choice of timer chimes · kitchen playlist · confetti the first time you make something'],
  ['Grocery', 'Sorted in No Frills aisle order · swipe right to tick, left to delete · Shop together: a grocery-date view with a running total and the list split between you'],
  ['Us', 'A new Us tab: cooking streak, badges, chef hats for who cooked, rate it together, taste tests, who’s on dishes, dessert wish jar, date-night countdown, signature dish, nicknames, “cook for me”, love stamps on photos, one-year-ago flashbacks and a year in review'],
  ['Acura', "Acura’s Kitchen: 6 vet-safe homemade dog treats with bake mode, a treat jar with “good until” dates, a daily treat calculator and a safety guide"],
  ['New recipes', '10 new dinners: teriyaki chicken bowls, orange chicken, beef lasagna, spaghetti & meatballs, shepherd’s pie, beef & broccoli, Philly cheesesteaks, garlic butter shrimp, chicken lo mein and beef stew'],
];
function whatsNewCard() {
  if (state.seenWhatsNew === WHATSNEW_ID) return '';
  return `<div class="wn"><div class="wn-k">NEW IN OUR KITCHEN<button class="x" id="wnX" aria-label="Dismiss">×</button></div>
    <p>10 new recipes, an Us tab just for the two of us, Acura’s Kitchen, and a smoother app all round. Everything you saved is still here.</p>
    <div class="btnrow" style="margin-top:10px"><button class="btn sm ghost" id="wnMore">See what's new</button><button class="btn sm gold" id="wnOk">Got it ♥</button></div></div>`;
}
function openWhatsNew() {
  openSheet(`<h2>What's new</h2><p class="sub">November 2026 · update 3 · everything you had saved stays exactly as it was.</p>
    <div class="wnlist">${WHATSNEW.map(([h, t]) => `<div><h4>${esc(h)}</h4><p>${esc(t)}</p></div>`).join('')}</div>
    <div class="foot"><button class="btn primary" data-close>Lovely</button></div>`);
  if (state.seenWhatsNew !== WHATSNEW_ID) { state.seenWhatsNew = WHATSNEW_ID; save(); }
}

// ---------------------------------------------------------------- settings: sounds & extras
function settingsExtrasHTML() {
  const st = state.settings;
  return `<div class="setgroup"><div class="sec-title">Sounds &amp; extras</div>
      <label class="setrow"><span class="l"><b>Gentle sounds</b><span>Soft clicks on taps and a tick when the wheel spins</span></span><span class="switch"><input type="checkbox" id="sndT" ${st.sounds ? 'checked' : ''}><i></i></span></label>
      <div class="setrow" style="border:0;padding-bottom:0"><span class="l"><b>Timer chime</b><span>Tap one to hear it</span></span></div>
      <div class="chimes" id="chimeSeg">${Object.entries(CHIMES).map(([k, [n]]) => `<button data-ch="${k}" class="${(st.chime || 'classic') === k ? 'on' : ''}">${svg('speaker')}${esc(n)}</button>`).join('')}</div>
      <label class="setrow"><span class="l"><b>Shake to undo</b><span>Shake the phone to undo the last change${typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function' ? ' (iPhone asks for motion access)' : ''}</span></span><span class="switch"><input type="checkbox" id="shkT" ${st.shake ? 'checked' : ''}><i></i></span></label>
      <label class="setrow"><span class="l"><b>Seasonal touches</b><span>A pumpkin in October, hearts for Valentine’s week</span></span><span class="switch"><input type="checkbox" id="seaT" ${st.seasonal !== false ? 'checked' : ''}><i></i></span></label>
      <div class="setrow"><span class="l"><b>Usual dinner time</b><span>For “Start cooking by” on tonight’s plan</span></span><input class="numin" id="dinT" type="time" style="width:auto" value="${esc(st.dinnerAt || '18:30')}"></div>
      <div class="setrow"><span class="l"><b>Kitchen playlist</b><span>${st.playlist ? 'Our own link is saved' : 'Spotify or Apple Music'}</span></span><button class="btn sm ghost" id="plBtn">${st.playlist ? 'Change' : 'Set up'}</button></div>
    </div>`;
}
function bindSettingsExtras() {
  const st = state.settings;
  $('#sndT').onchange = (e) => { st.sounds = e.target.checked; save(); if (st.sounds) { actx(); tone(1900, 0, 0.05, 0.06); } };
  $$('#chimeSeg button').forEach((b) => (b.onclick = () => { st.chime = b.dataset.ch; save(); actx(); playChime(st.chime); $$('#chimeSeg button').forEach((x) => x.classList.toggle('on', x === b)); }));
  $('#shkT').onchange = (e) => {
    if (!e.target.checked) { st.shake = false; save(); window.removeEventListener('devicemotion', onMotion); shakeOn = false; return; }
    enableShake(true).then((ok) => { if (ok) { st.shake = true; save(); toast('Shake to undo is on'); } else { e.target.checked = false; st.shake = false; save(); toast('Motion access was not allowed — the Undo button still works'); } });
  };
  $('#seaT').onchange = (e) => { st.seasonal = e.target.checked; save(); applySeason(); };
  $('#dinT').onchange = (e) => { if (e.target.value) { st.dinnerAt = e.target.value; save(); toast('Saved'); } };
  $('#plBtn').onclick = openPlaylist;
}

// ---------------------------------------------------------------- cook mode: finish two dishes together (#37)
function remainingMin(d) { return d.r.steps.slice(d.i).reduce((a, st) => a + (st.timer ? Math.min(st.timer, 240) : 3), 0); }
function alignHTML(sess) {
  if (sess.dishes.length < 2) return '';
  const [A, B] = sess.dishes; const ra = remainingMin(A), rb = remainingMin(B);
  const L = ra >= rb ? A : B, S = L === A ? B : A; const diff = Math.abs(ra - rb);
  const short = (t) => (t.length > 22 ? t.split(' ').slice(0, 3).join(' ') : t);
  const startT = cookTimers.find((t) => t.align);
  if (startT) return `<div class="align">${svg('clock')}<span>Start <b>${esc(short(startT.dish))}</b> in <b data-tleft="${startT.id}">${fmtSec(startT.left)}</b> — both finish together</span></div>`;
  if (S.done || L.done) return '';
  if (diff < 3 || S.i > 0) return `<div class="align">${svg('clock')}<span>Both dishes are on track to finish together ♥</span></div>`;
  return `<div class="align">${svg('clock')}<span>To finish together, start <b>${esc(short(S.r.title))}</b> about <b>${diff} min</b> after ${esc(short(L.r.title))}.</span><button class="btn sm gold" id="cAlign">Remind me</button></div>`;
}
function startAlign(sess) {
  const [A, B] = sess.dishes; const ra = remainingMin(A), rb = remainingMin(B);
  const S = ra >= rb ? B : A; const diff = Math.abs(ra - rb);
  cookTimers.push({ id: uid(), rid: S.s.id, dish: S.r.title, step: 0, left: diff * 60, end: now() + diff * 6e4, label: 'Start ' + S.r.title, align: true });
  ensureTick(); toast(`We'll chime when it's time to start ${S.r.title}`);
}

// ---------------------------------------------------------------- boot extras
function bootExtras() {
  initSW();
  if (state.settings.shake) {
    enableShake(false).then((ok) => { if (!ok) document.addEventListener('touchend', () => enableShake(true), { once: true }); });
  }
  let updated = false; try { updated = sessionStorage.getItem('ok-updated') === '1'; sessionStorage.removeItem('ok-updated'); } catch (e) {}
  if (updated) setTimeout(() => toast('Updated to the newest version ♥'), 400);
  return updated;
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
  const updatedNow = bootExtras();
  const t0 = performance.now();
  applySeason();
  try { await Promise.all([loadIndex(), loadPrices()]); } catch (e) { render('<div class="wrap"><div class="empty">Could not load recipes. Check your connection and reopen the app.</div></div>'); }
  checkMilestones(true);
  await router();
  if (!state.settings.welcomed) showWelcome();
  setTimeout(loadWeather, 1500);
  const wait = updatedNow ? 0 : Math.max(0, 800 - (performance.now() - t0));
  setTimeout(() => { $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 700); }, wait);
}
window.OK_DEBUG = { get state() { return state; }, set state(v) { state = v; save(); } };
boot();
})();
