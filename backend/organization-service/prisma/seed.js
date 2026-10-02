"use strict";

// Seed tối thiểu: 3 chi nhánh + 2 phòng ban + 3 nhân sự khớp identity-service.
const database = require("../config/database");
const BranchRepository = require("../src/infrastructure/database/repositories/BranchRepository");
const DepartmentRepository = require("../src/infrastructure/database/repositories/DepartmentRepository");
const EmployeeRepository = require("../src/infrastructure/database/repositories/EmployeeRepository");

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (!prisma) {
    await BranchRepository.ensureSeeded();
    await DepartmentRepository.ensureSeeded();
    await EmployeeRepository.ensureSeeded();
    return { mode: "memory" };
  }
  // Postgres: xóa phòng ban và nhân sự khác, chỉ giữ 1 tài khoản admin
  await prisma.department.deleteMany({}).catch(() => {});
  await prisma.employee.deleteMany({ where: { email: { not: "admin@company.com" } } }).catch(() => {});

  const adminEmployee = {
    id: "e-admin",
    name: "Trần Minh Tuấn",
    email: "admin@company.com",
    branchSlug: null,
    department: null,
    role: "Quản trị viên",
    systemRole: "admin",
    status: "đang làm",
    joinDate: "01-01-2024",
    baseSalary: 20000000,
    salaryType: "monthly",
  };
  await prisma.employee.upsert({
    where: { email: adminEmployee.email },
    update: { department: null },
    create: adminEmployee,
  }).catch(() => {});

  return { mode: "postgres" };
}

module.exports = { ensureSeeded };
