import express from "express";
import request from "supertest";
import healthRouter from "../routes/health.route.js";

const app = express();

app.use("/api", healthRouter);

describe("Health Check APIs", () => {

    test("GET /api/health returns 200", async () => {
        const res = await request(app).get("/api/health");

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("healthy");
    });

    test("Readiness returns 503 without database", async () => {
        const res = await request(app).get("/api/ready");

        expect(res.statusCode).toBe(503);
        expect(res.body.status).toBe("not ready");
    });

});