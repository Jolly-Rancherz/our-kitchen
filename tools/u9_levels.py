# Update 9: Basic / Classic / Fancy levels, why-it-matters notes and Fancy night flags for every recipe.
# Classic = the recipe as written (never changed here). Each level only lists what differs:
#   drop: item refs ("group-item") left out · swap: {ref: fields to replace} · add: [{group, items}]
#   stepNotes: {step index: short note shown under that step} · addSteps: [{title, text}] appended
#   costDrop: breakdown keys/names removed · costAdd: [[label, price, key]] added · plating (fancy): tips
# Food rules: no mushrooms, mustard or olives; few peppers; not spicy; herbs dried only; No Frills prices.
import json, glob, os

def P(name, cat): return {"name": name, "cat": cat}
def I(qty, unit, name, pname, cat, note=None, **kw):
    d = {"qty": qty, "unit": unit, "name": name, "pantry": P(pname, cat)}
    if note: d["note"] = note
    d.update(kw); return d

L = {}

L["beef-turkey-01"] = dict(fancyNight=False,
  basic=dict(note="Just beef, seasoning and shells: chili powder, garlic powder, salt and pepper do the heavy lifting.",
    drop=["0-1", "0-4", "0-5", "1-4", "2-1", "2-4", "2-6"],
    stepNotes={"0": "Basic: chili powder, paprika, garlic powder, salt and pepper only.", "2": "Basic: no tomato paste — simmer with the water until it clings.", "3": "Basic: hard shells only.", "4": "Basic: cheese, lettuce and sour cream."},
    costDrop=["tortillas", "tomatoes"], costAdd=[]),
  fancy=dict(note="Crispy cheese-crusted shells, a quick lime-free crema and pickled red onion — taco-truck pretty, still mild.",
    add=[{"group": "Fancy finish", "items": [
      I(0.5, None, "red onion", "Red onions", "produce", "thinly sliced, quick-pickled"),
      I(0.5, "cup", "apple cider vinegar", "Apple cider vinegar", "sauces", "for the pickle"),
      I(1, "tsp", "granulated sugar", "Granulated sugar", "baking", "for the pickle"),
      I(0.25, "cup", "mayonnaise", "Mayonnaise", "sauces", "stirred into the sour cream for crema"),
      I(1, "cup", "frozen corn", "Frozen corn", "frozen", "charred in a dry pan")]}],
    stepNotes={"0": "Fancy: before you start, cover the onion with the vinegar, sugar and a pinch of salt — it turns pink and tangy in 20 minutes."},
    addSteps=[{"title": "Fancy finish", "text": "Char the corn in a dry hot skillet 4–5 minutes. Stir the mayonnaise into the sour cream with a pinch of garlic powder for a smooth crema. Sprinkle a little cheddar in the hot skillet, set a tortilla on top for 1 minute until the cheese crisps, then fill. Top with charred corn, pickled onion and a drizzle of crema."}],
    costAdd=[["Red onion + vinegar (pickle)", 1.2, "red-onions"], ["Frozen corn, 1 cup", 1.0, "frozen-corn"], ["Mayonnaise, ¼ cup", 0.6, "mayonnaise"]],
    plating=["Stand the tacos in a row, tight together, so they hold each other up.", "Crema in a squeeze bag (a zip bag with the corner snipped) for neat zig-zags.", "Pink onions on top last — the colour is the whole show."]),
  why={"0-0": "Chili powder is the taco flavour. Skip it and it tastes like plain seasoned beef.", "0-8": "Cornstarch makes the sauce cling to the beef instead of pooling in the shell.", "1-4": "Tomato paste adds body and a deep, savoury colour. Without it the beef is a bit drier.", "0-6": "Salt wakes up every spice — taco beef tastes flat without enough of it."})

L["beef-turkey-03"] = dict(fancyNight=False,
  basic=dict(note="Beef, onion and gravy under plain buttery mash — no cheese crust, fewer jars to open.",
    drop=["0-4", "0-5", "1-3", "1-8", "1-12"],
    stepNotes={"2": "Basic: no carrots.", "3": "Basic: skip the Worcestershire and corn — add an extra pinch of salt.", "4": "Basic: mash with butter, milk and salt.", "5": "Basic: no cheese on top — brush with a little melted butter for colour."},
    costDrop=["cheddar", "frozen corn"], costAdd=[]),
  fancy=dict(note="Golden piped-style mash with aged cheddar and a crisp Parmesan crust, peas instead of corn and a richer gravy.",
    swap={"1-12": {"name": "frozen peas", "pantry": P("Frozen peas", "frozen")}},
    add=[{"group": "Fancy finish", "items": [
      I(1, None, "egg yolk", "Eggs", "dairy", "beaten into the mash for a golden crust"),
      I(0.33, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "over the top"),
      I(1, "tbsp", "butter", "Butter", "dairy", "melted, for the gravy")]}],
    stepNotes={"3": "Fancy: stir a tablespoon of butter into the gravy at the end for shine.", "4": "Fancy: beat the egg yolk into the mash last."},
    addSteps=[{"title": "Fancy crust", "text": "Pipe or swirl the mash in tight peaks with the back of a spoon, scatter the Parmesan over the cheddar and bake as written. Broil 1–2 minutes at the end until the peaks are deep golden. Rest 10 minutes so it slices cleanly."}],
    costAdd=[["Parmesan, ⅓ cup", 1.0, "parmesan-grated"], ["Frozen peas (swap for corn)", 0.2, "frozen-peas"]],
    plating=["Rest 10 minutes, then cut a clean square with a hot wet knife.", "Serve in a shallow bowl so the gravy pools at the side.", "A crack of black pepper over the golden peaks."]),
  why={"1-5": "Tomato paste deepens the gravy colour and flavour. Skip it and the filling is paler and milder.", "1-6": "Flour thickens the gravy. Without it the filling is soupy under the mash.", "1-8": "Worcestershire adds the savoury, slightly tangy depth. Skip it and add a little extra salt.", "0-2": "Butter makes the mash silky. Less butter = a stiffer, drier topping."})

L["beef-turkey-07"] = dict(fancyNight=False,
  basic=dict(note="Beef, broccoli and a simple soy–sugar–garlic sauce over rice.",
    drop=["0-3", "1-0", "1-4", "1-6"],
    swap={"1-1": {"qty": 0.33, "unit": "cup", "note": "replaces the oyster sauce too"}},
    stepNotes={"1": "Basic: soy sauce and cornstarch only (no baking soda) — slice the beef extra thin.", "2": "Basic: soy sauce, brown sugar, water, garlic and cornstarch."},
    costDrop=["oyster"], costAdd=[["Extra soy sauce", 0.3, "soy-sauce"]]),
  fancy=dict(note="Glossy restaurant-style: velveted beef, a touch of honey and sesame, toasted sesame seeds and crisp-edged broccoli.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "tbsp", "honey", "Honey", "sauces", "in the sauce"),
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, "tsp", "rice vinegar", "Rice vinegar", "sauces", "brightens the sauce")]}],
    stepNotes={"2": "Fancy: whisk the honey and rice vinegar into the sauce.", "3": "Fancy: let the broccoli sit untouched 1 minute before adding the water so the edges char."},
    addSteps=[{"title": "Fancy finish", "text": "Pack the rice into a small bowl and turn it out as a neat dome. Spoon the beef and broccoli alongside, drizzle extra sauce and sprinkle with sesame seeds."}],
    costAdd=[["Honey, sesame seeds, rice vinegar", 1.0, "sesame-seeds"]],
    plating=["Dome the rice: pack a small bowl and flip it onto the plate.", "Broccoli florets pointing out, beef piled against the rice.", "Sesame seeds over everything at the very end."]),
  why={"0-3": "Baking soda tenderises the beef like takeout. Without it, slice thinner and don't overcook.", "1-0": "Oyster sauce gives the deep, glossy savoury base. Skip it and use a little extra soy.", "1-7": "Cornstarch thickens the sauce so it coats instead of running off."})

L["chicken-01"] = dict(fancyNight=True,
  basic=dict(note="Crispy honey garlic chicken over plain rice with steamed broccoli.",
    drop=["0-4", "0-5", "1-4", "2-2", "2-3", "3-1", "3-2", "3-5", "3-6"],
    stepNotes={"0": "Basic: plain rice — rice, water and salt, no garlic butter.", "1": "Basic: steam the broccoli 4–5 minutes instead of roasting.", "2": "Basic: salt, pepper, garlic powder, cornstarch and oil.", "4": "Basic: skip the vinegar."},
    costDrop=["parmesan"], costAdd=[]),
  fancy=dict(note="Extra-crispy double-fried chicken, a brown-butter honey glaze and Parmesan-crusted broccoli.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, "tbsp", "honey", "Honey", "sauces", "extra, to drizzle"),
      I(0.25, "cup", "panko breadcrumbs", "Panko breadcrumbs", "grains", "toasted, over the broccoli")]}],
    stepNotes={"3": "Fancy: after both batches, return all the chicken to the basket for 2 more minutes — extra crunch.", "4": "Fancy: let the butter foam and turn nutty brown before adding the honey and soy."},
    addSteps=[{"title": "Fancy finish", "text": "Toast the panko in a dry pan until golden and scatter it with the Parmesan over the broccoli. Plate the rice in a ring, chicken in the middle, drizzle with a thread of honey and finish with sesame seeds."}],
    costAdd=[["Sesame seeds, panko, extra honey", 1.3, "sesame-seeds"]],
    plating=["Rice in a ring, chicken piled in the centre.", "Drizzle honey from high up in a thin thread.", "Sesame seeds last, so they stay visible."]),
  why={"0-6": "Cornstarch is what makes the chicken crispy. Skip it and it browns but stays soft.", "1-5": "The cornstarch slurry thickens the glaze so it sticks to every piece.", "1-4": "A splash of vinegar balances the sweet honey. Without it the sauce is sweeter.", "3-6": "Parmesan crisps on the broccoli. Leave it off for a lighter side."})

L["chicken-02"] = dict(fancyNight=True,
  basic=dict(note="Simple breaded cutlets with jarred sauce and mozzarella over spaghetti.",
    drop=["1-3", "1-4", "1-5", "2-2", "3-3"],
    stepNotes={"1": "Basic: plain panko with the flour and egg — season the cutlets well instead.", "3": "Basic: marinara and mozzarella only.", "4": "Basic: toss the pasta with the warm sauce, no butter."},
    costDrop=["parmesan"], costAdd=[]),
  fancy=dict(note="Fresh-style mozzarella, Parmesan crust, a garlic butter spaghetti and a crisp golden edge.",
    swap={"2-1": {"name": "fresh mozzarella (ball), sliced", "qty": 1, "unit": None, "pantry": P("Fresh mozzarella", "dairy"), "note": "about 200 g"}},
    add=[{"group": "Fancy finish", "items": [
      I(3, "clove", "garlic", "Garlic", "produce", "for garlic butter spaghetti"),
      I(2, "tbsp", "butter", "Butter", "dairy", "extra, for the spaghetti"),
      I(0.25, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "extra, to finish")]}],
    stepNotes={"4": "Fancy: melt the extra butter with the garlic 1 minute before tossing in the pasta and sauce."},
    addSteps=[{"title": "Fancy finish", "text": "Twirl the spaghetti into a nest with tongs, lean the cutlet against it, and finish with Parmesan and a crack of black pepper."}],
    costAdd=[["Fresh mozzarella ball (instead of shredded)", 2.0, "fresh-mozzarella"], ["Extra Parmesan, butter, garlic", 1.5, "parmesan-grated"]],
    costDrop=["mozzarella"],
    plating=["Twirl the spaghetti into a tall nest with tongs in a ladle.", "Lean the cutlet against the nest, crispy edge up.", "Parmesan and black pepper last."]),
  why={"1-0": "Flour lets the egg stick so the crumb doesn't slide off.", "1-3": "Parmesan in the crumb adds savoury flavour and browns beautifully.", "1-6": "Enough oil fries the crumb golden; too little and it goes patchy."})

L["chicken-03"] = dict(fancyNight=True,
  basic=dict(note="Garlic Parmesan chicken in a simple milk-based sauce with plain mash.",
    drop=["0-4", "0-5", "1-6", "2-4", "3-0", "3-1", "3-2"],
    swap={"1-4": {"name": "whole milk", "pantry": P("Milk", "dairy"), "note": "keep it on low"}},
    stepNotes={"1": "Basic: salt, pepper and garlic powder only — no flour dusting.", "3": "Basic: skip the green beans (or use any frozen veg you have).", "4": "Basic: milk instead of cream — keep it on low so it doesn't split."},
    costDrop=["35%", "green beans"], costAdd=[["Whole milk, 1¼ cups", 0.7, "milk"]]),
  fancy=dict(note="Golden chicken in a silky garlic Parmesan cream with a little lemon zest, buttery whipped mash and blistered green beans.",
    add=[{"group": "Fancy finish", "items": [
      I(1, None, "lemon", "Lemons", "produce", "zest only, into the sauce"),
      I(2, "tbsp", "butter", "Butter", "dairy", "extra, whipped into the mash"),
      I(0.25, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "extra, to finish")]}],
    stepNotes={"3": "Fancy: sear the drained beans in a hot pan with the butter 2 minutes until blistered.", "4": "Fancy: finish the sauce with the lemon zest.", "5": "Fancy: whip the mash with a hand mixer and the extra butter until light."},
    costAdd=[["Lemon, extra butter + Parmesan", 2.0, "lemons"]],
    plating=["Swoosh the mash across the plate with the back of a spoon.", "Slice the chicken on the bias and fan it over the mash.", "Spoon sauce over the chicken, not the beans, and finish with Parmesan."]),
  why={"1-4": "Cream makes the sauce thick and stable. Milk works but thinner — keep it on low.", "1-5": "Parmesan thickens and seasons the sauce. Less cheese = a looser, milder sauce.", "0-5": "Flour helps the chicken brown and lightly thickens the sauce later."})

L["chicken-06"] = dict(fancyNight=False,
  basic=dict(note="Seared chicken with a 4-ingredient teriyaki over rice and steamed broccoli.",
    drop=["1-4", "1-6", "2-3", "2-4", "2-6"],
    stepNotes={"1": "Basic: soy sauce, water, honey, brown sugar and garlic.", "2": "Basic: broccoli only, a pinch of salt.", "5": "Basic: no sesame seeds."},
    costDrop=["carrots"], costAdd=[]),
  fancy=dict(note="Sticky glazed thighs sliced over rice with honey-glazed carrots, toasted sesame and a soft-boiled egg.",
    add=[{"group": "Fancy finish", "items": [
      I(4, None, "large eggs", "Eggs", "dairy", "soft-boiled, 6½ minutes"),
      I(1, "tsp", "sesame oil", "Sesame oil", "sauces", "to finish the veg")]}],
    swap={"2-6": {"optional": False}},
    stepNotes={"2": "Fancy: toss the veg with the sesame oil."},
    addSteps=[{"title": "Fancy finish", "text": "Soft-boil the eggs 6½ minutes, cool in cold water and halve. Build each bowl in sections — rice, broccoli, carrots, sliced chicken — with half an egg on top, extra glaze and sesame seeds."}],
    costAdd=[["Eggs, 4", 1.5, "eggs"], ["Sesame oil", 0.2, "sesame-oil"]],
    plating=["Arrange each topping in its own section of the bowl.", "Fan the sliced chicken; spoon glaze only over the chicken.", "Half a soft egg, yolk up, then sesame seeds."]),
  why={"1-7": "The slurry turns the thin sauce into a sticky glaze.", "1-4": "Rice vinegar balances the sweetness. Skip it and the glaze is sweeter.", "1-6": "Ginger adds warmth. Without it the teriyaki is simpler but still good."})

L["chicken-10"] = dict(fancyNight=False,
  basic=dict(note="Crispy chicken with an orange juice glaze — no zesting, fewer spices.",
    drop=["0-3", "1-1", "1-4", "1-6"],
    swap={"1-0": {"qty": 1.25, "note": "from the carton — a little extra since there's no fresh orange"}},
    stepNotes={"1": "Basic: salt and pepper only.", "3": "Basic: orange juice, brown sugar, soy and garlic."},
    costDrop=["oranges"], costAdd=[["Extra orange juice", 0.3, "orange-juice"]]),
  fancy=dict(note="Extra-crisp chicken in a bright fresh-orange glaze with candied zest and sesame.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, "tbsp", "honey", "Honey", "sauces", "in the glaze for shine"),
      I(1, None, "navel orange", "Oranges", "produce", "extra, cut into thin wheels")]}],
    stepNotes={"3": "Fancy: add the honey and simmer 1 minute longer for a glossy glaze."},
    addSteps=[{"title": "Fancy finish", "text": "Lay thin orange wheels around the plate, pile the rice and chicken in the middle and finish with sesame seeds and a little extra zest."}],
    costAdd=[["Orange, honey, sesame seeds", 1.6, "oranges"]],
    plating=["Thin orange wheels around the rim.", "Chicken piled high in the middle.", "A little extra zest over the top right before serving."]),
  why={"1-1": "Fresh zest gives the real orange flavour; juice alone is sweeter and flatter.", "1-7": "Cornstarch thickens the glaze so it clings to the crispy chicken.", "0-5": "Cornstarch in the coating is what makes it crunchy."})

L["comfort-soups-01"] = dict(fancyNight=False,
  basic=dict(note="Mom's soup with the essentials: potatoes, broth, milk and cheddar. Still thick and cosy.",
    drop=["0-9", "0-10", "0-11", "0-12", "1-1", "1-2"],
    swap={"0-6": {"name": "whole milk", "pantry": P("Milk", "dairy")}},
    stepNotes={"0": "Basic: no bacon — skip this step.", "3": "Basic: salt and pepper only.", "6": "Basic: milk instead of cream — keep it on low.", "7": "Basic: top with the rest of the cheddar."},
    costDrop=["bacon", "sour cream", "35%"], costAdd=[["Whole milk, 1½ cups", 0.8, "milk"]]),
  fancy=dict(note="Loaded and silky: cream, aged cheddar, crisp bacon, a swirl of sour cream and crispy potato skins on top.",
    add=[{"group": "Fancy finish", "items": [
      I(0.5, "cup", "shredded aged white cheddar", "Aged white cheddar", "dairy", "stirred in with the old cheddar"),
      I(4, "slice", "bacon", "Bacon", "meat", "extra, for thick crumbles on top")]}],
    swap={"0-11": {"optional": False}, "1-1": {"optional": False}},
    stepNotes={"6": "Fancy: stir the aged white cheddar in with the first cup of old cheddar."},
    addSteps=[{"title": "Fancy finish", "text": "Ladle into warm bowls. Add a spoon of sour cream, then drag a spoon through it for a swirl. Pile big bacon crumbles and cheddar in the centre and finish with cracked black pepper and a pinch of paprika."}],
    costAdd=[["Aged white cheddar, ½ cup", 2.0, "aged-white-cheddar"], ["Extra bacon, 4 slices", 1.8, "bacon"]],
    plating=["Warm the bowls with hot water first so the soup stays hot.", "Sour cream swirl, then toppings piled in the centre — not scattered.", "A tiny pinch of paprika for colour."]),
  why={"0-3": "Flour is what makes it thick and silky. Skip it and mash more potato instead.", "0-6": "Cream makes it rich. Milk works but keep it on low so it doesn't curdle.", "1-0": "Cheddar is the flavour and the thickness at the end — don't skip it.", "0-4": "Broth is the backbone of the flavour. Water works in a pinch with extra salt."})

L["comfort-soups-02"] = dict(fancyNight=False,
  basic=dict(note="Broccoli, broth, milk and cheddar — creamy without the extras.",
    drop=["0-7", "0-11", "0-12", "1-0"],
    swap={"0-5": {"name": "whole milk", "pantry": P("Milk", "dairy")}},
    stepNotes={"2": "Basic: milk instead of half-and-half.", "3": "Basic: broccoli, salt, pepper and garlic powder."},
    costDrop=["half-and-half"], costAdd=[["Whole milk, 2 cups", 1.0, "milk"]]),
  fancy=dict(note="Velvety Panera-style soup in a crusty bread bowl with crispy cheddar frico and toasted broccoli tips.",
    swap={"1-0": {"optional": False, "name": "small crusty rounds or bread bowls", "qty": 6}},
    add=[{"group": "Fancy finish", "items": [
      I(0.5, "cup", "shredded old cheddar", "Cheddar (shredded)", "dairy", "extra, for frico crisps")]}],
    stepNotes={"3": "Fancy: hold back a handful of small florets, roast them at 220°C for 10 minutes for the top."},
    addSteps=[{"title": "Fancy finish", "text": "Bake small mounds of cheddar on parchment at 200°C for 6–8 minutes until lacy and golden; cool to crisp. Hollow the bread rounds, toast them 5 minutes, ladle in the soup and top with roasted florets and a cheddar crisp."}],
    costAdd=[["Bread bowls, 6", 5.0, "crusty-bread"], ["Extra cheddar, ½ cup", 1.0, "cheddar-shredded"]],
    plating=["Toast the bread bowl first so it doesn't go soggy.", "Fill just below the rim and stand a cheddar crisp in the soup.", "Three roasted florets on top, not more."]),
  why={"0-3": "Flour makes the roux that keeps the cheese smooth. Without it the soup is thin and can turn grainy.", "0-12": "A pinch of nutmeg is the Panera secret. Leave it out and it's just a little plainer.", "0-13": "Freshly shredded cheddar melts smoothly; bagged has starch that can make it gritty."})

L["comfort-soups-03"] = dict(fancyNight=False,
  basic=dict(note="Beef, potatoes and carrots in a simple broth gravy.",
    drop=["1-4", "1-6", "1-7", "2-0"],
    stepNotes={"3": "Basic: broth, thyme and the beef — no Worcestershire, bay or sugar."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Deep, glossy bistro stew: extra tomato paste caramelised, pearl onions, a knob of butter and crusty bread.",
    swap={"2-0": {"optional": False}},
    add=[{"group": "Fancy finish", "items": [
      I(1.5, "cup", "frozen pearl onions", "Frozen pearl onions", "frozen"),
      I(2, "tbsp", "butter", "Butter", "dairy", "stirred in at the end for gloss"),
      I(1, "tbsp", "balsamic vinegar", "Balsamic vinegar", "sauces", "a splash at the end")]}],
    stepNotes={"2": "Fancy: let the tomato paste darken to a brick colour, 2–3 minutes.", "4": "Fancy: add the pearl onions with the potatoes."},
    addSteps=[{"title": "Fancy finish", "text": "Off the heat, stir in the butter and balsamic until glossy. Serve in wide bowls with warm torn crusty bread."}],
    costAdd=[["Frozen pearl onions", 3.0, "frozen-pearl-onions"], ["Balsamic + butter", 1.0, "balsamic-vinegar"], ["Crusty loaf", 3.5, "crusty-bread"]],
    plating=["Wide shallow bowls show off the chunks.", "Beef on top, vegetables peeking around.", "Torn bread on the side, never on top."]),
  why={"0-3": "Flour browns with the beef and thickens the gravy as it simmers.", "1-2": "Tomato paste gives colour and a rich, savoury depth.", "1-4": "Worcestershire adds tang and savoury depth; skip it and add a little extra salt."})

L["pasta-italian-01"] = dict(fancyNight=True,
  basic=dict(note="Butter, garlic, cream and Parmesan — Alfredo at its simplest.",
    drop=["0-4", "2-4", "2-7"],
    stepNotes={"0": "Basic: salt, pepper and garlic powder on the chicken."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Silky Alfredo finished with lemon zest and extra Parmesan, crisp-edged chicken and garlic toast.",
    add=[{"group": "Fancy finish", "items": [
      I(1, None, "lemon", "Lemons", "produce", "zest only"),
      I(0.5, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "extra, to finish"),
      I(0.5, None, "baguette", "Baguette", "grains", "sliced, for garlic toast")]}],
    stepNotes={"4": "Fancy: finish the sauce with the lemon zest."},
    addSteps=[{"title": "Fancy finish", "text": "Brush baguette slices with butter and garlic powder and toast until golden. Twirl the pasta into nests, fan the sliced chicken on top and shower with Parmesan and black pepper."}],
    costAdd=[["Lemon, extra Parmesan", 2.2, "parmesan-grated"], ["Baguette, ½", 1.5, "baguette"]],
    plating=["Twirl each portion into a nest with tongs and a ladle.", "Slice the chicken on the bias and fan it over the top.", "Parmesan and pepper from up high."]),
  why={"2-2": "Cream is the sauce. Milk won't thicken the same way.", "2-3": "Parmesan thickens and seasons — add it off the boil so it melts smoothly.", "1-0": "Cooking the pasta a minute short lets it finish in the sauce without going soft."})

L["pasta-italian-03"] = dict(fancyNight=False,
  basic=dict(note="Meat sauce, noodles and mozzarella — no ricotta layer.",
    drop=["0-9", "1-0", "1-1", "1-2", "1-3", "1-4", "2-2"],
    stepNotes={"3": "Basic: skip the ricotta layer.", "4": "Basic: layer sauce, noodles and mozzarella only."},
    costDrop=["ricotta", "parmesan"], costAdd=[]),
  fancy=dict(note="Tall, clean layers with a herb-seasoned ricotta, a mozzarella–Parmesan crust and a slow-simmered sauce.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "extra, between the layers"),
      I(1, "tsp", "dried Italian seasoning", "Italian seasoning (dried)", "spices", "into the ricotta")]}],
    stepNotes={"1": "Fancy: simmer the sauce a full 30 minutes for depth.", "3": "Fancy: stir the Italian seasoning into the ricotta.", "4": "Fancy: dust each layer with a little Parmesan."},
    costAdd=[["Extra Parmesan, 1 cup", 2.5, "parmesan-grated"]],
    plating=["Rest the full 20 minutes — it's what makes tall layers.", "Lift squares with a wide spatula onto warm plates.", "Spoon a little extra hot sauce beside, not on top."]),
  why={"1-0": "Ricotta makes the soft, creamy layer. Skip it for a simpler, meatier lasagna.", "1-1": "Egg sets the ricotta so slices stay neat.", "0-9": "A pinch of sugar balances acidic tomatoes."})

L["pasta-italian-05"] = dict(fancyNight=False,
  basic=dict(note="Stovetop-creamy mac with cheddar and milk; skip the crumb top.",
    drop=["1-3", "1-7", "1-8", "1-10", "2-0", "2-1", "2-2"],
    stepNotes={"2": "Basic: milk only, with salt, pepper and garlic powder.", "3": "Basic: all cheddar.", "4": "Basic: no crumb top — just the last cheddar."},
    costDrop=["evaporated", "mozzarella", "panko"], costAdd=[]),
  fancy=dict(note="Three cheeses with aged cheddar, a buttery garlic panko crust and crispy cheese edges.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "cup", "shredded aged white cheddar", "Aged white cheddar", "dairy", "into the sauce"),
      I(0.5, "tsp", "garlic powder", "Garlic powder", "spices", "into the crumb")]}],
    stepNotes={"3": "Fancy: melt in the aged white cheddar with the old cheddar.", "4": "Fancy: mix the garlic powder into the buttered crumbs."},
    addSteps=[{"title": "Fancy finish", "text": "Broil 1–2 minutes at the end until the edges are crisp and lacy. Scoop from the corners so everyone gets a crispy bit."}],
    costAdd=[["Aged white cheddar, 1 cup", 3.5, "aged-white-cheddar"]],
    plating=["Serve in small cast-iron or oven dishes if you have them.", "Scoop from the corners for crispy edges.", "Black pepper on top."]),
  why={"1-3": "Evaporated milk keeps the sauce smooth and stops it splitting when baked.", "1-1": "Flour thickens the sauce so the cheese stays creamy, not oily.", "2-0": "Panko gives the crunchy top. Skip it for a softer, saucier mac."})

L["pasta-italian-06"] = dict(fancyNight=False,
  basic=dict(note="Simple beef meatballs simmered in jarred sauce.",
    drop=["0-5", "0-10", "1-3"],
    stepNotes={"1": "Basic: beef, crumbs, milk, eggs, Parmesan, garlic, Italian seasoning, salt and pepper."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Tender ricotta meatballs, a sauce enriched with butter, and spaghetti tossed until glossy.",
    add=[{"group": "Fancy finish", "items": [
      I(0.5, "cup", "ricotta", "Ricotta", "dairy", "into the meatballs"),
      I(2, "tbsp", "butter", "Butter", "dairy", "stirred into the sauce"),
      I(0.25, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "extra, to finish")]}],
    stepNotes={"1": "Fancy: fold the ricotta into the mix — the softest meatballs you'll make.", "3": "Fancy: stir the butter into the sauce at the end."},
    costAdd=[["Ricotta, ½ cup", 1.5, "ricotta"], ["Butter + extra Parmesan", 1.3, "parmesan-grated"]],
    plating=["Twirl the spaghetti high in a warm bowl.", "Three meatballs on top, sauce spooned over them only.", "Parmesan from high up."]),
  why={"0-0": "The panko soaked in milk keeps meatballs soft and juicy.", "0-3": "Eggs bind the meatballs so they hold together in the sauce.", "0-4": "Parmesan seasons the meatballs from the inside."})

L["seafood-01"] = dict(fancyNight=True,
  basic=dict(note="Seasoned salmon with a honey–soy–garlic glaze over plain rice.",
    drop=["0-4", "1-2", "1-4", "2-3"],
    stepNotes={"1": "Basic: honey, soy and garlic.", "4": "Basic: no butter — just bubble the glaze."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Crisp-skin salmon with a brown-butter honey glaze, lemon zest rice and sesame broccoli.",
    add=[{"group": "Fancy finish", "items": [
      I(1, None, "lemon", "Lemons", "produce", "zest into the rice, wedges to serve"),
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, "tsp", "sesame oil", "Sesame oil", "sauces", "for the broccoli")]}],
    stepNotes={"0": "Fancy: fluff the lemon zest into the rice.", "2": "Fancy: toss the broccoli with the sesame oil and seeds.", "4": "Fancy: let the butter brown before adding the glaze."},
    costAdd=[["Lemon, sesame seeds, sesame oil", 1.4, "lemons"]],
    plating=["Rice in a neat mound, salmon leaning on it, crispy side up.", "Spoon glaze over the salmon only.", "Lemon wedge and sesame broccoli on the side."]),
  why={"1-0": "Honey caramelises into the glaze. Without it the sauce is salty and thin.", "1-2": "Lemon balances the sweet glaze — skip it and it's sweeter.", "0-5": "A hot oiled pan gives the crisp, golden crust."})

L["seafood-02"] = dict(fancyNight=True,
  basic=dict(note="Garlic butter shrimp over plain rice with steamed broccoli.",
    drop=["0-3", "0-8", "1-2", "1-3", "2-1", "2-3"],
    stepNotes={"0": "Basic: plain rice.", "1": "Basic: steam the broccoli 4–5 minutes.", "4": "Basic: butter, garlic and lemon — a splash of water instead of broth."},
    costDrop=["parmesan"], costAdd=[]),
  fancy=dict(note="Golden shrimp in a lemony garlic butter with Parmesan-roasted broccoli and garlic rice.",
    add=[{"group": "Fancy finish", "items": [
      I(1, None, "lemon", "Lemons", "produce", "extra, zest + wedges"),
      I(2, "tbsp", "butter", "Butter", "dairy", "extra, swirled into the sauce")]}],
    stepNotes={"4": "Fancy: swirl in the extra butter and zest off the heat for a glossy sauce."},
    costAdd=[["Lemon + extra butter", 1.3, "lemons"]],
    plating=["Shrimp curled in a ring on top of the rice.", "Sauce spooned over, then a little zest.", "Broccoli on one side, lemon wedge on the other."]),
  why={"0-0": "Dry shrimp sear; wet ones steam and go rubbery.", "0-6": "Butter is the sauce — less butter, less sauce.", "0-9": "Lemon brightens the rich butter."})

L["steak-pork-01"] = dict(fancyNight=True,
  basic=dict(note="Seared steak bites in garlic butter with simple roast potatoes.",
    drop=["0-4", "0-5", "1-4", "1-6", "2-2"],
    stepNotes={"0": "Basic: oil, salt, garlic powder and pepper.", "1": "Basic: salt, pepper and garlic powder."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Striploin bites with brown-butter garlic, crispy smashed potatoes and Parmesan.",
    swap={"1-0": {"name": "striploin steak", "note": "2.5 cm cubes"}, "2-2": {"optional": False}},
    add=[{"group": "Fancy finish", "items": [
      I(0.33, "cup", "grated Parmesan", "Parmesan (grated)", "dairy", "over the potatoes"),
      I(2, "tbsp", "butter", "Butter", "dairy", "extra, browned")]}],
    stepNotes={"0": "Fancy: halfway through, press each potato flat with a glass and roast until crispy.", "4": "Fancy: let the butter brown and smell nutty before adding the garlic."},
    costAdd=[["Striploin upgrade", 6.0, "striploin-steak"], ["Parmesan + extra butter", 1.4, "parmesan-grated"]],
    plating=["Pile the steak bites high, glossy side up.", "Smashed potatoes around, crispiest side showing.", "Spoon the brown butter over just before serving."]),
  why={"1-0": "Dry steak sears; damp steak steams grey.", "2-0": "The butter carries the garlic flavour over everything.", "1-5": "Very hot oil gives the crust — don't crowd the pan."})

L["steak-pork-02"] = dict(fancyNight=False,
  basic=dict(note="Steak, onions and cheese in a toasted roll.",
    drop=["0-3", "0-7", "1-2", "1-3"],
    stepNotes={"0": "Basic: oil only.", "1": "Basic: plain buttered rolls.", "2": "Basic: salt, pepper and garlic powder, no Worcestershire."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Caramelised onions, a creamy provolone sauce and garlic-butter toasted rolls.",
    add=[{"group": "Fancy finish", "items": [
      I(0.5, "cup", "milk", "Milk", "dairy", "for the cheese sauce"),
      I(1, "tbsp", "all-purpose flour", "All-purpose flour", "baking", "for the cheese sauce"),
      I(1, "cup", "shredded old cheddar", "Cheddar (shredded)", "dairy", "for the cheese sauce"),
      I(1, "tbsp", "butter", "Butter", "dairy", "for the cheese sauce")]}],
    stepNotes={"0": "Fancy: cook the onions 25 minutes on medium-low until deep golden."},
    addSteps=[{"title": "Fancy finish", "text": "Melt 1 tbsp butter, stir in the flour, then whisk in the milk until thick. Off the heat, stir in the cheddar until smooth. Spoon the sauce into the rolls before the steak and provolone."}],
    costAdd=[["Milk, flour, cheddar (cheese sauce)", 2.3, "cheddar-shredded"]],
    plating=["Wrap the bottom half of each sandwich in parchment — deli style.", "Cut on a sharp diagonal.", "Let a little cheese sauce drip over the edge."]),
  why={"0-2": "Slow-softened onions add sweetness. Skip them and it's just steak and cheese.", "0-8": "Provolone melts smooth and mild.", "1-1": "Buttered, toasted rolls stay crisp under the juicy filling."})

L["takeout-at-home-01"] = dict(fancyNight=False,
  basic=dict(note="Chicken and noodles with soy sauce, sugar and garlic.",
    drop=["1-1", "1-3", "1-6", "2-2"],
    swap={"1-0": {"qty": 0.33, "note": "replaces the oyster sauce too"}},
    stepNotes={"1": "Basic: soy sauce, brown sugar, water, cornstarch and pepper.", "4": "Basic: onion and coleslaw mix."},
    costDrop=["carrots"], costAdd=[]),
  fancy=dict(note="Glossy restaurant lo mein with honey, sesame and crisp-tender veg.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "tbsp", "honey", "Honey", "sauces", "in the sauce"),
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, "cup", "frozen peas", "Frozen peas", "frozen", "tossed in with the veg")]}],
    stepNotes={"1": "Fancy: whisk the honey into the sauce.", "4": "Fancy: add the peas with the coleslaw mix."},
    costAdd=[["Honey, sesame seeds, peas", 1.5, "frozen-peas"]],
    plating=["Twist the noodles high with tongs in the centre of the plate.", "Chicken on top, glossy.", "Sesame seeds last."]),
  why={"1-1": "Oyster sauce gives the deep takeout flavour.", "1-3": "Sesame oil is the takeout aroma — a little goes far.", "2-0": "Rinsing the noodles stops them clumping."})

L["takeout-at-home-02"] = dict(fancyNight=False,
  basic=dict(note="Rice, chicken, egg and soy sauce — the weeknight classic.",
    drop=["2-6", "2-7"],
    stepNotes={"4": "Basic: soy sauce only."},
    costDrop=[], costAdd=[]),
  fancy=dict(note="Extra-crispy toasted rice with a golden egg ribbon, peas, and a drizzle of sesame.",
    add=[{"group": "Fancy finish", "items": [
      I(1, "tbsp", "toasted sesame seeds", "Sesame seeds", "spices"),
      I(1, None, "large egg", "Eggs", "dairy", "extra, fried on top")]}],
    stepNotes={"3": "Fancy: let the rice sit untouched 2 minutes for crispy bits."},
    addSteps=[{"title": "Fancy finish", "text": "Pack the fried rice into a bowl, flip it onto the plate, top with a sunny fried egg and sesame seeds."}],
    costAdd=[["Sesame seeds + 1 egg", 0.8, "eggs"]],
    plating=["Dome the rice with a bowl.", "Fried egg on top, yolk centred.", "Sesame seeds and a few peas on the egg."]),
  why={"0-0": "Cold, day-old rice fries instead of steaming into mush.", "2-5": "Soy sauce seasons and colours the rice.", "2-6": "Oyster sauce adds the savoury takeout depth."})

# ---------------------------------------------------------------- Acura (dog-safe at every level; no salt, butter,
# onion, garlic, nutmeg, xylitol, grapes, chocolate). Cost: whole batch, CAD.
A = {}
A["pb-pumpkin-biscuits"] = dict(cost=[3.5, 4.5, 6],
  basic=dict(note="Three ingredients: flour, pumpkin and egg.", drop=["0-3"], stepNotes={"1": "Basic: no peanut butter — add a spoon more pumpkin."}),
  fancy=dict(note="Two-tone biscuits with a plain yogurt drizzle and blueberries pressed in.",
    add=[{"group": "Fancy finish", "items": [{"qty": 2, "unit": "tbsp", "name": "plain unsweetened yogurt", "note": "drizzle, a little only", "warn": "Plain, unsweetened, no xylitol."}, {"qty": 0.25, "unit": "cup", "name": "fresh blueberries"}]}],
    addSteps=[{"title": "Fancy finish", "text": "Press a blueberry into each bone before baking. Once completely cool, drizzle thin lines of plain yogurt and let them set in the fridge. Keep the drizzled ones in the fridge."}]),
  why={"0-1": "Pumpkin binds the dough and is gentle on tummies.", "0-2": "Eggs hold the biscuits together."})
A["pupsicles"] = dict(cost=[1.5, 2.5, 4],
  basic=dict(note="Just yogurt and banana.", drop=["0-2"]),
  fancy=dict(note="Layered pupsicles with blueberries and strawberries.",
    add=[{"group": "Fancy finish", "items": [{"qty": 0.25, "unit": "cup", "name": "fresh blueberries"}, {"qty": 3, "unit": None, "name": "strawberries", "note": "hulled, chopped small"}]}],
    stepNotes={"1": "Fancy: drop berries into each mould before filling."}),
  why={"0-0": "Yogurt makes them creamy — start small if Acura is new to dairy."})
A["sweet-potato-chews"] = dict(cost=[2, 2, 3],
  basic=dict(note="Already as simple as it gets: one sweet potato, low and slow."),
  fancy=dict(note="Mixed sweet potato and apple chews.",
    add=[{"group": "Fancy finish", "items": [{"qty": 1, "unit": None, "name": "apple", "note": "cored, seeds removed, thin rings", "warn": "No seeds or core."}]}],
    stepNotes={"2": "Fancy: add apple rings to the tray — they finish about 30 minutes sooner."}),
  why={"0-0": "Even slices dry evenly — thickness matters more than anything else."})
A["banana-oat-bites"] = dict(cost=[2, 2.5, 4],
  basic=dict(note="Banana, oats and egg.", drop=["0-3"]),
  fancy=dict(note="With blueberries and a yogurt dip.",
    add=[{"group": "Fancy finish", "items": [{"qty": 0.33, "unit": "cup", "name": "fresh blueberries"}, {"qty": 2, "unit": "tbsp", "name": "plain unsweetened yogurt", "note": "dip, a little only", "warn": "Plain, unsweetened, no xylitol."}]}],
    stepNotes={"1": "Fancy: fold in the blueberries.", "4": "Fancy: dip the cooled tops in yogurt and chill to set."}),
  why={"0-0": "Ripe banana sweetens and binds — no sugar needed.", "0-1": "Oats give structure; plain rolled oats only."})
A["chicken-jerky"] = dict(cost=[7, 7, 9],
  basic=dict(note="Plain chicken, nothing else — the classic."),
  fancy=dict(note="Chicken and sweet potato wraps.",
    add=[{"group": "Fancy finish", "items": [{"qty": 1, "unit": None, "name": "sweet potato", "note": "cut into thick sticks"}]}],
    stepNotes={"1": "Fancy: wrap a thin chicken strip around each sweet potato stick before baking."}),
  why={"0-0": "Trimming all the fat keeps the jerky safe to store and gentle on tummies."})
A["apple-carrot-bites"] = dict(cost=[2.5, 2.5, 4],
  basic=dict(note="Already basic: apple, carrot, egg and oat flour — nothing to leave out."),
  fancy=dict(note="With a little pumpkin and blueberries.",
    add=[{"group": "Fancy finish", "items": [{"qty": 0.25, "unit": "cup", "name": "pure pumpkin purée", "warn": "100% pure pumpkin, not pie filling."}, {"qty": 0.25, "unit": "cup", "name": "fresh blueberries"}]}],
    stepNotes={"1": "Fancy: stir in the pumpkin and blueberries."}),
  why={"0-0": "Apple adds sweetness and moisture — always core it and remove the seeds.", "0-2": "Egg binds the bites."})


# ---------------------------------------------------------------- Update 9 recipe audit fixes (content only; ids and
# existing item positions never change, so saved checks/notes keep linking — new items are appended to a group).
def audit(rid, r):
    from decimal import Decimal, ROUND_HALF_UP
    if rid == "chicken-03":   # boiling salt was 1 tbsp in the step but only 1 tsp in the list
        g = r["groups"][2]["items"]
        if len(g) == 5: g.append(I(1, "tbsp", "salt", "Salt", "spices", "for the potato water"))
        r["steps"][0]["uses"] = ["2-0", "2-5"]
        r["steps"][5]["uses"] = ["2-1", "2-2", "2-3", "2-4"]
    if rid == "pasta-italian-03":   # noodle water salt was used but never listed
        g = r["groups"][2]["items"]
        if len(g) == 3: g.append(I(1, "tbsp", "salt", "Salt", "spices", "for the noodle water"))
        r["steps"][2]["uses"] = ["2-0", "2-3"]
    if rid == "comfort-soups-02":   # all 3 cups went into the pot, yet the step said to top with extra cheddar
        r["steps"][5]["text"] = ("Take the pot off the heat. Stir in the cheddar a handful at a time until melted and smooth, "
            "saving a small handful for the top. Taste and add salt until it's well seasoned. Serve topped with the saved "
            "cheddar and crusty bread.")
    # the total shown on the card must equal its own breakdown (several were off by $0.50–$1)
    tot = sum(Decimal(str(b[1])) for b in r["cost"]["breakdown"])
    r["cost"]["total"] = int(tot.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

def audit_treats(t):
    for tr in t["treats"]:
        if tr["id"] == "banana-oat-bites":   # peanut butter said "optional" in the note but wasn't flagged
            tr["groups"][0]["items"][3]["optional"] = True

def apply():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'recipes')
    for f in sorted(glob.glob(os.path.join(root, '*', '[0-9]*.json'))):
        rid = f.split(os.sep)[-2] + '-' + os.path.basename(f)[:2]
        r = json.load(open(f, encoding='utf-8')); spec = L[rid]; audit(rid, r)
        r['levels'] = {'basic': spec['basic'], 'fancy': spec['fancy']}; r['why'] = spec['why']; r['fancyNight'] = spec['fancyNight']
        json.dump(r, open(f, 'w', encoding='utf-8'), indent=2, ensure_ascii=False); open(f, 'a').write('\n')
    tf = os.path.join(root, 'acura', 'treats.json'); t = json.load(open(tf, encoding='utf-8')); audit_treats(t)
    for tr in t['treats']:
        a = A[tr['id']]; tr['levels'] = {'basic': a['basic'], 'fancy': a['fancy']}; tr['why'] = a['why']
        tr['levelCost'] = {'basic': a['cost'][0], 'classic': a['cost'][1], 'fancy': a['cost'][2]}
    json.dump(t, open(tf, 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(tf, 'a').write('\n')

if __name__ == '__main__':
    apply(); print('levels written')
