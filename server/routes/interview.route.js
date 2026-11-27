import express from "express";
import upload from "../middlewares/multer.js";
import { isAuth } from "../middlewares/isAuth.js";

import {
    analyzeProfile,
    generateQuestions,
    submitAnswer,
    finishInterview,
    getInterview,
    getInterviewHistory
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post(
    "/analyze",
    isAuth,
    upload.fields([
        { name: "resume", maxCount: 1 },
        { name: "jd", maxCount: 1 }
    ]),
    analyzeProfile
);

interviewRouter.post("/generate", isAuth, generateQuestions);

interviewRouter.post("/submit-answer", isAuth, submitAnswer);

interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/history", isAuth, getInterviewHistory);

interviewRouter.get("/:id", isAuth, getInterview);

export default interviewRouter;