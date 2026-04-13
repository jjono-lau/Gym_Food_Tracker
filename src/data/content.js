export const workoutPlans = {
  easy: {
    lower: [
      {
        name: "Treadmill Walk",
        machine: "Treadmill",
        sets: "10 min @ 1-2% incline",
        rest: "N/A steady",
        tips: "Comfortable pace; focus on breathing.",
        how: ["Start with 1% incline to mimic outdoors.", "Keep shoulders relaxed, light grip.", "Aim for brisk but talkable pace."],
        watch: ["Don’t hold the console; stand tall.", "Avoid looking down for long periods."],
      },
      {
        name: "Seated Leg Curl",
        machine: "Hamstring curl",
        sets: "3 x 12",
        rest: "60-75s",
        tips: "Pad just above heels. Control the return, don’t slam.",
        how: ["Adjust backrest so knees align with pivot.", "Flex feet, pull to feel hamstrings, 2s lower."],
        watch: ["Don’t lift hips off pad.", "No bouncing the stack."],
      },
      {
        name: "Bodyweight Box Squat",
        machine: "Flat bench",
        sets: "3 x 10",
        rest: "60s",
        tips: "Tap the bench lightly, keep shins near vertical.",
        how: ["Stand hip-width, sit back to touch bench, drive up through heels."],
        watch: ["Don’t rock forward off toes.", "Keep knees tracking over mid-foot."],
      },
    ],
    upper: [
      {
        name: "Chest Press",
        machine: "Selectorized chest press",
        sets: "2 x 12",
        rest: "75s",
        tips: "Handles in line with mid-chest, shoulders down/back.",
        how: ["Seat height so handles hit mid-chest.", "Squeeze shoulder blades before pressing.", "1s pause near chest, 2s press."],
        watch: ["Don’t flare elbows past 90°.", "No bouncing off the stack."],
      },
      {
        name: "Lat Pulldown",
        machine: "Wide-grip pulldown",
        sets: "3 x 10",
        rest: "75s",
        tips: "Lean back 10°, pull to collarbone, avoid shrugging.",
        how: ["Set knee pad snug.", "Grip just outside shoulders, slight lean, pull to collarbone."],
        watch: ["Don’t yank with momentum.", "Avoid pulling behind neck."],
      },
      {
        name: "Seated Shoulder Raise",
        machine: "Cable with D-handles",
        sets: "3 x 12",
        rest: "60s",
        tips: "Thumbs up, lift to shoulder height, soft elbows.",
        how: ["Handles by sides, thumbs up, raise to shoulder line.", "Control down for 2s."],
        watch: ["Don’t shrug; keep ribs down.", "Avoid swinging weight."],
      },
      {
        name: "Assisted Pull-up Hold",
        machine: "Assisted pull-up",
        sets: "3 x 20s",
        rest: "60-90s",
        tips: "Knees on pad, hold top position, control down.",
        how: ["Choose assistance so you can hold top ~20s.", "Drive elbows to ribs, hold chin over bar.", "Lower slowly."],
        watch: ["Don’t lock out elbows on descent.", "Avoid kipping or swinging."],
      },
    ],
    fitness: [
      {
        name: "Treadmill Walk",
        machine: "Treadmill",
        sets: "10-12 min",
        rest: "N/A steady",
        tips: "1% incline, brisk pace you can talk at.",
        how: ["Start 2 min easy, then brisk.", "Keep cadence even; slight forward lean from ankles."],
        watch: ["Don’t hold the rails.", "Avoid overstriding."],
      },
      {
        name: "Rower Technique",
        machine: "RowErg",
        sets: "2 x 3 min",
        tips: "Legs drive first, then hips, then arms; smooth recovery.",
      },
    ],
    weightloss: [
      {
        name: "Incline Walk Intervals",
        machine: "Treadmill",
        sets: "6 x 1 min on / 1 min off",
        tips: "On: incline 6-8%, steady arms; Off: flat stroll.",
      },
      {
        name: "Cycling Spin",
        machine: "Bike",
        sets: "10 min steady",
        tips: "Light resistance, 80-90 RPM, relaxed grip.",
      },
      {
        name: "Step Mill Intro",
        machine: "Stair climber",
        sets: "6 min",
        rest: "N/A steady",
        tips: "Stand tall, light rail touch, small steps.",
        how: ["Set low level first minute, then build.", "Light fingertips only; eyes forward."],
        watch: ["Don’t hunch over the console.", "Short steps prevent knee strain."],
      },
      {
        name: "Elliptical Warm",
        machine: "Elliptical",
        sets: "8 min",
        rest: "N/A steady",
        tips: "Smooth cadence, keep heels down.",
        how: ["Maintain even pressure through feet.", "Keep shoulders relaxed, slight knee bend."],
        watch: ["Don’t bounce heels off pedals.", "Avoid slouching."],
      },
    ],
  },
  medium: {
    lower: [
      {
        name: "Hack Squat",
        machine: "Hack squat sled",
        sets: "4 x 10",
        tips: "Feet shoulder-width, control depth, avoid locking knees.",
      },
      {
        name: "Cable Pull-Through",
        machine: "Cable with rope",
        sets: "3 x 12",
        tips: "Hinge hips back, squeeze glutes, keep spine long.",
      },
      {
        name: "Leg Extension",
        machine: "Pin-loaded extension",
        sets: "3 x 12",
        tips: "Pad just above ankle, pause 1s at top, slow down.",
      },
      {
        name: "Seated Calf Raise",
        machine: "Pin-loaded calf",
        sets: "3 x 15",
        tips: "Full stretch at bottom, pause at top.",
      },
    ],
    upper: [
      {
        name: "Seated Row",
        machine: "Cable row",
        sets: "4 x 10",
        tips: "Neutral spine, pull elbows to ribs, 1s squeeze.",
      },
      {
        name: "Shoulder Press",
        machine: "Selectorized overhead press",
        sets: "3 x 10",
        tips: "Seat so handles start at chin, ribs down, slow lower.",
      },
      {
        name: "Cable Face Pull",
        machine: "Rope + cable",
        sets: "3 x 12",
        tips: "Elbows high, pull to eye level, squeeze upper back.",
      },
      {
        name: "Pec Deck",
        machine: "Chest fly",
        sets: "3 x 12",
        tips: "Elbows soft, meet hands at mid-line, slow return.",
      },
    ],
    fitness: [
      {
        name: "Assault Bike",
        machine: "Air bike",
        sets: "6 x 20s / 70s easy",
        tips: "Drive with legs, relaxed grip, nasal breathe on easy.",
      },
      {
        name: "Sled Push",
        machine: "Turf sled",
        sets: "6 x 15m",
        tips: "Torso angle ~45°, short quick steps, push through mid-foot.",
      },
    ],
    weightloss: [
      {
        name: "Elliptical Tempo",
        machine: "Elliptical",
        sets: "12 min",
        tips: "RPM 60-70, light grip, steady breathing.",
      },
      {
        name: "Stair Climber",
        machine: "Stepper",
        sets: "8 min",
        tips: "Stand tall, soft knees, don’t lean on rails.",
      },
      {
        name: "Row-Goblet Combo",
        machine: "RowErg + Leg Press",
        sets: "3 rounds: 250m row + 12 light leg press",
        tips: "Even strokes on row, controlled press with heels down.",
      },
      {
        name: "SkiErg Tempo",
        machine: "SkiErg",
        sets: "3 x 2 min",
        tips: "Hinge then pull, soft knees, steady breathing.",
      },
    ],
  },
  hard: {
    lower: [
      {
        name: "Barbell Back Squat",
        machine: "Rack + barbell",
        sets: "4 x 8",
        rest: "120s",
        tips: "Set safeties at hip height, brace, drive up through mid-foot.",
        how: ["Set bar at mid-chest height, brace, squat to just below parallel.", "Drive up through mid-foot, keep knees out."],
        watch: ["No butt wink at bottom.", "Avoid knees collapsing inward."],
      },
      {
        name: "Leg Press Drop Set",
        machine: "45° sled",
        sets: "3 x 12 + drop",
        rest: "90s",
        tips: "Reduce 20% weight mid-set, no knee lockout.",
        how: ["Foot mid-sled, lower till knees 90°.", "Press without locking knees; drop weight mid-set and continue."],
        watch: ["Don’t let hips lift off pad.", "Keep heels down."],
      },
      {
        name: "Hip Thrust",
        machine: "Glute drive / hip thrust machine",
        sets: "4 x 10",
        rest: "90s",
        tips: "Chin tucked, 2s hold at top, shins vertical.",
        how: ["Set pad at hip crease, feet under knees.", "Drive hips up, pause 2s, lower under control."],
        watch: ["Don’t hyperextend low back.", "Keep chin tucked to avoid rib flare."],
      },
      {
        name: "Adductor/Abductor",
        machine: "Dual inner/outer thigh",
        sets: "3 x 15 each",
        rest: "60s",
        tips: "Slow 2s out, 2s in; keep back on pad.",
        how: ["Adjust range to comfortable stretch.", "Tempo 2s out/2s in each rep."],
        watch: ["No jerking at end ranges.", "Keep knees aligned with hips."],
      },
      {
        name: "Standing Calf + Tib Raise",
        machine: "Calf raise + tib bar",
        sets: "3 x 15 each",
        rest: "45-60s",
        tips: "Full range on both sides to balance ankles.",
        how: ["Rise onto toes with 1s pause; for tib raise pull toes up toward shins."],
        watch: ["Avoid bouncing; control bottom stretch."],
      },
      {
        name: "Leg Extension Mechanical Drop",
        machine: "Pin-loaded extension",
        sets: "3 x 12-12-12",
        rest: "75s",
        tips: "Drop a plate each mini-set; no swinging.",
        how: ["Pad above ankle, extend to 90-95% lockout.", "After first 12, drop weight 10-15% and continue."],
        watch: ["Don’t slam stack.", "Keep hips on seat."],
      },
      {
        name: "Seated Leg Curl ISO",
        machine: "Leg curl",
        sets: "3 x 10/leg",
        rest: "75s",
        tips: "Hold 2s at the bottom on each rep.",
        how: ["Curl one leg at a time, squeeze 2s, slow return."],
        watch: ["Avoid hip hiking; stay glued to pad."],
      },
    ],
    upper: [
      {
        name: "Weighted Pull-up / Assisted",
        machine: "Assisted pull-up/dip",
        sets: "4 x 6-8",
        tips: "Start from dead hang, ribs down, drive elbows to ribs.",
      },
      {
        name: "Plate-Loaded Row",
        machine: "Chest-supported row machine",
        sets: "4 x 10",
        tips: "Chest on pad, pull to hip line, pause 1s.",
      },
      {
        name: "Dip or Assisted Dip",
        machine: "Dip bars or assist",
        sets: "4 x 8",
        tips: "Slight lean forward, elbows soft at top, avoid shrug.",
      },
      {
        name: "Triceps Pressdown",
        machine: "Cable + rope",
        sets: "3 x 12",
        tips: "Elbows pinned, finish with straight wrists.",
      },
      {
        name: "Biceps Curl",
        machine: "Selectorized curl",
        sets: "3 x 12",
        tips: "Control the lower, elbows by sides.",
      },
      {
        name: "Pec Deck High Rep",
        machine: "Pec deck",
        sets: "3 x 15",
        tips: "Slow squeeze, 1s hold together.",
      },
      {
        name: "Reverse Fly",
        machine: "Rear-delt machine",
        sets: "3 x 12",
        tips: "Chest to pad, lead with elbows out.",
      },
    ],
    fitness: [
      {
        name: "Row Sprints",
        machine: "RowErg",
        sets: "8 x 30s / 60s easy",
        tips: "Power strokes at 26-30 spm, heels down, tall finish.",
      },
      {
        name: "Bike Power",
        machine: "Assault bike",
        sets: "10 x 15s / 75s easy",
        tips: "Explode with legs first, smooth arms, control breathing.",
      },
      {
        name: "SkiErg Drive",
        machine: "SkiErg",
        sets: "6 x 30s / 60s easy",
        tips: "Hips hinge then extend, finish with lats; soft knees.",
      },
      {
        name: "Stair Climber Push",
        machine: "Stepper",
        sets: "12 min ladder: 1 min easy / 1 min fast",
        tips: "Keep chest tall, light rail touch.",
      },
      {
        name: "Assault Bike Pyramid",
        machine: "Air bike",
        sets: "30s-40s-50s-60s hard / equal easy",
        tips: "Drive with legs; manage breathing between rungs.",
      },
      {
        name: "Treadmill Incline Waves",
        machine: "Treadmill",
        sets: "10 x 1 min @ 6-10% / 1 min flat",
        tips: "Short steps, steady arms.",
      },
    ],
    weightloss: [
      {
        name: "Treadmill Hills",
        machine: "Treadmill",
        sets: "10 x 45s @ 8-10% / 60s flat",
        tips: "Short steps, slight forward lean from ankles.",
      },
      {
        name: "Circuit Finisher",
        machine: "Leg press + cable + stepper",
        sets: "3 rounds (12 leg press, 12 cable crunch, 60s stepper)",
        tips: "Steady tempo, short rests, breathe through nose between moves.",
      },
      {
        name: "Bike-Leg Press Pair",
        machine: "Assault bike + sled press",
        sets: "5 rounds: 20 cal bike + 12 leg press",
        tips: "Hold steady cadence on bike, heels down on press.",
      },
      {
        name: "Elliptical Burn",
        machine: "Elliptical",
        sets: "15 min progressive",
        tips: "Increase resistance every 3 min; focus on smooth cadence.",
      },
      {
        name: "Stair Climber Intervals",
        machine: "Stepper",
        sets: "12 x 45s fast / 45s easy",
        tips: "Light rail touch, upright chest.",
      },
      {
        name: "Row-Calorie Ladder",
        machine: "RowErg",
        sets: "10-12-14-16-18 cal with 45s rest",
        tips: "Stay tall, push with legs, smooth recovery.",
      },
      {
        name: "Arc Trainer Tempo",
        machine: "Arc/elliptical",
        sets: "10 min build",
        tips: "Add resistance every 2 min, soft knees.",
      },
    ],
  },
};

export const meals = {
  breakfast: [
    {
      title: "Ragi dosa + mint chutney",
      prepTime: "9-10 hrs ferment + 15 min cook",
      cookTime: "15 min",
      ingredients: [
        "1 cup ragi flour",
        "1/4 cup rice flour",
        "1/4 cup semolina",
        "1/2 cup curd",
        "1.25-1.5 cups water",
        "Salt, cumin, green chilli, ginger",
        "Oil for cooking"
      ],
      steps: [
        "Whisk ragi, rice flour, semolina, curd, salt with water to pourable batter.",
        "Stir in cumin, minced chilli, ginger; ferment 8-9 hrs (or 30 min rest for instant version).",
        "Heat tawa, pour ladle, spread thin; drizzle oil, cook till crisp on one side; serve hot with chutney."
      ],
    },
    {
      title: "Vegetable upma",
      prepTime: "10 min",
      cookTime: "20 min",
      ingredients: [
        "1 cup rava (semolina)",
        "1 small onion, 1 green chilli",
        "1/2 cup mixed veg (peas, beans, carrots)",
        "1/2 tsp mustard, 1/2 tsp cumin, curry leaves",
        "1 tbsp ghee/oil", "Salt", "2.5 cups water"
      ],
      steps: [
        "Dry-roast rava 4-5 min until fragrant; set aside.",
        "In ghee, splutter mustard, cumin, curry leaf; sauté onion & chilli 2 min.",
        "Add veggies, salt; cook 3-4 min. Pour water, bring to boil.",
        "Stream in rava while stirring; cover and steam on low 3-4 min; fluff and serve."
      ],
    },
    {
      title: "Curd rice + cucumber",
      ingredients: ["1 cup cooked rice (cooled)", "3/4 cup curd", "Cucumber", "Flaxseed", "Salt"],
      steps: ["Mix rice + curd + salt.", "Fold in cucumber + flaxseed.", "Chill 10 min before serving."],
    },
  ],
  lunch: [
    {
      title: "Brown rice + keerai dal + fish",
      ingredients: ["1 cup brown rice", "1 cup keerai dal", "150g grilled fish", "Lemon"],
      steps: ["Cook brown rice.", "Simmer dal with spinach.", "Grill fish with pepper + salt.", "Plate with lemon."],
    },
    {
      title: "Millet lemon rice + egg burji",
      ingredients: ["1 cup cooked millet", "Lemon, curry leaf, peanuts", "2 eggs", "Onion, chilli"],
      steps: ["Temper millet with lemon tadka + peanuts.", "Scramble eggs with onion & chilli.", "Serve together."],
    },
    {
      title: "Quinoa sambar bowl",
      ingredients: ["1 cup quinoa", "Sambar with mixed veg", "Cilantro"],
      steps: ["Cook quinoa fluffy.", "Ladle hot sambar over quinoa.", "Top with cilantro."],
    },
    {
      title: "Paneer tikka + cabbage poriyal",
      ingredients: ["150g paneer", "Yogurt spices", "Shredded cabbage", "Mustard, coconut"],
      steps: ["Marinate paneer, grill 10 min.", "Stir-fry cabbage with mustard & coconut.", "Serve together."],
    },
  ],
  dinner: [
    {
      title: "Idiyappam + Kerala veg stew",
      prepTime: "10 min",
      cookTime: "25 min",
      ingredients: [
        "2-3 idiyappam (store-bought or steamed)",
        "1 potato, 1 carrot, 6 beans, 1/4 cup peas",
        "1 small onion, 1 green chilli, 1-inch ginger",
        "1 cup thin coconut milk + 1/2 cup thick coconut milk",
        "1 tbsp coconut oil, 1/2 tsp whole pepper, 1 bay leaf, curry leaves, salt"
      ],
      steps: [
        "Heat coconut oil; temper bay leaf, pepper, curry leaves.",
        "Sauté onion, ginger, chilli 2-3 min; add diced veggies + salt; stir 2 min.",
        "Pour thin coconut milk, cover, simmer till vegetables tender (10-12 min).",
        "Stir in thick coconut milk; warm gently without boiling. Serve hot with idiyappam."
      ],
    },
    {
      title: "Grilled chicken + beans",
      ingredients: ["150g chicken", "Green beans", "Olive oil", "Garlic"],
      steps: ["Marinate and grill chicken.", "Sauté beans with garlic.", "Plate together."],
    },
    {
      title: "Millet tomato rice + tofu pepper",
      ingredients: ["1 cup millet", "Tomato masala", "150g tofu", "Bell pepper"],
      steps: ["Cook millet with tomato masala.", "Pan-sear tofu with pepper + bell peppers.", "Serve side by side."],
    },
  ],
  snacks: [
    {
      title: "Spiced buttermilk",
      ingredients: ["1 cup buttermilk", "Cumin", "Curry leaf", "Salt"],
      steps: ["Blend all together, serve chilled."],
    },
    {
      title: "Roasted chana mix",
      ingredients: ["1/2 cup roasted chana", "Coconut slivers", "Chilli powder"],
      steps: ["Toss chana with coconut + chilli powder.", "Serve in a cup."],
    },
    {
      title: "Nut handful",
      ingredients: ["Almonds", "Pistachios", "Pumpkin seeds"],
      steps: ["Portion 30g mix; enjoy."],
    },
    {
      title: "Papaya lime",
      ingredients: ["1 cup papaya cubes", "Lime squeeze", "Pinch salt"],
      steps: ["Combine and chill 5 minutes."],
    },
  ],
};

export const education = [
  {
    title: "What are triglycerides?",
    desc: "They are the fat your body stores after you eat. High levels make blood thicker and can stress the heart.",
    action: "Aim for steady energy, not sugar spikes.",
    icon: "💧",
  },
  {
    title: "Why cut sugar & refined carbs?",
    desc: "They convert quickly into triglycerides. Swap with fibre-rich carbs like millets, veggies, legumes.",
    action: "Try plate method: 50% veggies, 25% protein, 25% smart carbs.",
    icon: "🥗",
  },
  {
    title: "Alcohol & fried food",
    desc: "Alcohol is stored as fat first. Deep frying adds trans fats that raise triglycerides.",
    action: "Keep alcohol rare; choose grilling, steaming, tadka with less oil.",
    icon: "🚫",
  },
  {
    title: "Move daily",
    desc: "Activity clears triglycerides from the blood faster and boosts HDL.",
    action: "10k steps + 3 strength days is a powerful combo.",
    icon: "🏃‍♀️",
  },
];
