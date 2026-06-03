import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import driveRoutes from "./routes/driveRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { successResponse } from "./utils/response.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return successResponse(res, "API is healthy", {
    service: "Placement Recruitment Management System API",
    database: states[mongoose.connection.readyState] || "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  });
});

app.get("/health/db", (_req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return successResponse(res, "Database health checked", {
    database: states[mongoose.connection.readyState] || "unknown",
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  });
});

app.get("/dataset", (req, res) => {
  return res.json(req.app.locals.dataset || []);
});

app.get("/dataset/count", (req, res) => {
  const dataset = req.app.locals.dataset || [];
  const counts = Array.isArray(dataset)
    ? { totalRecords: dataset.length }
    : Object.fromEntries(
        Object.entries(dataset).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.length : 0,
        ]),
      );

  return res.json(counts);
});

app.use("/auth", authRoutes);
app.use("/sync", syncRoutes);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/drives", driveRoutes);
app.use("/applications", applicationRoutes);
app.use("/interviews", interviewRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
