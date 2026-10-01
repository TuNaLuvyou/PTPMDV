"use strict";

const PayrollRepository = require("../infrastructure/database/repositories/PayrollRepository");
const OrgClient = require("../infrastructure/external-clients/OrgClient");
const WorkClient = require("../infrastructure/external-clients/WorkClient");
const { monthToQuery } = require("../api/validators/payrollValidator");

async function createPayoutUseCase(payload) {
  return PayrollRepository.createPayout({
    idempotencyKey: payload.idempotencyKey,
    debitAccount: payload.debitAccount,
    content: payload.content,
    totalAmount: Number(payload.totalAmount),
    beneficiaryCount: Number(payload.beneficiaryCount || 0),
  });
}

// Tổng hợp phiếu lương: baseSalary (từ body hoặc organization-service) + bonus - totalPenalty (từ work-service).
async function generatePayslipUseCase(payload) {
  let baseSalary = payload.baseSalary;
  if (baseSalary === undefined && payload.autoFetch) {
    const emp = await OrgClient.getEmployeeById(payload.employeeId);
    baseSalary = Number(emp.baseSalary || 0);
  }
  if (baseSalary === undefined) {
    const err = new Error("Thiếu lương cơ bản");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  let totalPenalty = Number(payload.totalPenalty || 0);
  if (payload.sumPenalty === true) {
    try {
      const rows = await WorkClient.getAttendance({
        employeeId: payload.employeeId,
        month: monthToQuery(payload.month),
      });
      totalPenalty = (Array.isArray(rows) ? rows : []).reduce(
        (sum, r) => sum + Number(r.penaltyAmount || 0),
        0
      );
    } catch (_) {
      // work-service chưa sẵn sàng: giữ totalPenalty đã nhập
    }
  }
  return PayrollRepository.generatePayslip({
    employeeId: payload.employeeId,
    month: payload.month,
    baseSalary: Number(baseSalary),
    bonus: Number(payload.bonus || 0),
    totalPenalty,
  });
}

module.exports = { createPayoutUseCase, generatePayslipUseCase };
