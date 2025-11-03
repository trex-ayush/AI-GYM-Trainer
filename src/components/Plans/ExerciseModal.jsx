import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiImage } from 'react-icons/fi';
import { generateExerciseImage } from '../../services/geminiService';

const ExerciseModal = ({ exercise, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImage();
  }, [exercise]);

  const loadImage = async () => {
    setLoading(true);
    try {
      const url = await generateExerciseImage(exercise.name);
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to load image:', error);
      setImageUrl(`https://source.unsplash.com/800x600/?${encodeURIComponent(exercise.name)},fitness,exercise,gym`);
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
            <h2 className="text-2xl font-bold">{exercise.name}</h2>
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
                    <FiImage className="text-4xl text-gray-400 mb-2 animate-pulse mx-auto" />
                    <p className="text-gray-500">Generating image...</p>
                  </div>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={exercise.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Image load error, using placeholder');
                    e.target.src = 'https://via.placeholder.com/800x600/3b82f6/ffffff?text=💪+' + encodeURIComponent(exercise.name);
                  }}
                />
              ) : (
                <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">{exercise.emoji || '💪'}</div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sets</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {exercise.sets}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reps</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {exercise.reps}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rest</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {exercise.rest}
                  </p>
                </div>
              </div>

              {exercise.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-gray-600 dark:text-gray-300">{exercise.notes}</p>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-400">
                  Pro Tips
                </h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Focus on proper form over speed</li>
                  <li>• Breathe consistently throughout the movement</li>
                  <li>• Adjust weight/resistance as needed</li>
                  <li>• Stop if you feel any pain</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseModal;