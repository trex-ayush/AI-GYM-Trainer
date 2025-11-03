import React from 'react';
import { motion } from 'framer-motion';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  min,
  max,
  icon,
  error
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <label htmlFor={name} className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`
          w-full px-4 py-2 rounded-lg border transition-all duration-200
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
          }
          dark:bg-gray-700 dark:text-white
          hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none
        `}
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormInput;