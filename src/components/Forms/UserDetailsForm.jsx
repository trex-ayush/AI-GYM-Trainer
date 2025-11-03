import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiArrowRight, 
  FiArrowLeft, 
  FiCheck, 
  FiUser, 
  FiTarget, 
  FiHeart,
  FiActivity,
  FiCalendar,
  FiTrendingUp,
  FiHome,
  FiMapPin,
  FiClock,
  FiMoon,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';
import { 
  GiMuscleUp, 
  GiWeightLiftingUp, 
  GiRun, 
  GiMeditation,
  GiSteak,
  GiAvocado,
  GiBroccoli
} from 'react-icons/gi';
import { BiRuler, BiBody } from 'react-icons/bi';
import { MdOutlineFitnessCenter } from 'react-icons/md';
import FormInput from './FormInput';
import Button from '../UI/Button';
import { generateFitnessPlan } from '../../services/geminiService';

const UserDetailsForm = ({ onSubmit, onPlanGenerated, isLoading, setIsLoading, existingDetails }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState(existingDetails || {
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    fitnessGoal: 'weight-loss',
    fitnessLevel: 'beginner',
    workoutLocation: 'home',
    dietaryPreference: 'non-veg',
    medicalHistory: '',
    stressLevel: 'moderate',
    sleepHours: '7',
    availableTime: '30'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.age || !formData.height || !formData.weight) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.availableTime) {
          toast.error('Please specify your available workout time');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        setIsComplete(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (isComplete) {
      setIsComplete(false);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    onSubmit(formData);

    try {
      const plan = await generateFitnessPlan(formData);
      onPlanGenerated(plan);
      toast.success('Your personalized fitness plan is ready!');
    } catch (error) {
      toast.error('Failed to generate plan. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: <FiUser /> },
    { number: 2, title: 'Fitness Goals', icon: <FiTarget /> },
    { number: 3, title: 'Health & Lifestyle', icon: <FiHeart /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: currentStep >= step.number ? 1 : 0.8,
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold transition-all border-2 ${
                      currentStep >= step.number 
                        ? 'bg-white text-slate-800 border-white shadow-lg' 
                        : 'bg-transparent text-white/70 border-white/30'
                    }`}
                  >
                    {currentStep > step.number ? <FiCheck size={20} /> : step.icon}
                  </motion.div>
                  <span className={`mt-3 text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 bg-white/20 rounded-full overflow-hidden mt-[-20px]">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: currentStep > step.number ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Fitness Objectives"}
              {currentStep === 3 && "Lifestyle Assessment"}
              {isComplete && "Review & Generate"}
            </h2>
            <p className="text-white/70 text-sm">
              {!isComplete ? `Step ${currentStep} of ${steps.length}` : 'Ready to generate your plan'}
            </p>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <>
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Age *
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="25"
                            min="10"
                            max="100"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Gender *
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'male', label: 'Male', icon: <FiUser /> },
                          { value: 'female', label: 'Female', icon: <FiUser /> },
                          { value: 'other', label: 'Other', icon: <FiUser /> }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.gender === option.value
                                ? 'border-slate-600 bg-slate-50 dark:bg-slate-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={option.value}
                              checked={formData.gender === option.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-2">
                              <span className={formData.gender === option.value ? 'text-slate-600' : 'text-gray-500'}>
                                {option.icon}
                              </span>
                              <span className={`font-medium ${
                                formData.gender === option.value
                                  ? 'text-slate-700 dark:text-slate-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {option.label}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Height (cm) *
                        </label>
                        <div className="relative">
                          <BiRuler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            placeholder="175"
                            min="100"
                            max="250"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Weight (kg) *
                        </label>
                        <div className="relative">
                          <BiBody className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            placeholder="70"
                            min="30"
                            max="300"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* BMI Calculator Display */}
                    {formData.height && formData.weight && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Body Mass Index (BMI)
                            </p>
                            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
                              {(formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                              {getBMICategory(formData.weight / Math.pow(formData.height / 100, 2))}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Based on WHO standards
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Primary Fitness Goal *
                      </label>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { value: 'weight-loss', label: 'Weight Loss', icon: <FiTrendingUp />, desc: 'Burn fat and slim down' },
                          { value: 'muscle-gain', label: 'Muscle Gain', icon: <GiMuscleUp />, desc: 'Build strength and mass' },
                          { value: 'endurance', label: 'Endurance', icon: <GiRun />, desc: 'Improve stamina' },
                          { value: 'general-fitness', label: 'General Fitness', icon: <MdOutlineFitnessCenter />, desc: 'Overall health' },
                          { value: 'flexibility', label: 'Flexibility', icon: <GiMeditation />, desc: 'Increase mobility' }
                        ].map((goal) => (
                          <label
                            key={goal.value}
                            className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.fitnessGoal === goal.value
                                ? 'border-slate-600 bg-slate-50 dark:bg-slate-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="fitnessGoal"
                              value={goal.value}
                              checked={formData.fitnessGoal === goal.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${
                                formData.fitnessGoal === goal.value ? 'text-slate-600' : 'text-gray-500'
                              }`}>
                                {goal.icon}
                              </div>
                              <div>
                                <span className={`font-medium block ${
                                  formData.fitnessGoal === goal.value
                                    ? 'text-slate-700 dark:text-slate-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {goal.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {goal.desc}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fitness Level *
                        </label>
                        <select
                          name="fitnessLevel"
                          value={formData.fitnessLevel}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="beginner">Beginner - Just starting out</option>
                          <option value="intermediate">Intermediate - Regular exercise</option>
                          <option value="advanced">Advanced - Experienced athlete</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Workout Location *
                        </label>
                        <select
                          name="workoutLocation"
                          value={formData.workoutLocation}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="home">Home - Minimal equipment</option>
                          <option value="gym">Gym - Full equipment</option>
                          <option value="outdoor">Outdoor - Parks/Running</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dietary Preference *
                        </label>
                        <select
                          name="dietaryPreference"
                          value={formData.dietaryPreference}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="veg">Vegetarian</option>
                          <option value="non-veg">Non-Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="keto">Keto Diet</option>
                          <option value="paleo">Paleo Diet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Available Time (minutes/day) *
                        </label>
                        <div className="relative">
                          <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            name="availableTime"
                            value={formData.availableTime}
                            onChange={handleChange}
                            placeholder="45"
                            min="15"
                            max="180"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full"
                              style={{ width: `${Math.min((formData.availableTime / 180) * 100, 100)}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>15 min</span>
                            <span>90 min</span>
                            <span>180 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Medical History / Conditions (Optional)
                      </label>
                      <div className="relative">
                        <FiAlertCircle className="absolute left-3 top-4 text-gray-400" />
                        <textarea
                          name="medicalHistory"
                          value={formData.medicalHistory}
                          onChange={handleChange}
                          placeholder="Any injuries, allergies, or medical conditions we should be aware of?"
                          rows="3"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Current Stress Level
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'low', label: 'Low', color: 'green', desc: 'Relaxed & calm' },
                          { value: 'moderate', label: 'Moderate', color: 'yellow', desc: 'Some pressure' },
                          { value: 'high', label: 'High', color: 'red', desc: 'Very stressed' }
                        ].map((level) => (
                          <label
                            key={level.value}
                            className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.stressLevel === level.value
                                ? 'border-slate-600 bg-slate-50 dark:bg-slate-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="stressLevel"
                              value={level.value}
                              checked={formData.stressLevel === level.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-3 h-3 rounded-full mb-2 ${
                              level.value === 'low' ? 'bg-green-500' :
                              level.value === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className={`font-medium ${
                              formData.stressLevel === level.value
                                ? 'text-slate-700 dark:text-slate-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {level.label}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {level.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Average Sleep Duration
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <FiMoon className="text-gray-500" />
                          <input
                            type="range"
                            name="sleepHours"
                            min="4"
                            max="12"
                            value={formData.sleepHours}
                            onChange={handleChange}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-lg font-semibold text-slate-700 dark:text-slate-300 min-w-[60px]">
                            {formData.sleepHours}h
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>4 hours</span>
                          <span>8 hours (recommended)</span>
                          <span>12 hours</span>
                        </div>
                        <div className={`text-sm p-3 rounded-lg ${
                          formData.sleepHours < 6 ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          formData.sleepHours >= 6 && formData.sleepHours <= 9 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          <FiAlertCircle className="inline mr-2" />
                          {formData.sleepHours < 6 && 'Insufficient sleep may affect your recovery and performance'}
                          {formData.sleepHours >= 6 && formData.sleepHours <= 9 && 'Optimal sleep range for fitness and recovery'}
                          {formData.sleepHours > 9 && 'Consider if you need this much sleep or if there are underlying issues'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    Your Information Summary
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formData.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Age:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formData.age} years</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Height:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formData.height} cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Weight:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formData.weight} kg</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Goal:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {formData.fitnessGoal.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{formData.fitnessLevel}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Diet:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {formData.dietaryPreference.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formData.availableTime} min/day</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <FiZap className="text-green-600 dark:text-green-400 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Ready to Generate Your Plan
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Based on your information, we'll create a personalized workout and diet plan tailored to your goals and preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="min-w-[250px]"
                    size="lg"
                    variant="primary"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <FiActivity />
                        </motion.div>
                        Generating Your Plan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FiZap />
                        Generate My Fitness Plan
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {(currentStep > 1 || isComplete) && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                icon={<FiArrowLeft />}
              >
                Previous
              </Button>
            )}
            
            <div className={currentStep === 1 && !isComplete ? 'ml-auto' : ''}>
              {currentStep < 3 && !isComplete && (
                <Button
                  type="button"
                  onClick={handleNext}
                  icon={<FiArrowRight />}
                  iconPosition="right"
                >
                  Next Step
                </Button>
              )}
              {currentStep === 3 && !isComplete && (
                <Button
                  type="button"
                  onClick={handleNext}
                  variant="success"
                  icon={<FiCheck />}
                  iconPosition="right"
                >
                  Review Information
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

export default UserDetailsForm;