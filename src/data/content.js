export const workoutPlans = {
  easy: {
    lower: [
      { name: "Leg Press", machine: "Leg Press", sets: "3 x 12", rest: "75s", tips: "Feet mid-sled; 2s lower, soft lockout." },
      { name: "Leg Curl", machine: "Leg Curl", sets: "3 x 12", rest: "75s", tips: "Pad above heels; squeeze, 2s return." },
      { name: "Leg Extension", machine: "Leg Extension", sets: "3 x 12", rest: "60s", tips: "Pause 1s at top; don’t snap knees." },
      { name: "Calf Raise", machine: "Calf Raise", sets: "3 x 15", rest: "45-60s", tips: "Full stretch bottom; 1s hold up." },
      { name: "Hip Abduction/Adduction", machine: "Hip Abduction/Adduction", sets: "2 x 15 each", rest: "60s", tips: "Controlled out/in; no jerks." },
    ],
    upper: [
      { name: "Row", machine: "Row", sets: "3 x 12", rest: "75s", tips: "Chest on pad; pull elbows to ribs." },
      { name: "Chest Press", machine: "Chest Press", sets: "3 x 12", rest: "75s", tips: "Handles mid-chest; 2s lower." },
      { name: "Triceps Extension", machine: "Triceps Extension", sets: "3 x 12", rest: "60s", tips: "Elbows pinned; smooth lockout." },
      { name: "Biceps Curl", machine: "Biceps Curl", sets: "2 x 12", rest: "60s", tips: "Wrists neutral; slow 3s down." },
      { name: "Abdominal", machine: "Abdominal", sets: "3 x 12", rest: "60s", tips: "Exhale as ribs meet hips; 2s control back." },
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
      { name: "Leg Press", machine: "Leg Press", sets: "4 x 10", rest: "90s", tips: "Heels down; 2s lower, drive through mid-foot." },
      { name: "Leg Curl", machine: "Leg Curl", sets: "4 x 10", rest: "75s", tips: "Add pause at squeeze; slow ecc." },
      { name: "Leg Extension", machine: "Leg Extension", sets: "4 x 10", rest: "75s", tips: "Tempo 2s up / 3s down." },
      { name: "Calf Raise", machine: "Calf Raise", sets: "4 x 12", rest: "60s", tips: "Pause top/bottom each rep." },
      { name: "Hip Abduction/Adduction", machine: "Hip Abduction/Adduction", sets: "3 x 15 each", rest: "60s", tips: "Steady tempo; stay tall." },
    ],
    upper: [
      { name: "Row", machine: "Row", sets: "4 x 10", rest: "75s", tips: "1s squeeze at ribs; 2s return." },
      { name: "Chest Press", machine: "Chest Press", sets: "4 x 10", rest: "90s", tips: "Controlled 2s lower; soft lockout." },
      { name: "Triceps Extension", machine: "Triceps Extension", sets: "3 x 10", rest: "75s", tips: "Drive down, pause, smooth back." },
      { name: "Biceps Curl", machine: "Biceps Curl", sets: "3 x 10", rest: "60s", tips: "3s eccentric; elbows stay planted." },
      { name: "Abdominal", machine: "Abdominal", sets: "3 x 15", rest: "60s", tips: "Pause 1s at top; steady breathing." },
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
      { name: "Leg Press", machine: "Leg Press", sets: "5 x 8", rest: "90s", tips: "Challenging load; no knee lockout." },
      { name: "Leg Curl", machine: "Leg Curl", sets: "4 x 10 (last set drop)", rest: "75s", tips: "Drop ~15% mid last set; keep hips down." },
      { name: "Leg Extension", machine: "Leg Extension", sets: "4 x 8", rest: "75s", tips: "Heavy; 3s eccentric each rep." },
      { name: "Calf Raise", machine: "Calf Raise", sets: "4 x 15", rest: "60s", tips: "Full ROM; slight pause at stretch." },
      { name: "Hip Abduction/Adduction", machine: "Hip Abduction/Adduction", sets: "4 x 15 each", rest: "60s", tips: "Control both ways; avoid rocking." },
    ],
    upper: [
      { name: "Row", machine: "Row", sets: "4 x 8", rest: "90s", tips: "Heavy but clean; 2s lower each rep." },
      { name: "Chest Press", machine: "Chest Press", sets: "4 x 8", rest: "90s", tips: "Work up to tough 8; no bounce." },
      { name: "Triceps Extension", machine: "Triceps Extension", sets: "4 x 10", rest: "75s", tips: "Add drop on last set if strong." },
      { name: "Biceps Curl", machine: "Biceps Curl", sets: "3 x 12", rest: "75s", tips: "21s style: 7 bottom/7 top/7 full." },
      { name: "Abdominal", machine: "Abdominal", sets: "4 x 12", rest: "60s", tips: "Add plate if easy; 2s squeeze." },
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
