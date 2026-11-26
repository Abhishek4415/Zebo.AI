import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import axios from "axios";

import serverUrl  from "../config";

import InterviewStepper from "../components/interview/InterviewStepper";
import InterviewSetup from "../components/interview/InterviewSetup";
import InterviewAnalysis from "../components/interview/InterviewAnalysis";
import SystemCheck from "../components/interview/SystemCheck";

function InterviewPage() {

  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [candidateData, setCandidateData] = useState(null);
  const [interviewConfig, setInterviewConfig] = useState(null);

  // New states
  const [analysis, setAnalysis] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stage 1 to Stage 2
  const handleSetupComplete = async (data) => {

    if (loading) return;

    setLoading(true);
    setError("");
    setCandidateData(data);

    try {

      const formData = new FormData();

      formData.append("role", data.role);
      formData.append("experience", data.experience);
      formData.append("company", data.company || "");
      formData.append(
        "interviewType",
        data.interviewType || "Technical"
      );

      // Resume upload
      if (data.resume) {
        formData.append("resume", data.resume);
      }

      // JD file upload
      if (data.jdFile) {
        formData.append("jd", data.jdFile);
      }

      // JD text
      if (data.jobDescription) {
        formData.append(
          "jobDescription",
          data.jobDescription
        );
      }

      // Backend API call
      const response = await axios.post(
        serverUrl + "/api/interview/analyze",
        formData,
        {
          withCredentials: true,
          timeout: 90000,
        }
      );

      console.log("AI Analysis:", response.data);

      // Store backend response
      setAnalysis(response.data.analysis);
      setInterviewId(response.data.interviewId);

      // Move to Stage 2
      setCurrentStep(2);

    } catch (error) {

      console.error("Analysis failed:", error);

      setError(
        error.response?.data?.message ||
        "Unable to analyze your profile. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // Stage 2 to Stage 3
  const handleAnalysisComplete = (config) => {

    setInterviewConfig(config);
    setCurrentStep(3);

  };

  // Start live interview
  const handleStartInterview = () => {

    navigate("/interview/live", {
      state: {
        interviewId,
        candidateData,
        analysis,
        interviewConfig,
      },
    });

  };

  // Previous stage
  const handleBack = () => {

    if (loading) return;

    setError("");

    if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep((prev) => prev - 1);
    }

  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-8">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">

          <button
            onClick={handleBack}
            disabled={loading}
            className="flex items-center gap-2 text-gray-600
            hover:text-blue-600 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiArrowLeft size={20} />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Zebo<span className="text-blue-600">.ai</span>
          </h1>

        </div>

        {/* Progress Stepper */}
        <InterviewStepper currentStep={currentStep} />

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="max-w-4xl mx-auto mb-5 flex items-center
            gap-3 bg-red-50 border border-red-200
            text-red-600 rounded-xl p-4"
          >
            <FiAlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Stage Components */}
        <AnimatePresence mode="wait">

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3 }}
          >

            {/* Stage 1 */}
            {currentStep === 1 && (
              <InterviewSetup
                initialData={candidateData}
                onAnalyze={handleSetupComplete}
                loading={loading}
              />
            )}

            {/* Stage 2 */}
            {currentStep === 2 && (
              <InterviewAnalysis
                candidateData={candidateData}
                analysis={analysis}
                interviewId={interviewId}
                initialConfig={interviewConfig}
                onNext={handleAnalysisComplete}
                onBack={handleBack}
              />
            )}

            {/* Stage 3 */}
            {currentStep === 3 && (
              <SystemCheck
                onStart={handleStartInterview}
                onBack={handleBack}
              />
            )}

          </motion.div>

        </AnimatePresence>

      </div>

    </div>
  );
}

export default InterviewPage;