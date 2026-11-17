/* Our Kitchen service worker — offline support.
   VERSION and the PRECACHE list are rewritten by tools/build_index.py. */
const VERSION = 'a9baa330dd';
const CACHE = 'our-kitchen-' + VERSION;
const VENDOR = 'ok-vendor-tesseract-5.1.1';
const PRECACHE = /*PRECACHE*/[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/grain.png",
  "./assets/acura/apple-carrot-bites-sm.webp",
  "./assets/acura/apple-carrot-bites.webp",
  "./assets/acura/banana-oat-bites-sm.webp",
  "./assets/acura/banana-oat-bites.webp",
  "./assets/acura/chicken-jerky-sm.webp",
  "./assets/acura/chicken-jerky.webp",
  "./assets/acura/pb-pumpkin-biscuits-sm.webp",
  "./assets/acura/pb-pumpkin-biscuits.webp",
  "./assets/acura/pupsicles-sm.webp",
  "./assets/acura/pupsicles.webp",
  "./assets/acura/sweet-potato-chews-sm.webp",
  "./assets/acura/sweet-potato-chews.webp",
  "./assets/img/air-fryer-honey-garlic-chicken-sm.webp",
  "./assets/img/air-fryer-honey-garlic-chicken.webp",
  "./assets/img/baked-mac-and-cheese-sm.webp",
  "./assets/img/baked-mac-and-cheese.webp",
  "./assets/img/beef-and-broccoli-sm.webp",
  "./assets/img/beef-and-broccoli.webp",
  "./assets/img/beef-lasagna-sm.webp",
  "./assets/img/beef-lasagna.webp",
  "./assets/img/beef-stew-sm.webp",
  "./assets/img/beef-stew.webp",
  "./assets/img/beef-tacos-sm.webp",
  "./assets/img/beef-tacos.webp",
  "./assets/img/broccoli-cheddar-soup-sm.webp",
  "./assets/img/broccoli-cheddar-soup.webp",
  "./assets/img/chicken-alfredo-sm.webp",
  "./assets/img/chicken-alfredo.webp",
  "./assets/img/chicken-fried-rice-sm.webp",
  "./assets/img/chicken-fried-rice.webp",
  "./assets/img/chicken-lo-mein-sm.webp",
  "./assets/img/chicken-lo-mein.webp",
  "./assets/img/chicken-parm-spaghetti-sm.webp",
  "./assets/img/chicken-parm-spaghetti.webp",
  "./assets/img/chicken-teriyaki-bowl-sm.webp",
  "./assets/img/chicken-teriyaki-bowl.webp",
  "./assets/img/cover.webp",
  "./assets/img/creamy-garlic-parmesan-chicken-sm.webp",
  "./assets/img/creamy-garlic-parmesan-chicken.webp",
  "./assets/img/garlic-butter-shrimp-sm.webp",
  "./assets/img/garlic-butter-shrimp.webp",
  "./assets/img/garlic-butter-steak-bites-sm.webp",
  "./assets/img/garlic-butter-steak-bites.webp",
  "./assets/img/honey-garlic-salmon-sm.webp",
  "./assets/img/honey-garlic-salmon.webp",
  "./assets/img/moms-potato-soup-sm.webp",
  "./assets/img/moms-potato-soup.webp",
  "./assets/img/orange-chicken-sm.webp",
  "./assets/img/orange-chicken.webp",
  "./assets/img/philly-cheesesteak-sm.webp",
  "./assets/img/philly-cheesesteak.webp",
  "./assets/img/shepherds-pie-sm.webp",
  "./assets/img/shepherds-pie.webp",
  "./assets/img/spaghetti-meatballs-sm.webp",
  "./assets/img/spaghetti-meatballs.webp",
  "./assets/tiles/beef-turkey.webp",
  "./assets/tiles/chicken.webp",
  "./assets/tiles/comfort-soups.webp",
  "./assets/tiles/heart.webp",
  "./assets/tiles/pasta-italian.webp",
  "./assets/tiles/seafood.webp",
  "./assets/tiles/steak-pork.webp",
  "./assets/tiles/takeout-at-home.webp",
  "./css/app.css",
  "./fonts/Cinzel.woff2",
  "./fonts/InstrumentSerif-Italic.woff2",
  "./fonts/InstrumentSerif-Regular.woff2",
  "./fonts/Outfit.woff2",
  "./icons/alt-plum-apple-touch-icon.png",
  "./icons/alt-plum-icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./js/app.js",
  "./recipes/categories.json",
  "./recipes/index.json",
  "./recipes/prices.json",
  "./recipes/acura/treats.json",
  "./recipes/beef-turkey/01-beef-tacos.json",
  "./recipes/beef-turkey/03-shepherds-pie-with-cheesy-mash.json",
  "./recipes/beef-turkey/07-beef-and-broccoli.json",
  "./recipes/chicken/01-air-fryer-crispy-honey-garlic-chicken.json",
  "./recipes/chicken/02-chicken-parm-with-spaghetti.json",
  "./recipes/chicken/03-creamy-garlic-parmesan-chicken-with-mashed-potatoes.json",
  "./recipes/chicken/06-chicken-teriyaki-rice-bowls.json",
  "./recipes/chicken/10-orange-chicken.json",
  "./recipes/comfort-soups/01-moms-famous-potato-soup.json",
  "./recipes/comfort-soups/02-broccoli-cheddar-soup.json",
  "./recipes/comfort-soups/03-beef-stew.json",
  "./recipes/pasta-italian/01-chicken-alfredo.json",
  "./recipes/pasta-italian/03-classic-beef-lasagna.json",
  "./recipes/pasta-italian/05-baked-mac-and-cheese.json",
  "./recipes/pasta-italian/06-spaghetti-and-meatballs.json",
  "./recipes/seafood/01-honey-garlic-salmon.json",
  "./recipes/seafood/02-garlic-butter-shrimp-with-rice.json",
  "./recipes/steak-pork/01-garlic-butter-steak-bites.json",
  "./recipes/steak-pork/02-philly-steak-and-cheese-sandwiches.json",
  "./recipes/takeout-at-home/01-chicken-lo-mein.json",
  "./recipes/takeout-at-home/02-chicken-fried-rice.json"
]/*END*/;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('our-kitchen-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Opening the app (navigation): the app shell comes straight from this version's cache, so launch never waits on the
// network (no blank/black screen on a weak signal). New versions arrive as a new service worker that precaches a
// fresh shell together with its matching css/js, and the app applies it (see maybeApplyUpdate in app.js).
// Recipe data (.json) stays network-first so new recipes show up; everything else is cache-first.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(CACHE).then((c) => c.match('./index.html').then((m) => m || c.match('./')).then((m) => m || fetch(req))));
    return;
  }
  const fresh = url.pathname.endsWith('.json') || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (fresh) {
    // network-first, but don't hang on a weak signal: fall back to the cache after 3.5 s
    e.respondWith(new Promise((resolve) => {
      let done = false;
      const fromCache = () => caches.match(req, { ignoreSearch: true }).then((m) => m || (req.mode === 'navigate' ? caches.match('./index.html') : null));
      const timer = setTimeout(() => { fromCache().then((m) => { if (m && !done) { done = true; resolve(m); } }); }, 3500);
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        clearTimeout(timer); if (!done) { done = true; resolve(res); }
      }).catch(() => {
        clearTimeout(timer);
        fromCache().then((m) => { if (!done) { done = true; resolve(m || Response.error()); } });
      });
    }));
    return;
  }
  // the receipt reader (vendor/) lives in its own cache so app updates don't make phones re-download it
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(
      caches.open(VENDOR).then((c) => c.match(req, { ignoreSearch: true }).then((m) => m || fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      })))
    );
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((m) => m || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
