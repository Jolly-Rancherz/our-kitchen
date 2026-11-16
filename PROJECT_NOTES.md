# Our Kitchen — project notes (read this first)

A couples cookbook for Corey and Faith: a static, offline iPhone home-screen web app (PWA), plain HTML/CSS/JS, no
framework and no build step besides `tools/build_index.py`.
Live: https://jolly-rancherz.github.io/our-kitchen/ (GitHub Pages, repo `Jolly-Rancherz/our-kitchen`, branch `main`).

## ABSOLUTE RULE: never reset or alter saved data
All personal data lives on each phone. An update must **never** wipe, reset, rename or rewrite it. Migrations are
add-only (new keys with defaults; never delete or change existing values). Change only what was asked.
Before every push, load the old version with realistic saved data, open the new version on top of it, and check
that every saved value survived (see `/workspace/cookbook/tools/preserve_*.mjs` for the pattern used so far).

## Files
- `index.html`: shell (splash, top bar, `#view`, tab bar, sheets, cook mode, welcome)
- `js/app.js`: the whole app (router, views, sheets, cook mode, storage, migrations, screen fit)
- `css/app.css`: theme + layout. Later "update N" blocks refine earlier rules; the iPhone fit is ONE block at the end
- `sw.js`: service worker. `VERSION` and the precache list are rewritten by the build script
- `recipes/<category>/NN-slug.json`: one recipe per file; `recipes/index.json` is GENERATED (don't edit it)
- `recipes/categories.json`, `recipes/prices.json`, `recipes/acura/` (dog treats)
- `assets/` (dish images, category tiles, Acura art, grain), `fonts/`, `icons/`, `vendor/` (receipt OCR, cached on use)
- Outside the repo (on the build box): `/workspace/cookbook/app_src/batch1.py`, `batch2.py` (recipe batch generators),
  `update2_data.py`, `acura_data.py`; test scripts in `/workspace/cookbook/tools/` (puppeteer, iPhone emulation)

## Build and deploy
1. `python3 tools/build_index.py` rebuilds `recipes/index.json`, checks the dislike list, sets the $/$$/$$$ and
   time tags, and **bumps the SW version** (a hash of the files). Run it after ANY change, or phones keep the old copy.
2. Test (saved-data preservation + iPhone emulation, including the 402×874 screen with an 812 viewport).
3. `git commit` and `git push` to `main`. Pages deploys in about a minute; check that the live `sw.js` shows the new `VERSION`.
4. Phones self-update (the new SW is applied on the next quiet moment, with an "Updated" toast). Closing and reopening the app helps.

## Storage keys
- `localStorage["ourkitchen.v1"]`: the single state object (favourites, pantry, grocery, budget log, cooked,
  own recipes, photos, settings, Us/Acura data...). Collections are keyed by id with `updatedAt`, ready for sync.
- `localStorage["ourkitchen.weather"]`: cached London weather (safe to lose)
- `localStorage["ourkitchen.fit"]`: left by Update 5's removed switch. Now ignored; never delete it
- `sessionStorage["ok-scroll"]`, `["ok-updated"]`: transient (scroll restore and toast after a self-update)
- Backups: Settings → Backup → Export/Restore (JSON of the state)

## Food rules (all recipes)
- No mushrooms, mustard or olives (olive oil is fine). The build script and the add-recipe form enforce this
- Few peppers. Not spicy, but well seasoned
- Herbs only as dried seasoning, never visible leaves or garnish
- Budget is $350–400 a month at No Frills. Price tags per recipe: `$` under $20, `$$` $20–30, `$$$` over $30

## Locked style
Matte cream, navy, plum, lavender and gold. Cinzel plus an italic serif (Instrument Serif), Outfit for UI text. No
glow. **Never redraw the category tiles.** Keep the app uncluttered.

## Declined (don't build)
A names setting, a welcome tour, a help page, an accessibility check, a tile redraw, dinner bingo, sunset auto dark mode.

## Not built yet
- Faith sync (data is per phone; the state shape is ready for it)
- Recipes: 21 of the 101 planned are in; **80 still to add** in small batches (`app_src/batch*.py` pattern)

## iOS 26 "strip" and the tab bar (final solution, Update 6)
On iOS 26.1+ with `apple-mobile-web-app-status-bar-style=black-translucent`, a home-screen app is drawn from the top
of the screen, but the viewport is one status bar short (iPhone 16/17 Pro: screen 874pt, viewport 812, insets 62/34).
WebKit fills the 62pt strip below with the **body** background and doesn't paint page content in the bottom 34pt
(home-indicator zone).
- Update 4: bar ended at 812pt, so it sat too high. Update 5: the shell was stretched by the full 62pt, with a Settings
  switch, so the bar went too low. Both were removed.
- Update 6: `fitScreen()` detects the strip and sets `--shellh` = viewport + (strip − bottom inset) = 840pt, so the
  tab bar ends exactly where the home-indicator zone begins. In strip mode the body is painted the tab-bar colour
  (or the open layer's colour), so the strip reads as part of the bar. The splash spans the full screen. Faith's 16 Pro
  has the same geometry. Settings shows a diagnostics line (screen, view, safe areas, strip, bar lift).
- A full fix would be to drop black-translucent, but changing that meta needs the home-screen icon re-added, which
  wipes data unless you Export first and then Restore. Only do it if Corey says yes.

## Smoothness rules (Update 6)
- `render()` never replays the screen-enter animation, keeps the scroll position, and keeps the tapped control under
  the finger (scroll anchor). The enter animation only runs on real navigation (`animateView`).
- Home search only swaps `#homeBody` (120ms debounce). The input is never recreated, and result cards are reused.
- Sheets with tabs update only their panel (Ideas has a fixed height). Photo stamps and cook mode update in place.

## Update history
| Update | Commit | What |
|---|---|---|
| 1 | c73371c, 922aac2 | App + Mom's potato soup; batch 1 (10 recipes) |
| 2 | 1d1978e | Cooking help, grocery + receipt scan, ideas, our story, extras |
| – | 8784ec7 | Budget: no double counting after a receipt scan |
| 3 | 4fd37a7 | 10 recipes, Us tab, Acura's Kitchen, app shell, self-update |
| 4 | 731d494 | Gliding sheets, first iPhone fit, no tap flash |
| 5 | 8b12ea6 | Tab bar stretched into the strip + switch (too low; replaced) |
| 6 | see `git log` | Middle-ground tab bar fit (no switch), splash fit, no shake on taps, smooth search, wheel re-spin fix, notes |
