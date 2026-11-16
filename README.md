# Our Kitchen — Corey ♥ Faith

A static, offline-capable iPhone home-screen web app (PWA). No build step: plain HTML/CSS/JS.
All personal data (favourites, ticks, pantry, grocery list, budget log, own recipes) is stored
on the phone in localStorage under one state object (`ourkitchen.v1`). Use Settings → Backup
to export/restore.

## Folder
- `index.html`, `css/app.css`, `js/app.js` — the app
- `sw.js` — service worker (offline). Version + file list are rewritten by `tools/build_index.py`
- `manifest.webmanifest`, `icons/` — home-screen icon (navy; a plum alternative is in `icons/alt-plum-*`)
- `recipes/categories.json` — the 7 categories (order, colour, tile)
- `recipes/<category>/NN-slug.json` — one recipe per file, numbered within its category
- `recipes/index.json` — GENERATED, don't edit by hand
- `assets/img/` dish illustrations, `assets/tiles/` category tiles, `fonts/`

## Add a recipe
1. Copy an existing recipe file into its category folder with the next number,
   e.g. `recipes/chicken/02-lemon-chicken.json`. Other categories keep their numbers.
2. Run `python3 tools/build_index.py` (checks the no-mushroom/mustard/olive rule,
   works out $/$$/$$$ and time tags, bumps the offline cache).
3. Upload the folder again.

## Hosting
Any static host works; all paths are relative, so it runs at a domain root or a subpath
(e.g. GitHub Pages `https://<user>.github.io/our-kitchen/`). `.nojekyll` is included.
On iPhone: open the URL in Safari → Share → Add to Home Screen.
