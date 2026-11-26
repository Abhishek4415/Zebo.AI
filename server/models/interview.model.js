import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        role: {
            type: String,
            required: true,
            trim: true,
        },

        experience: {
            type: String,
            required: true,
        },

        company: {
            type: String,
            default: "",
        },

        interviewType: {
            type: String,
            enum: [
                "Technical",
                "HR",
                "Behavioral",
                "Mixed"
            ],
            default: "Technical",
        },

        // Stage 1: AI Analysis

        analysis: {
            resumeSummary: String,

            jdSummary: String,

            candidateSkills: [String],

            requiredSkills: [String],

            matchingSkills: [String],

            missingSkills: [String],

            recommendedTopics: [String],

            projects: [String],

            matchScore: {
                type: Number,
                min: 0,
                max: 100,
            },
        },

        // Stage 2: Interview Configuration

        configuration: {
            totalQuestions: {
                type: Number,
                default: 5,
                min: 1,
                max: 20,
            },

            timePerQuestion: {
                type: Number,
                default: 60,
                min: 30,
                max: 300,
            },

            difficulty: {
                type: String,
                enum: [
                    "Beginner",
                    "Intermediate",
                    "Advanced"
                ],
                default: "Intermediate",
            },

            language: {
                type: String,
                default: "English",
            },

            followUpEnabled: {
                type: Boolean,
                default: true,
            },
        },

        // Interview lifecycle

        status: {
            type: String,
            enum: [
                "draft",
                "analyzed",
                "configured",
                "in_progress",
                "completed",
                "cancelled",
            ],
            default: "draft",
        },

        startedAt: Date,

        completedAt: Date,
    },

    {
        timestamps: true,
    }
);

const Interview = mongoose.model(
    "Interview",
    interviewSchema
);

export default Interview;