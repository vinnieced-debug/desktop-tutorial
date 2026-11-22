# FitHer — home workout, meal plan & shopping app

A phone app (PWA) that installs to the home screen from the browser. No App Store, no account; all data stays on the phone.

## What's inside
- **Today**: today's workout, this week's split, today's meals with calories and protein, water tracker
- **Workouts**: weekly split (Leg Day, HIIT, Full Body, Cardio, Rest), 6-week progression in 3 phases, 34 exercises with animated demo figures and form cues, guided timer with sets, reps, rest, beeps and weight tracking, saved YouTube workouts
- **Meals**: a 6-week plan of breakfast, lunch, dinner and a snack (~1,400–1,600 cal/day), recipes, swap any meal, create custom recipes, shuffle a week
- **Shop**: grocery list built from that week's meals (grouped by aisle, check-off, extras, share or copy, Instacart search per item), plus home-gym equipment with prices
- **Progress**: workout log, streak, weight chart, settings (start date, custom split, calorie target, backup and restore)

## Put it on a phone
1. Host the `docs/` folder. GitHub Pages works: repo **Settings → Pages → Deploy from a branch → (branch) / docs**.
2. Open the URL on the phone:
   - **iPhone (Safari)**: Share → Add to Home Screen
   - **Android (Chrome)**: ⋮ → Install app / Add to Home screen

## Editing content
- Exercises and animations: `js/data-exercises.js`
- Recipes and the 6-week meal plan: `js/data-meals.js`
- Split, workouts, phases and equipment: `js/data-program.js`
- After changing files, bump `VERSION` in `sw.js` so phones pick up the update.

## Instacart (future)
For now, each grocery item links to an Instacart search. Sending the whole cart in one tap needs an Instacart Developer Platform API key and a small server to keep that key secret.
