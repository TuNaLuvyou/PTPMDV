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
  // Postgres: upsert từng bảng
  const branches = [
    { slug: "HN-1", name: "Hoàn Kiếm", address: "Hà Nội", phone: "0240001", manager: "Trần Minh Tuấn", status: "hoạt động", staff: 10 },
    { slug: "HN-2", name: "Cầu Giấy", address: "Hà Nội", phone: "0240002", manager: "Vũ Thành Công", status: "hoạt động", staff: 8 },
    { slug: "DN-1", name: "Đà Nẵng", address: "Đà Nẵng", phone: "0236001", manager: "Nguyễn Thu Hà", status: "hoạt động", staff: 5 },
  ];
  for (const b of branches) {
    await prisma.branch.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }
  const depts = [
    { code: "NS", name: "Nhân sự", description: "Quản trị nhân sự", manager: "Trần Minh Tuấn", status: "hoạt động", staff: 3 },
    { code: "KT", name: "Kế toán", description: "Tài chính kế toán", manager: "Vũ Thành Công", status: "hoạt động", staff: 2 },
  ];
  for (const d of depts) {
    await prisma.department.upsert({ where: { code: d.code }, update: {}, create: d });
  }
  const employees = [
    { id: "e-admin", name: "Trần Minh Tuấn", email: "admin@company.com", branchSlug: "HN-1", department: "Nhân sự", role: "Quản trị viên", systemRole: "admin", status: "đang làm", joinDate: "01-01-2024", baseSalary: 20000000, salaryType: "monthly" },
    { id: "e-mgr-hn1", name: "Vũ Thành Công", email: "manager@company.com", branchSlug: "HN-1", department: "Nhân sự", role: "Quản lý", systemRole: "manager", status: "đang làm", joinDate: "01-02-2024", baseSalary: 15000000, salaryType: "monthly" },
    { id: "e-staff-1", name: "Nguyễn Thu Hà", email: "nhanvien@company.com", branchSlug: "HN-1", department: "Kế toán", role: "Nhân viên", systemRole: "staff", status: "đang làm", joinDate: "01-03-2024", baseSalary: 10000000, salaryType: "monthly" },
  ];
  for (const e of employees) {
    await prisma.employee.upsert({ where: { email: e.email }, update: {}, create: e });
  }
  return { mode: "postgres" };
}

module.exports = { ensureSeeded };
