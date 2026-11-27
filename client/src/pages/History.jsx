
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import {
    FiPlus,
    FiSearch,
    FiAward,
    FiCheckCircle,
    FiBarChart2,
    FiLayers,
    FiBriefcase,
    FiCalendar,
    FiArrowRight,
    FiClock,
    FiInbox,
    FiArrowLeft
} from "react-icons/fi";

import serverUrl from "../config";

function History() {

    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("latest");


    // 1. Fetch interview history

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const { data } = await axios.get(
                    `${serverUrl}/api/interview/history`,
                    { withCredentials: true }
                );

                setInterviews(data);

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Unable to load interview history."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchHistory();

    }, []);


    // 2. Calculate statistics

    const completedInterviews = interviews.filter(
        interview => interview.status === "completed"
    );

    const inProgressInterviews = interviews.filter(
        interview => interview.status === "in_progress"
    );

    const getPercentage = (score) =>
        Math.min(100, Math.max(0, Math.round((Number(score) || 0) * 10)));

    const averageScore = completedInterviews.length

        ? Math.round(
            completedInterviews.reduce(
                (sum, interview) =>
                    sum + (Number(interview.finalScore) || 0),
                0
            ) / completedInterviews.length * 10
        )

        : 0;

    const bestScore = completedInterviews.length

        ? Math.max(
            ...completedInterviews.map(
                interview => getPercentage(interview.finalScore)
            )
        )

        : 0;


    // 3. Search, filter and sort

    const filteredInterviews = interviews.filter(interview => {

        const query = search.trim().toLowerCase();

        const matchesSearch = [
            interview.role,
            interview.company,
            interview.interviewType
        ].some(value =>
            (value || "").toLowerCase().includes(query)
        );

        const matchesFilter =
            filter === "all" || interview.status === filter;

        return matchesSearch && matchesFilter;

    }).sort((a, b) => {

        if (sortBy === "highest") {

            if (a.status !== b.status) {
                return a.status === "completed" ? -1 : 1;
            }

            return (b.finalScore || 0) - (a.finalScore || 0);

        }

        if (sortBy === "oldest") {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }

        return new Date(b.createdAt) - new Date(a.createdAt);

    });


    // 4. Performance trend data

    const trendInterviews = [...completedInterviews]
        .sort(
            (a, b) =>
                new Date(a.createdAt) - new Date(b.createdAt)
        )
        .slice(-8);

    const chartPoints = trendInterviews.map((interview, index) => {

        const x = trendInterviews.length === 1

            ? 300

            : 45 + (
                index / (trendInterviews.length - 1)
            ) * 530;

        const y =
            190 - (getPercentage(interview.finalScore) / 100) * 170;

        return {
            x,
            y,
            score: getPercentage(interview.finalScore),
            id: interview._id
        };

    });

    const linePoints = chartPoints
        .map(point => `${point.x},${point.y}`)
        .join(" ");


    // 5. Format date

    const formatDate = (date) => {

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    };


    // 6. Open interview

    const openInterview = (interview) => {

        if (interview.status === "completed") {

            navigate(`/interview/report/${interview._id}`);

        } else if (interview.status === "in_progress") {

            navigate(`/interview/live/${interview._id}`);

        }

    };


    // 7. Statistics cards

    const stats = [

        {
            label: "Total Interviews",
            value: interviews.length,
            icon: FiLayers
        },

        {
            label: "Completed",
            value: completedInterviews.length,
            icon: FiCheckCircle
        },

        {
            label: "Average Score",
            value: completedInterviews.length
                ? `${averageScore}%`
                : "—",
            icon: FiBarChart2
        },

        {
            label: "Best Score",
            value: completedInterviews.length
                ? `${bestScore}%`
                : "—",
            icon: FiAward
        }

    ];


    // Loading screen

    if (loading) {

        return (

            <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center">

                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />

                <p className="text-gray-500 mt-4">
                    Loading interview history...
                </p>

            </div>

        );

    }


    // Error screen

    if (error) {

        return (

            <div className="min-h-screen flex flex-col items-center justify-center gap-4">

                <p className="text-red-500">
                    {error}
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="bg-black text-white px-6 py-3 rounded-full"
                >
                    Try Again
                </button>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-[#f6f7f9] px-4 py-8">

            <div className="max-w-6xl mx-auto space-y-6">


                {/* Header */}

                <div>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-5"
                    >

                        <FiArrowLeft />

                        Back to Home

                    </button>

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div>

                            <h1 className="text-3xl font-bold text-gray-900">
                                Interview History
                            </h1>

                            <p className="text-gray-500 mt-2">
                                Track your progress and improve your interview skills.
                            </p>

                        </div>

                        <button
                            onClick={() => navigate("/interview")}
                            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800"
                        >

                            <FiPlus />

                            New Interview

                        </button>

                    </div>

                </div>


                {/* Statistics */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {stats.map((item, index) => (

                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="bg-white border border-gray-200 rounded-2xl p-5"
                        >

                            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center">

                                <item.icon
                                    size={22}
                                    className="text-indigo-600"
                                />

                            </div>

                            <h2 className="text-3xl font-bold mt-4">
                                {item.value}
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {item.label}
                            </p>

                        </motion.div>

                    ))}

                </div>


                {/* Performance Graph */}

                <div className="bg-white border border-gray-200 rounded-2xl p-6">

                    <h2 className="text-xl font-semibold">
                        Performance Trend
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Your scores across the last eight completed interviews.
                    </p>

                    {chartPoints.length > 0 ? (

                        <div className="mt-6 overflow-x-auto">

                            <svg
                                viewBox="0 0 620 225"
                                className="w-full min-w-[400px]"
                                role="img"
                                aria-label="Interview performance trend graph"
                            >

                                <defs>

                                    <linearGradient
                                        id="performanceGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#6366f1"
                                            stopOpacity="0.2"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#6366f1"
                                            stopOpacity="0"
                                        />

                                    </linearGradient>

                                </defs>


                                {/* Grid lines */}

                                {[0, 25, 50, 75, 100].map(value => {

                                    const y = 190 - value * 1.7;

                                    return (

                                        <g key={value}>

                                            <line
                                                x1="45"
                                                y1={y}
                                                x2="575"
                                                y2={y}
                                                stroke="#e5e7eb"
                                                strokeDasharray="4 4"
                                            />

                                            <text
                                                x="35"
                                                y={y + 4}
                                                textAnchor="end"
                                                fontSize="11"
                                                fill="#9ca3af"
                                            >
                                                {value}%
                                            </text>

                                        </g>

                                    );

                                })}


                                {/* Area under graph */}

                                {chartPoints.length > 1 && (

                                    <polygon
                                        points={`
                                            ${chartPoints[0].x},190
                                            ${linePoints}
                                            ${chartPoints[chartPoints.length - 1].x},190
                                        `}
                                        fill="url(#performanceGradient)"
                                    />

                                )}


                                {/* Graph line */}

                                <polyline
                                    points={linePoints}
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="3"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />


                                {/* Score points */}

                                {chartPoints.map((point, index) => (

                                    <g key={point.id}>

                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="5"
                                            fill="#6366f1"
                                            stroke="white"
                                            strokeWidth="2"
                                        >

                                            <title>
                                                Interview {index + 1}: {point.score}%
                                            </title>

                                        </circle>

                                        <text
                                            x={point.x}
                                            y={point.y - 12}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fontWeight="600"
                                            fill="#6366f1"
                                        >
                                            {point.score}%
                                        </text>

                                        <text
                                            x={point.x}
                                            y="212"
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="#6b7280"
                                        >
                                            #{index + 1}
                                        </text>

                                    </g>

                                ))}

                            </svg>

                        </div>

                    ) : (

                        <div className="h-52 flex flex-col items-center justify-center text-gray-400 gap-3">

                            <FiBarChart2 size={40} />

                            <p className="text-sm">
                                Complete an interview to see your performance.
                            </p>

                        </div>

                    )}

                </div>


                {/* Interview List */}

                <div className="bg-white border border-gray-200 rounded-2xl p-6">

                    <div className="flex items-center justify-between gap-3 mb-5">

                        <h2 className="text-xl font-semibold">
                            Your Interviews
                        </h2>

                        <span className="text-sm text-gray-500">
                            {filteredInterviews.length} results
                        </span>

                    </div>


                    {/* Search and Sort */}

                    <div className="flex flex-col sm:flex-row gap-3 mb-5">

                        <div className="relative flex-1">

                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by role or company..."
                                className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-indigo-500"
                            />

                        </div>

                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-3 outline-none"
                        >

                            <option value="latest">
                                Latest First
                            </option>

                            <option value="oldest">
                                Oldest First
                            </option>

                            <option value="highest">
                                Highest Score
                            </option>

                        </select>

                    </div>


                    {/* Filters */}

                    <div className="flex flex-wrap gap-2 mb-6">

                        {[
                            {
                                label: "All Interviews",
                                value: "all",
                                count: interviews.length
                            },
                            {
                                label: "Completed",
                                value: "completed",
                                count: completedInterviews.length
                            },
                            {
                                label: "In Progress",
                                value: "in_progress",
                                count: inProgressInterviews.length
                            }

                        ].map(item => (

                            <button
                                key={item.value}
                                onClick={() => setFilter(item.value)}
                                className={`px-4 py-2 rounded-full text-sm transition
                                    ${filter === item.value
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >

                                {item.label} ({item.count})

                            </button>

                        ))}

                    </div>


                    {/* Interview Cards */}

                    <div className="space-y-4">

                        {filteredInterviews.map((interview, index) => (

                            <motion.div
                                key={interview._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                                className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 transition"
                            >

                                <div className="flex flex-wrap items-center gap-4">


                                    {/* Role Icon */}

                                    <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-50 to-purple-100 flex items-center justify-center shrink-0">

                                        <FiBriefcase
                                            size={24}
                                            className="text-indigo-600"
                                        />

                                    </div>


                                    {/* Interview Details */}

                                    <div className="flex-1 min-w-[180px]">

                                        <h3 className="font-semibold text-lg">
                                            {interview.role}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">

                                            {interview.interviewType} Interview

                                            {interview.company
                                                ? ` · ${interview.company}`
                                                : ""}

                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 mt-2">

                                            <span className="flex items-center gap-1 text-xs text-gray-500">

                                                <FiCalendar />

                                                {formatDate(interview.createdAt)}

                                            </span>

                                            <span className="text-xs text-gray-500">
                                                {interview.experience}
                                            </span>

                                        </div>

                                    </div>


                                    {/* Status */}

                                    <div>

                                        {interview.status === "completed" ? (

                                            <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-2 rounded-full">

                                                <FiCheckCircle />

                                                Completed

                                            </span>

                                        ) : (

                                            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-3 py-2 rounded-full">

                                                <FiClock />

                                                In Progress

                                            </span>

                                        )}

                                    </div>


                                    {/* Score */}

                                    <div className="min-w-[65px] text-center">

                                        <p className={`text-2xl font-bold
                                            ${interview.status === "completed"
                                                ? "text-indigo-600"
                                                : "text-gray-400"}`}
                                        >

                                            {interview.status === "completed"
                                                ? `${getPercentage(interview.finalScore)}%`
                                                : "—"}

                                        </p>

                                        <p className="text-xs text-gray-400">
                                            Score
                                        </p>

                                    </div>


                                    {/* View Report or Resume */}

                                    <button
                                        onClick={() => openInterview(interview)}
                                        className="flex items-center justify-center gap-2 border border-gray-200 rounded-full px-5 py-3 text-sm font-medium hover:bg-black hover:text-white transition"
                                    >

                                        {interview.status === "completed"
                                            ? "View Report"
                                            : "Resume"}

                                        <FiArrowRight />

                                    </button>

                                </div>

                            </motion.div>

                        ))}

                    </div>


                    {/* Empty State */}

                    {filteredInterviews.length === 0 && (

                        <div className="py-16 flex flex-col items-center text-center">

                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">

                                <FiInbox
                                    size={35}
                                    className="text-indigo-500"
                                />

                            </div>

                            <h3 className="font-semibold text-lg mt-4">

                                {interviews.length === 0
                                    ? "No interviews yet"
                                    : "No matching interviews"}

                            </h3>

                            <p className="text-sm text-gray-500 mt-2">

                                {interviews.length === 0
                                    ? "Start your first AI interview to track your performance."
                                    : "Try changing your search or filters."}

                            </p>

                            <button
                                onClick={() => {

                                    if (interviews.length === 0) {

                                        navigate("/interview");

                                    } else {

                                        setSearch("");
                                        setFilter("all");

                                    }

                                }}
                                className="bg-black text-white px-6 py-3 rounded-full mt-5"
                            >

                                {interviews.length === 0
                                    ? "Start Interview"
                                    : "Clear Filters"}

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default History;
