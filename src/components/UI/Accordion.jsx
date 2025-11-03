import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const Accordion = ({
  title,
  icon,
  children,
  defaultOpen = false,
  variant = "default", 
  size = "large",
  rightContent = null,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const sizeStyles = {
    large: {
      container: "rounded-xl shadow-md mb-4",
      header: "p-6",
      icon: "text-2xl",
      title: "text-xl",
      chevron: "text-xl",
      content: "p-6",
    },
    small: {
      container: "rounded-lg shadow-sm mb-3",
      header: "p-4",
      icon: "text-lg",
      title: "text-base",
      chevron: "text-lg",
      content: "p-4",
    },
  };

  const variantStyles = {
    default:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100",
    primary:
      "bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white",
    secondary:
      "bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white",
    success:
      "bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white",
    info: "bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white",
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={`bg-white dark:bg-gray-900 ${styles.container} overflow-hidden border border-gray-200 dark:border-gray-700`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${styles.header} flex items-center justify-between ${variantStyles[variant]} transition-all duration-200`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className={styles.icon}>{icon}</span>}
          <h2 className={`${styles.title} font-semibold`}>{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {rightContent && (
            <div className="text-sm opacity-90">{rightContent}</div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <FiChevronUp className={styles.chevron} />
            ) : (
              <FiChevronDown className={styles.chevron} />
            )}
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`${styles.content} bg-white dark:bg-gray-900`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accordion;
