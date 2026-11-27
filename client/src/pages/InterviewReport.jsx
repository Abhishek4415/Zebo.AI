
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import {
    FiAward,
    FiClock,
    FiCheckCircle,
    FiChevronDown,
    FiArrowRight,
    FiDownload,
    FiTrendingUp,
    FiTarget,
    FiMessageCircle,
    FiBarChart2,
    FiCalendar,
    FiRefreshCw
} from "react-icons/fi";

import serverUrl from "../config";

function InterviewReport() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedQuestion, setExpandedQuestion] = useState(0);


    // Fetch completed interview

    useEffect(() => {

        const fetchReport = async () => {

            try {

                const { data } = await axios.get(
                    `${serverUrl}/api/interview/${id}`,
                    { withCredentials: true }
                );

                if (data.status !== "completed") {

                    setError("This interview is not completed yet.");
                    return;

                }

                setInterview(data);

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Unable to load interview report."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchReport();

    }, [id]);


    // Loading screen

    if (loading) {

        return (

            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f9]">

                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

                <p className="text-gray-500 mt-4">
                    Loading your interview report...
                </p>

            </div>

        );

    }


    // Error screen

    if (error || !interview) {

        return (

            <div className="min-h-screen flex flex-col items-center justify-center gap-4">

                <p className="text-red-500">
                    {error || "Report not found."}
                </p>

                <button
                    onClick={() => navigate("/history")}
                    className="bg-black text-white px-6 py-3 rounded-full"
                >
                    Back to History
                </button>

            </div>

        );

    }


    // Calculate performance metrics

    const questions = interview.questions || [];

    const completedQuestions = questions.filter(
        question => question.submitted
    );

    const answeredQuestions = completedQuestions.filter(
        question => question.answer?.trim()
    );

    const totalQuestions = questions.length;

    const average = (field) => {

        if (!completedQuestions.length) return 0;

        const total = completedQuestions.reduce(
            (sum, question) => sum + (Number(question[field]) || 0),
            0
        );

        return Number(
            (total / completedQuestions.length).toFixed(1)
        );

    };

    const overallScore = Math.min(
        100,
        Math.max(0, Math.round((interview.finalScore || 0) * 10))
    );

    const correctness = average("correctness");
    const communication = average("communication");
    const confidence = average("confidence");

    const totalTime = questions.reduce(
        (sum, question) => sum + (question.timeTaken || 0),
        0
    );

    const formatTime = (seconds) => {

        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return `${minutes}m ${remaining}s`;

    };


    // Performance classification

    const getPerformance = (score) => {

        if (score >= 85) return "Excellent Performance";
        if (score >= 70) return "Good Performance";
        if (score >= 50) return "Average Performance";

        return "Needs Improvement";

    };


    // Find strongest and weakest answers

    const sortedQuestions = [...answeredQuestions].sort(
        (a, b) => b.score - a.score
    );

    const strongestQuestion = sortedQuestions[0];

    const weakestQuestion =
        sortedQuestions[sortedQuestions.length - 1];


    // Performance metrics

    const metrics = [

        {
            label: "Correctness",
            score: correctness,
            icon: FiTarget,
            color: "bg-indigo-500",
            description: "Accuracy and relevance of your answers"
        },

        {
            label: "Communication",
            score: communication,
            icon: FiMessageCircle,
            color: "bg-blue-500",
            description: "Clarity and structure of your answers"
        },

        {
            label: "Confidence Estimate",
            score: confidence,
            icon: FiTrendingUp,
            color: "bg-purple-500",
            description: "Estimated from your answer text"
        }

    ];


    // Circular progress calculation

    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    const progressOffset =
        circumference - (overallScore / 100) * circumference;


    return (

        <div className="min-h-screen bg-[#f6f7f9] py-8 px-4 print:bg-white">

            <div className="max-w-6xl mx-auto space-y-6">


                {/* Header */}

                <div className="flex flex-wrap items-center justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold">
                            Zebo<span className="text-indigo-600">.ai</span>
                        </h1>

                        <p className="text-gray-500 text-sm mt-1">
                            Interview Performance Report
                        </p>

                    </div>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full print:hidden"
                    >

                        <FiDownload />

                        Download Report

                    </button>

                </div>


                {/* Overall Score */}

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-3xl p-8 text-center"
                >

                    <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">

                        <FiAward
                            size={28}
                            className="text-indigo-600"
                        />

                    </div>

                    <h2 className="text-3xl font-bold mt-4">
                        Interview Completed!
                    </h2>

                    <p className="text-gray-500 mt-2">

                        {interview.role} · {interview.interviewType} Interview

                    </p>

                    {interview.company && (

                        <p className="text-sm text-gray-500 mt-1">
                            {interview.company}
                        </p>

                    )}


                    {/* Circular Score */}

                    <div className="relative w-48 h-48 mx-auto mt-6">

                        <svg
                            viewBox="0 0 160 160"
                            className="w-full h-full -rotate-90"
                        >

                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                            />

                            <motion.circle
                                cx="80"
                                cy="80"
                                r={radius}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{
                                    strokeDashoffset: circumference
                                }}
                                animate={{
                                    strokeDashoffset: progressOffset
                                }}
                                transition={{ duration: 1.2 }}
                            />

                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">

                            <span className="text-4xl font-bold">
                                {overallScore}%
                            </span>

                            <span className="text-sm text-gray-500">
                                Overall Score
                            </span>

                        </div>

                    </div>

                    <h3 className="text-xl font-semibold mt-3">
                        {getPerformance(overallScore)}
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                        Based on your performance across all interview questions.
                    </p>

                </motion.div>


                {/* Interview Statistics */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {[
                        {
                            label: "Questions Completed",
                            value: `${completedQuestions.length}/${totalQuestions}`,
                            icon: FiCheckCircle
                        },
                        {
                            label: "Average Score",
                            value: `${interview.finalScore || 0}/10`,
                            icon: FiBarChart2
                        },
                        {
                            label: "Answering Time",
                            value: formatTime(totalTime),
                            icon: FiClock
                        },
                        {
                            label: "Credits Used",
                            value: interview.creditsUsed || 0,
                            icon: FiAward
                        }

                    ].map((item, index) => (

                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                        >

                            <item.icon
                                size={23}
                                className="text-indigo-600"
                            />

                            <h3 className="text-2xl font-bold mt-3">
                                {item.value}
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                {item.label}
                            </p>

                        </div>

                    ))}

                </div>


                {/* Performance Breakdown */}

                <div className="grid lg:grid-cols-2 gap-6">

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">

                        <h2 className="text-xl font-semibold mb-6">
                            Performance Breakdown
                        </h2>

                        <div className="space-y-6">

                            {metrics.map(metric => (

                                <div key={metric.label}>

                                    <div className="flex items-center justify-between mb-2">

                                        <div className="flex items-center gap-2">

                                            <metric.icon className="text-indigo-600" />

                                            <span className="font-medium">
                                                {metric.label}
                                            </span>

                                        </div>

                                        <span className="font-semibold">
                                            {metric.score}/10
                                        </span>

                                    </div>

                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${Math.min(100, Math.max(0, metric.score * 10))}%`
                                            }}
                                            transition={{ duration: 1 }}
                                            className={`h-full rounded-full ${metric.color}`}
                                        />

                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        {metric.description}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>


                    {/* Question Performance Graph */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-6">

                        <h2 className="text-xl font-semibold mb-6">
                            Question-wise Performance
                        </h2>

                        <div className="flex gap-3">

                            <div className="flex flex-col justify-between text-xs text-gray-400 pb-7">

                                {[10, 8, 6, 4, 2, 0].map(value => (

                                    <span key={value}>
                                        {value}
                                    </span>

                                ))}

                            </div>

                            <div className="flex-1">

                                <div className="relative h-48 flex items-end justify-around border-b border-gray-200">

                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">

                                        {[10, 8, 6, 4, 2].map(value => (

                                            <div
                                                key={value}
                                                className="border-t border-dashed border-gray-200"
                                            />

                                        ))}

                                        <div />

                                    </div>

                                    {questions.map((question, index) => (

                                        <div
                                            key={question._id || index}
                                            className="relative z-10 h-full flex flex-col justify-end items-center w-full"
                                        >

                                            <span className="text-xs font-semibold mb-1">
                                                {question.score || 0}
                                            </span>

                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{
                                                    height: `${Math.min(100, Math.max(0, (question.score || 0) * 10))}%`
                                                }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: index * 0.1
                                                }}
                                                className="w-8 sm:w-10 bg-linear-to-t from-indigo-600 to-purple-400 rounded-t-md"
                                            />

                                        </div>

                                    ))}

                                </div>

                                <div className="flex justify-around mt-3">

                                    {questions.map((_, index) => (

                                        <span
                                            key={index}
                                            className="text-xs text-gray-500"
                                        >
                                            Q{index + 1}
                                        </span>

                                    ))}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Strengths and Improvements */}

                {answeredQuestions.length > 0 && (

                    <div className="grid md:grid-cols-2 gap-6">

                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

                            <h2 className="flex items-center gap-2 font-semibold text-green-800">

                                <FiTrendingUp />

                                Strongest Answer

                            </h2>

                            <p className="font-medium mt-4">
                                {strongestQuestion.question}
                            </p>

                            <p className="text-sm text-green-700 mt-3">
                                Score: {strongestQuestion.score}/10
                            </p>

                            <p className="text-sm text-gray-600 mt-2">
                                {strongestQuestion.feedback}
                            </p>

                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">

                            <h2 className="flex items-center gap-2 font-semibold text-amber-800">

                                <FiTarget />

                                Area to Improve

                            </h2>

                            <p className="font-medium mt-4">
                                {weakestQuestion.question}
                            </p>

                            <p className="text-sm text-amber-700 mt-3">
                                Score: {weakestQuestion.score}/10
                            </p>

                            <p className="text-sm text-gray-600 mt-2">
                                {weakestQuestion.feedback}
                            </p>

                        </div>

                    </div>

                )}


                {/* Detailed Question Analysis */}

                <div className="bg-white border border-gray-200 rounded-2xl p-6">

                    <h2 className="text-xl font-semibold mb-2">
                        Detailed Question Analysis
                    </h2>

                    <p className="text-sm text-gray-500 mb-6">
                        Review your answers, individual scores and AI feedback.
                    </p>

                    <div className="space-y-4">

                        {questions.map((question, index) => (

                            <div
                                key={question._id || index}
                                className="border border-gray-200 rounded-xl overflow-hidden print:break-inside-avoid"
                            >

                                <button
                                    onClick={() =>
                                        setExpandedQuestion(
                                            expandedQuestion === index
                                                ? null
                                                : index
                                        )
                                    }
                                    className="w-full p-5 flex items-center justify-between gap-4 text-left"
                                >

                                    <div className="flex-1">

                                        <div className="flex flex-wrap items-center gap-2 mb-2">

                                            <span className="text-sm font-semibold text-indigo-600">
                                                Question {index + 1}
                                            </span>

                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {question.difficulty}
                                            </span>

                                        </div>

                                        <p className="font-medium">
                                            {question.question}
                                        </p>

                                    </div>

                                    <span className={`font-semibold whitespace-nowrap
                                        ${question.score >= 7
                                            ? "text-green-600"
                                            : question.score >= 5
                                                ? "text-amber-600"
                                                : "text-red-500"}`}
                                    >

                                        {question.score || 0}/10

                                    </span>

                                    <FiChevronDown
                                        className={`transition-transform print:hidden
                                            ${expandedQuestion === index
                                                ? "rotate-180"
                                                : ""}`}
                                    />

                                </button>


                                <div className={`${expandedQuestion === index
                                    ? "block"
                                    : "hidden"} print:block`}
                                >

                                    <div className="border-t border-gray-100 p-5 space-y-5">

                                        <div>

                                            <h3 className="font-semibold text-sm mb-2">
                                                Your Answer
                                            </h3>

                                            <p className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">

                                                {question.answer ||
                                                    "No answer submitted."}

                                            </p>

                                        </div>


                                        <div className="grid grid-cols-3 gap-3">

                                            {[
                                                ["Correctness", question.correctness],
                                                ["Communication", question.communication],
                                                ["Confidence", question.confidence]

                                            ].map(([label, score]) => (

                                                <div
                                                    key={label}
                                                    className="bg-gray-50 rounded-xl p-3 text-center"
                                                >

                                                    <p className="text-lg font-bold">
                                                        {score || 0}/10
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {label}
                                                    </p>

                                                </div>

                                            ))}

                                        </div>


                                        <div className="bg-indigo-50 rounded-xl p-4">

                                            <h3 className="font-semibold text-indigo-700 mb-2">
                                                AI Feedback
                                            </h3>

                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {question.feedback ||
                                                    "No feedback available."}
                                            </p>

                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">

                                            <FiClock />

                                            Time taken: {question.timeTaken || 0} seconds

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* Completion Date */}

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">

                    <FiCalendar />

                    Completed on {

                        new Date(
                            interview.completedAt || interview.updatedAt
                        ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })

                    }

                </div>


                {/* Action Buttons */}

                <div className="flex flex-wrap justify-center gap-4 pb-6 print:hidden">

                    <button
                        onClick={() => navigate("/history")}
                        className="border border-gray-300 bg-white px-6 py-3 rounded-full flex items-center gap-2"
                    >

                        View Interview History

                        <FiArrowRight />

                    </button>

                    <button
                        onClick={() => navigate("/interview")}
                        className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2"
                    >

                        <FiRefreshCw />

                        Practice Again

                    </button>

                </div>

                <p className="text-xs text-gray-400 text-center pb-4">

                    Scores are AI-generated estimates intended for interview practice.

                </p>

            </div>

        </div>

    );

}

export default InterviewReport;
