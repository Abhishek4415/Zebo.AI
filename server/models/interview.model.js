import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    difficulty: String,
    timeLimit: Number,

    answer: { type: String, default: "" },
    feedback: { type: String, default: "" },

    score: { type: Number, default: 0, min: 0, max: 10 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },

    timeTaken: { type: Number, default: 0 },
    submitted: { type: Boolean, default: false }
});

const interviewSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    role: { type: String, required: true },
    experience: { type: String, required: true },
    company: { type: String, default: "" },

    interviewType: {
        type: String,
        enum: ["Technical", "HR", "Behavioral", "Mixed"],
        default: "Technical"
    },

    analysis: {
        resumeSummary: String,
        jdSummary: String,
        candidateSkills: [String],
        requiredSkills: [String],
        matchingSkills: [String],
        missingSkills: [String],
        recommendedTopics: [String],
        projects: [String],
        matchScore: { type: Number, min: 0, max: 100 }
    },

    configuration: {
        totalQuestions: { type: Number, default: 5 },
        timePerQuestion: { type: Number, default: 60 },
        difficulty: { type: String, default: "Intermediate" },
        language: { type: String, default: "English" },
        followUpEnabled: { type: Boolean, default: false }
    },

    questions: [questionSchema],

    creditsUsed: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },

    status: {
        type: String,
        enum: [
            "draft",
            "analyzed",
            "configured",
            "in_progress",
            "completed",
            "cancelled"
        ],
        default: "draft"
    },

    startedAt: Date,
    completedAt: Date

}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;