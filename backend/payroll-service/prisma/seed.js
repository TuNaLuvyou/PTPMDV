"use strict";

// Seed tối thiểu: tài khoản công ty đủ số dư demo.
const PayrollRepository = require("../src/infrastructure/database/repositories/PayrollRepository");

async function ensureSeeded() {
  return PayrollRepository.ensureSeeded();
}

if (require.main === module) {
  const database = require("../config/database");
  database.connect().then(() => ensureSeeded()).then(() => database.disconnect()).then(() => {
    console.log("Seed payroll thành công");
  }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { ensureSeeded };
