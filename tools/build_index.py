#!/usr/bin/env python3
"""Rebuild recipes/index.json for the Our Kitchen app.

Recipes live one-per-file in category folders, numbered *within* the category:
    recipes/<category-slug>/NN-recipe-slug.json      e.g. recipes/chicken/01-honey-garlic-chicken.json
To add a recipe: drop a new file in its category folder with the next number
(e.g. recipes/chicken/02-lemon-chicken.json), then run:
    python3 tools/build_index.py
Numbers in other categories never change. The script also checks the dislike
list (mushrooms, mustard, olives), works out the $ / $$ / $$$ tag and time
bucket, and bumps the service-worker cache version so phones pick up changes.
"""
import hashlib, json, os, re, sys

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES = os.path.join(APP, "recipes")
BANNED = [(re.compile(r"mushroom", re.I), "mushroom"),
          (re.compile(r"mustard", re.I), "mustard"),
          (re.compile(r"\bolives?\b(?!\s+oil)", re.I), "olives")]
REQUIRED = ["title", "servings", "prep", "cook", "cost", "groups", "steps"]
# files the service worker should precache (relative to app/)
SKIP_DIRS = {"tools", ".git", "node_modules", "vendor", "launch"}  # vendor/ (receipt reader) is cached on first use; icons/launch/ is only read by iOS when the icon is added
SKIP_FILES = {"sw.js", ".DS_Store", "README.md", "PROJECT_NOTES.md", "CNAME", ".nojekyll"}


def price_tier(total):
    return "$" if total < 20 else ("$$" if total <= 30 else "$$$")


def time_bucket(mins):
    return "under-30" if mins <= 30 else ("30-45" if mins <= 45 else "up-to-60")


def main():
    cats = json.load(open(os.path.join(RECIPES, "categories.json"), encoding="utf-8"))["categories"]
    known = {c["slug"] for c in cats}
    out, problems = [], []
    for cat in cats:
        folder = os.path.join(RECIPES, cat["slug"])
        if not os.path.isdir(folder):
            continue
        seen = set()
        for fn in sorted(os.listdir(folder)):
            if not fn.endswith(".json"):
                continue
            m = re.match(r"^(\d+)-([a-z0-9-]+)\.json$", fn)
            if not m:
                problems.append(f"{cat['slug']}/{fn}: name must look like 03-my-recipe.json")
                continue
            num = int(m.group(1))
            if num in seen:
                problems.append(f"{cat['slug']}/{fn}: duplicate number {num:02d}")
            seen.add(num)
            path = os.path.join(folder, fn)
            raw = open(path, encoding="utf-8").read()
            r = json.loads(raw)
            for k in REQUIRED:
                if k not in r:
                    problems.append(f"{cat['slug']}/{fn}: missing '{k}'")
            # Update 9 rule: every recipe ships all three levels (Classic = as written) and why-it-matters notes
            lv = r.get("levels") or {}
            if not (lv.get("basic", {}).get("note") and lv.get("fancy", {}).get("note") and lv["fancy"].get("plating") and r.get("why")):
                problems.append(f"{cat['slug']}/{fn}: missing Update 9 levels (basic, fancy + plating) or why notes")
            if not r.get("funFact"):
                problems.append(f"{cat['slug']}/{fn}: missing funFact (Update 9.1 first-time scratch card)")
            for rx, word in BANNED:
                if rx.search(raw):
                    problems.append(f"{cat['slug']}/{fn}: contains '{word}' (dislike list!)")
            total = r.get("prep", 0) + r.get("cook", 0)
            cost = r.get("cost", {}).get("total", 0)
            pantry, names = [], []
            for g in r.get("groups", []):
                for it in g.get("items", []):
                    names.append(it.get("name", ""))
                    p = it.get("pantry")
                    if p and p not in pantry:
                        pantry.append(p)
            tags = dict(r.get("tags", {}))
            tags["price"] = [price_tier(cost)]
            tags["time"] = [time_bucket(total)]
            out.append({
                "id": f"{cat['slug']}-{num:02d}",
                "category": cat["slug"],
                "num": num,
                "file": f"recipes/{cat['slug']}/{fn}",
                "title": r.get("title"),
                "subtitle": r.get("subtitle", ""),
                "image": r.get("image"),
                "prep": r.get("prep"), "cook": r.get("cook"), "total": total,
                "servings": r.get("servings", 4),
                "cost": cost, "price": price_tier(cost),
                "tags": tags,
                "ingredients": names,
                "pantry": pantry,
                "fancyNight": bool(r.get("fancyNight")),
            })
    for d in os.listdir(RECIPES):
        if os.path.isdir(os.path.join(RECIPES, d)) and d not in known and d != "acura":  # Acura's dog treats live apart from the dinner book
            problems.append(f"folder recipes/{d} is not in categories.json")

    # Acura's treats follow the same Update 9 rule (dog-safe ingredients at every level)
    for t in json.load(open(os.path.join(RECIPES, "acura", "treats.json"), encoding="utf-8"))["treats"]:
        lv = t.get("levels") or {}
        if not (lv.get("basic", {}).get("note") and lv.get("fancy", {}).get("note") and t.get("levelCost") and t.get("why")):
            problems.append(f"acura/{t['id']}: missing Update 9 levels, levelCost or why notes")
        if not t.get("funFact"):
            problems.append(f"acura/{t['id']}: missing funFact (a dog-nutrition fact for the scratch card)")

    # patch notes (Update 9.1): ONE list in js/app.js, newest first; every update adds an entry at the top
    m = re.search(r"/\* UPDATES:BEGIN \*/(.*?)/\* UPDATES:END \*/", open(os.path.join(APP, "js", "app.js"), encoding="utf-8").read(), re.S)
    try:
        updates = json.loads(m.group(1)) if m else []
    except ValueError as e:
        updates = []; problems.append(f"js/app.js UPDATES is not valid JSON: {e}")
    if not updates:
        problems.append("js/app.js: UPDATES (patch notes) missing or empty")
    ids = [u.get("id") for u in updates]
    if len(set(ids)) != len(ids):
        problems.append("js/app.js UPDATES: duplicate id")
    for u in updates:
        if not (u.get("name") and u.get("id") and re.fullmatch(r"\d{4}-\d{2}-\d{2}", u.get("date", "")) and u.get("intro") and u.get("notes")):
            problems.append(f"js/app.js UPDATES: entry {u.get('name')!r} needs name, id, date (YYYY-MM-DD), intro and notes")
    nums = [tuple(int(x) for x in re.findall(r"\d+", u.get("name", ""))) for u in updates]
    if nums != sorted(nums, reverse=True):
        problems.append("js/app.js UPDATES: entries must be newest first (add the new update at the top)")

    index = {"generated": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
             "count": len(out), "categories": cats, "recipes": out}
    json.dump(index, open(os.path.join(RECIPES, "index.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    # service worker precache list + version
    files = []
    for root, dirs, fns in os.walk(APP):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for f in sorted(fns):
            if f in SKIP_FILES or f.endswith((".zip", ".py", ".mjs")):
                continue
            files.append(os.path.relpath(os.path.join(root, f), APP).replace(os.sep, "/"))
    h = hashlib.sha1()
    for f in files:
        h.update(f.encode()); h.update(open(os.path.join(APP, f), "rb").read())
    version = h.hexdigest()[:10]
    sw_path = os.path.join(APP, "sw.js")
    sw = open(sw_path, encoding="utf-8").read()
    sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = '{version}';", sw)
    listing = ",\n  ".join(json.dumps("./" + f) for f in ["", *files] if f != "index.json")
    sw = re.sub(r"/\*PRECACHE\*/\[.*?\]/\*END\*/", "/*PRECACHE*/[\n  " + listing.replace("\"./\"", "\"./\"") + "\n]/*END*/", sw, flags=re.S)
    open(sw_path, "w", encoding="utf-8").write(sw)

    print(f"index.json: {len(out)} recipes in {len({r['category'] for r in out})} categories; sw version {version}; {len(files)} files precached")
    for r in out:
        print(f"  {r['id']:<24} {r['price']:<4} {r['total']:>3} min  ${r['cost']:<5} {r['title']}")
    if problems:
        print("\nPROBLEMS:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)


if __name__ == "__main__":
    main()
