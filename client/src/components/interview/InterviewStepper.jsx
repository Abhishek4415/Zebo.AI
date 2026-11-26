import React from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

function InterviewStepper({ currentStep }) {
  const steps = [
    { id: 1, title: "Your Profile", description: "Candidate details" },
    { id: 2, title: "AI Analysis", description: "Interview configuration" },
    { id: 3, title: "System Check", description: "Device verification" },
  ];

  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto w-full mb-12">

      {steps.map((step, index) => (
        <React.Fragment key={step.id}>

          <div
            className="flex flex-col items-center gap-2"
            aria-current={currentStep === step.id ? "step" : undefined}
          >

            <motion.div
              animate={{
                scale: currentStep === step.id ? 1.1 : 1,
              }}
              className={`w-11 h-11 rounded-full flex items-center
                justify-center font-semibold transition-all duration-300
                ${
                  currentStep === step.id
                    ? "bg-black text-white ring-4 ring-blue-100 shadow-lg"
                    : currentStep > step.id
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
            >

              {currentStep > step.id ? (
                <FiCheck size={22} />
              ) : (
                step.id
              )}

            </motion.div>

            <span
              className={`text-xs sm:text-sm font-semibold
                ${
                  currentStep >= step.id
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
            >
              {step.title}
            </span>

            <span className="hidden sm:block text-xs text-gray-400">
              {step.description}
            </span>

          </div>

          {index < steps.length - 1 && (

            <div className="flex-1 h-1 mx-3 sm:mx-6 mb-8
              bg-gray-200 rounded-full overflow-hidden">

              <motion.div
                initial={false}
                animate={{
                  width: currentStep > step.id ? "100%" : "0%",
                }}
                transition={{ duration: 0.4 }}
                className="h-full bg-linear-to-r
                  from-blue-600 to-purple-600 rounded-full"
              />

            </div>

          )}

        </React.Fragment>
      ))}

    </div>
  );
}

export default InterviewStepper;