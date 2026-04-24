import breakfastCategory from "@/data/chat/data/categories/breakfast.json";
import lunchCategory from "@/data/chat/data/categories/lunch.json";
import dinnerCategory from "@/data/chat/data/categories/dinner.json";
import recipeDetailsIndex from "@/data/chat/data/recipeDetailsIndex.json";
import faqRules from "@/data/chat/data/faqRules.json";
import snackRules from "@/data/chat/data/snackRules.json";

function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(/\.0$/, "");
}

function formatIngredient(item) {
  if (!item) return "";

  const quantity = item.quantity ? `${formatNumber(item.quantity)} ` : "";
  const unit = item.unit ? `${item.unit} ` : "";
  const note = item.note ? ` (${item.note})` : "";

  return `${quantity}${unit}${item.name}${note}`.trim();
}

function formatMinutes(value) {
  if (!value) return undefined;
  return `${value} min`;
}

function buildRecipeCard(recipe) {
  const details = recipeDetailsIndex[recipe.id];

  return {
    title: recipe.name,
    prepTime: formatMinutes(recipe.timing?.prep_time_min),
    cookTime: formatMinutes(recipe.timing?.cook_time_min),
    ingredients:
      details?.ingredients?.map(formatIngredient).filter(Boolean) ??
      recipe.ingredient_slugs ??
      [],
    steps:
      details?.cooking_steps?.length
        ? details.cooking_steps
        : [recipe.description],
  };
}

function buildSnackCards() {
  const generalSnackRule = snackRules.find((rule) => rule.id === "general-snacks");
  const fillingSnackRule = snackRules.find((rule) => rule.id === "filling-snacks");

  return [
    {
      title: "Fruit + protein side",
      ingredients: ["1 fruit serving", "Curd, buttermilk, or boiled egg on the side"],
      steps: [
        generalSnackRule?.suggestions?.[0] ?? "Pair fruit with a protein side.",
        "Keep it small enough to feel like a snack, not a second meal.",
      ],
    },
    {
      title: "Yogurt-based snack cup",
      ingredients: ["Plain curd or yogurt", "Optional fruit", "Optional seeds or nuts"],
      steps: [
        generalSnackRule?.suggestions?.[1] ?? "Use a yogurt-based option.",
        fillingSnackRule?.suggestions?.[0] ?? "Add fruit if you want more staying power.",
      ],
    },
    {
      title: "Moderate nuts portion",
      ingredients: ["Small handful of nuts", "Optional fruit on the side"],
      steps: [
        generalSnackRule?.suggestions?.[2] ?? "Use nuts in a moderate portion.",
        fillingSnackRule?.why ?? "Keep the portion practical and easy to repeat.",
      ],
    },
    {
      title: "Apple + curd cup",
      ingredients: ["1 apple, sliced", "1 small bowl plain curd", "Pinch cinnamon if wanted"],
      steps: [
        "Slice the apple and pair it with plain curd.",
        "Keep the portion small and use it as a practical, filling snack.",
      ],
    },
    {
      title: "Papaya bowl",
      ingredients: ["1 cup papaya cubes", "Lime squeeze", "Pinch salt"],
      steps: [
        "Toss papaya with lime and a tiny pinch of salt.",
        "Serve chilled for a light fruit-first snack.",
      ],
    },
    {
      title: "Buttermilk break",
      ingredients: ["1 glass low-fat buttermilk", "Cumin", "Curry leaves", "Pinch salt"],
      steps: [
        "Mix buttermilk with cumin and a little salt.",
        "Use it when you want something cooling and light instead of a heavier snack.",
      ],
    },
    {
      title: "Roasted chana cup",
      ingredients: ["Roasted chana", "Optional curry leaves", "Pinch chilli powder"],
      steps: [
        "Portion roasted chana into a small cup.",
        "Add a simple seasoning if you want more flavor without turning it into a big snack.",
      ],
    },
    {
      title: "Cucumber curd bowl",
      ingredients: ["Chopped cucumber", "Plain curd", "Pinch cumin", "Pinch salt"],
      steps: [
        "Mix cucumber into plain curd with cumin and salt.",
        "Keep it simple and cooling for an easy savory snack.",
      ],
    },
    {
      title: "Guava + peanut side",
      ingredients: ["1 guava", "Small spoon of peanuts or peanut chutney"],
      steps: [
        "Slice guava and pair it with a small peanut side.",
        "This works when you want fruit plus a little more staying power.",
      ],
    },
    {
      title: "Boiled egg snack plate",
      ingredients: ["1 or 2 boiled eggs", "Cucumber or carrot sticks", "Pepper"],
      steps: [
        "Pair boiled eggs with raw vegetable sticks.",
        "Use this when you want a more protein-supportive snack without making a full meal.",
      ],
    },
    {
      title: "Pear + seed mix",
      ingredients: ["1 pear", "Small spoon pumpkin or sunflower seeds"],
      steps: [
        "Slice the pear and add a small spoon of seeds on the side.",
        "Keep the seed portion moderate so it stays snack-sized.",
      ],
    },
    {
      title: "Sprout chaat cup",
      ingredients: ["Steamed sprouts", "Tomato", "Onion", "Lime", "Coriander"],
      steps: [
        "Toss steamed sprouts with chopped tomato, onion, lime, and coriander.",
        "Make a small cup instead of a large bowl so it stays in snack territory.",
      ],
    },
    {
      title: "Banana + nut combo",
      ingredients: ["1 small banana", "A few almonds or pistachios"],
      steps: [
        "Pair a small banana with a few nuts.",
        "This is a quick option when you need something easy before or after movement.",
      ],
    },
    {
      title: "Paneer bites",
      ingredients: ["Small paneer cubes", "Pepper", "Pinch chaat masala"],
      steps: [
        "Season paneer cubes lightly and eat them cold or lightly warmed.",
        "Use a modest portion so it stays a snack, not a meal replacement.",
      ],
    },
    {
      title: "Tomato soup mug",
      ingredients: ["Light tomato soup", "Pepper", "Coriander"],
      steps: [
        "Pour a small mug of tomato soup and season lightly.",
        "This works well when you want a warm savory snack with a gentle portion size.",
      ],
    },
    {
      title: "Chia mango pudding",
      ingredients: ["2 tbsp chia seeds", "1/2 cup unsweetened milk", "3-4 tbsp mango pieces", "Pinch cardamom"],
      steps: [
        "Stir chia seeds into unsweetened milk and let it thicken in the fridge.",
        "Top with a modest spoonful of mango and a little cardamom for a fiber-forward snack.",
      ],
    },
    {
      title: "Matcha chia pudding",
      ingredients: ["2 tbsp chia seeds", "1/2 cup unsweetened milk", "1/2 tsp matcha", "Optional cinnamon"],
      steps: [
        "Whisk matcha into the milk, then stir in chia seeds and chill until thick.",
        "Keep it lightly sweet or unsweetened so it stays aligned with the low-sugar snack direction.",
      ],
    },
    {
      title: "Berry chia cup",
      ingredients: ["2 tbsp chia seeds", "1/2 cup unsweetened yogurt or milk", "Handful berries"],
      steps: [
        "Let chia seeds soak in yogurt or milk until thickened.",
        "Top with berries for extra fiber and a more filling snack texture.",
      ],
    },
    {
      title: "Overnight oats mini jar",
      ingredients: ["1/4 cup rolled oats", "1 tbsp chia seeds", "1/2 cup unsweetened milk", "Cinnamon"],
      steps: [
        "Mix oats, chia, milk, and cinnamon in a small jar and chill overnight.",
        "Use a small portion so it stays snack-sized while still adding fiber.",
      ],
    },
    {
      title: "Cocoa chia pudding",
      ingredients: ["2 tbsp chia seeds", "1/2 cup unsweetened milk", "1 tsp cocoa", "Pinch cinnamon"],
      steps: [
        "Whisk cocoa into the milk, stir in chia seeds, and chill until set.",
        "This gives a dessert-style texture without needing a sugary pudding base.",
      ],
    },
  ];
}

const educationCardConfig = [
  {
    id: "what-is-pcos",
    topic: "pcos",
    icon: "🌿",
    action: "Think hormones, insulin sensitivity, and steady routines instead of one perfect fix.",
  },
  {
    id: "what-are-high-triglycerides",
    topic: "triglycerides",
    icon: "💧",
    action: "Aim for steady energy, not sugar spikes.",
  },
  {
    id: "what-should-i-eat-for-pcos",
    topic: "pcos",
    icon: "✨",
    action: "Balanced meals and consistency matter more than a perfect diet.",
  },
  {
    id: "what-should-i-eat-for-high-triglycerides",
    topic: "triglycerides",
    icon: "🥗",
    action: "Think veggies, legumes, whole grains, and lean protein first.",
  },
  {
    id: "what-exercise-helps-pcos",
    topic: "pcos",
    icon: "🏋️‍♀️",
    action: "Regular cardio plus strength training usually works better than extreme intensity.",
  },
  {
    id: "what-exercise-helps-high-triglycerides",
    topic: "triglycerides",
    icon: "🏃‍♀️",
    action: "Repeatable cardio plus strength beats random all-out sessions.",
  },
  {
    topic: "pcos",
    title: "What should I avoid with PCOS?",
    desc: "Sugary desserts, white bread, heavily refined starches, and frequent high-glycemic foods are often worth limiting because they can make energy and insulin control harder.",
    icon: "🚫",
    action: "Start by cutting back the sugary and heavily refined foods you eat most often.",
  },
  {
    topic: "triglycerides",
    title: "What should I avoid with high triglycerides?",
    desc: "Sugary drinks, desserts, refined carbohydrates, trans fat, excess saturated fat, and alcohol are the highest-yield things to cut back because they can push triglycerides higher.",
    icon: "⛔",
    action: "Reduce sugar first, then watch alcohol and heavily processed foods.",
  },
];

const faqRulesById = new Map(faqRules.map((rule) => [rule.id, rule]));

export const meals = {
  breakfast: breakfastCategory.recipes.map(buildRecipeCard),
  lunch: lunchCategory.recipes.map(buildRecipeCard),
  dinner: dinnerCategory.recipes.map(buildRecipeCard),
  snacks: buildSnackCards(),
};

export const education = educationCardConfig
  .map((item) => {
    if (!item.id) {
      return item;
    }

    const rule = faqRulesById.get(item.id);
    if (!rule) return null;

    return {
      title: rule.question_patterns?.[0]
        ? rule.question_patterns[0]
            .replace(/^what\s+/i, "What ")
            .replace(/^how\s+/i, "How ")
            .replace(/\bpcos\b/g, "PCOS")
            .replace(/\bi\b/g, "I")
            .replace(/\btriglycerides\b/g, "triglycerides")
            .replace(/\s+/g, " ")
            .replace(/^\w/, (char) => char.toUpperCase())
        : rule.topic,
      desc: rule.short_answer,
      action: item.action,
      icon: item.icon,
      topic: item.topic,
    };
  })
  .filter(Boolean);

const machineGuidance = {
  "Leg Press": {
    tips: "Set the seat so your knees can bend without your lower back rolling off the pad.",
    how: [
      "Drive through the full foot and keep your knees tracking over your toes.",
      "Press smoothly and stop before a hard knee lockout.",
    ],
    watch: ["Do not lower so far that your hips tuck under and your low back rounds."],
  },
  "Angled Leg Press": {
    tips: "Use the sled with the same lower-back and knee-control rules as a flat leg press.",
    how: [
      "Keep the feet planted through the full foot and move with a steady tempo.",
      "Use a range you can control without the hips rolling under.",
    ],
    watch: ["Do not chase depth that makes the low back round off the pad."],
  },
  "Hack Squat": {
    tips: "Keep the torso supported and descend only as far as you can keep pressure balanced through the feet.",
    how: [
      "Move with a controlled lower and smooth drive upward.",
      "Keep the knees tracking with the toes instead of collapsing inward.",
    ],
    watch: ["Do not bounce out of the bottom or force painful knee depth."],
  },
  "Belt Squat": {
    tips: "Treat it like a controlled squat pattern with a steady torso and balanced foot pressure.",
    how: [
      "Use a smooth lower and drive back up without jerking the load.",
      "Keep the range comfortable and repeatable.",
    ],
    watch: ["Do not let the setup pull you into a loose or rushed bottom position."],
  },
  "Leg Curl": {
    tips: "Line up the knee with the machine pivot and keep your hips pinned to the pad.",
    how: [
      "Curl under control and let the hamstrings do the work.",
      "Take the lowering phase slowly.",
    ],
    watch: ["Do not arch or lift your hips to help the weight move."],
  },
  "Leg Extension": {
    tips: "Line up the machine pivot with your knee and place the pad just above the ankle.",
    how: [
      "Lift with control and pause briefly at the top if your knees tolerate it well.",
      "Lower smoothly instead of swinging the stack.",
    ],
    watch: ["Do not force a painful end range if your knees feel sharp or unstable."],
  },
  "Glute Press": {
    tips: "Use a controlled hip-drive instead of throwing the leg back with momentum.",
    how: [
      "Keep the torso stable and move through a repeatable range.",
      "Pause briefly at the end of the drive if you can keep control.",
    ],
    watch: ["Do not twist through the trunk to make the rep look bigger."],
  },
  "Abduction Adduction Machine": {
    tips: "Stay tall through the torso and move the pads with controlled in-and-out reps.",
    how: [
      "Set a range you can control cleanly.",
      "Pause briefly at the end of the rep before returning.",
    ],
    watch: ["Do not jerk the pads open or closed."],
  },
  "Standing Calf Raise": {
    tips: "Move through a full calf stretch at the bottom and a controlled squeeze at the top.",
    how: [
      "Keep the reps smooth and the tempo steady.",
      "Use the balls of the feet and avoid bouncing.",
    ],
    watch: ["Do not rush the bottom stretch or turn it into a bounce."],
  },
  "Seated Calf Raise": {
    tips: "Use a full stretch and smooth top squeeze without bouncing the reps.",
    how: [
      "Keep the movement controlled in both directions.",
      "Pause briefly at the top before lowering again.",
    ],
    watch: ["Do not turn the stretch into a fast rebound."],
  },
  "Chest Press": {
    tips: "Set the seat so the handles start around mid-chest and your wrists stay neutral.",
    how: [
      "Keep your shoulder blades lightly set against the pad.",
      "Press smoothly to near lockout and return with control.",
    ],
    watch: ["Do not shrug your shoulders forward or slam the handles back."],
  },
  "Incline Press": {
    tips: "Press on an upward angle with the shoulders set and the handle path controlled.",
    how: [
      "Set the seat so the handles line up with the upper chest.",
      "Move with a steady press and controlled return.",
    ],
    watch: ["Do not let the shoulders roll forward at the end of the rep."],
  },
  "Seated Row": {
    tips: "Sit tall, set your feet, and pull the handle toward the lower ribs or upper abdomen.",
    how: [
      "Let the shoulder blades move under control at the start of each rep.",
      "Finish the pull without jerking the first inch with lower-back momentum.",
    ],
    watch: ["Do not round aggressively through the spine to chase extra reach."],
  },
  "Lat Pulldown": {
    tips: "Lock the thigh pad snugly and pull toward the upper chest with a steady torso.",
    how: [
      "Start each rep by setting the shoulders down before pulling.",
      "Use a smooth return instead of letting the bar fly up.",
    ],
    watch: ["Do not lean back hard or yank the bar with body momentum."],
  },
  "Shoulder Press": {
    tips: "Set the seat so the handles begin near ear level and press in a controlled vertical path.",
    how: [
      "Keep the ribcage down and move through a controlled range.",
      "Press smoothly instead of forcing a grindy rep.",
    ],
    watch: ["Do not flare into a painful overhead range or shrug hard into the rep."],
  },
  "Biceps Curl": {
    tips: "Keep the elbows planted and use a smooth curl instead of swinging the torso.",
    how: [
      "Lift with control and lower slowly.",
      "Keep the wrists neutral through the full rep.",
    ],
    watch: ["Do not rock the shoulders back to cheat the weight up."],
  },
  "Preacher Curl Bench": {
    tips: "Use the bench to keep the upper arm supported and make the curl honest.",
    how: [
      "Lower with control and avoid dropping into the bottom fast.",
      "Keep the movement focused through the elbow joint.",
    ],
    watch: ["Do not yank out of the bottom range."],
  },
  "Bilateral Arm Curl": {
    tips: "Curl both arms with the elbows fixed and the torso still.",
    how: [
      "Move through a smooth curl and slow lower.",
      "Keep the wrists neutral and avoid shoulder swing.",
    ],
    watch: ["Do not rock the torso to create momentum."],
  },
  "EZ Curl Bar": {
    tips: "Use the angled grip to curl under control with the elbows staying close to the body.",
    how: [
      "Lift smoothly and lower slowly.",
      "Keep the torso still and the wrists neutral.",
    ],
    watch: ["Do not turn it into a full-body swing."],
  },
  "Triceps Extension": {
    tips: "Keep the elbows pinned and press through a smooth lockout without snapping.",
    how: [
      "Move the handle with steady control both directions.",
      "Let the triceps do the work instead of turning it into a shoulder movement.",
    ],
    watch: ["Do not let the elbows drift wildly or jam the joint at lockout."],
  },
  "Tricep Dip": {
    tips: "Lower and press with control instead of dropping into the shoulders.",
    how: [
      "Use a range you can own without shoulder discomfort.",
      "Keep the tempo steady and avoid bouncing.",
    ],
    watch: ["Do not sink into a painful bottom position."],
  },
  "Abdominal Crunch": {
    tips: "Exhale as you curl the ribs toward the pelvis and keep the work in the trunk, not the neck.",
    how: [
      "Start with a load that lets you feel the abs working cleanly.",
      "Use a controlled crunch instead of yanking on the pads or handles.",
    ],
    watch: ["Do not turn the rep into a hip hinge instead of a controlled crunch."],
  },
  "Rotary Torso": {
    tips: "Set the seat and chest position so the rotation happens through the midsection with a moderate range.",
    how: [
      "Use a steady tempo because the spine usually prefers controlled rotation.",
      "Keep the range moderate and repeatable on both sides.",
    ],
    watch: ["Do not force the deepest twist or bounce off the end range."],
  },
  "Back Extension": {
    tips: "Move through the trunk under control and stop before the lower back gets cranked into a hard arch.",
    how: [
      "Brace lightly and lift with a smooth tempo.",
      "Use a range that feels strong and repeatable instead of dramatic.",
    ],
    watch: ["Do not throw the torso upward or overextend at the top."],
  },
  "Adjustable Back Extension": {
    tips: "Set the pad height so the trunk can extend with control instead of hinging too low or too high.",
    how: [
      "Brace lightly and move through a steady range.",
      "Lift and lower without swinging the torso.",
    ],
    watch: ["Do not overextend or rush the lower phase."],
  },
  Treadmill: {
    tips: "Use a pace you can sustain with tall posture and loose arms.",
    how: [
      "Increase time before intensity when you want a more sustainable progression path.",
      "Finish with a slower cooldown walk.",
    ],
    watch: ["Do not grip the rails the whole time unless you need brief balance support."],
  },
  "Cross Trainer": {
    tips: "Stay tall through the torso and use a smooth repeatable stride.",
    how: [
      "Keep the effort moderate unless the session calls for short pushes.",
      "Let the handles share the work between upper and lower body.",
    ],
    watch: ["Do not slump heavily onto the handles."],
  },
  "Upright Bike": {
    tips: "Use a steady pace you can sustain and build time before chasing harder efforts.",
    how: [
      "Settle into a repeatable cadence and breathe evenly.",
      "Use a few easier minutes to cool down at the end.",
    ],
    watch: ["Do not start with hard intervals before the steady base feels comfortable."],
  },
  "Recumbent Bike": {
    tips: "Use the supported seat to build steady cardio minutes with a comfortable, repeatable cadence.",
    how: [
      "Set the seat so the pedals feel smooth rather than cramped.",
      "Build time first, then add challenge later if needed.",
    ],
    watch: ["Do not mash the pedals with a rushed, uneven rhythm."],
  },
  "Stair Climber": {
    tips: "Climb tall with a steady rhythm and use the rails lightly.",
    how: [
      "Keep most work moderate and add short pushes only when your base feels solid.",
      "Downshift for a few slower minutes before stopping.",
    ],
    watch: ["Do not lean your body weight into the rails the whole session."],
  },
  "Virtual Bike": {
    tips: "Treat it like steady cardio first and keep the rhythm repeatable.",
    how: [
      "Use most sessions for smooth aerobic work rather than all-out efforts.",
      "Cool down for a few easier minutes before stopping.",
    ],
    watch: ["Do not let the pace spike so hard that the session stops being repeatable."],
  },
};

function buildWorkout(name, machine, sets, options = {}) {
  const guidance = machineGuidance[machine] ?? machineGuidance[name] ?? {
    tips: `Use ${name} with a controlled range and steady tempo.`,
    how: ["Keep the setup aligned and stop before form slips."],
    watch: ["If the setup feels wrong, reduce load and fix alignment first."],
  };

  return {
    name,
    machine,
    sets,
    rest: options.rest ?? null,
    summary: options.summary ?? "",
    source: options.source ?? "",
    tips: guidance.tips,
    how: guidance.how,
    watch: guidance.watch,
  };
}

export const workoutCatalog = {
  lower: [
    buildWorkout("Leg Press", "Leg Press", "3 sets of 8 to 12 reps", {
      summary: "A strong lower-body base move from the lower-body routines.",
      source: "Lower Body Routine / Leg Day Routine",
    }),
    buildWorkout("Angled Leg Press", "Angled Leg Press", "3 sets of 8 to 12 reps", {
      summary: "An alternative lower-body press when you want a sled-based squat pattern.",
      source: "Leg Day Routine",
    }),
    buildWorkout("Hack Squat", "Hack Squat", "2 to 3 sets of 8 to 10 reps", {
      summary: "A supported squat pattern used as a confidence-dependent lower-body option.",
      source: "Lower Body Routine / Leg Day Routine",
    }),
    buildWorkout("Belt Squat", "Belt Squat", "2 to 3 sets of 8 to 10 reps", {
      summary: "A lower-body squat variation listed as an option when recovery and setup feel good.",
      source: "Lower Body Routine / Leg Day Routine",
    }),
    buildWorkout("Leg Curl", "Leg Curl", "3 sets of 10 to 12 reps", {
      summary: "A hamstring-focused accessory that shows up across the lower-body plans.",
      source: "Lower Body Routine / Basic Gym Plan",
    }),
    buildWorkout("Leg Extension", "Leg Extension", "2 to 3 sets of 10 to 12 reps", {
      summary: "A quad-focused accessory that follows the main lower-body press pattern.",
      source: "Lower Body Routine / Leg Day Routine / Basic Gym Plan",
    }),
    buildWorkout("Glute Press", "Glute Press", "2 to 3 sets of 8 to 10 reps", {
      summary: "A glute-focused option used after the main press and hamstring work.",
      source: "Lower Body Routine / Leg Day Routine",
    }),
    buildWorkout("Hip Abduction/Adduction", "Abduction Adduction Machine", "2 to 3 sets of 10 to 15 reps", {
      summary: "A controlled accessory for hip work and extra lower-body volume.",
      source: "Lower Body Routine",
    }),
    buildWorkout("Standing Calf Raise", "Standing Calf Raise", "2 to 3 sets of 12 to 15 reps", {
      summary: "A calf finisher recommended at the end of leg day.",
      source: "Leg Day Routine",
    }),
    buildWorkout("Seated Calf Raise", "Seated Calf Raise", "2 to 3 sets of 12 to 15 reps", {
      summary: "A seated calf option listed as part of the leg-day finish.",
      source: "Leg Day Routine",
    }),
  ],
  upper: [
    buildWorkout("Chest Press", "Chest Press", "3 sets of 8 to 12 reps", {
      summary: "A primary upper-body press from the upper-body and mixed-day plans.",
      source: "Upper Body Routine / Basic Gym Plan",
    }),
    buildWorkout("Incline Press", "Incline Press", "3 sets of 8 to 12 reps", {
      summary: "An upper-chest pressing alternative listed alongside chest press.",
      source: "Upper Body Routine",
    }),
    buildWorkout("Seated Row", "Seated Row", "3 sets of 8 to 12 reps", {
      summary: "A row pattern used as a core upper-body pull in the machine plans.",
      source: "Upper Body Routine / Basic Gym Plan",
    }),
    buildWorkout("Lat Pulldown", "Lat Pulldown", "3 sets of 8 to 12 reps", {
      summary: "A vertical pull option used in the upper-body and machine-based plans.",
      source: "Upper Body Routine / Basic Gym Plan",
    }),
    buildWorkout("Shoulder Press", "Shoulder Press", "2 to 3 sets of 8 to 10 reps", {
      summary: "A vertical press recommended after the main chest and back work.",
      source: "Upper Body Routine / Basic Gym Plan",
    }),
  ],
  cardio: [
    buildWorkout("Treadmill", "Treadmill", "20 to 30 minutes steady", {
      summary: "A repeatable cardio base option for walking, jogging, or incline work.",
      source: "Cardio Routine / High Triglycerides Gym Routine",
    }),
    buildWorkout("Cross Trainer", "Cross Trainer", "20 to 30 minutes steady", {
      summary: "A low-impact standing cardio option used across the cardio-focused plans.",
      source: "Cardio Routine / PCOS Gym Routine",
    }),
    buildWorkout("Upright Bike", "Upright Bike", "20 to 30 minutes steady", {
      summary: "A seated cardio option used for base-building and smooth pacing days.",
      source: "Cardio Routine / Basic Gym Plan",
    }),
    buildWorkout("Recumbent Bike", "Recumbent Bike", "20 to 30 minutes steady", {
      summary: "A supported seated cardio option for easy repeatable aerobic work.",
      source: "Cardio Routine / Core Training Routine",
    }),
    buildWorkout("Stair Climber", "Stair Climber", "Short pushes after a steady base, or 20 to 30 minutes smooth pacing", {
      summary: "A step-based cardio option used for either smooth pacing or a small number of harder pushes.",
      source: "Cardio Routine / High Triglycerides Gym Routine",
    }),
    buildWorkout("Virtual Bike", "Virtual Bike", "Short harder pushes after a steady base", {
      summary: "An interval-style cardio option only after steady work already feels comfortable.",
      source: "Cardio Routine / High Triglycerides Gym Routine",
    }),
  ],
  core: [
    buildWorkout("Abdominal Crunch", "Abdominal Crunch", "3 sets of 10 to 15 controlled reps", {
      summary: "A trunk-flexion machine used as the main anchor of the core routine.",
      source: "Core Training Routine / Basic Gym Plan",
    }),
    buildWorkout("Rotary Torso", "Rotary Torso", "2 to 3 sets of 10 to 12 reps per side", {
      summary: "A controlled rotation pattern used for trunk strength and oblique work.",
      source: "Core Training Routine",
    }),
    buildWorkout("Back Extension", "Back Extension", "2 to 3 sets of 10 to 12 reps", {
      summary: "A trunk-extension movement added after crunch and rotation work.",
      source: "Core Training Routine",
    }),
    buildWorkout("Adjustable Back Extension", "Adjustable Back Extension", "2 to 3 sets of 10 to 12 reps", {
      summary: "An adjustable extension option listed as an alternative trunk-extension movement.",
      source: "Core Training Routine",
    }),
  ],
  arms: [
    buildWorkout("Biceps Curl", "Biceps Curl", "3 sets of 10 to 12 reps", {
      summary: "A direct arm movement used as the main biceps anchor on arm day.",
      source: "Arm Day Routine",
    }),
    buildWorkout("Preacher Curl Bench", "Preacher Curl Bench", "3 sets of 10 to 12 reps", {
      summary: "A preacher-style arm option listed as an alternative first biceps movement.",
      source: "Arm Day Routine",
    }),
    buildWorkout("Bilateral Arm Curl", "Bilateral Arm Curl", "2 to 3 sets of 10 to 12 reps", {
      summary: "An additional curl variation for direct arm work.",
      source: "Arm Day Routine",
    }),
    buildWorkout("EZ Curl Bar", "EZ Curl Bar", "2 to 3 sets of 10 to 12 reps", {
      summary: "A free-weight curl option listed as part of the arm-day choices.",
      source: "Arm Day Routine",
    }),
    buildWorkout("Triceps Extension", "Triceps Extension", "3 sets of 10 to 12 reps", {
      summary: "The main triceps movement used on arm day.",
      source: "Arm Day Routine",
    }),
    buildWorkout("Tricep Dip", "Tricep Dip", "2 to 3 sets of 8 to 12 reps", {
      summary: "A controlled dip variation listed as an arm-day finisher.",
      source: "Arm Day Routine",
    }),
  ],
  fullbody: [
    buildWorkout("Leg Press", "Leg Press", "2 to 3 sets of 8 to 12 reps", {
      summary: "A full-body session anchor for the lower body.",
      source: "Basic Gym Plan / PCOS and High Triglycerides Gym Routine",
    }),
    buildWorkout("Chest Press", "Chest Press", "2 to 3 sets of 8 to 12 reps", {
      summary: "A machine push used inside simple full-body gym days.",
      source: "Basic Gym Plan / PCOS Gym Routine",
    }),
    buildWorkout("Seated Row", "Seated Row", "2 to 3 sets of 8 to 12 reps", {
      summary: "A machine pull used to round out the mixed full-body sessions.",
      source: "Basic Gym Plan / PCOS and High Triglycerides Gym Routine",
    }),
    buildWorkout("Abdominal Crunch", "Abdominal Crunch", "2 to 3 sets of 8 to 12 reps", {
      summary: "A trunk-focused finisher that appears in the simple mixed gym days.",
      source: "Basic Gym Plan / PCOS and High Triglycerides Gym Routine",
    }),
  ],
};

export const workoutPlans = {
  easy: {
    lower: workoutCatalog.lower,
    upper: workoutCatalog.upper,
    fitness: workoutCatalog.cardio,
    weightloss: workoutCatalog.fullbody,
  },
  medium: {
    lower: workoutCatalog.lower,
    upper: workoutCatalog.upper,
    fitness: workoutCatalog.cardio,
    weightloss: workoutCatalog.fullbody,
  },
  hard: {
    lower: workoutCatalog.lower,
    upper: workoutCatalog.upper,
    fitness: workoutCatalog.cardio,
    weightloss: workoutCatalog.fullbody,
  },
};
