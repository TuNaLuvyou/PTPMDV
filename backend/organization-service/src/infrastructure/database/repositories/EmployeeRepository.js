"use strict";

const database = require("../../../../config/database");

const seedEmployees = [
  { id: "e-admin", name: "Trần Minh Tuấn", email: "admin@company.com", branchSlug: "HN-1", department: "Nhân sự", role: "Quản trị viên", systemRole: "admin", status: "đang làm", joinDate: "01-01-2024", baseSalary: 20000000, salaryType: "monthly" },
  { id: "e-mgr-hn1", name: "Vũ Thành Công", email: "manager@company.com", branchSlug: "HN-1", department: "Nhân sự", role: "Quản lý", systemRole: "manager", status: "đang làm", joinDate: "01-02-2024", baseSalary: 15000000, salaryType: "monthly" },
  { id: "e-staff-1", name: "Nguyễn Thu Hà", email: "nhanvien@company.com", branchSlug: "HN-1", department: "Kế toán", role: "Nhân viên", systemRole: "staff", status: "đang làm", joinDate: "01-03-2024", baseSalary: 10000000, salaryType: "monthly" },
];
let memory = [...seedEmployees];

async function ensureSeeded() {
  if (database.getPrisma()) {
    const prisma = database.getPrisma();
    for (const e of seedEmployees) {
      const existed = await prisma.employee.findUnique({ where: { email: e.email } }).catch(() => null);
      if (!existed) await prisma.employee.create({ data: e }).catch(() => {});
    }
  }
}

function applyFilter(rows, query) {
  let out = rows;
  if (query.branchSlug) out = out.filter((e) => e.branchSlug === query.branchSlug);
  if (query.departmentId || query.department) {
    const dep = query.departmentId || query.department;
    out = out.filter((e) => e.department === dep);
  }
  if (query.systemRole) out = out.filter((e) => e.systemRole === query.systemRole);
  return out;
}

async function list(query = {}) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const where = {};
      if (query.branchSlug) where.branchSlug = query.branchSlug;
      if (query.systemRole) where.systemRole = query.systemRole;
      if (query.departmentId || query.department) where.department = query.departmentId || query.department;
      return await prisma.employee.findMany({ where, orderBy: { createdAt: "desc" } });
    } catch (_) {}
  }
  return applyFilter(memory, query);
}

async function getById(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.employee.findUnique({ where: { id } });
    } catch (_) {}
  }
  return memory.find((e) => e.id === id) || null;
}

async function create(payload) {
  if (!["admin", "manager", "staff"].includes(payload.systemRole || "staff")) {
    const err = new Error("Vai trò hệ thống không hợp lệ");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.employee.create({ data: payload });
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Email đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      throw e;
    }
  }
  if (memory.some((e) => e.email === payload.email)) {
    const err = new Error("Email đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `e-${Date.now()}`, status: "đang làm", salaryType: "monthly", baseSalary: 0, ...payload };
  memory.push(row);
  return row;
}

async function update(id, payload) {
  if (payload.systemRole && !["admin", "manager", "staff"].includes(payload.systemRole)) {
    const err = new Error("Vai trò hệ thống không hợp lệ");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.employee.update({ where: { id }, data: payload });
    } catch (_) {}
  }
  const idx = memory.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  memory[idx] = { ...memory[idx], ...payload };
  return memory[idx];
}

async function remove(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.employee.delete({ where: { id } });
      return true;
    } catch (_) {}
  }
  const idx = memory.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  memory.splice(idx, 1);
  return true;
}

module.exports = { list, getById, create, update, remove, ensureSeeded };
