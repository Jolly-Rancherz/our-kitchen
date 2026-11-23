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
- `tools/u9_levels.py`: the Update 9 Basic/Fancy specs, why notes and the recipe audit fixes, already applied to the
  JSON. Kept as a record; don't rerun it blind. **`app_src/acura_data.py` is older than Update 9: running it would
  rewrite `treats.json` without the levels, so edit `treats.json` directly instead**

## Build and deploy
1. `python3 tools/build_index.py` rebuilds `recipes/index.json`, checks the dislike list, sets the $/$$/$$$ and
   time tags, and **bumps the SW version** (a hash of the files). Run it after ANY change, or phones keep the old copy.
2. Test (saved-data preservation + iPhone emulation, including the 402×874 screen with an 812 viewport).
   Add the update's patch notes as a NEW entry at the TOP of `UPDATES` in app.js (see "Patch notes" below). That
   entry is also the version shown at the foot of Settings and drives the "New in Our Kitchen" card.
3. `git commit` and `git push` to `main`. Pages deploys in about a minute; check that the live `sw.js` shows the new `VERSION`.
4. Phones self-update: the new SW is applied only while the app is in the background (or on the next launch),
   never while it's on screen. A reload in view replays the splash and redraws all text, which reads as a jolt
   (Update 8.2). Leaving the app for a moment, or closing and reopening it, picks up a new version.

## Storage keys
- `localStorage["ourkitchen.v1"]`: the single state object (favourites, pantry, grocery, budget log, cooked,
  own recipes, photos, settings, Us/Acura data...). Collections are keyed by id with `updatedAt`, ready for sync.
- `localStorage["ourkitchen.weather"]`: cached London weather (safe to lose)
- `localStorage["ourkitchen.fit"]`: left by Update 5's removed switch. Now ignored; never delete it
- `sessionStorage["ok-scroll"]`, `["ok-updated"]`: transient (scroll restore and toast after a self-update)
- No IndexedDB and no other store: every photo (recipe photos, cooked-it photos, Acura's wall) is a JPEG data URL
  inside `ourkitchen.v1`
- Backups (Update 8 audit): Settings → Backup → Export writes `{ app, exportedAt, state, extra }`, where `state` is
  `ourkitchen.v1` byte for byte and `extra` holds every other `ourkitchen.*` key. iPhone: share sheet (files only) →
  Save to Files; elsewhere a download. Restore (Settings, or "Restore from backup" on the welcome screen of a fresh
  install) runs the same add-only `migrate()` as app start, writes the state as-is (no new `updatedAt`), puts back the
  `extra` keys and hides the welcome. Test: `tools/u8_backup.mjs` (4 MB of photos → export → empty profile → restore
  → every key identical; `FROM=old7` exports with the Update 7 build)
- Update 7 added (add-only) to the state: `plan` (week plan by date), `staples`, `priceLog` (last 12 receipt prices
  per item), `noteMeta` (who/when a recipe note was edited), `places`, `mystery`, `thanks`, `dateMenus`, `acura.photos`
  (640px JPEGs, max 30; all photos live in localStorage, so the phone's ~5MB limit applies)
- Update 9 added (add-only): `levels` (recipe id or `acura-<treat id>` → 'basic' | 'classic' | 'fancy', the last level
  used), `levelNotes` (id → level → { text, by, at }), `fancyNight` (id → 1), `bookmark` ({ h, y, at }: last recipe or
  treat page and scroll), `ourDish` ({ id, date, remind, at, seen }), `acura.paws` (treat id → time approved).
  Cooked entries made in Update 9 also carry `level`. The default timer sound for NEW installs is 'bell'; a saved
  pick is kept
- Update 9.1 added (add-only): `scratched` (recipe id or `acura-<treat id>` → time the first-time scratch card was
  revealed)

## Food rules (all recipes)
- No mushrooms, mustard or olives (olive oil is fine). The build script and the add-recipe form enforce this
- Few peppers. Not spicy, but well seasoned
- Herbs only as dried seasoning, never visible leaves or garnish
- Budget is $350–400 a month at No Frills. Price tags per recipe: `$` under $20, `$$` $20–30, `$$$` over $30
- **Every recipe needs all three levels** (Update 9). The recipe JSON as written is Classic. Add `levels.basic` and
  `levels.fancy` (`note`; `drop` item refs "g-i"; `add` [{ group, item }]; `stepNotes` { index: note }; `addSteps`;
  `costDrop` breakdown keys/labels; `costAdd` [{ label, amount }]; Fancy also needs `plating` [3 tips]), plus `why`
  ({ "g-i": one-line reason } for the 2–4 ingredients that matter most) and `fancyNight` (true for date-night dishes).
  Acura's treats need the same `levels` plus `levelCost` [basic, classic, fancy] and `why`, with dog-safe ingredients
  only (check `safety.foods`). `tools/build_index.py` refuses to build if any of this is missing.
- **Every recipe and treat needs a `funFact`** (Update 9.1): one short, true, checkable fact about the dish (treats:
  about dog nutrition), shown under the first-time scratch card. Also enforced by `build_index.py`.

## Locked style
Matte cream, navy, plum, lavender and gold. Cinzel plus an italic serif (Instrument Serif), Outfit for UI text. No
glow. **Never redraw the category tiles.** Keep the app uncluttered.

## Declined (don't build)
A names setting, a welcome tour, a help page, an accessibility check, a tile redraw, dinner bingo, sunset auto dark mode.
Anything that repeats an existing feature: a dice button (Spin the wheel / Surprise me), a second season decoration
(the seasonal layer), a second milestone badge (Badges). Extend the existing feature instead.

## Not built yet
- Faith sync (data is per phone; the state shape is ready for it)
- Recipes: 21 of the 101 planned are in; **80 still to add** in small batches (`app_src/batch*.py` pattern), each
  with all three levels (see Food rules)

## iOS 26 "strip", the status bar and the tab bar (Update 6.1 + Update 8)
On iOS 26.1+ with `apple-mobile-web-app-status-bar-style=black-translucent`, a home-screen app is drawn from the top
of the screen, but the viewport is one status bar short (iPhone 16/17 Pro: screen 874pt, viewport 812, insets 62/34).
WebKit fills the 62pt strip below with the **body** background colour. It does not draw page content there and does
not deliver taps there: Corey's 4:08 PM welcome screenshot (refs/u61-welcome-phone.jpg) shows the collage stopping at
exactly 812pt although the image continues.
- Update 4: bar ended at 812pt (centred content, looked high). Update 5: shell stretched by 62pt + switch (too low).
- Update 6 grew the shell to 840pt. That put the lower half of every tab (the labels) below 812pt, where taps are
  lost, so tabs often needed several taps; it also cut the welcome card. Removed in 6.1.
- Update 6.1: `fitScreen()` only marks `html.strip`; the shell stays inside the 812pt viewport. In strip mode the tab
  icons (25px) and labels sit at the foot of the bar (labels end at ~807pt), the body is the tab-bar colour (or the open
  layer's colour) so the bar's colour runs to the physical edge, and every tab's hit target is the full column × the full
  58pt bar (754–812pt), clear of the home-indicator gesture zone. The welcome card is edge to edge at the bottom and its
  cream continues into the strip. The gap from the labels to the home-indicator pill (~54pt) cannot be smaller
  without moving the icons into the dead zone. Settings shows a diagnostics line (screen, view, safe areas, strip).
- Update 8 (Corey said yes): `apple-mobile-web-app-status-bar-style` is now `default`. iOS reads it only when the icon
  is added, so there are two kinds of install, told apart by `fitScreen()`:
  - old install (black-translucent; Faith until she re-adds): top safe area 62 = the gap → `html.strip`, the exact
    6.1 layout above (pixel-identical, checked with tools against the Update 7 build)
  - new install: the view starts below a solid status bar (tinted by `theme-color`, which `applyTheme()` sets to the
    header colour: navy, or brown on Acura's tab) and reaches the bottom edge; top safe area 0, bottom 34 →
    `html.solid`: each tab runs to the bottom edge (all tappable), labels end ~11pt above the home-indicator pill
  - launch images (`tools/u8_launch.mjs`) centre the wordmark under the status bar, where the splash sits now
  - Emulation: `tools/u4_env.mjs` `mode: "solid"` (real `env()` insets via CDP `Emulation.setSafeAreaInsetsOverride`)
- The splash wordmark is sized in px (index.html), never rem: Bigger text must not enlarge it, or it jolts from the
  regular-size launch image to a bigger splash on every launch (fixed in 8.1)
- Re-adding the icon deletes that install's storage: always Export first, then Restore in the new install.

## Smoothness rules (Update 6)
- `render()` never replays the screen-enter animation, keeps the scroll position, and keeps the tapped control under
  the finger (scroll anchor). The enter animation only runs on real navigation (`animateView`).
- Home search only swaps `#homeBody` (120ms debounce). The input is never recreated, and result cards are reused.
- Sheets with tabs update only their panel (Ideas has a fixed height). Photo stamps and cook mode update in place.

## Update 7: where things live (no new tabs)
- Recipes tab: filter "Ready to make now" (Our pantry group); thank-you note card at the top; nudges for prep ahead
  (tomorrow's planned dinner, thaw reminders), weather dinners and Fridge-clear Friday; Ideas sheet = Surprise me
  (time/budget/mood limits), Mood, Fridge clear, In season (Ontario, monthly), While-you-wait, Weather, Wish list.
- Recipe page: "Acura's share" (pup-safe leftovers), swaps on every ingredient (rules: no mushrooms/mustard/olives),
  notes show who edited them and when, "Rate together · in secret" then reveal (also in More).
- Cook mode: next-step preview under each step; our notes on step 1 and in the ingredients panel.
- Grocery tab: aisles in No Frills walking order; "Plan the week" (7 dinners → one merged list, pantry "Have it"
  unticked); "Staples" (editable, add in one tap); receipt review flags prices that jumped (≥20% and ≥$0.50).
- Settings → receipt prices: "See" lists the last price of each item.
- Us tab: Mystery meal, Thank-you jar, Date-in menu (`#/menu`, one per month, shuffle), Places we love (`#/places`,
  with the closest home recipe), keepsake printable cookbook (`#/keepsake`, from Our story; on iPhone Share → Print).
  Badges: 6 new (week planned, thank-you, mystery, 3 places, date-in, Acura photo).
- Acura tab: "Can Acura eat this?" search (`recipes/acura/treats.json` → `safety.foods`), Acura's photo wall.

## Update 9: where things live (no new tabs)
- Recipe page: Basic / Classic / Fancy switch under the stats (`levelBar`; remembered per recipe, with "How was
  Fancy?" notes and "Make it with what I've got", which picks the richest level the pantry covers). Levels are
  applied by `applyLevel()`, which keeps each ingredient's original "g-i" key, so ticks, swaps and the grocery list
  keep working. Price pill and Money section follow the level (`levelCost`). Fancy adds a plating card. Ingredients:
  ⓘ why-it-matters note, and a spice backup line under a spice the pantry has as out or low (`SPICE_BACKUP`).
- "Fancy night" chip in the plan row: the recipe then always opens on Fancy.
- Swipe left/right on a recipe or treat page turns to the next/previous one in the same category ("N of M" on the
  kicker). Turn engine: `initPageTurn` (transform only, ~400ms, never from the left 28pt edge, sliders, scroll rows
  or the level switch; vertical scroll wins unless the move is clearly sideways). Reduced motion: no animation.
- Home: gold bookmark ribbon (last recipe/treat page, reopens at the same scroll), "Our dish" card the week of its date.
- (Update 9 also shipped a dice button, a Home season mark and quiet 10/25/50 badges. They repeated existing features
  that had been declined as duplicates, so 9.1 removed them; see the 9.1 section.)
- Hero: "Cooked ♥ N×" ink stamp (treats: "Baked"). Our dish: More → Our dish (pill on the page, heart on cards).
- Timer: 7 sounds (Settings → Timer alarm, or the Alarm button in cook mode), rings louder every 2.6s for ~30s with a
  pulsing banner and Stop. iPhone: sound only while the app is open (no background alarms for web apps); while it
  rings the audio session is set to playback so the silent switch doesn't mute it (iOS 16.4+).
- Acura: levels on every treat, paw of approval (approved treats sort first, "Acura approves" on the card).
- Status bar: `#topbar` is `position: sticky` so iOS 26 colours the status bar from the header itself (brown on
  Acura's tab, navy elsewhere), instead of the page colour.
- Tests (on the build box, `/workspace/cookbook/tools/`): `u9_smoke.mjs` (every feature), `u9_preserve.mjs` (Update 8.2 → 9 on the same phone, backup
  restore both ways), `u9_shots.mjs` (previews), `/tmp/pw/smooth9.mjs` (WebKit/Chromium frame timing).

## Update 9.1: patch notes history, scratch card, no doubles
- **Patch notes** (rule): `UPDATES` in `js/app.js` is THE one list of patch notes, newest first, strict JSON between
  `/* UPDATES:BEGIN */` and `/* UPDATES:END */`. Each entry: `{ name, id, date: "YYYY-MM-DD", intro, notes: [[heading,
  text], ...] }`, written in friendly plain words. Every future update adds ONE entry at the top; nothing else to bump
  (`APP_UPDATE` and `WHATSNEW_ID` come from the top entry; a new `id` shows the Home card again). `build_index.py`
  checks it is valid, complete, unique and newest first. "See what's new" opens the top entry, with a small "Past
  updates" link under it: one-line rows (name + date, all updates so far shipped on 2026-11-16) that open in place.
- First-time scratch card (#107): on a recipe never cooked (treat never baked), above the level switch.
  `scratchCard`/`bindScratch`: a canvas of matte gold foil over the `funFact`; scratched past half, it fades and
  `state.scratched` remembers it. The card disappears once cooked. The fact is real text under the canvas
  (screen readers read it). The card is in `NO_TURN` so scratching never turns the page.
- No doubles: the dice (Spin the wheel and Surprise me already pick a random dinner), the Home season mark (the
  seasonal layer #21/#30 — snow, October pumpkin, Valentine's and anniversary hearts — is the one season system) and
  the quiet 10/25/50 badge (milestones/Badges already cover 10, 25 and 50 dinners, with their toast as before) were
  removed. `checkMilestones` is back to its Update 8 form.
- Tests (build box): `u91_shots.mjs` (What's new, Past updates, scratch → reveal → remembered, hidden once cooked,
  Acura), `u9_preserve.mjs` with `OLD=old9` (Update 9 → 9.1) and the default (Update 8.2 → 9.1).

## Update 9.2: pantry buttons hotfix
- Cause: Update 9 added a recipe-level `setLevel(id, k)` while the pantry already had `setLevel(key, name, cat,
  level)`. Both are top-level function declarations in the same scope, so the later one silently replaced the pantry's:
  Lots / Have / Low / Out wrote a junk `state.levels[<pantry key>] = <item name>` and never changed the stock. The
  recipe one is now `setRecipeLevel`. Leftover junk keys in `state.levels` are inert (only read by recipe id) and are
  left untouched (no saved-data changes).
- Acura status bar (still blue on Corey's iPhone 17 Pro, iOS 26, installed with status-bar-style `default`): iOS 26
  home-screen apps ignore live `theme-color` changes and tint the solid status bar from the `<html>` background. `html`
  is `background: var(--bar)`, but Acura's `--bar` was only set on `body.acura`, so `<html>` stayed navy. `applyTheme`
  now mirrors the class onto `<html>` (`html.acura` brown / dark brown). `theme-color` is still updated for older iOS.
  Not testable off-device; if it is still blue, the only other route is status-bar-style `black-translucent` (needs a
  re-install from the home screen).
- Rule: one name per top-level function in `js/app.js`; `build_index.py` fails the build on a duplicate.
- Test: `/tmp/pw/taps92.mjs` (WebKit, touch taps on every tab with saved data; `BASE=old91` reproduces 9.1).

## Update 9.3: edit + delete meals, calm start-up, steady level switch
- Launch flash: the launch image (what iOS shows first) is navy with cream words, but in the light theme the splash
  painted cream on its first frame — a full-screen navy-to-cream flash. In the home-screen app the splash is now
  always the launch navy (inline styles in index.html, `@media (display-mode: standalone)`), then fades as before.
  Also, the weather arriving 1.5 s after start redrew all of Home and pushed everything down; now `#wxLine` always
  holds its one line and `loadWeather` only changes its text.
- Image shake: a level switch (and servings, Fancy night, paw…) redrew the whole recipe with innerHTML, so WebKit
  re-created and re-decoded the photo (a blank frame). `render(html, page)` now patches the DOM when the same page is
  drawn again (`patchChildren`/`patchNode`): unchanged nodes stay, the photo node is never replaced, scroll stays.
  Rule: bind recipe/treat page handlers with `el.onclick =`, not addEventListener (a patched node keeps its listeners).
  `.pill.price` has a fixed width so $ / $$ / $$$ never re-wrap the pills.
- Edit recipe (`viewEditRecipe`, `#/add/<id>`; Add a recipe stays `viewAdd`): rows per ingredient (amount, unit,
  "name, note") and per step, add/remove, plus Basic / Fancy extras for built-ins. Built-in edits are overrides in
  `state.edits[id]` with `refs: 1`: every item keeps its original `ref` (new items `n…`), steps keep `sref`, a level's
  extras go in `lvAdd`. So ticks, why notes, step links, level drops/swaps/step notes, pantry matching (`pantryFor`),
  the missing-ingredients sheet, grocery list, search and the pantry catalog (`bookSummary`) all follow the edit.
  Cost: live receipt prices unless the total was changed. "Reset to original" (confirm) deletes the override (kept in
  `state.versions`, undo toast). Edits saved before 9.3 (no `refs`) still work as before (no levels).
- Delete meal: last item of the hold menu (and the recipe's More menu), quiet red, confirm sheet like Reset everything.
  Built-ins: `state.deleted[id]` (new, add-only); `allRecipes()` drops them, so lists, wheel, plans, page turns, N of M
  and Surprise me all lose them; Settings → Deleted recipes → Restore. Our own recipes are deleted for real.
  Acura's treats have no hold menu, so no edit/delete there.
- Tests: `/tmp/pw/ed93.mjs` (hold menu, delete/restore, own delete, legacy edit, full edit flow through levels,
  pantry, search, missing sheet, grocery, reset), `lv93.mjs` (same photo node, no movement, scroll kept),
  `launch92b.mjs` (one Home render), `splash93.mjs`, `taps92.mjs`, `u9_smoke.mjs`, `u9_preserve.mjs OLD=old92`.

## Update 10: the cookbook
- Paper: `body::before` is a fixed, tap-through sheet (z 45, under the header/tab bar) with a spine gutter on the
  left, edge darkening (radial deckle + right edge) and a faint long-fibre SVG texture over the existing grain.
  Plain alpha, no blend modes (cheap to composite while scrolling and turning). Dark theme: shadows only.
- Chapters: `#/c/<slug>` opens on a chapter divider (`.chapter`: "Chapter I…" from the category order, gold `ORN`
  rules). `chapterList(cat)` = chapter page + recipes in book order is the flip order for both, so you swipe from the
  divider into recipe 01 and back. "N of M" counts recipes only.
- Flourishes: `ORN` (gold ornamental rule) under the recipe stats; a Cinzel drop cap on every recipe/treat lead;
  photos framed as printed plates (`.hero .tile` cream mat + gold hairline + soft shadow, matte filter; card thumbs
  framed with outset shadows and `align-self:start`).
- Page turn: still follows the finger (rotateY from the spine, transform only). New `.curl` shade inside the turning
  page whose opacity tracks the turn (darkens toward the lifting edge, ends in an edge shadow) — opacity only, no
  box-shadow. New page settles in 120 ms. Test: `/tmp/pw/flip10.mjs` (synthetic 60 Hz touches in WebKit: frame gaps,
  settle time, chapter flips, cancel cleanup, taps pass through the paper); `flip10b.mjs` at DPR 1 vs `BASE=old93`.

## Update 10.1: fixes
- Scratch card revealed by a level switch (9.3+): the DOM patch copied attributes from the fresh markup, which has no
  canvas width/height, so the live canvas was resized — and a resized canvas is wiped. `patchNode` now leaves a canvas
  untouched. Test: `/tmp/pw/scr101.mjs` (foil coverage after Basic/Fancy/Classic on a treat and a recipe).
- Fit: audited every recipe, treat and main screen at 402 px and 360 px (Display Zoom), Bigger text on/off
  (`/tmp/pw/clip10.mjs`, `clip10w.mjs` with W=360). Only narrow screens clipped (header title, Acura bone words).
  Root fixes in the "update 10.1: fit" CSS block. Title block: line-height 1.06, contained drop cap.
- The full cookbook shipped in Update 10.2.

## Update 10.2: our cookbook (book mode)
- Entered only from Home's gold book icon (top left, `.bookbtn`, the gear's line style). Routes `#/book/<part>`:
  `cover` (the welcome design, no name picker), `title` (the splash: OUR KITCHEN, Corey ♥ Faith), `about`,
  `contents` (tappable, page numbers), `c/<slug>` chapter plates in Home's tile order (`bookCats()`), `r/<id>` and
  `t/<id>` printed read-only recipe/treat pages (Classic, as written), `c/acura` last, `back`. `bookPages()` is the
  one continuous flip order (turnList uses it for any `#/book/` hash), page numbers come from it.
- `body.book` (set by the router for `#/book` only) hides the header and tab bar; the page sits on the navy cover board
  with a curved fore-edge, page thickness (hard-edged stacked shadows), a deeper spine gutter and full-page grain;
  `#bookX` is the one small close control. The app never opens inside the book: a cold start on `#/book…` goes Home.
- In-app recipe swipes are recipes only, stopping at the ends of a category (`chapterList`). The in-app category page
  keeps its chapter header but is not a swipe page.
- Test: `/tmp/pw/book10.mjs` (opens from the icon, chrome hidden, 40 pages cover → back by finger swipes, close,
  in-app swipe stops at the category end, scratch foil intact, never the launch state).

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
| 6.1 | see `git log` | Shell back inside the viewport (tabs fully tappable), bigger tab icons, edge-to-edge welcome card |
| 7 | see `git log` | Week plan, staples, price memory, prep ahead, swaps, notes, places, mystery meal, thank-you jar, date-in menu, keepsake, secret rating, Acura search/share/photo wall, weather/Friday/season/surprise ideas, ready filter, badges |
| 8 | see `git log` | Solid status bar for new installs (no strip; old installs keep 6.1), backup audit: Export/Restore complete and byte-identical, Restore from the welcome screen |
| 8.1 | see `git log` | Splash wordmark no longer jolts small→big on launch with Bigger text on |
| 8.2 | see `git log` | Self-update never reloads in front of you (it was the remaining open/return jolt); first frame verified in WebKit |
| 9 | see `git log` | Basic/Classic/Fancy levels on every recipe and treat, spice backups, make it with what I've got, why notes, Fancy night, level notes, cost by level, page-turn swipe + dice, bookmark ribbon, cooked stamp, louder timer with sounds, paw of approval, our dish, seasonal accent, quiet badges, recipe audit, Acura status bar brown |
| 9.1 | see `git log` | Past updates in What's new (one patch-notes list), first-time scratch card with a fun fact, dice / Home season mark / quiet badges removed as duplicates |
| 9.2 | see `git log` | Pantry Lots / Have / Low / Out buttons work again (duplicate function name from Update 9); Acura status bar from the html background |
| 9.3 | see `git log` | Edit recipe + Delete meal (hold menu), no launch flash, steady photo on level switch |
| 10.2 | see `git log` | Our cookbook: full-screen book from Home's book icon, cover to back page |
| 10.1 | see `git log` | Scratch card no longer revealed by level switch; narrow-screen fit fixes |
| 10 | see `git log` | Cookbook look: paper, chapter pages, ornaments, drop caps, plate-framed photos, shaded page curl |


## Update 10.3 — scrapbook cookbook (2026-11-16)
- Cover = the welcome screen (shares `#welcome .cover/.panel` CSS with `.bk-cover`; edge to edge via `#view.bk-cover-on`; grain + season layer hidden on it via `body.bkcover`).
- Scrolling: `bookScrollFit()` measures each book page after render (and on resize); a page that fits gets `#view.noscroll` (overflow-y hidden + overscroll-behavior none). Full-page designs (cover, title, dedication, back) are `.bk.bk-fixed` (height 100%), and `body.book #view` has no bottom padding, so they are exactly one page and centre perfectly.
- The book always uses its own cream paper palette (`body.book` overrides the theme vars), whatever the app theme; the router no longer adds `body.acura` inside the book (`acuraLook`).
- Per-chapter accents: `BOOK_ACC` / `bookAcc()` → `--acc` on `.bk[data-ch]` (divider wash, `.bk-tab` page tab, ornaments, ingredient card top). Acura = browns + paw trail + paw sticker.
- Scrapbook pieces (all in margins / own blocks, never over text): `.bk-plate` taped tilted photos (`tl`/`tr` by page parity, occasional caption), `.bk-card` recipe-card ingredients, `.bk-dots`, `.bk-stamp`, `.bk-index` contents card, `.bk-scrap`, chapter `.bk-sticker` (the category tile).
- New pages: `#/book/dedication` (after title; shows the anniversary if set) and `#/book/together` (before back; tally of cooked dinners). `bookMargin(id)` = read-only handwritten notes from `cooked`, `ratings`, `favBy`, `loveNotes`, `notes`/`noteMeta` (Corey navy ink, Faith plum). The book never writes saved data.
- Font: `fonts/Caveat.woff2` (OFL, latin) for handwriting, precached automatically.

## Update 10.4 — book bookmarks (2026-11-16)
- New additive key `state.bookBookmarks` (page key like `r/chicken-01`, `c/seafood`, `about` -> ts); added to migrate's object-key list, so old saves and backups get `{}`; exported/restored with the whole state.
- `.bk-rib#bkRib` ribbon at each book page's top edge (right:62px, clear of ×); tap toggles in place (class only, no re-render); it's in `NO_TURN` so it never starts a page turn. Cover/title show a `.pull` ribbon (when bookmarks exist) with the page number that jumps to the newest bookmark.
- Contents card: "Bookmarked" list (`bkMarks()`, newest first, max 8) + `.mini-rib` on chapter rows holding a bookmark. Separate from the app's Home ribbon (`state.bookmark`).

## Update 10.5 — Recipes tab polish (2026-11-16)
- Weather now rides on the greeting line (`.greet` + inline `#wxLine`, one line with ellipsis; `wxLine()` returns ' · 1°C cloudy' or '' so the line never moves when it arrives). The old separate weather row and its mood words are gone from Home (weather dinner nudges unchanged).
- Tonight's pick: photo fades in (`img.in`), swipe the card left (touch, horizontal only, `touch-action: pan-y`; `.pick-card` in NO_TURN) = the existing Not tonight; Let's make it opens the recipe straight away with a ✓ toast.
- Pick + quick buttons are a 2×2 grid of equal 44px buttons, one-line labels; fine gold dividers between Home sections (`#homeBody>.sec+.sec::before`).
- Book: the welcome-style cover page is removed; `#/book/title` is the front cover and page 1 (old `#/book/cover` links redirect). The latest-bookmark pull ribbon lives on the title page. Page numbers come from `bookPages()`, bookmarks are keyed by page name, so nothing else changed.

## Update 10.6 — sweep (2026-11-16)
- Sweep: all tabs + Settings + a recipe at 360/393/430pt, Bigger text on/off, WebKit: no JS errors, no horizontal overflow, saved data unchanged (only updatedAt/recent from viewing).
- Tabular numerals for `.amt`, pills and buttons in the main view.

## TODO (after the Sunday usage reset)
- Pantry: bigger tap targets on the Lots/Have/Low/Out segments; empty-state line when a filter shows nothing.
- Grocery: subtle progress line (x of y ticked) on the trip card; tidy the "Swipe right to tick" hint.
- Budget: align the month's cooked list amounts in one column; gentle empty month state.
- Us: even spacing on the stat tiles; date-night card tap target.
- Acura: Treat jar empty state copy and spacing; chip row alignment.
- Frame-time re-test of book page turns and Home swipe on a real iPhone; check "Your page" sits right under the new greeting.

## Update 11.0 — Tonight's pick swipe (2026-11-22)
- Causes: (1) Home's pull-to-refresh started on any downward drift, so a sideways swipe that drifted down pulled the page down and could refresh Home mid-swipe (navy flash + new pick); (2) Not tonight redrew all of Home, and render() kept the tapped button anchored, so a title wrapping differently scrolled the page; (3) the new photo loaded after the swap, showing the navy card (plus a duplicate 10.5 fade on top of the global `img.ld` fade).
- Fixes: pull-to-refresh only engages for clearly vertical pulls; the pick changes in place (`advance()` in viewHome: slide out, swap text + a pre-decoded `<img>` element, slide in; next pick chosen and decoded ahead); swipe locks direction on the first 8px and preventDefaults only once horizontal; the 10.5 `.in` fade removed (the global `.ld` fade covers it).
- Test kit now lives in /workspace/pwtest (playwright + webkit; `a0b.mjs` swipe repro, `pres.mjs` saved-data + real Restore round trip). Local server: `python3 -m http.server 8770` in /workspace/serve (our-kitchen -> app symlink).

## Update 11.1 — Phase A rundown (2026-11-22)
- Full passes with /workspace/pwtest/crawl.mjs (every route incl. book, every view/topbar button and one level into each sheet: ~232 taps per config) at 360/393/430pt × Bigger text on/off × light/dark, plus gest.mjs (pull-to-refresh, tab switches frame by frame, in-app recipe swipe both ways, edge back, grocery swipe-tick, the whole book 41 pages by swipe) and a0b.mjs (pick swipe). Final pass: no JS/console errors, no overflow, no empty/faded frames, no scroll jumps.
- Fixed: the pick card could widen the page mid-slide (`.sec.pick{overflow-x:clip}`); two-up button rows wrapped at 360 + Bigger text (nowrap + smaller font in html.big); Budget header actions wrapped ("+ Add", nowrap).
- Polish (TODO list): Pantry stock buttons 40px tall, per-filter empty states; Grocery trip card "x of y in the cart" bar, shorter swipe hint; Budget friendlier empty month. Us/Acura reviewed: nothing worth changing (stat tiles and date-night row already even/full-width; treat jar empty state already reads well).
- Read-aloud: `bestVoice()` ranks English voices (Siri > Premium > Enhanced > neural/natural > known good iOS names; en-CA > en-US > en-GB > en-AU; novelty voices excluded), re-ranked on `voiceschanged`; rate unchanged (0.98). Note iOS doesn't expose Siri voices to web pages; Premium/Enhanced only if downloaded in Settings › Accessibility › Spoken Content › Voices.

## Update 11.2 — Phase B recipe triple-check (2026-11-23)
- Every recipe (21) and all 6 Acura treats read line by line: amounts at Basic/Classic/Fancy, step order, plan-ahead, times, temps, doneness, wording, food rules, dog safety.
- `tools/audit_recipes.py` = objective checker (food-rule words, °C/°F pairs, item↔step uses, level refs, cost sums, safe temps, timers vs prep+cook, missing fields, Acura unsafe words). Its 20 remaining findings are reviewed false positives (dried-herb context, Acura warning texts, the tacos "not cayenne" note).
- Content fixes: lasagna "hot sauce" → "warm sauce", rest step trimmed; teriyaki swap temp; doneness added (potato soup, broccoli cheddar, mac and cheese); chicken parm sheet-pan wording; creamy garlic duplicate salt note removed; orange chicken juice wording; potato soup trims; broccoli Fancy °F added; beef stew cook 165 min; alfredo cutlets 4–5 min a side + Fancy toast butter listed; meatball panade wording; salmon to 70°C (158°F) per Health Canada.
- Scaler (`fmtQty`): whole eggs/cloves/slices/strips; tsp→tbsp→cup on kitchen fractions; ⅛ cup → 2 tbsp, <1 tbsp → tsp; ≥1000 g/ml → kg/L; plural follows the number shown ("1 clove", "1 can"). Checked with pwtest/scale2.mjs: all 21 recipes × servings 1/3/7/10 × Basic/Classic/Fancy.
- `nameFor(name, amt)`: a bare count of 1 (or a lone fraction) reads singular in the list and the step 'uses' line. Items whose note describes the full recipe (`~550 g`, `1 box`, `juice of ½`, …) carry `"asWritten": true` in the recipe file; when servings differ from the base the note gets " (as written)". 28 items flagged (recipe files only, no saved data).

## Update 12.0 — layout refresh (2026-11-23)
- Home order is now: greeting + search → Tonight's pick → idea tiles → nudges / In the fridge → **Categories** (tiles untouched, just moved up) → Favourites → Recently cooked → Recipe of the week → Recently viewed → Contents (now `<details class="sec toc-fold">`, closed by default; patchNode keeps it open across in-place redraws) → Guides.
- Idea shortcuts: `.quick` is one row of three `.qt` index-card tiles (Spin the wheel, What can we make?, More ideas). The old "surprise me · mood · fridge clear · in season" caption lives inside the More ideas sheet only.
- Scrapbook touch (main app, much lighter than the book): `.lead.hand` (Caveat) for the page notes under tab titles (10 pages), the "…'s pick tonight" line in Caveat, washi tape (`.pick-card .im::before/::after`, `.wkcard .im::after`). Palette, fonts and category tiles unchanged.
- Before/after previews: app_preview/u120-before-*.png, u120-after-*.png, u120-before-home-strip.png, u120-after-home-strip2.png, u120-after-home-dark.png.

## Update 12.1 — quick wins (2026-11-23)
- Typo-tolerant search: `fuzzyHas(hay, w)` + `editWithin(a, b, k)` (bounded Levenshtein). Exact substring first; from 5 letters one typo, from 8 letters two, against whole words or word starts. Used by the plain search and the "a + b" ingredient search.
- Tab tap animation: `tabpop` spring on the active tab icon + `tabbar` draw-in of the gold bar (off under reduced motion). Runs only when the tab becomes active.
- Already there and re-verified (pwtest/t121.mjs): per-tab scroll memory (`scrollMem` restored on `dir === 'tab'`), tap the active tab → smooth scroll to top.
- Photos: all 63 are already WebP. AVIF was measured at only 18% smaller (2.77 → 2.27 MB) and would mean a second copy of every photo in the offline cache, so we stayed on WebP.
- iPhone 16 Pro (402 × 874) added to the crawl configs.

## Update 12.2 — grocery: store, prices, tax, in-store (2026-11-23)
- New saved fields (additive only): `settings.store` (default 'nofrills') and `storePrices` (storeId → pantryKey → { price, date, name, src }). `migrate()` fills both; existing `prices` / `priceLog` untouched.
- `STORES`, `curStore()`, `storeName()`. The kicker reads "<Store> run". `#gStore` select in `.storebar` with the Flyer chip (`flippLink(store)` = `https://flipp.com/action?command=query&text=…&type=search`; flipp.com's AASA lists `/action`, so on iPhone it opens the Flipp app if installed, otherwise flipp.com) and the Receipt chip (old Scan receipt button moved here).
- `priceOf(key)`: this store's remembered price → latest receipt price (any store) → typical No Frills pack (recipes/prices.json). Receipt save also calls `rememberStorePrice(key, price, name, 'receipt')`. The item sheet entry saves 'entry' and logs the price.
- HST: `TAXABLE` keyword guess (paper/cleaning/personal care/candy/chips/pop/pet/etc.) × 13%, only on priced items; unpriced taxable items are counted in words. Always labelled "an estimate".
- In-store mode (`ui.instore`, session only): `.instore` big rows and ticks, its own wake lock `storeLock` (re-requested on visibility, released on Done or when leaving #/grocery). `forgotCard()` = pantry low/out + staples not already on the list (ticked or not), max 10, tap to add.
- Hold a row (`longPress`, 520 ms, cancels on 8 px move; contextmenu on desktop) → `openGroceryItem`: recipes that use it (pantry key or a loose singular-name match), price at this store + other stores, Find on Flipp.
- Scrapbook touch on Grocery: handwritten lead, a tape strip on the trip card, store tools grouped in one bar.
