"use strict";

// Seed tối thiểu: tài khoản công ty đủ số dư demo.
const PayrollRepository = require("../src/infrastructure/database/repositories/PayrollRepository");

async function ensureSeeded() {
  return PayrollRepository.ensureSeeded();
}

module.exports = { ensureSeeded };
