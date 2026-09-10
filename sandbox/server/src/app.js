import express from "express";
import morgan from "morgan";

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

export default app;
