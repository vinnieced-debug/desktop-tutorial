/* Recipe library. Ingredients: [qty, unit, name, aisle]. Calories/protein are estimates. */
const AISLES = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery & Grains', 'Pantry', 'Frozen', 'Other'];

const RECIPES = {
  // ---------- BREAKFAST ----------
  b_parfait: { type: 'breakfast', name: 'Berry Greek Yogurt Parfait', emoji: '🫐', cal: 300, protein: 25, time: 5,
    ing: [[1, 'cup', 'nonfat plain Greek yogurt', 'Dairy & Eggs'], [0.5, 'cup', 'frozen mixed berries', 'Frozen'], [0.25, 'cup', 'low-sugar granola', 'Pantry'], [1, 'tsp', 'honey', 'Pantry']],
    steps: ['Layer yogurt, berries (thawed or frozen) and granola in a bowl or jar.', 'Drizzle with honey.'] },
  b_scramble: { type: 'breakfast', name: 'Spinach & Pepper Egg Scramble + Toast', emoji: '🍳', cal: 330, protein: 24, time: 10,
    ing: [[2, '', 'eggs', 'Dairy & Eggs'], [0.25, 'cup', 'liquid egg whites', 'Dairy & Eggs'], [1, 'cup', 'baby spinach', 'Produce'], [0.25, '', 'bell pepper', 'Produce'], [1, 'slice', 'whole-wheat bread', 'Bakery & Grains']],
    steps: ['Spray a pan with cooking spray, sauté diced pepper 2 min.', 'Add spinach until wilted.', 'Add eggs + whites, scramble until set. Salt & pepper.', 'Serve with toast.'] },
  b_oats: { type: 'breakfast', name: 'Banana Chia Overnight Oats', emoji: '🥣', cal: 350, protein: 20, time: 5,
    ing: [[0.5, 'cup', 'rolled oats', 'Pantry'], [0.5, 'cup', 'unsweetened almond milk', 'Dairy & Eggs'], [0.5, 'cup', 'nonfat plain Greek yogurt', 'Dairy & Eggs'], [1, 'tbsp', 'chia seeds', 'Pantry'], [0.5, '', 'banana', 'Produce']],
    steps: ['Stir oats, milk, yogurt and chia in a jar.', 'Refrigerate overnight.', 'Top with sliced banana and cinnamon in the morning.'] },
  b_smoothie: { type: 'breakfast', name: 'PB Banana Protein Smoothie', emoji: '🥤', cal: 320, protein: 28, time: 5,
    ing: [[1, 'scoop', 'protein powder', 'Pantry'], [1, 'cup', 'unsweetened almond milk', 'Dairy & Eggs'], [0.5, '', 'banana', 'Produce'], [1, 'cup', 'baby spinach', 'Produce'], [1, 'tbsp', 'peanut butter', 'Pantry']],
    steps: ['Blend everything with a handful of ice until smooth.', 'Tip: freeze ripe banana halves ahead of time.'] },
  b_avotoast: { type: 'breakfast', name: 'Avocado Toast with Eggs', emoji: '🥑', cal: 360, protein: 19, time: 10,
    ing: [[1, 'slice', 'whole-wheat bread', 'Bakery & Grains'], [0.25, '', 'avocado', 'Produce'], [2, '', 'eggs', 'Dairy & Eggs'], [0.5, 'cup', 'cherry tomatoes', 'Produce']],
    steps: ['Toast bread, mash avocado on top with salt, pepper, chili flakes.', 'Fry or poach eggs with cooking spray, place on toast.', 'Serve tomatoes on the side.'] },
  b_cottage: { type: 'breakfast', name: 'Cottage Cheese Fruit Bowl', emoji: '🍍', cal: 280, protein: 28, time: 3,
    ing: [[1, 'cup', 'low-fat cottage cheese', 'Dairy & Eggs'], [0.5, 'cup', 'pineapple chunks', 'Produce'], [1, 'tbsp', 'sliced almonds', 'Pantry']],
    steps: ['Top cottage cheese with pineapple and almonds.', 'A sprinkle of cinnamon is great here.'] },
  b_eggmuffin: { type: 'breakfast', name: 'Meal-Prep Egg Muffins (3)', emoji: '🧁', cal: 260, protein: 20, time: 25,
    ing: [[2, '', 'eggs', 'Dairy & Eggs'], [0.25, 'cup', 'liquid egg whites', 'Dairy & Eggs'], [0.25, '', 'bell pepper', 'Produce'], [0.5, 'cup', 'baby spinach', 'Produce'], [2, 'tbsp', 'feta cheese', 'Dairy & Eggs']],
    steps: ['Heat oven to 350°F. Spray a muffin tin.', 'Divide chopped veggies + feta into cups, pour whisked eggs over.', 'Bake 20 min. Make a batch of 12 — keeps 4 days in the fridge.'] },

  // ---------- LUNCH ----------
  l_chxsalad: { type: 'lunch', name: 'Grilled Chicken Avocado Salad', emoji: '🥗', cal: 420, protein: 38, time: 15,
    ing: [[4, 'oz', 'chicken breast', 'Meat & Seafood'], [2, 'cup', 'mixed salad greens', 'Produce'], [0.5, 'cup', 'cherry tomatoes', 'Produce'], [0.25, '', 'cucumber', 'Produce'], [0.25, '', 'avocado', 'Produce'], [2, 'tbsp', 'light balsamic vinaigrette', 'Pantry']],
    steps: ['Season chicken (salt, pepper, garlic powder) and grill or pan-cook ~6 min per side.', 'Slice and serve over greens and veggies.', 'Tip: cook 4–5 breasts on Sunday for the week.'] },
  l_wrap: { type: 'lunch', name: 'Turkey Hummus Wrap', emoji: '🌯', cal: 380, protein: 28, time: 5,
    ing: [[1, '', 'whole-wheat tortilla', 'Bakery & Grains'], [3, 'oz', 'sliced deli turkey', 'Meat & Seafood'], [2, 'tbsp', 'hummus', 'Dairy & Eggs'], [1, 'cup', 'baby spinach', 'Produce'], [0.25, '', 'cucumber', 'Produce']],
    steps: ['Spread hummus on tortilla.', 'Layer turkey, spinach and sliced cucumber.', 'Roll tight and slice in half.'] },
  l_burrito: { type: 'lunch', name: 'Chicken Burrito Bowl', emoji: '🌮', cal: 480, protein: 40, time: 15,
    ing: [[4, 'oz', 'chicken breast', 'Meat & Seafood'], [0.5, 'cup', 'cooked brown rice', 'Bakery & Grains'], [0.33, 'cup', 'black beans (canned)', 'Pantry'], [0.25, 'cup', 'frozen corn', 'Frozen'], [0.25, 'cup', 'salsa', 'Pantry'], [1, 'cup', 'romaine lettuce', 'Produce']],
    steps: ['Cook chicken with taco seasoning, slice.', 'Warm rice, beans and corn.', 'Build bowl over lettuce, top with salsa.'] },
  l_tuna: { type: 'lunch', name: 'Greek Yogurt Tuna Salad + Crackers', emoji: '🐟', cal: 380, protein: 35, time: 5,
    ing: [[1, 'can', 'tuna in water', 'Pantry'], [2, 'tbsp', 'nonfat plain Greek yogurt', 'Dairy & Eggs'], [1, 'stalk', 'celery', 'Produce'], [1, 'cup', 'romaine lettuce', 'Produce'], [10, '', 'whole-grain crackers', 'Pantry']],
    steps: ['Mix drained tuna, yogurt, diced celery, salt, pepper and a squeeze of lemon.', 'Scoop into lettuce leaves; crackers on the side.'] },
  l_quinoa: { type: 'lunch', name: 'Mediterranean Quinoa Chickpea Bowl', emoji: '🥙', cal: 450, protein: 18, time: 20,
    ing: [[0.75, 'cup', 'cooked quinoa', 'Bakery & Grains'], [0.5, 'cup', 'chickpeas (canned)', 'Pantry'], [0.25, '', 'cucumber', 'Produce'], [0.5, 'cup', 'cherry tomatoes', 'Produce'], [2, 'tbsp', 'feta cheese', 'Dairy & Eggs'], [1, 'tsp', 'olive oil', 'Pantry'], [0.5, '', 'lemon', 'Produce']],
    steps: ['Combine quinoa, rinsed chickpeas, chopped veggies and feta.', 'Dress with olive oil, lemon juice, salt, pepper, oregano.', 'Keeps 3–4 days — great for meal prep.'] },
  l_lentil: { type: 'lunch', name: 'Hearty Lentil Veggie Soup', emoji: '🍲', cal: 350, protein: 20, time: 40,
    ing: [[0.33, 'cup', 'dry lentils', 'Pantry'], [0.5, '', 'carrot', 'Produce'], [0.5, 'stalk', 'celery', 'Produce'], [0.25, '', 'yellow onion', 'Produce'], [1, 'cup', 'low-sodium broth', 'Pantry'], [0.5, 'cup', 'diced tomatoes (canned)', 'Pantry']],
    steps: ['Sauté diced onion, carrot and celery 5 min.', 'Add lentils, broth, tomatoes, cumin, salt.', 'Simmer 25–30 min. Make 4+ servings and freeze extras.'] },
  l_caesar: { type: 'lunch', name: 'Chicken Caesar Wrap', emoji: '🥬', cal: 450, protein: 38, time: 10,
    ing: [[1, '', 'whole-wheat tortilla', 'Bakery & Grains'], [4, 'oz', 'chicken breast', 'Meat & Seafood'], [1.5, 'cup', 'romaine lettuce', 'Produce'], [2, 'tbsp', 'light Caesar dressing', 'Pantry'], [1, 'tbsp', 'grated parmesan', 'Dairy & Eggs']],
    steps: ['Toss chopped romaine with dressing and parmesan.', 'Add sliced cooked chicken, wrap tightly.'] },

  // ---------- DINNER ----------
  d_salmon: { type: 'dinner', name: 'Sheet-Pan Salmon, Broccoli & Sweet Potato', emoji: '🍣', cal: 520, protein: 36, time: 30,
    ing: [[5, 'oz', 'salmon fillet', 'Meat & Seafood'], [1.5, 'cup', 'broccoli florets', 'Produce'], [1, '', 'small sweet potato', 'Produce'], [1, 'tsp', 'olive oil', 'Pantry'], [0.5, '', 'lemon', 'Produce']],
    steps: ['Heat oven to 425°F. Cube sweet potato, toss with half the oil, roast 10 min.', 'Add broccoli and salmon to the pan, brush with remaining oil, season.', 'Roast 12–15 min more. Squeeze lemon over.'] },
  d_turkeytaco: { type: 'dinner', name: 'Turkey Taco Lettuce Wraps', emoji: '🌮', cal: 400, protein: 34, time: 20,
    ing: [[4, 'oz', 'lean ground turkey (93%)', 'Meat & Seafood'], [1, 'tbsp', 'taco seasoning', 'Pantry'], [1, 'cup', 'romaine lettuce', 'Produce'], [0.25, 'cup', 'salsa', 'Pantry'], [2, 'tbsp', 'nonfat plain Greek yogurt', 'Dairy & Eggs'], [2, 'tbsp', 'shredded cheddar', 'Dairy & Eggs']],
    steps: ['Brown turkey, add seasoning + 2 tbsp water.', 'Spoon into lettuce leaves.', 'Top with salsa, yogurt (tastes like sour cream) and cheese.'] },
  d_stirfry: { type: 'dinner', name: 'Chicken Veggie Stir-Fry', emoji: '🥡', cal: 470, protein: 38, time: 20,
    ing: [[4, 'oz', 'chicken breast', 'Meat & Seafood'], [2, 'cup', 'frozen stir-fry vegetables', 'Frozen'], [1, 'tbsp', 'low-sodium soy sauce', 'Pantry'], [0.5, 'cup', 'cooked brown rice', 'Bakery & Grains'], [1, 'tsp', 'sesame oil', 'Pantry']],
    steps: ['Cook sliced chicken in sesame oil 5–6 min.', 'Add frozen veggies, cook 5 min.', 'Add soy sauce + garlic/ginger. Serve over rice.'] },
  d_meatballs: { type: 'dinner', name: 'Turkey Meatballs & Zucchini Noodles', emoji: '🍝', cal: 420, protein: 35, time: 30,
    ing: [[4, 'oz', 'lean ground turkey (93%)', 'Meat & Seafood'], [2, '', 'zucchini', 'Produce'], [0.5, 'cup', 'marinara sauce', 'Pantry'], [1, 'tbsp', 'grated parmesan', 'Dairy & Eggs'], [2, 'tbsp', 'breadcrumbs', 'Pantry']],
    steps: ['Mix turkey, breadcrumbs, Italian seasoning; roll into 6 balls.', 'Bake at 400°F for 18 min.', 'Spiralize zucchini (or buy pre-spiralized), sauté 2 min.', 'Top with warm marinara, meatballs, parmesan.'] },
  d_lemonchx: { type: 'dinner', name: 'Lemon Herb Chicken, Green Beans & Quinoa', emoji: '🍋', cal: 480, protein: 42, time: 30,
    ing: [[5, 'oz', 'chicken breast', 'Meat & Seafood'], [1, 'cup', 'green beans', 'Produce'], [0.5, 'cup', 'cooked quinoa', 'Bakery & Grains'], [1, 'tsp', 'olive oil', 'Pantry'], [0.5, '', 'lemon', 'Produce']],
    steps: ['Marinate chicken in lemon juice, garlic, oregano 10+ min.', 'Bake at 400°F 20–22 min (or grill).', 'Roast or steam green beans. Serve with quinoa.'] },
  d_shrimptaco: { type: 'dinner', name: 'Shrimp Tacos with Crunchy Slaw', emoji: '🦐', cal: 430, protein: 33, time: 15,
    ing: [[5, 'oz', 'shrimp (peeled)', 'Meat & Seafood'], [2, '', 'corn tortillas', 'Bakery & Grains'], [1, 'cup', 'coleslaw mix', 'Produce'], [0.25, '', 'avocado', 'Produce'], [0.5, '', 'lime', 'Produce'], [2, 'tbsp', 'nonfat plain Greek yogurt', 'Dairy & Eggs']],
    steps: ['Season shrimp with chili powder & garlic, cook 2 min per side.', 'Toss slaw with yogurt + lime juice.', 'Warm tortillas, fill with shrimp, slaw and avocado.'] },
  d_chili: { type: 'dinner', name: 'Lean Beef & Bean Chili', emoji: '🌶️', cal: 450, protein: 36, time: 40,
    ing: [[4, 'oz', 'lean ground beef (93%)', 'Meat & Seafood'], [0.5, 'cup', 'kidney beans (canned)', 'Pantry'], [0.5, 'cup', 'diced tomatoes (canned)', 'Pantry'], [0.25, '', 'yellow onion', 'Produce'], [0.5, '', 'bell pepper', 'Produce'], [1, 'tbsp', 'chili powder', 'Pantry']],
    steps: ['Brown beef with onion and pepper.', 'Add beans, tomatoes, chili powder, cumin, salt.', 'Simmer 25 min. Make 4 servings — freezes great.'] },
  d_cod: { type: 'dinner', name: 'Garlic Baked Cod, Asparagus & Rice', emoji: '🐠', cal: 400, protein: 34, time: 25,
    ing: [[5, 'oz', 'cod fillet', 'Meat & Seafood'], [1, 'cup', 'asparagus', 'Produce'], [0.5, 'cup', 'cooked brown rice', 'Bakery & Grains'], [1, 'tsp', 'olive oil', 'Pantry'], [0.5, '', 'lemon', 'Produce']],
    steps: ['Heat oven to 400°F. Put cod + asparagus on a pan.', 'Drizzle oil, add garlic, salt, pepper, lemon slices.', 'Bake 12–15 min. Serve with rice.'] },

  // ---------- SNACKS ----------
  s_applepb: { type: 'snack', name: 'Apple + Peanut Butter', emoji: '🍎', cal: 190, protein: 4, time: 2,
    ing: [[1, '', 'apple', 'Produce'], [1, 'tbsp', 'peanut butter', 'Pantry']], steps: ['Slice apple, dip in peanut butter.'] },
  s_hummus: { type: 'snack', name: 'Hummus + Baby Carrots', emoji: '🥕', cal: 150, protein: 4, time: 2,
    ing: [[3, 'tbsp', 'hummus', 'Dairy & Eggs'], [1, 'cup', 'baby carrots', 'Produce']], steps: ['Dip and enjoy.'] },
  s_cheese: { type: 'snack', name: 'String Cheese + Almonds', emoji: '🧀', cal: 170, protein: 10, time: 1,
    ing: [[1, '', 'light string cheese', 'Dairy & Eggs'], [12, '', 'almonds', 'Pantry']], steps: ['Grab and go.'] },
  s_yogurt: { type: 'snack', name: 'Greek Yogurt + Cinnamon', emoji: '🥄', cal: 120, protein: 17, time: 1,
    ing: [[0.75, 'cup', 'nonfat plain Greek yogurt', 'Dairy & Eggs'], [0.25, 'cup', 'frozen mixed berries', 'Frozen']], steps: ['Top yogurt with berries and cinnamon.'] },
  s_eggs: { type: 'snack', name: 'Two Hard-Boiled Eggs', emoji: '🥚', cal: 140, protein: 12, time: 12,
    ing: [[2, '', 'eggs', 'Dairy & Eggs']], steps: ['Boil 10 min, cool in ice water. Make a dozen at a time.'] },
  s_shake: { type: 'snack', name: 'Protein Shake', emoji: '💪', cal: 130, protein: 24, time: 1,
    ing: [[1, 'scoop', 'protein powder', 'Pantry']], steps: ['Shake with water or almond milk. Great after a workout.'] },
  s_ricecake: { type: 'snack', name: 'Rice Cake, PB & Banana', emoji: '🍌', cal: 200, protein: 5, time: 2,
    ing: [[1, '', 'rice cake', 'Pantry'], [1, 'tbsp', 'peanut butter', 'Pantry'], [0.5, '', 'banana', 'Produce']], steps: ['Spread PB on rice cake, top with banana slices.'] }
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

/* Build a default 6-week plan. Each week reuses a small set of recipes so
 * groceries overlap and leftovers/batch-cooking work. */
function buildDefaultPlan() {
  const ids = t => Object.keys(RECIPES).filter(k => RECIPES[k].type === t);
  const B = ids('breakfast'), Lu = ids('lunch'), Di = ids('dinner'), S = ids('snack');
  const plan = [];
  for (let w = 0; w < 6; w++) {
    const b = [B[(w * 2) % B.length], B[(w * 2 + 1) % B.length], B[(w * 2 + 2) % B.length]];
    const l = [Lu[(w * 2) % Lu.length], Lu[(w * 2 + 1) % Lu.length], Lu[(w * 2 + 3) % Lu.length]];
    const d = [Di[(w * 3) % Di.length], Di[(w * 3 + 1) % Di.length], Di[(w * 3 + 2) % Di.length], Di[(w * 3 + 4) % Di.length]];
    const days = [];
    const dPat = [0, 1, 2, 0, 3, 1, 2], bPat = [0, 1, 0, 1, 2, 2, 1], lPat = [0, 0, 1, 1, 0, 2, 2];
    for (let i = 0; i < 7; i++) {
      days.push({ breakfast: b[bPat[i]], lunch: l[lPat[i]], dinner: d[dPat[i]], snack: S[(w + i) % S.length] });
    }
    plan.push(days);
  }
  return plan;
}
