# Exercise pictures

Put a picture in this folder and the app shows it instead of the animated figure for that exercise. Exercises without a picture keep the animation, so you can add them a few at a time.

## Rules
1. **The filename must match exactly** (lowercase, underscores, `.png`). Example: `goblet_squat.png`
2. **Square images** look best (1024×1024 is what ChatGPT makes).
3. **Optional second picture:** name it `<name>-2.png` (example `goblet_squat-2.png`) for the end position. The app flips between the two to show the movement.
4. Keep each file under ~500 KB so the app stays fast. Run large ones through squoosh.app or tinypng.com first.

## ChatGPT prompt (use the same one every time so all images match)
> Create a clean, flat vector-style fitness illustration on a plain white background, square format. A woman in her 30s with a dark ponytail wearing a coral pink sports bra and black leggings, shown from the side, demonstrating **[EXERCISE NAME]** at the **[START / BOTTOM]** position with correct form. [EQUIPMENT, e.g. holding one dumbbell at her chest]. Full body visible, centered, no text, no logos, no background objects.

Tips:
- Make all of them **in one ChatGPT conversation** and say "same woman, same style as before" each time. Otherwise the person changes from picture to picture.
- Check the form in every image. AI images often get joints wrong (knees caving in, rounded backs, extra fingers). Throw out any that show bad form, because she will copy what she sees.

## How to add them
On GitHub: open this `docs/images/exercises` folder → **Add file → Upload files** → drag in the PNGs → **Commit changes**. The live app updates in a minute or two. She may need to close and reopen it.

## Filenames
| Exercise | Category | Filename |
|---|---|---|
| Bodyweight Squat | Legs & Glutes | `squat.png` |
| Goblet Squat | Legs & Glutes | `goblet_squat.png` |
| Reverse Lunge | Legs & Glutes | `reverse_lunge.png` |
| Glute Bridge | Legs & Glutes | `glute_bridge.png` |
| Dumbbell Romanian Deadlift | Legs & Glutes | `rdl.png` |
| Sumo Squat | Legs & Glutes | `sumo_squat.png` |
| Banded Lateral Walk | Legs & Glutes | `lateral_walk.png` |
| Donkey Kicks | Legs & Glutes | `donkey_kick.png` |
| Side-Lying Leg Raise | Legs & Glutes | `side_leg_raise.png` |
| Wall Sit | Legs & Glutes | `wall_sit.png` |
| Calf Raises | Legs & Glutes | `calf_raise.png` |
| Push-Up | Upper Body | `pushup.png` |
| Bent-Over Dumbbell Row | Upper Body | `db_row.png` |
| Dumbbell Shoulder Press | Upper Body | `shoulder_press.png` |
| Bicep Curl | Upper Body | `bicep_curl.png` |
| Band Pull-Apart | Upper Body | `pull_apart.png` |
| Squat to Press | Upper Body | `thruster.png` |
| Kettlebell Swing | Upper Body | `kb_swing.png` |
| Forearm Plank | Core | `plank.png` |
| Dead Bug | Core | `dead_bug.png` |
| Crunch | Core | `crunch.png` |
| Superman | Core | `superman.png` |
| Jumping Jacks | HIIT | `jumping_jack.png` |
| High Knees | HIIT | `high_knees.png` |
| Mountain Climbers | HIIT | `mountain_climber.png` |
| Burpee | HIIT | `burpee.png` |
| Squat Jumps | HIIT | `squat_jump.png` |
| Skaters | HIIT | `skater.png` |
| Butt Kicks | HIIT | `butt_kick.png` |
| Jump Rope | Cardio | `jump_rope.png` |
| March / Walk in Place | Cardio | `march.png` |
| Shadow Boxing | Cardio | `boxing.png` |
| Step Touch | Cardio | `step_touch.png` |
| Cat-Cow | Stretch & Mobility | `cat_cow.png` |
| Child's Pose | Stretch & Mobility | `childs_pose.png` |
| Seated Hamstring Stretch | Stretch & Mobility | `ham_stretch.png` |
| Half-Kneeling Hip Flexor Stretch | Stretch & Mobility | `hip_flexor.png` |
| Sphinx / Cobra Stretch | Stretch & Mobility | `sphinx.png` |
| Standing Quad Stretch | Stretch & Mobility | `quad_stretch.png` |
