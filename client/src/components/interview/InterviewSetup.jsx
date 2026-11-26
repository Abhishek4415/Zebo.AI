import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  FiUser,
  FiBriefcase,
  FiFileText,
  FiUploadCloud,
  FiMic,
  FiBarChart2,
  FiArrowRight,
  FiX,
  FiShield,
  FiCheckCircle,
  FiLoader,
  FiTarget,
} from "react-icons/fi";

function InterviewSetup({ initialData, onAnalyze, loading = false }) {

  const [formData, setFormData] = useState({
    role: initialData?.role || "",
    experience: initialData?.experience || "Fresher",
    company: initialData?.company || "",
    interviewType: initialData?.interviewType || "Technical",
    jobDescription: initialData?.jobDescription || "",
  });

  const [resume, setResume] = useState(
    initialData?.resume || null
  );

  const [jdFile, setJdFile] = useState(
    initialData?.jdFile || null
  );

  const [error, setError] = useState("");

  // Update input values
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Validate uploaded files
  const handleFile = (file, type) => {

    if (!file || loading) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    if (file.size === 0) {
      setError("The uploaded file is empty.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File size must not exceed 2 MB.");
      return;
    }

    if (type === "resume") {
      setResume(file);
    } else {
      setJdFile(file);
    }

    setError("");
  };

  // Handle drag and drop
  const handleDrop = (e, type) => {
    e.preventDefault();

    if (loading) return;

    const file = e.dataTransfer.files[0];

    handleFile(file, type);
  };

  // Remove uploaded file
  const handleRemoveFile = (type) => {

    if (loading) return;

    if (type === "resume") {
      setResume(null);
    } else {
      setJdFile(null);
    }

    setError("");
  };

  // Submit form
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (!formData.role.trim()) {
      setError("Please enter your target job role.");
      return;
    }

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    setError("");

    const interviewData = {
      ...formData,
      role: formData.role.trim(),
      company: formData.company.trim(),
      jobDescription: formData.jobDescription.trim(),
      resume,
      jdFile,
    };

    try {

      // Send data to InterviewPage.jsx
      await onAnalyze(interviewData);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze your profile."
      );

    }
  };

  // Interview features
  const features = [
    {
      icon: FiFileText,
      title: "Resume & JD Analysis",
      description:
        "Understand your skills and job requirements.",
    },
    {
      icon: FiTarget,
      title: "Personalized Questions",
      description:
        "Questions tailored to your target role.",
    },
    {
      icon: FiMic,
      title: "Smart Voice Interview",
      description:
        "Experience realistic interview conversations.",
    },
    {
      icon: FiBarChart2,
      title: "Performance Analytics",
      description:
        "Get detailed feedback and improvement tips.",
    },
  ];

  const inputStyle = `
    w-full border border-gray-200 rounded-xl
    px-4 py-3 text-sm outline-none bg-white
    focus:border-blue-500
    focus:ring-2 focus:ring-blue-100
    transition-all
    disabled:bg-gray-100
    disabled:cursor-not-allowed
  `;

  // Reusable file upload component
  const renderUpload = (file, type, title) => (

    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, type)}
      className={`border-2 border-dashed border-gray-200
        rounded-xl transition-all
        ${
          loading
            ? "opacity-60 cursor-not-allowed"
            : "hover:border-blue-500 hover:bg-blue-50/50"
        }`}
    >

      {file ? (

        <div className="flex items-center gap-3 p-4">

          <div className="p-3 bg-blue-100 rounded-lg">

            <FiFileText
              className="text-blue-600"
              size={24}
            />

          </div>

          <div className="flex-1 min-w-0">

            <p className="text-sm font-medium truncate">
              {file.name}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </p>

          </div>

          <FiCheckCircle
            className="text-green-500 shrink-0"
            size={20}
          />

          <button
            type="button"
            aria-label={`Remove ${type}`}
            disabled={loading}
            onClick={() => handleRemoveFile(type)}
            className="p-2 text-gray-400
              hover:text-red-500 rounded-lg
              disabled:cursor-not-allowed
              disabled:opacity-50"
          >
            <FiX size={20} />
          </button>

        </div>

      ) : (

        <label
          className={`flex flex-col items-center
            justify-center p-6
            ${
              loading
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
        >

          <FiUploadCloud
            size={32}
            className="text-blue-600 mb-3"
          />

          <span className="text-sm font-medium text-gray-700 text-center">
            {title}
          </span>

          <span className="text-xs text-gray-400 mt-2">
            PDF only · Maximum 2 MB
          </span>

          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={loading}
            onChange={(e) =>
              handleFile(e.target.files[0], type)
            }
          />

        </label>

      )}

    </div>

  );

  return (

    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2
        max-w-6xl mx-auto bg-white rounded-3xl
        shadow-xl border border-gray-100 overflow-hidden"
    >

      {/* ================= LEFT SECTION ================= */}

      <div className="bg-linear-to-br from-blue-50
        via-white to-purple-100
        p-8 md:p-12 flex flex-col justify-center">

        <div className="inline-flex items-center gap-2
          text-blue-700 bg-white/70 rounded-full
          px-4 py-2 text-xs font-semibold w-fit mb-6">

          <span className="w-2 h-2 rounded-full
            bg-blue-500 animate-pulse"
          />

          AI-POWERED INTERVIEW

        </div>

        <h1 className="text-3xl md:text-4xl font-bold
          text-gray-900 leading-tight">

          Your next opportunity

          <span className="block mt-2
            bg-linear-to-r from-blue-600 to-purple-600
            bg-clip-text text-transparent">

            starts here.

          </span>

        </h1>

        <p className="text-gray-600 mt-5 leading-relaxed">

          Practice real interview scenarios powered by AI.
          Build your technical skills, improve communication,
          and prepare confidently for your dream job.

        </p>

        {/* Features */}

        <div className="space-y-4 mt-10">

          {features.map((feature, index) => (

            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4
                bg-white/80 rounded-xl p-4
                shadow-sm border border-white"
            >

              <div className="bg-blue-100 p-3 rounded-xl">

                <feature.icon
                  size={22}
                  className="text-blue-600"
                />

              </div>

              <div>

                <h3 className="text-sm font-semibold
                  text-gray-800">

                  {feature.title}

                </h3>

                <p className="text-xs text-gray-500 mt-1">

                  {feature.description}

                </p>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

      {/* ================= RIGHT SECTION ================= */}

      <div className="p-6 md:p-10">

        <span className="text-xs font-semibold text-blue-600">

          STEP 01 — YOUR PROFILE

        </span>

        <h2 className="text-2xl font-bold text-gray-900 mt-2">

          Interview Setup

        </h2>

        <p className="text-sm text-gray-500 mt-2 mb-7">

          Tell us about your background and target job.

        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Target Job Role */}

          <div>

            <label
              htmlFor="role"
              className="block text-sm font-medium
                text-gray-700 mb-2"
            >

              Target Job Role *

            </label>

            <div className="relative">

              <FiUser className="absolute left-4
                top-3.5 text-gray-400"
              />

              <input
                id="role"
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
                className={`${inputStyle} pl-11`}
                disabled={loading}
                maxLength={100}
                required
              />

            </div>

          </div>

          {/* Experience and Interview Type */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Experience */}

            <div>

              <label
                htmlFor="experience"
                className="block text-sm font-medium
                  text-gray-700 mb-2"
              >

                Experience Level

              </label>

              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className={inputStyle}
                disabled={loading}
              >

                <option>Fresher</option>
                <option>0-1 year</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5+ years</option>

              </select>

            </div>

            {/* Interview Type */}

            <div>

              <label
                htmlFor="interviewType"
                className="block text-sm font-medium
                  text-gray-700 mb-2"
              >

                Interview Type

              </label>

              <select
                id="interviewType"
                name="interviewType"
                value={formData.interviewType}
                onChange={handleChange}
                className={inputStyle}
                disabled={loading}
              >

                <option>Technical</option>
                <option>HR</option>
                <option>Behavioral</option>
                <option>Mixed</option>

              </select>

            </div>

          </div>

          {/* Target Company */}

          <div>

            <label
              htmlFor="company"
              className="block text-sm font-medium
                text-gray-700 mb-2"
            >

              Target Company

              <span className="text-gray-400 ml-1">
                (Optional)
              </span>

            </label>

            <div className="relative">

              <FiBriefcase className="absolute left-4
                top-3.5 text-gray-400"
              />

              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Microsoft"
                className={`${inputStyle} pl-11`}
                disabled={loading}
                maxLength={100}
              />

            </div>

          </div>

          {/* Resume Upload */}

          <div>

            <label className="block text-sm font-medium
              text-gray-700 mb-2">

              Upload Resume *

            </label>

            {renderUpload(
              resume,
              "resume",
              "Click to upload or drop your resume"
            )}

          </div>

          {/* Job Description */}

          <div>

            <label
              htmlFor="jobDescription"
              className="block text-sm font-medium
                text-gray-700 mb-2"
            >

              Job Description

              <span className="text-gray-400 ml-1">
                (Optional)
              </span>

            </label>

            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Paste your job description here..."
              rows={4}
              maxLength={20000}
              className={`${inputStyle} resize-y`}
              disabled={loading}
            />

            <p className="text-right text-xs text-gray-400 mt-1">

              {formData.jobDescription.length}/20000

            </p>

            <div className="flex items-center gap-3 my-4">

              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-xs text-gray-400">
                OR
              </span>

              <div className="flex-1 h-px bg-gray-200" />

            </div>

            {renderUpload(
              jdFile,
              "jd",
              "Upload job description PDF"
            )}

          </div>

          {/* Error Message */}

          {error && (

            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="bg-red-50 text-red-600
                border border-red-100 p-3
                rounded-xl text-sm"
            >

              {error}

            </motion.div>

          )}

          {/* Privacy Message */}

          <div className="flex items-start gap-2
            text-xs text-gray-500 leading-relaxed">

            <FiShield
              size={17}
              className="text-blue-600 shrink-0"
            />

            <p>

              By continuing, you agree that your resume and
              job description will be processed by external
              AI services, including OpenRouter, to personalize
              your interview experience.

            </p>

          </div>

          {/* AI Analysis Loading Message */}

          {loading && (

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="bg-linear-to-r from-blue-50
                to-purple-50 border border-blue-100
                rounded-xl p-4"
            >

              <div className="flex items-center gap-3">

                <FiLoader
                  size={22}
                  className="animate-spin text-blue-600 shrink-0"
                />

                <div>

                  <h3 className="text-sm font-semibold
                    text-gray-800">

                    Analyzing your profile

                  </h3>

                  <p className="text-xs text-gray-500 mt-1">

                    AI is reviewing your resume, skills and
                    job requirements. Please wait.

                  </p>

                </div>

              </div>

              <div className="h-1.5 bg-blue-100
                rounded-full mt-4 overflow-hidden">

                <motion.div
                  className="h-full w-1/3 rounded-full
                    bg-linear-to-r from-blue-600 to-purple-600"
                  animate={{ x: ["-100%", "300%"] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

              </div>

            </motion.div>

          )}

          {/* Submit Button */}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center
              gap-3 bg-black text-white py-4 px-6
              rounded-full font-semibold shadow-lg
              hover:bg-gray-800 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {loading ? (

              <>

                <FiLoader
                  className="animate-spin"
                  size={20}
                />

                Analyzing your profile...

              </>

            ) : (

              <>

                Analyze Profile & Continue

                <FiArrowRight size={20} />

              </>

            )}

          </motion.button>

        </form>

      </div>

    </motion.div>

  );
}

export default InterviewSetup;

// Uses loading state from InterviewPage.jsx.
// PDF upload limit matches the backend's 2 MB limit.
// Uses Tailwind CSS v4 gradient classes.
// Backend consent validation still needs implementation.
// Integration with the running backend has not been tested.