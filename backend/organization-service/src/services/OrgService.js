"use strict";

// OrgService (Flat 3-Tier Mẫu A): gộp Branch/Department/Employee Repository cũ,
// gọi trực tiếp Prisma + fallback in-memory. Luồng Route -> Controller -> Service -> Prisma.
const database = require("../config/database");
const { NotFoundError } = require("../utils/errors");

const seedEmployees = [
  { id: "e-admin", name: "Trần Minh Tuấn", email: "admin@company.com", branchSlug: null, department: null, role: "Quản trị viên", systemRole: "admin", status: "đang làm", joinDate: "01-01-2024", baseSalary: 20000000, salaryType: "monthly" },
];
let memoryBranches = [];
let memoryDepartments = [];
let memoryEmployees = [...seedEmployees];

async function ensureSeeded() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.branch.deleteMany({}).catch(() => {});
      await prisma.department.deleteMany({}).catch(() => {});
      await prisma.employee.deleteMany({ where: { email: { not: "admin@company.com" } } }).catch(() => {});
      for (const e of seedEmployees) {
        const existed = await prisma.employee.findUnique({ where: { email: e.email } }).catch(() => null);
        if (!existed) await prisma.employee.create({ data: e }).catch(() => {});
      }
    } catch (_) {}
    return { mode: "postgres" };
  }
  return { mode: "memory" };
}

// --- Branches ---
async function listBranches() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.findMany({ orderBy: { slug: "asc" } });
    } catch (_) {}
  }
  return memoryBranches;
}

async function getBranch(slug) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const row = await prisma.branch.findUnique({ where: { slug } });
      if (row) return row;
    } catch (_) {}
  } else {
    const row = memoryBranches.find((b) => b.slug === slug) || null;
    if (row) return row;
  }
  // Fallback memory khi Prisma lỗi nhưng memory rỗng
  const mem = memoryBranches.find((b) => b.slug === slug) || null;
  if (mem) return mem;
  // Thử lại Prisma lần cuối (trường hợp getPrisma null do lỗi transient)
  if (prisma) {
    try {
      return await prisma.branch.findUnique({ where: { slug } });
    } catch (_) {}
  }
  throw new NotFoundError("Không tìm thấy chi nhánh");
}

async function createBranch(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.create({ data: payload });
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Slug chi nhánh đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      throw e;
    }
  }
  if (memoryBranches.some((b) => b.slug === payload.slug)) {
    const err = new Error("Slug chi nhánh đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `br-${Date.now()}`, staff: 0, status: "hoạt động", ...payload };
  memoryBranches.push(row);
  return row;
}

async function updateBranch(slug, payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.branch.update({ where: { slug }, data: payload });
    } catch (_) {}
  }
  const idx = memoryBranches.findIndex((b) => b.slug === slug);
  if (idx < 0) return null;
  memoryBranches[idx] = { ...memoryBranches[idx], ...payload };
  return memoryBranches[idx];
}

async function removeBranch(slug) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.branch.delete({ where: { slug } });
      return true;
    } catch (_) {}
  }
  const idx = memoryBranches.findIndex((b) => b.slug === slug);
  if (idx < 0) return false;
  memoryBranches.splice(idx, 1);
  return true;
}

// --- Departments ---
async function listDepartments() {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.findMany({ orderBy: { code: "asc" } });
    } catch (_) {}
  }
  return memoryDepartments;
}

async function getDepartment(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const row = await prisma.department.findUnique({ where: { id } });
      if (row) return row;
    } catch (_) {}
  }
  const mem = memoryDepartments.find((d) => d.id === id) || null;
  if (mem) return mem;
  throw new NotFoundError("Không tìm thấy phòng ban");
}

async function createDepartment(payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.create({ data: payload });
    } catch (e) {
      if (String(e.code) === "P2002") {
        const err = new Error("Mã phòng ban đã tồn tại");
        err.status = 409;
        err.code = "DUPLICATE_RESOURCE";
        throw err;
      }
      throw e;
    }
  }
  if (memoryDepartments.some((d) => d.code === payload.code)) {
    const err = new Error("Mã phòng ban đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `dep-${Date.now()}`, staff: 0, status: "hoạt động", ...payload };
  memoryDepartments.push(row);
  return row;
}

async function updateDepartment(id, payload) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.department.update({ where: { id }, data: payload });
    } catch (_) {}
  }
  const idx = memoryDepartments.findIndex((d) => d.id === id);
  if (idx < 0) return null;
  memoryDepartments[idx] = { ...memoryDepartments[idx], ...payload };
  return memoryDepartments[idx];
}

async function removeDepartment(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.department.delete({ where: { id } });
      return true;
    } catch (_) {}
  }
  const idx = memoryDepartments.findIndex((d) => d.id === id);
  if (idx < 0) return false;
  memoryDepartments.splice(idx, 1);
  return true;
}

// --- Employees ---
function applyEmployeeFilter(rows, query = {}) {
  let out = rows;
  if (query.branchSlug) out = out.filter((e) => e.branchSlug === query.branchSlug);
  if (query.departmentId || query.department) {
    const dep = query.departmentId || query.department;
    out = out.filter((e) => e.department === dep);
  }
  if (query.systemRole) out = out.filter((e) => e.systemRole === query.systemRole);
  return out;
}

async function listEmployees(query = {}) {
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
  return applyEmployeeFilter(memoryEmployees, query);
}

async function getEmployee(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      const row = await prisma.employee.findUnique({ where: { id } });
      if (row) return row;
    } catch (_) {}
  }
  const mem = memoryEmployees.find((e) => e.id === id) || null;
  if (mem) return mem;
  const err = new NotFoundError("Không tìm thấy thông tin nhân sự trên hệ thống");
  err.code = "EMPLOYEE_NOT_FOUND";
  throw err;
}

// Whitelist field của model Employee trước khi ghi Prisma, tránh lỗi
// "Unknown argument" khi client gửi thêm field (vd: `branch` của frontend).
const EMPLOYEE_FIELDS = [
  "name", "email", "phone", "gender", "birthDate", "province", "ward", "street",
  "cccd", "issueDate", "issuePlace", "cccdFront", "cccdBack", "branchSlug",
  "department", "role", "systemRole", "status", "joinDate", "baseSalary",
  "salaryType", "hourlySalary", "bankName", "bankAccountNumber", "bankAccountName",
];

function sanitizeEmployeePayload(payload = {}) {
  const data = {};
  const source = { ...payload };
  // Alias tương thích: frontend có thể gửi `branch` thay cho `branchSlug`.
  if (source.branchSlug === undefined && source.branch !== undefined) {
    source.branchSlug = source.branch;
  }
  for (const key of EMPLOYEE_FIELDS) {
    if (source[key] !== undefined) data[key] = source[key];
  }
  return data;
}

async function createEmployee(payload) {
  if (!["admin", "manager", "staff"].includes(payload.systemRole || "staff")) {
    const err = new Error("Vai trò hệ thống không hợp lệ");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.employee.create({ data: sanitizeEmployeePayload(payload) });
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
  if (memoryEmployees.some((e) => e.email === payload.email)) {
    const err = new Error("Email đã tồn tại");
    err.status = 409;
    err.code = "DUPLICATE_RESOURCE";
    throw err;
  }
  const row = { id: `e-${Date.now()}`, status: "đang làm", salaryType: "monthly", baseSalary: 0, ...payload };
  memoryEmployees.push(row);
  return row;
}

async function updateEmployee(id, payload) {
  if (payload.systemRole && !["admin", "manager", "staff"].includes(payload.systemRole)) {
    const err = new Error("Vai trò hệ thống không hợp lệ");
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      return await prisma.employee.update({ where: { id }, data: sanitizeEmployeePayload(payload) });
    } catch (_) {}
  }
  const idx = memoryEmployees.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  memoryEmployees[idx] = { ...memoryEmployees[idx], ...payload };
  return memoryEmployees[idx];
}

async function removeEmployee(id) {
  const prisma = database.getPrisma();
  if (prisma) {
    try {
      await prisma.employee.delete({ where: { id } });
      return true;
    } catch (_) {}
  }
  const idx = memoryEmployees.findIndex((e) => e.id === id);
  if (idx < 0) return false;
  memoryEmployees.splice(idx, 1);
  return true;
}

module.exports = {
  ensureSeeded,
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  removeBranch,
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  removeDepartment,
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  removeEmployee,
};
