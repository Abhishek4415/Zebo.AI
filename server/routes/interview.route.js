import express from "express";
import upload from "../middlewares/multer.js";
import { isAuth } from "../middlewares/isAuth.js";
import { analyzeProfile } from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post(
    "/analyze",

    isAuth,

    upload.fields([
        {
            name: "resume",
            maxCount: 1
        },
        {
            name: "jd",
            maxCount: 1
        }
    ]),

    analyzeProfile
);

export default interviewRouter;