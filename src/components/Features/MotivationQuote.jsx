import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import { generateMotivationalQuote } from '../../services/geminiService';

const MotivationQuote = () => {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const newQuote = await generateMotivationalQuote();
      setQuote(newQuote);
    } catch (error) {
      setQuote("Believe in yourself and all that you are! 💪");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsVisible(false);
    setTimeout(() => {
      loadQuote();
      setIsVisible(true);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm uppercase tracking-wider opacity-90 mb-2">
              Daily Motivation
            </h3>
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.p
                  key={quote}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-xl font-medium italic"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-pulse">Loading inspiration...</span>
                    </span>
                  ) : (
                    quote || "Your only limit is you! 🚀"
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button
            onClick={handleRefresh}
            disabled={loading}
            className="ml-4 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MotivationQuote;