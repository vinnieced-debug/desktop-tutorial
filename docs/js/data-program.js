/* Workout split + equipment. Phase 1 = weeks 1-2, Phase 2 = weeks 3-4, Phase 3 = weeks 5-6. */
const DAY_TYPES = {
  legs:   { label: 'Leg Day', short: 'Legs', color: '#e8436b', icon: '🍑', blurb: 'Glutes, quads & hamstrings. Strength burns calories long after you finish.' },
  hiit:   { label: 'HIIT', short: 'HIIT', color: '#ff7a1a', icon: '🔥', blurb: 'Short, intense intervals. Go hard during work, recover during rest.' },
  full:   { label: 'Full Body', short: 'Full', color: '#7b5cff', icon: '💪', blurb: 'Upper body, legs and core in one session.' },
  cardio: { label: 'Cardio', short: 'Cardio', color: '#1f9bf0', icon: '❤️', blurb: 'Steady, moderate effort. You should be able to talk, but not sing.' },
  rest:   { label: 'Rest Day', short: 'Rest', color: '#21a67a', icon: '🧘', blurb: 'Recovery is when your body gets stronger. Stretch and take an easy walk.' }
};

// Default weekly split, Monday first. Editable in Settings.
const DEFAULT_SCHEDULE = ['legs', 'hiit', 'full', 'cardio', 'full', 'hiit', 'rest'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* Block kinds:
 *  strength: { ex, reps }            -> sets/reps scale with phase
 *  hold:     { ex, secs }            -> timed set, scales with phase
 *  interval: { ex }                  -> HIIT work/rest timing by phase
 *  timed:    { ex, secs }            -> continuous cardio/stretch, scales with phase
 */
const WORKOUTS = {
  legs: {
    warmup: [{ ex: 'march', secs: 120 }, { ex: 'squat', secs: 45 }],
    main: [
      { kind: 'strength', ex: 'goblet_squat', reps: 12 },
      { kind: 'strength', ex: 'reverse_lunge', reps: 10, note: 'per leg' },
      { kind: 'strength', ex: 'rdl', reps: 12 },
      { kind: 'strength', ex: 'glute_bridge', reps: 15 },
      { kind: 'strength', ex: 'lateral_walk', reps: 10, note: 'steps each way' },
      { kind: 'strength', ex: 'calf_raise', reps: 15 },
      { kind: 'hold', ex: 'wall_sit', secs: 30 }
    ],
    cooldown: [{ ex: 'quad_stretch', secs: 40 }, { ex: 'hip_flexor', secs: 40 }, { ex: 'ham_stretch', secs: 45 }]
  },
  hiit: {
    warmup: [{ ex: 'march', secs: 90 }, { ex: 'step_touch', secs: 60 }],
    main: [
      { kind: 'interval', ex: 'jumping_jack' },
      { kind: 'interval', ex: 'squat_jump' },
      { kind: 'interval', ex: 'mountain_climber' },
      { kind: 'interval', ex: 'high_knees' },
      { kind: 'interval', ex: 'skater' },
      { kind: 'interval', ex: 'burpee' }
    ],
    cooldown: [{ ex: 'march', secs: 60 }, { ex: 'quad_stretch', secs: 40 }, { ex: 'childs_pose', secs: 45 }]
  },
  full: {
    warmup: [{ ex: 'march', secs: 90 }, { ex: 'pull_apart', secs: 45 }, { ex: 'squat', secs: 45 }],
    main: [
      { kind: 'strength', ex: 'thruster', reps: 10 },
      { kind: 'strength', ex: 'db_row', reps: 12 },
      { kind: 'strength', ex: 'pushup', reps: 8, note: 'knees down is fine' },
      { kind: 'strength', ex: 'kb_swing', reps: 15 },
      { kind: 'strength', ex: 'shoulder_press', reps: 10 },
      { kind: 'strength', ex: 'bicep_curl', reps: 12 },
      { kind: 'strength', ex: 'dead_bug', reps: 8, note: 'per side' },
      { kind: 'hold', ex: 'plank', secs: 30 }
    ],
    cooldown: [{ ex: 'cat_cow', secs: 45 }, { ex: 'sphinx', secs: 40 }, { ex: 'childs_pose', secs: 45 }]
  },
  cardio: {
    warmup: [{ ex: 'march', secs: 180 }],
    main: [
      { kind: 'timed', ex: 'step_touch', secs: 180 },
      { kind: 'timed', ex: 'boxing', secs: 180 },
      { kind: 'timed', ex: 'jump_rope', secs: 120 },
      { kind: 'timed', ex: 'march', secs: 180 },
      { kind: 'timed', ex: 'boxing', secs: 180 },
      { kind: 'timed', ex: 'step_touch', secs: 180 }
    ],
    cooldown: [{ ex: 'march', secs: 60 }, { ex: 'ham_stretch', secs: 45 }, { ex: 'quad_stretch', secs: 40 }],
    alt: 'Swap for a 30–45 min brisk outdoor walk, bike ride, or a YouTube walking workout any time.'
  },
  rest: {
    warmup: [],
    main: [
      { kind: 'timed', ex: 'cat_cow', secs: 60 },
      { kind: 'timed', ex: 'childs_pose', secs: 60 },
      { kind: 'timed', ex: 'sphinx', secs: 45 },
      { kind: 'timed', ex: 'hip_flexor', secs: 45 },
      { kind: 'timed', ex: 'ham_stretch', secs: 60 },
      { kind: 'timed', ex: 'quad_stretch', secs: 45 }
    ],
    cooldown: [],
    alt: 'Optional: a relaxed 20–30 minute walk. No intense training today.'
  }
};

const PHASES = {
  1: { name: 'Foundation', sets: 2, repAdd: 0, holdMul: 1, timedMul: 1, work: 30, rest: 30, rounds: 2, setRest: 60,
       tip: 'Learn the moves. Pick weights where the last 2 reps feel challenging but your form stays clean.' },
  2: { name: 'Build', sets: 3, repAdd: 0, holdMul: 1.5, timedMul: 1.25, work: 40, rest: 20, rounds: 3, setRest: 50,
       tip: 'One more set and shorter rests. If every rep feels easy, go up in weight.' },
  3: { name: 'Push', sets: 3, repAdd: 2, holdMul: 2, timedMul: 1.5, work: 45, rest: 15, rounds: 3, setRest: 45,
       tip: 'More reps, short rests, heavier weights where you can. Finish strong!' }
};

const EQUIPMENT = [
  { id: 'mat', name: 'Exercise / Yoga Mat (6mm+)', need: 'Must-have', price: '$20–35', icon: 'mat',
    why: 'Cushions knees, back and wrists for floor work: bridges, planks, push-ups, stretches.', q: 'thick exercise yoga mat 6mm' },
  { id: 'dumbbells', name: 'Dumbbells — 3 pairs (5, 10, 15 lb)', need: 'Must-have', price: '$45–90', icon: 'db',
    why: 'Main tool for leg & full-body days. Lighter for shoulders/arms, heavier for squats/deadlifts/rows. Adjustable dumbbells ($100–200) save space.', q: 'neoprene dumbbell set 5 10 15 lb' },
  { id: 'loopbands', name: 'Loop Resistance Bands (set of 5)', need: 'Must-have', price: '$10–20', icon: 'loop',
    why: 'Short loops around the thighs/ankles for lateral walks, bridges and donkey kicks — great for glutes. Fabric "booty bands" roll up less.', q: 'fabric booty resistance loop bands set' },
  { id: 'longbands', name: 'Long Resistance Bands with Handles', need: 'Recommended', price: '$20–30', icon: 'tube',
    why: 'Pull-aparts, rows, curls and presses. Great for travel or when dumbbells are too heavy.', q: 'resistance tube bands with handles door anchor' },
  { id: 'kettlebell', name: 'Kettlebell (15–20 lb)', need: 'Recommended', price: '$25–45', icon: 'kb',
    why: 'Swings and goblet squats. One dumbbell held by the end works as a substitute to start.', q: 'kettlebell 15 lb vinyl' },
  { id: 'rope', name: 'Jump Rope (adjustable)', need: 'Recommended', price: '$8–15', icon: 'rope',
    why: 'High-calorie cardio in a small space. Doing the motion without a rope also works.', q: 'adjustable jump rope' },
  { id: 'shoes', name: 'Supportive Training Shoes', need: 'Must-have', price: '$60–120', icon: 'shoe',
    why: 'Protects knees and ankles during jumps and cardio. Cross-trainers work better than running shoes for lifting.', q: 'women cross training shoes' },
  { id: 'bottle', name: 'Large Water Bottle (32 oz+)', need: 'Must-have', price: '$10–25', icon: 'bottle',
    why: 'Aim for ~2–3 bottles a day. Hydration helps hunger, energy and recovery.', q: '32 oz water bottle with time markings' },
  { id: 'foodscale', name: 'Digital Food Scale', need: 'Recommended', price: '$10–15', icon: 'scale2',
    why: 'Honestly the biggest weight-loss tool on this list. Portions are easy to underestimate by eye.', q: 'digital kitchen food scale grams ounces' },
  { id: 'scale', name: 'Bathroom Scale + Measuring Tape', need: 'Recommended', price: '$20–35', icon: 'scale',
    why: 'Weigh in 1x/week, same day & time. Measure waist/hips monthly — the tape shows progress the scale sometimes hides.', q: 'digital bathroom scale and body measuring tape' },
  { id: 'roller', name: 'Foam Roller', need: 'Nice-to-have', price: '$15–25', icon: 'roller',
    why: 'Eases sore muscles on rest days.', q: 'foam roller medium density 18 inch' }
];
