import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkoutPrompt, getDietPrompt, getMotivationPrompt } from '../utils/prompts';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}
const MODEL_NAMES = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro'
];

async function getWorkingModel() {
  if (!genAI) {
    throw new Error('API key not configured');
  }

  for (const modelName of MODEL_NAMES) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      
      const testResult = await model.generateContent('Test');
      await testResult.response.text();
      
      console.log(`✅ Using model: ${modelName}`);
      if (modelName.includes('2.0')) {
        console.log('🚀 Using latest Gemini 2.0 - Enhanced capabilities!');
      }
      
      return model;
    } catch (error) {
      console.log(`❌ Model ${modelName} failed: ${error.message}`);
      
      if (error.message.includes('404') || error.message.includes('not found')) {
        continue;
      }
      
      console.warn(`⚠️ Unexpected error with ${modelName}:`, error);
      continue;
    }
  }
  
  throw new Error('No working Gemini model found. Please check your API key and internet connection.');
}
async function getImageModel() {
  if (!genAI) {
    throw new Error('API key not configured');
  }
  const imageModels = [
    'gemini-2.5-flash-preview-05-20',  // Latest preview
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash'
  ];

  for (const modelName of imageModels) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
        },
      });
      
      console.log(`✅ Attempting image generation with: ${modelName}`);
      return model;
    } catch (error) {
      console.log(`❌ Image model ${modelName} not available: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('No working image generation model found');
}

function parseGeminiJSON(text) {
  try {
    let cleanText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    const parsed = JSON.parse(cleanText);
    console.log('✅ Successfully parsed JSON response');
    return parsed;
  } catch (error) {
    console.error('❌ JSON parsing failed:', error.message);
    console.log('Raw text:', text.substring(0, 200) + '...');
    throw new Error('Failed to parse JSON from response');
  }
}
function parseWorkoutText(text, userDetails) {
  console.log('⚠️ Using text parser for workout plan');
  
  const days = [];
  const dayPattern = /(?:Day\s+(\d+)|(\d+)\.\s*Day)[:\-\s]*(.*?)(?=(?:Day\s+\d+|\d+\.\s*Day|$))/gis;
  const dayMatches = [...text.matchAll(dayPattern)];
  
  if (dayMatches.length > 0) {
    dayMatches.forEach((match, index) => {
      const dayNum = match[1] || match[2] || (index + 1);
      const dayContent = match[3] || match[0];
      const exercises = [];
      
      const exercisePattern = /[-•*]\s*([^:\n]+?)[\s:-]*(?:Sets?[:\s]*(\d+)[,\s]*Reps?[:\s]*(\d+(?:-\d+)?)[,\s]*Rest[:\s]*([^\n]+))?/gi;
      const exerciseMatches = [...dayContent.matchAll(exercisePattern)];
      
      exerciseMatches.forEach(exMatch => {
        if (exMatch[1]) {
          exercises.push({
            name: exMatch[1].trim(),
            sets: exMatch[2] || '3',
            reps: exMatch[3] || '10-12',
            rest: exMatch[4] || '60s',
            emoji: getExerciseEmoji(exMatch[1]),
            notes: 'Focus on proper form and controlled movements'
          });
        }
      });
      
      if (exercises.length === 0) {
        exercises.push(
          {
            name: 'Warm-up',
            sets: '1',
            reps: '5-10 minutes',
            rest: 'N/A',
            emoji: '🔥',
            notes: 'Light cardio and dynamic stretching'
          },
          {
            name: 'Main Exercise',
            sets: '3-4',
            reps: '10-12',
            rest: '60-90s',
            emoji: '💪',
            notes: 'Follow the detailed plan above'
          }
        );
      }
      
      days.push({
        name: `Day ${dayNum} - ${getDayName(index, userDetails.fitnessGoal)}`,
        exercises: exercises,
        tips: 'Focus on proper form, stay hydrated, and listen to your body'
      });
    });
  }
  
  if (days.length === 0) {
    for (let i = 0; i < 7; i++) {
      days.push({
        name: `Day ${i + 1} - ${getDayName(i, userDetails.fitnessGoal)}`,
        exercises: [
          {
            name: i === 6 ? 'Rest Day' : 'Full Body Workout',
            sets: i === 6 ? '0' : '3-4',
            reps: i === 6 ? 'Recovery' : '10-12',
            rest: i === 6 ? 'N/A' : '60s',
            emoji: i === 6 ? '😴' : '💪',
            notes: 'See detailed plan in the text above'
          }
        ],
        tips: 'Refer to the complete plan for specific exercises'
      });
    }
  }
  
  return {
    days: days.slice(0, 7),
    generalTips: extractTips(text) || [
      '🔥 Always warm up before starting',
      '💧 Stay hydrated throughout',
      '🎯 Focus on form over weight',
      '📈 Progressive overload is key',
      '😴 Get adequate rest and recovery'
    ],
    fullText: text
  };
}

function parseDietText(text, userDetails) {
  console.log('⚠️ Using text parser for diet plan');
  
  const meals = [];
  const mealTypes = ['Breakfast', 'Mid-Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
  const mealIcons = ['🌅', '🥜', '🥗', '🍎', '🍽️'];
  const mealTimes = ['7:00 AM', '10:30 AM', '1:00 PM', '4:30 PM', '7:30 PM'];
  
  mealTypes.forEach((mealType, index) => {
    const mealPattern = new RegExp(`${mealType}[:\\s]*(.*?)(?=${mealTypes[index + 1] || 'Supplements|Hydration|Tips|$'})`, 'is');
    const match = text.match(mealPattern);
    
    const items = [];
    if (match && match[1]) {
      const content = match[1];
      const itemPattern = /[-•*]\s*([^:\n]+?)(?:[:\s]*(\d+)\s*(?:cal|kcal|calories))?/gi;
      const itemMatches = [...content.matchAll(itemPattern)];
      
      itemMatches.forEach(item => {
        if (item[1] && item[1].length > 3) {
          items.push({
            name: item[1].trim(),
            portion: 'See plan details',
            calories: item[2] || '200',
            macros: {
              protein: '15',
              carbs: '25',
              fats: '8'
            }
          });
        }
      });
    }
    
    if (items.length === 0) {
      items.push({
        name: `${mealType} - See detailed plan`,
        portion: 'Refer to complete plan above',
        calories: '300',
        macros: { protein: '20', carbs: '30', fats: '10' }
      });
    }
    
    meals.push({
      type: mealType,
      icon: mealIcons[index],
      time: mealTimes[index],
      calories: items.reduce((sum, item) => sum + parseInt(item.calories || 0), 0).toString(),
      items: items,
      tips: `Healthy ${mealType.toLowerCase()} options for your goals`,
      alternatives: ['Option 1', 'Option 2']
    });
  });
  
  const calorieMatch = text.match(/(\d{4,5})\s*(?:cal|kcal|calories)/i);
  const proteinMatch = text.match(/(\d{2,3})\s*g?\s*protein/i);
  const carbMatch = text.match(/(\d{2,3})\s*g?\s*carb/i);
  const fatMatch = text.match(/(\d{2,3})\s*g?\s*fat/i);
  
  return {
    nutrition: {
      calories: calorieMatch ? calorieMatch[1] : calculateCalories(userDetails).toString(),
      protein: proteinMatch ? proteinMatch[1] : Math.round(userDetails.weight * 2).toString(),
      carbs: carbMatch ? carbMatch[1] : '200',
      fats: fatMatch ? fatMatch[1] : '65'
    },
    meals: meals,
    generalTips: extractTips(text) || [
      '🍽️ Eat 5-6 smaller meals throughout the day',
      '💧 Drink at least 8-10 glasses of water daily',
      '🥬 Include colorful vegetables with every meal',
      '🍗 Prioritize lean protein sources',
      '🥑 Include healthy fats'
    ],
    supplements: extractSupplements(text),
    hydration: '8-10 glasses (2-3 liters)',
    fullText: text
  };
}

function getExerciseEmoji(exerciseName) {
  const name = exerciseName.toLowerCase();
  if (name.includes('push')) return '💪';
  if (name.includes('pull') || name.includes('row')) return '🏋️';
  if (name.includes('squat') || name.includes('leg')) return '🦵';
  if (name.includes('run') || name.includes('cardio')) return '🏃';
  if (name.includes('plank') || name.includes('core')) return '🧘';
  if (name.includes('rest')) return '😴';
  return '💪';
}

function getDayName(index, goal) {
  const patterns = {
    'weight-loss': ['Cardio & Core', 'Upper Body', 'HIIT', 'Lower Body', 'Full Body', 'Active Recovery', 'Rest'],
    'muscle-gain': ['Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Arms & Shoulders', 'Rest'],
    'general-fitness': ['Full Body', 'Cardio', 'Strength', 'Flexibility', 'HIIT', 'Active Recovery', 'Rest']
  };
  return patterns[goal]?.[index] || `Workout ${index + 1}`;
}

function extractTips(text) {
  const tips = [];
  const tipPattern = /(?:tip[s]?|remember|important|note)[:\s]*([^\n]+)/gi;
  const matches = [...text.matchAll(tipPattern)];
  
  matches.forEach(match => {
    if (match[1] && match[1].length > 10) {
      tips.push(match[1].trim());
    }
  });
  
  return tips.length > 0 ? tips.slice(0, 8) : null;
}

function extractSupplements(text) {
  const supplements = [];
  const suppPattern = /[-•*]\s*((?:Vitamin|Protein|Omega|Creatine|Multi)[^:\n]+)[:\s]*([^\n]+)/gi;
  const matches = [...text.matchAll(suppPattern)];
  
  matches.forEach(match => {
    if (match[1]) {
      supplements.push({
        name: match[1].trim(),
        dosage: match[2] || 'As directed',
        timing: 'With meals'
      });
    }
  });
  
  return supplements.length > 0 ? supplements : [
    { name: 'Multivitamin', dosage: '1 tablet daily', timing: 'With breakfast' },
    { name: 'Omega-3', dosage: '1000-2000mg', timing: 'With dinner' },
    { name: 'Vitamin D3', dosage: '2000-4000 IU', timing: 'Morning' }
  ];
}

function calculateCalories(userDetails) {
  const { weight, height, age, gender, fitnessGoal } = userDetails;
  const bmr = gender === 'male' 
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
  const tdee = Math.round(bmr * 1.5);
  
  return fitnessGoal === 'weight-loss' ? tdee - 500 : 
         fitnessGoal === 'muscle-gain' ? tdee + 300 : tdee;
}

export const generateFitnessPlan = async (userDetails) => {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Gemini API key not found. Using mock data.');
      return getMockFitnessPlan(userDetails);
    }

    const model = await getWorkingModel();
    
    console.log('🏋️ Generating workout plan...');
    const workoutPrompt = getWorkoutPrompt(userDetails);
    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutResponse = await workoutResult.response;
    const workoutText = workoutResponse.text();
    
    let workoutPlan;
    try {
      workoutPlan = parseGeminiJSON(workoutText);
      console.log('✅ Workout plan parsed as JSON');
    } catch (e) {
      console.log('⚠️ Falling back to text parsing for workout');
      workoutPlan = parseWorkoutText(workoutText, userDetails);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🥗 Generating diet plan...');
    const dietPrompt = getDietPrompt(userDetails);
    const dietResult = await model.generateContent(dietPrompt);
    const dietResponse = await dietResult.response;
    const dietText = dietResponse.text();
    
    let dietPlan;
    try {
      dietPlan = parseGeminiJSON(dietText);
      console.log('✅ Diet plan parsed as JSON');
    } catch (e) {
      console.log('⚠️ Falling back to text parsing for diet');
      dietPlan = parseDietText(dietText, userDetails);
    }
    
    console.log('✅ Plans generated successfully!');
    
    return {
      workout: workoutPlan,
      diet: dietPlan,
      timestamp: new Date().toISOString(),
      userDetails
    };
  } catch (error) {
    console.error('❌ Error generating fitness plan:', error.message);
    console.log('🔄 Falling back to mock data...');
    return getMockFitnessPlan(userDetails);
  }
};

export const generateMotivationalQuote = async () => {
  try {
    if (!API_KEY) {
      return getRandomMotivationalQuote();
    }

    const model = await getWorkingModel();
    const prompt = getMotivationPrompt();
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating motivation quote:', error.message);
    return getRandomMotivationalQuote();
  }
};

export const generateExerciseImage = async (exerciseName) => {
  try {
    console.log(`🎨 Generating image for: ${exerciseName}`);
    
    const prompt = `Professional fitness photo: Athletic person performing ${exerciseName} exercise in a modern gym. High quality, proper form, motivational lighting, 4K, photorealistic`;
    const encodedPrompt = encodeURIComponent(prompt);
    
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&enhance=true`;
    
    console.log('✅ Exercise image URL generated');
    return pollinationsUrl;
    
  } catch (error) {
    console.error('❌ Error generating exercise image:', error.message);
    return getFallbackImage(exerciseName, 'exercise');
  }
};

export const generateFoodImage = async (foodName) => {
  try {
    console.log(`🎨 Generating image for: ${foodName}`);
    
    const prompt = `Professional food photography: ${foodName}, beautifully plated, fresh ingredients, natural lighting, appetizing, high quality, 4K, overhead angle`;
    const encodedPrompt = encodeURIComponent(prompt);
    
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=600&nologo=true&enhance=true`;
    
    console.log('✅ Food image URL generated');
    return pollinationsUrl;
    
  } catch (error) {
    console.error('❌ Error generating food image:', error.message);
    return getFallbackImage(foodName, 'food');
  }
};

function getFallbackImage(itemName, type) {
  const query = encodeURIComponent(`${itemName} ${type === 'exercise' ? 'fitness exercise' : 'healthy food meal'}`);
  
  const fallbacks = [
    `https://source.unsplash.com/800x600/?${query}`,
    `https://picsum.photos/800/600?random=${Date.now()}`, 
  ];
  
  return fallbacks[0];
}

const getMockFitnessPlan = (userDetails) => {
  const { name, fitnessGoal, fitnessLevel, workoutLocation, dietaryPreference, weight, height, age, gender } = userDetails;
  
  const bmr = gender === 'male' 
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    
  const activityMultiplier = 1.5;
  const tdee = Math.round(bmr * activityMultiplier);
  
  const baseCalories = fitnessGoal === 'weight-loss' ? tdee - 500 : 
                       fitnessGoal === 'muscle-gain' ? tdee + 300 : tdee;
  
  
  console.log('📊 Using personalized mock data based on your profile');
  
  return {
    workout: { days: [], generalTips: [] }, 
    diet: { nutrition: {}, meals: [], generalTips: [] },
    timestamp: new Date().toISOString(),
    userDetails
  };
};

const getRandomMotivationalQuote = () => {
  const quotes = [
    "The only bad workout is the one that didn't happen! 💪",
    "Success starts with self-discipline! 🚀",
    "Your body can stand almost anything. It's your mind you have to convince! 🧠",
    "Don't stop when you're tired. Stop when you're done! 🔥",
    "The pain you feel today will be the strength you feel tomorrow! 💯",
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};