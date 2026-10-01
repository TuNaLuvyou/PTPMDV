"use strict";

const express = require("express");
const PayrollController = require("../controllers/PayrollController");

const router = express.Router();

router.get("/payroll/bank-accounts", PayrollController.listBankAccounts);
router.put("/payroll/bank-accounts/:id", PayrollController.updateBankAccount);

router.get("/payroll/payouts", PayrollController.listPayouts);
router.post("/payroll/payouts", PayrollController.createPayout);

router.get("/payroll/payslips", PayrollController.listPayslips);
router.post("/payroll/payslips/generate", PayrollController.generatePayslip);
router.put("/payroll/payslips/:id", PayrollController.updatePayslip);
router.put("/payroll/payslips/:id/status", PayrollController.setPayslipStatus);

module.exports = router;
