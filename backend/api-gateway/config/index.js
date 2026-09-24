"use strict";

require("dotenv").config();

module.exports = {
  port: parseInt(process.env.PORT || "4000", 10),
  serviceName: process.env.SERVICE_NAME || "api-gateway",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS || "5000", 10),
  targets: {
    identity: process.env.IDENTITY_URL || "http://localhost:4001",
    organization: process.env.ORGANIZATION_URL || "http://localhost:4002",
    work: process.env.WORK_URL || "http://localhost:4003",
    payroll: process.env.PAYROLL_URL || "http://localhost:4004",
    integration: process.env.INTEGRATION_URL || "http://localhost:4005",
  },
};
