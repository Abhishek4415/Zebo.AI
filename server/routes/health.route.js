import express from "express";
import mongoose from "mongoose";

const healthRouter = express.Router();

healthRouter.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        uptime: process.uptime()
    });
});

healthRouter.get("/ready", (req, res) => {
    const ready = mongoose.connection.readyState === 1;

    res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not ready",
        database: ready ? "connected" : "disconnected"
    });
});

export default healthRouter;