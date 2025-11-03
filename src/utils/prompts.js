export const getWorkoutPrompt = (userDetails) => {
  const {
    name,
    age,
    gender,
    height,
    weight,
    fitnessGoal,
    fitnessLevel,
    workoutLocation,
    availableTime,
    medicalHistory,
  } = userDetails;

  return `
You are an expert fitness coach. Create a personalized 7-day workout plan for ${name}.

USER PROFILE:
- Age: ${age} years
- Gender: ${gender}
- Height: ${height} cm
- Weight: ${weight} kg
- Fitness Goal: ${fitnessGoal}
- Current Fitness Level: ${fitnessLevel}
- Workout Location: ${workoutLocation}
- Available Time: ${availableTime} minutes per day
- Medical Considerations: ${medicalHistory || "None"}

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no extra text.

Return this exact JSON structure:

{
  "days": [
    {
      "name": "Day 1 - Upper Body Strength",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": "3",
          "reps": "12-15",
          "rest": "60s",
          "emoji": "💪",
          "notes": "Keep core tight, lower chest to floor"
        }
      ],
      "tips": "Warm up for 5-10 minutes before starting"
    }
  ],
  "generalTips": [
    "Stay hydrated throughout workout",
    "Focus on form over weight"
  ]
}

Requirements:
- Create exactly 7 days of workouts
- Each day should have 4-6 exercises
- Adjust intensity based on fitness level: ${fitnessLevel}
- Consider workout location: ${workoutLocation}
- Include warm-up and cool-down recommendations
- Add form tips and modifications for each exercise
- Make it achievable within ${availableTime} minutes
- Use appropriate emojis for visual appeal
- Provide progressive overload suggestions in tips

Return ONLY the JSON object, nothing else.
  `.trim();
};

export const getDietPrompt = (userDetails) => {
  const { name, weight, height, fitnessGoal, dietaryPreference, age, gender } =
    userDetails;

  // Calculate BMR using Mifflin-St Jeor Equation
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultiplier = 1.5; // Moderate activity
  const tdee = Math.round(bmr * activityMultiplier);

  const targetCalories =
    fitnessGoal === "weight-loss"
      ? tdee - 500
      : fitnessGoal === "muscle-gain"
      ? tdee + 300
      : tdee;

  const proteinGrams = Math.round(weight * 2);
  const carbGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.25) / 9);

  return `
You are an expert nutritionist. Create a personalized daily meal plan for ${name}.

USER PROFILE:
- Age: ${age} years
- Gender: ${gender}
- Weight: ${weight} kg
- Height: ${height} cm
- Estimated BMR: ${Math.round(bmr)} calories
- Target Calories: ${targetCalories} calories
- Fitness Goal: ${fitnessGoal}
- Dietary Preference: ${dietaryPreference}

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no extra text.

Return this exact JSON structure:

{
  "nutrition": {
    "calories": "${targetCalories}",
    "protein": "${proteinGrams}",
    "carbs": "${carbGrams}",
    "fats": "${fatGrams}"
  },
  "meals": [
    {
      "type": "Breakfast",
      "icon": "🌅",
      "time": "7:00 AM",
      "calories": "500",
      "items": [
        {
          "name": "Oatmeal with Berries",
          "portion": "1 cup oats, 1/2 cup berries",
          "calories": "350",
          "macros": {
            "protein": "12",
            "carbs": "60",
            "fats": "8"
          }
        }
      ],
      "tips": "Start your day with complex carbs and protein",
      "alternatives": ["Eggs and toast", "Protein smoothie"]
    }
  ],
  "generalTips": [
    "Drink 8-10 glasses of water daily",
    "Meal prep on Sundays"
  ],
  "supplements": [
    {
      "name": "Multivitamin",
      "dosage": "1 tablet daily",
      "timing": "With breakfast"
    }
  ],
  "hydration": "8-10 glasses (2-3 liters)"
}

Requirements:
- Create 5 meals: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner
- Each meal should align with ${dietaryPreference} preference
- Total daily calories should be approximately ${targetCalories}
- Protein target: ${proteinGrams}g, Carbs: ${carbGrams}g, Fats: ${fatGrams}g
- Include portion sizes and preparation tips
- Add 2-3 alternative options for each main meal
- Include supplement recommendations
- Make it practical and tasty
- Add appropriate emojis for each meal

Return ONLY the JSON object, nothing else.
  `.trim();
};

export const getMotivationPrompt = () => {
  return `
Generate a short, powerful motivational quote for fitness and health.
Make it inspiring, original, and action-oriented.
Keep it under 20 words.
Include one relevant emoji at the end.
Don't use quotation marks.
Return only the quote text.
  `.trim();
};
