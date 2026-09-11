import express from "express";
import morgan from "morgan";
import { v7 as uuid } from "uuid";
import { createPod } from "./kubernetes/pod.js";
import { createService } from "./kubernetes/service.js";

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/v1/sandbox/health", (req, res) => {
  return res.status(200).json({
    message: "Server is running",
    status: "OK",
    success: true,
  });
});

app.post("/api/v1/sandbox/start", async (req, res, next) => {
  try {
    const sandboxId = uuid();

    console.log("Creating sandbox:", sandboxId);

    await createPod(sandboxId);
    console.log("Pod created:", sandboxId);

    await createService(sandboxId);
    console.log("Service created:", sandboxId);

    return res.status(201).json({
      message: "Sandbox environment created successfully",
      sandboxId,
      previewUrl: `http://${sandboxId}.preview.localhost`,
    });
  } catch (error) {
    console.error("Failed to create sandbox:", error);
    next(error);
  }
});

export default app;
