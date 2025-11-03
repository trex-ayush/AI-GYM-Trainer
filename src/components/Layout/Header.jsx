import React from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiActivity } from "react-icons/fi";

const Header = ({ theme, toggleTheme }) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center shadow-md">
              <FiActivity className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                AI Fitness Coach
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your Personal Trainer
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;