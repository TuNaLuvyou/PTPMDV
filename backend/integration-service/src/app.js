"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const config = require("../config");
const { errorHandler } = require("./api/middlewares/errorHandler");

const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Health check endpoint đúng chuẩn: { status: "ok", service: "...", time: "..." }
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: config.serviceName,
    time: new Date().toISOString(),
  });
});

// Các tuyến API CRUD độc lập (Task 1 & Task 2)
app.use("/api/news", require("./api/routes/newsRoutes"));
app.use("/api/regulations", require("./api/routes/regulationRoutes"));
app.use("/api/wifi-configs", require("./api/routes/wifiConfigRoutes"));

// Xử lý 404
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Không tìm thấy tài nguyên",
    },
  });
});

app.use(errorHandler);

module.exports = app;
