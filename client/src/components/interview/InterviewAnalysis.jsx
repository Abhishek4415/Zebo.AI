import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase,
  FiFileText,
  FiTarget,
  FiClock,
  FiHelpCircle,
  FiLayers,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiGlobe,
} from "react-icons/fi";

function InterviewAnalysis({
  candidateData,
  analysis,
  interviewId,
  initialConfig,
  onNext,
  onBack,
}) {

  const [config, setConfig] = useState({
    totalQuestions: initialConfig?.totalQuestions ?? 10,
    timePerQuestion: initialConfig?.timePerQuestion ?? 60,
    difficulty: initialConfig?.difficulty ?? "Intermediate",
    language: initialConfig?.language ?? "English",
    followUpEnabled: initialConfig?.followUpEnabled ?? true,
  });

  const handleConfigChange = (name, value) => {
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const matchScore = Math.min(
    100,
    Math.max(0, Number(analysis?.matchScore) || 0)
  );

  const totalDuration =
    (config.totalQuestions * config.timePerQuestion) / 60;

  const scoreColor =
    matchScore >= 75
      ? "text-green-600"
      : matchScore >= 50
      ? "text-orange-500"
      : "text-red-500";

  const skillGroups = [
    {
      title: "Your Skills",
      skills: analysis?.candidateSkills,
      icon: FiUser,
      color: "bg-blue-50 text-blue-700 border-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Required Skills",
      skills: analysis?.requiredSkills,
      icon: FiTarget,
      color: "bg-purple-50 text-purple-700 border-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Matching Skills",
      skills: analysis?.matchingSkills,
      icon: FiCheckCircle,
      color: "bg-green-50 text-green-700 border-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Skills Not Evidenced in Resume",
      skills: analysis?.missingSkills,
      icon: FiAlertCircle,
      color: "bg-orange-50 text-orange-700 border-orange-100",
      iconColor: "text-orange-500",
    },
  ];

  const cardStyle =
    "bg-white rounded-2xl border border-gray-200 shadow-sm p-6";

  const handleContinue = () => {
    onNext({
      ...config,
    });
  };

  // Prevent displaying fake analysis
  if (!analysis) {
    return (
      <div className="max-w-xl mx-auto bg-white border
        border-gray-200 rounded-3xl p-10 text-center">

        <FiAlertCircle
          size={45}
          className="text-orange-500 mx-auto mb-4"
        />

        <h2 className="text-xl font-bold text-gray-900">
          Analysis Not Available
        </h2>

        <p className="text-sm text-gray-500 mt-3">
          Please complete your profile analysis before continuing.
        </p>

        <button
          onClick={onBack}
          className="mt-6 bg-black text-white rounded-full
            px-6 py-3 inline-flex items-center gap-2"
        >
          <FiArrowLeft />
          Back to Profile
        </button>

      </div>
    );
  }

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-6"
    >

      {/* ================= HEADER ================= */}

      <div className="bg-linear-to-br from-blue-50 via-white
        to-purple-100 rounded-3xl border border-gray-200
        p-6 md:p-10">

        <div className="flex flex-col md:flex-row
          items-start md:items-center justify-between gap-8">

          <div>

            <div className="inline-flex items-center gap-2
              bg-white border border-green-100 text-green-600
              px-4 py-2 rounded-full text-xs font-semibold">

              <FiCheckCircle size={15} />
              PROFILE ANALYSIS COMPLETED

            </div>

            <h1 className="text-3xl md:text-4xl font-bold
              text-gray-900 mt-5">

              Your Interview

              <span className="block bg-linear-to-r
                from-blue-600 to-purple-600
                bg-clip-text text-transparent mt-1">

                Personalized for You.

              </span>

            </h1>

            <p className="text-sm text-gray-500 mt-4 max-w-xl
              leading-relaxed">

              Your resume and target role have been analyzed.
              Review your profile insights and customize your
              interview experience.

            </p>

            <div className="flex flex-wrap gap-3 mt-6">

              <span className="bg-white border border-gray-200
                px-4 py-2 rounded-full text-sm flex items-center gap-2">

                <FiBriefcase className="text-blue-600" />
                {candidateData?.role}

              </span>

              <span className="bg-white border border-gray-200
                px-4 py-2 rounded-full text-sm flex items-center gap-2">

                <FiUser className="text-blue-600" />
                {candidateData?.experience}

              </span>

              <span className="bg-white border border-gray-200
                px-4 py-2 rounded-full text-sm flex items-center gap-2">

                <FiLayers className="text-purple-600" />
                {candidateData?.interviewType}

              </span>

              {candidateData?.company && (

                <span className="bg-white border border-gray-200
                  px-4 py-2 rounded-full text-sm">

                  {candidateData.company}

                </span>

              )}

            </div>

          </div>

          {/* Match Score */}

          <div className="bg-white rounded-3xl border
            border-gray-100 shadow-sm p-6 w-full md:w-56
            shrink-0 text-center">

            <div className="relative w-36 h-36 mx-auto">

              <svg
                viewBox="0 0 120 120"
                className="w-full h-full -rotate-90"
              >

                <defs>
                  <linearGradient id="scoreGradient">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>

                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />

                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  initial={{
                    strokeDashoffset: 2 * Math.PI * 50,
                  }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 50 * (1 - matchScore / 100),
                  }}
                  transition={{ duration: 1.2 }}
                />

              </svg>

              <div className="absolute inset-0 flex flex-col
                items-center justify-center">

                <span className="text-3xl font-bold text-gray-900">
                  {matchScore}%
                </span>

                <span className="text-xs text-gray-400">
                  Match Score
                </span>

              </div>

            </div>

            <p className={`text-sm font-semibold mt-3 ${scoreColor}`}>

              {matchScore >= 75
                ? "Strong Match"
                : matchScore >= 50
                ? "Moderate Match"
                : "Needs Improvement"}

            </p>

            <p className="text-xs text-gray-400 mt-2">
              AI-estimated profile match
            </p>

          </div>

        </div>

      </div>

      {/* ================= DOCUMENT ANALYSIS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Resume Summary */}

        <div className={cardStyle}>

          <div className="flex items-center gap-3 mb-4">

            <div className="bg-blue-50 text-blue-600
              p-3 rounded-xl">

              <FiFileText size={23} />

            </div>

            <div>

              <h2 className="font-bold text-gray-900">
                Resume Analysis
              </h2>

              <p className="text-xs text-gray-400">
                Professional background
              </p>

            </div>

          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {analysis.resumeSummary || "No resume summary available."}
          </p>

          {candidateData?.resume && (

            <div className="flex items-center gap-2
              bg-gray-50 rounded-xl p-3 mt-5">

              <FiFileText className="text-blue-600 shrink-0" />

              <span className="text-xs text-gray-600 truncate">
                {candidateData.resume.name}
              </span>

              <FiCheckCircle className="text-green-500 ml-auto shrink-0" />

            </div>

          )}

        </div>

        {/* Job Description Summary */}

        <div className={cardStyle}>

          <div className="flex items-center gap-3 mb-4">

            <div className="bg-purple-50 text-purple-600
              p-3 rounded-xl">

              <FiBriefcase size={23} />

            </div>

            <div>

              <h2 className="font-bold text-gray-900">
                Job Description Analysis
              </h2>

              <p className="text-xs text-gray-400">
                Target role requirements
              </p>

            </div>

          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            {analysis.jdSummary || "No job description summary available."}
          </p>

          {candidateData?.jdFile && (

            <div className="flex items-center gap-2
              bg-gray-50 rounded-xl p-3 mt-5">

              <FiFileText className="text-purple-600 shrink-0" />

              <span className="text-xs text-gray-600 truncate">
                {candidateData.jdFile.name}
              </span>

              <FiCheckCircle className="text-green-500 ml-auto shrink-0" />

            </div>

          )}

        </div>

      </div>

      {/* ================= SKILLS ANALYSIS ================= */}

      <div className={cardStyle}>

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-black text-white p-3 rounded-xl">
            <FiTrendingUp size={23} />
          </div>

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Skills Analysis
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Understand your strengths and improvement areas.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {skillGroups.map((group) => (

            <div
              key={group.title}
              className="border border-gray-100 bg-gray-50/50
                rounded-2xl p-5"
            >

              <div className="flex items-center gap-2 mb-4">

                <group.icon
                  size={18}
                  className={group.iconColor}
                />

                <h3 className="text-sm font-semibold text-gray-800">
                  {group.title}
                </h3>

                <span className="ml-auto text-xs bg-white
                  border border-gray-200 px-2 py-1 rounded-full">

                  {group.skills?.length || 0}

                </span>

              </div>

              <div className="flex flex-wrap gap-2">

                {group.skills?.length ? (

                  group.skills.map((skill, index) => (

                    <span
                      key={`${skill}-${index}`}
                      className={`px-3 py-1.5 rounded-full
                        border text-xs font-medium ${group.color}`}
                    >

                      {skill}

                    </span>

                  ))

                ) : (

                  <p className="text-xs text-gray-400">
                    No skills identified in this category.
                  </p>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ================= RECOMMENDED TOPICS ================= */}

      <div className={cardStyle}>

        <div className="flex items-center gap-3 mb-5">

          <div className="bg-purple-50 text-purple-600
            p-3 rounded-xl">

            <FiTarget size={24} />

          </div>

          <div>

            <h2 className="text-lg font-bold text-gray-900">
              Recommended Interview Topics
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Topics identified from your profile analysis.
            </p>

          </div>

        </div>

        <div className="flex flex-wrap gap-3">

          {analysis.recommendedTopics?.length ? (

            analysis.recommendedTopics.map((topic, index) => (

              <motion.span
                key={`${topic}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-linear-to-r from-blue-50 to-purple-50
                  border border-blue-100 rounded-xl px-4 py-3
                  text-sm font-medium text-gray-700"
              >

                {topic}

              </motion.span>

            ))

          ) : (

            <p className="text-sm text-gray-400">
              No recommended topics available.
            </p>

          )}

        </div>

      </div>

      {/* ================= PROJECTS ================= */}

      {analysis.projects?.length > 0 && (

        <div className={cardStyle}>

          <div className="flex items-center gap-3 mb-5">

            <div className="bg-blue-50 text-blue-600
              p-3 rounded-xl">

              <FiLayers size={23} />

            </div>

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Identified Projects
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Projects extracted from your resume.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {analysis.projects.map((project, index) => (

              <div
                key={`${project}-${index}`}
                className="flex items-center gap-3 p-4
                  rounded-xl border border-gray-100 bg-gray-50"
              >

                <FiCheckCircle className="text-blue-600 shrink-0" />

                <p className="text-sm text-gray-700">
                  {project}
                </p>

              </div>

            ))}

          </div>

        </div>

      )}

      {/* ================= INTERVIEW CONFIGURATION ================= */}

      <div className={cardStyle}>

        <div className="flex items-center gap-3 mb-8">

          <div className="bg-black text-white p-3 rounded-xl">
            <FiSettings size={24} />
          </div>

          <div>

            <h2 className="text-xl font-bold text-gray-900">
              Customize Your Interview
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Choose your preferred interview settings.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Number of Questions */}

          <div>

            <label className="flex items-center gap-2
              text-sm font-semibold text-gray-700 mb-4">

              <FiHelpCircle className="text-blue-600" />
              Number of Questions

            </label>

            <div className="grid grid-cols-4 gap-3">

              {[5, 10, 15, 20].map((number) => (

                <button
                  key={number}
                  type="button"
                  onClick={() =>
                    handleConfigChange("totalQuestions", number)
                  }
                  className={`py-4 rounded-xl border
                    text-sm font-semibold transition-all
                    ${
                      config.totalQuestions === number
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-500"
                    }`}
                >

                  {number}

                </button>

              ))}

            </div>

          </div>

          {/* Time Per Question */}

          <div>

            <label className="flex items-center gap-2
              text-sm font-semibold text-gray-700 mb-4">

              <FiClock className="text-blue-600" />
              Time Per Question

            </label>

            <div className="grid grid-cols-4 gap-3">

              {[30, 60, 90, 120].map((time) => (

                <button
                  key={time}
                  type="button"
                  onClick={() =>
                    handleConfigChange("timePerQuestion", time)
                  }
                  className={`py-4 rounded-xl border
                    text-sm font-semibold transition-all
                    ${
                      config.timePerQuestion === time
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-500"
                    }`}
                >

                  {time}s

                </button>

              ))}

            </div>

          </div>

          {/* Difficulty */}

          <div>

            <label className="flex items-center gap-2
              text-sm font-semibold text-gray-700 mb-4">

              <FiLayers className="text-blue-600" />
              Difficulty Level

            </label>

            <div className="grid grid-cols-3 gap-3">

              {["Beginner", "Intermediate", "Advanced"].map(
                (difficulty) => (

                  <button
                    key={difficulty}
                    type="button"
                    onClick={() =>
                      handleConfigChange("difficulty", difficulty)
                    }
                    className={`py-4 px-1 rounded-xl border
                      text-xs sm:text-sm font-semibold transition-all
                      ${
                        config.difficulty === difficulty
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-500"
                      }`}
                  >

                    {difficulty}

                  </button>

                )
              )}

            </div>

          </div>

          {/* Language */}

          <div>

            <label
              htmlFor="interviewLanguage"
              className="flex items-center gap-2
                text-sm font-semibold text-gray-700 mb-4"
            >

              <FiGlobe className="text-blue-600" />
              Interview Language

            </label>

            <select
              id="interviewLanguage"
              value={config.language}
              onChange={(e) =>
                handleConfigChange("language", e.target.value)
              }
              className="w-full border border-gray-200
                rounded-xl px-4 py-4 text-sm bg-white
                outline-none focus:border-blue-500
                focus:ring-2 focus:ring-blue-100"
            >

              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>

            </select>

          </div>

        </div>

        {/* Follow-up Questions */}

        <div className="flex items-center justify-between gap-4
          border border-gray-200 rounded-2xl p-5 mt-8">

          <div>

            <h3 className="text-sm font-semibold text-gray-800">
              AI Follow-up Questions
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              Allow AI to ask additional questions based on your answers.
            </p>

          </div>

          <button
            type="button"
            role="switch"
            aria-label="Enable AI follow-up questions"
            aria-checked={config.followUpEnabled}
            onClick={() =>
              handleConfigChange(
                "followUpEnabled",
                !config.followUpEnabled
              )
            }
            className={`relative w-12 h-7 shrink-0
              rounded-full transition-colors
              ${
                config.followUpEnabled
                  ? "bg-black"
                  : "bg-gray-300"
              }`}
          >

            <motion.span
              animate={{
                x: config.followUpEnabled ? 20 : 0,
              }}
              className="absolute left-1 top-1 w-5 h-5
                rounded-full bg-white shadow-sm"
            />

          </button>

        </div>

        {/* Interview Summary */}

        <div className="bg-linear-to-r from-blue-50
          to-purple-50 rounded-2xl border border-blue-100
          p-5 mt-6">

          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Interview Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            <div>

              <p className="text-xs text-gray-500">
                Questions
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {config.totalQuestions}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Time / Question
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {config.timePerQuestion}s
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Base Duration
              </p>

              <p className="text-xl font-bold text-gray-900 mt-1">
                {Number(totalDuration.toFixed(1))} min
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Difficulty
              </p>

              <p className="text-sm font-bold text-gray-900 mt-2">
                {config.difficulty}
              </p>

            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            Actual duration may vary depending on follow-up questions.
          </p>

        </div>

      </div>

      {/* ================= NAVIGATION ================= */}

      <div className="flex flex-col sm:flex-row
        items-center justify-between gap-4 pb-6">

        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto flex items-center
            justify-center gap-2 border border-gray-300
            bg-white rounded-full px-7 py-3.5
            text-sm font-semibold text-gray-700
            hover:bg-gray-100 transition-all"
        >

          <FiArrowLeft size={18} />
          Edit Profile

        </button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full sm:w-auto flex items-center
            justify-center gap-3 bg-black text-white
            px-8 py-4 rounded-full font-semibold
            shadow-lg hover:bg-gray-800 transition-all"
        >

          Continue to System Check
          <FiArrowRight size={20} />

        </motion.button>

      </div>

    </motion.div>
  );
}

export default InterviewAnalysis;

// Configuration is passed to InterviewPage.jsx.
// Saving configuration to MongoDB requires a separate backend API.
// Match score is an AI estimate, not a verified ATS score.