# My Learning Notes: Building Apps with Claude + GitHub

## GitHub in plain English
GitHub is like **Google Drive for app files**, except it keeps every saved version.

| Word | What it means |
|---|---|
| **Repository (repo)** | A project folder. Mine is `desktop-tutorial`. |
| **Commit** | A save point: "Save" plus a note about what changed. |
| **Branch** | A draft copy of the folder. Changes there don't touch the official version. |
| **main** | The official version, and what GitHub shows when I open the repo. |
| **Merge** | Moving a draft into the official version (like "Accept all changes" in Word). |
| **Pull request (PR)** | A request to merge a draft into main, so I can review it before accepting. |
| **Push** | Uploading saved changes to GitHub. |
| **GitHub Pages** | Free website hosting from GitHub. It turns the files into a link people can open. |
| **Public / Private** | Who can see the files. Free GitHub Pages only works on **public** repos. |

**Lesson learned:** I couldn't see my app because Claude saved it to a **branch** (a draft), and GitHub shows **main** by default. Switch branches with the dropdown in the top left that says "main".

## Getting the app live (one-time setup) ✅ DONE
**App link: https://vinnieced-debug.github.io/desktop-tutorial/**

Where to find the link later: Settings → Pages → the top line says "Your site is live at…" with a **Visit site** button.
When I change files, the site rebuilds on its own in about 1–2 minutes.

1. **Merge the draft into main.** Ask Claude: "merge it into main."
2. **Make the repo public**
   - Go to github.com/vinnieced-debug/desktop-tutorial/settings
   - Scroll to the bottom, to the red "Danger Zone" box → **Change visibility** → **Make public**
   - This is safe: only the app code is visible. My sister's workouts, weight and meals are stored on her phone, not on GitHub.
3. **Turn on the website**
   - Go to github.com/vinnieced-debug/desktop-tutorial/settings/pages
   - Branch: **main**, folder: **/docs** → **Save**
   - Wait 2 minutes and refresh. The link appears at the top (should be vinnieced-debug.github.io/desktop-tutorial)
4. **Send the link to my sister.** She opens it and adds it to her home screen:
   - iPhone (Safari): **Share** button → **Add to Home Screen**
   - Android (Chrome): **⋮ menu** → **Install app**

## Adding exercise pictures (from ChatGPT)
1. Make the image in ChatGPT using the prompt in `docs/images/exercises/README.md`
2. Save it as a PNG named **exactly** like the list in that README (example: `goblet_squat.png`)
3. On GitHub, open the `docs/images/exercises` folder → **Add file → Upload files** → drag in the images → **Commit changes**
4. Wait a couple of minutes. She may need to close and reopen the app.

Watch out:
- Make all the images in **one ChatGPT chat** and say "same woman, same style," or the person changes in every picture.
- **Check the form** in every image. AI images often show bad form (knees caving, rounded back), and she'll copy what she sees.

## How the app saves her progress
- It saves automatically on her phone. There's no account.
- She must **always open it from the home-screen icon.** On iPhone, Safari and the home-screen app keep separate data.
- **Back up weekly:** Progress tab → Back up now → Save to Files (iCloud) or email it to herself. The app reminds her every 7 days.
- New phone? Install the app again → Progress → **Restore** → pick the latest backup file.
- Deleting the app or clearing Safari data without a backup **erases everything**.

## Working with Claude: what helps
- Say what you want in plain words; you don't need technical terms.
- If you're stuck on a screen, **send a screenshot** and ask "where do I click?"
- Claude can do the GitHub work for you (save, merge, create files). You only need to do account settings like public/private and Pages.
- Claude saves code to a branch first. Ask it to merge into main when you're happy.

## App summary (FitHer)
- **Split:** Mon Legs · Tue HIIT · Wed Full Body · Thu Cardio · Fri Full Body · Sat HIIT · Sun Rest (changeable in the app)
- **6 weeks, 3 phases:** Foundation (wk 1–2) → Build (wk 3–4) → Push (wk 5–6)
- **Meals:** 6-week plan, ~1,400–1,600 cal/day, swap meals, create her own recipes
- **Shopping list:** built from that week's meals → **Copy list** → paste into Instacart
- **Equipment (must-haves):** mat, dumbbells (5/10/15 lb), loop bands, shoes, water bottle. Starter kit runs about $150–300.
