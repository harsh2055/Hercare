// server/seeders/seedDietPlans.js
// Run with: node server/seeders/seedDietPlans.js
// Or import and call seedDietPlans() from server.js on startup

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const DietPlan = require('../models/DietPlan');

const PLANS = [

  // ══════════════════════════════════════════════════════
  // MENSTRUAL PHASE
  // ══════════════════════════════════════════════════════
  {
    title: 'Menstrual Phase — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: 'menstrual',
    trimester: null,
    description: 'Iron-rich, anti-inflammatory foods to ease cramps and restore energy during menstruation.',
    meals: {
      Breakfast: ['Warm oats with flaxseeds, banana, and honey', 'Herbal ginger-turmeric tea'],
      'Mid-Morning Snack': ['Dates (3–4) with a small handful of almonds', 'Warm water with lemon'],
      Lunch: ['Spinach dal (lentil soup) with brown rice', 'Cucumber-tomato raita', 'Beetroot salad with lemon'],
      'Evening Snack': ['Roasted sesame (til) chikki or a banana', 'Chamomile or peppermint tea'],
      Dinner: ['Methi (fenugreek) roti with paneer bhurji', 'Sautéed broccoli with garlic', 'Warm turmeric milk'],
    },
    nutrients: new Map([
      ['Iron', '18–20 mg (spinach, dal, sesame)'],
      ['Magnesium', '320 mg (oats, almonds, banana)'],
      ['Omega-3', 'From flaxseeds — reduces inflammation'],
      ['Vitamin C', 'Lemon, tomato — aids iron absorption'],
      ['Calcium', 'Paneer, milk — muscle relaxation'],
    ]),
    tips: [
      'Eat warm, cooked foods — avoid raw salads and cold drinks during menstruation.',
      'Include iron-rich foods at every meal; pair with vitamin C to boost absorption.',
      'Avoid caffeine and salty foods to reduce bloating and cramps.',
      'Stay hydrated with herbal teas like ginger, chamomile, or peppermint.',
      'Dark chocolate (70%+) in small amounts can help with cravings and mood.',
    ],
  },
  {
    title: 'Menstrual Phase — Vegan',
    dietaryPreference: 'vegan',
    phase: 'menstrual',
    trimester: null,
    description: 'Plant-based iron and anti-inflammatory support for a comfortable period.',
    meals: {
      Breakfast: ['Warm quinoa porridge with chia seeds, banana, and jaggery', 'Ginger-lemon herbal tea'],
      'Mid-Morning Snack': ['Dates (3–4) and a handful of walnuts', 'Coconut water or warm water'],
      Lunch: ['Rajma (kidney bean) curry with brown rice', 'Roasted pumpkin seeds on a green salad', 'Beetroot juice'],
      'Evening Snack': ['Roasted makhana (foxnuts) with black pepper', 'Peppermint or chamomile tea'],
      Dinner: ['Tofu stir-fry with kale, garlic, and sesame oil', 'Millet roti', 'Warm golden milk (oat milk + turmeric)'],
    },
    nutrients: new Map([
      ['Iron', '18 mg (rajma, spinach, sesame, pumpkin seeds)'],
      ['Magnesium', '320 mg (quinoa, chia, walnuts)'],
      ['Omega-3', 'Chia seeds, walnuts — anti-inflammatory'],
      ['Vitamin C', 'Lemon, kale — enhances iron uptake'],
      ['Zinc', 'Pumpkin seeds — supports hormone balance'],
    ]),
    tips: [
      'Soak rajma and lentils overnight to improve iron bioavailability.',
      'Add vitamin C-rich foods alongside every iron source.',
      'Avoid tea and coffee within an hour of meals — they block iron absorption.',
      'Warm cooked foods are easier to digest during menstruation.',
      'Pumpkin seeds are a great vegan source of zinc and iron.',
    ],
  },
  {
    title: 'Menstrual Phase — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: 'menstrual',
    trimester: null,
    description: 'Haem iron from lean meats combined with anti-inflammatory foods to replenish blood loss.',
    meals: {
      Breakfast: ['Scrambled eggs with spinach and whole-grain toast', 'Orange juice or ginger tea'],
      'Mid-Morning Snack': ['Boiled egg or a handful of mixed nuts', 'Herbal tea'],
      Lunch: ['Chicken or mutton bone broth soup', 'Brown rice with chicken curry (light gravy)', 'Cucumber and tomato salad'],
      'Evening Snack': ['Tuna or sardine on whole-grain crackers', 'Lemon water'],
      Dinner: ['Grilled salmon with steamed broccoli and garlic', 'Quinoa or millet', 'Warm turmeric milk'],
    },
    nutrients: new Map([
      ['Haem Iron', '20+ mg (chicken, mutton, salmon, eggs)'],
      ['Omega-3', 'Salmon, sardines — powerful anti-inflammatory'],
      ['Vitamin B12', 'Eggs, meat — energy and nerve support'],
      ['Magnesium', '320 mg (nuts, quinoa)'],
      ['Vitamin D', 'Salmon, eggs — mood and bone support'],
    ]),
    tips: [
      'Bone broth is excellent for replenishing minerals lost during menstruation.',
      'Fatty fish like salmon provide omega-3s that directly reduce period cramp severity.',
      'Avoid processed meats and fried food — they increase inflammation.',
      'Pair meat with vitamin C-rich vegetables to maximise iron absorption.',
      'Stay well-hydrated with water and herbal teas.',
    ],
  },
  {
    title: 'Menstrual Phase — Eggetarian',
    dietaryPreference: 'eggetarian',
    phase: 'menstrual',
    trimester: null,
    description: 'Eggs provide haem iron and B12 while vegetarian bases keep inflammation low.',
    meals: {
      Breakfast: ['Poached eggs on spinach with whole-grain toast', 'Ginger-lemon tea'],
      'Mid-Morning Snack': ['Hard-boiled egg and a handful of almonds', 'Warm water'],
      Lunch: ['Egg curry with brown rice', 'Spinach dal', 'Tomato-cucumber salad with lemon'],
      'Evening Snack': ['Dates and sesame ladoo', 'Chamomile tea'],
      Dinner: ['Egg bhurji with methi (fenugreek) paratha', 'Sautéed greens', 'Warm turmeric milk'],
    },
    nutrients: new Map([
      ['Iron', '18 mg (eggs, spinach, sesame)'],
      ['Vitamin B12', 'Eggs — energy and nerve health'],
      ['Magnesium', '320 mg (almonds, oats)'],
      ['Choline', 'Eggs — anti-inflammatory support'],
      ['Omega-3', 'Egg yolks (enriched) — inflammation control'],
    ]),
    tips: [
      'Eggs are one of the most bioavailable sources of iron and B12.',
      'Include leafy greens at every meal for additional iron.',
      'Avoid coffee/tea with meals — they inhibit iron absorption.',
      'Warm meals are easier on the digestive system during menstruation.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // FOLLICULAR PHASE
  // ══════════════════════════════════════════════════════
  {
    title: 'Follicular Phase — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: 'follicular',
    trimester: null,
    description: 'Light, fresh, energising foods to support rising oestrogen and growing follicles.',
    meals: {
      Breakfast: ['Greek yogurt parfait with berries, granola, and flaxseeds', 'Green smoothie (spinach, banana, almond milk)'],
      'Mid-Morning Snack': ['Apple slices with almond butter', 'Green tea'],
      Lunch: ['Moong dal with jeera rice', 'Steamed broccoli and carrots', 'Fresh sprout salad with lemon'],
      'Evening Snack': ['Handful of mixed seeds (pumpkin, sunflower) and dried cranberries', 'Lemon water'],
      Dinner: ['Paneer tikka with roasted vegetables', 'Whole wheat roti', 'Light vegetable soup'],
    },
    nutrients: new Map([
      ['Folate', 'Leafy greens, sprouts — supports egg maturation'],
      ['Zinc', 'Pumpkin seeds — follicle development'],
      ['Vitamin E', 'Sunflower seeds, almonds — oestrogen support'],
      ['Probiotics', 'Yogurt — gut and hormone health'],
      ['Fibre', 'Veggies, dal — oestrogen detox via gut'],
    ]),
    tips: [
      'This is your highest-energy phase — great time for new foods and varied meals.',
      'Cruciferous vegetables (broccoli, cauliflower) help metabolise excess oestrogen.',
      'Fermented foods like yogurt support a healthy gut microbiome, which regulates hormones.',
      'Stay hydrated — oestrogen rises and so does metabolic activity.',
      'Flaxseeds contain lignans that gently support oestrogen balance.',
    ],
  },
  {
    title: 'Follicular Phase — Vegan',
    dietaryPreference: 'vegan',
    phase: 'follicular',
    trimester: null,
    description: 'Plant-powered energy to ride the rising-oestrogen wave of the follicular phase.',
    meals: {
      Breakfast: ['Acai or mixed berry smoothie bowl with hemp seeds and granola', 'Green tea'],
      'Mid-Morning Snack': ['Rice cakes with avocado and pomegranate seeds', 'Lemon water'],
      Lunch: ['Chickpea and roasted vegetable bowl with tahini dressing', 'Quinoa tabbouleh', 'Fresh sprout salad'],
      'Evening Snack': ['Edamame with sea salt', 'Coconut water'],
      Dinner: ['Tofu and vegetable stir-fry with sesame-ginger sauce', 'Brown rice', 'Miso soup'],
    },
    nutrients: new Map([
      ['Folate', 'Chickpeas, edamame, leafy greens'],
      ['Zinc', 'Hemp seeds, pumpkin seeds — follicle support'],
      ['Vitamin E', 'Avocado, sunflower seeds'],
      ['Phytoestrogens', 'Tofu, edamame — gentle oestrogen support'],
      ['Probiotics', 'Miso, kimchi — gut-hormone axis'],
    ]),
    tips: [
      'This phase welcomes lighter, raw, and fresh foods well.',
      'Phytoestrogens from soy are beneficial in moderate amounts during this phase.',
      'Miso and fermented foods are great vegan probiotic sources.',
      'Avocado provides healthy fats needed for hormone production.',
    ],
  },
  {
    title: 'Follicular Phase — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: 'follicular',
    trimester: null,
    description: 'Lean protein and fresh produce to build energy and support follicle growth.',
    meals: {
      Breakfast: ['Egg white omelette with spinach, mushrooms, and whole-grain toast', 'Fresh orange juice'],
      'Mid-Morning Snack': ['Greek yogurt with berries and chia seeds', 'Green tea'],
      Lunch: ['Grilled chicken breast with quinoa and roasted vegetables', 'Mixed green salad with lemon vinaigrette'],
      'Evening Snack': ['Tuna salad on cucumber rounds', 'Sparkling water with lemon'],
      Dinner: ['Baked salmon with steamed asparagus and sweet potato', 'Light chicken broth soup'],
    },
    nutrients: new Map([
      ['Lean Protein', 'Chicken, eggs — muscle and energy support'],
      ['Omega-3', 'Salmon — supports follicle development'],
      ['Folate', 'Asparagus, spinach — crucial for egg quality'],
      ['Selenium', 'Eggs, fish — thyroid and hormone health'],
      ['B Vitamins', 'Chicken, salmon — energy metabolism'],
    ]),
    tips: [
      'Your energy is naturally rising — match it with protein-rich meals.',
      'Asparagus is one of the best folate sources and perfect for this phase.',
      'Light cooking methods (grilling, steaming, baking) preserve nutrients best.',
      'This is a great time to introduce new healthy recipes.',
    ],
  },
  {
    title: 'Follicular Phase — Eggetarian',
    dietaryPreference: 'eggetarian',
    phase: 'follicular',
    trimester: null,
    description: 'Eggs and fresh plant foods to power up the follicular energy surge.',
    meals: {
      Breakfast: ['Veggie-loaded omelette with whole-grain toast', 'Fresh fruit smoothie'],
      'Mid-Morning Snack': ['Hard-boiled egg and a handful of mixed nuts', 'Green tea'],
      Lunch: ['Egg and chickpea salad bowl with tahini', 'Brown rice', 'Roasted broccoli'],
      'Evening Snack': ['Yogurt with granola and berries', 'Lemon water'],
      Dinner: ['Shakshuka (eggs poached in spiced tomato sauce)', 'Whole-grain pita', 'Side salad'],
    },
    nutrients: new Map([
      ['Complete Protein', 'Eggs — all essential amino acids'],
      ['Folate', 'Leafy greens, chickpeas'],
      ['Choline', 'Eggs — brain and hormone function'],
      ['Zinc', 'Eggs, nuts — follicle support'],
      ['Vitamin D', 'Eggs — mood and immune health'],
    ]),
    tips: [
      'Eggs are especially beneficial in the follicular phase for choline and B12.',
      'Shakshuka is a great one-pan meal packed with lycopene from tomatoes.',
      'Fermented dairy like yogurt supports oestrogen metabolism.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // OVULATION PHASE
  // ══════════════════════════════════════════════════════
  {
    title: 'Ovulation Phase — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: 'ovulation',
    trimester: null,
    description: 'Anti-inflammatory, antioxidant-rich foods to support peak oestrogen and successful ovulation.',
    meals: {
      Breakfast: ['Berry and spinach smoothie with flaxseeds and almond milk', 'Overnight chia pudding'],
      'Mid-Morning Snack': ['Fresh fruit salad (berries, kiwi, pomegranate)', 'Green tea'],
      Lunch: ['Quinoa salad with roasted peppers, chickpeas, feta, and lemon-herb dressing', 'Tomato soup'],
      'Evening Snack': ['Carrots and hummus', 'Coconut water'],
      Dinner: ['Palak (spinach) paneer with whole wheat roti', 'Steamed asparagus with lemon', 'Light lentil soup'],
    },
    nutrients: new Map([
      ['Antioxidants', 'Berries, peppers — protect egg quality'],
      ['Zinc', 'Chickpeas, pumpkin seeds — triggers ovulation'],
      ['Vitamin C', 'Kiwi, berries — supports LH surge'],
      ['Fibre', 'Quinoa, veggies — oestrogen metabolism'],
      ['Calcium', 'Paneer, fortified milk — cellular signalling'],
    ]),
    tips: [
      'Peak energy phase — your body needs anti-inflammatory, colourful foods.',
      'Berries and leafy greens are loaded with antioxidants that protect egg quality.',
      'Zinc is critical for triggering the LH surge that causes ovulation.',
      'Avoid alcohol and processed sugar — they can disrupt the LH surge.',
      'This is the best time to enjoy raw, fresh salads.',
    ],
  },
  {
    title: 'Ovulation Phase — Vegan',
    dietaryPreference: 'vegan',
    phase: 'ovulation',
    trimester: null,
    description: 'Plant-based antioxidants and zinc to support the LH surge and ovulation.',
    meals: {
      Breakfast: ['Rainbow fruit bowl with dragon fruit, mango, berries, and hemp seeds', 'Matcha latte (oat milk)'],
      'Mid-Morning Snack': ['Edamame and cherry tomatoes', 'Coconut water'],
      Lunch: ['Buddha bowl: brown rice, roasted chickpeas, avocado, cucumber, tahini', 'Gazpacho'],
      'Evening Snack': ['Dark chocolate (70%+) and pumpkin seeds', 'Herbal tea'],
      Dinner: ['Red lentil dahl with coconut milk', 'Steamed broccoli and peppers', 'Millet roti'],
    },
    nutrients: new Map([
      ['Zinc', 'Pumpkin seeds, lentils, edamame — triggers ovulation'],
      ['Antioxidants', 'Colourful fruits, dark chocolate'],
      ['Vitamin C', 'Bell peppers, kiwi — supports LH surge'],
      ['Healthy Fats', 'Avocado, coconut — hormone precursors'],
      ['Iron', 'Lentils — replenish for upcoming period'],
    ]),
    tips: [
      'Eat the rainbow — more colours means more antioxidants.',
      'Pumpkin seeds are the best vegan zinc source for ovulation support.',
      'Avocado provides the healthy fats your body needs for hormone production.',
      'Dark chocolate (in moderation) is a mood-boosting antioxidant treat.',
    ],
  },
  {
    title: 'Ovulation Phase — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: 'ovulation',
    trimester: null,
    description: 'Lean protein, omega-3, and antioxidants to support peak fertility.',
    meals: {
      Breakfast: ['Smoked salmon and avocado on whole-grain toast', 'Fresh berry smoothie'],
      'Mid-Morning Snack': ['Greek yogurt with kiwi and flaxseeds', 'Green tea'],
      Lunch: ['Grilled chicken with roasted vegetable and quinoa bowl', 'Tomato and basil salad'],
      'Evening Snack': ['Oysters or sardines on crackers (high zinc)', 'Lemon water'],
      Dinner: ['Baked sea bass with lemon, capers, and steamed asparagus', 'Sweet potato', 'Light clear soup'],
    },
    nutrients: new Map([
      ['Zinc', 'Oysters, beef, chicken — highest zinc foods for ovulation'],
      ['Omega-3', 'Salmon, sea bass — anti-inflammatory, egg quality'],
      ['Antioxidants', 'Berries, tomatoes, asparagus'],
      ['Complete Protein', 'All animal sources — tissue repair and hormone synthesis'],
      ['Selenium', 'Fish, eggs — thyroid and LH surge support'],
    ]),
    tips: [
      'Oysters have the highest zinc content of any food — great during ovulation.',
      'Omega-3 fatty acids from oily fish directly support egg quality.',
      'Keep meals light and fresh — your digestion is optimal now.',
      'Avoid alcohol — it disrupts the hormonal signalling needed for ovulation.',
    ],
  },
  {
    title: 'Ovulation Phase — Eggetarian',
    dietaryPreference: 'eggetarian',
    phase: 'ovulation',
    trimester: null,
    description: 'Eggs plus antioxidant-rich plants to power peak ovulation.',
    meals: {
      Breakfast: ['Poached eggs with smashed avocado and tomato on rye bread', 'Berry smoothie'],
      'Mid-Morning Snack': ['Kiwi, pomegranate seeds, and pumpkin seeds', 'Green tea'],
      Lunch: ['Egg and roasted vegetable grain bowl with tahini', 'Tomato-pepper soup'],
      'Evening Snack': ['Cheese and cucumber on rice cakes', 'Coconut water'],
      Dinner: ['Egg fried rice with broccoli, peppers, and sesame', 'Miso soup', 'Side salad'],
    },
    nutrients: new Map([
      ['Zinc', 'Eggs, pumpkin seeds — ovulation trigger'],
      ['Choline', 'Eggs — egg quality and cell membrane health'],
      ['Antioxidants', 'Colourful vegetables and fruits'],
      ['Vitamin D', 'Eggs — fertility and immune support'],
      ['Omega-3', 'Enriched eggs — inflammation control'],
    ]),
    tips: [
      'Egg yolks are rich in choline, which is critical for egg cell quality.',
      'Colourful peppers and tomatoes provide the antioxidants your follicles need.',
      'This phase allows for more raw salads and lighter cooking.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // LUTEAL PHASE
  // ══════════════════════════════════════════════════════
  {
    title: 'Luteal Phase — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: 'luteal',
    trimester: null,
    description: 'Magnesium-rich, complex carbohydrate foods to ease PMS, support progesterone, and stabilise mood.',
    meals: {
      Breakfast: ['Warm oatmeal with banana, walnuts, dark chocolate chips, and cinnamon', 'Chamomile tea'],
      'Mid-Morning Snack': ['A small handful of cashews and a square of dark chocolate', 'Warm lemon water'],
      Lunch: ['Sweet potato and black bean curry with brown rice', 'Steamed green beans', 'Raita'],
      'Evening Snack': ['Whole grain crackers with hummus and pumpkin seeds', 'Herbal tea'],
      Dinner: ['Chickpea and spinach stew with whole wheat roti', 'Roasted cauliflower', 'Warm golden milk'],
    },
    nutrients: new Map([
      ['Magnesium', '320 mg (dark chocolate, walnuts, cashews, leafy greens) — reduces cramps and mood swings'],
      ['Vitamin B6', 'Sweet potato, chickpeas — progesterone support and mood'],
      ['Complex Carbs', 'Oats, sweet potato, brown rice — serotonin and energy stability'],
      ['Calcium', 'Raita, milk — reduces bloating and PMS severity'],
      ['Fibre', 'Beans, vegetables — oestrogen clearance'],
    ]),
    tips: [
      'Magnesium is the #1 nutrient for the luteal phase — reduces cramps, mood swings, and bloating.',
      'Complex carbs stabilise blood sugar and boost serotonin — key for PMS mood.',
      'Reduce salt and caffeine to minimise water retention and bloating.',
      'Dark chocolate (70%+) satisfies cravings while delivering magnesium.',
      'Vitamin B6 (sweet potato, bananas) directly supports progesterone production.',
      'Prioritise sleep — progesterone naturally promotes drowsiness, lean into it.',
    ],
  },
  {
    title: 'Luteal Phase — Vegan',
    dietaryPreference: 'vegan',
    phase: 'luteal',
    trimester: null,
    description: 'Magnesium-forward plant foods to ease PMS symptoms and support progesterone.',
    meals: {
      Breakfast: ['Banana-walnut smoothie with cacao powder and oat milk', 'Chamomile tea'],
      'Mid-Morning Snack': ['Dark chocolate (70%+) and cashews', 'Warm water with lemon'],
      Lunch: ['Black bean and sweet potato tacos with avocado and salsa', 'Roasted pumpkin seeds sprinkled on greens'],
      'Evening Snack': ['Medjool dates stuffed with almond butter', 'Herbal tea (raspberry leaf or chamomile)'],
      Dinner: ['Chickpea and kale coconut curry', 'Millet or brown rice', 'Warm golden milk (oat milk)'],
    },
    nutrients: new Map([
      ['Magnesium', 'Cacao, nuts, seeds, leafy greens — PMS relief'],
      ['Vitamin B6', 'Banana, sweet potato — mood and progesterone'],
      ['Healthy Fats', 'Avocado, coconut milk — hormone synthesis'],
      ['Complex Carbs', 'Oats, millet, sweet potato — serotonin stability'],
      ['Zinc', 'Pumpkin seeds — progesterone production'],
    ]),
    tips: [
      'Raw cacao is one of the highest plant-based magnesium sources.',
      'Raspberry leaf tea is traditionally used to support the luteal phase and ease PMS.',
      'Dates provide quick energy and satisfy sweet cravings naturally.',
      'Avocado fat is essential for making progesterone.',
    ],
  },
  {
    title: 'Luteal Phase — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: 'luteal',
    trimester: null,
    description: 'Protein and magnesium to stabilise blood sugar, ease PMS, and support progesterone.',
    meals: {
      Breakfast: ['Turkey and egg scramble with whole-grain toast and sliced banana', 'Chamomile tea'],
      'Mid-Morning Snack': ['Handful of mixed nuts and a square of dark chocolate', 'Warm water'],
      Lunch: ['Grilled salmon with sweet potato mash and steamed broccoli', 'Spinach side salad'],
      'Evening Snack': ['Turkey or chicken mince lettuce cups', 'Herbal tea'],
      Dinner: ['Slow-cooked chicken and lentil stew with brown rice', 'Roasted Brussels sprouts', 'Warm turmeric milk'],
    },
    nutrients: new Map([
      ['Magnesium', 'Dark chocolate, leafy greens, nuts — PMS relief'],
      ['Tryptophan', 'Turkey, chicken — serotonin and mood booster'],
      ['Vitamin B6', 'Turkey, salmon — progesterone and mood'],
      ['Omega-3', 'Salmon — reduces PMS inflammation'],
      ['Complex Carbs', 'Sweet potato, brown rice — stabilise blood sugar'],
    ]),
    tips: [
      'Turkey is rich in tryptophan, which converts to serotonin — perfect for luteal mood support.',
      'Salmon provides B6 and omega-3 that together reduce PMS severity significantly.',
      'Avoid alcohol in the luteal phase — it dramatically worsens PMS symptoms.',
      'Eat every 3–4 hours to keep blood sugar stable and prevent cravings.',
    ],
  },
  {
    title: 'Luteal Phase — Eggetarian',
    dietaryPreference: 'eggetarian',
    phase: 'luteal',
    trimester: null,
    description: 'Eggs and magnesium-rich plant foods to ease PMS and stabilise luteal phase mood.',
    meals: {
      Breakfast: ['Banana oat pancakes with dark chocolate drizzle', 'Chamomile tea'],
      'Mid-Morning Snack': ['Hard-boiled egg and a small handful of cashews', 'Warm water'],
      Lunch: ['Egg and sweet potato hash with sautéed greens', 'Whole-grain roti', 'Raita'],
      'Evening Snack': ['Dark chocolate (70%+) and almond butter on rice cake', 'Herbal tea'],
      Dinner: ['Vegetable frittata with spinach, peppers, and feta', 'Brown rice', 'Warm turmeric milk'],
    },
    nutrients: new Map([
      ['Magnesium', 'Dark chocolate, cashews, spinach — cramp and mood relief'],
      ['Vitamin B6', 'Eggs, sweet potato — progesterone and serotonin'],
      ['Tryptophan', 'Eggs — serotonin precursor for mood'],
      ['Calcium', 'Dairy, eggs — reduces bloating and PMS'],
      ['Complex Carbs', 'Oats, sweet potato — stable blood sugar'],
    ]),
    tips: [
      'Eggs provide tryptophan and B6 which together support serotonin production.',
      'A frittata is a perfect luteal meal — protein-rich, satisfying, and versatile.',
      'Avoid salty and processed foods to minimise bloating.',
      'Warm, comforting meals align well with the body-slowing nature of the luteal phase.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // PREGNANCY — TRIMESTER 1
  // ══════════════════════════════════════════════════════
  {
    title: 'Pregnancy — First Trimester — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: '',
    trimester: 1,
    description: 'Folate-rich, nausea-friendly foods for the critical first trimester of pregnancy.',
    meals: {
      Breakfast: ['Whole-grain toast with avocado and a glass of fortified orange juice', 'Ginger tea (for nausea)'],
      'Mid-Morning Snack': ['Banana and a small handful of almonds', 'Cold water with lemon'],
      Lunch: ['Moong dal with rice and a small portion of yogurt', 'Steamed carrots and beans', 'Cumin-spiced buttermilk'],
      'Evening Snack': ['Whole-grain crackers with peanut butter', 'Ginger-lemon tea'],
      Dinner: ['Paneer and spinach curry with whole wheat roti', 'Steamed broccoli', 'Warm milk with a pinch of nutmeg'],
    },
    nutrients: new Map([
      ['Folate', '400–600 mcg daily (leafy greens, fortified foods, legumes)'],
      ['Vitamin B6', 'Banana, chickpeas — helps with nausea'],
      ['Iron', '27 mg (spinach, paneer, dal)'],
      ['Calcium', '1000 mg (dairy, fortified milk)'],
      ['Ginger', 'Tea, biscuits — proven nausea remedy'],
    ]),
    tips: [
      'Take a prenatal vitamin with at least 400 mcg folic acid — started before conception if possible.',
      'Eat small, frequent meals every 2–3 hours to manage nausea.',
      'Ginger tea, ginger biscuits, or ginger chews are the best natural nausea remedy.',
      'Avoid raw sprouts, unpasteurised dairy, and undercooked foods.',
      'Stay hydrated — sip water consistently even if nauseous.',
      'Vitamin B6 supplements (under doctor supervision) can significantly reduce morning sickness.',
    ],
  },
  {
    title: 'Pregnancy — First Trimester — Vegan',
    dietaryPreference: 'vegan',
    phase: '',
    trimester: 1,
    description: 'Plant-based folate and iron with nausea management for early pregnancy.',
    meals: {
      Breakfast: ['Fortified oat milk porridge with mashed banana and chia seeds', 'Ginger tea'],
      'Mid-Morning Snack': ['Saltine crackers or plain rice cakes (for nausea)', 'Cold ginger-lemon water'],
      Lunch: ['Red lentil soup with brown rice', 'Steamed broccoli with lemon', 'Small portion of sauerkraut (probiotic)'],
      'Evening Snack': ['Edamame or a banana with almond butter', 'Herbal ginger tea'],
      Dinner: ['Chickpea and spinach stew with millet roti', 'Roasted sweet potato', 'Fortified oat milk before bed'],
    },
    nutrients: new Map([
      ['Folate', '600 mcg (lentils, fortified cereals, leafy greens)'],
      ['Vitamin B12', 'SUPPLEMENT REQUIRED — critical for fetal brain development'],
      ['Iron', '27 mg (lentils, spinach, fortified foods)'],
      ['Calcium', '1000 mg (fortified plant milk, tofu, kale)'],
      ['Omega-3 DHA', 'Algae-based supplement strongly recommended'],
    ]),
    tips: [
      'Vitamin B12 supplement is non-negotiable during vegan pregnancy.',
      'Algae-based DHA/EPA supplement is the best vegan omega-3 source for fetal brain development.',
      'Fortified plant milks are essential for calcium and vitamin D.',
      'Plain crackers and bananas are your best friends for first trimester nausea.',
      'Consult your doctor or dietitian to ensure all nutritional needs are met.',
    ],
  },
  {
    title: 'Pregnancy — First Trimester — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: '',
    trimester: 1,
    description: 'Nutrient-dense animal proteins and folate for early fetal development.',
    meals: {
      Breakfast: ['Scrambled eggs with spinach and whole-grain toast', 'Fortified orange juice', 'Ginger tea'],
      'Mid-Morning Snack': ['Plain crackers with cream cheese or a boiled egg', 'Cold water'],
      Lunch: ['Baked chicken with steamed broccoli and brown rice', 'Tomato and cucumber salad'],
      'Evening Snack': ['Greek yogurt with banana', 'Ginger-lemon water'],
      Dinner: ['Salmon (fully cooked) with steamed asparagus and sweet potato', 'Clear chicken broth'],
    },
    nutrients: new Map([
      ['Folate', '600 mcg (asparagus, eggs, fortified foods)'],
      ['Iron (Haem)', '27 mg (chicken, beef, eggs)'],
      ['Omega-3 DHA', 'Cooked salmon, sardines — critical for brain development'],
      ['Vitamin B12', 'Meat, eggs — fetal neural tube development'],
      ['Calcium', '1000 mg (dairy, fortified foods)'],
    ]),
    tips: [
      'ALL meat and fish must be thoroughly cooked during pregnancy — no raw or rare.',
      'Avoid high-mercury fish: shark, swordfish, king mackerel, tilefish.',
      'Safe fish (2 servings/week): salmon, sardines, shrimp, catfish.',
      'Deli meats should be heated until steaming to avoid listeria risk.',
      'Prenatal vitamin with folic acid is essential even with a varied diet.',
    ],
  },
  {
    title: 'Pregnancy — First Trimester — Eggetarian',
    dietaryPreference: 'eggetarian',
    phase: '',
    trimester: 1,
    description: 'Eggs provide the most bioavailable choline, B12, and protein for early pregnancy.',
    meals: {
      Breakfast: ['Scrambled eggs with whole-grain toast and a glass of fortified milk', 'Ginger tea'],
      'Mid-Morning Snack': ['Plain crackers and a banana', 'Lemon water'],
      Lunch: ['Egg and spinach dal with brown rice', 'Steamed vegetables', 'Yogurt'],
      'Evening Snack': ['Hard-boiled egg and saltines', 'Ginger-lemon water'],
      Dinner: ['Vegetable omelette with whole-grain roti', 'Spinach soup', 'Warm milk'],
    },
    nutrients: new Map([
      ['Choline', 'Eggs — critical for fetal brain and spinal cord development'],
      ['Folate', '600 mcg (eggs, spinach, fortified foods)'],
      ['Iron', '27 mg (eggs, spinach, dal)'],
      ['Vitamin B12', 'Eggs, dairy — neural tube health'],
      ['Calcium', '1000 mg (milk, yogurt, paneer)'],
    ]),
    tips: [
      'Eggs are a pregnancy superfood — choline from yolks is essential for brain development.',
      'Ensure eggs are fully cooked — avoid runny yolks during pregnancy.',
      'Small, frequent meals help manage first-trimester nausea.',
      'Include fortified foods for vitamin D and B12 supplementation.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // PREGNANCY — TRIMESTER 2
  // ══════════════════════════════════════════════════════
  {
    title: 'Pregnancy — Second Trimester — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: '',
    trimester: 2,
    description: 'Calcium, iron and sustained energy for the rapid growth phase of your baby.',
    meals: {
      Breakfast: ['Ragi (finger millet) porridge with banana and dates', 'A glass of warm milk'],
      'Mid-Morning Snack': ['Paneer cubes with cucumber slices and mint chutney', 'Lemon water'],
      Lunch: ['Rajma (kidney beans) with brown rice', 'Steamed green vegetables', 'Carrot and beet salad', 'Buttermilk'],
      'Evening Snack': ['Whole-grain crackers with peanut butter and apple slices', 'Herbal tea'],
      Dinner: ['Palak paneer with whole wheat roti', 'Vegetable soup', 'Warm milk with saffron'],
    },
    nutrients: new Map([
      ['Calcium', '1000–1200 mg (dairy, ragi, leafy greens)'],
      ['Iron', '27 mg (spinach, rajma, dates)'],
      ['Vitamin D', 'Fortified milk, sun exposure'],
      ['Protein', '70–80 g daily (paneer, dal, legumes)'],
      ['Fibre', '25–30 g (whole grains, veggies) — prevents constipation'],
    ]),
    tips: [
      'Ragi is exceptionally high in calcium — a must for growing fetal bones.',
      'Iron needs increase significantly — pair iron foods with vitamin C always.',
      'Second trimester appetite usually returns — use it to eat nutrient-dense foods.',
      'Constipation is common — increase fibre and water intake.',
      'Avoid large meals — eat 5–6 smaller meals throughout the day.',
    ],
  },
  {
    title: 'Pregnancy — Second Trimester — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: '',
    trimester: 2,
    description: 'Sustained protein and iron for baby\'s rapid growth and your energy.',
    meals: {
      Breakfast: ['Egg and vegetable omelette with whole-grain toast', 'Fortified orange juice', 'Warm milk'],
      'Mid-Morning Snack': ['Greek yogurt with berries and flaxseeds', 'Water'],
      Lunch: ['Grilled chicken with brown rice, steamed vegetables, and dal', 'Beetroot and carrot salad'],
      'Evening Snack': ['Boiled eggs or sardines on crackers', 'Lemon water'],
      Dinner: ['Baked salmon with steamed broccoli and sweet potato mash', 'Chicken broth soup', 'Warm milk'],
    },
    nutrients: new Map([
      ['Protein', '70–80 g (chicken, eggs, fish, dairy)'],
      ['Calcium', '1000 mg (dairy, fortified foods)'],
      ['Iron (Haem)', '27 mg (chicken, lean beef, eggs)'],
      ['Omega-3 DHA', 'Salmon — baby\'s brain development peak period'],
      ['Vitamin D', 'Salmon, fortified milk'],
    ]),
    tips: [
      'DHA-rich fish (2x/week) is crucial during the second trimester for brain development.',
      'Ensure all proteins are thoroughly cooked.',
      'Heartburn may start this trimester — avoid spicy, fatty, or acidic foods before bed.',
      'Sleep on your left side to improve circulation to baby.',
    ],
  },

  // ══════════════════════════════════════════════════════
  // PREGNANCY — TRIMESTER 3
  // ══════════════════════════════════════════════════════
  {
    title: 'Pregnancy — Third Trimester — Vegetarian',
    dietaryPreference: 'vegetarian',
    phase: '',
    trimester: 3,
    description: 'Omega-3, fibre, and light meals to prepare for birth and support baby\'s final development.',
    meals: {
      Breakfast: ['Flaxseed and walnut porridge with dates and honey', 'Warm milk'],
      'Mid-Morning Snack': ['Dates (3–4, for uterine preparation) and almonds', 'Coconut water'],
      Lunch: ['Moong dal with rice and ghee', 'Roasted vegetables', 'Curd/yogurt', 'Beetroot juice'],
      'Evening Snack': ['Whole-grain roti with peanut butter or avocado', 'Herbal tea (raspberry leaf after week 36)'],
      Dinner: ['Light sabzi (vegetable curry) with whole wheat chapati', 'Khichdi (rice and lentils)', 'Warm saffron milk'],
    },
    nutrients: new Map([
      ['Omega-3', 'Walnuts, flaxseeds — final brain development'],
      ['Iron', '27+ mg — prepare for blood loss at birth'],
      ['Calcium', '1200 mg — baby\'s bones are finalising'],
      ['Fibre', '30 g — combats third-trimester constipation'],
      ['Dates', 'From week 36 — may support cervical ripening and labour'],
    ]),
    tips: [
      'Dates from week 36 have been studied for supporting cervical readiness — include 4–6 daily.',
      'Heartburn is common — eat small meals, avoid lying down after eating.',
      'Raspberry leaf tea after week 36 (with doctor approval) is traditionally used for birth preparation.',
      'Omega-3 from walnuts and flaxseeds supports the final burst of fetal brain growth.',
      'Keep iron high — you\'ll need it for potential blood loss during delivery.',
      'Stay well-hydrated to reduce swelling and support amniotic fluid levels.',
    ],
  },
  {
    title: 'Pregnancy — Third Trimester — Non-Vegetarian',
    dietaryPreference: 'non-vegetarian',
    phase: '',
    trimester: 3,
    description: 'Complete nutrition and light meals to power the final stretch and prepare for birth.',
    meals: {
      Breakfast: ['Scrambled eggs with smoked salmon on whole-grain toast', 'Fortified orange juice'],
      'Mid-Morning Snack': ['Greek yogurt with dates and walnuts', 'Water'],
      Lunch: ['Lean chicken stew with vegetables, brown rice, and dal', 'Beetroot and spinach salad'],
      'Evening Snack': ['Boiled egg and crackers', 'Coconut water'],
      Dinner: ['Light grilled fish with steamed vegetables and khichdi', 'Clear chicken broth', 'Warm milk with saffron'],
    },
    nutrients: new Map([
      ['Omega-3 DHA', 'Salmon, sardines — final fetal brain myelination'],
      ['Iron', '27+ mg — for delivery preparation'],
      ['Protein', '80 g (all animal sources)'],
      ['Calcium', '1200 mg — final bone mineralisation'],
      ['Vitamin K', 'Leafy greens — supports blood clotting for birth'],
    ]),
    tips: [
      'Omega-3 is at peak importance now — include oily fish twice weekly.',
      'Dates daily from week 36 (with doctor approval) may support labour progression.',
      'Eat 6 small meals — stomach space is compressed by the uterus.',
      'Iron stores now will determine your post-birth recovery speed.',
      'Avoid high-sodium foods to control pregnancy oedema.',
    ],
  },
];

async function seedDietPlans() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/femcare';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    }

    const existing = await DietPlan.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Diet plans already seeded (${existing} found). Skipping.`);
      return;
    }

    await DietPlan.insertMany(PLANS);
    console.log(`✅ Seeded ${PLANS.length} diet plans successfully!`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    if (require.main === module) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run directly: node server/seeders/seedDietPlans.js
if (require.main === module) {
  seedDietPlans();
}

module.exports = seedDietPlans;
