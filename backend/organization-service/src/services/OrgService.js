"use strict";

const BranchRepository = require("../infrastructure/database/repositories/BranchRepository");
const DepartmentRepository = require("../infrastructure/database/repositories/DepartmentRepository");
const EmployeeRepository = require("../infrastructure/database/repositories/EmployeeRepository");
const { NotFoundError } = require("../domain/errors");

async function listBranches() {
  return BranchRepository.list();
}
async function getBranch(slug) {
  const row = await BranchRepository.getBySlug(slug);
  if (!row) throw new NotFoundError("Không tìm thấy chi nhánh");
  return row;
}
async function listDepartments() {
  return DepartmentRepository.list();
}
async function getDepartment(id) {
  const row = await DepartmentRepository.getById(id);
  if (!row) throw new NotFoundError("Không tìm thấy phòng ban");
  return row;
}
async function listEmployees(query) {
  return EmployeeRepository.list(query);
}
async function getEmployee(id) {
  const row = await EmployeeRepository.getById(id);
  if (!row) {
    const err = new NotFoundError("Không tìm thấy thông tin nhân sự trên hệ thống");
    err.code = "EMPLOYEE_NOT_FOUND";
    throw err;
  }
  return row;
}

module.exports = {
  listBranches,
  getBranch,
  listDepartments,
  getDepartment,
  listEmployees,
  getEmployee,
  BranchRepository,
  DepartmentRepository,
  EmployeeRepository,
};
