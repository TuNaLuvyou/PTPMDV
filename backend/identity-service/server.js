"use strict";

require("dotenv").config();
const app = require("./src/app");
const config = require("./config");
const database = require("./config/database");
const UserRepository = require("./src/infrastructure/database/repositories/UserRepository");

async function startServer() {
  try {
    await database.connect();
    await UserRepository.ensureSeeded().catch((e) => {
      console.warn("[identity-service] Seed bỏ qua:", e.message);
    });
    if (require.main === module) {
      app.listen(config.port, () => {
        console.log(`[${config.serviceName}] running at http://localhost:${config.port}`);
      });
    }
  } catch (error) {
    console.error(`[${config.serviceName}] Failed to start:`, error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
