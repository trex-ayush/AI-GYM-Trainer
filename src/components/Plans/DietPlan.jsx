import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiDownload, FiClock, FiTarget } from 'react-icons/fi';
import FoodModal from './FoodModal';
import Accordion from '../UI/Accordion';
import Button from '../UI/Button';
import { exportToPDF } from '../../utils/pdfExport';

const DietPlan = ({ plan, onRegenerate, showActions = true }) => {
  const [selectedFood, setSelectedFood] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleExportPDF = () => {
    exportToPDF(plan, 'diet-plan');
  };

  const dietData = typeof plan === 'string' ? { fullText: plan, meals: [] } : plan;
  const hasMeals = dietData.meals && dietData.meals.length > 0;

  const getMealCalories = (meal) => {
    if (meal.calories) return meal.calories;
    if (meal.items && meal.items.length > 0) {
      return meal.items.reduce((sum, item) => {
        const calories = typeof item.calories === 'number' ? item.calories : parseFloat(item.calories) || 0;
        return sum + calories;
      }, 0);
    }
    return 0;
  };

  const getMealVariant = (mealType) => {
    const variants = {
      'Breakfast': 'info',
      'Mid-Morning Snack': 'default',
      'Lunch': 'primary',
      'Evening Snack': 'default',
      'Dinner': 'secondary',
      'Post-Workout': 'success',
    };
    return variants[mealType] || 'default';
  };

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            icon={<FiDownload />}
            size="sm"
          >
            Export PDF
          </Button>
          <Button
            onClick={onRegenerate}
            variant="secondary"
            icon={<FiRefreshCw />}
            size="sm"
          >
            Regenerate
          </Button>
        </div>
      )}

      {dietData.nutrition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Daily Nutrition Targets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {dietData.nutrition.calories || '2000'}
              </p>
              <p className="text-xs text-gray-400">kcal</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protein</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {dietData.nutrition.protein || '150'}
              </p>
              <p className="text-xs text-gray-400">grams</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {dietData.nutrition.carbs || '200'}
              </p>
              <p className="text-xs text-gray-400">grams</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fats</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {dietData.nutrition.fats || '65'}
              </p>
              <p className="text-xs text-gray-400">grams</p>
            </div>
          </div>
        </motion.div>
      )}

      {dietData.fullText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5 border border-emerald-200 dark:border-emerald-800"
        >
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <span>📋</span> Complete Diet Plan
          </h3>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {dietData.fullText}
          </div>
        </motion.div>
      )}

      {hasMeals ? (
        <div className="space-y-3">
          {dietData.meals.map((meal, index) => {
            const mealCalories = getMealCalories(meal);
            
            return (
              <Accordion
                key={index}
                title={meal.type || `Meal ${index + 1}`}
                icon={meal.icon || getMealIcon(meal.type)}
                defaultOpen={index === 0}
                variant={getMealVariant(meal.type)}
                size="small"
                rightContent={
                  <div className="flex items-center gap-3 text-xs">
                    {meal.time && (
                      <span className="flex items-center gap-1 opacity-90">
                        <FiClock size={12} />
                        {meal.time}
                      </span>
                    )}
                    {mealCalories > 0 && (
                      <span className="flex items-center gap-1 font-semibold">
                        {Math.round(mealCalories)} cal
                      </span>
                    )}
                  </div>
                }
              >
                <div className="space-y-3">
                  {meal.items && meal.items.length > 0 ? (
                    meal.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                        onClick={() => handleFoodClick(item)}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                            {item.portion && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Portion: {item.portion}
                              </p>
                            )}
                            {item.macros && (
                              <div className="flex gap-3 mt-3">
                                <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
                                  P: {item.macros.protein}g
                                </span>
                                <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                                  C: {item.macros.carbs}g
                                </span>
                                <span className="text-xs px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded">
                                  F: {item.macros.fats}g
                                </span>
                              </div>
                            )}
                          </div>
                          {item.calories && (
                            <div className="ml-4 text-right">
                              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                {item.calories}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">cal</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                      See complete plan above for meal details
                    </p>
                  )}
                </div>

                {meal.tips && (
                  <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                    <p className="text-xs text-sky-700 dark:text-sky-300">
                      <strong>Tip:</strong> {meal.tips}
                    </p>
                  </div>
                )}

                {meal.alternatives && meal.alternatives.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Alternative Options:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meal.alternatives.map((alt, altIndex) => (
                        <span
                          key={altIndex}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                        >
                          {alt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Accordion>
            );
          })}
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            ℹ️ Your personalized diet plan is displayed above.
          </p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-4 border border-sky-200 dark:border-sky-800"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">💧</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1 text-gray-900 dark:text-gray-100">Hydration Goal</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Drink at least {dietData.hydration || '8-10 glasses'} of water throughout the day
            </p>
          </div>
        </div>
      </motion.div>

      {showModal && selectedFood && (
        <FoodModal
          food={selectedFood}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const getMealIcon = (mealType) => {
  const icons = {
    'Breakfast': '🌅',
    'Mid-Morning Snack': '🍎',
    'Lunch': '🍱',
    'Evening Snack': '🥤',
    'Dinner': '🍽️',
    'Post-Workout': '💪',
  };
  return icons[mealType] || '🍽️';
};

export default DietPlan;