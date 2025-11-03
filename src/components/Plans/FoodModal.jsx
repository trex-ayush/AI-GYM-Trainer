import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiShoppingCart } from 'react-icons/fi';
import { generateFoodImage } from '../../services/geminiService';

const FoodModal = ({ food, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImage();
  }, [food]);

  const loadImage = async () => {
    setLoading(true);
    try {
      const url = await generateFoodImage(food.name);
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to load image:', error);
      setImageUrl(`https://source.unsplash.com/800x600/?${encodeURIComponent(food.name)},food,healthy`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold">{food.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              {loading ? (
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Generating image...</p>
                  </div>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={food.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Image load error, using placeholder');
                    e.target.src = 'https://via.placeholder.com/800x600/10b981/ffffff?text=🍽️+' + encodeURIComponent(food.name);
                  }}
                />
              ) : (
                <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">🍽️</div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Portion Size</p>
                    <p className="text-lg font-semibold">{food.portion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {food.calories}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">calories</p>
                  </div>
                </div>
              </div>

              {food.macros && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FiInfo />
                    Macronutrients
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🥩</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {food.macros.protein}g
                      </p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🌾</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                        {food.macros.carbs}g
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🥑</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fats</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {food.macros.fats}g
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FiShoppingCart />
                  Ingredients
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {getIngredients(food.name).map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Preparation Tips</h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Use fresh ingredients for best taste and nutrition</li>
                  <li>• Prep in advance for meal consistency</li>
                  <li>• Store properly to maintain freshness</li>
                  <li>• Adjust seasoning to your preference</li>
                </ul>
              </div>

              {/* Health Benefits */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Health Benefits</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {getHealthBenefits(food.name).map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-200 dark:bg-green-800 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const getIngredients = (foodName) => {
  const ingredientMap = {
    default: [
      'Main ingredient',
      'Fresh vegetables',
      'Healthy seasonings',
      'Quality protein source'
    ]
  };
  
  return ingredientMap[foodName] || ingredientMap.default;
};

const getHealthBenefits = (foodName) => {
  return [
    'High Protein',
    'Rich in Vitamins',
    'Good Fiber',
    'Heart Healthy',
    'Energy Boost'
  ];
};

export default FoodModal;