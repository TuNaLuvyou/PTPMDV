"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("../config");
const { errorHandler } = require("./api/middlewares/errorHandler");

const app = express();

app.use(morgan("dev"));
// CORS cho phiên cookie hrm-session: chỉ định origin cụ thể, không dùng "*".
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: config.serviceName, time: new Date().toISOString() });
});

function proxyTo(pathFilter, target, label) {
  // http-proxy-middleware v3: pathFilter nằm trong options, app.use không gắn
  // path Express để giữ nguyên full path /api/... khi forward. Timeout 5000ms.
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
    proxyTimeout: config.timeoutMs,
    timeout: config.timeoutMs,
    logLevel: "warn",
    on: {
      error: (err, _req, res) => {
        console.warn(`[gateway] ${label} lỗi:`, err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: { code: "BAD_GATEWAY", message: `Không kết nối được ${label}` },
          });
        }
      },
    },
  });
}

// Bảng route qua gateway (docs/A §5). Đường dẫn ✔ từ tài liệu gốc giữ nguyên;
// nhóm (suy ra) vẫn proxy để B/D/E cắm vào không đổi gateway.
app.use(proxyTo("/api/auth", config.targets.identity, "identity-service"));
app.use(proxyTo("/api/branches", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/departments", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/employees", config.targets.organization, "organization-service"));
app.use(proxyTo("/api/shifts", config.targets.work, "work-service"));
app.use(proxyTo("/api/attendance", config.targets.work, "work-service"));
app.use(proxyTo("/api/tasks", config.targets.work, "work-service"));
app.use(proxyTo("/api/payroll", config.targets.payroll, "payroll-service"));
// SOAP: chuyển tiếp nguyên vẹn body/headers/status XML, không bọc {data}/{error}.
app.use(proxyTo("/soap/payroll", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/news", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/regulations", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/wifi-configs", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/requests", config.targets.integration, "integration-service"));
app.use(proxyTo("/api/notifications", config.targets.integration, "integration-service"));

app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Không tìm thấy tài nguyên" } });
});

app.use(errorHandler);

module.exports = app;
