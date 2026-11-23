# Project context for Claude

## Who I'm working with
- New to GitHub and coding, and learning while building. Explain in plain English, avoid jargon (or define it), and give exact click-by-click steps with direct links.
- Prefers short, honest, to-the-point answers with no sugar-coating. Point out real limitations and mistakes.
- When asking them to do something on GitHub, offer to do it myself where I can, and invite a screenshot if they get stuck.
- `LEARNING-NOTES.md` is their own learning guide. Keep it up to date when they learn something new or a step changes.

## The project: FitHer
A workout + meal-plan phone app built for the user's sister, who is trying to lose weight. It is a PWA (website that installs to the phone home screen). No App Store and no accounts.

All app files live in `docs/` (GitHub Pages serves this folder):
- `index.html`, `css/styles.css`, `js/app.js`: app shell and all screens (Today, Workouts, Meals, Shop, Progress)
- `js/figure.js`: animated exercise figures, drawn from joint angles
- `js/data-exercises.js`: 34 exercises (poses, cues, equipment)
- `js/data-program.js`: weekly split, workouts, 3 phases over 6 weeks, equipment list
- `js/data-meals.js`: recipes + 6-week meal plan generator
- `sw.js`: offline cache. **Bump `VERSION` whenever app files change**, or phones keep the old version.
- `images/exercises/`: optional custom exercise pictures (`<exercise-id>.png`, optional `<id>-2.png`). The folder's README has the filename list and a ChatGPT prompt.

## Decisions made
- Default split: Mon Legs, Tue HIIT, Wed Full Body, Thu Cardio, Fri Full Body, Sat HIIT, Sun Rest. Editable in the app.
- Meals: ~1,400–1,600 cal/day, high protein. Calories are estimates. She can swap meals, create her own recipes, and shuffle a week.
- Instacart integration was **removed at the user's request**. The shopping list has "Copy list" / "Share" so it can be pasted into Instacart.
- Data is stored only on the phone (localStorage). There is a save guide on the Progress tab, a 7-day backup reminder on Today, and backup/restore via a JSON file (Files/iCloud/email).
- The user may replace the animated figures with ChatGPT-made images. Warn about inconsistent characters and bad form in AI images.

## Status / next steps (update this as things change)
- [x] App built and tested on a simulated iPhone, pushed to branch `claude/trusting-dirac-i9snp2`
- [x] Branch merged into `main`. Future work: commit on a branch, then merge into main when the user approves
- [x] Repo made **public**
- [x] GitHub Pages turned on (first build succeeded). Live link: https://vinnieced-debug.github.io/desktop-tutorial/ (if it shows the README instead of the app, the folder is set to root, not /docs)
- [ ] Send the sister the link (expected: https://vinnieced-debug.github.io/desktop-tutorial/) and have her Add to Home Screen
- [ ] Optional: add ChatGPT exercise images to `docs/images/exercises/`
