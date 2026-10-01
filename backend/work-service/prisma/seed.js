"use strict";

// Seed tối thiểu cho work-service (memory + postgres upsert).
const WorkRepository = require("../src/infrastructure/database/repositories/WorkRepository");

async function ensureSeeded() {
  return WorkRepository.ensureSeeded();
}

module.exports = { ensureSeeded };
