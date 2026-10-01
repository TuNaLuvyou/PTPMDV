"use strict";

const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "identity-service", dir: "identity-service", port: 4001 },
  { name: "organization-service", dir: "organization-service", port: 4002 },
  { name: "work-service", dir: "work-service", port: 4003 },
  { name: "payroll-service", dir: "payroll-service", port: 4004 },
  { name: "integration-service", dir: "integration-service", port: 4005 },
  { name: "api-gateway", dir: "api-gateway", port: 4000 },
];

console.log("=================================================");
console.log(" HRM Enterprise — Khởi động 6 Microservices SOA");
console.log("=================================================");

const children = [];

for (const s of services) {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, s.dir),
    stdio: "inherit",
    env: { ...process.env, PORT: s.port },
  });

  child.on("error", (err) => {
    console.error(`[${s.name}] Lỗi:`, err.message);
  });

  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[${s.name}] Đã dừng với mã:`, code);
    }
  });

  children.push(child);
}

function cleanup() {
  console.log("\nĐang dừng toàn bộ microservices...");
  for (const child of children) {
    try {
      child.kill("SIGTERM");
    } catch (_) {}
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
