"use strict";

// Seed tối thiểu cho work-service (memory + postgres upsert).
const WorkRepository = require("../src/infrastructure/database/repositories/WorkRepository");

async function ensureSeeded() {
  return WorkRepository.ensureSeeded();
}

if (require.main === module) {
  const database = require("../config/database");
  database.connect().then(() => ensureSeeded()).then(() => database.disconnect()).then(() => {
    console.log("Seed work thành công");
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { ensureSeeded };
