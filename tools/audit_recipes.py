#!/usr/bin/env python3
"""Recipe triple-check (update 11.2): objective checks over every recipe + Acura's treats.
Prints one line per finding. Run: python3 tools/audit_recipes.py"""
import json, os, re, glob
ROOT = os.path.join(os.path.dirname(__file__), "..", "recipes")
F = []
def f(rid, msg): F.append(f"{rid}: {msg}")
RULES = [(r"mushroom", "mushroom"), (r"mustard", "mustard"), (r"\bolives?\b(?!\s+oil)", "olives"),
         (r"cayenne|chil[il]i (flakes|powder)|red pepper flakes|jalape|sriracha|hot sauce|chipotle|habanero|gochujang|sambal|crushed red", "spicy"),
         (r"fresh (parsley|basil|cilantro|thyme|rosemary|dill|chives|oregano|sage|mint|coriander)", "fresh herb"),
         (r"\b(parsley|basil|cilantro|thyme|rosemary|dill|chives|oregano|sage|coriander leaves)\b(?![^.]{0,12}dried)", "herb-not-said-dried?")]
def c2f(c): return c * 9 / 5 + 32
def temps(text):
    out = []
    for m in re.finditer(r"(\d{2,3})\s*°C\s*\((\d{2,3})\s*°F\)", text):
        c, fv = int(m.group(1)), int(m.group(2))
        if abs(c2f(c) - fv) > 10: out.append(f"{c}°C≠{fv}°F")
    return out
SAFE = {"chicken": 74, "turkey": 74, "beef": None, "pork": 71, "salmon": 70, "fish": 70, "ground": 71}
def tier(t): return "$" if t < 20 else ("$$" if t <= 30 else "$$$")
def walk(o, acc):
    if isinstance(o, str): acc.append(o)
    elif isinstance(o, dict): [walk(v, acc) for k, v in o.items() if k not in ("image", "imageAlt", "source")]
    elif isinstance(o, list): [walk(v, acc) for v in o]
    return acc
for path in sorted(glob.glob(os.path.join(ROOT, "*", "*.json"))):
    if path.endswith("categories.json") or "/acura/" in path: continue
    rid = os.path.basename(os.path.dirname(path)) + "/" + os.path.basename(path)[:-5]
    r = json.load(open(path))
    txt = " ".join(walk(r, []))
    low = txt.lower()
    for rx, name in RULES:
        for m in re.finditer(rx, low):
            ctx = low[max(0, m.start() - 30): m.end() + 30]
            if name == "herb-not-said-dried?" and re.search(r"dried|italian seasoning|herbes", ctx): continue
            f(rid, f"rule {name}: …{ctx}…")
    for t in temps(txt): f(rid, "temp pair " + t)
    # items ↔ steps
    items = {f"{gi}-{ii}": it for gi, g in enumerate(r["groups"]) for ii, it in enumerate(g["items"])}
    used = set()
    for si, st in enumerate(r["steps"]):
        for u in [x.split("=")[0] for x in st.get("uses", [])]:
            if u not in items: f(rid, f"step {si} uses missing item {u}")
            used.add(u)
    for k, it in items.items():
        if k not in used and not it.get("optional"): f(rid, f"item {k} ({it['name']}) not used by any step")
    for k, it in items.items():
        if it.get("qty") in (None, 0) and it.get("unit") not in ("to taste", None, ""): f(rid, f"item {k} has no qty")
    # levels
    lv = r.get("levels") or {}
    for d in (lv.get("basic") or {}).get("drop", []):
        if d not in items: f(rid, f"basic drops missing item {d}")
    for name in ("basic", "fancy"):
        for k in ((lv.get(name) or {}).get("stepNotes") or {}):
            if int(k) >= len(r["steps"]): f(rid, f"{name} stepNote for missing step {k}")
    # cost
    c = r.get("cost") or {}
    if c.get("breakdown"):
        s = round(sum(x[1] for x in c["breakdown"]), 2)
        if abs(s - c["total"]) > 0.6: f(rid, f"cost total {c['total']} vs breakdown sum {s}")
    tg = (r.get("tags") or {}).get("price") or r.get("price")
    # safe temps
    dn = (r.get("doneness") or "").lower()
    if re.search(r"chicken|turkey", low) and "74" not in txt and "165" not in txt: f(rid, "poultry without 74°C/165°F")
    if re.search(r"ground (beef|turkey|pork)", low) and not re.search(r"71\s*°C|74\s*°C", txt): f(rid, "ground meat without 71°C (160°F)")
    if "salmon" in low and "70" not in txt and "63" not in txt: f(rid, "fish without a safe temp")
    if "pork" in low and "pork" in r["title"].lower() and "71" not in txt and "63" not in txt: f(rid, "pork without a safe temp")
    # times
    tim = sum(st.get("timer", 0) for st in r["steps"])
    if tim > r["prep"] + r["cook"] + 15: f(rid, f"step timers {tim} min > prep+cook {r['prep'] + r['cook']}")
    for k in ("prepAhead", "reheat", "doneness", "why", "funFact"):
        if not r.get(k): f(rid, f"missing {k}")
# Acura
A = json.load(open(os.path.join(ROOT, "acura", "treats.json")))
BAD = r"xylitol|grape|raisin|onion|garlic|chocolate|cocoa|macadamia|avocado|nutmeg|salt\b|sugar|honey|cinnamon|caffeine|alcohol|leek|chive"
for t in A["treats"]:
    rid = "acura/" + t["id"]; txt = " ".join(walk(t, [])).lower()
    for m in re.finditer(BAD, txt):
        ctx = txt[max(0, m.start() - 40): m.end() + 30]
        if re.search(r"no |without|never|not |free|unsalted|avoid|xylitol-free|no-salt|check", ctx): continue
        f(rid, f"dog-safety word: …{ctx}…")
    for tt in temps(" ".join(walk(t, []))): f(rid, "temp pair " + tt)
    items = {f"{gi}-{ii}" for gi, g in enumerate(t["groups"]) for ii, it in enumerate(g["items"])}
    used = {u.split("=")[0] for st in t["steps"] for u in st.get("uses", [])}
    for u in used - items: f(rid, f"step uses missing {u}")
    for d in ((t.get("levels") or {}).get("basic") or {}).get("drop", []):
        if d not in items: f(rid, f"basic drops missing {d}")
print("\n".join(F) or "no findings"); print(len(F), "findings")
