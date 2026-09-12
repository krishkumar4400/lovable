import express from "express";
import morgan from "morgan";
import fs from "fs";

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));

const WORKDIR = "/workspace";

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Agent server is up and running",
    success: true,
    status: "OK",
  });
});

app.get("/list-files", async (req, res) => {
  const elements = await fs.promises.readdir(WORKDIR);

  return res.status(200).json({
    message: "Elements in working directory",
    elements
  });
});

export default app;
