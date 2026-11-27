import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import cookieParser from "cookie-parser"
import interviewRouter from "./routes/interview.route.js"
import healthRouter from "./routes/health.route.js"
import morgan from "morgan"
import logger from "./config/logger.js"
dotenv.config()

const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api", healthRouter);
app.use(morgan("combined", {
    stream: {
        write: message => logger.info(message.trim())
    }
}));

app.get('/',(req,res) => {
    return res.json({message : "Server started"})
})


const PORT = process.env.PORT

const server = app.listen(PORT, ()=>{
    logger.info(`Server running on port ${PORT}`);
    connectDb()
})


//for graceful shutdonwn
let shuttingDown = false;

const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info("Shutting down server");

    setTimeout(() => process.exit(1), 25000).unref();

    server.close(async () => {
        try {
            await mongoose.disconnect();
            process.exit(0);
        } catch (error) {
            logger.error(error.message);
            process.exit(1);
        }
    });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);