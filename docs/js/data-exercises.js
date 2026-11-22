/* Exercise library. Poses are joint angles consumed by figure.js.
 * Side view: figure faces right. r* = near limbs, l* = far limbs.
 * Front view: l* = viewer's left, r* = viewer's right.
 */
const SQUAT_DOWN = { t: 35, ll: 78, ls: -18, rl: 78, rs: -18, la: 80, lf: 80, ra: 80, rf: 80 };
const STAND_ARMS_FWD = { t: 0, ll: 2, ls: 2, rl: -2, rs: -2, la: 80, lf: 80, ra: 80, rf: 80 };
const PLANK_HIGH = { t: 64, la: 0, lf: 0, ra: 0, rf: 0, ll: -64, ls: -64, rl: -64, rs: -64 };
const TABLETOP = { t: 90, la: 0, lf: 0, ra: 0, rf: 0, ll: 0, ls: -90, rl: 0, rs: -90 };
const STAND = { t: 0, la: 4, lf: 4, ra: -4, rf: -4, ll: 3, ls: 3, rl: -3, rs: -3 };

const EXERCISES = {
  // ---------- LEGS / GLUTES ----------
  squat: {
    name: 'Bodyweight Squat', cat: 'legs', equip: [], muscles: 'Quads, glutes, core',
    cues: ['Feet shoulder-width, toes slightly out', 'Sit hips back like into a chair', 'Chest up, knees track over toes', 'Push through heels to stand'],
    easier: 'Squat to a chair and stand back up', harder: 'Hold a dumbbell (goblet squat) or add a pause at the bottom',
    poses: [STAND_ARMS_FWD, SQUAT_DOWN]
  },
  goblet_squat: {
    name: 'Goblet Squat', cat: 'legs', equip: ['dumbbells', 'kettlebell'], muscles: 'Quads, glutes, core', prop: 'kb',
    cues: ['Hold one dumbbell/kettlebell at your chest', 'Elbows point down between knees', 'Sit deep, keep chest tall', 'Drive up through heels'],
    easier: 'Use a lighter weight or bodyweight', harder: 'Heavier weight, 3-second lowering',
    poses: [{ t: 0, ll: 2, ls: 2, rl: -2, rs: -2, la: 15, lf: 170, ra: 15, rf: 170 }, { t: 30, ll: 80, ls: -18, rl: 80, rs: -18, la: 40, lf: 175, ra: 40, rf: 175 }]
  },
  reverse_lunge: {
    name: 'Reverse Lunge', cat: 'legs', equip: [], muscles: 'Quads, glutes, hamstrings',
    cues: ['Step one foot back', 'Lower until both knees are ~90°', 'Front knee stays over ankle', 'Push through front heel to return'],
    easier: 'Hold a chair for balance, shorter range', harder: 'Hold dumbbells at your sides',
    poses: [STAND, { t: 0, rl: 82, rs: 0, ll: -18, ls: -95, la: -10, lf: 10, ra: 10, rf: 10 }]
  },
  glute_bridge: {
    name: 'Glute Bridge', cat: 'legs', equip: ['mat'], muscles: 'Glutes, hamstrings, core', mat: true,
    cues: ['Lie on back, knees bent, feet flat', 'Squeeze glutes and lift hips', 'Straight line knees→shoulders at top', 'Lower slowly'],
    easier: 'Smaller range of motion', harder: 'Band above knees or dumbbell on hips, or single leg',
    poses: [{ t: -90, ll: 150, ls: 8, rl: 150, rs: 8, la: 92, lf: 92, ra: 92, rf: 92 }, { t: -112, ll: 118, ls: -8, rl: 118, rs: -8, la: 70, lf: 70, ra: 70, rf: 70 }]
  },
  rdl: {
    name: 'Dumbbell Romanian Deadlift', cat: 'legs', equip: ['dumbbells'], muscles: 'Hamstrings, glutes, lower back', prop: 'db',
    cues: ['Soft knees, dumbbells in front of thighs', 'Push hips BACK, flat back', 'Lower to mid-shin, feel hamstring stretch', 'Squeeze glutes to stand'],
    easier: 'Lighter weights, shorter range', harder: 'Heavier, or single-leg',
    poses: [STAND, { t: 72, ll: -8, ls: 2, rl: -8, rs: 2, la: 0, lf: 0, ra: 0, rf: 0 }]
  },
  sumo_squat: {
    name: 'Sumo Squat', cat: 'legs', equip: ['kettlebell', 'dumbbells'], muscles: 'Inner thighs, glutes, quads', prop: 'kb',
    cues: ['Wide stance, toes turned out', 'Hold weight hanging between legs', 'Sit straight down, knees out', 'Squeeze glutes at the top'],
    easier: 'Bodyweight only', harder: 'Heavier weight, pulse at bottom',
    poses: [{ view: 'front', ll: -24, ls: -24, rl: 24, rs: 24, la: 14, lf: 14, ra: -14, rf: -14 }, { view: 'front', ll: -72, ls: -14, rl: 72, rs: 14, la: 10, lf: 10, ra: -10, rf: -10 }]
  },
  lateral_walk: {
    name: 'Banded Lateral Walk', cat: 'legs', equip: ['loop bands'], muscles: 'Glute medius (side glutes), hips', prop: 'band', bandAt: 'knees',
    cues: ['Loop band just above knees', 'Quarter-squat, chest up', 'Step sideways, keep tension', '10 steps right, 10 steps left'],
    easier: 'Lighter band', harder: 'Band at ankles or a heavier band',
    poses: [{ view: 'front', ll: -6, ls: -6, rl: 6, rs: 6, la: -35, lf: 35, ra: 35, rf: -35 }, { view: 'front', ll: -24, ls: -24, rl: 24, rs: 24, la: -35, lf: 35, ra: 35, rf: -35 }]
  },
  donkey_kick: {
    name: 'Donkey Kicks', cat: 'legs', equip: ['mat', 'loop bands'], muscles: 'Glutes', mat: true,
    cues: ['Hands under shoulders, knees under hips', 'Keep knee bent 90°', 'Kick heel up toward ceiling', 'Don\'t arch your lower back'],
    easier: 'Smaller kick', harder: 'Loop band around thighs',
    poses: [TABLETOP, Object.assign({}, TABLETOP, { rl: -105, rs: 175 })]
  },
  side_leg_raise: {
    name: 'Side-Lying Leg Raise', cat: 'legs', equip: ['mat'], muscles: 'Outer hips, glutes', mat: true,
    cues: ['Lie on your side, legs straight', 'Lift top leg to ~45°', 'Toes point forward, not up', 'Lower with control'],
    easier: 'Bend bottom knee for stability', harder: 'Loop band at ankles',
    poses: [{ t: -90, ll: 90, ls: 90, rl: 90, rs: 90, la: -160, lf: 140, ra: 90, rf: 90 }, { t: -90, ll: 90, ls: 90, rl: 125, rs: 125, la: -160, lf: 140, ra: 90, rf: 90 }]
  },
  wall_sit: {
    name: 'Wall Sit', cat: 'legs', equip: [], muscles: 'Quads, glutes',
    cues: ['Back flat against a wall', 'Slide down until thighs are parallel', 'Knees over ankles', 'Breathe and hold'],
    easier: 'Don\'t go as low', harder: 'Hold a dumbbell on your thighs',
    poses: [{ t: 0, ll: 90, ls: 0, rl: 90, rs: 0, la: 90, lf: 90, ra: 90, rf: 90 }, { t: 0, ll: 88, ls: 0, rl: 88, rs: 0, la: 90, lf: 92, ra: 90, rf: 92 }], speed: 3000
  },
  calf_raise: {
    name: 'Calf Raises', cat: 'legs', equip: [], muscles: 'Calves',
    cues: ['Stand tall, feet hip-width', 'Rise onto the balls of your feet', 'Pause at top', 'Lower slowly'],
    easier: 'Hold a wall', harder: 'Hold dumbbells or do single-leg',
    poses: [STAND, Object.assign({}, STAND, { lift: 7 })], speed: 1400
  },

  // ---------- UPPER BODY ----------
  pushup: {
    name: 'Push-Up', cat: 'upper', equip: ['mat'], muscles: 'Chest, shoulders, triceps, core', mat: true,
    cues: ['Hands slightly wider than shoulders', 'Body in one straight line', 'Lower chest toward floor', 'Elbows ~45° from body'],
    easier: 'Knees on the floor, or hands on a couch/counter', harder: 'Slow 3-second lowering',
    poses: [PLANK_HIGH, { t: 72, la: -50, lf: 15, ra: -50, rf: 15, ll: -72, ls: -72, rl: -72, rs: -72 }]
  },
  db_row: {
    name: 'Bent-Over Dumbbell Row', cat: 'upper', equip: ['dumbbells'], muscles: 'Back, biceps, rear shoulders', prop: 'db',
    cues: ['Hinge forward, flat back', 'Arms hang under shoulders', 'Pull elbows back toward hips', 'Squeeze shoulder blades'],
    easier: 'Lighter weights', harder: 'Heavier, pause at top',
    poses: [{ t: 62, ll: 12, ls: -8, rl: 12, rs: -8, la: 0, lf: 0, ra: 0, rf: 0 }, { t: 62, ll: 12, ls: -8, rl: 12, rs: -8, la: -62, lf: 5, ra: -62, rf: 5 }]
  },
  shoulder_press: {
    name: 'Dumbbell Shoulder Press', cat: 'upper', equip: ['dumbbells'], muscles: 'Shoulders, triceps', prop: 'db',
    cues: ['Dumbbells at shoulder height', 'Brace core, don\'t arch back', 'Press straight overhead', 'Lower to shoulders slowly'],
    easier: 'Seated, lighter weight', harder: 'Heavier, or one arm at a time',
    poses: [{ view: 'front', la: 270, lf: 180, ra: 90, rf: 180, ll: -6, ls: -6, rl: 6, rs: 6 }, { view: 'front', la: 195, lf: 178, ra: 165, rf: 182, ll: -6, ls: -6, rl: 6, rs: 6 }]
  },
  bicep_curl: {
    name: 'Bicep Curl', cat: 'upper', equip: ['dumbbells', 'long bands'], muscles: 'Biceps', prop: 'db',
    cues: ['Elbows pinned to your sides', 'Curl weights to shoulders', 'No swinging', 'Lower all the way'],
    easier: 'Lighter weight or band', harder: 'Slow 3-second lowering',
    poses: [STAND, { t: 0, la: 4, lf: 160, ra: 4, rf: 160, ll: 3, ls: 3, rl: -3, rs: -3 }]
  },
  pull_apart: {
    name: 'Band Pull-Apart', cat: 'upper', equip: ['long bands'], muscles: 'Upper back, rear shoulders, posture', prop: 'band',
    cues: ['Hold band at chest height, arms straight', 'Pull hands apart wide', 'Squeeze shoulder blades together', 'Return slowly'],
    easier: 'Lighter band / wider grip', harder: 'Narrower grip / heavier band',
    poses: [{ view: 'front', la: 78, lf: 78, ra: -78, rf: -78, ll: -6, ls: -6, rl: 6, rs: 6 }, { view: 'front', la: -88, lf: -90, ra: 88, rf: 90, ll: -6, ls: -6, rl: 6, rs: 6 }]
  },
  thruster: {
    name: 'Squat to Press', cat: 'upper', equip: ['dumbbells'], muscles: 'Full body: legs, shoulders, core', prop: 'db',
    cues: ['Dumbbells at shoulders', 'Squat down', 'Drive up and press overhead in one motion', 'Lower weights as you squat again'],
    easier: 'Lighter weights, half squat', harder: 'Heavier, faster tempo',
    poses: [{ t: 32, ll: 78, ls: -18, rl: 78, rs: -18, la: 25, lf: 175, ra: 25, rf: 175 }, { t: 0, ll: 2, ls: 2, rl: -2, rs: -2, la: 175, lf: 178, ra: 175, rf: 178 }]
  },
  kb_swing: {
    name: 'Kettlebell Swing', cat: 'upper', equip: ['kettlebell'], muscles: 'Glutes, hamstrings, back, cardio', prop: 'kb',
    cues: ['Hinge at hips (not a squat)', 'Snap hips forward to swing bell', 'Arms are just ropes — hips do the work', 'Bell to chest height'],
    easier: 'Lighter bell, smaller swing', harder: 'Heavier bell',
    poses: [{ t: 65, ll: 10, ls: -5, rl: 10, rs: -5, la: -25, lf: -25, ra: -25, rf: -25 }, { t: -4, ll: 2, ls: 2, rl: -2, rs: -2, la: 88, lf: 88, ra: 88, rf: 88 }], speed: 1200
  },

  // ---------- CORE ----------
  plank: {
    name: 'Forearm Plank', cat: 'core', equip: ['mat'], muscles: 'Core, shoulders', mat: true,
    cues: ['Elbows under shoulders', 'Squeeze glutes and abs', 'Straight line head to heels', 'Don\'t let hips sag'],
    easier: 'Knees down', harder: 'Lift one foot, alternate',
    poses: [{ t: 78, la: 0, lf: 90, ra: 0, rf: 90, ll: -78, ls: -78, rl: -78, rs: -78 }, { t: 77, la: 0, lf: 90, ra: 0, rf: 90, ll: -77, ls: -77, rl: -77, rs: -77 }], speed: 3000
  },
  dead_bug: {
    name: 'Dead Bug', cat: 'core', equip: ['mat'], muscles: 'Deep core, abs', mat: true,
    cues: ['Lie on back, arms to ceiling, knees at 90°', 'Press lower back INTO the floor', 'Extend opposite arm and leg', 'Return and switch sides'],
    easier: 'Move only legs', harder: 'Hold a light dumbbell',
    poses: [{ t: -90, la: 180, lf: 180, ra: 180, rf: 180, ll: 180, ls: 90, rl: 180, rs: 90 }, { t: -90, la: 180, lf: 180, ra: 250, rf: 250, ll: 98, ls: 98, rl: 180, rs: 90 }], speed: 2200
  },
  crunch: {
    name: 'Crunch', cat: 'core', equip: ['mat'], muscles: 'Abs', mat: true,
    cues: ['Knees bent, feet flat', 'Hands across chest or lightly behind head', 'Lift shoulder blades off floor', 'Exhale as you curl up'],
    easier: 'Smaller range', harder: 'Hold a weight at chest',
    poses: [{ t: -90, ll: 150, ls: 8, rl: 150, rs: 8, la: 92, lf: 92, ra: 92, rf: 92 }, { t: -66, ll: 150, ls: 8, rl: 150, rs: 8, la: 118, lf: 118, ra: 118, rf: 118 }]
  },
  superman: {
    name: 'Superman', cat: 'core', equip: ['mat'], muscles: 'Lower back, glutes, posture', mat: true,
    cues: ['Lie face down, arms overhead', 'Lift arms, chest and legs together', 'Look at the floor (neck neutral)', 'Hold 2 seconds, lower'],
    easier: 'Lift only arms or only legs', harder: 'Hold longer at top',
    poses: [{ t: 90, la: 90, lf: 90, ra: 90, rf: 90, ll: -90, ls: -90, rl: -90, rs: -90 }, { t: 82, la: 108, lf: 108, ra: 108, rf: 108, ll: -103, ls: -103, rl: -103, rs: -103 }], speed: 2200
  },

  // ---------- HIIT ----------
  jumping_jack: {
    name: 'Jumping Jacks', cat: 'hiit', equip: [], muscles: 'Full body cardio',
    cues: ['Jump feet wide while arms go overhead', 'Jump back together', 'Land softly on balls of feet', 'Keep a steady rhythm'],
    easier: 'Step jacks: step one foot out at a time (no jumping)', harder: 'Go faster',
    poses: [{ view: 'front', ll: -4, ls: -4, rl: 4, rs: 4, la: -8, lf: -6, ra: 8, rf: 6 }, { view: 'front', ll: -22, ls: -22, rl: 22, rs: 22, la: -160, lf: -168, ra: 160, rf: 168, lift: 8 }], speed: 900
  },
  high_knees: {
    name: 'High Knees', cat: 'hiit', equip: [], muscles: 'Cardio, hip flexors, core',
    cues: ['Run in place', 'Drive knees to hip height', 'Pump your arms', 'Stay on balls of your feet'],
    easier: 'March with high knees (no jumping)', harder: 'Go faster',
    poses: [{ t: 0, rl: 90, rs: 0, ll: 0, ls: 0, ra: -35, rf: 60, la: 40, lf: 130, lift: 3 }, { t: 0, rl: 0, rs: 0, ll: 90, ls: 0, ra: 40, rf: 130, la: -35, lf: 60, lift: 3 }], speed: 700
  },
  mountain_climber: {
    name: 'Mountain Climbers', cat: 'hiit', equip: ['mat'], muscles: 'Core, shoulders, cardio', mat: true,
    cues: ['High plank, hands under shoulders', 'Drive one knee toward chest', 'Switch legs quickly', 'Keep hips low'],
    easier: 'Slow, step each foot in', harder: 'Go faster',
    poses: [Object.assign({}, PLANK_HIGH, { rl: 30, rs: -60 }), Object.assign({}, PLANK_HIGH, { ll: 30, ls: -60 })], speed: 800
  },
  burpee: {
    name: 'Burpee', cat: 'hiit', equip: ['mat'], muscles: 'Full body', mat: true,
    cues: ['Squat and place hands down', 'Jump or step feet back to plank', 'Return feet to hands', 'Stand/jump up, arms overhead'],
    easier: 'Step back instead of jumping, no jump at top', harder: 'Add a push-up',
    poses: [
      { t: 0, la: 175, lf: 178, ra: 175, rf: 178, ll: 2, ls: 2, rl: -2, rs: -2, lift: 10 },
      { t: 55, ll: 95, ls: -30, rl: 95, rs: -30, la: 5, lf: 5, ra: 5, rf: 5 },
      PLANK_HIGH,
      { t: 55, ll: 95, ls: -30, rl: 95, rs: -30, la: 5, lf: 5, ra: 5, rf: 5 }
    ], speed: 3200
  },
  squat_jump: {
    name: 'Squat Jumps', cat: 'hiit', equip: [], muscles: 'Legs, glutes, power',
    cues: ['Squat down, arms back', 'Explode up, arms swing up', 'Land softly, knees bent', 'Go right into the next squat'],
    easier: 'Regular squats with a calf raise at top', harder: 'Jump higher',
    poses: [{ t: 38, ll: 80, ls: -18, rl: 80, rs: -18, la: -35, lf: -30, ra: -35, rf: -30 }, { t: 0, ll: 0, ls: 0, rl: 0, rs: 0, la: 170, lf: 172, ra: 170, rf: 172, lift: 18 }], speed: 1200
  },
  skater: {
    name: 'Skaters', cat: 'hiit', equip: [], muscles: 'Glutes, legs, balance',
    cues: ['Leap sideways onto one foot', 'Other leg sweeps behind', 'Swing arms across', 'Leap back the other way'],
    easier: 'Step side-to-side, no jump', harder: 'Bigger leaps',
    poses: [{ view: 'front', t: -8, ll: -2, ls: -2, rl: -28, rs: -40, la: 50, lf: 60, ra: 40, rf: 50 }, { view: 'front', t: 8, rl: 2, rs: 2, ll: 28, ls: 40, ra: -50, rf: -60, la: -40, lf: -50 }], speed: 1300
  },
  butt_kick: {
    name: 'Butt Kicks', cat: 'hiit', equip: [], muscles: 'Hamstrings, cardio',
    cues: ['Jog in place', 'Kick heels up toward glutes', 'Pump arms', 'Stay light on your feet'],
    easier: 'Walk it, one heel at a time', harder: 'Faster',
    poses: [{ rl: 0, rs: -165, ll: 0, ls: 0, ra: -35, rf: 60, la: 40, lf: 130, lift: 3 }, { ll: 0, ls: -165, rl: 0, rs: 0, la: -35, lf: 60, ra: 40, rf: 130, lift: 3 }], speed: 700
  },

  // ---------- CARDIO ----------
  jump_rope: {
    name: 'Jump Rope', cat: 'cardio', equip: ['jump rope'], muscles: 'Cardio, calves, coordination', prop: 'rope',
    cues: ['Elbows close to body', 'Turn the rope with your wrists', 'Small hops, land on balls of feet', 'Rest when you trip — that\'s normal'],
    easier: 'Pretend rope (same motion, no rope)', harder: 'Alternate feet like jogging',
    poses: [{ view: 'front', la: -18, lf: 30, ra: 18, rf: -30, ll: -4, ls: -4, rl: 4, rs: 4 }, { view: 'front', la: -18, lf: 30, ra: 18, rf: -30, ll: -4, ls: -4, rl: 4, rs: 4, lift: 7 }], speed: 650
  },
  march: {
    name: 'March / Walk in Place', cat: 'cardio', equip: [], muscles: 'Low-impact cardio',
    cues: ['Lift knees to comfortable height', 'Swing arms naturally', 'Stand tall', 'Speed up to raise heart rate'],
    easier: 'Slower pace', harder: 'Higher knees, add arm punches',
    poses: [{ rl: 60, rs: -5, ll: -5, ls: -5, ra: -30, rf: 20, la: 30, lf: 70 }, { ll: 60, ls: -5, rl: -5, rs: -5, la: -30, lf: 20, ra: 30, rf: 70 }], speed: 1100
  },
  boxing: {
    name: 'Shadow Boxing', cat: 'cardio', equip: [], muscles: 'Cardio, shoulders, core',
    cues: ['Staggered stance, knees soft', 'Hands up by your chin', 'Punch: jab, cross, repeat', 'Twist your hips with each punch'],
    easier: 'Slower punches', harder: 'Hold 1–2 lb weights or add squats',
    poses: [{ t: 5, rl: 12, rs: 8, ll: -12, ls: -12, ra: 90, rf: 90, la: 30, lf: 165 }, { t: 5, rl: 12, rs: 8, ll: -12, ls: -12, ra: 30, rf: 165, la: 90, lf: 90 }], speed: 800
  },
  step_touch: {
    name: 'Step Touch', cat: 'cardio', equip: [], muscles: 'Low-impact cardio',
    cues: ['Step right, tap left foot beside it', 'Step left, tap right', 'Add arm swings or claps', 'Keep it bouncy'],
    easier: 'Smaller steps', harder: 'Add a squat each step',
    poses: [{ view: 'front', t: -4, ll: -16, ls: -16, rl: 3, rs: 3, la: -30, lf: -60, ra: 30, rf: 60 }, { view: 'front', t: 4, ll: -3, ls: -3, rl: 16, rs: 16, la: -10, lf: -10, ra: 10, rf: 10 }], speed: 1000
  },

  // ---------- MOBILITY / RECOVERY ----------
  cat_cow: {
    name: 'Cat-Cow', cat: 'mobility', equip: ['mat'], muscles: 'Spine, back', mat: true,
    cues: ['On hands and knees', 'Inhale: drop belly, look up', 'Exhale: round back, tuck chin', 'Move slowly with breath'],
    easier: 'Smaller range', harder: '—',
    poses: [Object.assign({}, TABLETOP, { t: 82 }), Object.assign({}, TABLETOP, { t: 100 })], speed: 3500
  },
  childs_pose: {
    name: "Child's Pose", cat: 'mobility', equip: ['mat'], muscles: 'Back, hips, relaxation', mat: true,
    cues: ['Kneel, big toes together', 'Sit hips back toward heels', 'Reach arms forward on floor', 'Breathe deeply'],
    easier: 'Pillow under hips', harder: '—',
    poses: [{ t: 118, ll: 60, ls: -92, rl: 60, rs: -92, la: 100, lf: 100, ra: 100, rf: 100 }, { t: 113, ll: 62, ls: -92, rl: 62, rs: -92, la: 102, lf: 102, ra: 102, rf: 102 }], speed: 4000
  },
  ham_stretch: {
    name: 'Seated Hamstring Stretch', cat: 'mobility', equip: ['mat'], muscles: 'Hamstrings, lower back', mat: true,
    cues: ['Sit with legs straight', 'Hinge forward from hips', 'Reach toward toes', 'Hold, don\'t bounce'],
    easier: 'Bend knees slightly or use a band around feet', harder: '—',
    poses: [{ t: 40, ll: 90, ls: 90, rl: 90, rs: 90, la: 70, lf: 75, ra: 70, rf: 75 }, { t: 62, ll: 90, ls: 90, rl: 90, rs: 90, la: 85, lf: 88, ra: 85, rf: 88 }], speed: 4000
  },
  hip_flexor: {
    name: 'Half-Kneeling Hip Flexor Stretch', cat: 'mobility', equip: ['mat'], muscles: 'Hip flexors, quads', mat: true,
    cues: ['One knee down, other foot forward', 'Squeeze back glute', 'Shift hips gently forward', 'Reach arms up'],
    easier: 'Cushion under knee', harder: 'Lean slightly to the side',
    poses: [{ t: 0, rl: 85, rs: 0, ll: -25, ls: -95, la: 175, lf: 178, ra: 175, rf: 178 }, { t: -6, rl: 75, rs: -8, ll: -35, ls: -95, la: 170, lf: 172, ra: 170, rf: 172 }], speed: 4000
  },
  sphinx: {
    name: 'Sphinx / Cobra Stretch', cat: 'mobility', equip: ['mat'], muscles: 'Abs, chest, spine', mat: true,
    cues: ['Lie face down', 'Forearms on floor, elbows under shoulders', 'Gently lift chest', 'Keep hips on the floor'],
    easier: 'Stay lower', harder: 'Straighten arms (cobra)',
    poses: [{ t: 82, la: -20, lf: 90, ra: -20, rf: 90, ll: -90, ls: -90, rl: -90, rs: -90 }, { t: 64, la: -8, lf: 90, ra: -8, rf: 90, ll: -90, ls: -90, rl: -90, rs: -90 }], speed: 4000
  },
  quad_stretch: {
    name: 'Standing Quad Stretch', cat: 'mobility', equip: [], muscles: 'Quads, hip flexors',
    cues: ['Stand tall (hold a wall)', 'Bend knee, grab ankle behind you', 'Knees together, hips forward', 'Hold, then switch'],
    easier: 'Use a strap/band to reach your ankle', harder: '—',
    poses: [{ t: 0, rl: -5, rs: -168, ll: 2, ls: 2, ra: -30, rf: -150, la: 90, lf: 90 }, { t: 0, rl: -10, rs: -170, ll: 2, ls: 2, ra: -32, rf: -152, la: 90, lf: 92 }], speed: 4000
  }
};

const CATEGORY_LABELS = { legs: 'Legs & Glutes', upper: 'Upper Body', core: 'Core', hiit: 'HIIT', cardio: 'Cardio', mobility: 'Stretch & Mobility' };
