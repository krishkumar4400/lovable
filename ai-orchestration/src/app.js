import express from "express";
import morgan from "morgan";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes
app.get("/api/v1/ai-orchestration/healthz", (req, res) => {
  return res.status(200).json({
    message: "AI Orchestration server is up and running",
    success: true,
    status: "OK",
    env: "dev"
  });
});

export default app;
