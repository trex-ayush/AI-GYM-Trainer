import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { FiActivity, FiRefreshCw } from "react-icons/fi";
import { MdOutlineFitnessCenter, MdOutlineRestaurant } from "react-icons/md";
import Layout from "./components/Layout/Layout";
import UserDetailsForm from "./components/Forms/UserDetailsForm";
import WorkoutPlan from "./components/Plans/WorkoutPlan";
import DietPlan from "./components/Plans/DietPlan";
import Accordion from "./components/UI/Accordion";
import MotivationQuote from "./components/Features/MotivationQuote";
import VoiceReader from "./components/Features/VoiceReader";
import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
import "./App.css";

function App() {
  const [theme, toggleTheme] = useTheme();
  const [userDetails, setUserDetails] = useLocalStorage("userDetails", null);
  const [generatedPlan, setGeneratedPlan] = useLocalStorage(
    "fitnessplan",
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanGenerated = (plan) => {
    setGeneratedPlan(plan);
  };

  const handleRegeneratePlan = () => {
    setGeneratedPlan(null);
  };

  return (
    <div className={`app ${theme}`}>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: theme === "dark" ? "#1f2937" : "#fff",
              color: theme === "dark" ? "#f3f4f6" : "#111827",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8 max-w-7xl"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl">
                <FiActivity className="text-white" size={32} />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                AI Fitness Coach
              </h1>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your personalized fitness journey starts here
            </p>
          </div>

          <MotivationQuote />

          <AnimatePresence mode="wait">
            {!generatedPlan && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <UserDetailsForm
                  onSubmit={setUserDetails}
                  onPlanGenerated={handlePlanGenerated}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  existingDetails={userDetails}
                />
              </motion.div>
            )}

            {generatedPlan && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Accordion
                      title="Workout Plan"
                      icon={<MdOutlineFitnessCenter size={24} />}
                      defaultOpen={true}
                      variant="primary"
                      size="large"
                    >
                      <WorkoutPlan
                        plan={generatedPlan.workout}
                        onRegenerate={handleRegeneratePlan}
                        showActions={true}
                      />
                      <div className="mt-4">
                        <VoiceReader
                          text={generatedPlan.workout}
                          type="workout"
                        />
                      </div>
                    </Accordion>
                  </div>

                  <div>
                    <Accordion
                      title="Nutrition Plan"
                      icon={<MdOutlineRestaurant size={24} />}
                      defaultOpen={true}
                      variant="secondary"
                      size="large"
                    >
                      <DietPlan
                        plan={generatedPlan.diet}
                        onRegenerate={handleRegeneratePlan}
                        showActions={true}
                      />
                      <div className="mt-4">
                        <VoiceReader text={generatedPlan.diet} type="diet" />
                      </div>
                    </Accordion>
                  </div>
                </div>

                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={handleRegeneratePlan}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiRefreshCw size={18} />
                    Create New Plan
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Layout>
    </div>
  );
}

export default App;
