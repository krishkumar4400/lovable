import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import morgan from "morgan";

const app = express();

app.use(morgan("combined"));

app.get("/api/v1/status/healthz", (req, res) => {
  return res.status(200).json({
    message: "Router server is up and running",
    status: "OK",
    success: true,
  });
});

app.get("/api/v1/status/readyz", (req, res) => {
  return res.status(200).json({
    message: "Router server is ready",
    status: "OK",
    success: true,
  });
});

app.use((req, res, next) => {
  const hostHeader = req.headers.host;
  const sandboxId = hostHeader.split(".")[0];
  const targetUrl = `http://sandbox-service-${sandboxId}`;
  console.log(`Proxying request to: ${targetUrl}`);

  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    ws: true,
  })(req, res, next);
});

export default app;
