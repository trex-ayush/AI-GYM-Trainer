import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiDownload, FiActivity, FiClock, FiRepeat } from 'react-icons/fi';
import ExerciseModal from './ExerciseModal';
import Accordion from '../UI/Accordion';
import Button from '../UI/Button';
import { exportToPDF } from '../../utils/pdfExport';

const WorkoutPlan = ({ plan, onRegenerate, showActions = true }) => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setShowModal(true);
  };

  const handleExportPDF = () => {
    exportToPDF(plan, 'workout-plan');
  };

  const workoutData = typeof plan === 'string' ? { fullText: plan, days: [] } : plan;
  const hasDays = workoutData.days && workoutData.days.length > 0;

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

      {workoutData.fullText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <FiActivity className="text-slate-600 dark:text-slate-400" />
            Complete Workout Plan
          </h3>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {workoutData.fullText}
          </div>
        </motion.div>
      )}

      {hasDays ? (
        <div className="space-y-3">
          {workoutData.days.map((day, index) => (
            <Accordion
              key={index}
              title={day.name || `Day ${index + 1}`}
              icon={<FiActivity />}
              defaultOpen={index === 0}
              variant="primary"
              size="small"
              rightContent={
                day.focus && (
                  <span className="text-xs italic opacity-75">{day.focus}</span>
                )
              }
            >
              <div className="space-y-3">
                {day.exercises && day.exercises.length > 0 ? (
                  day.exercises.map((exercise, exIndex) => (
                    <motion.div
                      key={exIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: exIndex * 0.05 }}
                      onClick={() => handleExerciseClick(exercise)}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {exIndex + 1}. {exercise.name || 'Exercise'}
                          </h4>
                          <div className="mt-2 flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <FiRepeat className="text-gray-500" />
                              <span className="font-medium">Sets:</span> {exercise.sets || '3'}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Reps:</span> {exercise.reps || '10-12'}
                            </span>
                            {exercise.duration && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <FiClock className="text-gray-500" />
                                {exercise.duration}
                              </span>
                            )}
                            {exercise.rest && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Rest:</span> {exercise.rest}
                              </span>
                            )}
                          </div>
                          {exercise.notes && (
                            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-xs text-amber-800 dark:text-amber-200">
                              💡 {exercise.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                    See complete plan above for exercise details
                  </p>
                )}
              </div>

              {day.tips && (
                <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                  <p className="text-xs text-sky-700 dark:text-sky-300">
                    <strong>Pro Tip:</strong> {day.tips}
                  </p>
                </div>
              )}
            </Accordion>
          ))}
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            ℹ️ Your personalized workout plan is displayed above.
          </p>
        </div>
      )}

      {workoutData.generalTips && workoutData.generalTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Pro Tips
          </h3>
          <ul className="space-y-2">
            {workoutData.generalTips.map((tip, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                <span className="mr-2 text-indigo-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {showModal && selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default WorkoutPlan;