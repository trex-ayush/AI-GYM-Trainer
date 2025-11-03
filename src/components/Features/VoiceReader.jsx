import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiSquare, FiVolume2, FiSettings } from 'react-icons/fi';
import voiceService from '../../services/voiceService';
import Button from '../UI/Button';

const VoiceReader = ({ text, type }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const availableVoices = await voiceService.getVoices();
        setVoices(availableVoices);
        
        // Select a default voice (preferably English)
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en') && voice.localService === true
        ) || availableVoices.find(voice => 
          voice.lang.startsWith('en')
        );
        
        setSelectedVoice(englishVoice || availableVoices[0]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load voices:', error);
        setIsLoading(false);
      }
    };

    loadVoices();

    return () => {
      voiceService.stop();
      setIsPlaying(false);
      setIsPaused(false);
    };
  }, []);

  const handlePlay = async () => {
    if (!text || isLoading || voices.length === 0) {
      console.warn('Cannot play: Text is empty or voices not loaded');
      return;
    }

    try {
      setIsPlaying(true);
      setIsPaused(false);

      let cleanText = '';
      
      if (typeof text === 'string') {
        cleanText = text;
      } else if (typeof text === 'object') {
        if (text.days && Array.isArray(text.days)) {
          cleanText = text.days.map((day, index) => {
            let dayText = `Day ${index + 1}. ${day.name || ''}. `;
            if (day.focus) dayText += `Focus: ${day.focus}. `;
            
            if (day.exercises && Array.isArray(day.exercises)) {
              dayText += day.exercises.map((exercise, exIndex) => {
                let exerciseText = `Exercise ${exIndex + 1}: ${exercise.name}. `;
                if (exercise.sets) exerciseText += `${exercise.sets} sets. `;
                if (exercise.reps) exerciseText += `${exercise.reps} repetitions. `;
                if (exercise.duration) exerciseText += `Duration: ${exercise.duration}. `;
                if (exercise.rest) exerciseText += `Rest: ${exercise.rest}. `;
                if (exercise.notes) exerciseText += `Note: ${exercise.notes}. `;
                return exerciseText;
              }).join(' ');
            }
            
            if (day.tips) dayText += `Tip: ${day.tips}. `;
            return dayText;
          }).join(' ');
        }
        
        if (text.meals && Array.isArray(text.meals)) {
          cleanText = text.meals.map((meal, index) => {
            let mealText = `Meal ${index + 1}: ${meal.type || ''}. `;
            if (meal.time) mealText += `Time: ${meal.time}. `;
            if (meal.calories) mealText += `Total calories: ${meal.calories}. `;
            
            if (meal.items && Array.isArray(meal.items)) {
              mealText += 'Items: ';
              mealText += meal.items.map((item, itemIndex) => {
                let itemText = `${itemIndex + 1}. ${item.name}. `;
                if (item.portion) itemText += `Portion: ${item.portion}. `;
                if (item.calories) itemText += `${item.calories} calories. `;
                if (item.macros) {
                  itemText += `Protein: ${item.macros.protein} grams. `;
                  itemText += `Carbs: ${item.macros.carbs} grams. `;
                  itemText += `Fats: ${item.macros.fats} grams. `;
                }
                return itemText;
              }).join(' ');
            }
            
            if (meal.tips) mealText += `Tip: ${meal.tips}. `;
            return mealText;
          }).join(' ');
        }
        
        // Handle fullText property
        if (text.fullText && typeof text.fullText === 'string') {
          cleanText = text.fullText;
        }
      }
      
      cleanText = cleanText
        .replace(/[#*_`~\[\]]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') 
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') 
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') 
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') 
        .replace(/[\u{2600}-\u{26FF}]/gu, '') 
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/icon|emoji|FiUser|FiTarget|FiHeart|FiActivity|FiClock|FiCalendar|BiRuler|BiBody|GiMuscleUp|MdOutlineFitnessCenter/gi, '')
        .replace(/[|•▪]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\.{2,}/g, '.')
        .replace(/\n+/g, '. ')
        .replace(/\s+[,;:]\s+/g, '. ')
        .replace(/\s*\.\s*/g, '. ')
        .trim();
      
      cleanText = cleanText.replace(/[^\w\s.,!?;:()\-]/g, ' ');
      
      cleanText = cleanText
        .replace(/\s+/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim();
      
      if (!cleanText) {
        console.warn('No readable text found');
        setIsPlaying(false);
        return;
      }
      
      console.log('Speaking:', cleanText);
      
      await voiceService.speak(cleanText, {
        voice: selectedVoice,
        rate: speechRate,
        volume: 1,
        pitch: 1
      });
      
      setIsPlaying(false);
      setIsPaused(false);
    } catch (error) {
      console.error('Speech error:', error);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (isPaused) {
      voiceService.resume();
      setIsPaused(false);
    } else {
      voiceService.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    voiceService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceChange = (e) => {
    const voiceIndex = parseInt(e.target.value);
    if (voices[voiceIndex]) {
      setSelectedVoice(voices[voiceIndex]);
    }
  };

  if (!window.speechSynthesis) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <FiVolume2 className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Voice Reader
            </h3>
          </div>
          <button
            onClick={() => setShowControls(!showControls)}
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <FiSettings size={16} />
            {showControls ? 'Hide' : 'Show'} Settings
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          {!isPlaying ? (
            <Button
              onClick={handlePlay}
              variant="primary"
              icon={<FiPlay />}
              className="flex-1"
              disabled={isLoading || voices.length === 0}
            >
              {isLoading ? 'Loading...' : `Read ${type === 'workout' ? 'Workout' : 'Diet'} Plan`}
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                variant="secondary"
                icon={isPaused ? <FiPlay /> : <FiPause />}
                className="flex-1"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={handleStop}
                variant="danger"
                icon={<FiSquare />}
              >
                Stop
              </Button>
            </>
          )}
        </div>

        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700"
            >
              {voices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Voice Selection
                  </label>
                  <select
                    value={voices.indexOf(selectedVoice)}
                    onChange={handleVoiceChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    disabled={isPlaying}
                  >
                    {voices.map((voice, index) => (
                      <option key={index} value={index}>
                        {voice.name} ({voice.lang}) {voice.localService ? '- Local' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reading Speed: {speechRate.toFixed(1)}x
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    disabled={isPlaying}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      speechRate === rate
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg"
          >
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-slate-600 dark:bg-slate-400 rounded-full"
                  animate={{
                    scaleY: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isPaused ? 'Paused' : 'Speaking...'}
            </span>
          </motion.div>
        )}

        {/* Error Message */}
        {!isLoading && voices.length === 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Text-to-speech is not available in your browser. Please try using Chrome, Edge, or Safari.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceReader;